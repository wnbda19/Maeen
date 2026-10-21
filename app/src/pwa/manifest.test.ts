import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
it("ships standalone install icons and resolves every URL under /Maeen/", () => {
  const manifest = JSON.parse(
    readFileSync(
      new URL("../../public/manifest.webmanifest", import.meta.url),
      "utf8",
    ),
  );
  const base = "https://example.org/Maeen/manifest.webmanifest";
  expect(manifest.display).toBe("standalone");
  expect(new URL(manifest.scope, base).pathname).toBe("/Maeen/");
  expect(new URL(manifest.start_url, base).pathname).toBe("/Maeen/");
  expect(manifest.name).toContain("MAEEN");
  for (const size of [192, 512]) {
    const icon = manifest.icons.find(
      (i: any) => i.sizes === `${size}x${size}` && i.purpose === "any",
    );
    expect(new URL(icon.src, base).pathname).toContain("/Maeen/");
    const bytes = readFileSync(
      new URL("../../public/" + icon.src, import.meta.url),
    );
    expect(bytes.readUInt32BE(16)).toBe(size);
    expect(bytes.readUInt32BE(20)).toBe(size);
  }
  expect(manifest.icons.some((i: any) => i.purpose === "maskable")).toBe(true);
});
