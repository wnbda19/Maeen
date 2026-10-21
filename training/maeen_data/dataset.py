"""Consent-aware ingestion and signer-disjoint leakage checks (stdlib only)."""
import hashlib
import json
import re
from pathlib import Path

PARTITIONS = ("train", "validation", "test")


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def read_jsonl(path):
    return [json.loads(line) for line in Path(path).read_text(encoding="utf-8").splitlines() if line.strip()]


def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")


def safe_path(root, relative):
    if not isinstance(relative, str) or not relative:
        raise ValueError("Missing dataset path")
    root = Path(root).resolve()
    path = (root / relative).resolve()
    if Path(relative).is_absolute() or not path.is_relative_to(root):
        raise ValueError("Dataset path escapes root")
    return path


def sha256_file(path):
    result = hashlib.sha256()
    with Path(path).open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            result.update(chunk)
    return result.hexdigest()


def signer_assignments(splits):
    assignments = {}
    for split in PARTITIONS:
        if not isinstance(splits.get(split), list) or not splits[split]:
            raise ValueError("Three nonempty signer partitions required")
        for signer in splits[split]:
            if not re.fullmatch(r"S\d{3}", signer) or signer in assignments:
                raise ValueError("Invalid or overlapping signer ID")
            assignments[signer] = split
    return assignments


def validate_partitions(rows, splits, labels, minimum_per_class=1):
    assignments = signer_assignments(splits)
    if len(labels) != len(set(labels)) or not labels or minimum_per_class < 1:
        raise ValueError("Invalid vocabulary/coverage requirement")
    seen_ids, seen_hashes = set(), set()
    counts = {split: {label: 0 for label in labels} for split in PARTITIONS}
    for row in rows:
        if row.get("signerId") not in assignments or row.get("split") not in PARTITIONS or row.get("split") != assignments.get(row.get("signerId")) or row.get("wordId") not in labels:
            raise ValueError("Signer partition or vocabulary mismatch")
        if row.get("clipId") in seen_ids or row.get("sha256") in seen_hashes or not re.fullmatch(r"[a-f0-9]{64}", row.get("sha256", "")):
            raise ValueError("Duplicate clip ID/content or invalid digest")
        seen_ids.add(row["clipId"])
        seen_hashes.add(row["sha256"])
        counts[row["split"]][row["wordId"]] += 1
    if any(n < minimum_per_class for classes in counts.values() for n in classes.values()):
        raise ValueError("Each class must have real samples in all three signer partitions")
    return counts


def ingest(root, rows, consents, splits, labels):
    assignments = signer_assignments(splits)
    consent_map = {}
    for consent in consents:
        if consent["signerId"] in consent_map:
            raise ValueError("Duplicate consent entry")
        consent_map[consent["signerId"]] = consent
    output = []
    for row in rows:
        if row.get("source", "first-party") != "first-party":
            raise ValueError("Non-first-party source requires its authorization-aware adapter")
        signer = row.get("signerId")
        consent = consent_map.get(signer, {})
        if row.get('schemaVersion') == 'maeen-collection-v2':
            decoded = row.get('decoded', {})
            if consent.get('recording') is not True or not 3 <= decoded.get('durationSeconds', 0) <= 10.25:
                raise ValueError('Collection v2 requires recording consent and decoded-duration validation')
        if consent.get("training") is not True or consent.get("modelDistribution") is not True or consent.get("withdrawn") is not False or row.get("consentRef") != consent.get("consentRef"):
            raise ValueError("Active training and model-distribution consent required")
        qc = row.get("qc", {})
        if row.get("captureType") != "real-camera" or row.get("mirrored") is not False or qc.get("accepted") is not True or not qc.get("languageReviewer") or not qc.get("technicalReviewer"):
            raise ValueError("Unreviewed, mirrored or non-camera sample")
        if signer not in assignments or row.get("wordId") not in labels or not re.fullmatch(r"C\d{2}", row.get("sessionId", "")):
            raise ValueError("Unknown signer/class/session")
        if type(row.get("repetition")) is not int or not 1 <= row["repetition"] <= 99 or type(row.get("take")) is not int or not 1 <= row["take"] <= 99:
            raise ValueError("Invalid repetition/take")
        expected = f'{signer}_{row["wordId"]}_{row["sessionId"]}_R{row["repetition"]:02}_T{row["take"]:02}'
        path = safe_path(root, row.get("file"))
        if row.get("clipId") != expected or path.stem != expected or path.suffix.lower() not in (".mp4", ".webm") or not path.is_file():
            raise ValueError("Invalid clip name/file")
        output.append({**row, "split": assignments[signer], "sha256": sha256_file(path), "source": "first-party"})
    validate_partitions(output, splits, labels)
    return output
