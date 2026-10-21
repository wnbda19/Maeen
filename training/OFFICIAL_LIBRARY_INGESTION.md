# Authorized official-library adapter

2026-10-21. Current authorization is **not-confirmed**, no library recordings exist locally, no training has started. This adapter has **no network/download functionality**. Do not fill permission flags from public availability or a verbal assurance. A project owner must review an authentic written Association grant and performer/data-use rights first. Software cannot authenticate a legal grant from a JSON flag.

## Staging boundary

The first-party infrastructure is retained. `maeen_data.official` adds local-only authorization-aware **staging**, reusing safe paths, hashes, duplicate checks and signer partition validation. It preserves `source: saudi-sign-library`, term IDs/URLs and authorization evidence hash. The first-party ingester now rejects other sources instead of relabeling them first-party.

The existing first-party training/feature CLI deliberately **still rejects official-library staged manifests**. Staging does not enable training. After a real grant/corpus exists, add grant revalidation to each extraction/feature/training/evaluation/export stage, lock an approved library-specific vocabulary and signer map, and test that current rights/source hashes survive each handoff. Do not remove source guards or synthesize first-party consent entries to bypass them. The existing hand/pose/face extractor, shared temporal normalizer, four models, metrics, rejection calibration and ONNX parity functions are reusable once that licensed-corpus adapter is accepted.

## Future local schema

Store private grant evidence separately from public repository content. The grant register uses the fields in `config/official-library-authorization.json`. `evidenceFile` must be inside the private dataset root; `evidenceSha256` pins actual reviewed document bytes. `expiresOn` is an explicit expiry/review deadline. `termIds` is an enumerated set, not a wildcard. All seven MVP rights must be explicitly true to stage; `commercialUse` is independent and defaults false. Changes/expiry/revocation require stopping processing and reviewing affected artifacts. No grant is present in the project.

Metadata JSONL, **after authorized delivery only**, requires:

| Field | Requirement |
|---|---|
| `source` | Output always `saudi-sign-library`; never first-party |
| `clipId` | Unique ASCII letters/digits/underscore/hyphen, ≤100 characters |
| `file` | Dataset-relative local `.mp4`; absolute paths/symlink escapes prohibited |
| `officialTermId`, `officialUrl` | Licensed numeric term ID and exact HTTPS `sshi.sa/category/<category>/<id>` record |
| `wordId` | Approved internal class ID in a **future library-specific** vocabulary file |
| `signerId` | Anonymous S### based on real provider metadata; globally unique per actual performer |
| `signerEvidence` | `association-metadata`; visual guesses not accepted in this strict staging path |
| `sessionId`, `sessionEvidence` | Actual recording-session group and `association-metadata`; do not invent sessions |
| `captureType`, `mirrored` | `real-camera`, false; confirm from provider/calibration |
| `qc` | accepted true plus technicalReviewer and languageReviewer codes after actual review |

Output adds real `sha256`, signer `split`, `authorizationSha256`, `authorizationExpiresOn`, and `commercialUseAuthorized`. SHA duplication prevents identical files being counted across classes/signers. All vocabulary classes must exist in all three signer partitions. IDs alone do not certify people; human/provider metadata review remains required. No current subset meets these acceptance gates.

## Command after permission and data acceptance

From training/, with private local paths and a library-specific vocabulary/split file:

```powershell
.\.venv\Scripts\python.exe -m maeen_data.official --root C:/private/maeen-official --metadata C:/private/maeen-official/metadata.jsonl --authorization C:/private/maeen-official/grant.json --splits C:/private/maeen-official/splits.json --vocabulary C:/private/maeen-official/vocabulary.json --output C:/private/maeen-official/staged.json
```

The vocabulary uses `proposedWords:[{id,...}]` and `negativeClasses` like the existing schema. **Do not use the first-party 15-word register as the official 25-term mapping.** No automatic mapping/merge is provided while licensing and sign variants are unresolved. Negative classes also require authorized original samples; failure to obtain them blocks complete recognition acceptance.

The four new tests use temporary text fixtures with `.mp4` names purely to test rights/hash/partition guards. They do not test video quality, decode, train, or represent any library sample or real permission. Existing real-detector/temporal/export plumbing tests remain separate.
