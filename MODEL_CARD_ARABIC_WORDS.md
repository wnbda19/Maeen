# Arabic word model card

**MODEL STATUS: NOT TRAINED. Supported recognition words: 0.**

**Purpose:** future isolated Saudi/Arabic sign-term recognition. **Architecture:** scaffolding compares GRU/BiLSTM/TCN; no winning trained architecture or exported production weights. ST-GCN remains a research alternative, not an integrated model.

**Planned inputs:** temporal left/right hand, upper-body pose and selected facial landmarks with masks, body normalization and fixed sequence handling. **Planned outputs:** real trained class scores, Unknown/No Sign rejection and reviewed text. Current public Word Mode produces no word inference.

**Data/source/rights:** 25 verified Saudi Sign Language Library entries are linguistic links only, not training videos. No Association endorsement or training-media rights claimed. Controlled first-party recording requires explicit consent and Deaf linguistic/QC review. Target 25×15×15 = 5,625 positive recordings, plus 150 negative clips. Alternative minimum profile 15×12×15 = 2,700 positives plus 120 negatives. Profiles must not mix. Current accepted real recordings: zero at freeze; all positives still required.

**Evaluation plan:** frozen anonymous signer-disjoint train/validation/test, every session/derivative of a person in one split; tune only validation, lock test. Metrics scaffolding covers accuracy, macro precision/recall/F1, per-class F1 and confusion. No legitimate scores, model size or browser inference latency exist.

**Browser performance/live-human status:** inference unavailable; no human validation. Collector and extraction/export contract tests are engineering evidence, not model metrics. ONNX preparation exists; public model loading waits for trained, evaluated, authorized weights.

**Appropriate:** consent-aware data collection and reproducible research preparation. **Inappropriate:** claiming implemented word translation, assigning the 25 reference classes as supported words or fitting duplicated/synthetic reference footage. Details: collection protocol, schema, reference mapping and signer-split documents.
