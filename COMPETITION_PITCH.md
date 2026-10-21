# Competition pitch

## 30-second pitch

MAEEN addresses two accessibility barriers: communication and awareness of environmental sounds. Our Arabic-first web prototype combines experimental sign-letter recognition with local sound classification, editable text and an offline-ready PWA. We preserve privacy by processing camera and microphone input locally. This is a working research platform, not full sign-language translation: Saudi word recognition still needs genuine multi-signer data, and sound reliability needs field validation.

## 60-second pitch

Deaf and hard-of-hearing people can face communication barriers and miss useful environmental sound cues. MAEEN brings these needs into one Arabic-first accessible web experience.

The prototype runs an existing 37-class Arabic letter model, an independent experimental ASL static-letter model, and Google's YAMNet for selected sound alerts. Users can review and edit text, use speech where supported, and reopen cached features offline. Camera and sound inference stays local; browser speech has separate platform dependencies.

Our contribution is the integrated architecture and a transparent path toward Saudi sign-language data: consent-aware local recording, official linguistic references, and signer-disjoint training preparation. Arabic words are not trained, KSL is unavailable, and our sound screening documented misses. We are seeking Deaf-led validation and properly consented recordings to turn this prototype into a dependable assistive product.

## 3-minute pitch

Imagine needing to communicate a short message while also wanting better awareness of sounds around you. These are different challenges, and their solutions should be accessible without demanding that users surrender camera or microphone recordings to a server.

MAEEN brings sign-letter computer vision and environmental sound awareness into one Arabic-first web platform. Its interface supports Arabic and English, keyboard navigation, clear visual status and reduced motion. It can be installed where the browser permits, and its shell and successfully cached models can run offline.

Today, the camera can run an original 37-class Arabic alphabet classifier and a separate experimental ASL model with 24 static letters. Users can review, edit and copy the composed text; Arabic speech is optional when a suitable browser voice is available. These are independent sign-language models, not the same gestures with translated labels. J and Z require motion and are not supported by our static ASL model.

Smart Radar uses genuine on-device Google YAMNet inference. It maps selected environmental classes into visual alerts and history, with microphone-level fallback. We do not estimate direction or distance from a single microphone. We also do not claim it replaces certified alarms: a small recorded-audio screening missed three of four positive dog/baby examples. That result guides the validation work still required.

Our Saudi word-recognition work is deliberately separated from the finished software paths. We verified 25 official library terms as linguistic references, but one reference clip per class is not a scientifically meaningful training corpus. Instead, we prepared consent-aware local collection and temporal landmark/training infrastructure. The primary collection target is 5,625 positive recordings from 15 signers, with completely separate training, validation and test signers. No word model is trained yet.

Our differentiation is the combination of sign and sound tools, local processing where practical, offline packaging and an extensible independent-language registry—not a claim that we invented these underlying neural models or solved fluent translation. Browser tests and engineering safeguards are substantial, but physical device, human signer and screen-reader validation remain untested.

The next investment is in people and evidence: Deaf Saudi linguistic partners, consented data, model provenance clearance, physical-device trials and source-separated sound evaluation. MAEEN is ready to demonstrate an honest prototype and a concrete research path. It is not yet a universally validated assistive or safety product.

Delivery length depends on speaking pace; rehearse and trim rather than presenting an exact timing guarantee.
