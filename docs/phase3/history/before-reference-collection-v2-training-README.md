> Current direction — 2026-10-21: First-party collection is PAUSED. The Saudi Sign Language Library is the primary research candidate; rights and data access are NOT CONFIRMED. This document is preserved as prior work. See SAUDI_SIGN_LIBRARY_AUDIT.md, DATA_SPLIT_FEASIBILITY.md and training/OFFICIAL_LIBRARY_INGESTION.md. No word training is authorized or underway.

Phase 3B now documents normally exposed public media/JSON routes for exactly 25 records. See [POC investigation](../SAUDI_LIBRARY_POC_INGESTION_REPORT.md). `python -m maeen_data.library_poc` audits the saved metadata and writes a **dry-run plan only**; it does not download, extract or train. Public accessibility has been established; a lawful media-processing basis and scientific sample coverage have not. Existing source/consent guards remain enforced.

# MAEEN first-party training infrastructure

No recordings or trained word weights exist. **Do not run training until genuine recordings, linguistic review and consent are ready.** Installation/tests never fit a model or publish files. The current Word UI remains Dataset Collection Required.

Read the root DATA_COLLECTION_PROTOCOL.md, DATASET_SCHEMA.md, CONSENT_REQUIREMENTS.md, RECORDING_GUIDE.md and WORD_VOCABULARY.md first. The initial target is 12 signers × 15 words × 20 repetitions, plus real No Sign/Unknown negatives. Default split is 8/2/2 signers. Full data stays private.

## Setup (PowerShell, from training/)

```powershell
python -m venv .venv
$env:PYTHONUTF8='1'
.\.venv\Scripts\python.exe -m pip install --index-url https://download.pytorch.org/whl/cpu 'torch>=2.6,<3'
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe setup_assets.py
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

The project-local environment is already prepared on this machine. `requirements-lock.txt` records the tested versions; recreate a CPU environment with the official PyTorch CPU index first, then the lockfile. GPU/CUDA training is optional and not verified here. Existing GPU hardware does not imply this CPU environment uses it. No app dependencies were added.

`setup_assets.py` copies the preserved hand task and fetches official pose-lite/face detector tasks into ignored `assets/`, recording source URLs/bytes/SHA-256 in `config/detector-assets.json`. These are **landmark detectors, not word weights or a sign dataset**. Preserve vendor attribution and review model cards/terms before distributing detector assets. They are not added to public app assets by this workflow. Re-running setup does not overwrite existing detector files.

Windows native MediaPipe path handling was tested in this Arabic workspace: use model buffers and a temporary ASCII working directory during serial extraction. Project/recording files are not moved. A temporary blank decoder probe confirms detector startup and Unicode recording paths; it is deleted and **never becomes training data**.

## Run after real collection and approval

Examples below assume all files have been recorded/reviewed, the consent registry exists privately, and `linguisticReview` is genuinely approved in the vocabulary register. Replace the private paths, not the data values. The class list includes W001–W015, N000 and N001. Ingestion expects coverage of every class across all three signer partitions.

```powershell
$dataset='C:/private/maeen-data'
$consent='C:/private/maeen-consents/registry.json'
$python='.\.venv\Scripts\python.exe'
& $python -m maeen_data ingest --root $dataset --metadata "$dataset/metadata/recordings.jsonl" --consents $consent --output "$dataset/manifests/ingested-v1.json"
& $python -m maeen_data extract --root $dataset --manifest "$dataset/manifests/ingested-v1.json" --consents $consent --tasks assets
node ../app/scripts/prepare-word-features.mjs "$dataset/manifests/ingested-v1.json" $dataset "$dataset/manifests/features-v1.json"
& $python -m maeen_data audit --root $dataset --manifest "$dataset/manifests/features-v1.json" --consents $consent
# Only after actual collection, audit and review:
& $python -m maeen_data train --root $dataset --manifest "$dataset/manifests/features-v1.json" --consents $consent --architecture tcn --output runs/tcn-v1
```

For the registered architecture comparison, repeat with `gru`, `bilstm`, `stgcn` and fresh run directories. The code never randomly splits clips: signer allocation is fixed. Test tensors are not decoded by fitting/early stopping. Training uses deterministic seeds, AdamW, gradient clipping, validation macro F1 selection and early stopping. No augmentation is enabled; do not introduce flips, time reversal, hand swaps or facial changes without linguistic validation. Each run records class order, config, signer splits, source/feature hashes, training loss and validation metrics/confusion matrices. Training/scoring metrics on actual signers are currently **not available**.

## Calibration, locked testing and candidate export

Choose a candidate using **validation only**, before inspecting test performance. Do not choose a new architecture after looking at the held-out test. The compact TCN is a provisional implementation default, not a measured accuracy/performance winner or the smallest parameter count.

```powershell
& $python -m maeen_data calibrate --root $dataset --manifest "$dataset/manifests/features-v1.json" --consents $consent --run runs/tcn-v1
& $python -m maeen_data evaluate --root $dataset --manifest "$dataset/manifests/features-v1.json" --consents $consent --run runs/tcn-v1
& $python -m maeen_data export --root $dataset --manifest "$dataset/manifests/features-v1.json" --consents $consent --run runs/tcn-v1 --output runs/tcn-v1/candidate.onnx
```

Calibration scans score/margin gates on validation negatives, targeting ≤5% negative-to-word false accepts as a **proposed selection constraint**. This does not calibrate softmax as real probability. Temporal stability defaults still require validation on real continuous streams. Evaluation reports raw and filtered accuracy, macro precision/recall/F1, per-class metrics, supports, confusion matrices/common confusion pairs. Its output cannot be overwritten; do not delete the lock to tune on test. A fresh external signer cohort is needed after protocol/model changes.

Export uses a real validation tensor, checks ONNX structure and Python/ORT numerical parity, then records file bytes and local CPU timing. It does not copy to app/public or approve browser release. The temporary untrained export in unit tests checks plumbing only; no optimizer step is run and its file is destroyed. The tested legacy ONNX exporter emits a deprecation warning; future exporter migration must repeat parity checks.

## Browser acceptance still required

No ONNX/TFJS runtime is loaded in the app while no approved word model exists. Before integration, benchmark the trained candidate on target browsers/devices, select runtime/backend from those measurements, verify model/feature/class-order hashes and held-out metrics, test no-sign/out-of-vocabulary transitions and repeated words, and test camera lifecycle. Display raw class probabilities only with honest score semantics. Never remove the Dataset Collection Required label merely because a checkpoint/export file exists. Actual deployment remains a separate task.
