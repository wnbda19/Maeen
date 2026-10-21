// @vitest-environment jsdom
import { it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";
import { useRadar } from "./useRadar";
const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  close: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
}));
vi.mock("../../services/audio/model", () => ({
  AudioModel: class {
    load = mocks.load;
    close = mocks.close;
  },
}));
vi.mock("../../services/media/session", () => ({
  MediaSession: class {
    start = mocks.start;
    stop = mocks.stop;
  },
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function setup() {
  const track = new EventTarget();
  let instance: any;
  mocks.start.mockResolvedValue({ getTracks: () => [track] });
  mocks.load.mockRejectedValue(Error("offline"));
  vi.stubGlobal(
    "AudioContext",
    class {
      constructor() {
        instance = this;
      }
      state = "running";
      onstatechange: (() => void) | null = null;
      resume = vi.fn().mockResolvedValue(undefined);
      close = vi.fn().mockResolvedValue(undefined);
      createAnalyser = () => ({
        fftSize: 2048,
        getFloatTimeDomainData: (a: Float32Array) => a.fill(0.2),
      });
      createMediaStreamSource = () => ({ connect: vi.fn() });
    },
  );
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn() },
  });
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  return { track, context: () => instance };
}
it("model failure retains active microphone-level fallback and level alerts", async () => {
  setup();
  const { result } = renderHook(() => useRadar());
  await act(() => result.current.start());
  await waitFor(() => expect(result.current.aiState).toBe("fallback"));
  expect(result.current.active).toBe(true);
  expect(result.current.events).toHaveLength(1);
  act(() => result.current.stop());
  expect(result.current.active).toBe(false);
  expect(mocks.close).toHaveBeenCalled();
});
it.each(["pagehide", "freeze", "maeen:shutdown"])(
  "microphone shuts down safely on %s",
  async (event) => {
    const env = setup();
    const { result } = renderHook(() => useRadar());
    await act(() => result.current.start());
    act(() => {
      (event === "freeze" ? document : window).dispatchEvent(new Event(event));
    });
    expect(result.current.active).toBe(false);
    expect(env.context().close).toHaveBeenCalled();
    expect(env.context().onstatechange).toBeNull();
  },
);
it("microphone mute removes listeners and stops the session", async () => {
  const env = setup(),
    remove = vi.spyOn(env.track, "removeEventListener");
  const { result } = renderHook(() => useRadar());
  await act(() => result.current.start());
  act(() => env.track.dispatchEvent(new Event("mute")));
  expect(result.current.issue).toBe("busy");
  expect(result.current.active).toBe(false);
  expect(remove).toHaveBeenCalledTimes(2);
});
it("audio suspension stops rather than pretending to keep listening", async () => {
  const env = setup();
  const { result } = renderHook(() => useRadar());
  await act(() => result.current.start());
  act(() => {
    env.context().state = "suspended";
    env.context().onstatechange?.();
  });
  expect(result.current.active).toBe(false);
  expect(result.current.issue).toBe("busy");
});
it("explicit level mode never attempts model loading", async () => {
  setup();
  mocks.load.mockClear();
  const { result } = renderHook(() => useRadar());
  act(() => result.current.setAiEnabled(false));
  await act(() => result.current.start());
  expect(result.current.aiState).toBe("fallback");
  expect(mocks.load).not.toHaveBeenCalled();
});
it("unsupported microphone never attempts recognition", async () => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: undefined,
  });
  mocks.load.mockClear();
  const { result } = renderHook(() => useRadar());
  await act(() => result.current.start());
  expect(result.current.phase).toBe("unsupported");
  expect(mocks.load).not.toHaveBeenCalled();
});
