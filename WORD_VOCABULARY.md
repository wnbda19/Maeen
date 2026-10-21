> Current collection v2: Official videos are reference links only. Controlled first-party preparation now targets the same 25 terms. See OFFICIAL_REFERENCE_MAPPING.md, DATA_COLLECTION_PROTOCOL.md and COLLECTION_TRAINING_WORKFLOW.md. The text below is historical. No real recordings or training yet.

> Current direction — 2026-10-21: First-party collection is PAUSED. The Saudi Sign Language Library is the primary research candidate; rights and data access are NOT CONFIRMED. This document is preserved as prior work. See SAUDI_SIGN_LIBRARY_AUDIT.md, DATA_SPLIT_FEASIBILITY.md and training/OFFICIAL_LIBRARY_INGESTION.md. No word training is authorized or underway.

# MAEEN first-party MVP vocabulary

2026-10-21. **15 proposed collection targets; 0 trained/supported words.** These are recommendations for new recordings, not verified classes from an acquired public dataset. The owner explicitly chose first-party collection after confirming no authorized word dataset exists. Do not advertise this list as working recognition.

| Stable ID | Arabic display | Meaning |
|---|---|---|
| W001 | نعم | yes |
| W002 | لا | no |
| W003 | مرحبا | hello |
| W004 | شكرا | thank you |
| W005 | مساعدة | help |
| W006 | ماء | water |
| W007 | طعام | food |
| W008 | أريد | want |
| W009 | أين | where |
| W010 | انتظر | wait |
| W011 | خطر | danger |
| W012 | مستشفى | hospital |
| W013 | طبيب | doctor |
| W014 | ألم | pain |
| W015 | شرطة | police |

These prioritize basic needs, conversation and asking for help. Danger/police/hospital are communication aids, never autonomous emergency decisions. السيارة / car and بيت / home are expansion candidates, **not additional current target classes**. Do not merge أريد with أحتاج or treat شرب as ماء: a label identifies a reviewed sign/gloss, not an arbitrary Arabic synonym.

Before recording, two proficient Saudi signers, including a Deaf reviewer, must agree on the regional form, exact intended meaning, hand use, start/end boundaries and relevant nonmanual features for each target. Create authorized reference clips with the same consent process. Record regional variants explicitly in metadata; do not teach signers a fabricated hand pose or normalize legitimate variants away. If a word needs multiple movements, keep its whole sequence. If a target is not suitable as an isolated sign, replace it **before** freezing version 1 and reserve its ID rather than silently changing its meaning.

Additional classes: **N000 = No Sign** (neutral/rest or hand-free intervals), **N001 = Unknown** (real non-vocabulary signs and ordinary unrelated movements). They are rejection classes, not supported words. Have reviewers select negative signs that are not synonyms/variants of target signs; use different negative sign types for validation/test to measure rejection beyond memorization.

The machine-readable source is `training/config/vocabulary.json`: review is pending, `supportedWords` is empty, and the UI remains Dataset Collection Required. A reviewer changes `linguisticReview` to `approved` only after the reference register is completed; that flag alone does not train or validate anything.
