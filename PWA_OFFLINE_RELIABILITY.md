# MAEEN PWA and offline reliability — Phase 6

Verified locally on 21 October 2026. Nothing deployed.

## Installation and scope

The production manifest supplies MAEEN branding, 192/512 PNG icons, a separate maskable icon, Apple touch icon, standalone display, unrestricted orientation and existing colors. Identity is `/Maeen/`; start URL and scope resolve inside `/Maeen/`. Relative Vite assets work under that path. Chrome in a normal temporary profile reported no installability errors and emitted a genuine `beforeinstallprompt`. Private browsing correctly reported `in-incognito`.

The install action appears only after that browser event. iOS receives separate Share → Add to Home Screen guidance. An installed OS app was not launched during this verification. Standalone is configured and parsed correctly; native standalone operation still needs device testing. See [Chrome installation criteria](https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest/) and [WebKit Home Screen support](https://webkit.org/blog/13878/).

## Offline contract

After shell installation, reload and all public routes work offline. Start each required AI feature successfully online once, after the worker controls the page, to cache its dependencies. ArSL, experimental static ASL and YAMNet then ran genuine inference with app connections blocked. A home-page visit alone does not download every model.

Offline availability depends on retained browser storage and device permissions. Storage clearing, quota failure or eviction can remove assets. Missing/corrupt model files show an actionable connect-and-download/repair message. Radar retains microphone-level fallback. No background listening is promised; leaving/suspending the page stops devices. Speech recognition may require the browser's network service; speech synthesis depends on installed voices. External reference links, first downloads and updates require connectivity. Arabic word recognition and KSL remain unavailable as before.

## Versioning and integrity

`scripts/build-sw.mjs` generates `model-catalog.json` and the worker from actual production bytes. Every public model/runtime entry has its size and SHA-256. Model groups record semantic versions, exact content-addressed keys and update strategy. ArSL is `legacy-forest-v1`, ASL is `1.0.0-experimental`, Radar is `yamnet-4d8b4a53282d-mediapipe-0.10.32`.

Shell cache names include a build digest. Model cache keys contain full SHA-256 and relative asset path, scoped to the deployment. Every cache read and network download is verified. Corrupt entries are removed; mismatched downloads fail; previous hashes are never silently substituted. Valid cached models require no redownload. Concurrent misses share a request. Activation removes obsolete scoped entries. Browser verification proved rejection offline and repair after reconnecting.

Only generated public allowlisted GET paths are cached. Unknown documents/URLs, external requests and other methods are not intercepted. No camera clips, microphone audio, consent records or user text are added to these caches. Audio and vision inference remain local. The worker precaches 24 shell entries; 19 model/runtime assets are lazy candidates, including alternative WASM variants. Only the selected runtime variant is fetched. YAMNet uses labels embedded in its TFLite file; its separate catalogued text labels are not necessary for offline inference.

## Updates

A waiting worker is announced without automatically interrupting the session. The explicit update action stops devices, activates the waiting worker and reloads controlled clients. First worker activation does not force a reload. Online/foreground checks are throttled. The browser test exercised an actual waiting worker and reload, using a test-server revision change; no deployment occurred.

## Reproduction

Build from `app` with `npm.cmd run build`, then run `node scripts/serve-pwa-check.mjs`. In another terminal run `node scripts/check-pwa.mjs`, `node scripts/check-mobile-shell.mjs` and `node scripts/check-device-permissions.mjs`. These checks require local Chrome and the bundled Playwright path, overridable with `PLAYWRIGHT_MODULE`. The server's `/__phase6/*` controls exist only in this local test harness and must not be deployed. See `docs/phase6/README.md` for evidence and limitations.
