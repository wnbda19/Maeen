// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SpeechControls } from "./SpeechControls";
import { en } from "../localization/strings";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("resets speech controls when the message changes during speech", () => {
  vi.stubGlobal("speechSynthesis", {
    getVoices: () => [{ lang: "ar-SA" }],
    cancel: vi.fn(),
    speak: vi.fn(),
  });
  vi.stubGlobal(
    "SpeechSynthesisUtterance",
    class {
      constructor(public text: string) {}
    },
  );
  const view = render(<SpeechControls text="مرحبا" t={en} />);
  fireEvent.click(screen.getByRole("button", { name: en.speak }));
  expect(
    (screen.getByRole("button", { name: en.stopSpeech }) as HTMLButtonElement)
      .disabled,
  ).toBe(false);
  view.rerender(<SpeechControls text="" t={en} />);
  expect(
    (screen.getByRole("button", { name: en.stopSpeech }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});
