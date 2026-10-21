# Final feature freeze — 0.1.0-rc.1

21 October 2026. Each row has exactly one status. WORKING means the stated software path was verified, not universal hardware reliability. EXPERIMENTAL means genuine inference with material validation limitations. PARTIAL means conditional/platform-dependent or incompletely validated. PLANNED is an unimplemented roadmap concept. UNAVAILABLE means no usable model/capability is connected.

| Feature | Status | Frozen scope / limitation |
|---|---|---|
| Arabic letter recognition | EXPERIMENTAL | Original 37-class forest; accuracy and live-human reliability unverified |
| Arabic word recognition | UNAVAILABLE | NOT TRAINED; collection/training infrastructure only |
| ASL letters | EXPERIMENTAL | 24 static classes; J/Z unsupported; serious class weaknesses |
| ASL words | UNAVAILABLE | No model; reference research only |
| Korean Sign Language | UNAVAILABLE | Independent language researched; no model integrated |
| Smart Radar AI | EXPERIMENTAL | Local YAMNet, ten alert groups; documented false negatives |
| Microphone-level fallback | WORKING | Relative digital level only; no direction, distance or calibrated room loudness |
| Communication phrases | WORKING | Nine searchable/editable phrases; not sign translation |
| Text composition/copy/clear | WORKING | Manual edits clearly separate from recognized output; clipboard depends on browser permissions |
| Speech synthesis | PARTIAL | Requires Arabic browser voice; provider may need network |
| Offline shell and AI | PARTIAL | Browser verified after downloads; cache retention/permissions required |
| PWA installation/standalone | PARTIAL | Chrome install event verified; physical install/OS launch untested |
| Accessibility controls | PARTIAL | Keyboard, focus, RTL/LTR, motion and browser audits; screen reader untested |
| Internal data collector | WORKING | Local consent-gated recorder/export/QC metadata; no real cohort collected |
| Word landmark/training/ONNX scaffold | WORKING | Contract tests and scaffolding; not trained recognition |
| Demo guide / facts panel | WORKING | Optional navigation/presentation only; no fabricated detections |
| Visual Radar alert/history | WORKING | Genuine fixture event path; field perceptibility untested |
| Notifications/vibration | PARTIAL | Permission/feature gated; physical delivery untested |
| Letter learning view | PARTIAL | Existing reference/display content; not complete sign-language instruction |
| Prayer times / Qibla | PLANNED | No live computation/sensor integration |
| Smartwatch / BLE | PLANNED | No hardware integration |
| Car / CarPlay | PLANNED | No vehicle integration |
| Medical consultation / emergency SOS | PLANNED | No clinical or emergency service |
| Continuous speech/name detection | PLANNED | No speech-to-text/name model |
| Text-to-sign translation | PLANNED | No generative sign animation/translation |
| Flashlight/extra camera integrations | PLANNED | Camera facing selection exists; flashlight integration does not |
| Native app/background monitoring | PLANNED | PWA exists; no native/background monitor |
| Themes/sharing/guest personalization | PLANNED | Existing presentation and local preferences do not implement this whole roadmap |
| Cloud developer workspace | PLANNED | No cloud backend/workspace |

UI labels use Working / يعمل, Experimental / تجريبي, In Development / قيد التطوير and Unavailable / غير متاح where relevant. In Development never means a trained model. Original concept descriptions remain in More Features with their limitations.
