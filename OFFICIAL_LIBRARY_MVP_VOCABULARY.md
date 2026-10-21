> Phase 3B follow-up: Public JSON and MP4 routes, all 25 durations/dimensions, and manual preview framing have now been inspected. See SAUDI_LIBRARY_POC_INGESTION_REPORT.md for current findings. This earlier investigation is preserved; no media-copying/training rights have been confirmed.

# Official-library competition MVP candidate vocabulary

Checked 2026-10-21. **25 confirmed public records, 0 trained/supported classes.** This is a permission-request shortlist, not a model vocabulary. First-party collection is paused. Titles/glosses below preserve official spelling, punctuation and transliteration; English glosses are not independent linguistic validation.

Each inspected record exposes one primary sign player. Related-record previews and the three snapshots of the same clip do not count as extra takes. Total independent takes and signer identities are unknown.

| Arabic official title | Official English gloss | ID / official record | Primary videos observed | Signer | Duration | Visual QC | Hand usage | Motion |
|---|---|---|---:|---|---|---|---|---|
| نعم | Yes (Bab Al-Din) | [972](https://sshi.sa/category/23/972) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| شكراً | ? Thank you | [5018](https://sshi.sa/category/14/5018) | 1 | Unknown | 3.72 s | Sample frame: face/upper body/hand visible, 1080p; full sequence unreviewed | Unannotated | Unannotated |
| مساعدة - مساندة | Assistance | [11081](https://sshi.sa/category/38/11081) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| أريد | I Want | [5078](https://sshi.sa/category/5/5078) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| ماء | Water | [9173](https://sshi.sa/category/35/9173) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| طبيب | Physician | [9533](https://sshi.sa/category/19/9533) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| مستشفى | Hospital | [5591](https://sshi.sa/category/13/5591) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| الم | Pain | [5476](https://sshi.sa/category/13/5476) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| خطر | Danger | [2023](https://sshi.sa/category/26/2023) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| شرطة | Police | [11211](https://sshi.sa/category/38/11211) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| سيارة | Car | [6515](https://sshi.sa/category/18/6515) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| بيت | House | [4586](https://sshi.sa/category/10/4586) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| أين | Ayna | [8425](https://sshi.sa/category/35/8425) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| أهلا | Hello | [10664](https://sshi.sa/category/38/10664) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| السلام عليكم | Hello | [4857](https://sshi.sa/category/14/4857) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| صباح الخير | Good morning | [4858](https://sshi.sa/category/14/4858) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| صباح النور | Good morning | [4859](https://sshi.sa/category/14/4859) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| مساء الخير | Good evening | [4863](https://sshi.sa/category/14/4863) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| وعليكم السلام | And may peace be upon you | [4864](https://sshi.sa/category/14/4864) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| هل أنت بخير ؟ | ?Are you well | [4872](https://sshi.sa/category/14/4872) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| أسرع لو سمحت | Hurry, please | [4874](https://sshi.sa/category/14/4874) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| لحظة من فضلك | one moment please | [4877](https://sshi.sa/category/14/4877) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| إسعاف | First Aid | [5463](https://sshi.sa/category/13/5463) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| عيادة | Clinic | [904](https://sshi.sa/category/13/904) | 1 | Unknown | Unmeasured | Not assessed | Unannotated | Unannotated |
| إعاقة سمعية | Hearing Impairment | [5469](https://sshi.sa/category/13/5469) | 1 | Unknown | 3.84 s | Sample frame: face/upper body/hand visible, 1080p; full sequence unreviewed | Unannotated | Unannotated |

## Semantic exclusions and review

- **لا**: public search prioritizes alphabet ligature #30 (`/category/1/30`). Its English “No” label does not establish a lexical negative sign. Excluded pending Deaf-led/provider review.
- **مرحبا**: no exact standalone title confirmed; **أهلا** #10664 (official gloss Hello) is the actual included title. Do not relabel another sign merely to match the requested text.
- **انتظر**: search returned a different phrase, not a confirmed wait sign. Excluded. **لحظة من فضلك** #4877 is included under its own phrase title, not declared a synonymous single word.
- **الم** is the actual title for #5476 (Pain); display/search normalization to ألم requires linguistic approval.
- Duplicate titles (نعم, أريد, طبيب, أين) must be reviewed for true variants/duplicate source files; selecting another ID is not an independent signer sample.
- Phrase classes remain phrases. Arabic grammatical words cannot be assumed to map one-to-one to signs.

## Acceptance before training

Obtain written subset rights, provider signer/session/take metadata, linguistic class/variant review, adequate independent samples per class in all signer partitions, and licensed real No Sign/out-of-vocabulary negatives. Annotate one/two hands, lexical motion, occlusion and facial requirements by reviewing full authorized clips. Null technical metadata is unknown, never a zero-duration sample. No copied/augmented positive or sentence-concatenated source may create fake repetitions.

See [audit](SAUDI_SIGN_LIBRARY_AUDIT.md), [split feasibility](DATA_SPLIT_FEASIBILITY.md), [permission request](PERMISSION_REQUEST_AR.md), and [inspection notes](docs/phase3/official-library-records.json). No media files accompany this shortlist.
