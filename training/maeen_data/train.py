"""Training scaffold; refuses absent data/consent/review or signer leakage."""
import copy
import random
from pathlib import Path

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset

from .dataset import read_json, safe_path, sha256_file, validate_partitions, write_json
from .metrics import classification_metrics
from .models import make_model


def load_features(root, rows, labels):
    tensors, targets = [], []
    for row in rows:
        if row.get("featureVersion") != "maeen-temporal-v1" or row.get("shape") != [1, 32, 268] or row.get("temporalCoverage", 0) < 0.8 or row.get("bodyCoverage",0)<0.9 or row.get("faceCoverage",0)<0.8 or (row.get("wordId")!='N000' and row.get('handCoverage',0)<0.6):
            raise ValueError("Feature contract/coverage mismatch")
        file = safe_path(root, row["featureFile"])
        if sha256_file(file) != row["featureSha256"] or sha256_file(safe_path(root, row["file"])) != row["sha256"]:
            raise ValueError("Changed feature or recording bytes")
        values = np.fromfile(file, dtype="<f4")
        if values.size != 32 * 268 or not np.isfinite(values).all():
            raise ValueError("Malformed feature tensor")
        values = values.reshape(32, 268)
        if not np.isin(values[:, 3::4], [0, 1]).all():
            raise ValueError("Invalid missingness masks")
        tensors.append(values)
        targets.append(labels.index(row["wordId"]))
    if not tensors:
        raise ValueError("No real feature tensors")
    return torch.from_numpy(np.stack(tensors)), torch.tensor(targets, dtype=torch.long)


def validate_training_ready(rows, vocabulary, consents, splits):
    if not rows:
        raise ValueError("Dataset collection required: no real recordings")
    if vocabulary.get("linguisticReview") != "approved":
        raise ValueError("Deaf-led vocabulary/sign review required")
    labels = [word["id"] for word in vocabulary["proposedWords"]] + vocabulary["negativeClasses"]
    if vocabulary.get('collectionProfile'):
        from .collection import CONFIG, validate_collection_ready
        profile = next(p for p in read_json(CONFIG)['profiles'] if p['id'] == vocabulary['collectionProfile'])
        if splits != profile['splits']:
            raise ValueError('Frozen collection signer split changed')
        validate_collection_ready(rows, profile)
    counts = validate_partitions(rows, splits, labels, minimum_per_class=5)
    consent_map = {item["signerId"]: item for item in consents}
    for row in rows:
        consent = consent_map.get(row["signerId"], {})
        if vocabulary.get('collectionProfile') and consent.get('recording') is not True:
            raise ValueError('Active first-party recording consent required')
        if row.get("source") != "first-party" or row.get("captureType") != "real-camera" or row.get("mirrored") is not False or row.get("qc", {}).get("accepted") is not True:
            raise ValueError("Only approved first-party camera recordings may train")
        if consent.get("withdrawn") is not False or consent.get("training") is not True or consent.get("modelDistribution") is not True or consent.get("consentRef") != row.get("consentRef"):
            raise ValueError("Consent missing, changed or withdrawn")
    return labels, counts


def fit(root, rows, vocabulary, consents, splits, config, output, architecture):
    labels, counts = validate_training_ready(rows, vocabulary, consents, splits)
    if architecture not in config["architectures"]:
        raise ValueError("Architecture not in registered comparison")
    output = Path(output)
    if output.exists():
        raise ValueError("Use a new run directory; never overwrite evaluation evidence")
    seed = config["seed"]
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.set_num_threads(2)
    torch.use_deterministic_algorithms(True)
    parts = {part: [row for row in rows if row["split"] == part] for part in ("train", "validation")}
    features = {part: load_features(root, records, labels) for part, records in parts.items()}
    model = make_model(architecture, len(labels))
    generator = torch.Generator().manual_seed(seed)
    loader = DataLoader(TensorDataset(*features["train"]), batch_size=config["batchSize"], shuffle=True, generator=generator)
    optimizer = torch.optim.AdamW(model.parameters(), lr=config["learningRate"], weight_decay=config["weightDecay"])
    criterion = nn.CrossEntropyLoss()
    best, best_state, stale, history = -1, None, 0, []
    # Test rows are deliberately never decoded/evaluated during model selection.
    for epoch in range(config["epochs"]):
        model.train()
        loss_sum, seen = 0.0, 0
        for values, targets in loader:
            optimizer.zero_grad()
            loss = criterion(model(values), targets)
            if not torch.isfinite(loss):
                raise ValueError("Nonfinite training loss")
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            loss_sum += loss.item() * len(targets)
            seen += len(targets)
        model.eval()
        with torch.no_grad():
            predicted = model(features["validation"][0]).argmax(1).tolist()
        metrics = classification_metrics(features["validation"][1].tolist(), predicted, labels)
        history.append({"epoch": epoch + 1, "trainLoss": loss_sum / seen, "validation": metrics})
        if metrics["macroF1"] > best:
            best, best_state, stale = metrics["macroF1"], copy.deepcopy(model.state_dict()), 0
        else:
            stale += 1
        if stale >= config["patience"]:
            break
    output.mkdir(parents=True)
    torch.save(best_state, output / "weights.pt")
    write_json(output / "run.json", {"status": "trained-candidate-not-approved-for-web", "architecture": architecture,
                                    "labels": labels, "config": config, "counts": counts, "splits": splits,
                                    "vocabularyVersion": vocabulary["version"], "history": history,
                                    "manifest": rows, "testMetrics": None, "browserLatencyMs": None})
    return {"bestValidationMacroF1": best, "epochs": len(history)}


def evaluate(root, run_dir):
    run_dir = Path(run_dir)
    run = read_json(run_dir / "run.json")
    output = run_dir / "test-results.json"
    if output.exists():
        raise ValueError("Test evaluation is locked; do not tune using repeated test runs")
    rows = [row for row in run["manifest"] if row["split"] == "test"]
    values, actual = load_features(root, rows, run["labels"])
    model = make_model(run["architecture"], len(run["labels"]))
    model.load_state_dict(torch.load(run_dir / "weights.pt", map_location="cpu", weights_only=True))
    model.eval()
    with torch.no_grad():
        probabilities = torch.softmax(model(values), dim=1).numpy()
    from .calibrate import reject_probabilities
    policy = read_json(run_dir / "decision-policy.json")
    predicted = reject_probabilities(probabilities, run["labels"], policy["threshold"], policy["margin"])
    metrics = {"signerDisjoint":True,"policy":policy,"filtered":classification_metrics(actual.tolist(), predicted, run["labels"]),
               "unfiltered":classification_metrics(actual.tolist(), probabilities.argmax(axis=1).tolist(), run["labels"])}
    write_json(output, metrics)
    return metrics
