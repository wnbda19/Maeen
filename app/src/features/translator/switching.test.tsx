// @vitest-environment jsdom
import { it, expect, vi, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useTranslator } from "./useTranslator";
import type { SignLanguageId } from "../../services/signs/registry";
const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  hands: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
}));
vi.mock("../../services/signs/registry", () => ({ loadSignModel: mocks.load }));
vi.mock("../../services/landmarks/hands", () => ({ createHands: mocks.hands }));
vi.mock("../../services/media/session", () => ({
  MediaSession: class {
    start = mocks.start;
    stop = mocks.stop;
  },
}));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
function setup() {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn() },
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  let tick: FrameRequestCallback = () => {};
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((cb: FrameRequestCallback) => {
      tick = cb;
      return 1;
    }),
  );
  const hand = Array.from({ length: 21 }, (_, i) => ({
    x: i * 0.01,
    y: i * 0.02,
    z: 0,
  }));
  const detector = {
    close: vi.fn(),
    detectForVideo: () => ({
      landmarks: [hand],
      handedness: [[{ categoryName: "Right" }]],
    }),
  };
  mocks.hands.mockResolvedValue(detector);
  const track = new EventTarget();
  mocks.start.mockResolvedValue({ getTracks: () => [track] });
  return { detector, track, tick: () => tick(0) };
}
it("active language switching disposes the model/detector and resets composition", async () => {
  const env = setup(),
    adapter = {
      predict: () => ({ label: "A", score: 0.95 }),
      dispose: vi.fn(),
    };
  mocks.load.mockResolvedValue(adapter);
  const { result, rerender } = renderHook(
    ({ language }: { language: SignLanguageId }) => useTranslator(language),
    { initialProps: { language: "asl" as SignLanguageId } },
  );
  const video = {
    srcObject: null,
    play: vi.fn().mockResolvedValue(undefined),
    readyState: 2,
    currentTime: 0,
    videoWidth: 640,
    videoHeight: 480,
  };
  result.current.video.current = video as unknown as HTMLVideoElement;
  await act(() => result.current.start());
  for (let i = 0; i < 13; i++)
    act(() => {
      video.currentTime++;
      env.tick();
    });
  expect(result.current.text).toBe("A");
  rerender({ language: "ksl" });
  expect(adapter.dispose).toHaveBeenCalledOnce();
  expect(env.detector.close).toHaveBeenCalledOnce();
  expect(result.current.text).toBe("");
  expect(result.current.label).toBe("");
  expect(result.current.score).toBe(0);
  expect(result.current.phase).toBe("idle");
});
it.each(["pagehide", "freeze", "maeen:shutdown"])(
  "camera shuts down safely on %s",
  async (event) => {
    const env = setup(),
      adapter = { predict: vi.fn(), dispose: vi.fn() };
    mocks.load.mockResolvedValue(adapter);
    const { result } = renderHook(() => useTranslator("asl"));
    result.current.video.current = {
      srcObject: null,
      play: async () => {},
      readyState: 2,
    } as unknown as HTMLVideoElement;
    await act(() => result.current.start());
    act(() => {
      (event === "freeze" ? document : window).dispatchEvent(new Event(event));
    });
    expect(result.current.phase).toBe("idle");
    expect(env.detector.close).toHaveBeenCalledOnce();
    expect(adapter.dispose).toHaveBeenCalledOnce();
  },
);
it("camera interruption stops capture and removes track listeners", async () => {
  const env = setup(),
    remove = vi.spyOn(env.track, "removeEventListener");
  mocks.load.mockResolvedValue({ predict: vi.fn(), dispose: vi.fn() });
  const { result } = renderHook(() => useTranslator("asl"));
  result.current.video.current = {
    srcObject: null,
    play: async () => {},
    readyState: 2,
  } as unknown as HTMLVideoElement;
  await act(() => result.current.start());
  act(() => env.track.dispatchEvent(new Event("mute")));
  expect(result.current.phase).toBe("error");
  expect(result.current.issue).toBe("busy");
  expect(remove).toHaveBeenCalledTimes(2);
});
it("a stale model load is cancelled before camera acquisition", async () => {
  setup();
  let resolve!: (a: any) => void;
  let signal!: AbortSignal;
  mocks.load.mockImplementation((_id: string, s: AbortSignal) => {
    signal = s;
    return new Promise((r) => {
      resolve = r;
    });
  });
  const { result, rerender } = renderHook(
    ({ language }: { language: SignLanguageId }) => useTranslator(language),
    { initialProps: { language: "asl" as SignLanguageId } },
  );
  let pending!: Promise<void>;
  act(() => {
    pending = result.current.start();
  });
  rerender({ language: "arsl" });
  expect(signal.aborted).toBe(true);
  const adapter = { predict: vi.fn(), dispose: vi.fn() };
  await act(async () => {
    resolve(adapter);
    await pending;
  });
  expect(adapter.dispose).toHaveBeenCalledOnce();
  expect(mocks.start).not.toHaveBeenCalled();
  expect(mocks.hands).not.toHaveBeenCalled();
});
