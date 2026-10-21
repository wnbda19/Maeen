# Phase 3 execution plan — 2026-10-21

## Owner steering and implemented scope

The owner confirmed no authorized dataset and explicitly paused training. The task now builds first-party collection/training infrastructure: 15 proposed words, 12 planned signers, 20 repetitions and separate negative clips, with an 8/2/2 signer split. Required collection/schema/consent/recording/vocabulary documents and runnable Python/Node tooling are provided. No fitting, word inference or public model publication occurred. Browser runtime/model-loader selection remains a later trained-artifact acceptance step; Word Mode stays Dataset Collection Required.

The original discovery plan below is retained as history; its public-data training and browser integration dependencies are not claimed completed.

Baseline rerun: 52 tests and production build pass; ten original assets preserved. No local labelled recordings, training manifests or word weights found.

1. Evaluate the preserved forest contract and feature pipeline; add reproducible held-out evaluation/metrics tooling. Report unmeasured accuracy/FPS as unavailable. Keep raw features exactly as trained; do not silently normalize the alphabet model.
2. Research primary dataset pages, licenses, signer metadata and class lists. Verify candidate words against actual metadata. No public product training with research-only/unclear data; no fabricated vocabulary coverage.
3. Add tested temporal frame adapters, body-relative clip normalization, masks, resampling/gap handling, bounded buffering, signer split checks and metrics. Keep transforms versioned; no reflection/hand swapping or per-frame motion-erasing alignment.
4. Harden No Sign/Unknown/Recognized filtering, malformed-score rejection and duplicate suppression. Preserve existing letter threshold until calibration data supports changing it.
5. Add a strict trained-model manifest/loader gate and vocabulary/history utilities. Keep Word Mode unavailable until approved data, trained weights, signer-disjoint evaluation, export parity and browser timing exist. Do not install a speculative runtime or announce an untrained classifier.
6. Run full tests/build and asset preservation checks after each implementation increment. Record limitations and exact results in the requested evaluation/research/vocabulary documents and Phase 3 report.

Training/export/integration depend on a suitable authorized temporal dataset and signer metadata. Current research: KArSL/mArSL product licenses unestablished; Isharah restricts commercial model development; Friday Sermon has only two signers (insufficient for three nonempty signer-disjoint partitions). Continue independent engineering while requesting any owner-authorized dataset.
