# MAEEN technical architecture — release candidate

React 19, TypeScript, Vite; relative production assets and scoped `/Maeen/` manifest/service worker. `app/src/app` owns routing, preferences and interface language. Route components are lazy. The optional competition guide contains navigation and facts only; it cannot supply predictions. UI language and sign language are independent.

## Sign recognition

Camera → local MediaPipe hand detector → independent model registry → ArSL raw-landmark forest **or** ASL normalized-landmark MLP → confidence/Unknown/No Sign → stability/deduplication → editable text → optional browser speech.

Current alphabet pipelines use **one hand only**, not pose/face; do not imply those features are already used for live alphabet recognition. Registry entries define capabilities, labels, preprocessing, versions, attribution and evaluation. KSL has no model; Arabic/ASL words have no connected model. Requests start only when a supported camera mode starts. Switching language stops capture, aborts pending requests, disposes adapters and clears composition/evidence. Camera and Radar use separate lifecycles and stop on navigation/hidden-page/interruption/update shutdown. No automatic background monitoring.

## Future word pipeline: model NOT TRAINED

Consent-gated internal collector → local IndexedDB recordings and intentional export → metadata/duration/hash and linguistic QC → authorized hand/pose/relevant-face extraction → missing-point masks and normalized temporal sequences → signer-disjoint train/validation/test → GRU/BiLSTM/TCN comparison and evaluation → ONNX export/validation → **future** browser inference.

Collector, Python extraction/training/evaluation and export scaffolding exist; the final training/data and public word model do not. Official library references guide human signing only. All derivatives of one signer remain in one partition. No reference-media scraping/training is authorized.

## Environmental sound

Microphone → AudioContext/AudioWorklet → mono 16 kHz windows → worker MediaPipe/YAMNet → maximum-score category mapping → threshold and consecutive-window stability → cooldown/rearming → visual event/history → opt-in browser notification/vibration.

Fallback uses microphone level if AI cannot load. No random bearing/distance. Runtime/model initialization is lazy; microphone audio stays in memory. Physical alerts and field accuracy remain unvalidated.

## PWA

Application → single scoped service-worker registration → build-hashed shell cache + SHA-256 model/runtime catalog → lazy content-addressed model cache → verified offline inference after successful downloads. No simultaneous initial model downloads. SHA checks on reads/fetches reject corrupted/stale hash bytes. Explicit waiting-worker update stops devices then reloads. Failed update checks show recovery guidance. Installation is offered only on genuine browser events; iOS receives separate instructions. Retained storage and hardware permissions remain necessary.

## Privacy boundaries

No application camera/audio upload or analytics path was found. Collector records locally and exports intentionally; this is distinct from public live preview. Preferences persist locally. Speech passes text to the browser/OS voice provider and may use network services. Model/assets download over network; external reference navigation leaves MAEEN. Cache allowlists exclude recordings and private records. No backend/authentication/service-level guarantee exists. See `PRIVACY.md` and `SECURITY_REVIEW.md`.
