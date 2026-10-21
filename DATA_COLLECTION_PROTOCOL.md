# MAEEN controlled reference-based collection — v2
2026-10-21. Current direction: **first-party recording is active for preparation; official library videos are linguistic reference links only, never the training corpus.** No participants or recordings have been collected. Previous plans are archived in docs/phase3/history/.

## Exact scope
| Profile | Positive terms | Signers | Repetitions each | Positive target | Real negatives | Total |
|---|---:|---:|---:|---:|---:|---:|
| reference25 (primary) | 25 | 15 | 15 | **5,625** | 150 | **5,775** |
| mvp15 (fallback) | 15 | 12 | 15 | **2,700** | 120 | **2,820** |

Each signer contributes five No Sign and five Unknown clips in addition to positives. These are real rest/nonlexical movement and linguistically reviewed out-of-vocabulary signs, not corrupted/duplicated positives. Unknown evaluation also needs novel untrained signs/streams. Targets refer to **accepted independent recordings**, not attempts or extracted windows. A clip contains one complete target performance, including phrase targets. The exact 25 official terms/phrases are in OFFICIAL_REFERENCE_MAPPING.md and collection/profiles.json. No standalone لا/مرحبا/انتظر is invented.

Recruit 15 consenting adult proficient Saudi signers, with male and female participation if possible (aim roughly 7/8), a range of experience/age, and left/right dominant hands. A Deaf Saudi sign-language reviewer confirms meaning, regional variant and nonmanual features before collection. Do not infer gender or handedness from appearance. Demographics are optional and held separately, never names in filenames. Aim for representation in every signer partition, not gender-specific class assignments. Private recording arrangements and participant communication access must be offered. If only 12 people/less capacity are available, freeze mvp15 **before** recording; do not silently merge its incompatible split with reference25. A 12–20 signer expansion requires a newly versioned/reviewed profile.

## Recording procedure
1. Obtain written recording, landmark-processing, training and trained-model distribution consent; record its version/reference in the restricted registry. Browser checkbox is an operator attestation, not consent itself.
2. Assign anonymous S001… codes and freeze train/validation/test membership before recording. The same real person must never have two codes or appear in another profile partition.
3. Calibrate unmirrored anatomical left/right, framing and exposure. Use laptop/webcam on a fixed support, lens at upper chest/shoulder height, landscape 1080p preferred, at least 720p requested, 30fps. Import rejects <640×480 and FPS outside 15–120; that decoder floor is not permission to target low quality. No microphone/audio, filters, beauty effects, gloves or background blur.
4. View the official term link for practice **before** each group. Do not embed/re-record official playback, film another screen or include reference footage in any export. The trained language reviewer approves the performed variant; public availability is not an Association partnership/license.
5. Record 0.75s neutral → complete sign at natural speed → 0.75s neutral return. Duration **3–10 seconds** (typical 4–7). Keep full head/face, shoulders, elbows, both hands including their full range, and upper hips in frame, with margins. One-hand signs still capture both sides/body; do not force the unused hand into the lexical movement.
6. Three sessions per person, ideally on different days/rooms: C01 repetitions R01–R05, C02 R06–R10, C03 R11–R15. Repetition number is GLOBAL per signer/term; do not restart at R01 each session. New take T02… is a retake, never another repetition. Rest/reset between performances; randomize term order and take breaks.
7. Across 15 repetitions balance five conditions (bright-plain, soft-plain, bright-textured, soft-textured, alternate-room), three natural speeds (comfortable, slower-natural, brisk-natural) and three measured distances around 1.2/1.5/1.8m. Adjust distance to the person's reach and framing, not the reverse. Avoid glare, backlighting and genuine darkness. Do not tie one condition/performer exclusively to a class. Vary factors within sessions, not only between training/test.
8. Recommended repetition factor plan: condition cycles through five; speed cycles through three; distance uses a differently ordered cycle, with each distance occurring five times. Counterbalance condition order between signers. Operators record the actual settings in the tool; metadata does not prove the variation occurred.
9. Stop, replay, export the video and matching JSON to a private folder. Browser storage is temporary working storage; do not rely on it as the only copy.

Each full-profile session has 125 positive clips/person, roughly 25–45 minutes with setup/breaks. Plan 45 sessions total across about two weeks, with accessible recruitment/consent and separate QC time. The fallback uses 75 positives/session/person. Do not sacrifice sign quality to reach the count.

## QC and acceptance
Independent language and technical reviewers inspect full clips: correct term/variant, natural motion/nonmanual grammar; complete boundaries; correct IDs/consent; decode/FPS/duration; face/upper body and needed hands throughout movement; no other people, clipping, heavy occlusion or duplication. Reject/re-record, preserving attempt lineage. Accept **one take per signer/term/repetition slot** only. File hashes catch byte duplicates; humans must detect near duplicates and false provenance.
The importer validates real decoded duration against elapsed capture time. Landmark QC requires shoulders ≥90%, face ≥80%, hands ≥60% for positive/Unknown and valid temporal coverage ≥80%, with no interpolation across >200ms gaps. These engineering thresholds are provisional, not linguistic accuracy measures. Never accept a corrupted sign because it passes geometry thresholds.
Training additionally requires all planned accepted slots, three sessions, ≥3 conditions, ≥2 speeds and ≥2 measured distances for every positive signer/term cell; active consent and linguistic review remain mandatory.

## Current progress
Primary: **0 / 5,625 accepted positives**, **0 / 150 negatives**. Remaining: **5,625 positives + 150 negatives**.
Fallback: **0 / 2,700 accepted positives**, **0 / 120 negatives**.
Do not sum the two alternative profiles. Training is blocked. See RECORDING_GUIDE.md, CONSENT_REQUIREMENTS.md, DATASET_SCHEMA.md and TRAIN_VAL_TEST_SPLIT.md.
