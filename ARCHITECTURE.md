# MAEEN architecture

## Additive Phase 2 extension — 2026-10-21

The existing architecture is retained. `features/translator` owns prominent mode choices, the existing camera view, `WordMode` and `LearnSigns`. The camera hook stays mounted to preserve composed text but stops before changing modes; Word/Learn never acquire media. Speech controls unmount across modes, cancelling speech. Only a twelve-frame stable candidate is displayed/eligible for manual addition; vote share remains separate and uncalibrated.

The gallery imports the original model JSON directly through Vite/TypeScript instead of duplicating/normalizing labels. No pose art is generated. Missing chart/verified artwork is a documented blocker.

`services/recognition/words.ts` is a **type contract only**: timestamped sequences, both hands/handedness, upper-body/facial landmarks, window/coordinate metadata, result semantics, AbortSignal, reset and disposal. No word implementation or weights exist. The one-hand adapter is not advertised as satisfying future requirements.

`features/more` provides a bilingual capability catalog and native disclosures for original concepts. The sixth hash route uses existing lazy routing, focus, localization and tokens. No external integration is initialized. Radar's service is unchanged; its UI separates measured signal from future inference. Arabic uses a system font token pending compliant official embedding; see [font decision](docs/FONT_DECISION.md).

---

## Current system

Single compiled React entry bundles UI, SDKs, camera hooks, custom forest inference, speech, fake radar directions and Firebase. Root is a static GitHub Pages deployment. Maintainable original source was not found in public history.

## Decision

Reconstruct alongside the baseline in `app/` using React, TypeScript and Vite. Keep root index, hashed assets, models and MediaPipe files untouched. Build only to `app/dist/`; a preparation script copies original AI assets into the app public directory, verifying preservation through a SHA-256 manifest. No deployment replacement until regression and hardware review.

Alternatives: editing the minified bundle is fragile and rejected; a full replacement of all simulations with new AI requires unavailable datasets/native integrations and is not feasible honestly. A modular reconstruction provides usable camera letters, communication phrases and relative audio monitoring while recording the remaining gaps.

## Boundaries and contracts

- `src/app`: application shell and hash routes; route change unmounts sensor pages.
- `src/components`: reusable status/error and page layout; semantic controls, visible focus, no sensory-only feedback.
- `src/services/media`: exclusive sensor sessions, asynchronous cancellation, explicit stop, track cleanup and permission errors. No auto-start.
- `src/services/landmarks`: MediaPipe adapter owns task lifetime; only hand detection implemented. Face/pose capabilities report unavailable until actual assets and consumers exist.
- `src/services/recognition`: pure validated ARSL binary parser, finite 63-coordinate input, bounded tree traversal, vote score, temporal acceptance. Never fabricate a result on an error or no hand.
- `src/features/translator`: camera preview and letter buffer; visibly experimental, no phrase translation claim.
- `src/services/audio` and `src/features/radar`: local time-domain RMS mapped to dBFS, never SPL. No acoustic classification or direction estimate until a real validated provider exists.
- `src/services/speech`: explicit user-initiated browser synthesis with error reporting. Do not silently upload microphone data through browser transcription.
- `src/features/dictionary`: preserve existing nine phrases as text communication aids; sign descriptions require Deaf review before accreditation.
- `src/accessibility`: shared visual status and assistive-technology announcements. Browser vibration remains in the migration backlog; no flashing emergency simulation.
- `src/localization`: Arabic default RTL, English LTR with matching keys; language changes stop sensors through page remount.
- `src/pwa`: scoped app-shell offline service worker; models cached only after successful fetch. No claim of reliable background microphone/notifications.

Sensor states: idle → loading → active → idle/error. A generation token prevents a late permission response from resurrecting a stopped stream. Route change, hidden document and unmount release media. Prediction output carries label and vote score; unknown/low score produces no appended text. Raw landmarks stay in memory and are not logged or sent.

## UX and accessibility

Preserve مُعِين branding and emerald/dark palette. Replace device mock frames with responsive task pages. Provide landmarks as optional visual assistance; textual status is always present. Native buttons/labels, skip link, keyboard navigation, route focus, readable contrast, 44px targets, reduced motion and 320px reflow. No medical or safety guarantee; relevant unsupported integrations are explained as text, not decorative buttons.

### Phase 2 product layer

The existing app now has five primary destinations (home, translator, smart radar, communication, settings), with the original about route preserved. `AppShell` owns navigation and the semantic page regions. Emerald navigation is paired with pale/white task surfaces; the token system is `src/app/design.css`.

`useTranslator` and `useRadar` retain the original inference and signal-processing services while providing typed UI states, actionable failures and device-status publication. `services/media/status.ts` publishes lifecycle state only, never raw camera/audio data. Settings reads those states and passively queries browser permissions without starting devices.

`app/preferences.ts` validates and persists motion, text size and contrast under a versioned key; the existing language key is preserved. Reduced motion follows the operating system and can be forced on by the user. Radar rings respond to actual measured signal level, never angle or sound identity. Screen-reader alerts follow measured events with the existing five-second spacing, rather than every meter update. Shared speech controls cancel cleanly when text changes and ignore stale completion callbacks.

No models or dependencies were added for this product redesign. Legacy deployment and AI assets remain unchanged.

## Delivery and testing

Per implementation batch: unit tests + strict typecheck + production build. Model tests include malformed/truncated binaries, cyclic children, mismatched labels, NaN features and real-file contract. Audio tests check RMS/dBFS semantics. Media tests cover stop during permission and disposal. Browser checks cover navigation, language direction, phrase filtering and honest error states. Hardware sign accuracy, iOS/Android, offline installation, screen readers, permissions and long sessions require a separate device matrix before release.

No native Watch/CarPlay integrations, general sign translation, environmental classifier or medical backend is implied by this reconstruction. See backlog for release gates.
