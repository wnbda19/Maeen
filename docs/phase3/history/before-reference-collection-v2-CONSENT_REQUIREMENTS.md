> Current direction — 2026-10-21: First-party collection is PAUSED. The Saudi Sign Language Library is the primary research candidate; rights and data access are NOT CONFIRMED. This document is preserved as prior work. See SAUDI_SIGN_LIBRARY_AUDIT.md, DATA_SPLIT_FEASIBILITY.md and training/OFFICIAL_LIBRARY_INGESTION.md. No word training is authorized or underway.

# First-party recording consent and data-use requirements

Operational collection requirements, 2026-10-21. No participant has consented through this document and no legal agreement is accepted by the software. The project owner must finalize an accessible Arabic notice and consent form, named data controller/contact, retention dates and applicable institutional/privacy review **before recruitment**.

Faces, bodies, signing style and landmarks may identify a person. S001 codes are **pseudonyms**, not proof of anonymization. Do not collect identity numbers, diagnoses, addresses or unrelated health information. Start with consenting adults; minors are outside this MVP protocol.

## Explain before asking for choices

Explain who controls the data; which words/actions are recorded; that videos include faces/hands/body; why temporal landmarks are extracted; where files are kept; who reviews them; how models are trained/evaluated; and the limits of a competition prototype. Explain foreseeable exposure risks and the difference between distributing model weights and publishing identifiable recordings. Make the explanation accessible through written Arabic and a competent sign-language communicator; allow questions and time, with no coercion or dependency on services.

Record separate, explicit choices for:

| Use | Minimum project choice |
|---|---|
| Recording and private storage | Specific permission required |
| Private human QC and landmark extraction | Specific permission required |
| Training and evaluating MAEEN models | Required for a training sample |
| Distributing trained weights/browser app, including intended future project/commercial use | Required **only for recordings admitted to this product-training corpus**; describe this scope clearly |
| Competition demonstration of the participant's actual identifiable footage | Optional separate permission; refusal must not imply refusal of all private participation |
| Public release of raw videos/landmarks or dataset redistribution | Default **no**; separate future agreement and rights review required |
| Re-contact or unrelated future research | Optional separate choice; default no |

If model distribution permission is declined, do not admit that recording to this product-training manifest. Do not treat a research-only consent as permission for a distributed app. A performer recording the reviewed sign must hold the necessary rights in the footage; instructors/reference creators also need appropriate permission. A public dataset license does not replace participant/media rights review.

## Records and withdrawal

Keep signed/accessible consent evidence and identity-to-code mapping in restricted storage outside the corpus and repository. The machine registry contains only signer ID, receipt reference, training/distribution flags and withdrawal state; it is a pointer to evidence, not a substitute signature. Maintain dated versions and correction/withdrawal history. The scripts recheck the current registry before ingestion, extraction, audit, training, evaluation and export.

Provide a clearly named contact and simple way to withdraw, pause future use, request correction or discuss deletion. On withdrawal, quarantine that signer's raw/derived data, remove it from future manifests, identify affected runs/checkpoints/exports from lineage and arrange retraining/removal as appropriate. Do not promise that all effects of already-distributed weights can be instantly reversed. Explain that limitation before consent and maintain a versioned revocation response process.

Restrict access by role, use approved protected storage and backups, log exports, and define a concrete retention/deletion date for device copies, raw media, derived features, consent evidence and trained artifacts. Determine permitted storage locations and any cross-border transfers before using a cloud service. Public hosting is not the default storage destination.

## Owner review basis

The notice, lawful basis, purpose limitation, retention, withdrawal and any international transfers need owner/institutional review against the applicable Saudi requirements. Primary references: [SDAIA's laws and regulations](https://sdaia.gov.sa/en/SDAIA/about/Pages/RegulationsAndPolicies.aspx) and [official PDPL text](https://sdaia.gov.sa/en/SDAIA/about/Documents/Personal%20Data%20English%20V2-23April2023-%20Reviewed-.pdf). This collection plan does not certify legal compliance or authorize collection without that review.
