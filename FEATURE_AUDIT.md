# MAEEN feature audit

## Extension re-audit — 2026-10-21

The original live page was revisited before this extension. Its translator, mobile portals, radar, prayer/Qibla, watch, car, doctor, dictionary, notifications, scenarios and public team links remain the product reference. Simulated claims are not restored as facts. Historical classifications below remain evidence of the original deployment.

The completed Phase 2 app now has More Features for 17 real/partial/future capability groups and all 14 everyday contexts. Working tools link to their actual pages. There are no invented connections, GPS bearings, prayer times, vitals, sound angles or dispatch status.

Letters controls are implemented with stable display and clipboard; live capture in this run is unverified pending permission (prior Phase 2 pipeline evidence retained). Words UI Ready, recognition Not Implemented. Learn Signs exposes the exact 37 original JSON labels; pose art/chart comparison are Missing because no chart was attached. Compliant Thmanyah static embedding is unestablished; system fallback retained. Actual microphone RMS/dBFS remains the radar capability, not environmental recognition. See [DELTA_REPORT.md](DELTA_REPORT.md) for the complete current mapping and limits.

---

Audit date: 2026-10-19 (Asia/Riyadh). Baseline: public `main` commit `489670a`.
Sources: https://dromarll.github.io/Maeen/ and https://github.com/dromarll/Maeen .

## Evidence and limits

Inspected all 14 tracked deployment files, all six commits and the only fetched branch (`main`). No package manifest, lockfile, original TS/TSX, source maps, tests, training code or deployment workflow was found in public history. This does not establish that private original source does not exist. The 1.17M-character minified React bundle is deployment evidence, not maintainable source.

Live browser inspection covered guest entry, main navigation, translator modes, dictionary search (دواء reduced nine entries to one), Deaf/visitor/doctor/prayer/car portals and their displayed controls. Portal camera attempt displayed “Unable to play media”; stopping restored its button. Physical sign recognition, microphone fidelity, speech audibility, vibration, real mobile devices and assistive technology were not verified. “Working” below is limited to the stated evidence, never model accuracy. No cloud writes, developer sign-in, emergency calls or contact messages were performed.

## Feature inventory

| Feature | Classification | Evidence / limitation |
|---|---|---|
| Arabic RTL landing, anchor navigation, branding, contact links | Working | Live page renders; six section anchors and tel/WhatsApp links exist. External contact actions not exercised. |
| Guest welcome / local name | Working | Guest entry closes prompt; bundle uses localStorage. Not authentication. |
| Themes and mobile/tablet/desktop presentation | Partially Working | State-based theme classes and device simulator layouts; real viewport/device coverage pending. |
| Share/link overlay | Partially Working | UI and copy/share handlers present; clipboard/platform sharing not verified. |
| Main translator camera start/stop/switch | Partially Working | Real getUserMedia, video, cleanup and error states in Ap; hardware session not verified. |
| Hand landmarks | Partially Working | MediaPipe HandLandmarker VIDEO, one hand, GPU then CPU fallback, local task/WASM; physical inference pending. |
| Arabic alphabet inference | Partially Working | Real binary forest, 63 features, 37 classes, 100 trees; not sentence/sign-language translation. |
| Letter stabilization / sentence buffer | Partially Working | 12 consistent frames, vote >=0.55, 8 missing frames to rearm repeat; no labelled evaluation. Low-score frames count toward stability. |
| Phrase choices / dictionary | Working | Nine manually authored phrase entries; search verified. Linguistic validity/accreditation not evidenced. |
| Text-to-sign / 3D hand / sign video | UI Only | Animated SVG hand and finite phrase matching; no validated linguistic generation or signed-video assets. |
| Arabic speech playback | Partially Working | Browser SpeechSynthesisUtterance, not Gemini despite UI claim. Installed Arabic voices determine output. |
| Phone Deaf/doctor camera recognition | Broken | Separate camera preview does not call the forest pipeline; capture cycles phrase index after timeout. Permission catch marks camera active. |
| 14 daily-life contexts | UI Only | Scenario navigation and canned phrases (clinic, restaurant, airport, bank, emergency, pharmacy, shopping, university, fuel, mosque, hotel, rail, government, police). No external service transactions. |
| Doctor video consultation / complaint recording | UI Only | Timed UI transitions; no RTCPeerConnection or recording pipeline found. |
| Flashlight | UI Only | Visual state; no verified camera torch constraint integration. |
| Microphone acquisition / activity meter | Partially Working | Real analyser reads frequency bins. Displayed dB is arbitrary `28 + average/128*75`, not calibrated SPL. Catch marks radar active on failure. |
| Sound direction radar | Broken | Bundle offset ~540993 selects front/right/left/behind using Math.random. No direction sensor or microphone array processing. |
| Environmental sound recognition | Missing | No sound classifier/model. Arabic speech keyword checks cannot identify acoustic doorbell/siren events. |
| Speech/name detection | Partially Working | Browser SpeechRecognition ar-SA, fixed Ahmad/name keywords; availability/privacy vary by browser. Errors swallowed. |
| Radar history / test alerts | UI Only | Starts with fabricated patient/doorbell events; manual triggers insert fixed dB/directions. |
| Watch connection / vitals | UI Only | “BLE connected” and watch readouts without Bluetooth integration. Browser vibration is not watch pairing. |
| Vibration patterns | Partially Working | navigator.vibrate patterns; physical support unverified. Visual alternatives needed. |
| CarPlay and vehicle detection | UI Only | Car-styled web panel, timed alerts; no native entitlement or connection. |
| Prayer schedule / qibla / GPS | UI Only | Fixed prayer times/countdown and 248°; no geolocation call or prayer calculation/API found. |
| SOS / emergency integration | UI Only | UI alert simulation; no evidenced dispatch service. Never imply assistance was contacted. |
| Developer cloud workspace | Partially Working | Firebase client + Firestore read/listen/write handlers. Hardcoded client-side password gate is not authorization. Server rules inaccessible; not tested by writing. |
| Privacy/security claims | Broken | “local encryption”, accreditation and verified Firestore rules lack evidence; cloud SDK initialized and Google Fonts loaded. Local inference alone does not establish entire-app privacy. |
| Face/pose recognition | Missing | Generic SDK contains classes, but no corresponding task assets or application integration. |
| PWA installation/offline/background alerts | Missing | No manifest or app service worker. Firebase SDK service-worker helpers are not an offline implementation. |
| English localization | Missing | Arabic content hardcoded. |
| Production accessibility | Partially Working | RTL and some named buttons exist; clickable scenario/dictionary containers, unlabeled inputs, no evidenced dialog focus containment, animation and flash risks. Formal WCAG audit pending. |

## Model and inference inspection

`models/arsl-forest.bin` is 847,916 bytes. Header magic ARSL; version 1; 63 features; 37 classes; 100 trees; raw coordinate mode. Labels agree: 37 entries including ء/آ/أ/ؤ/إ, ال/لا, ة/هـ/ى/ي. Do not normalize or reorder them.

Format recovered from bundle: 28-byte header, each tree starts with uint32 node count, then 16-byte little-endian nodes: int16 feature, int16 leaf class, float32 threshold, int32 left, int32 right. Child indices are tree-relative. Each tree votes for one class; maximum vote fraction is a score, not calibrated probability or measured accuracy.

Pipeline: fetch model + labels → load MediaPipe runtime/task → camera frame → 21 normalized hand landmarks → flatten x,y,z into 63 raw coordinates → traverse forest → stabilize → append label → optional browser speech. Wrist-relative code exists but current model explicitly uses raw coordinates. No face, pose or temporal phrase model is connected.

`hand_landmarker.task`: 7,819,105 bytes. WASM distribution includes SIMD, no-SIMD and module variants, approximately 12.6–13.5 MB each; `one` is a two-byte non-runtime file. Version/SDK pairing must be verified, not assumed from names. No model licence, data provenance, held-out evaluation, subgroup metrics or Saudi signing validation supplied. No accuracy claim is justified.

## Critical priorities

1. Remove invented direction, calibrated dB, live histories, connection states and recognition claims from the reconstructed experience.
2. Preserve original assets and deployment as a baseline; obtain original source if privately available.
3. Isolate and validate forest parsing, input contract and sensor cleanup.
4. Test with Saudi Deaf signers and labelled data before promoting recognition beyond experimental letters.
5. Verify Firebase rules/authentication with owner access before retaining any cloud workspace.

See IMPLEMENTATION_BACKLOG.md for acceptance criteria and ARCHITECTURE.md for migration boundaries.
