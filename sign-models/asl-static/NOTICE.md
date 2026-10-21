# MAEEN experimental ASL static-letter classifier

Original MAEEN classifier weights, trained 2026-10-21. No third-party pretrained alphabet classifier weights were used. Architecture: 63 → 128 ReLU → 64 ReLU → 24 logits. Dataset and training provenance are documented in the root ASL_MODEL_RESEARCH.md and docs/phase5/asl-evaluation.json.

Training images: Ayush Thakur, American Sign Language Dataset, version 1, publisher-declared CC0 Public Domain: https://www.kaggle.com/datasets/ayuraj/asl-dataset . License metadata was checked through the publisher's public API and preserved under docs/phase5/asl-dataset-metadata.json.

Separate evaluation images: Dan Rasband, ASL Alphabet Test, version 1, CC0 Public Domain: https://www.kaggle.com/datasets/danrasband/asl-alphabet-test . Evaluation images were not used for weight optimization or threshold tuning.

CC0 applies to those source datasets. The newly trained weights are MAEEN project assets, governed by MAEEN's project licensing; no extra third-party model-weight restrictions are introduced. Do not misrepresent the original Arabic model's license as this model's license, or vice versa.

MediaPipe Hand Landmarker: Google, Apache-2.0, reused from MAEEN's preserved assets. No hand-landmarker weights were modified.

Only 24 static letters are classified. J and Z motion, words, grammar and continuous signing are not implemented. Signer IDs are unavailable. Accuracy is a limited separate-source image measurement, not signer-independent or live-webcam accuracy. Several classes perform very poorly. High confidence can occur on unfamiliar or incorrectly classified handshapes.
