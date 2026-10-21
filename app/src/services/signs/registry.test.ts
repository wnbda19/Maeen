import { it, expect, vi } from "vitest";
import { signLanguages, getSignLanguage, loadSignModel } from "./registry";
it("keeps three independent languages and truthful capability manifests", () => {
  expect(signLanguages.map((l) => l.id)).toEqual(["arsl", "asl", "ksl"]);
  expect(getSignLanguage("arsl").vocabulary.letters).toHaveLength(37);
  expect(getSignLanguage("asl").vocabulary.letters).toHaveLength(24);
  expect(getSignLanguage("asl").vocabulary.letters).not.toContain("J");
  expect(getSignLanguage("asl").vocabulary.letters).not.toContain("Z");
  expect(signLanguages.every((l) => !l.words.supported)).toBe(true);
  expect(getSignLanguage("ksl").letters.supported).toBe(false);
  expect(getSignLanguage("ksl").modelUrl).toBeNull();
  expect(getSignLanguage("ksl").vocabulary.letters).toEqual([]);
  expect(() => getSignLanguage("invalid")).toThrow();
});
it("registry imports and unsupported languages never fetch assets", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  try {
    await expect(
      loadSignModel("ksl", new AbortController().signal),
    ).rejects.toThrow("unavailable");
    expect(fetch).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});
