# Controlled collection schema — maeen-collection-v2
2026-10-21. **First-party recordings; official links are references only.** Previous schema/plans archived in docs/phase3/history/. Frozen configuration: collection/profiles.json; training/config/vocabulary.reference25.json and vocabulary.mvp15.json; matching splits files.

## Identity, classes and profiles
W101–W125 map to the same 25 official records in OFFICIAL_REFERENCE_MAPPING.md. The 15-term profile uses the first 14 plus W123. N000 = real No Sign; N001 = reviewed real Unknown. This namespace deliberately avoids silently reusing W001–W015 from the earlier draft, where meanings differed. Legacy configurations remain preserved but are not current CLI defaults.
S### is an anonymous real-person code, C## an actual session; global repetition 1–15 for positives, 1–5 for negatives, take 1–99. profileId is reference25 or mvp15. Never mix their roots/split policies.

## Browser sidecar (not an example recording)
Required fields: schemaVersion, profileId, signerId, sessionId, wordId, repetition, take, clipId, file, consent (operator flag), consentRef, source:first-party, captureType:real-camera, mirrored:false, createdAt (capture time), mimeType, durationSeconds, durationMethod:monotonic-clock, condition, speed, distanceMetres, officialTermId, officialReference, qc.
Positive officialTermId/reference must match the mapping; negatives have null references. No signer name, contact, gender inference, signature or official media bytes appear in sidecars. Official URLs do not confer data rights.
Filename: `{signerId}_{wordId}_{sessionId}_R{rep:02}_T{take:02}.webm` or .mp4, matching the actual encoding. Relative file: raw/S001/C01/W101/S001_W101_C01_R01_T01.webm.
QC starts accepted:false, empty reviewer codes and a reason. Browser progress counts unique profile/signer/term/global-repetition slots, not number of takes.

## Private layout
```text
exports/                       # original local video + matching <clipId>.json
maeen-reference25/
  raw/S001/C01/W101/<clipId>.webm
  metadata/recordings.jsonl
  manifests/accepted.jsonl
  manifests/ingested.json
  landmarks/<clipId>.json
  features/<clipId>.f32
  manifests/features.json
  progress.json
maeen-consents/                 # separate restricted store
  registry.json
  receipts/
  identity-map/
```
Use a separate root for mvp15. Repository-local private data belongs only under ignored collection/private/ or training/data/; never app/public/. Ignoring Git is not encryption or access control.

Importer adds source SHA-256 and decoded {frames,fps,durationSeconds,width,height}; resets QC to pending. It rejects missing consent, reference footage declarations, changed hashes, duplicate bytes used as repetitions, bad names/path escape, out-of-profile IDs, invalid conditions and elapsed/decoded disagreement >0.6s. Full decoded length must be 3–10.25 seconds (small stop-callback tolerance); recording target remains 3–10. FPS 15–120, decoder floor 640×480; protocol targets 1080p/30fps. No fake 3D data or silent video conversion. Main ingestion accepts genuine WebM/MP4 and checks v2 recording consent/decoded duration at every CLI revalidation.

## Consent registry
Each actual signed-evidence entry must include signerId, consentRef, recording:true, training:true, modelDistribution:true, withdrawn:false. Other choices (public raw-media demonstration, commercial scope, retention) belong in the private consent agreement/register. A JSON flag cannot create consent; default missing/false denies processing. Public demonstration of a person's raw video requires separate permission.

## Features and lineage
Existing maeen-landmarks-v1: source hash, detector hashes/version, actual dimensions/timestamps/FPS, timestamp-fallback count and per-frame left/right 21-point hands, upper-body 8-point pose and selected 17 face points. Missing points/modalities have explicit masks. Existing shared maeen-temporal-v1: **32 steps × 268 float32 values**, xyz+mask for 67 points. Clip-fixed shoulder origin/scale and aspect correction preserve movement; no hand swapping, reflection or time reversal. Do not bridge missing modalities/gaps >200ms. No Sign can be hand-free explicitly.
Preparation imports the actual browser TypeScript normalizer. It writes little-endian .f32 with shape/hash, temporal/body/face/hand coverage and task/source lineage in the feature index. Native/browser detector version parity and anatomical handedness still need checks on genuine recordings.
Accepted slots require unique real independent performances. Count audit does not replace consent, linguistic approval, source/feature integrity, class coverage, frozen signer splits, real negative streams or held-out evaluation.
