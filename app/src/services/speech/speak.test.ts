// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { speakArabic } from "./speak";
afterEach(() => vi.unstubAllGlobals());
it("reports unavailable Arabic voices without attempting speech", () => {
  const speak = vi.fn();
  vi.stubGlobal("speechSynthesis", {
    getVoices: () => [{ lang: "en-US" }],
    speak,
  });
  expect(speakArabic("مرحبا", vi.fn(), vi.fn())).toBe(false);
  expect(speak).not.toHaveBeenCalled();
});
it("does not let synchronous platform voice errors escape into the UI", () => {
  vi.stubGlobal("speechSynthesis", {
    getVoices: () => {
      throw new Error("voice service unavailable");
    },
  });
  expect(speakArabic("مرحبا", vi.fn(), vi.fn())).toBe(false);
});
