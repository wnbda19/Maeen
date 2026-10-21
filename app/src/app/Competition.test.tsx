// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Competition } from "./Competition";
import App from "./App";
afterEach(cleanup);
it("allows visible brand and mode text to supply accessible names", async () => {
  window.history.replaceState(null, "", "/#translator");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(<App />);
  await screen.findByRole("heading", { level: 1 });
  expect(document.querySelector(".brand")?.hasAttribute("aria-label")).toBe(
    false,
  );
  for (const button of document.querySelectorAll(".mode-choice"))
    expect(button.hasAttribute("aria-label")).toBe(false);
  vi.restoreAllMocks();
});
it("keeps the guide opt-in and exposes truthful capabilities without acquiring devices", () => {
  const acquire = vi.fn();
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: acquire },
  });
  render(<Competition arabic={false} information />);
  expect(
    screen.queryByRole("region", { name: "Competition demo guide" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Start demo guide" }));
  expect(
    screen.getByRole("region", { name: "Competition demo guide" }),
  ).toBeTruthy();
  expect(screen.getByText(/Arabic words: Not trained/)).toBeTruthy();
  expect(
    screen.getByText("ASL: Experimental, 24 static letters; J/Z unsupported.", {
      exact: true,
    }),
  ).toBeTruthy();
  expect(
    screen
      .getAllByRole("link")
      .every((a) => a.getAttribute("href")?.startsWith("#")),
  ).toBe(true);
  expect(acquire).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Exit demo guide" }));
  expect(
    screen.queryByRole("region", { name: "Competition demo guide" }),
  ).toBeNull();
});
it("keeps an active guide when moving between routes and localizes its controls", () => {
  const { rerender } = render(<Competition arabic information />);
  fireEvent.click(screen.getByRole("button", { name: "بدء دليل العرض" }));
  rerender(<Competition arabic={false} information={false} />);
  expect(
    screen.getByRole("region", { name: "Competition demo guide" }),
  ).toBeTruthy();
  expect(screen.queryByText("Competition information")).toBeNull();
});
