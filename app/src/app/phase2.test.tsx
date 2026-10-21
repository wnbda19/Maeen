// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import App from "./App";
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/Maeen/#settings");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it("has six primary navigation destinations and accessible settings at the GitHub Pages subpath", async () => {
  render(<App />);
  await screen.findByRole("heading", { name: "تجربة تناسبك" });
  const nav = screen.getByRole("navigation");
  expect(nav.querySelectorAll("a")).toHaveLength(6);
  expect(
    [...nav.querySelectorAll("a")].map((a) => a.getAttribute("href")),
  ).toEqual(["#home", "#translator", "#radar", "#dictionary", "#more", "#settings"]);
  const result = await axe.run(document.body, {
    rules: { "color-contrast": { enabled: false } },
  });
  expect(result.violations.map((v) => v.id)).toEqual([]);
});
it("persists reduced motion, larger text and higher contrast without losing the route", async () => {
  const mounted = render(<App />);
  await screen.findByLabelText("الحركة");
  fireEvent.change(screen.getByLabelText("الحركة"), {
    target: { value: "reduce" },
  });
  fireEvent.change(screen.getByLabelText("حجم النص"), {
    target: { value: "large" },
  });
  fireEvent.change(screen.getByLabelText("التباين"), {
    target: { value: "high" },
  });
  expect(document.documentElement.dataset.motion).toBe("reduce");
  expect(document.documentElement.dataset.textSize).toBe("large");
  expect(document.documentElement.dataset.contrast).toBe("high");
  mounted.unmount();
  render(<App />);
  await screen.findByLabelText("الحركة");
  expect((screen.getByLabelText("الحركة") as HTMLSelectElement).value).toBe(
    "reduce",
  );
  expect(window.location.pathname).toBe("/Maeen/");
  expect(window.location.hash).toBe("#settings");
});
it("switches settings language and exposes permission guidance without requesting devices", async () => {
  render(<App />);
  await screen.findByRole("heading", { name: "تجربة تناسبك" });
  fireEvent.click(screen.getByRole("button", { name: "English", exact: true }));
  await screen.findByRole("heading", { name: "Make MAEEN yours" });
  expect(document.documentElement.dir).toBe("ltr");
  expect(
    screen.getByText(/Opening this settings page does not start a device/),
  ).toBeTruthy();
});
