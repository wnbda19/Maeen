# ASL static-letter model card

**Purpose/status:** Experimental ASL fingerspelling handshape classifier, independent of ArSL. **Architecture:** 63 → 128 ReLU → 64 ReLU → 24 logits; original MAEEN dense weights executed in browser JavaScript.

**Inputs:** 21 xyz landmarks, wrist translation, middle-MCP scale, handedness reflection; orientation preserved. **Outputs:** A B C D E F G H I K L M N O P Q R S T U V W X Y; J/Z absent. EMA 0.4, threshold 0.70, margin 0.15 and shared stabilization/deduplication. Scores do not guarantee correctness; Unknown is heuristic.

**Source/rights:** Ayush Thakur American Sign Language Dataset v1, publisher-declared CC0. After hash deduplication, 1,675 selected images; 963 detected-hand samples trained. Separate Dan Rasband ASL Alphabet Test v1, publisher-declared CC0. License evidence archived in `docs/phase5`. Publisher declarations do not independently establish every participant's consent history. Weights are MAEEN work under project ownership; no general project license is inferred from CC0 data. See `sign-models/asl-static/NOTICE.md`.

**Evaluation:** fixed training seed/configuration, separate-source test images not optimized on; no signer IDs or signer-disjoint train/validation/test. 431/683 detected-hand samples correct (**63.10%**); 431/720 including detector misses (**59.86%**); macro F1 on detected hands **0.5844**. Detector missed 37/720. These denominators must accompany percentages. T recall zero; several other letters weak. No live-human accuracy measurement.

**Browser:** 369,575-byte JSON model, version `1.0.0-experimental`, SHA-256 `82443cb9faecdbcbfe5815ab672ba6753ab03dad902757b8a6b466264f40ec8e`. Phase 5 classifier-only mean 0.0332 ms/p95 0.100 ms over 1,000 feature-vector calls; excludes tracking/stability. Phase 7 warmed shared-runtime camera ready 475 ms; first model resource read 22.7 ms. Fixture B composition is pipeline evidence, not live accuracy.

**Limitations:** very uneven data (three detected T training examples), framing/detector sensitivity, no temporal J/Z, words/grammar/nonmanuals/continuous signing unsupported. **Live human validation: UNTESTED**; signer-independent accuracy absent.

**Appropriate:** transparent experimental static-letter demo, reviewed text. **Inappropriate:** general ASL translation, interpreter replacement or comparison to unrelated datasets/models. Evidence: `ASL_MODEL_RESEARCH.md`, `docs/phase5/asl-evaluation.json`, `ASL_LIVE_VALIDATION.md`.
