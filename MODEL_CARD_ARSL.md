# ArSL letter model card

**Purpose:** experimental one-hand Arabic symbol classification for editable communication. Status: preserved, accuracy unverified.

**Architecture:** legacy ARSL v1 forest, 100 trees, 52,968 nodes; 63 inputs, 37 outputs. **Inputs:** MediaPipe 21 xyz hand landmarks in original raw image coordinates. No pose/face input or temporal word semantics. **Outputs:** winning label and tree-vote fraction, followed by threshold/stability/deduplication; not calibrated probability.

**Source/rights:** inherited `models/arsl-forest.bin` and labels. Original training dataset, signer identities and model redistribution provenance were not established. Preservation does not clear rights. Resolve ownership/permission before distributing a public model package. MediaPipe has separate Google licensing/notices; do not relicense the forest by association.

**Classes:** ء، آ، أ، ؤ، إ، ا، ال، ب، ة، ت، ث، ج، ح، خ، د، ذ، ر، ز، س، ش، ص، ض، ط، ظ، ع، غ، ف، ق، ك، ل، لا، م، ن، هـ، و، ى، ي.

**Evaluation:** binary/label/parser contracts, malformed vectors, stability and browser plumbing tested. No legitimate labelled live evaluation corpus. Accuracy, macro F1, per-class recall and signer-independent performance: **not measured**. Engineering Node forest traversal p50 0.0154 ms/p95 0.0192 ms is not browser or end-to-end recognition latency.

**Browser:** model 847,916 bytes, SHA-256 `29c89e7e6e8e39ba5fb6c63dd30f4e0bd58e117aa0a4e6093aa0644582b9cf5c`; additional hand task/runtime required. Phase 7 desktop first camera ready 3,112 ms; model resource read/verification 33.1 ms. No live-human/FPS claim.

**Limits:** raw-coordinate sensitivity, unknown original cohort, no trained open-set class, potentially confident errors, frame-count stability varies with FPS. Live human validation: **UNTESTED**.

**Appropriate use:** clearly labelled experimental demonstration with user-reviewed editable text. **Inappropriate use:** certified interpretation, clinical/emergency decisions, full Saudi sign-language translation or claims of measured accuracy. Details: `ARABIC_LETTER_MODEL_EVALUATION.md`, `ARSL_LIVE_VALIDATION.md`.
