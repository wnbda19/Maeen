# Frozen signer-disjoint collection splits
2026-10-21. These codes are **planned anonymous allocations, not fabricated existing participants**. The real signer roster and evidence do not yet exist.

| Profile | Train signers | Validation signers | Test signers |
|---|---|---|---|
| reference25 | S001–S009 (9) | S010–S012 (3) | S013–S015 (3) |
| mvp15 | S001–S008 (8) | S009–S010 (2) | S011–S012 (2) |

Primary positive counts: train **3,375**, validation **1,125**, test **1,125** = **5,625**. Negatives: 90/30/30 =150. Fallback positives: **1,800/450/450** = **2,700**; negatives 80/20/20 =120.
Assign real participants to these anonymous codes with an independent custodian before capture, balancing male/female participation, dominant hand and experience where feasible. Freeze and record the allocation. Do not invent demographics or infer them from videos. Do not select the split from recognition results.

All sessions, terms, takes, crops, windows and derivatives of one real person stay in that person's partition. One person cannot enroll twice with different codes. Preserve source hashes and manually check near duplicates. Different sessions of the same signer do not qualify as unseen signers. Do not randomly split clips/frames.

The two profiles are alternatives with different split membership (e.g. S009). Never concatenate them or switch profile mid-campaign. Expansion to 20 signers requires a new frozen profile and a documented cohort allocation before training. The 25 official reference videos are in **no partition**.

Training uses only train signers. Choose architecture/epochs/thresholds from validation signers only. Do not decode test tensors during fitting/early stopping. Lock test once the candidate/policy is chosen. Changing model/protocol after seeing test results requires a new independent test cohort, not deleting the test lock.
Metrics: accuracy, macro precision/recall/F1, per-class precision/recall/F1/support, confusion matrix and common confusions; report positive vs No Sign/Unknown rejection behavior separately and by signer. Camera-stream temporal stability needs additional authorized held-out recordings, not only isolated clips.

Current counts: **0 real signers, 0 recordings, 0 features**. Signer-disjoint evaluation is planned and enforced in software, **not yet performed**. No accuracy/F1/latency/word-model size exists.
