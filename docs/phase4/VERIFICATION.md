# Phase 4 final verification — 2026-10-21

- `npm.cmd test` in app: 91 tests pass, 26 test files.
- `npm.cmd run build` in app: TypeScript, Vite, preserved AI asset verification and service worker generation pass.
- `training/.venv/Scripts/python.exe -m unittest discover -s tests -v` in training: 32 tests pass under normal host execution.
- SHA-256 preservation check: 47 protected Phase 3 files, zero changes.
- Real pretrained inference: 20 real CC BY clips, 180 windows. Original per-window scores and timings in audio-evaluation.json.
- Complete capture pipeline: genuine recorded dog sound injected as test microphone; alert/history, Clear, Stop and blocked-runtime fallback verified. This is not a physical microphone.
- Browser check: no page errors, external requests or non-GET requests; no horizontal overflow at 360/390/768/1280 px. Evidence in browser-check.json.
- No WAV recordings in app/dist; no raw microphone storage/upload path added.
- No training, deployment, git push or official-library video ingestion performed.

Metrics and limitations are reported in the root SOUND_MODEL_EVALUATION.md. These checks do not establish emergency-detector reliability or physical-device notification/vibration support.
