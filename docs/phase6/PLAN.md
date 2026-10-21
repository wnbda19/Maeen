# Phase 6 implementation

Preserve model bytes, feature definitions, predictions, collector, training and consent. Only packaging, offline feedback, device interruption cleanup and install/update UX change.

1. Validate the 103 app / 36 Python baseline and snapshot protected files.
2. Generate install PNGs from existing MAEEN SVG; maintain relative manifest/scope for /Maeen/.
3. Build a public-asset SHA-256 catalog and content-addressed model cache. Precache only the small shell; lazy-cache models/runtime after use. Verify both network and cached bytes; never substitute a previous hash. Do not intercept private/unknown URLs, methods or documents.
4. Register a single worker/controller. Explicit waiting-worker update action shuts down devices and reloads controlled clients consistently. Expose install only after a real beforeinstallprompt event; iOS guidance is separate.
5. Add pagehide/freeze/update and track interruption cleanup without altering model behavior. Explain missing offline models and preserve Radar level fallback.
6. Test actual production output under /Maeen/: install manifest, warm and cold offline reload, all three AI asset paths offline, corrupt-cache rejection, version changes, navigation/device cycles, responsive layouts and timings. Clearly label injected recordings versus physical devices. No deployment.
