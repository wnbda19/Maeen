# Phase 5 implementation plan

1. Snapshot protected Phase 3 and Phase 4 files; run the 91-test baseline.
2. Verify primary-source licenses and model/data suitability for ASL and Korean Sign Language; document restrictions separately for data, code and weights.
3. Attempt a small genuine ASL static-letter model using only the publisher's CC0 images. Exclude J/Z. Use fixed training settings and a separate CC0 source for evaluation; absent signer IDs prevent signer-independent claims. Keep all work under phase5/, not training/ or collection/.
4. Add typed language/model registry and lazy adapters. Preserve the existing Arabic forest, preprocessing and stabilizer. Keep unavailable capabilities explicitly unavailable, with no loader or predictions.
5. Add selector/capability information within the existing translator. Language changes stop and close capture/inference, cancel pending loads and clear text/prediction buffers. UI language stays independent of sign-language selection. Do not reuse Arabic Learn content or Arabic speech for ASL/KSL.
6. Test registry, ASL labels/preprocessing/inference, lazy loading, switching/reset/cancellation and unavailable languages; retain Arabic/Radar tests. Measure actual model/browser behavior, rebuild and verify protected hashes. No deployment.
