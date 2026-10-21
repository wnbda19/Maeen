import { readFile, mkdir, cp } from "node:fs/promises";
import { createHash } from "node:crypto";
const root = new URL("../", import.meta.url),
  source = new URL("../sign-models/asl-static/", root);
const bytes = await readFile(new URL("model.json", source));
if (
  createHash("sha256").update(bytes).digest("hex") !==
  "82443cb9faecdbcbfe5815ab672ba6753ab03dad902757b8a6b466264f40ec8e"
)
  throw Error("ASL model integrity mismatch");
await mkdir(new URL("public/sign-models/", root), { recursive: true });
await cp(source, new URL("public/sign-models/asl-static/", root), {
  recursive: true,
});
