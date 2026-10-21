# Phase 4 — genuine Smart Radar AI

## Implemented

YAMNet TFLite inference runs locally in a classic Web Worker using pinned `@mediapipe/tasks-audio@0.10.32`. The model is self-hosted with its license, notice and provenance; build preparation verifies its SHA-256. No cloud inference, fabricated scores or random spatial coordinates exist.

Pipeline:

`getUserMedia → native-rate mono AudioWorklet windows → MediaPipe audio resampling/features → YAMNet → group confidence + temporal stability → visible alert/history → optional notification/vibration`

The AudioWorklet averages input channels, accumulates 0.975-second windows with 0.48-second hops, and transfers temporary PCM to the local worker. MediaPipe handles native sample-rate resampling and feature extraction. Audio capture uses no echo cancellation, noise suppression or automatic gain control when the browser honors these constraints. No MediaRecorder, upload endpoint, raw-audio storage or PCM logging is introduced.

The client permits only one inference request at once, dropping windows while busy instead of growing a queue. Loading times out after 30 seconds; stalled inference after 10 seconds falls back. Inference, worklet, model download and worker failures preserve microphone-level mode. The SDK declares but fails to export FilesetResolver in ESM at this pinned version; the worker supplies the documented WasmFileset paths directly, using the portable non-SIMD CPU binaries. Genuine browser tests confirmed this path.

The ten actual supported alert groups are listed in SOUND_MODEL_RESEARCH.md. Defaults: 0.65 confidence score threshold; two consecutive winning windows within 1.5 seconds; 10-second per-group cooldown; continuous events latch until three below-threshold windows rearm them. Related parent/child scores use max, not sum. Low/invalid/disabled predictions produce no sound alert. Confidence/category changes clear pending stability evidence. This conservative default still misses legitimate sounds, as the evaluation documents.

## Radar integration

- Preserved existing visual radar, digital dBFS meter and level threshold/history. Rings react to level; no exact location, distance or physical sound-pressure claim.
- Added local recognition state, latest alert with score/time/priority, bounded 30-event sound history and Clear.
- Category checkboxes, confidence control and optional AI enable/level-only mode. These settings are session-local.
- Explicit notification permission button; denied/unsupported notifications cause no crash and visible alerts remain. Notification contents contain only the sound label. Vibration is opt-in and disabled when unsupported.
- Arabic and English copy; semantic fieldset/labels, keyboard controls and live status. Updated public sound capability summaries to avoid stale claims that type recognition is entirely absent.
- Start/Stop, track-ended, hidden page and unmount lifecycle release microphone, worker and audio context. Capture never continues in the background.

Model loading begins only after the user starts Radar with AI enabled. Other routes do not initialize the model. First-load network access to the site's own assets is required; the audio model/runtime are not added to service-worker model caching in this phase. Offline AI availability is not guaranteed; level fallback remains usable where microphone capture works.

## Main files

- `app/src/services/audio/events.ts`: exact class mapping, stability/cooldown and notification policy.
- `app/src/services/audio/model.ts`, `audio.worker.ts`: lazy bounded worker lifecycle and genuine inference.
- `app/public/audio-capture.js`: local-only PCM capture/windowing.
- `app/src/features/radar/useRadar.ts`, `RadarView.tsx`, `AudioControls.tsx`: integration and fallback.
- `app/scripts/prepare-audio-assets.mjs`: model integrity and self-hosted build assets.
- `app/scripts/evaluate-audio.mjs`, `check-audio-browser.mjs`: real-clip inference and complete capture/fallback checks.

## Verification and limits

The pre-change workspace actually contained 77 passing app tests, exceeding the requested 75-test minimum. Final verification: **91 app tests across 26 files pass; all 32 Python tests pass; production build passes**. New tests cover model lifecycle/failure/timeouts, confidence/category/finite-input rules, stability/deduplication, notification opt-in/failure behavior, exact vocabulary, native-rate/stereo capture and active level fallback. The existing Radar heading/capability assertions were updated to reflect the genuine new functionality; no tests were removed. Python tests needed normal host execution because the sandbox prevented native-code temporary-file access; they passed without any Phase 3 edits.

The real-audio screening found significant false negatives. This implementation is experimental, not a validated emergency detector. Physical microphone, real OS notifications/vibration and mobile field testing remain outstanding. See SOUND_MODEL_EVALUATION.md for measured results and test limitations.

## Phase 3 preservation

All 47 protected collector, consent, mapping, dataset/configuration, landmark/training/scaffold and preparation files in the pre-change snapshot retain identical SHA-256 hashes (`docs/phase4/phase3-preservation-result.json`). No recordings were collected, no official reference videos were used as training examples, and no word model was trained. Public Word Mode remains unavailable, awaiting real multi-signer recordings. No deployment was performed.
