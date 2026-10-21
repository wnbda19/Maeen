import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { workerSource } from "./worker-source.mjs";
const dist = new URL("../dist/", import.meta.url),
  assets = {};
const hash = (b) => createHash("sha256").update(b).digest("hex");
async function add(path) {
  const b = await readFile(new URL(path, dist));
  assets[path] = { bytes: b.length, sha256: hash(b) };
}
async function walk(path) {
  for (const entry of await readdir(new URL(path, dist), {
    withFileTypes: true,
  })) {
    const name = path + entry.name;
    if (entry.isDirectory()) await walk(name + "/");
    else await add(name);
  }
}
for (const directory of [
  "models/",
  "sign-models/",
  "audio-models/",
  "runtime/",
])
  await walk(directory);
const digest = (paths) =>
  hash(Buffer.from(paths.map((p) => assets[p].sha256).join(""))).slice(0, 16);
const vision = [
  "models/hand_landmarker.task",
  "runtime/vision/vision_wasm_internal.js",
  "runtime/vision/vision_wasm_internal.wasm",
  "runtime/vision/vision_wasm_nosimd_internal.js",
  "runtime/vision/vision_wasm_nosimd_internal.wasm",
];
const group = (version, paths) => ({
  version,
  cacheVersion: digest(paths),
  cacheKeys: paths.map((p) => ({
    path: p,
    key: "__verified/" + assets[p].sha256 + "/" + p,
    sha256: assets[p].sha256,
    bytes: assets[p].bytes,
  })),
  strategy:
    "lazy, cache-first, SHA-256 verified on download and read; changed hashes never reuse previous bytes",
});
const catalog = {
  format: "maeen-public-model-cache-v1",
  models: {
    arsl: group("legacy-forest-v1", [
      "models/arsl-forest.bin",
      "models/arsl-labels.json",
      ...vision,
    ]),
    asl: group("1.0.0-experimental", [
      "sign-models/asl-static/model.json",
      "sign-models/asl-static/labels.json",
      ...vision,
    ]),
    radar: group("yamnet-4d8b4a53282d-mediapipe-0.10.32", [
      "audio-models/yamnet.tflite",
      "audio-models/labels.txt",
      "runtime/audio/audio_wasm_nosimd_internal.js",
      "runtime/audio/audio_wasm_nosimd_internal.wasm",
    ]),
  },
  assets: { ...assets },
};
await writeFile(
  new URL("model-catalog.json", dist),
  JSON.stringify(catalog, null, 2),
);
const chunks = (await readdir(new URL("assets/", dist)))
  .filter((n) => /\.(js|css)$/.test(n))
  .map((n) => "assets/" + n);
const shell = [
  "index.html",
  "icon.svg",
  "icon-180.png",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "manifest.webmanifest",
  "audio-capture.js",
  "model-catalog.json",
  ...chunks,
];
for (const path of shell) await add(path);
const version = hash(
  Buffer.from(
    JSON.stringify(assets) +
      (await readFile(new URL("./worker-source.mjs", import.meta.url), "utf8")),
  ),
).slice(0, 16);
await writeFile(
  new URL("sw.js", dist),
  workerSource({ shell, version, assets }),
);
console.log(
  `Built verified scoped PWA: ${shell.length} shell entries, ${Object.keys(assets).length - shell.length} lazy public AI assets; version ${version}.`,
);
