import { mkdir, cp, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const root = new URL("../", import.meta.url);
const model = await readFile(new URL("../audio-models/yamnet.tflite", root));
if (
  createHash("sha256").update(model).digest("hex") !==
  "4d8b4a53282dc83ef04e3e7dbc4fbc98082e34e44ed798e16c3a0cdd4c584faf"
)
  throw Error(
    "Unexpected YAMNet model bytes; review the model provenance before updating.",
  );
await mkdir(new URL("public/runtime/audio/", root), { recursive: true });
await cp(
  new URL("node_modules/@mediapipe/tasks-audio/wasm/", root),
  new URL("public/runtime/audio/", root),
  { recursive: true },
);
await cp(
  new URL("../audio-models/", root),
  new URL("public/audio-models/", root),
  { recursive: true },
);
