# Phase 3 — first-party reference-based collection delivery

2026-10-21. Official Saudi library videos are now **linguistic reference links only**. They are neither downloaded nor included in any training partition. No model fitting, participant recruitment, actual consent collection, publication or deployment occurred.

## Targets and actual progress

| Profile | Positive target | Actual accepted positives | Remaining positives | Real negatives required | Total remaining |
|---|---:|---:|---:|---:|---:|
| Primary: 25 terms ×15 signers ×15 repetitions | **5,625** | **0** | **5,625** | **150** | **5,775** |
| Alternative minimum: 15 terms ×12 signers ×15 repetitions | **2,700** | **0** | **2,700** | **120** | **2,820** |

These are alternative campaigns, not additive targets. Negatives are five No Sign + five Unknown clips per signer, in addition to positives. Actual project collection roots contain zero imported real clips, signed consents and features. Evidence: [primary progress](docs/phase3/collection-progress-reference25.json), [minimum progress](docs/phase3/collection-progress-mvp15.json).

## Delivered plans and mapping

- [DATA_COLLECTION_PROTOCOL.md](DATA_COLLECTION_PROTOCOL.md): three sessions, independent repetitions, framing, lighting/background/speed/distance variation, male/female participation goals, real negatives and two-reviewer QC.
- [RECORDING_GUIDE.md](RECORDING_GUIDE.md): internal tool, Arabic collector checklist, private exports/import and progress.
- [OFFICIAL_REFERENCE_MAPPING.md](OFFICIAL_REFERENCE_MAPPING.md): **same 25 verified official record IDs/URLs**, W101–W125, exact official titles/glosses and fixed 15-term subset. Earlier W001–W015 meanings are not silently reused.
- [DATASET_SCHEMA.md](DATASET_SCHEMA.md): first-party provenance, anonymous signer/session/global repetition/take IDs, WebM/MP4, consent evidence, decoded checks and temporal/feature lineage.
- [CONSENT_REQUIREMENTS.md](CONSENT_REQUIREMENTS.md): explicit accessible recording/landmark/training/model-distribution scope, separate raw-video/public/commercial choices, retention/withdrawal requirements and registry separation.
- [TRAIN_VAL_TEST_SPLIT.md](TRAIN_VAL_TEST_SPLIT.md): primary 9/3/3 signers; fallback 8/2/2. Planned anonymous codes only; no fictional people. No signer can appear in two partitions.
- [COLLECTION_TRAINING_WORKFLOW.md](COLLECTION_TRAINING_WORKFLOW.md): complete current command sequence and acceptance gates. Earlier plans are preserved in docs/phase3/history/.

## Internal recording tool

Run `npm.cmd run collector` from app/, then open **http://127.0.0.1:4196/collector.html**. It is a separate internal bundle, not a public-app route and not included in the default production build. Keep it on the local device; no authentication/security boundary is claimed if someone independently hosts that bundle publicly.

Implemented: profile/term selection; exact official reference link without embedding/downloading reference footage; anonymous signer/session/repetition selection; written-consent reference and required flag; real MediaRecorder webcam clips without audio; unmirrored framing; format-correct auto filenames/take numbering; 3–10s elapsed validation and automatic stop; IndexedDB blob/metadata storage; saved-clip replay; video/JSON/index downloads; local unique-slot counts and global offline progress. No upload endpoint/service worker/telemetry was added; collector CSP disallows network connections.

Consent revocation during pending acquisition/capture cancels it; late streams and unmount stop tracks. Invalid duration, denied camera/codec or storage failures do not increment counts. Existing saved recordings are not automatically erased by a checkbox. Browser storage can be evicted; operators must regularly export to the approved private store. Saving/exporting is not QC acceptance or proof of consent.

## Offline pipeline and training readiness

`maeen_data.collection import` validates profile/source/reference mapping/current consent, safe names, real decoding/duration/FPS, hashes and duplicate bytes, then copies private exports without overwriting/moving originals and starts QC pending. `progress` separates recorded vs accepted slots; `accepted` exports only reviewed rows with current consent. Retakes never inflate planned coverage.

Current defaults point to the 25-term vocabulary and its frozen split; fallback overrides are documented. Main ingestion supports actual WebM and MP4 and rechecks v2 recording permission/decoded duration. Training now requires the **entire profile**, one accepted take per slot, real negatives and controlled variation/session coverage, in addition to existing source/consent/feature/linguistic-review/signer-leakage checks.

Existing real hand/pose/face extraction, shared 32×268 temporal normalization, feature dataset generation, GRU/BiLSTM/TCN (optional ST-GCN), validation-only model selection/rejection calibration, locked test metrics and ONNX numerical-parity export are preserved/prepared. The 25-term profile has 27 output classes including rejection classes; the fallback has 17. Untrained structural counts are [recorded separately](docs/phase3/architecture-structure.reference25.json), not model quality/size claims.

**Training readiness: NOT READY.** Real multi-signer recordings, signed consent registry, Deaf-led variant approval, calibration and full technical/linguistic QC remain. No optimizer step has run. Accuracy, macro F1, trained model size, browser latency and live word-recognition performance are not measured. Public Word Mode remains **Not Implemented / Data Access Required**, with no supported-word count or fake predictions.

## Fresh verification

- **75 app tests /22 files pass**, retaining the prior 67; new tests cover target/profile consistency, consent/duration/naming/counts, camera denial, late-stream cleanup, cancellation and pending-QC save behavior.
- **32 Python tests pass**, retaining the prior 26; new tests cover import consent/provenance/idempotence, targets/retakes/readiness, temporary WebM decoding and actual model-head shapes for both profiles.
- **Production build and separate internal collector build pass**, including strict TypeScript and 10 preserved AI assets. Default dist/ has no collector.html; original tracked deployment/model assets remain unchanged.
- Browser checked recorder widths **375/768/1440**: no horizontal overflow, start disabled without consent, correct official reference link, no camera source. Both full/minimum profile counts and option sets verified. [Browser notes](docs/phase3/collector-browser-checks.json), [screenshot](docs/phase3/internal-collector.jpg).

Capture tests use simulated media events; a temporary blank WebM and existing blank native-detector/untrained export probes are engineering tests only, deleted/never fitted. No real participant webcam capture or complete first-party video-to-trained-model run has been performed. Actual target-camera codec/landmark/handedness acceptance is still required before field collection. Existing legacy ONNX/OpenCV diagnostic warnings are not fabricated evaluation results.

Nothing deployed, pushed or sent externally. Next work is human consent/linguistic review and genuine collection, using this infrastructure.
