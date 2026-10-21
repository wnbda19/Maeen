# MAEEN

Arabic-first assistive-technology research prototype combining sign-letter recognition, editable communication and environmental sound awareness. Release candidate **0.1.0-rc.1**, prepared locally on 21 October 2026. **Not deployed; READY WITH LIMITATIONS for a transparent prototype competition demonstration.**

## Problem

Deaf and hard-of-hearing people can encounter communication barriers and reduced access to important environmental sound cues. Sign languages are independent languages; letter classification alone is not fluent interpretation.

## Solution

MAEEN brings camera-based letter experiments and local environmental sound classification into one accessible web interface, with editable text and an offline-ready PWA. It is not a certified safety system or interpreter replacement.

## Core Capabilities

- Experimental ArSL: original 37-class alphabet forest; accuracy unverified.
- Experimental ASL: genuine 24-static-letter model; J/Z and words unsupported.
- Experimental Smart Radar: Google YAMNet, visual events/history and microphone-level fallback; false negatives documented.
- Nine communication phrases, editable composition, optional Arabic browser speech.
- Internal consent-aware local recorder and signer-disjoint training infrastructure. **Arabic word model NOT TRAINED; zero supported words. KSL unavailable.**

See [frozen inventory](FINAL_FEATURE_MATRIX.md).

## Architecture

React/TypeScript/Vite; independent language adapters; local MediaPipe hand tracking; worker-based audio; scoped hash-verified lazy caches. [Technical architecture](TECHNICAL_ARCHITECTURE.md) separates current live inference from future temporal word training.

## AI Models

[ArSL](MODEL_CARD_ARSL.md), [ASL](MODEL_CARD_ASL.md), [Radar](MODEL_CARD_SMART_RADAR.md), [Arabic words](MODEL_CARD_ARABIC_WORDS.md). ArSL source/redistribution rights require clarification before public distribution. ASL data publisher declares CC0; MAEEN weights/project ownership is separate. YAMNet has preserved Apache-2.0 notices. No blanket repository license is asserted.

## Privacy

Camera/audio inference runs locally; no application upload/analytics path was found. The internal collector intentionally stores consented video locally and exports on request. Browser speech may use a network provider. [Privacy](PRIVACY.md).

## Accessibility

Keyboard, focus, RTL/LTR, reduced motion and visual status support. Browser tests toward WCAG 2.2 AA; no certification or screen-reader validation. [Accessibility](ACCESSIBILITY.md).

## Offline/PWA

Install only when the browser supports it. First successfully run each desired model online after worker activation. Shell and retained verified assets then work offline. Missing/corrupt files require reconnecting; speech/hardware permissions vary. No background monitoring. [Offline contract](PWA_OFFLINE_RELIABILITY.md).

## Current Validation

Baseline entering Phase 8: 125 app tests and 36 Python tests. Final candidate: **128 app / 36 Python passing**, production build passing. Browser responsive and accessibility evidence is recorded with its exact scope in [final candidate](RELEASE_CANDIDATE.md) and [metrics](VERIFIED_METRICS.md). All physical device/human testing remains untested.

## Known Limitations

Unverified ArSL accuracy/provenance, weak ASL classes, Radar misses, no words/KSL/continuous translation, no hardware acceptance, unresolved long-duration memory trend. Public release rights and physical preflight need resolution. Future integrations in More are plans, not implemented services.

## Development

Requirements: compatible Node/npm, local browser; Python environment for optional data tooling. From `app`: `npm ci`, `npm run dev` or `npm run build`. Build prepares preserved model/runtime assets from repository roots and generates the service worker/catalog; do not omit those source assets. Run `npm run preview -- --port 4199` for preview. `/Maeen/` checks use `node scripts/serve-pwa-check.mjs` on port 4200.

Internal collector: `npm run collector` from `app`; separate local build, not included in public dist. Recording consent and export instructions: [collection workflow](COLLECTION_TRAINING_WORKFLOW.md). Do not collect participant data without the documented consent/QC process.

## Testing

From `app`: `npm test`, `npm run build`. From `training`: `.venv/Scripts/python.exe -m unittest discover -s tests -v`; from root: `training/.venv/Scripts/python.exe -m unittest discover -s phase5/tests -v`. Prepare the documented training environment before running Python commands. Browser audit scripts require Chrome and local Playwright (`PLAYWRIGHT_MODULE` can override its path). Run PWA/offline checks sequentially before responsive/permission checks, because the test server intentionally refuses connections during offline tests. See `docs/phase8/README.md`.

## Competition Demo

Open More Features or About → Competition information → Start demo guide. This only exposes a navigational checklist and never injects results. [Timed script](COMPETITION_DEMO_SCRIPT.md), [pitch](COMPETITION_PITCH.md), [judge Q&A](JUDGE_QA.md). Use genuine devices/safe sounds or transparently show labelled historical evidence if live recognition fails.

## Roadmap

Clear provenance/rights, run Deaf-led physical/user validation, collect consented multi-signer Saudi recordings, evaluate signer-disjoint temporal word models, improve measured reliability and then investigate continuous signing. KSL requires compatible authorized data/model; native/background integrations remain future work. No deployment without explicit authorization.
