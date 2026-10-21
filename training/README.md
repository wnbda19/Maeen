# MAEEN first-party training infrastructure — current collection v2

Official library videos are **linguistic reference links only**, not the training corpus. Current primary target is 25 terms × 15 real signers × 15 repetitions = **5,625 accepted positives**, plus 150 real rejection examples. Fallback is 2,700 +120. There are zero real recordings; no training is permitted yet.

Use [COLLECTION_TRAINING_WORKFLOW.md](../COLLECTION_TRAINING_WORKFLOW.md) for the complete current commands and [RECORDING_GUIDE.md](../RECORDING_GUIDE.md) for the local internal recorder/importer. Mapping/splits live in collection/profiles.json and config/vocabulary.reference25.json / splits.reference25.json (or mvp15 equivalents). The original draft vocabulary/splits and earlier official-library audit/staging tools are preserved, not silently remapped or used as training data.

## Environment
The prepared .venv uses Python 3.12 CPU PyTorch, MediaPipe, OpenCV contrib, ONNX and ONNX Runtime. requirements-lock.txt records tested versions. Recreate a CPU environment using the official PyTorch CPU index first, then requirements. setup_assets.py prepares official detector tasks with pinned hashes; those are landmark detectors, not word weights or a dataset. Review detector redistribution terms separately. GPU fitting is not verified.

Run tests from training/: `.\.venv\Scripts\python.exe -m unittest discover -s tests -v`. setup_assets.py is needed if detector assets are absent. Temporary blank/geometry/untrained probes verify plumbing only and are never collected as samples or fitted. Native Windows MediaPipe Unicode path handling uses task buffers and a temporary ASCII working directory; no raw participant files are moved.

## Current source gates
First-party import requires actual signed-evidence consent, checks decoded WebM/MP4 length and resets QC to pending. Training requires the full profile's accepted independent slots, real negatives, three sessions and controlled variation, frozen signer partitions, linguistic review, active consent and valid feature lineage. No random clip split, fabricated signers or permission flags are supplied. Model comparison/evaluation/export remain offline/private.

Public Word Mode remains Not Implemented. The internal collector has its own build and localhost entry, no upload endpoint, no public-app route and no service worker. No deployment/push is part of this work.
