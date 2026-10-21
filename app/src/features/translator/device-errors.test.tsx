// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { parseForest } from "../../services/recognition/forest";
import { en } from "../../localization/strings";
import Translator from "./Translator";
import Radar from "../radar/Radar";
import { createHands } from "../../services/landmarks/hands";
vi.mock("../../services/landmarks/hands", () => ({
  createHands: vi.fn(async () => ({ close: () => {} })),
}));
vi.mock("../../services/recognition/load", () => ({
  loadForest: async () => {
    const bytes = readFileSync(
      new NodeURL("../../../../models/arsl-forest.bin", import.meta.url),
    );
    const labels = JSON.parse(
      readFileSync(
        new NodeURL("../../../../models/arsl-labels.json", import.meta.url),
        "utf8",
      ),
    ).labels;
    return parseForest(Uint8Array.from(bytes).buffer, labels);
  },
}));
const originalDevices = Object.getOwnPropertyDescriptor(
  navigator,
  "mediaDevices",
);
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});
afterEach(() => {
  cleanup();
  if (originalDevices)
    Object.defineProperty(navigator, "mediaDevices", originalDevices);
  else Reflect.deleteProperty(navigator, "mediaDevices");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it.each([
  ["NotAllowedError", en.permissionError],
  ["NotFoundError", en.missingError],
  ["NotReadableError", en.busyError],
])(
  "shows actionable %s feedback without producing a letter",
  async (name, message) => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn(async () => {
          throw new DOMException("test device refusal", name);
        }),
      },
    });
    render(<Translator t={en} />);
    fireEvent.click(screen.getByRole("button", { name: en.start }));
    expect((await screen.findByRole("alert")).textContent).toBe(message);
    expect(
      (screen.getByRole("textbox", { name: en.buffer }) as HTMLTextAreaElement)
        .value,
    ).toBe("");
    expect(
      (screen.getByRole("button", { name: en.start }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  },
);
it("reports model initialization failure separately", async () => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn() },
  });
  vi.mocked(createHands).mockRejectedValueOnce(new Error("runtime failed"));
  render(<Translator t={en} />);
  fireEvent.click(screen.getByRole("button", { name: en.start }));
  expect((await screen.findByRole("alert")).textContent).toBe(en.modelError);
});
it("shows unsupported-camera guidance before loading the model", async () => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: undefined,
  });
  render(<Translator t={en} />);
  fireEvent.click(screen.getByRole("button", { name: en.start }));
  expect((await screen.findByRole("alert")).textContent).toBe(
    en.unsupportedError,
  );
});
it("reports microphone permission denial and keeps an empty measured-event history", async () => {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: {
      getUserMedia: async () => {
        throw new DOMException("denied", "NotAllowedError");
      },
    },
  });
  vi.stubGlobal(
    "AudioContext",
    class {
      async resume() {}
      async close() {}
    },
  );
  render(<Radar t={en} />);
  fireEvent.click(screen.getByRole("button", { name: en.micStart }));
  expect((await screen.findByRole("alert")).textContent).toBe(
    en.permissionError,
  );
  expect(screen.getByText(en.noEvents)).toBeTruthy();
});
it("cancels a pending camera permission when switching to Words and stops a late stream", async () => {
  let resolveCapture!: (stream: MediaStream) => void;
  const getUserMedia = vi.fn(
    () =>
      new Promise<MediaStream>((resolve) => {
        resolveCapture = resolve;
      }),
  );
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });
  const stop = vi.fn();
  render(<Translator t={en} />);
  fireEvent.click(screen.getByRole("button", { name: en.start }));
  await waitFor(() => expect(getUserMedia).toHaveBeenCalledTimes(1));
  fireEvent.click(
    screen.getByRole("button", { name: /^Arabic Words/ }),
  );
  resolveCapture({ getTracks: () => [{ stop }] } as unknown as MediaStream);
  await waitFor(() => expect(stop).toHaveBeenCalledTimes(1));
  expect(screen.queryByRole("button", { name: en.start })).toBeNull();
  expect(screen.getByRole("heading", { name: en.wordTitle })).toBeTruthy();
});

