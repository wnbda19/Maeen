> Current direction — 2026-10-21: First-party collection is PAUSED. The Saudi Sign Language Library is the primary research candidate; rights and data access are NOT CONFIRMED. This document is preserved as prior work. See SAUDI_SIGN_LIBRARY_AUDIT.md, DATA_SPLIT_FEASIBILITY.md and training/OFFICIAL_LIBRARY_INGESTION.md. No word training is authorized or underway.

# MAEEN first-party dataset schema

Draft v1, 2026-10-21. Canonical class/split/experiment sources are in `training/config/`. No real samples are included. Keep stable IDs and class order through training/export.

## Private folder layout

```text
data/
  raw/S001/C01/W006/S001_W006_C01_R03_T01.mp4
  raw/S001/C01/N000/S001_N000_C01_R01_T01.mp4
  raw/S001/C01/N001/S001_N001_C01_R01_T01.mp4
  calibration/S001/C01/                  # hand/framing calibration, not a word
  metadata/recordings.jsonl
  manifests/ingested-v1.json
  manifests/features-v1.json
  manifests/extraction.json
  landmarks/<clipId>.json
  features/<clipId>.f32
private-consents/                        # separate restricted store, never repo
  registry.json
  receipts/
  identity-map/
training/runs/<unique-run>/              # ignored; never app/public
  weights.pt
  run.json
  decision-policy.json
  test-results.json
  candidate.onnx
  candidate.parity.json
```

`training/data`, assets, runs, environment and caches are ignored by Git. Ignore rules do not secure external folders: protect the dataset/consent stores separately. Never put identifiable media or names in browser assets or public screenshots.

## Recording JSONL — one object per accepted/review-pending clip

```json
{"clipId":"S001_W006_C01_R03_T01","file":"raw/S001/C01/W006/S001_W006_C01_R03_T01.mp4","signerId":"S001","wordId":"W006","sessionId":"C01","repetition":3,"take":1,"consentRef":"C-S001-v1","captureType":"real-camera","mirrored":false,"condition":"indoor-plain","regionalVariant":"review-pending","dominantHand":"right","negativeType":null,"signStartMs":750,"signEndMs":2900,"qc":{"accepted":false,"languageReviewer":"","technicalReviewer":"","reason":"awaiting-review"}}
```

This is an unaccepted format example, not a recording or consent. Signer IDs: S plus three digits; sessions: C plus two digits; repetitions/takes 1–99. Positive IDs W001–W015, negative IDs N000/N001. Exact filename: `{signerId}_{wordId}_{sessionId}_R{repetition:02}_T{take:02}.mp4`. Decoder FPS/dimensions are measured, not assumed from metadata. Context fields preserve capture condition, dominant hand, regional variant, temporal boundaries and negative type for linguistic/technical review.

Ingestion checks active consent, accepted QC, nonempty reviewer codes, real-camera provenance declaration, unmirrored image, known classes/signers, path containment, filename consistency and unique SHA-256/clip ID across the entire dataset. Human review establishes signing correctness, identity-code consistency, permissions and near-duplicate detection; software cannot prove those declarations from pixels.

## Restricted consent registry

```json
[{"signerId":"S001","consentRef":"C-S001-v1","training":false,"modelDistribution":false,"withdrawn":false}]
```

Flags are deliberately false. A custodian updates them only from actual versioned evidence; the registry is not a signature. Store identities, contact details and signatures elsewhere. Missing/denied/withdrawn permission fails closed at every dataset-consuming CLI stage.

## Generated lineage and splits

Ingestion adds `source: first-party`, raw SHA-256 and `split` from the frozen signer assignment. Feature preparation adds feature file/hash, version, `[1,32,268]` shape, duration, temporal/hand/body/face coverage, extractor version and detector hashes. A person's sessions/takes/derivatives must stay in one partition. Each class must appear in train/validation/test. Training's basic readiness floor is five real samples per class per partition; this is **not** fulfillment of the planned 20 repetitions per word per signer. Review full collection counts before claiming completeness.

## Landmark interchange and temporal feature contract

Clip JSON: `schemaVersion: maeen-landmarks-v1`, source video hash, detector hashes, extractor version, decoded FPS, timestamp-fallback count and ordered frames. Each frame has finite strictly increasing `timestampMs`, actual `imageSize`, and these optional observations:

| Modality | Ordered points |
|---|---|
| left/right hands | Separate labelled entries, 21 xyz landmarks each; zero/one/two hands permitted |
| upper body | MediaPipe 11,12,13,14,15,16,23,24 (shoulders, elbows, wrists, hips) |
| face | 1,4,13,14,33,61,70,105,107,133,152,263,291,300,334,336,362 |

Missing modalities are empty arrays. Ambiguous duplicate handedness fails; verify task output against the left/right calibration recording. Visibility is optional 0–1. Facial selection includes eyes, lips, chin, nose and brows; this is a provisional MVP representation, not validated coverage of all nonmanual grammar.

`maeen-temporal-v1`: **67 points × [x,y,z,mask] = 268 features × 32 temporal steps**. Correct x/depth for image aspect ratio, then use clip-fixed shoulder origin/scale; retain movement relative to that origin. Rotation is off; reflection and left/right swapping are off. Resample by actual time, never bridge gaps >200ms or missing point observations. Missing xyz/mask are zero; fully hand-free sequences require explicit N000 preparation. Duration/coverage remain metadata. MediaPipe z values are modality-relative estimates (hand wrist, pose shoulder-adjusted, face nose-adjusted), not shared metric 3D coordinates.

The offline Node command imports the **same TypeScript normalizer** as the future browser consumer. Tensors are little-endian float32 `.f32` files with shape/hash in the feature index. Changing point order, normalization, frame conventions or length requires a new feature version and fresh training/export parity. No z values are fabricated for incompatible 2D public datasets.
