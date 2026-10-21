# MAEEN Phase 2 extension — delta report

Completed local implementation and verification: **2026-10-21, Asia/Riyadh**. No restart, architecture replacement, dependency addition, deployment or remote repository change.

## 1. Baseline

Before editing, the existing audit, architecture, backlog, verification and Phase 2 evidence index were read. The existing translator was visually inspected; the original live MAEEN site was revisited. Baseline: **41 passing tests in 13 files** and a successful production build verifying ten original AI files. The emerald navigation, pale task surfaces and existing reusable components remain the design baseline.

## 2. Modified

- Translator has prominent Letters / Words choices with explicit selected state, plus Learn Signs. Camera work stops on mode changes; composed letters survive the switch.
- Letter result is larger and announced. The displayed character now requires the same 12 consecutive acceptable frames as automatic entry, and clears on uncertainty. Tree vote share remains explicitly distinct from accuracy/probability.
- Letter editing adds manual insertion of the currently stable detected letter, delete-last-character and real clipboard copy with actionable failure feedback. Automatic stable insertion, space, clear, editing and browser speech remain available. The UI explains that manual insertion repeats the displayed letter.
- Radar explicitly separates current measured microphone activity/level/listening/threshold events from unavailable classification, emergency identification, direction and distance/location.
- Navigation adds More Features, including six usable mobile destinations. New native disclosure controls share the existing 3px focus treatment.
- Arabic typography has an explicit system fallback token, including Arabic content inside English pages. No unlicensed/raw web font was introduced.

## 3. Preserved

Original deployment/model/runtime files remain unchanged, verified from the repository root. Existing MediaPipe task, forest/parser, label ordering, raw 63-coordinate contract, 100-tree inference, camera cancellation/cleanup, microphone RMS/dBFS and threshold history remain. All nine phrases, editing/search, shared speech controls, localization, preferences, error handling and prior mobile/hover fixes remain. The original 41 tests still pass; the existing navigation expectation was updated from five to the requested six destinations without removing its subpath/accessibility assertions.

## 4. Added

- Learn Signs: selectable gallery of the **exact 37 labels imported directly from the original JSON**, preserving variants and order. This is an inspectable label reference, **not a completed illustrated teaching resource**.
- Word workspace: camera area kept off, large empty result, empty history, disabled reset and speech controls, empty validated-vocabulary state and prominent unavailable model status. No arbitrary words, preset cycling or letter concatenation is presented as direct word recognition.
- Typed future temporal-model contract: sequential timestamped frames, handedness for both hands, upper-body/facial landmarks, frame-window and coordinate metadata, optional score semantics, cancellation/reset/disposal. No implementation, weights, training or vocabulary is provided.
- More Features: 17 capability entries, all 14 original everyday contexts, links to existing tools and two original public team telephone links. Telephone calls were not placed.

## 5. Capability status and unsupported work

**Arabic letter recognition: Unverified in this extension's live browser run.** The preserved functional pipeline was previously observed with real 960×720 frames in Phase 2 (historical evidence retained). This run reached genuine model initialization and the camera-permission waiting state but did not receive frames; switching to Words cancelled it. New visible stabilization is covered by a deterministic regression test. Signing correctness and accuracy remain unverified; no benchmark or accuracy figure is claimed.

**Arabic word recognition: UI Ready; inference Not Implemented.** No genuine word model exists in the inspected assets.

**Smart radar:** genuinely implemented microphone acquisition, digital time-domain RMS/dBFS, threshold control, rate-limited activity history, start/stop and signal-driven visualization. Earlier Phase 2 browser evidence includes real measured audio. This extension preserved that service and tested idle/history/error regressions and keyboard threshold controls; it did not establish a fresh physical audio session. No sound class, emergency identity, direction, calibrated SPL, distance or location is inferred.

| Original feature | Current extension state |
|---|---|
| Communication phrases and text display | Real: nine searchable/editable phrases |
| Arabic speech | Partial: actual browser synthesis; installed Arabic voice/platform dependent |
| Main camera/letter model | Real implementation; live extension capture and signing accuracy unverified |
| Radar and visible threshold alerts | Partial product: real signal meter/events, no environmental classifier |
| Accessibility/localization | Real controls; physical AT/device certification pending |
| Prayer times / Qibla | Future: no live times, countdown, fixed bearing or location claim |
| Watch / vitals / CarPlay | Future: no pairing, connection or readings |
| Consultation / complaint recording / SOS | Future: no call, recording, dispatch or delivery claim |
| Phone/doctor camera and torch | Future specialized workflows; link to genuine existing translator camera |
| Notifications / vibration | Partial: foreground visual states; device vibration/background scheduling not migrated |
| Speech/name detection | Future provider/privacy/dialect integration |
| Text-to-sign / avatar / signed media | Future verified linguistic media; original animation not treated as translation |
| Fourteen daily-life scenarios | Concepts preserved visibly; dedicated scenario content/services pending |
| Native mobile / PWA | Responsive web real; native apps and reliable offline reload unverified |
| Themes/share/guest name | Partial: current display preferences real; original customization not fully migrated |
| Developer cloud workspace | Future: no Firebase connection; owner-side auth/rules review pending |
| Original team/contact links | Public names and two telephone links retained; external actions not exercised |
| Original statistics/accreditation/privacy assertions | Unsupported claims not restored as product facts |

**Alphabet illustration blocker:** this request's attachment directory contains only its text request, not the referenced chart. No chart comparison or hand-pose illustration could be completed honestly. All 37 labels are visible, including hamza variants, ال, لا, ة, هـ, ى and ي; each still needs comparison with the supplied/authorized chart and Deaf-led review.

**Font blocker:** compliant static web embedding is not established under the official extraction/redistribution restrictions. Tahoma/Segoe UI/Arial remain temporary fallbacks. See [font decision and official sources](docs/FONT_DECISION.md). No font was downloaded or redistributed.

Offline reload remains unresolved from Phase 1/2. Physical NVDA/VoiceOver, Android/iOS, long capture sessions, signer evaluation and service integrations remain release work.

## 6–8. Automated verification

| Check | Before | After |
|---|---:|---:|
| Complete tests | 41 / 13 files | **52 / 15 files** |
| Production build | Passed | **Passed** |
| Original asset verification | 10 files | **10 unchanged files** |

Eleven added tests cover modes, composed-text preservation/edit/copy/refusal, all model labels, unsupported words, structural accessibility of Words/Learn/More, six-route navigation, bilingual original states, Arabic fallback/no font download, radar empty/history/current-vs-future states, stable display and cancellation of late camera permission results. Device fixtures are used only in automated lifecycle/error tests; no fake predictions are exposed in the app. Tests do not establish model accuracy. All implementation increments were built and tested; initial failing assertions were investigated and corrected before proceeding.

## 9–10. Browser and responsive verification

- Final production build served at **http://127.0.0.1:4192/Maeen/**. All navigation and lazy routes load beneath `/Maeen/`; bilingual settings reload preserved direction/preferences. This is local GitHub Pages-path verification, not deployment.
- **48 standard layout states passed:** six primary routes plus Words and Learn, at 375/768/1440px, both RTL Arabic and LTR English. No horizontal overflow, undersized active control heights or stacked mobile-header regression found. Mobile navigation targets exceed 44×44px.
- Seven additional task states at 375px with 18px root text and high contrast had no overflow or sampled contrast failures. Preferences persisted. A final-build reduced-motion check showed both radar rings with no transform and 0s transitions; ArrowRight changed threshold from -25 to -24 dBFS.
- Rendered text contrast samples found no failures; lowest sampled ratio across these checks was **5.37:1**. Disabled controls are excluded. This is not complete contrast/WCAG certification or a physical screen-reader evaluation.
- Enter activated Word mode and the prayer disclosure; final disclosure focus is **3px solid**. Native navigation/forms remain keyboard operable.
- Actual browser editing/copy: entered `بلا`, deleted the last character to `بل`, copied it and read back exactly `بل` from the browser clipboard. This was typed test text, not recognition output.
- Camera model/runtime initialization reached the permission-wait state. Switching modes cancelled it and returned Letters to stopped. Automated late-permission coverage confirms any stream granted after cancellation is stopped.

## 11–12. Screenshots and records

[Changed-screen screenshots and browser measurement files](docs/extension/README.md). No new home/communication screenshots were taken because their task designs were preserved. No live camera image was saved.

[VERIFICATION.md](VERIFICATION.md) now records this extension separately from historical Phase 2. Audit, architecture and backlog also carry additive extension updates. The local source remains reviewable and uncommitted, as before; nothing has been deployed or pushed.
