// @vitest-environment jsdom
import { it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import Translator from "./Translator";
import { en } from "../../localization/strings";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("switches languages independently of interface language and clears composed text", () => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(<Translator t={en} />);
  fireEvent.change(screen.getByLabelText(en.buffer), {
    target: { value: "نص" },
  });
  fireEvent.change(screen.getByLabelText("Sign Language"), {
    target: { value: "asl" },
  });
  expect((screen.getByLabelText(en.buffer) as HTMLTextAreaElement).value).toBe(
    "",
  );
  expect(screen.getByLabelText(en.buffer).getAttribute("dir")).toBe("ltr");
  expect(screen.getByText(/24 static letters/)).toBeTruthy();
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: /^Words/ }));
  expect(screen.queryByRole("button", { name: en.start })).toBeNull();
  expect(screen.queryByText(en.datasetRequired)).toBeNull();
  fireEvent.change(screen.getByLabelText("Sign Language"), {
    target: { value: "ksl" },
  });
  expect(
    screen.getByText("Research / Model unavailable", { selector: "dd" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /^Letters/ }));
  expect(screen.queryByRole("button", { name: en.start })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: en.learnMode }));
  expect(screen.queryByRole("list", { name: en.gallery })).toBeNull();
  fireEvent.change(screen.getByLabelText("Sign Language"), {
    target: { value: "arsl" },
  });
  expect(fetch).not.toHaveBeenCalled();
});

