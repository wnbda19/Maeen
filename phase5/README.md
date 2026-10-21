# Independent Phase 5 ASL experiment

This folder does not import or modify the Arabic collection/training pipeline. It uses the existing Python environment only as an installed runtime (NumPy, Torch, OpenCV, MediaPipe). The model was trained on real source images, with no synthetic data or image augmentation.

## Reproduce

1. Confirm the publisher still declares CC0 for both datasets. Preserved API responses: docs/phase5/asl-dataset-metadata.json and asl-test-dataset-metadata.json. Never substitute a differently licensed mirror.
2. Download version 1 archives through the publisher's public endpoints:
   - https://www.kaggle.com/api/v1/datasets/download/ayuraj/asl-dataset?datasetVersionNumber=1
   - https://www.kaggle.com/api/v1/datasets/download/danrasband/asl-alphabet-test?datasetVersionNumber=1
3. Extract into phase5/data/asl-cc0/ and phase5/data/asl-test-cc0/. The extraction script reads actual JPEG/PNG images from letter directories and deduplicates bytes. It excludes J, Z, digits and control labels.
4. From the repository root run `training/.venv/Scripts/python.exe -m phase5.asl`. This extracts genuine landmarks, trains fixed settings and evaluates on the separate test source. Cached feature arrays and extraction ledgers stay in ignored phase5/data/.
5. Run `training/.venv/Scripts/python.exe -m unittest discover -s phase5/tests -v` for four normalization/class-contract tests. The unchanged original Python suite remains separate under training/tests/.

Signers cannot be split from absent IDs. No random image train/test split or invented signer grouping is used. The model has fixed epochs without early stopping; the separate test source is not used for optimization, calibration or model selection. This experiment is not a signer-independent benchmark. Reproducibility across platforms may vary numerically; update model version, build integrity hash, metrics and browser parity fixture together if intentionally retraining.

Published local assets are only sign-models/asl-static/model.json, labels.json and NOTICE.md. Dataset images/archives and feature caches are not copied to app/public or app/dist.

Browser tests use app/scripts/check-sign-languages.mjs with Chrome, Playwright and the local production preview on 127.0.0.1:4199. PLAYWRIGHT_MODULE can supply an absolute module path. The test camera file phase5/data/camera-B.y4m is **not training data**: it repeats the original 200×200 CC0 B/B0001_test.jpg at 30 fps, converted with OpenCV BGR→YUV I420, prefixed with a YUV4MPEG2 header and FRAME markers. It exists only to verify capture/stabilization/lifecycle and does not measure live-human accuracy.
