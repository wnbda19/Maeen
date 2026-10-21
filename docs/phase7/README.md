# Phase 7 evidence index

All checks are local. User requested browser-only validation. Recorded virtual-device input is clearly distinct from physical camera/microphone use.

- `browser-accessibility.json`: actual production Chrome axe results, route network trace, keyboard focus, text sizing and reflow. No external requests or application request bodies were observed during this route audit.
- `keyboard-translator.png`: reviewed focus screenshot. A test-harness URL-encoding output-path defect was corrected; screenshot is now stored here.
- `dependency-audit.json`: successful npm advisory response using system-trusted TLS certificates; no TLS verification bypass.
- `secrets-scan.json`: selected credential-pattern scan, 124 files; not exhaustive.
- `recovery-faults.json`: deterministic fault injection of the actual worker generator, with interrupted body, failed install, retained old shell and retry. This is not a physical network interruption test.
- `preservation.json`: comparison to protected Phase 6 pre-implementation hashes; only the three already documented Phase 6 Radar differences remain.
- `browser-check.json` / `pwa-run.log`: Phase 7 repeated real-inference offline/browser test. If `browser-partial.json` exists, consult the failure explicitly rather than treating it as a pass.
- Responsive and permission scripts retain their evidence paths in `docs/phase6`; check their latest run output. They must run sequentially after the offline test, because the latter intentionally disconnects the shared server.

Reproduce with the production build served by `app/scripts/serve-pwa-check.mjs` on port 4200. Run `check-phase7.mjs`, `check-phase7-recovery.mjs`, `check-device-permissions.mjs` and `check-mobile-shell.mjs`. For the extended fixture run set `PWA_EVIDENCE_DIR=docs/phase7`, `PWA_CYCLES=30`, `PWA_RADAR_CYCLES=1`, `PWA_DWELL_MS=5000`, then run `check-pwa.mjs`. Do not run other server-dependent checks concurrently with it. Scripts need local Chrome/bundled Playwright and existing attributed fixtures. No deployment is part of these commands.
