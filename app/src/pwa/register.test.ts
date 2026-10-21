// @vitest-environment jsdom
import { it, expect, vi, afterEach } from "vitest";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it("registers a scoped worker once and exposes a real waiting update", async () => {
  vi.resetModules();
  const reg = Object.assign(new EventTarget(), {
    waiting: { postMessage: vi.fn() },
    installing: null,
    update: vi.fn(),
  });
  const sw = Object.assign(new EventTarget(), {
    register: vi.fn(async () => reg),
    controller: {},
    ready: Promise.resolve(reg),
  });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: sw,
  });
  const p = await import("./register");
  const reload = vi.fn();
  const cleanup = p.registerOffline(true, reload);
  p.registerOffline(true, reload);
  await Promise.resolve();
  expect(sw.register).toHaveBeenCalledOnce();
  expect(sw.register.mock.calls[0][0]).toContain("sw.js");
  expect(p.getPwaSnapshot().update).toBe(true);
  p.applyUpdate();
  expect(reg.waiting.postMessage).toHaveBeenCalledWith({
    type: "ACTIVATE_UPDATE",
  });
  sw.dispatchEvent(new Event("controllerchange"));
  expect(reload).toHaveBeenCalledOnce();
  cleanup?.();
});
it("never offers a fake install and consumes a real prompt once", async () => {
  vi.resetModules();
  const p = await import("./register");
  const cleanup = p.registerOffline(true, vi.fn());
  expect(p.getPwaSnapshot().install).toBe(false);
  const prompt = vi.fn(async () => {});
  const event = new Event("beforeinstallprompt", { cancelable: true });
  Object.assign(event, {
    prompt,
    userChoice: Promise.resolve({ outcome: "dismissed" }),
  });
  window.dispatchEvent(event);
  expect(p.getPwaSnapshot().install).toBe(true);
  await p.installApp();
  await p.installApp();
  expect(prompt).toHaveBeenCalledOnce();
  expect(p.getPwaSnapshot().install).toBe(false);
  cleanup?.();
});
it("reports failed registration and removes global listeners", async () => {
  vi.resetModules();
  const sw = Object.assign(new EventTarget(), {
    register: vi.fn(async () => {
      throw Error("unavailable");
    }),
    controller: null,
  });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: sw,
  });
  const p = await import("./register");
  const cleanup = p.registerOffline(true, vi.fn());
  await new Promise((r) => setTimeout(r, 0));
  expect(p.getPwaSnapshot().phase).toBe("error");
  cleanup?.();
  window.dispatchEvent(new Event("offline"));
  expect(p.getPwaSnapshot().offline).toBe(false);
});
it("reports a failed update check while keeping the current app usable", async () => {
  vi.resetModules();
  const reg = Object.assign(new EventTarget(), {
    active: {}, waiting: null, installing: null,
    update: vi.fn(async () => { throw Error("interrupted update"); }),
  });
  const sw = Object.assign(new EventTarget(), {
    register: vi.fn(async () => reg), controller: {}, ready: Promise.resolve(reg),
  });
  Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: sw });
  const p = await import("./register");
  const cleanup = p.registerOffline(true, vi.fn());
  await new Promise(r => setTimeout(r, 0));
  window.dispatchEvent(new Event("online"));
  await new Promise(r => setTimeout(r, 0));
  expect(reg.update).toHaveBeenCalledOnce();
  expect(p.getPwaSnapshot().phase).toBe("update-error");
  expect(p.getPwaSnapshot().update).toBe(false);
  cleanup?.();
});
