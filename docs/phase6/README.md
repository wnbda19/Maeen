# Phase 6 evidence

Run date: 21 October 2026. Production build worker digest: `d91565847fc74810`.

- `browser-check.json`: final successful production Chrome run; definitive offline, update, corruption, installation, resource and timing evidence. Initial incognito install errors are expected; `normalProfileInstallability` and `nativeInstallEventSeen` contain the normal-profile result. `standaloneMediaEmulation: false` means the attempted headless display override did not simulate an installed window; it does not override the parsed standalone manifest.
- `mobile-shell.json`: 60 successful route/language/viewport checks.
- `permission-check.json`: actual browser denial using virtual media devices.
- `preservation-before.json` and `preservation-result.json`: protected-file hashes and intentional Radar changes; see the final report for scope.
- `browser-partial.json`, if present: historical failed harness attempts, not the final result. Earlier tests revealed that browser offline emulation alone was insufficient to prove worker isolation; the final run also makes the local server refuse app connections. Lifecycle freeze is explicitly labelled simulated.
- `PLAN.md`: implementation boundaries and verification plan.

The check scripts live in `app/scripts`. They use local fixtures, real inference and no external upload. Tests do not establish physical-device behavior, model accuracy, reliable emergency detection or native/WASM leak freedom. Root reports contain the acceptance limits. Nothing was deployed.
