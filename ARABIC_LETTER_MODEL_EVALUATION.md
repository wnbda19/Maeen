# Existing Arabic letter model evaluation

2026-10-21. **Implementation preserved; signing accuracy remains unverified.** No legitimate labelled recording corpus or original training/validation/test manifest exists in the inspected workspace. The owner has confirmed no authorized word corpus either; this does not establish unknown provenance of the letter model as a valid evaluation set.

## Asset and feature contract inspected

| Item | Observed |
|---|---|
| Forest | `models/arsl-forest.bin`, 847,916 bytes, ARSL v1 |
| SHA-256 | `29c89e7e6e8e39ba5fb6c63dd30f4e0bd58e117aa0a4e6093aa0644582b9cf5c` |
| Structure | 100 trees, 52,968 total nodes, 37 classes, 63 features |
| Features | 21 hand landmarks × xyz in original order; **raw** image coordinates |
| Hand task | 7,819,105 bytes; SHA-256 `fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1` |
| Runtime | Existing local hand task and SDK 0.10.32 browser adapter; one hand, GPU then CPU fallback |

Exact label order (never normalized/reordered):

`ء، آ، أ، ؤ، إ، ا، ال، ب، ة، ت، ث، ج، ح، خ، د، ذ، ر، ز، س، ش، ص، ض، ط، ظ، ع، غ، ف، ق، ك، ل، لا، م، ن، هـ، و، ى، ي`

The binary parser checks dimensions, classes, node bounds/cycles/reachability, truncated/trailing bytes and nonfinite features. Label metadata agrees with the binary. The retained model expects raw coordinates: applying the new body's temporal normalization to this forest would change its input distribution and is **not** an improvement. The word preprocessing is separate and never substituted for letter features.

## Confidence, stability and rejection

The reported score is the winning tree-vote fraction, not calibrated probability or measured accuracy. The model has no trained Unknown class; it votes among 37 labels even on unfamiliar inputs. UI rejection cannot guarantee detection of all confidently wrong/out-of-distribution signs.

- Keep the existing 0.55 vote threshold pending genuine validation; there is no evidence to claim another value is optimal.
- Display/automatic append require 12 consecutive acceptable matching frames. Low-vote or invalid outputs clear the visible candidate; a real missing-hand result is No Sign, a visible unaccepted candidate is Unknown/uncertain.
- New checks reject NaN/infinity/out-of-range scores and empty labels rather than counting them toward acceptance.
- Duplicate rearming now requires eight consecutive **missing-hand** observations; low-confidence flicker while the hand remains visible does not reappend the same letter. Deliberate hand removal still allows repetition. Different accepted letters can be appended normally.
- These are deterministic engineering safeguards, not measured signer-level smoothing gains. Frame-count duration varies with camera/inference FPS; calibrate time-based thresholds later from labelled streams before changing that contract.

## Measurements and unavailable results

| Requested measure | Result |
|---|---|
| Supported class count | **37** |
| Accuracy / per-letter accuracy | **Unverified / not measured** |
| Confusion matrix / common pairs | **Not available**, no labelled evaluation samples; no zero-filled matrix presented as evidence |
| Signer-independent accuracy | **Not established**; original training identities/split unknown |
| Camera FPS | **Not measured in this phase** |
| Live stability / false accepts / duplicate error rate | **Not measured on real signing**; mechanical contracts tested only |
| Forest traversal timing | Engineering microbenchmark only: Node 24.14.0, Intel i5-14400F; 10,000 timed traversals after 1,000 warmups over 128 deterministic unlabelled vectors. Recorded p50 ≈ **0.0154ms**, p95 ≈ **0.0192ms**. **Not browser/camera/MediaPipe/end-to-end latency.** |

Reproduce the contract/timing report from `app/`: `node scripts/evaluate-letters.mjs`. Raw results/environment/hashes: [docs/phase3/letter-contract-and-timing.json](docs/phase3/letter-contract-and-timing.json). Timing may vary with hardware/load. Engineering vectors never become training samples or recognition demonstrations.

## Genuine evaluation required

Collect consented, Deaf-reviewed recordings for every supported category, including uncertain/out-of-vocabulary gestures, neutral hands, repeated letters and transitions. Keep signers/sessions grouped, document regional form and exact labels, hold out signers where possible, and disclose that original training identity overlap cannot be disproved without provenance. Extract the unchanged hand-task/raw-xyz feature contract. Report per-class sample support/recall/precision/F1, macro scores, confusion counts, false accepts per minute and duplicate/transition errors. Measure detector+forest+filter latency separately from decoded/camera FPS on target browsers. Tune thresholds only on validation signers; do not use the external test cohort for tuning.

The new Python metrics module supplies accuracy, macro precision/recall/F1, per-class metrics, confusion matrix and common pairs for actual results; empty/malformed evaluations fail. No such results were generated for this model without real labelled samples. Original deployment/model/runtime files remain unchanged.
