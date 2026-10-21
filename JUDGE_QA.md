# Judge Q&A

**What is innovative?** The Arabic-first integration of sign-letter experiments, environmental sound awareness, accessible communication and offline local inference, with an independent-language registry and consent-aware Saudi data pipeline. We do not claim invention of MediaPipe/YAMNet or first-in-world novelty.

**Does Arabic word recognition work?** No. The model is NOT TRAINED. Collection, QC, temporal extraction, training/evaluation and export infrastructure exists; supported recognition words are zero.

**How accurate is Arabic letter recognition? Why omit accuracy?** It supports 37 model classes, but no legitimate labelled evaluation corpus or original signer provenance was available. A numerical claim would be fabricated. Parser and stability tests establish software contracts, not signing accuracy.

**What is ASL accuracy?** Separate-source static images: 431/683 correct when hands were detected (63.10%), 431/720 including detection failures (59.86%); macro F1 0.5844 on detected hands. No signer-independent or live-human evaluation. Several classes are weak, so it remains Experimental.

**Why no J/Z?** They require motion. A static landmark classifier cannot establish those temporal trajectories; we exclude them instead of pretending to recognize them.

**Why does KSL not work?** KSL is a separate language. No suitably authorized compatible model was integrated; visible research status is more honest than fabricated recognition.

**How reliable is Radar?** Genuine YAMNet inference works, but field reliability is unverified. Our small screening detected one of two dog clips and neither baby-cry clip. It produced no enabled alert in 16 negative clips, which is too little to establish a field false-positive rate. Other groups need representative positives.

**Could it replace a certified alarm?** No. It is supplementary experimental awareness; no emergency guarantee, background monitor or dispatch service exists.

**Do camera/audio data leave the device?** Application camera and YAMNet inference is local; no upload path was found. Collector video is intentionally stored locally and exported by the operator. Optional speech delegates text to the browser voice provider and may use its network service; we do not promise that provider is local.

**Why YAMNet?** An existing compact, licensed Apache-2.0 model supported by MediaPipe provides a practical local baseline. We chose deployability and measured operation, not an unsupported claim that it outperforms every alternative.

**What happens offline?** The shell and successfully downloaded, retained model/runtime files work offline with device permissions. Never-cached/corrupted files show recovery guidance; Radar can retain level mode. Browser speech and external references may still need connectivity.

**How is this different from existing apps?** We combine these tools and a Saudi-focused development workflow in one local-first accessible shell. We have not conducted an exhaustive competitive/novelty study and do not claim no alternatives exist.

**How will Saudi data be collected?** Human performances based on 25 official linguistic references, explicit consent, anonymous signer/session IDs, multiple conditions and Deaf/QC review. Primary target 25×15×15 = 5,625 positive clips plus negatives; no official reference videos as training corpus.

**How avoid leakage?** Freeze real-person membership across train/validation/test; keep every session, crop and temporal window of that person in one split, detect duplicates, tune only validation and lock final test. Signer-disjoint evaluation is planned, not already achieved.

**What would funding enable?** Deaf-led linguistic review and compensated consented recording, provenance/legal clearance, diverse device/sound testing, held-out evaluation and then measured model improvements—not presentation-only accuracy inflation.

**How scale to continuous signing?** First establish reliable isolated temporal recognition and rejection; then separately collect authorized continuous signing with alignment/nonmanual annotations and unseen signers. Grammar, coarticulation and translation require new evidence; spelling/isolated words are not a shortcut to fluent interpretation.

**What blocks release?** Unresolved inherited ArSL redistribution provenance, physical acceptance gaps, representative model validation and consented Saudi word data. The local candidate is not an authorized public deployment.
