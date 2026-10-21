# MAEEN maintainable reconstruction

This source application lives alongside the untouched public deployment. The repository root `index.html`, `assets`, `models` and `mediapipe` remain the audit baseline. This app does not replace the live website automatically.

## Run

Use Node.js 22.12+ (or a supported newer LTS) and npm:

```text
cd app
npm ci
npm test
npm run build
npm run preview
```

For development, use `npm run dev`. The build copies and verifies ten original AI files, adds the SDK-matched MediaPipe runtime, checks strict TypeScript, builds to `app/dist/`, and generates a scoped service worker. The package lock records the resolved dependencies. If Windows requires its trusted certificate store, use Node's `--use-system-ca`; do not disable certificate checks.

## Implemented

- React/TypeScript/Vite source with five primary destinations: Home, Sign translator, Smart radar, Communication and Settings. The original about route is retained.
- Arabic RTL and English LTR with accessible labels, route focus, keyboard controls, reduced motion and responsive layouts.
- Existing 37-class Arabic forest parser and actual MediaPipe hand-landmark inference. Vote share is displayed as vote share. Accuracy remains unevaluated.
- Camera lifecycle/cancellation, front/rear selection, real landmark overlay, stabilization, editable letter buffer and explicit browser speech.
- Local microphone RMS/dBFS monitoring, user threshold and initially empty in-memory event history. No inferred direction or sound class.
- Nine preserved Arabic text phrases with Arabic/English search and honest Arabic voice availability feedback.
- Phase 2 identity and responsive task layouts, large camera preview, signal-driven radar rings, shared speech controls and actionable permission/device/model errors.
- Persisted reduced-motion, text-size and contrast preferences, passive permission guidance and actual device-session status. No new dependencies were added for Phase 2.
- Scoped offline caching code and cache-version regression tests. Browser offline reload still requires resolution/device validation; see VERIFICATION.md.

## Structure

`src/app` owns navigation, preferences and design tokens. `features` owns task pages; translator/radar hooks connect those views to the existing services. `services/media` owns streams, device status and error mapping; `services/landmarks` owns MediaPipe; `services/recognition` owns forest inference and stabilization; `services/audio` owns digital signal measurement; `services/speech` owns browser voices. `localization` owns copy; `pwa` and `scripts/worker-source.mjs` own offline delivery. `accessibility` owns visual/assistive status notifications; `components` owns shared icons, page headings, speech controls and recovery.

## Boundaries

No general sign-language or phrase-recognition model is supplied. No environmental classifier, microphone-array localization, face/pose task, native watch/car integration, prayer calculations, consultation backend or emergency dispatch is connected. Original simulations remain available in the root baseline for audit only. Their claims were not promoted into this app.

No camera frames, recordings or recognized letters are uploaded or persisted. Language and display preferences are the only app-owned localStorage settings. Browser speech can depend on a platform service; users should check device voice settings before speaking sensitive text. MediaPipe's upstream runtime behavior and licensing remain part of release review.

## Publishing

Review `../IMPLEMENTATION_BACKLOG.md` and `../VERIFICATION.md` before replacing the GitHub Pages deployment. Local production serving under `/Maeen/`, navigation, reload and model loading were verified. An actual deployment and update cycle still need review. HTTPS or localhost is required for media and service workers. Serve the contents of `app/dist/`; do not publish the source folder or point Pages at it without a build workflow. Old workers activate after existing app tabs close. No deployment is authorized as part of Phase 2.
