> Current direction — 2026-10-21: First-party collection is PAUSED. The Saudi Sign Language Library is the primary research candidate; rights and data access are NOT CONFIRMED. This document is preserved as prior work. See SAUDI_SIGN_LIBRARY_AUDIT.md, DATA_SPLIT_FEASIBILITY.md and training/OFFICIAL_LIBRARY_INGESTION.md. No word training is authorized or underway.

# First-party Saudi sign MVP collection protocol

Version 1 draft, 2026-10-21. Training paused. Goal: a small, honestly evaluated isolated-word competition demonstration, not continuous translation or an emergency/medical service.

## Participants and sample budget

Recruit **12 adult proficient Saudi signers** if possible; acceptable planned alternatives are 10–15. Involve Deaf community members in recruitment and linguistic review. Seek varied signing styles, age bands, hand dominance, appearance and camera familiarity; do not infer identity or collect diagnoses. Participation is voluntary, with agreed compensation independent of consent to public footage.

- 15 target words × 20 genuine repetitions × 12 signers = **3,600 positive clips**.
- Per signer: 10 No Sign clips and 10 Unknown clips = **240 additional negative clips**.
- Total target: **3,840 independent recordings**, not copies/crops/frames counted as new samples.
- Two sessions per signer, preferably on different days; record 10 repetitions of each word in each session and five clips of each negative class. Allow roughly 45–60 minutes per session with instruction, breaks and QC; do not rush natural signing to achieve a quota.
- For 10 signers: 3,200 total clips; for 15: 4,800 total clips at the same plan. These are collection targets, not existing data.

## Exact capture protocol

1. Complete accessible consent, assign S001–S012 and store identity-to-code mapping separately. Record a short calibration clip for left/right hand identification and framing; it is **not a training word**.
2. Camera fixed on a tripod, landscape **1920×1080 preferred, 1280×720 acceptable, 30 FPS**, standard RGB MP4/H.264. No portrait rotation, beauty filters, virtual backgrounds, stabilization crop or mirrored saved video. Audio off. If device cannot disable audio, strip it locally before acceptance and document this; no audio is needed.
3. Start with the lens approximately upper-chest height, 1.5–2m away, directly in front, without upward/downward tilt. Adjust distance until the **entire head, face, shoulders, elbows, hands and upper hips** remain visible throughout the widest movement, with 10–15% margin. Never constrain natural sign location just to fit a tight crop.
4. Use a reviewed reference clip for meaning and regional form, then let the signer perform naturally. Hide the word prompt before recording; never place class text, instructor hands or word-specific props in the image. Shuffle word order in five-repetition blocks to avoid label/order/background shortcuts.
5. Each file contains **one complete target sign**: 0.75s neutral lead-in, the full natural sign (typically 1–4s), and 0.75s neutral return. Aim for 3–6s; allow up to 8s for genuine multi-movement forms, maximum 10s. No cuts, looping, time reversal or concatenated repeats. Label the complete sign's start/end for future boundary work.
6. Record each take independently. A correction creates a new take number; reviewers choose one accepted take for that repetition. Do not count rejected and replacement takes as additional repetitions.
7. One-hand signs remain one-hand; never invent a second hand. Two-hand signs must keep both wrists/fingers visible, including contact/crossing. Preserve anatomical left/right and true dominance. Verify task handedness against the calibration clip; no blanket horizontal flip or automatic relabelling based on preview appearance.
8. Keep the full face unobscured (eyes, eyebrows, mouth and chin), no sunglasses or face effects. Capture natural linguistically relevant expression without forcing exaggerated expressions. Upper-body motion is part of the sign; keep shoulders, elbows and upper hips in frame. For accommodation/occlusion cases, obtain reviewer guidance and record a limitation rather than manufacturing missing face features.

## Controlled diversity

Each signer records five repetitions per word in each of four conditions across two sessions: (A) soft daylight/plain background, (B) soft indoor light/plain background, (C) daylight/different uncluttered background, (D) indoor light/different uncluttered background. Clothing may vary by session. Avoid backlighting, strobe/flicker, extreme darkness or busy bystanders. Change camera distance modestly within valid framing; keep every word represented in every condition. Natural speed variation is allowed across genuine repetitions, without digital speed augmentation.

## Negative recordings

N000: neutral hands resting, hands outside signing space or no hands visible while the consenting signer/upper body remain framed. N001: real reviewed out-of-vocabulary signs and ordinary movements such as adjusting sleeves. Include transitions into/out of signing, not only carefully posed negatives. Use multiple negative types, balanced across conditions; do not label a target sign as Unknown. Plan five types × two repetitions per negative class per signer. Maintain a `negativeType` field; reserve some types exclusively for validation/test. These recordings never dispatch help or activate emergency responses.

## Split before recording or inspecting performance

Default 12 signers: **train S001–S008; validation S009–S010; test S011–S012**. Alternatives: 10 → 6/2/2, 15 → 9/3/3. Freeze one chosen allocation before processing; all sessions/takes/derivatives of a signer stay in that partition. Do not reuse a person under a new ID. Validation and test people must never appear in training. Reserve additional future signers for independent final demonstration if available. Test QC is permitted; test performance must not guide training, vocabulary or thresholds.

## Quality control and acceptance

Two reviewers: a Deaf/proficient linguistic reviewer and a technical reviewer. Verify intended meaning/regional variant, completeness/boundaries, natural articulation, both-hand visibility when required, facial expression, adequate framing/focus, no prompts or bystanders, correct signer/session/take, unmirrored saved image and active consent. Record reviewer codes and reasons, not personal names, in sample metadata.

Automated checks verify file integrity/duplicate SHA-256, filename and metadata consistency, consent, real-camera provenance declaration, signer allocation, decoding/FPS, monotonic timestamps, bounded duration and feature shape. Feature preparation requires temporal coverage ≥80%, visible shoulders in ≥90% of frames, face detections ≥80%, and hands ≥60% for words/Unknown; No Sign may have no hands. These are engineering QC defaults, **not validated recognition thresholds**. Review failed clips; re-record real samples rather than duplicating, synthesizing or filling landmarks. Hash checks cannot detect all near-duplicates; reviewers inspect bursts/alternate takes and source continuity.

## Storage and handoff

Use the structure and metadata in DATASET_SCHEMA.md. Keep raw media, consent receipts, identity mapping, landmarks and derived tensors private and outside public web assets. Grant named project roles only. Set a retention/deletion schedule before recruitment; follow CONSENT_REQUIREMENTS.md for withdrawal. Freeze a versioned manifest, signer split, class order and hashes after QC. Only then run extraction → shared feature preparation → audit → training. No optimizer step occurs as part of collection, installation or tests.
