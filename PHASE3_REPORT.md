> Current collection v2: Official videos are reference links only. Controlled first-party preparation now targets the same 25 terms. See OFFICIAL_REFERENCE_MAPPING.md, DATA_COLLECTION_PROTOCOL.md and COLLECTION_TRAINING_WORKFLOW.md. The text below is historical. No real recordings or training yet.

> Current direction — 2026-10-21: First-party collection is PAUSED. The Saudi Sign Language Library is the primary research candidate; rights and data access are NOT CONFIRMED. This document is preserved as prior work. See SAUDI_SIGN_LIBRARY_AUDIT.md, DATA_SPLIT_FEASIBILITY.md and training/OFFICIAL_LIBRARY_INGESTION.md. No word training is authorized or underway.

# Phase 3 — first-party dataset readiness report

2026-10-21 (Asia/Riyadh). Scope follows the owner's explicit steering: **pause training; use no unclear-license dataset; prepare first-party collection and training/evaluation infrastructure.** No optimizer step, real-corpus training, deployment, publication or third-party message occurred.

## Delivered

- [Collection protocol](DATA_COLLECTION_PROTOCOL.md): 15 proposed words, 12 planned adult signers, 20 independent repetitions, four recording conditions over two sessions, one/two-hand and facial/body requirements, real negatives, QC, 8/2/2 signer allocation.
- [Vocabulary](WORD_VOCABULARY.md), [schema](DATASET_SCHEMA.md), [consent/data use](CONSENT_REQUIREMENTS.md) and [Arabic recording guide](RECORDING_GUIDE.md).
- [Public dataset research](WORD_MODEL_RESEARCH.md): author-source inventory and rights/modality/signer blockers; no public corpus recommended for the intended model distribution.
- [Letter evaluation](ARABIC_LETTER_MODEL_EVALUATION.md): actual 37-class/raw-63-feature forest inspected, hash preserved, mechanical rejection improved, accuracy/FPS left unmeasured.
- [Runnable training workflow](training/README.md): consent-aware JSONL ingestion, SHA-256 duplicate detection, fixed signer partitions, real MediaPipe offline extraction, shared browser/offline normalization, data/feature audit, four small architectures, deterministic fitting scaffold, validation-only rejection calibration, test scoring and private ONNX export/parity.
- Temporal utilities: timestamped buffer, masks, fixed-length resampling, missing-hand/gap handling, image-aspect correction, clip-fixed body normalization and explicit No Sign/Unknown/Recognized policy with history/reset. Default stability settings are engineering defaults requiring real validation, not claimed optimal thresholds.
- Word UI now explicitly says **Not Implemented / Dataset Collection Required**, in Arabic and English. No weights are fetched or camera started in that mode.

## Verified

| Check | Result and limit |
|---|---|
| Application baseline | 52 tests passed before edits; production build passed |
| Final application suite | **67 passing tests / 20 files**, retaining the original 52 |
| Python infrastructure suite | **18 passing tests**, no skipped detector startup test in this environment |
| Production build | Passed; strict TypeScript/Vite/worker build; ten original AI assets preserved |
| Original deployment files | Root Git comparison unchanged for index/assets/models/MediaPipe/redirects |
| Four architectures | Forward shape checks and ONNX/CPU numerical parity on temporary **untrained** probes; no fitting or retained probe weights |
| Real extraction runtime | Actual hand/pose/face tasks initialized and decoded a temporary blank MP4 under an Arabic-named folder. This tests plumbing, **not signing accuracy**; probe files deleted, never trained on |
| Shared normalizer | Actual Node command produced `[1,32,268]` float32 feature files readable by Python, using temporary geometry fixtures only |
| Word browser state | `/Maeen/` production preview, Arabic/English at 375/768/1440: six checks, no overflow, Dataset Collection Required present, zero camera/video elements in Word mode |

The prior 48-state responsive matrix is historical; this phase checked the six changed Word-state combinations and did not represent the earlier matrix as a fresh full-site run. No live signing webcam session or new physical microphone assessment was performed. No full AT/mobile certification is claimed.

## Letter recognition status

- **Implementation:** existing real one-hand forest/MediaPipe pipeline preserved. New safeguards reject malformed scores and prevent low-score flicker from rearming the same letter; deliberate hand removal still rearms.
- **Evaluation:** no legitimate labelled external recordings or original training identities/splits available. No signer-independent evaluation performed.
- **Supported categories:** 37, exact labels in the evaluation document.
- **Accuracy, per-letter scores, confusion pairs, camera FPS and live stability:** **unverified/not measured**.
- **Timing:** engineering forest-only Node p50 ≈0.0154ms / p95 ≈0.0192ms; excludes camera, MediaPipe, UI and browser. Never use it as real-time/end-to-end latency or accuracy.

## Word recognition status

| Requested item | Honest current result |
|---|---|
| Implementation | **Not Implemented / Dataset Collection Required** in the app; offline infrastructure prepared |
| Supported words | **0 trained/validated**; 15 proposed first-party targets, plus two rejection classes |
| Dataset | Planned first-party MAEEN Saudi sign recordings; **0 collected samples in this project** |
| Dataset license/rights | No acquired public dataset used; participant/controller training and model-distribution permission must be finalized/obtained before collection/training |
| Architecture | No trained/deployed selection. TCN, GRU, BiLSTM and compact fixed-graph ST-GCN candidates implemented; TCN is a provisional workflow default |
| Signer-independent accuracy / macro F1 | **Not measured** |
| Trained word-model size | **Not available**; no genuine weights exist |
| Browser latency/runtime choice | **Not measured / deferred** until a genuine candidate can be benchmarked; no speculative word runtime added to the app |
| Live webcam testing | **Not performed for words**; unavailable UI intentionally keeps camera off |

Measured untrained structure only: TCN 77,329 parameters; GRU 65,233; BiLSTM 78,417; compact graph model 7,729 (17 outputs including negatives). These counts are not trained file sizes, quality scores or a basis to assert a winner. [Structure report](docs/phase3/architecture-structure.json).

## Environment and remaining acceptance work

An isolated Python 3.12 CPU environment and exact dependency lock are provided under training/. The native Windows detector package failed on Unicode working/model paths; the tested solution reads task bytes with Python and runs serial native calls in a temporary ASCII working directory, without moving project/raw files. Official detector tasks are local/ignored and their hashes are recorded. They are not word weights and are not added to app/public. Export currently uses the tested legacy ONNX path, which emits an upstream deprecation warning; any migration must repeat parity tests.

The shared normalizer prevents Python/TypeScript transform drift. **Cross-runtime detector parity on actual signer clips remains unverified** (Python MediaPipe 0.10.35 versus existing web SDK 0.10.32); validate/update a frozen matching extractor/runtime before browser deployment. Handedness convention must be checked with actual left/right calibration recordings.

Fitting/early-stopping/export code has not been exercised on a real training corpus, intentionally. Human linguistic/consent/QC approvals, actual collection, coverage review, locked signer-disjoint training/validation/test, stream-level unknown/duplicate calibration, target-device runtime comparison and live webcam acceptance are the next steps. Do not enable the app from a checkpoint filename or temporary export probe. Nothing was deployed or pushed.

Evidence: [phase3 index](docs/phase3/README.md), [verification record](VERIFICATION.md). Earlier phases remain intact.
