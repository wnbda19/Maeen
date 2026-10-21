# Controlled first-party collection → future model workflow

2026-10-21. **Do not fit a model now.** There are zero real recordings/consents. Official library clips are never included. The following commands are for after actual collection and review.

## 1. Collect, import and review

Follow RECORDING_GUIDE.md and the frozen profile in collection/profiles.json. Keep video + individual JSON sidecars together privately. Import with a real consent registry; inspect decoded duration/source hashes; language and technical reviewers update metadata/recordings.jsonl. Accept only one take per signer/term/global repetition. A valid duration is not evidence of a valid sign.

From training/:

```powershell
$python='.\.venv\Scripts\python.exe'
$dataset='C:/private/maeen-reference25'
$consent='C:/private/maeen-consents/registry.json'
$vocabulary='config/vocabulary.reference25.json'
$splits='config/splits.reference25.json'
& $python -m maeen_data.collection import --profile reference25 --exports C:/private/maeen-exports --root $dataset --consents $consent
& $python -m maeen_data.collection progress --profile reference25 --root $dataset --output "$dataset/progress.json"
# Only after actual human QC:
& $python -m maeen_data.collection accepted --profile reference25 --root $dataset --consents $consent --output "$dataset/manifests/accepted.jsonl"
```

For mvp15, use its own dataset root, --profile mvp15, vocabulary.mvp15.json and splits.mvp15.json consistently at **every** step. Never concatenate the two campaigns. A progress report is an auditable count, not a training authorization. It verifies hashes but the training path independently revalidates current consent.

## 2. Actual landmark extraction and shared temporal features

```powershell
& $python -m maeen_data ingest --root $dataset --metadata "$dataset/manifests/accepted.jsonl" --consents $consent --vocabulary $vocabulary --splits $splits --output "$dataset/manifests/ingested.json"
& $python -m maeen_data extract --root $dataset --manifest "$dataset/manifests/ingested.json" --consents $consent --vocabulary $vocabulary --splits $splits --tasks assets
node ../app/scripts/prepare-word-features.mjs "$dataset/manifests/ingested.json" $dataset "$dataset/manifests/features.json"
& $python -m maeen_data audit --root $dataset --manifest "$dataset/manifests/features.json" --consents $consent --vocabulary $vocabulary --splits $splits
```

Extraction uses genuine hand, pose and face MediaPipe tasks, two hands and actual video dimensions/timestamps. On this Windows Arabic workspace the existing native wrapper uses task buffers and an ASCII temporary working directory, without moving raw recordings. The actual TypeScript normalizer is reused offline, producing 32×268 float32 values plus coverage/hash lineage. Missing hands/dropouts are masked; gaps >200ms are not bridged. One-hand/two-hand signs and N000 differ by real observations, not fabricated landmarks.

The audit/fitting gate requires **all planned accepted signer/term/repetition slots and real negatives**, condition/speed/distance/session coverage, exact frozen splits, genuine current consent, linguisticReview approved only by an actual reviewer, source/feature hashes and temporal coverage. Do not change linguisticReview from pending merely to make a command pass. Detection quality and native/browser handedness/parity still require genuine participant calibration recordings.

## 3. Registered architecture comparison — after readiness only

Compare **TCN, GRU and BiLSTM** with the same frozen data/config and validation-only selection. ST-GCN remains an optional existing comparator, not automatically preferred. Input: [1,32,268]; output 27 classes (25 positives + N000/N001), or 17 for the fallback. Do not discard negatives to inflate positive-only accuracy. No unreviewed reflection, hand swaps, time reversal or synthetic samples are enabled.

```powershell
# DO NOT RUN until real collection, human approval and audit succeed:
& $python -m maeen_data train --root $dataset --manifest "$dataset/manifests/features.json" --consents $consent --vocabulary $vocabulary --splits $splits --architecture tcn --output runs/reference25-tcn-v1
& $python -m maeen_data train --root $dataset --manifest "$dataset/manifests/features.json" --consents $consent --vocabulary $vocabulary --splits $splits --architecture gru --output runs/reference25-gru-v1
& $python -m maeen_data train --root $dataset --manifest "$dataset/manifests/features.json" --consents $consent --vocabulary $vocabulary --splits $splits --architecture bilstm --output runs/reference25-bilstm-v1
```

These are instructions, **not executed training runs**. Deterministic seeds, early stopping on validation macro F1, gradient clipping and run manifests already exist. No test tensors are consumed during fitting. Choose the final architecture using validation accuracy/F1, size and measured runtime considerations before opening test results; do not choose a winner from untrained parameter counts alone.

## 4. Calibration, locked test and private ONNX candidate

```powershell
# Example only: replace --run with the validation-selected candidate, not every run after looking at test.
& $python -m maeen_data calibrate --root $dataset --manifest "$dataset/manifests/features.json" --consents $consent --vocabulary $vocabulary --splits $splits --run runs/reference25-tcn-v1
& $python -m maeen_data evaluate --root $dataset --manifest "$dataset/manifests/features.json" --consents $consent --vocabulary $vocabulary --splits $splits --run runs/reference25-tcn-v1
& $python -m maeen_data export --root $dataset --manifest "$dataset/manifests/features.json" --consents $consent --vocabulary $vocabulary --splits $splits --run runs/reference25-tcn-v1 --output runs/reference25-tcn-v1/candidate.onnx
```

Metrics: accuracy, macro precision/recall/F1, per-class F1/support and confusion matrices. Validation-only score/margin rejection calibration does not turn softmax into calibrated probabilities. Live temporal windows, duplicate suppression and No Sign/Unknown transitions need actual stream validation. Test output cannot be overwritten. A new external cohort is needed after test-informed changes.

ONNX export checks structure and Python/ORT numerical parity and reports actual candidate size/CPU latency when genuine weights exist. Its legacy exporter warning remains documented; no browser-runtime superiority is claimed. Actual trained size, signer-independent accuracy, macro F1, browser latency and webcam word-recognition results are **not available**. Benchmark ONNX Runtime Web versus TFJS only after a trained candidate exists; no speculative runtime/model is connected to public Word Mode.

## Status now

Recorder, import/progress/QC handoff, profile gates, extractor, shared normalization, dataset generation, model candidates, metrics and export checks are prepared. Unit tests use simulated capture events and temporary blank decoder/shape probes only; they do not form a training dataset. No optimizer step has run. Public Word Mode remains Not Implemented / Data Access Required. Nothing deployed.
