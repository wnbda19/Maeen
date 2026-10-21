# Smart Radar model card

**Purpose/status:** experimental awareness of selected environmental sounds; not a certified alarm. **Architecture/source:** Google YAMNet MobileNet-family AudioSet classifier, TFLite through MediaPipe Tasks Audio 0.10.32 CPU WASM worker. Pretrained 521 labels; ten UI groups map to 19 actual labels, not 521 tested capabilities.

**Inputs:** live mono audio resampled to 16 kHz; 15,600 samples/window, 7,680-sample hop. **Outputs:** scores mapped by maximum within group, threshold ≥0.65, two consecutive windows, ten-second group cooldown and three absent windows to rearm. Visual event/history with optional notification/vibration. Single microphone does not determine distance/direction.

**Enabled groups:** smoke/fire alarm, emergency siren, horn, doorbell, knock, phone ringing, shattering, baby cry, barking, shout/scream. See exact labels in `SOUND_MODEL_RESEARCH.md`.

**Rights:** Google pretrained model/SDK Apache-2.0 per preserved provenance, license and notices in `audio-models`. This does not license original AudioSet video redistribution. Evaluation uses attributed CC BY ESC-10 clips, outside the public bundle.

**Measured evaluation:** 20 five-second real clips, 180 full windows; fixed deployed policy. Dog alert 1/2, baby cry 0/2; three missed positives out of four. Zero enabled alerts in 16 negative clips; not a field false-positive rate. Some takes share source context. Sole correct alert at 2,917.4 ms from clip start, not annotated onset. Other enabled groups lack representative positive evaluation. Average synchronous inference 21.70 ms across 180 windows; initialization 259.2 ms in Phase 4 desktop run. Phase 7 UI reported load 333 ms/last inference 47 ms, a different bounded run rather than a new average.

**Size:** 4,126,810 bytes; SHA-256 `4d8b4a53282dc83ef04e3e7dbc4fbc98082e34e44ed798e16c3a0cdd4c584faf`; non-SIMD runtime additionally 6,165,480 bytes plus JS. Lazy-loaded, verified offline cache.

**Live physical validation: UNTESTED.** Virtual microphone with licensed dog recording verified genuine browser inference, not room performance. Noise, distance, overlap, short events, hardware and confidence calibration remain weak/unmeasured. Page hiding stops capture; no background protection.

**Appropriate:** supplementary experimental visual awareness. **Inappropriate:** safety-critical reliance, certified alarm replacement, emergency dispatch or acoustic localization. Evidence: `SOUND_MODEL_EVALUATION.md`, `SMART_RADAR_REAL_WORLD_VALIDATION.md`.
