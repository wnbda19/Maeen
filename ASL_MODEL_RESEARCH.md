# ASL models and datasets — Phase 5

Investigated 2026-10-21. ASL is independent of ArSL and Korean Sign Language. English text labels do not define an interchangeable gesture inventory.

## Implemented: experimental static fingerspelling

No reviewed pretrained alphabet classifier combined adequate provenance, compatible preprocessing and confirmed unrestricted deployment rights. A small independent MAEEN model was therefore trained from the publisher-declared CC0 **American Sign Language Dataset**, Ayush Thakur, version 1: [publisher](https://www.kaggle.com/datasets/ayuraj/asl-dataset), [public license metadata](https://www.kaggle.com/api/v1/datasets/view/ayuraj/asl-dataset). The API response is preserved in `docs/phase5/asl-dataset-metadata.json` and explicitly reports `CC0: Public Domain`. This declaration is evidence of the publisher's stated license, not a claim that MAEEN independently verified every participant's consent history.

The downloaded archive contains duplicate directory copies. After SHA-256 deduplication, the selected 24 letters contain 1,675 unique images, with 963 successful hand detections used for training. Every output class has genuine examples, but support is very uneven (T has only three detected training images). The data also contains digits and static depictions labeled J/Z; those classes are excluded. No synthetic/duplicated examples or data augmentation were added.

Evaluation uses Dan Rasband's separate **ASL Alphabet Test**, version 1: [publisher and CC0 declaration](https://www.kaggle.com/datasets/danrasband/asl-alphabet-test), [public metadata](https://www.kaggle.com/api/v1/datasets/view/danrasband/asl-alphabet-test). Of 870 unique images / 29 labels in this source, 720 images belong to the 24 selected letters; 683 yield hand landmarks. No overlapping SHA-256 values were found among the used training/test images. No signer IDs/count are supplied by these manifests; separate sources and byte deduplication do **not** prove different signers.

Architecture: 63 landmark inputs → 128 ReLU → 64 ReLU → 24 logits. Wrist translation, wrist-to-middle-MCP scaling, and consistent handedness reflection match the browser adapter. Orientation is preserved. Fixed seed 20261021; AdamW; 160 epochs; no test-driven threshold adjustment, early stopping or hyperparameter search. There is no signer-labeled validation partition; consequently no signer-disjoint training/validation/test claim. Source, extraction ledger, fixed training script and metrics are separate from the preserved Arabic infrastructure under `phase5/` and `docs/phase5/`.

Model `1.0.0-experimental`: **369,575 bytes**, SHA-256 `82443cb9faecdbcbfe5815ab672ba6753ab03dad902757b8a6b466264f40ec8e`. It runs directly as small dense layers in browser JavaScript without an extra inference dependency. Weight arrays are loaded only when ASL camera recognition starts. These are original MAEEN project weights; CC0 describes the training/evaluation data, not a relicensing of all MAEEN source or the legacy Arabic model. Attribution and licensing distinctions accompany the asset in `sign-models/asl-static/NOTICE.md`.

Supported classes: **A B C D E F G H I K L M N O P Q R S T U V W X Y**. J and Z require temporal recognition and are not implemented. Neither words nor continuous fingerspelling is recognized. A J/Z gesture can nevertheless be misclassified as another static letter; this model cannot identify or reliably reject all out-of-distribution motion.

## Genuine measured image evaluation

| Measure | Result |
|---|---:|
| Correct top-1 classifications among detected test hands | 431 / 683 = 63.10% |
| Correct classifications counting no-hand test cases as failures | 431 / 720 = 59.86% |
| Macro F1 on 683 detected hands | 0.5844 |
| Single-image accepted at fixed score ≥0.70 and margin ≥0.15 | 522 |
| Correct among those accepted images | 375 / 522 = 71.84% |
| Signer-independent accuracy / live-human accuracy | Not measured |

The image acceptance check does not include live EMA/stability, because a still-image test is not a signing sequence. Do not compare these measurements with the unverified Arabic forest or with unrelated word datasets. `docs/phase5/asl-evaluation.json` contains per-class precision/recall/F1, support, full confusion matrix and detector misses. T recall is zero; A, D, G, M, N, S and Q also have major limitations. Confidence does not reliably reject incorrect predictions. This is not a production-validated fingerspelling recognizer.

Browser timing, load behavior, parity and camera-fixture observations are recorded separately in `docs/phase5/browser-check.json`; physical live-human webcam accuracy remains unmeasured.

## Other alphabet candidates reviewed

| Candidate | Dataset/model and rights | Decision |
|---|---|---|
| [ASL landmark MLP](https://github.com/dorukdogular/asl-recognizer) | Author declares CC BY-NC 4.0 and 36 static classes; uses ASL-HG. | Noncommercial model terms do not clear a future public commercial product. Static J/Z claims do not establish temporal recognition. Not downloaded/integrated. |
| [MediaPipe ASL CNN](https://github.com/punpuniacitizen/MediaPipe-ASL-sign-language-recognition) | MIT code; author explicitly distinguishes third-party training data and weight terms, including GPL-labeled data. | MIT code is not blanket evidence of unrestricted weights. Not integrated. |
| [SignAlphaSet](https://data.mendeley.com/datasets/8fmvr9m98w/1) | Publisher: 26,000 images, CC BY 4.0; study describes three participants. Static data alone cannot validate J/Z motion. | Additional candidate, not downloaded; signer IDs, original/augmented grouping and model-weight rights need examination before training/evaluation. |

## Word-level candidates

| Dataset | Scope / format / signers | Rights and scientific feasibility |
|---|---|---|
| [ASL Citizen](https://www.microsoft.com/en-us/research/project/asl-citizen/) / [paper](https://arxiv.org/abs/2304.05934) | 83,399 isolated RGB videos, 2,731 signs, 52 signers. Consent/IRB-led collection. | Microsoft asks commercial users to contact the project. [Baseline code and checkpoint links](https://github.com/microsoft/ASL-citizen-code) exist; MIT code does not resolve all dataset-derived deployment rights. Signer-disjoint evaluation is feasible with its documented signer partitions. No videos/weights downloaded. |
| [WLASL](https://github.com/dxli94/WLASL) | 2,000 isolated word classes, approximately 21k referenced RGB clips; signer/session/source metadata and temporal/pose baselines. | Author specifies C-UDA and no commercial usage. Public pretrained I3D/Pose-TGCN links are not an unrestricted product license. Per-class signer counts were checked for a reference-only 15-word shortlist; source availability and signer-disjoint coverage must be rechecked after permission. No videos/weights downloaded. |
| [MS-ASL](https://www.microsoft.com/en-us/research/project/ms-asl/) | 25,513 isolated video examples, 1,000 signs, 222 subjects in official table; signer-independent benchmark. | Suitable scientific reference, but unrestricted model-weight/public commercial deployment permission was not established in this investigation. Not downloaded or integrated. |
| [ASLLVD / ASLLRP Sign Bank](https://www.bu.edu/asllrp/av/dai-asllvd.html) | Over 3,300 citation signs, around 9,800 tokens, up to six native signers; multiview RGB, handshape/time annotations. Counts vary by corpus revision. | [Official Sign Bank terms](https://www.bu.edu/asllrp/signbank-terms.pdf) restrict commercial derived work and redistribution. Some classes have too few signers for three disjoint partitions. Not used. |

No ASL word capability is enabled. A verified, permission-blocked research shortlist and temporal implementation requirements are in ASL_WORD_MVP.md. Permission and a model suitable for actual inference are both required before exposing supported word counts in the app.
