# Environmental sound model research

Date: 2026-10-21. Scope: pretrained inference; no MAEEN audio training and no Phase 3 changes.

## Decision

Use Google's YAMNet classification TFLite model through MediaPipe Tasks Audio 0.10.32 in a browser worker. The [official MediaPipe guide](https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier) supplies the model and labels. Google's [YAMNet TFLite listing](https://www.kaggle.com/models/google/yamnet/tfLite) explicitly declares Apache 2.0. The downloaded model is 4,126,810 bytes; exact SHA-256, source, retrieval date and license declaration are in `audio-models/provenance.json`. License text and notice accompany the model. SDK package also declares Apache-2.0.

This is a small existing classifier, not a newly trained MAEEN model. No word/sign recordings are used. Distribution of the pretrained weights under Apache-2.0 does not grant rights to redistribute AudioSet's original videos; none are downloaded here.

## Alternatives assessed

| Candidate | Evidence | Fit / decision |
|---|---|---|
| YAMNet TFLite + MediaPipe | Official Google model listing and browser SDK; 521 output labels | Selected. Local PCM preprocessing and CPU inference; one model artifact and existing MediaPipe ecosystem. |
| YAMNet TensorFlow.js variation | [Official YAMNet model family](https://www.kaggle.com/models/google/yamnet) | Plausible browser alternative. Not downloaded or benchmarked here; no claim it is slower. Avoid adding a second runtime for this implementation. |
| PANNs AudioSet models | [Author's repository](https://github.com/qiuqiangkong/audioset_tagging_cnn) | Research alternative, PyTorch-oriented with larger checkpoints. Repository code license alone is insufficient evidence for every checkpoint's redistribution rights. Not selected, downloaded or performance-tested. |

Selection is based on deployability, explicit licensing and measured operation of YAMNet in this app, not a cross-model accuracy contest.

## Enabled alert groups

The shipped class map is checked automatically against `audio-models/labels.txt`. These ten UI groups map to **19 actual labels**, with the maximum score within each group (never summed overlapping probabilities):

| UI group | Exact pretrained labels |
|---|---|
| Smoke / fire alarm | Smoke detector, smoke alarm; Fire alarm |
| Emergency siren | Siren; Civil defense siren; Police car (siren); Ambulance (siren); Fire engine, fire truck (siren) |
| Vehicle horn | Vehicle horn, car horn, honking; Air horn, truck horn |
| Doorbell | Doorbell |
| Knocking | Knock |
| Telephone ringing | Telephone bell ringing; Ringtone |
| Shattering | Shatter |
| Baby crying | Baby cry, infant cry |
| Dog barking | Bark |
| Shouting / screaming | Shout; Children shouting; Screaming |

The generic `Glass` label is not treated as evidence of glass breaking. The siren UI deliberately groups related labels because subtype predictions do not prove the vehicle or emergency source. Scores are uncalibrated model confidence scores, not measured likelihoods of danger.

## Evaluation recordings and rights

Only 20 recordings marked `esc10=True` were selected, two per ESC-10 category, in source CSV order. The [dataset author explicitly licenses ESC-10 under CC BY](https://github.com/karolpiczak/ESC-50/blob/master/README.md). The full ESC-50 dataset has a different, noncommercial license and is not ingested wholesale.

Unmodified WAV clips, filenames, original source IDs, category metadata and the author's attribution/license ledger are under `evaluation/audio/`. They are development evaluation inputs, excluded from public assets/build output. The ledger records individual Freesound creators and licenses; credit Karol J. Piczak's ESC dataset and the individual creators listed there. No raw microphone recordings are saved by MAEEN.

## Limits

The [official model listing](https://www.kaggle.com/models/google/yamnet/tfLite) warns that outputs need task-specific calibration and that deployment audio can differ from training audio. Presence in the class list is therefore distinct from verified reliability. Alarm, siren, horn, doorbell, knocking, telephone, shattering and shouting reliability still require licensed real recordings and physical-device testing. No safety certification is claimed.
