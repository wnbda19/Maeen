# Consent and data use — controlled first-party collection
2026-10-21. These requirements prepare the collection; **no signed consents exist in the project**. A responsible data controller must approve the actual accessible Arabic agreement, storage location, retention period and withdrawal contact before recruiting. This document is not a signed consent or a certification of legal compliance.

## Explain accessibly before recording
Provide written Arabic and an accessible Saudi sign-language explanation, time for questions and a voluntary choice. Explain MAEEN, the competition, imperfect recognition and the recorded face/hands/body. Record adults only in this MVP. Participation is optional and withdrawal must not affect services. Seek Deaf-led language review; accommodate private arrangements and female participants' preferences. Do not coerce demographic disclosures.

Obtain separate explicit choices covering:
1. First-party webcam recording and private storage (no audio).
2. Extraction/storage of hand, pose and limited facial landmarks; these derived data are still personal/sensitive data, not guaranteed anonymous.
3. ML training and validation/testing with signer-disjoint partitions.
4. Distribution of trained model weights and operation in a public web application, explaining that learned information may persist and perfect removal from already distributed weights cannot be guaranteed.
5. Competition demonstration using the model. Showing the participant's raw face/video needs a separate optional demonstration permission; a model-use grant does not permit publishing footage.
6. Future commercial use, if intended, explicitly described or reserved for later consent; do not infer commercial permission from a competition grant.
7. Any sharing with named processors/research collaborators, export/hosting locations and safeguards. No external upload is configured in the recorder.

Specify controller identity/contact, purposes, recipient categories, private storage/access roles, security/backups, retention and deletion schedule, withdrawal route and response process, handling of previously trained/distributed models, data-subject rights and how to complain. The controller must fill these policy details before collection; no indefinite default retention.

## Evidence and separation
Store signed/versioned receipts and signer identity-code mapping separately from footage and the source repository. Register anonymous S###, consentRef and active permissions. The recorder's checkbox attests that staff checked evidence; it is not participant consent and cannot replace the receipt. New-schema imports require recording/training/modelDistribution:true and withdrawn:false. Every training CLI stage revalidates the registry and raw hashes.
Maintain access logs and restricted local encrypted storage/backups as chosen by the controller. Do not put names/signatures/contacts in filenames or public evidence screenshots. Use collection/private/ only as an ignored development location, not a security control. Browser IndexedDB is not a long-term secure archive; export to the approved private store and manage the browser profile/device under that policy.

## Withdrawal and provenance
Stop new capture/processing when consent is withdrawn. Mark registry withdrawn:true; quarantine affected media/features, recompute dataset indexes and review derived models/distribution obligations. No automatic destructive deletion is performed by this tool. Unchecking the recorder checkbox cancels current capture only, not already saved clips. Any retention/erasure action must follow the actual agreement.
Official sshi.sa videos remain links for linguistic reference, not copied/embedded training samples. First-party participant consent does not license the Association's videos, logo, endorsement or performers. Obtain separate permission for any such use. QC must reject screen recordings or copied library material even if someone falsely labels it first-party.

## Official governance references
Review applicable Saudi requirements with the controller before collecting identifiable videos/landmarks: [SDAIA data governance resources](https://dgp.sdaia.gov.sa/) and the current Personal Data Protection Law/implementing regulations. No claim is made that a checkbox or this scaffold by itself satisfies those obligations.
