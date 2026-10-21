import { createServer } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { cpus, platform, arch } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const app = resolve(dirname(fileURLToPath(import.meta.url)), ".."),
  root = resolve(app, "..");
const server = await createServer({
  root: app,
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { parseForest, predict } = await server.ssrLoadModule(
    "/src/services/recognition/forest.ts",
  );
  const bytes = await readFile(resolve(root, "models/arsl-forest.bin")),
    meta = JSON.parse(
      await readFile(resolve(root, "models/arsl-labels.json"), "utf8"),
    );
  const model = parseForest(Uint8Array.from(bytes).buffer, meta.labels);
  const vectors = Array.from({ length: 128 }, (_, sample) =>
    Float32Array.from({ length: 63 }, (_, axis) =>
      axis % 3 === 2
        ? (((sample * 7 + axis) % 21) - 10) / 100
        : ((sample * 13 + axis * 3) % 97) / 100,
    ),
  );
  for (let i = 0; i < 1000; i++) predict(model, vectors[i % vectors.length]);
  const times = [];
  for (let i = 0; i < 10000; i++) {
    const start = performance.now();
    predict(model, vectors[i % vectors.length]);
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const report = {
    recordedAt: new Date().toISOString(),
    modelSha256: createHash("sha256").update(bytes).digest("hex"),
    modelBytes: bytes.length,
    taskSha256: createHash("sha256")
      .update(await readFile(resolve(root, "models/hand_landmarker.task")))
      .digest("hex"),
    labels: model.labels,
    classCount: model.labels.length,
    featureCount: model.nFeatures,
    coordMode: model.coordMode,
    trees: model.trees.length,
    nodes: model.trees.reduce((s, t) => s + t.length, 0),
    accuracy: null,
    perLetterAccuracy: null,
    confusionMatrix: null,
    commonConfusions: null,
    signerIndependent: null,
    cameraFps: null,
    livePredictionStability: null,
    reason:
      "No legitimate labelled evaluation samples or original training split/provenance are available. No accuracy or camera FPS inferred from engineering fixtures.",
    engineeringMicrobenchmark: {
      input: "128 deterministic non-labelled vectors; not real signing samples",
      warmup: 1000,
      traversals: 10000,
      p50Ms: times[5000],
      p95Ms: times[9500],
      node: process.version,
      platform: platform(),
      arch: arch(),
      cpu: cpus()[0]?.model,
      scope:
        "Forest traversal only; excludes MediaPipe, camera, rendering and browser inference",
    },
  };
  const output = resolve(root, "docs/phase3/letter-contract-and-timing.json");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await server.close();
}
