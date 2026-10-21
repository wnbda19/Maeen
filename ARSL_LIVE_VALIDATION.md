# ArSL live validation — Phase 7

Status: **UNTESTED for live human accuracy**. No real signer session or legitimate labelled live sample set was available. The original forest, raw 63-feature preprocessing and 37 classes are preserved. Camera fixture operation is a pipeline check, not accuracy evidence.

Exact labels in original order: ء، آ، أ، ؤ، إ، ا، ال، ب، ة، ت، ث، ج، ح، خ، د، ذ، ر، ز، س، ش، ص، ض، ط، ظ، ع، غ، ف، ق، ك، ل، لا، م، ن، هـ، و، ى، ي.

Recognition success, per-letter confusion, missed hand detections, instability, live FPS and human onset-to-result latency remain **unmeasured**. No population-level accuracy is asserted. Phase 6 desktop startup timings are historical engineering evidence, not recognition latency.

For a future controlled session, obtain consent; use anonymous signer/session IDs; record expected class before each attempt. Use three attempts per class per condition, neutral intervals between attempts, both signing hands where linguistically appropriate, near/normal/far framing, well-lit/dim conditions and plain/cluttered backgrounds. Freeze thresholds before the final test. Log hand-detection availability, all timestamped model outputs, stable composition, rejection and end-to-end onset timestamps; retain failures and Unknown states. Report numerator/denominator per signer/class/condition, paired confusion counts, median/p95 latency and FPS. Separate exploratory tuning signers from held-out validation. Small convenience samples establish session success rates only.
