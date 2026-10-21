# Phase 8 evidence and local package

Candidate: 0.1.0-rc.1, 21 October 2026. Nothing deployed. Reports distinguish inherited scientific measurements from fresh engineering checks.

- `browser-check.json`, `pwa-run.log`: final production `/Maeen/` browser PWA/offline/cache corruption/update and real fixture-inference run. No physical devices. Failures, if any, remain in `browser-partial.json` rather than being silently converted to passes.
- The final unchanged repeat passed; `browser-partial.json` and `radar-miss-attempt.json` retain the earlier miss. Do not interpret the pass as removing that failure. `accessibility.json`, `responsive.json` and `permissions.json` snapshot the final checks to this release directory.
- `dependency-audit.json`: fresh npm registry advisory response via trusted TLS.
- `radar-miss-attempt.json` / `.log`: retained final-build run with real model/mic but no dog alert within 15 seconds. No threshold or model changes were made; read this alongside the repeat outcome.
- `preservation.json`: protected model/collector/training comparison; only pre-existing Phase 6 Radar differences are allowed.
- `demo-review.json` and screenshots: actual optional guide/facts checks at small/large viewports and both interface directions.
- Final responsive, accessibility and permission scripts retain their original JSON paths in `docs/phase6` and `docs/phase7`; `verification.json` records the final result summary. They run after offline checks because the test server temporarily refuses connections.
- `package.json`: local archive path/size/SHA-256, content manifest and base commit. No participant data, source fixtures or Python environment included. Public model files are included only for internal review; inherited ArSL/public redistribution rights remain unresolved.

Build from `app` with `npm run build`. Start `node scripts/serve-pwa-check.mjs` on 4200. Set `PWA_EVIDENCE_DIR=docs/phase8`, `PWA_CYCLES=4` and run `node scripts/check-pwa.mjs`; then run `check-phase7.mjs`, `check-mobile-shell.mjs`, `check-device-permissions.mjs` and `check-competition.mjs` sequentially. Local Chrome and bundled Playwright are required; override via `PLAYWRIGHT_MODULE`. The local test server/control endpoints must never be deployed.

Recreate the archive after a successful build with `training/.venv/Scripts/python.exe scripts/package_candidate.py` from repository root. Output is a local-review ZIP with `Maeen/` web contents and `RELEASE_NOTES/` documents; serve its parent directory for `/Maeen/` preview. Archive generation is not deployment and not a licensing decision.
