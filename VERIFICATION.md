> Current collection v2 verification — 2026-10-21: 75 app tests, 32 Python tests, public production build and separate collector build pass. Internal recorder checked at 375/768/1440; no participant captured. Official links are references only. Collection progress is 0/5,625 positives (or 0/2,700 fallback), training blocked. See COLLECTION_IMPLEMENTATION_REPORT.md.

> Phase 3B final verification — 2026-10-21: 67 app tests, 26 Python tests, production build pass. Four new tests validate the frozen 25-record metadata dry run. No library videos downloaded, landmarked, tensorized or trained on. See SAUDI_LIBRARY_POC_INGESTION_REPORT.md for the distinction between technical access and legal/scientific readiness.

> Latest verification — official-library pivot, 2026-10-21: 67 app tests / 22 Python tests pass; production build passes. Arabic/English Data Access Required checked in the production preview. No training or deployment. See OFFICIAL_LIBRARY_PIVOT_REPORT.md. Earlier results below are historical.

# MAEEN implementation and verification record

## Phase 3 — first-party collection infrastructure, 2026-10-21

Owner directed training to remain paused because no authorized word corpus exists. Baseline rerun: **52 tests**, build passed. Current: **67 application tests / 20 files**, **18 Python infrastructure tests**, production build passed, ten original AI assets and root deployment files unchanged. Nothing deployed or pushed.

Added collection/consent/schema/Arabic recording/vocabulary documents; public-data rights research; letter contract/timing report; temporal extraction/normalization/gap/mask utilities; consent/leakage/duplicate checks; deterministic small-model training scaffold; validation-only rejection calibration; locked test scoring and private ONNX export/parity. Real detector startup/Unicode path handling and shared Node/Python feature files were verified with temporary **non-training** probes. No optimizer step or genuine word model exists.

Letters retain the real 37-class/raw-63-feature pipeline with stricter malformed-score/duplicate handling. **Letter accuracy, per-letter confusion and camera FPS remain unverified.** Words are explicitly **Not Implemented / Dataset Collection Required**, with zero supported words and 15 proposed collection targets. Six changed Word-state browser checks pass in Arabic/English at 375/768/1440; prior 48-state evidence remains historical. No real word webcam session, trained metrics or browser latency is claimed.

Full report: [PHASE3_REPORT.md](PHASE3_REPORT.md). Reproducible commands/limits: [training/README.md](training/README.md). Evidence: [docs/phase3/README.md](docs/phase3/README.md).

---

## Phase 2 extension — 2026-10-21 (Asia/Riyadh)

This extends the completed Phase 2 app. Baseline rerun before edits: **41 tests / 13 files passed**, production build passed. Final: **52 tests / 15 files passed**, production build passed, ten original AI assets verified. Original root deployment/model/runtime files remain unchanged. No dependencies added; nothing deployed or pushed.

Added prominent Letters/Words choices; stable displayed letter plus manual add/delete/copy; exact 37-label Learn Signs gallery; honest unavailable Word workspace and future temporal-model interface; More Features with original concepts/14 contexts; radar current/future distinction; six-item navigation and native disclosure focus. Existing design, sensor services, phrases, speech, preferences, localization and errors remain.

Final production browser: **48 responsive states** at 375/768/1440px in Arabic/English, six routes plus Words/Learn, no overflow or active target-height failures; mobile header remains a row. Seven additional large-text/high-contrast task states passed. Sampled text contrast found no failures (minimum 5.37:1). Enter operates native disclosures/Word mode; final disclosure outline is 3px solid. Actual browser editing/copy produced expected text. Local `/Maeen/` routes/reload work. Evidence: [docs/extension/README.md](docs/extension/README.md).

**Letters: Unverified in this extension's live run** (real pipeline previously observed working in Phase 2; this run stopped at camera-permission waiting). Signing accuracy remains unverified. **Words: UI Ready / recognition Not Implemented.** **Radar:** real RMS/dBFS, threshold/history/start-stop implementation preserved; no sound identity/direction/distance or calibrated SPL. No fresh physical audio session established here.

The alphabet chart was not attached, so pose artwork/chart matching remain unfinished. Compliant Thmanyah static web embedding was not established; the Arabic system fallback is used without font downloads. Unsupported original services are visible future integrations. Offline reload, physical AT/mobile evaluation and signer validation remain unfinished.

Full delta and limits: **[DELTA_REPORT.md](DELTA_REPORT.md)**. Font sources/decision: [docs/FONT_DECISION.md](docs/FONT_DECISION.md). Historical records below are retained separately.

---

## Phase 2 — integrated product redesign

Verified: 2026-10-20, Asia/Riyadh. The existing Phase 1 application was extended; it was not restarted. The original 21 tests were retained, and no new package dependencies or AI models were introduced.

### Implemented and preserved

- Five primary sections: Home, Sign translator, Smart radar, Communication and Settings. The previous about route and original heading contracts remain available.
- Emerald navigation, a pale task canvas, reusable SVG icons, consistent design tokens and typography, desktop navigation rail, tablet navigation and five-item mobile navigation.
- Home explains MAEEN's audience and real capabilities immediately, with prominent translator/radar access and a labelled hand illustration that is not a recognition result.
- The existing MediaPipe/ARSL classifier is connected to a large camera preview, real landmark overlay, detected-character and uncertainty states, model vote share, editable Arabic output and shared browser speech. Model loading, permission waiting, unsupported capture, denied permission, missing/busy devices and model failures have distinct feedback.
- Existing RMS/dBFS monitoring is connected to signal-driven radar rings, keyboard-operable sensitivity and measured session alerts. There is no rotating direction estimate, invented sound class or pre-filled history. Ring motion respects both operating-system and app preferences. Screen-reader announcements use session events rather than every level update.
- All nine phrases remain searchable in Arabic/English and selectable into an editable message, with pressed state, clear/search controls and shared speech controls. Text changes cancel speech cleanly; stale speech callbacks are ignored.
- Settings provides language/direction switching, persisted reduced motion, larger text and high contrast, current device lifecycle states, passive permission status and privacy guidance. It never starts a camera or microphone by opening the page.

### Automated checks

**41 tests passed in 13 files**, including every original Phase 1 test. Twenty added tests cover validated preferences, actionable device error mapping, settings/navigation/subpath behavior, device/model error UI, contrast, voice availability/platform errors and speech cancellation recovery.

Device-error UI tests use controlled capture/runtime adapters to exercise denied/missing/busy/unsupported and model-failure paths; their model fixture is the actual preserved forest. They do not generate recognition predictions. Existing model traversal and stabilization tests remain unchanged.

The structural axe checks include the original five views and the new Settings page. They execute in jsdom with layout-dependent color checks disabled; rendered contrast is checked separately below.

**Production build passed**, including strict production TypeScript checking, Vite compilation, worker generation and ten original asset copy comparisons. No new dependencies were added. All original tracked deployment/model/runtime files remain unchanged; preservation was checked from the repository root with `git diff --exit-code HEAD -- index.html assets models mediapipe _redirects`.

### Browser verification

| Check | Result and scope |
|---|---|
| Responsive layout | All five primary pages at **375, 768 and 1440px**, in Arabic RTL and English LTR: **30 combinations** with no horizontal overflow or undersized active touch targets found. Measurements are in `docs/phase2/responsive-ar.json` and `responsive-en.json`. |
| Larger text and high contrast | All five English pages at 375px with 18px root text and high contrast fit without horizontal overflow. Preferences survived reload. |
| Reduced motion | The app's saved reduced-motion setting produced **0s radar-ring transitions**. OS preference support is implemented through `matchMedia` and CSS; OS-level emulation was not independently exercised. |
| Keyboard | Sensitivity changed through arrow keys. Tab navigation showed a 3px visible focus outline on the next settings control. Native form controls and navigation remain keyboard operable. |
| Rendered contrast | Visible text sampling on all five English pages found minimum ratios from **5.55:1 to 6.12:1** in standard mode, with no sampled failures. High-contrast/large-text checks also passed. Measurement composes computed solid backgrounds and excludes disabled/hidden/decorative content; this is not a complete contrast or WCAG certification. Token tests separately require normal text >=4.5:1 and control boundaries >=3:1. |
| Communication | Searching `دواء` reduced the list to one phrase; selection populated the message; browser speech reported “Speaking text” then “Speech finished”; clearing reset the message. This verifies the API lifecycle, not subjective voice quality. |
| Microphone | A real browser capture session showed changing dBFS readings (including roughly -49 dBFS), created a threshold-crossing event from measured audio and returned to stopped on request. No identity, direction or calibrated SPL was generated. |
| Camera and inference | The local production build received **960×720 video frames**, initialized the actual MediaPipe task/forest, displayed live vote scores and uncertainty, and appended text through the stabilization pipeline. Stop released the preview and reset live status. These observations establish integration only; no intended sign was labelled or accuracy evaluated. No live camera image was saved in the gallery. |
| GitHub Pages path | The production build was served locally at `/Maeen/`. All navigation links retained that prefix; English settings survived reload; the camera task and runtime loaded from `/Maeen/models/` and `/Maeen/runtime/vision/`. No remote deployment was performed. |

Screenshots and measurement files: **`docs/phase2/README.md`**. The live radar screenshot contains actual browser measurements. Other camera screenshots show the idle interface, not fabricated recognition.

### Remaining issues and boundaries

- Recognition accuracy, unknown-gesture rejection and Saudi signing validity still need a labelled, signer-independent evaluation. A vote score is not an accuracy metric.
- Human NVDA/VoiceOver testing, physical Android/iOS testing, longer capture sessions, interruption/battery/thermal checks and subjective Arabic voice quality remain release work.
- The Phase 1 offline reload problem in the in-app browser remains unresolved. Phase 2 verifies online production reload and subpath operation, not offline readiness or installation/update reliability.
- No word model, ASL/KSL model, environmental classifier, physical sound direction, native Watch/CarPlay integration or medical/emergency backend was added. Future-model information is text only.
- The original deployment and AI files are preserved. Nothing has been deployed or pushed.

---

## Historical Phase 1 record

Updated: 2026-10-20, Asia/Riyadh. Baseline: `489670a`.

## Delivered

The audit deliverables are `FEATURE_AUDIT.md`, `ARCHITECTURE.md` and `IMPLEMENTATION_BACKLOG.md`. The public repository and all six commits contain deployment artifacts; original maintainable source was not found. Private source may still exist.

The reconstruction is in `app/`, alongside the existing deployment:

- React, TypeScript and Vite; five hash routes and reusable controls.
- Arabic/English localization, RTL/LTR, route focus, named form controls, keyboard access and reduced-motion CSS.
- Actual preserved Arabic forest inference, validated binary parser, 63-feature contract, 37 labels, 100 trees and score stabilization. Tree vote share is not an accuracy metric.
- MediaPipe hand task with the installed SDK's matching WASM runtime. Original runtime files remain preserved separately.
- Front/rear camera selection, real landmark overlay, editable letters, explicit stop/cancellation and browser speech.
- Local RMS/dBFS microphone meter, threshold and initially empty in-memory history. Direction and environmental class are not invented.
- Nine original Arabic phrases, searchable in Arabic/English, with display/edit and browser speech.
- Shared accessible status/error notifications; startup and lazy-load recovery messages.
- Scoped offline worker, build-consistent precaching and model/runtime cache versioning. Offline readiness is **not verified**; see below.

## Automated checks

`npm test`: **21 passed**, six files:

| Area | Checks |
|---|---|
| Forest | Real asset dimensions; truncation/label mismatch rejection; cyclic-edge rejection; nonfinite/wrong-size input rejection; parity with original traversal on eight deterministic vectors. These vectors are engineering tests, not a labelled accuracy benchmark. |
| Media lifecycle | Late permission results are stopped after cancellation; current stream is stopped once; permission errors propagate. Acquisition is replaced by controlled test streams. |
| Stabilization | Consecutive acceptable frames, repeated-letter rearming and rejection of low-score frames. |
| Audio signal | Full scale, half amplitude and silence produce expected dBFS values. No calibrated SPL claim. |
| Offline worker | Fresh precache requests, consistent installed HTML/chunks, application scope and exclusion of unrelated HTML documents. Runs the generated worker logic in a controlled worker harness. |
| UI/accessibility | All five routes have the expected heading and main focus; axe structural checks report no violations; English direction, Arabic phrase search/selection and editable clearing work. Uses jsdom. Color-contrast checks are disabled because this environment does not render layout; this is not WCAG certification. |

`npm run build`: **passed**, including strict production TypeScript checking, Vite build, ten original asset copy comparisons, and worker generation. Production source and tests are separate typecheck scopes; test files are executed by Vitest.

`npm audit`: **0 reported vulnerabilities** for the final lockfile. This is a dependency advisory check, not a security audit of the entire product.

All original tracked deployment files remain unchanged. `git diff --exit-code HEAD -- index.html assets models mediapipe _redirects` run from the repository root confirms preservation. `docs/AI_ASSET_MANIFEST.json` records the original AI asset byte lengths and SHA-256 digests.

## Browser checks

The in-app Chromium browser was used for both the baseline audit and reconstructed local production preview.

- Guest entry, dictionary search and translator/portal inspection on the baseline.
- New home, camera, microphone, communication and about navigation; Arabic and English text/direction.
- Search for `دواء` filters to the medicine phrase; selecting it populates the editable message.
- Speech reports that Arabic speech is unavailable in the test browser. Audible Arabic output was not verified.
- Actual MediaPipe WASM initialization was observed. Camera startup remained pending; Stop returned to idle. No live signing prediction or accuracy was verified.
- Microphone startup/cancellation controls were checked; real captured audio and level fidelity were not verified.
- At 320px width, Arabic home and English camera pages had no horizontal overflow. Home interactive target heights were at least 44px. Desktop layout was visually inspected.
- `docs/maeen-home.png` is the saved home preview. Responsive layout is not a native Android/iOS test.

## Offline failure and remaining investigation

Stopping the local server and reloading produced a blank JavaScript app in the in-app browser. The initial investigation found a possible cache-version mismatch and introduced failing regression tests, then fixed fresh installation, consistent shell serving and scope behavior.

The offline reload problem **still reproduced** after those fixes. A local diagnostic document confirmed an activated worker and all ten current shell entries cached, including the correct HTML, main script, lazy chunks and stylesheet. Correct HTML and CSS were present on reload, but application JavaScript did not start. The available tools do not expose the failed module-response path sufficiently to establish the remaining cause. It may involve this browser environment; that is an unconfirmed hypothesis, not a conclusion.

A visible bilingual startup/reload message now replaces the empty initial root in the delivered build. The full offline reload, model-cache operation and worker update cycle must be verified in normal Chrome/Edge, Android Chrome and iOS Safari before advertising offline support. The diagnostic fixture at `app/scripts/offline-probe.html` is not included in the normal build output.

## Unfinished and release gates

- Live camera/model acceptance tests with real Saudi signers and a documented labelled evaluation; no accuracy figures are available.
- Actual microphone, Arabic voices, front/rear devices, permission denial, background/foreground, track interruption, long-session battery/thermal tests.
- Complete accessibility review: rendered color contrast, keyboard-only workflows, NVDA/VoiceOver, zoom/reflow on every route and Deaf-led usability testing.
- PWA installation/offline/update validation, PNG/maskable iOS icons and deployment under the actual `/Maeen/` subpath.
- Existing themes, contact/share flows, browser vibration and additional dictionary content are not yet migrated into the reconstructed app. Their baseline files are preserved.
- No face/pose models, environmental sound classifier, physical sound-direction system, continuous sign/phrase translation, validated signed-video/avatar library, consultation/emergency backend, live prayer/qibla, Watch or CarPlay integration is delivered.
- Firebase owner-side authentication/rules review and data-flow/provenance/licensing review remain pending. The new app does not connect to the original Firebase workspace.
- No deployment or remote repository changes were made. The local source is ready for review; production readiness and full feature migration are not claimed.
