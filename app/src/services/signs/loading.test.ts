import { it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { loadSignModel } from "./registry";
const model = JSON.parse(
  readFileSync(
    new URL("../../../../sign-models/asl-static/model.json", import.meta.url),
    "utf8",
  ),
);
const labels = JSON.parse(
  readFileSync(
    new URL("../../../../sign-models/asl-static/labels.json", import.meta.url),
    "utf8",
  ),
);
it("loads only selected ASL assets and resets its smoothing when disposed", async () => {
  const fetch = vi.fn(async (url: string) => ({
    ok: true,
    json: async () => (url.endsWith("labels.json") ? labels : model),
  }));
  vi.stubGlobal("fetch", fetch);
  try {
    const adapter = await loadSignModel("asl", new AbortController().signal);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(
      fetch.mock.calls.every(([u]) => u.includes("sign-models/asl-static/")),
    ).toBe(true);
    expect(adapter.predict(undefined, "Right")).toBeNull();
    adapter.dispose();
  } finally {
    vi.unstubAllGlobals();
  }
});
it("does not fetch an aborted or unavailable model", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const controller = new AbortController();
  controller.abort();
  try {
    await expect(loadSignModel("asl", controller.signal)).rejects.toThrow();
    await expect(
      loadSignModel("ksl", new AbortController().signal),
    ).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});
it("rejects wrong ASL labels and failed model downloads", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => ({
      ok: true,
      json: async () =>
        url.endsWith("labels.json") ? { ...labels, labels: ["J"] } : model,
    })),
  );
  try {
    await expect(
      loadSignModel("asl", new AbortController().signal),
    ).rejects.toThrow("label mismatch");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false })),
    );
    await expect(
      loadSignModel("asl", new AbortController().signal),
    ).rejects.toThrow("unavailable");
  } finally {
    vi.unstubAllGlobals();
  }
});
