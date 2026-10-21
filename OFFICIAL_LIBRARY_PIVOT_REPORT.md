# Phase 3 official-library pivot report

2026-10-21. First-party recording is paused; its plans/code remain intact. Saudi Sign Language Library is now the **primary candidate**, not an authorized acquired dataset.

| Required status | Verified result |
|---|---|
| Official library count | **8,818 published terms / 36 categories**, corroborated by library and Association; not a deduplicated count of classes/takes |
| Ownership | Library identifies Saudi Hearing Disability Association as provider and copyright owner; underlying performer releases still need confirmation |
| Access | Public JavaScript search/category/term pages; one primary player per inspected term record. No media downloader or API probe implemented |
| Metadata | Titles, IDs, categories, English glosses, optional meanings/images and popularity metadata visible; **signer/session IDs unavailable** in inspected UI |
| Training permission | **NOT CONFIRMED** |
| Model redistribution | **NOT CONFIRMED** |
| Signer-disjoint evaluation possible now | **NO** with current metadata; request provider identities/groups and per-class coverage |
| Word training started | **NO** |
| Supported word classes | **0**; no genuine word weights exist |
| Dataset subset | **25 verified candidate records**, permission-request shortlist only; **0 acquired training recordings** |
| Metrics/model size/browser inference latency | Not measured/not available; no real training or model inference performed |
| Deployment | None |

## Delivered

- [SAUDI_SIGN_LIBRARY_AUDIT.md](SAUDI_SIGN_LIBRARY_AUDIT.md): count, ownership, media/sample metadata, sentence-builder distinction, access and eight-right permission matrix with official sources.
- [PERMISSION_REQUEST_AR.md](PERMISSION_REQUEST_AR.md): concise Arabic draft asking for defined subset access, landmark extraction, training/evaluation, competition demonstration, trained-model distribution/web use and separate commercial clarification. **Not sent**.
- [OFFICIAL_LIBRARY_MVP_VOCABULARY.md](OFFICIAL_LIBRARY_MVP_VOCABULARY.md): 25 confirmed record IDs, official titles/glosses, one primary player observed each. Signer, full visual QC, hand usage/motion and most durations remain explicitly unreviewed. Two browser-loaded metadata samples measured 3.72/3.84 seconds at 1920×1080; these are not library-wide properties.
- [DATA_SPLIT_FEASIBILITY.md](DATA_SPLIT_FEASIBILITY.md): independence blockers, provider/manual annotation options, session grouping and cautious clustering limits; no invented signers/splits.
- [Local staging adapter](training/OFFICIAL_LIBRARY_INGESTION.md): authorization scope/expiry/evidence and known provider signer/session gates; source provenance retained, no network code. [Current grant register](training/config/official-library-authorization.json) is explicitly **not-confirmed** with all rights false.
- Existing first-party source guard hardened so external media cannot be silently reclassified as first-party. Missing/unknown signer validation fails with a clear error.
- Word status localized to **Not Implemented / Data Access Required** and Arabic equivalent. No redesign or fake predictions; no supported count displayed.

## Verification

Fresh runs after code changes: **67 app tests in 20 files pass; 22 Python tests pass (original 18 plus 4 authorization tests); production build passes**, including strict TypeScript, 10 preserved AI assets and offline worker generation. Root tracked deployment assets/model files unchanged in Git comparison.

New tests cover absent/revoked/expired/missing-scope or missing-right grants, changed permission evidence, source preservation, signer partitions, unknown/guessed identities, URL/path escape and duplicate bytes. Temporary invented text fixtures test guards only; they are neither permission documents nor training videos. Existing detector/ONNX probes remain engineering checks with untrained models, not measured word quality. The legacy ONNX exporter still emits upstream warnings; no export/runtime migration was attempted.

Production preview at `http://127.0.0.1:4195/#translator` checked Arabic and English Word states. English DOM confirmed status text, zero video elements and no overflow at current desktop size. Screenshots: [Arabic](docs/phase3/data-access-required-ar.jpg), [English](docs/phase3/data-access-required-en.jpg). No new full responsive matrix or webcam signing test is claimed. Initial preview attempts used a nested `/Maeen/` path that this root-served preview does not serve; checking the correct root loaded normally. This is not a claim to fix the previously documented offline reload issue.

## Explicit remaining boundary

Permission, performer rights, licensed media delivery, authentic signer/session/take metadata, class/variant review, independent recordings and authorized negatives must come first. The staging adapter is ready for reviewed local delivery; **the main training/feature CLI still intentionally refuses official-library manifests**. Once the real licensed corpus is available, wire current-grant revalidation through extraction/features/train/calibration/test/export and test the actual provider schema. Existing extraction, temporal, model, metric and export components are preserved for this work. Do not bypass their first-party guards or synthesize consent/signers to force a run.

After acceptance, compare TCN/GRU/BiLSTM/compact ST-GCN with validation-only selection, locked signer-disjoint testing where genuinely possible, then measured browser runtime selection/integration. Permission or a checkpoint filename alone never enables Word Mode.
