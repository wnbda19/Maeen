/** Shares EXACT browser preprocessing with offline training; no Python reimplementation. */
import { createServer } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname, relative, isAbsolute } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
const [manifestPath, rootPath, outputPath] = process.argv.slice(2);
if (!manifestPath || !rootPath || !outputPath)
  throw new Error(
    "Usage: node prepare-word-features.mjs manifest.json dataset-root output-index.json",
  );
const root = resolve(rootPath),
  manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (!Array.isArray(manifest) || !manifest.length)
  throw new Error("No real recordings in manifest");
const within = (path) => {
  const p = resolve(root, path),
    r = relative(root, p);
  if (r.startsWith("..") || isAbsolute(r))
    throw new Error("Path outside dataset");
  return p;
};
const server = await createServer({
  root: resolve(dirname(fileURLToPath(import.meta.url)), ".."),
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { prepareSequence } = await server.ssrLoadModule(
    "/src/services/recognition/sequence.ts",
  );
  const config = JSON.parse(
    await readFile(
      resolve(
        dirname(fileURLToPath(import.meta.url)),
        "../../training/config/experiment.json",
      ),
      "utf8",
    ),
  );
  const output = [];
  for (const row of manifest) {
    if (
      row.source !== "first-party" ||
      row.captureType !== "real-camera" ||
      !row.qc?.accepted
    )
      throw new Error("Unapproved source");
    const raw = JSON.parse(
      await readFile(within("landmarks/" + row.clipId + ".json"), "utf8"),
    );
    if (
      raw.sourceSha256 !== row.sha256 ||
      raw.schemaVersion !== "maeen-landmarks-v1"
    )
      throw new Error("Stale/incompatible landmark extraction");
    if (!raw.frames.length || raw.frames.some((f) => !f.imageSize))
      throw new Error("Real image dimensions required");
    const handCoverage =
      raw.frames.filter((f) => f.hands.length).length / raw.frames.length;
    const bodyCoverage =
      raw.frames.filter(
        (f) =>
          f.upperBody.length === 8 &&
          f.upperBody.slice(0, 2).every((p) => (p.visibility ?? 1) >= 0.5),
      ).length / raw.frames.length;
    const faceCoverage =
      raw.frames.filter((f) => f.face.length === 17).length / raw.frames.length;
    if (
      (row.wordId !== "N000" && handCoverage < config.minHandCoverage) ||
      bodyCoverage < config.minBodyCoverage ||
      faceCoverage < config.minFaceCoverage
    )
      throw new Error(
        "Landmark coverage requires QC/re-recording: " + row.clipId,
      );
    const seq = prepareSequence(raw.frames, {
      steps: config.steps,
      minFrames: config.minFrames,
      maxGapMs: config.maxGapMs,
      allowNoHands: row.wordId === "N000",
    });
    if (seq.temporalCoverage < config.minTemporalCoverage)
      throw new Error("Excessive dropped frames: " + row.clipId);
    const featureFile = "features/" + row.clipId + ".f32",
      path = within(featureFile);
    const bytes = Buffer.alloc(seq.values.length * 4);
    seq.values.forEach((v, i) => bytes.writeFloatLE(v, i * 4));
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, bytes);
    output.push({
      ...row,
      featureFile,
      featureSha256: createHash("sha256").update(bytes).digest("hex"),
      featureVersion: seq.version,
      shape: seq.shape,
      durationMs: seq.durationMs,
      temporalCoverage: seq.temporalCoverage,
      handCoverage,
      bodyCoverage,
      faceCoverage,
      taskHashes: raw.taskHashes,
      extractor: raw.extractor,
    });
  }
  await mkdir(dirname(resolve(outputPath)), { recursive: true });
  await writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log(
    "Prepared " +
      output.length +
      " real clip feature tensors. No model trained.",
  );
} finally {
  await server.close();
}
