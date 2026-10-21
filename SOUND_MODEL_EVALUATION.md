# Smart Radar model evaluation

Date: 2026-10-21. Status: real browser inference verified; preliminary screening only, not production safety validation.

## Reproducible inputs and method

- Google YAMNet TFLite, SHA-256 `4d8b4a53282dc83ef04e3e7dbc4fbc98082e34e44ed798e16c3a0cdd4c584faf`.
- 20 real CC BY ESC-10 clips, two per category; five seconds each, 100 seconds total. Selection metadata and attribution: `evaluation/audio/`. Selection was deterministic, not based on successful predictions. Some clips are alternate takes of the same original source, so they are not twenty independent environments.
- Chrome 145 headless on this Windows machine, MediaPipe WASM CPU, non-SIMD runtime. This is a desktop measurement, not a phone benchmark.
- Decode to mono 16 kHz; 15,600-sample windows; 7,680-sample hops. 9 full windows per clip, 180 inference calls. Clip endings shorter than a full window were not padded. Reset policy between clips.
- Use the shipped `SoundFilter`: score >=0.65, same winning group in two successive windows, 10-second per-group cooldown, three absent windows to rearm. Defaults were not calibrated using these clips and were not lowered after observing misses.
- Evaluate alert presence per whole clip against the dataset's dominant label. No hand-annotated event onset exists. Background secondary events are not exhaustively annotated.

## Measured results

| Quantity | Result |
|---|---:|
| Model bytes | 4,126,810 (3.94 MiB) |
| Used non-SIMD WASM bytes | 6,165,480, plus loader / worker JS |
| Local model/runtime initialization | 259.2 ms |
| Average synchronous model inference | 21.70 ms over 180 windows |
| Dog clips producing a correct dog alert | 1 / 2 |
| Baby-cry clips producing a correct baby alert | 0 / 2 |
| Missed positive clips | 3 / 4 |
| Negative clips producing any enabled alert | 0 / 16 |
| Alerts on any wrong enabled category | 0 in this small sample |

The sole detected dog clip alerted 2,917.4 ms after clip start, including its 0.975-second window duration and measured final inference. This is **not onset-to-alert latency** and is not an average across detected events. The earliest possible two-window decision is approximately 1.455 seconds plus inference, scheduling and capture overhead. Model loading adds startup time. Actual short/low-confidence sounds may never alert.

The 16 negatives are chainsaw, clock ticking, crackling fire, helicopter, rain, rooster, sea waves and sneezing (two clips each). Crackling fire is not labeled a smoke/fire alarm. Zero observed false positives over these clips cannot establish a field false-positive rate. The positive clip recall observed here is only 25%; it is not acceptable evidence for dependable emergency use. Do not present 521-class membership, or this screening, as a measured overall accuracy.

## Class reliability

Dog barking has one successful and one missed recording. Baby crying missed both. For smoke/fire alarms, sirens, horns, doorbells, knocks, ringing phones, shattering and shouting/screaming, **no representative positive evaluation was completed**; reliability, false-negative rates and suitable per-class thresholds remain unverified. No precision/recall extrapolation to those classes is justified.

## Complete browser capture test

`app/scripts/check-audio-browser.mjs` feeds the licensed dog recording through Chrome's test microphone into the genuine getUserMedia → AudioWorklet → MediaPipe worker → policy → Radar path. It produced a dog alert/history entry, verified Stop, then deliberately blocked the audio runtime and verified active microphone-level fallback. No external requests or non-GET requests were observed. Four viewport widths (360, 390, 768, 1280) had no horizontal overflow; no page errors were recorded. This is recorded-audio injection, **not a physical microphone test** and not synthetic model output.

OS-delivered notifications, physical vibration, mobile performance, Safari/Firefox, noisy rooms, varied microphones, background operation and actual emergency alarms have not been validated. The app stops capture when hidden; it is not an always-on/background alarm.

## Evidence and rerun

Detailed scores/timings: `docs/phase4/audio-evaluation.json`. Capture/fallback/network observations: `docs/phase4/browser-check.json`. Screenshots: `docs/phase4/`.

Build the app, serve its production preview on 127.0.0.1:4199, then run `node scripts/evaluate-audio.mjs` and `node scripts/check-audio-browser.mjs` from `app/`. Scripts use installed Chrome and Playwright; `PLAYWRIGHT_MODULE` can specify the absolute Playwright entry point. Keep evaluation WAV files outside `app/public` and `app/dist`.

## Required next evaluation

Collect rights-cleared positive examples for every enabled group and longer negative/background recordings across devices and rooms. Separate calibration data from final evaluation sources, annotate true event onsets, fix thresholds before final testing, report misses and false alerts per hour with uncertainty, and test short transients and overlapping sounds. Until then this is an experimental assistive feature with documented false negatives.
