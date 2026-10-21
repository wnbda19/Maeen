# Proposed ASL word MVP — research only

**No ASL word model exists in MAEEN. None of these terms is advertised as supported.**

The following glosses were verified against the author's public [WLASL v0.3 metadata](https://github.com/dxli94/WLASL/blob/master/start_kit/WLASL_v0.3.json) on 2026-10-21. Counts describe references in metadata, not downloaded or independently verified videos. WLASL's [official license statement](https://github.com/dxli94/WLASL#license) prohibits commercial use; public/model distribution clearance is not established for MAEEN. No media or pretrained weights were downloaded and no word training began.

| ASL gloss | Referenced instances | Distinct signer IDs in metadata |
|---|---:|---:|
| help | 22 | 15 |
| no | 22 | 18 |
| yes | 22 | 17 |
| doctor | 19 | 14 |
| wait | 18 | 16 |
| water | 18 | 15 |
| police | 16 | 13 |
| house | 15 | 14 |
| where | 15 | 15 |
| thank you | 14 | 11 |
| car | 13 | 12 |
| hello | 13 | 13 |
| hospital | 13 | 13 |
| food | 12 | 12 |
| pain | 10 | 9 |

This is a 15-class / 242-reference candidate, not a training-ready corpus. Check sources, rights, consent, variants, sign boundaries and signer identifiers after authorization. Use actual signer/source/session groups for train/validation/test; require class coverage in all three partitions. Do not treat multiple camera views or crops as independent signers. If data coverage is inadequate, reduce scope or obtain consented first-party ASL recordings rather than duplicate examples.

Future model requirements: temporal windows with separate left/right hands, upper-body pose, visibility/missing-hand masks and relevant nonmanual facial features. Normalize using a documented ASL-specific configuration, not the Arabic alphabet's raw-coordinate convention. Compare small GRU/TCN baselines, preserve ordering, reject no-sign/unknown windows, and evaluate accuracy/macro F1/per-class F1/confusion, calibrated rejection and real browser latency on held-out signers. A small ONNX/TFJS adapter can later be registered independently; the current registry deliberately has no word model URL or vocabulary for ASL.
