> Phase 3B follow-up: Public JSON and MP4 routes, all 25 durations/dimensions, and manual preview framing have now been inspected. See SAUDI_LIBRARY_POC_INGESTION_REPORT.md for current findings. This earlier investigation is preserved; no media-copying/training rights have been confirmed.

# Official-library split feasibility

2026-10-21. Source: [library](https://sshi.sa/), bounded [term audit](SAUDI_SIGN_LIBRARY_AUDIT.md).

**Signer metadata: UNAVAILABLE in the inspected public records. Signer-disjoint train/validation/test possible now: NO.** This means not demonstrable with currently accessible metadata, not that the Association necessarily lacks it.

The displayed 8,818 terms are vocabulary inventory, not independent training observations. One visible primary clip per selected record does not supply repetitions across signers. If each class has one clip from one presenter, no valid three-way class-complete signer split can be constructed. Random frames, crops, duplicated clips, snapshots, speed variants and concatenated library sentences must stay in the original source group; they are never independent observations.

## Request before a split is designed

Request pseudonymous signer IDs, original session/take IDs, recording dates or session groups, source-video IDs, aliases/duplicate mappings, class/variant definitions, frame rate, raw duration and performer releases covering training and model distribution. Request counts for every **class × signer × session** cell, plus real No Sign/out-of-vocabulary footage. No public identity/name is needed. Resolve handedness and whether files are mirrored.

With genuine IDs, assign whole signers to train/validation/test before extraction; group all their sessions/variants/derived clips together. Select class coverage feasible in all three sets; freeze the mapping. Prefer multiple test signers and report per-signer/per-class support and uncertainty. Existing S001… codes and signer-overlap checks can be reused; do not reuse the previous planned 8/2/2 allocations as if they describe library performers.

## If metadata cannot be supplied

| Option | Use / limitation |
|---|---|
| Provider-assisted manual annotation | Preferred fallback after authorization. Assign anonymous person codes and record confidence; ambiguous matches remain grouped or excluded. Independent reviewers reconcile mappings. Provider confirmation is stronger than appearance alone |
| Recording-session grouping | Prevents same-session leakage; cannot establish unseen people when one person spans sessions. Label results **session-disjoint**, never signer-independent |
| Signer clustering | Exploratory after explicit rights/privacy review only. Clothing/background clusters identify production conditions, not people. Appearance/biometric similarity can be wrong; no identity names or automated independence claim. Manual/provider audit required |
| External licensed signer cohort | Needed if library has insufficient signers/takes. Request additional Association recordings or revisit first-party collection only with owner approval; it is currently paused |
| Source-clip holdout | An engineering test only if enough original recordings exist. Report source-clip-disjoint and signer unknown. Single-example classes cannot legitimately appear independently in every partition |

No split file has been populated with invented library signers. No metrics exist. The new local staging adapter requires Association-supplied signer/session provenance; it deliberately rejects visual guesses and missing IDs. Main training remains blocked for this source until corpus acceptance and rights revalidation are integrated. Validation thresholds/model selection use validation only; lock test until selection ends. Evaluate Unknown and No Sign with authorized real negatives; never manufacture them from duplicated positive clips.
