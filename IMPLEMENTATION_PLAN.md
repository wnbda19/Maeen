# Modular foundation implementation plan

Goal: reconstruct genuine existing capabilities without changing the deployed baseline.
Architecture: ARCHITECTURE.md. Stack: React, TypeScript, Vite, MediaPipe Tasks Vision, Vitest.

1. Add isolated app package, strict TS configuration and asset-copy script. Test original model contract and malformed binaries before implementing the parser. Run tests/build.
2. Add media-session service with injectable getUserMedia and cancellation tests; implement landmark adapter, camera letter page and temporal acceptance. Run tests/build.
3. Add relative audio meter with numerical tests; build explicit start/stop radar without invented directions or classes. Run tests/build.
4. Add Arabic/English accessible shell, dictionary and speech error handling, preserving the nine original phrases. Run tests/build and browser checks.
5. Add scoped offline shell/model caching and preservation checks. Run final tests/build, inspect browser states, document unsupported and untested capabilities in VERIFICATION.md.

Tests are engineering validation, not accuracy evidence. No publishing, cloud writes or replacement of root deployment is part of this local reconstruction.
