# Phase 5 — independent sign-language models

Implemented 2026-10-21. No deployment or push.

## Current capabilities

| Language | Letters | Words | Evaluation |
|---|---|---|---|
| ArSL | Original 37-label forest, unchanged raw-coordinate preprocessing and stabilizer | Not Implemented; genuine multi-signer recordings still required | Original accuracy/training signer provenance remain unverified. No new accuracy claim. |
| ASL | Genuine experimental 24-class landmark MLP. J/Z motion unsupported | Model unavailable; permission-blocked 15-gloss research shortlist only | Separate-source static images: 431/683 correct with detected hands (63.10%), 431/720 including detection misses (59.86%); macro F1 0.5844. Signer-independent and live-human accuracy not measured. |
| Korean Sign Language | Research / Model unavailable | Research / Model unavailable | No compatible rights-cleared RGB browser model integrated; no fabricated scores/classes. |

The ASL model is original MAEEN work trained on publisher-declared CC0 images, not relabeled Arabic gestures. Training/evaluation sources, sample counts, licensing and serious per-class weaknesses are documented in ASL_MODEL_RESEARCH.md. KSL candidates and access/modality restrictions are in KSL_MODEL_RESEARCH.md.

## Architecture and UI

`app/src/services/signs/registry.ts` defines each language's ID, display name, text direction/language, adapter type, model assets, label manifest, preprocessing, letter/word capabilities, vocabulary, evaluation, version and licensing/attribution. KSL has no model URL or preprocessing configuration. Every language currently has an empty supported word vocabulary.

The existing translator now includes a labeled Sign Language selector and capability/status panel. The interface language remains independent. ArSL retains its original Letters/Words/Learn views. ASL exposes its actual 24 static classes and experimental warnings. ASL/KSL Words and Learn show unavailable states rather than the Arabic word placeholder/gallery. Arabic-only speech is not reused for English ASL output.

Language changes stop capture, abort pending asset requests, close hand detection, dispose model smoothing, and clear labels/scores/composition. Tests cover active switching and late model completion. Model weights/label files load only after starting supported recognition, not on initial page load or mere selector changes. ASL dense layers use wrist translation, middle-MCP scale and handedness normalization; ArSL retains its own exact legacy feature calculation. No common gesture-to-translated-text lookup is introduced.

ASL scores use EMA (alpha 0.4), fixed threshold 0.70, margin 0.15 and the preserved stable-letter/deduplication policy. Missing hands produce No Sign; uncertain or invalid vectors produce Unknown. Unknown rejection is heuristic, not a trained open-set detector. A new start/language resets smoothing and stabilization. J/Z are absent from both model labels and supported vocabulary.

## Browser measurements and observations

Chrome 145 headless, Windows, local preview. Current evidence: docs/phase5/browser-check.json.

- ASL classifier only: mean 0.0332 ms across 1,000 repeated real-feature-vector inference calls; p95 0.100 ms. This excludes MediaPipe, capture, browser scheduling and stabilization.
- Model fetch/JSON parse/validation benchmark: 8.1 ms on localhost after a previous model use; **not** a cold public-network measurement.
- Model artifact: 369,575 bytes. The already-preserved hand detector/runtime are additional dependencies, not included in that size.
- Browser/PyTorch maximum logit difference on a real extracted vector: approximately 0.0000022.
- Recorded-image camera engineering fixture: a real CC0 B image at its original 200×200 dimensions, repeated as Y4M frames only for camera/stability testing. It composed one B in 3,671 ms from Start, including startup/tracking/stability; holding it did not append duplicates. This is one engineering observation, not average event latency or live-human accuracy.
- Changing to KSL removed capture/output controls; returning to ArSL/ASL left empty buffers. No model weight requests occurred before Start, and no external/non-GET requests were recorded.
- No horizontal overflow at 360, 768 or 1280 px; no page errors. Screenshot evidence is in docs/phase5/.

Early versions of the camera fixture with padding or changed dimensions produced no detected hand, although the original image worked in image mode. CPU and GPU showed the same limitation. The successful fixture does not erase these failures: framing/capture-domain sensitivity remains unresolved and is a reason not to claim live-webcam reliability. No detector thresholds or product camera settings were changed to manufacture a passing result.

## Preservation and verification

| Check | Before | After |
|---|---:|---:|
| App tests | 91 passing | 103 passing, 31 files |
| Existing Python tests | 32 passing | 32 passing, unchanged |
| New independent Phase 5 Python tests | 0 | 4 passing |
| Total Python tests | 32 | 36 passing across both suites |
| Production build | Passing | Passing |

All 65 snapshotted protected Phase 3/Phase 4 source, model, collector, consent, mapping and pipeline files retain identical SHA-256 values (docs/phase5/preservation-result.json). The original ten AI assets also pass build integrity verification. No Arabic collector, vocabulary mapping, consent flow, temporal feature pipeline, training scaffold or ONNX preparation was changed.

Smart Radar's YAMNet model, audio worker, PCM capture, filters, controls and fallback remain intact. Existing Radar unit tests pass; the real-recording browser regression again verifies dog alert/history/Clear/Stop and failed-runtime microphone-level fallback. No sound model replacement or retraining occurred.

## Outstanding

ASL needs substantially better signer-labeled, consent-documented data and independent calibration/evaluation, especially for its poorly performing classes; real-human webcam and mobile testing; genuine temporal J/Z and word models. KSL needs an authorized RGB model/data path or a real supported depth-camera implementation. Arabic word training still waits for real multi-signer recordings. None of these capabilities is advertised as implemented.
