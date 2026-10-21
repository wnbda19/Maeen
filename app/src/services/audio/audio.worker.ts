import { AudioClassifier } from "@mediapipe/tasks-audio";
let classifier: AudioClassifier | null = null;
self.onmessage = async ({ data }) => {
  try {
    if (data.type === "load") {
      const start = performance.now();
      // 0.10.32 declares FilesetResolver but omits its ESM export. Use the
      // documented WasmFileset with portable non-SIMD CPU binaries instead.
      const files = {
        wasmLoaderPath:
          data.base + "runtime/audio/audio_wasm_nosimd_internal.js",
        wasmBinaryPath:
          data.base + "runtime/audio/audio_wasm_nosimd_internal.wasm",
      };
      classifier = await AudioClassifier.createFromOptions(files, {
        baseOptions: {
          modelAssetPath: data.base + "audio-models/yamnet.tflite",
        },
        maxResults: -1,
      });
      self.postMessage({ type: "ready", loadMs: performance.now() - start });
    } else if (data.type === "infer" && classifier) {
      const start = performance.now();
      const result = classifier.classify(data.samples, data.sampleRate);
      self.postMessage({
        type: "result",
        scores: result[0]?.classifications[0]?.categories ?? [],
        inferenceMs: performance.now() - start,
      });
    }
  } catch (error) {
    self.postMessage({ type: "error", message: String(error) });
  }
};
