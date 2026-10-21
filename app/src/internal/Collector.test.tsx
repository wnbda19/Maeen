// @vitest-environment jsdom
import { afterEach, beforeEach, it, expect, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  act,
} from "@testing-library/react";
import Collector from "./Collector";
import * as store from "./recording";
vi.mock("./recording", async () => ({
  ...(await vi.importActual("./recording")),
  listClips: vi.fn(async () => []),
  saveClip: vi.fn(async () => {}),
  readClip: vi.fn(),
  download: vi.fn(),
}));

it("does not include delayed codec flush time in recording duration", async () => {
  let last!: Capture;
  class Delayed extends Capture {
    constructor() {
      super();
      last = this;
    }
    stop() {
      this.state = "inactive";
      this.ondataavailable?.({ data: new Blob(["unit event only"]) });
    }
  }
  vi.stubGlobal("MediaRecorder", Delayed);
  const stop = vi.fn();
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop }] })),
    },
  });
  let now = 0;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  render(<Collector />);
  consent();
  fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
  await waitFor(() =>
    expect(
      (
        screen.getByRole("button", {
          name: "Stop and save locally",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false),
  );
  now = 4000;
  fireEvent.click(
    screen.getByRole("button", { name: "Stop and save locally" }),
  );
  now = 20000;
  await act(async () => last.onstop?.());
  expect(store.saveClip).toHaveBeenCalled();
  expect(
    vi.mocked(store.saveClip).mock.calls[0][0].metadata.durationSeconds,
  ).toBe(4);
});
class Capture {
  static isTypeSupported() {
    return true;
  }
  state = "inactive";
  mimeType = "video/webm";
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["unit capture event only"]) });
    this.onstop?.();
  }
}

it("ignores an old cancelled recorder callback after a new capture starts", async () => {
  const captures: Capture[] = [];
  class Delayed extends Capture {
    constructor() {
      super();
      captures.push(this);
    }
    stop() {
      this.state = "inactive";
    }
  }
  vi.stubGlobal("MediaRecorder", Delayed);
  const firstStop = vi.fn(),
    secondStop = vi.fn();
  const acquire = vi
    .fn()
    .mockResolvedValueOnce({ getTracks: () => [{ stop: firstStop }] })
    .mockResolvedValueOnce({ getTracks: () => [{ stop: secondStop }] });
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: acquire },
  });
  render(<Collector />);
  consent();
  fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
  await waitFor(() => expect(captures).toHaveLength(1));
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
  await waitFor(() => expect(captures).toHaveLength(2));
  await act(async () => captures[0].onstop?.());
  expect(secondStop).not.toHaveBeenCalled();
  expect(store.saveClip).not.toHaveBeenCalled();
});
beforeEach(() => {
  vi.stubGlobal("MediaRecorder", Capture);
  vi.mocked(store.listClips).mockResolvedValue([]);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
function consent() {
  fireEvent.change(screen.getByLabelText("Written-consent reference"), {
    target: { value: "C-S001-v2" },
  });
  fireEvent.click(screen.getByRole("checkbox"));
}
it("starts with consent required, zero progress, and a link rather than copied reference media", () => {
  render(<Collector />);
  expect(
    (
      screen.getByRole("button", {
        name: "Start recording",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(screen.getByText("0 / 5,625 slots recorded locally")).toBeTruthy();
  expect(screen.getByRole("link").getAttribute("href")).toBe(
    "https://sshi.sa/category/23/972",
  );
});
it("reports denied camera access without saving", async () => {
  const getUserMedia = vi.fn().mockRejectedValue(Error("Camera denied"));
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
  render(<Collector />);
  consent();
  fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe("Camera denied"),
  );
  expect(store.saveClip).not.toHaveBeenCalled();
});
it("stops a late camera stream when the collector unmounts", async () => {
  let deliver!: (s: MediaStream) => void;
  const getUserMedia = vi.fn(
    () => new Promise<MediaStream>((r) => (deliver = r)),
  );
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
  const view = render(<Collector />);
  consent();
  fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
  await waitFor(() => expect(getUserMedia).toHaveBeenCalled());
  view.unmount();
  const stop = vi.fn();
  await act(async () =>
    deliver({ getTracks: () => [{ stop }] } as unknown as MediaStream),
  );
  expect(stop).toHaveBeenCalled();
  expect(store.saveClip).not.toHaveBeenCalled();
});
it("cancels pending storage/camera work if consent is unchecked", async () => {
  const getUserMedia = vi.fn();
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
  render(<Collector />);
  await waitFor(() => expect(store.listClips).toHaveBeenCalled());
  let release!: (v: []) => void;
  vi.mocked(store.listClips).mockImplementationOnce(
    () => new Promise((r) => (release = r)),
  );
  consent();
  fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toContain("Camera is off"),
  );
  fireEvent.click(screen.getByRole("checkbox"));
  await act(async () => release([]));
  expect(getUserMedia).not.toHaveBeenCalled();
});
it("stores a valid capture with pending QC and genuine first-party provenance declarations", async () => {
  const stop = vi.fn();
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop }] })),
    },
  });
  let now = 0;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  render(<Collector />);
  consent();
  fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
  await waitFor(() =>
    expect(
      (
        screen.getByRole("button", {
          name: "Stop and save locally",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false),
  );
  now = 4000;
  fireEvent.click(
    screen.getByRole("button", { name: "Stop and save locally" }),
  );
  await waitFor(() => expect(store.saveClip).toHaveBeenCalled());
  const saved = vi.mocked(store.saveClip).mock.calls[0][0];
  expect(saved.metadata.clipId).toBe("S001_W101_C01_R01_T01");
  expect(saved.metadata.qc.accepted).toBe(false);
  expect(saved.metadata.source).toBe("first-party");
  expect(stop).toHaveBeenCalled();
});
