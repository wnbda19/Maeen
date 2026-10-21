"""Validation-only rejection calibration; no test samples used for selection."""
import numpy as np
import torch

from .dataset import read_json, write_json
from .metrics import classification_metrics
from .models import make_model


def reject_probabilities(probabilities, labels, threshold, margin):
    values = np.asarray(probabilities)
    if values.ndim != 2 or values.shape[1] != len(labels) or not np.isfinite(values).all() or (values < 0).any() or (values > 1).any() or not np.allclose(values.sum(axis=1), 1, atol=1e-3):
        raise ValueError("Malformed class probabilities")
    if not 0 < threshold <= 1 or not 0 <= margin <= 1 or "N001" not in labels:
        raise ValueError("Invalid rejection policy")
    ranking = np.argsort(values, axis=1)
    output = ranking[:, -1].copy()
    top = values[np.arange(len(values)), ranking[:, -1]]
    second = values[np.arange(len(values)), ranking[:, -2]]
    output[(top < threshold) | (top - second < margin)] = labels.index("N001")
    return output.tolist()


def calibrate(root, run_dir):
    from .train import load_features
    run = read_json(run_dir / "run.json")
    path = run_dir / "decision-policy.json"
    if path.exists() or (run_dir / "test-results.json").exists():
        raise ValueError("Calibration/test evidence already frozen; do not tune after testing")
    rows = [row for row in run["manifest"] if row["split"] == "validation"]
    values, truth = load_features(root, rows, run["labels"])
    model = make_model(run["architecture"], len(run["labels"]))
    model.load_state_dict(torch.load(run_dir / "weights.pt", map_location="cpu", weights_only=True))
    model.eval()
    with torch.no_grad():
        probabilities = torch.softmax(model(values), dim=1).numpy()
    candidates = []
    for threshold in (0.55, 0.65, 0.75, 0.85, 0.9, 0.95):
        for margin in (0.05, 0.1, 0.15, 0.2, 0.25):
            prediction = reject_probabilities(probabilities, run["labels"], threshold, margin)
            metrics = classification_metrics(truth.tolist(), prediction, run["labels"])
            unknown_index = run["labels"].index("N001")
            background = [i for i, label in enumerate(truth.tolist()) if label in (unknown_index, run["labels"].index("N000"))]
            false_accept = sum(run["labels"][prediction[i]].startswith("W") for i in background) / len(background) if background else None
            candidates.append({"threshold": threshold, "margin": margin, "macroF1": metrics["macroF1"], "negativeFalseAcceptRate": false_accept})
    valid = [item for item in candidates if item["negativeFalseAcceptRate"] is not None and item["negativeFalseAcceptRate"] <= 0.05]
    if not valid:
        raise ValueError("No validation policy satisfies negative false-accept target; do not enable recognition")
    best = max(valid, key=lambda item: item["macroF1"])
    report = {**best, "source": "validation-only", "minWindows": 3, "minIntervalMs": 100, "releaseMs": 400, "maxGapMs":350,
              "temporalParametersValidated": False, "probabilityCalibrationClaim": False, "candidates": candidates}
    write_json(path, report)
    return report
