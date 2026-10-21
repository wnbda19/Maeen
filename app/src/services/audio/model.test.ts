import { it, expect, vi } from "vitest";
import { AudioModel } from "./model";
function fake() {
  return {
    postMessage: vi.fn(),
    terminate: vi.fn(),
    onmessage: null as null | ((e: any) => void),
    onerror: null as null | (() => void),
  };
}
it("loads lazily, bounds inference to one request and releases worker", async () => {
  const w = fake();
  const make = vi.fn(() => w as unknown as Worker);
  const model = new AudioModel(make);
  expect(make).not.toHaveBeenCalled();
  const ready = model.load("/Maeen/");
  w.onmessage?.({ data: { type: "ready", loadMs: 20 } });
  await expect(ready).resolves.toBe(20);
  const callback = vi.fn();
  model.onResult = callback;
  model.infer(new Float32Array(15600), 16000);
  model.infer(new Float32Array(15600), 16000);
  expect(w.postMessage).toHaveBeenCalledTimes(2);
  w.onmessage?.({ data: { type: "result", scores: [], inferenceMs: 5 } });
  expect(callback).toHaveBeenCalledOnce();
  model.close();
  expect(w.terminate).toHaveBeenCalledOnce();
});
it("rejects model failures and reports inference failures", async () => {
  const w = fake();
  const model = new AudioModel(() => w as unknown as Worker);
  const p = model.load("/");
  w.onmessage?.({ data: { type: "error", message: "missing model" } });
  await expect(p).rejects.toThrow("missing model");
  model.close();
});
it("reports worker errors and ignores malformed audio", async () => {
  const w = fake();
  const m = new AudioModel(() => w as unknown as Worker);
  const p = m.load("/");
  w.onmessage?.({ data: { type: "ready", loadMs: 1 } });
  await p;
  const failure = vi.fn();
  m.onFailure = failure;
  m.infer(new Float32Array([NaN]), 16000);
  expect(w.postMessage).toHaveBeenCalledOnce();
  w.onerror?.();
  expect(failure).toHaveBeenCalledOnce();
  m.close();
});
it("times out stalled inference so the caller can fall back", async () => {
  vi.useFakeTimers();
  try {
    const w = fake();
    const m = new AudioModel(() => w as unknown as Worker);
    const p = m.load("/");
    w.onmessage?.({ data: { type: "ready", loadMs: 1 } });
    await p;
    m.onFailure = vi.fn();
    m.infer(new Float32Array(15600), 16000);
    vi.advanceTimersByTime(10001);
    expect(m.onFailure).toHaveBeenCalledOnce();
    m.close();
  } finally {
    vi.useRealTimers();
  }
});
