import { cp, mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
const app = fileURLToPath(new URL("../", import.meta.url));
const manifest = {};
for (const folder of ["models", "mediapipe"]) {
  await mkdir(path.join(app, "public", folder), { recursive: true });
  await cp(path.join(app, "..", folder), path.join(app, "public", folder), {
    recursive: true,
  });
  async function walk(relative) {
    for (const entry of await readdir(path.join(app, "..", relative), {
      withFileTypes: true,
    })) {
      const name = `${relative}/${entry.name}`;
      if (entry.isDirectory()) await walk(name);
      else {
        const original = await readFile(path.join(app, "..", name));
        const copy = await readFile(path.join(app, "public", name));
        if (!original.equals(copy))
          throw new Error(`Asset copy mismatch: ${name}`);
        manifest[name] = {
          bytes: original.length,
          sha256: createHash("sha256").update(original).digest("hex"),
        };
      }
    }
  }
  await walk(folder);
}
await writeFile(
  path.join(app, "public/asset-manifest.json"),
  JSON.stringify(manifest, null, 2),
);
// Keep legacy runtimes intact; run the SDK with its own matching WASM distribution.
await mkdir(path.join(app, "public/runtime/vision"), { recursive: true });
await cp(
  path.join(app, "node_modules/@mediapipe/tasks-vision/wasm"),
  path.join(app, "public/runtime/vision"),
  { recursive: true },
);
console.log(`Verified ${Object.keys(manifest).length} preserved AI assets.`);
