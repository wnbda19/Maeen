# Verified metrics ledger

Numbers are linked to their original scope; tests are not AI accuracy. **Physical testing: UNTESTED** throughout. Date: 21 October 2026. Phase 8 final run evidence is stored in `docs/phase8`.

| Quantity | Value | Evidence / scope |
|---|---|---|
| Phase 7 app / Python baseline | 125 / 36 passing | Full suites; regression counts only |
| Phase 8 final app / Python | 128 / 36 passing | Three new guide/accessibility tests; no accuracy claim |
| Responsive checks | 60 passing | Phase 7 browser layouts, six routes × two languages × five viewports |
| Production build | Passing at Phase 8 freeze | Local only; worker version 77f810db44ecf09a |
| Automated accessibility | 0 reported violations, 12 combinations | axe production Chrome; incomplete contrast/video checks remain; no certification |
| ArSL supported classes | 37 | Model/labels inspected; accuracy/F1 unmeasured |
| ASL classes | 24 static, J/Z excluded | Real MLP, no word model |
| ASL image result | 431/683 = 63.10% detected hands | Separate-source images, no signer-independent split |
| ASL end-to-end image result | 431/720 = 59.86% | Includes 37 missed hand detections |
| ASL macro F1 | 0.5844 on detected hands | `docs/phase5/asl-evaluation.json` |
| ASL artifact | 369,575 bytes | Runtime/hand task additional |
| ASL classifier only | mean 0.0332 ms, p95 0.100 ms | 1,000 calls on a real feature vector, excludes camera/MediaPipe/filter |
| YAMNet artifact | 4,126,810 bytes | Google Apache-2.0; extra runtime required |
| Radar screening | 20 clips / 100 sec / 180 windows | Some related takes; not independent field environments |
| Radar synchronous inference | mean 21.70 ms | Phase 4 180 windows, desktop WASM |
| Radar initialization | 259.2 ms | Phase 4 desktop; Phase 7 displayed 333 ms in another run |
| Radar correct/missed positives | dog 1/2; baby 0/2; 3/4 missed | Small screening; other groups unvalidated |
| Radar negative observations | 0 alerts in 16 clips | Not a field false-positive rate |
| Correct dog alert | 2,917.4 ms from clip start | Sole detected clip; not annotated onset or average latency |
| PWA | Chrome genuine install event, no normal-profile installability errors | Browser verified, OS installation/launch untested |
| Offline | Shell, ArSL, ASL, Radar after warm downloads | Connections blocked, cache retained; cold/corrupt failure tested |
| FCP | 348 ms | Phase 7 separate localhost production audit |
| Camera ready | ArSL 3,112 ms; ASL 475 ms | Sequential desktop, shared runtime warm for ASL |
| Model resource read | ArSL 33.1 ms; ASL 22.7 ms | Includes transfer/verification; not full initialization |
| Stability | 60 checkpoints / 328.812 sec | 30 camera + 30 Radar cycles; zero active tracks/workers/contexts on exit |
| Collected JS heap | 4,984,336 → 6,240,268 bytes | +1.20 MiB; unresolved long-duration trend, not leak-free proof |

Unmeasured: live-human ArSL/ASL accuracy, human onset latency/FPS, word metrics/model size, KSL metrics, physical alarm reliability, field false alerts/hour, mobile benchmark and app time-to-interactive. No substitute numbers are supplied.

Phase 8 final-build regression also observed a real fixture miss: YAMNet/microphone ran but no dog-history entry appeared within 15 seconds. Evidence: `docs/phase8/radar-miss-attempt.json`. This is retained alongside any repeat-run outcome; it is not a new field false-negative rate and no thresholds were changed to make it pass.

The unchanged repeat completed the offline/cache/update checks successfully. Final engineering checks: 128 app tests, 36 Python tests, 60 responsive layouts, 12 default axe route/language scans without reported violations, six expanded guide/layout/axe checks without remaining violations/advisories or guide-induced model requests. Expanded checking found and then verified correction of inherited label-in-name issues; these are not new AI accuracy results.

Sources: `ARABIC_LETTER_MODEL_EVALUATION.md`, `PHASE5_IMPLEMENTATION.md`, `SOUND_MODEL_EVALUATION.md`, `STABILITY_REPORT.md`, `ACCESSIBILITY_VALIDATION.md`, corresponding raw phase directories. Never compare percentages across unrelated source designs as language rankings.
