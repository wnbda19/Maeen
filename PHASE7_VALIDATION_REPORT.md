# MAEEN Phase 7 validation

Date: 21 October 2026. User chose **browser checks only**. Overall status: **PARTIAL**. No physical device, human signer, room-sound, NVDA or VoiceOver result is claimed. Nothing deployed; no model retrained or replaced.

| Feature | Status | Test method | Result | Limitation |
|---|---|---|---|---|
| Physical PWA installation/reopening | UNTESTED | None | No OS installation claimed | Browser-only scope |
| Standalone | PARTIAL | Manifest/CDP | Standalone configured | Installed OS launch untested |
| Offline shell and AI | PARTIAL | Production Chrome, virtual devices, server connection refusal | Warm shell/model paths exercised | Retained cache/permissions required; physical installed reopening untested |
| ArSL | PARTIAL | Asset preservation, real inference plumbing | Original 37-class model retained | Live success/confusion/FPS unmeasured |
| ASL | PARTIAL | Recorded B input, real inference | 24 static letters, Experimental | J/Z unsupported; no live or signer-independent accuracy |
| Arabic words | UNTESTED | Infrastructure preservation | Waiting for genuine multi-signer recordings | No trained word model |
| KSL | UNTESTED | Registry/source review | Research-only state preserved | No model |
| Radar recognition | PARTIAL | Recorded dog fixture, actual YAMNet | Local path and fallback exercised | Field classes unvalidated; inherited false negatives remain |
| Visual alert/history/cooldown | PARTIAL | Browser fixture and existing policy tests | Browser/software delivery checked | Human perceptibility untested |
| Notification and vibration | PARTIAL | Permission/adapter failure tests, API/source review | Opt-in and failure handling retained | Physical delivery UNTESTED |
| Accessibility | PARTIAL | Browser axe, keyboard trace, source/screenshot review | Zero automated violations on 12 route/language combinations; text/reflow checks passed | No screen reader/conformance certification |
| Privacy | PARTIAL | Source and route network inspection | No camera/audio upload path or analytics observed | Speech provider and OS services outside verified boundary |
| Security | PARTIAL | npm registry, pattern/source/cache review | Zero known npm advisories; no selected secret-pattern matches | Not a penetration test or full Python vulnerability audit |
| Mobile orientation/permissions | PARTIAL | Resized browser and virtual/denied devices | Browser checks only | Hardware lenses, rotation and app interruption untested |
| Stability | PARTIAL | 30 camera plus 30 Radar cycles, 328.8 seconds | No live tracks/workers/AudioContexts at checkpoints | JS heap grew about 1.20 MiB; long-duration trend unresolved |
| Network/device failures | PARTIAL | Browser denial, unit errors, worker fault injection | Actionable rejection/fallback; interrupted download not cached | Many hardware faults simulated; field interruptions untested |

## Hardening change

Found and reproduced silently swallowed service-worker update-check failures. Added one regression test that failed before the fix, then surfaced a bilingual recovery message while retaining the current application. Successful subsequent update checks clear that state. No model, collection or product design changes were needed.

## Scientific status

ArSL live accuracy, per-class confusion, live human latency and FPS remain unmeasured. ASL retains earlier cross-source image screening around 60–63%; it is not new live evidence. All live validation metrics remain UNTESTED. Radar's earlier screening detected one of two dog clips and zero of two baby-cry clips, with no enabled alerts in 16 negative clips. These are small recorded-sample observations, not field rates. Smoke/fire alarms, sirens, horns, doorbells, knocking, ringing phones, shattering and shouting/screaming have no new positive physical validation. No false-negative problem was hidden or threshold tuned to pass fixtures.

## Regression and preservation

App tests: **124 before → 125 after**. Python: **36 before → 36 after** (32 collection/training plus four Phase 5). Production build passes, worker version `a25dc61762739472`. All **60 responsive checks passed**. The preservation comparison still contains only the three intentional Radar changes already documented in Phase 6; no additional protected model/collector/training files changed. Fault injection rejects interrupted model bodies without caching partial bytes, retains the previous shell when an install fails, and recovers after reconnecting.

See `STABILITY_REPORT.md` for measured cycle duration/resources and fresh performance; `ACCESSIBILITY_VALIDATION.md`, `PRIVACY.md`, `SECURITY_REVIEW.md`, `ARSL_LIVE_VALIDATION.md`, `ASL_LIVE_VALIDATION.md` and `SMART_RADAR_REAL_WORLD_VALIDATION.md` for methods and remaining work. Evidence is indexed in `docs/phase7/README.md`.

**Deployment: NO.** Physical acceptance and representative human/audio validation remain outstanding; this phase does not establish production safety or universal WCAG conformance.
