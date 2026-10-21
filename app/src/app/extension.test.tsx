// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import App from "./App";
import Radar from "../features/radar/Radar";
import { en } from "../localization/strings";
import axe from "axe-core";
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/Maeen/#more");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it("keeps original integration concepts visible through the sixth primary destination", async () => {
  render(<App />);
  await screen.findByRole("heading", { name: "مُعِين، في تفاصيل يومك" });
  expect(
    screen
      .getByRole("navigation")
      .querySelector('a[href="#more"]')
      ?.getAttribute("aria-current"),
  ).toBe("page");
  for (const text of [
    "أوقات الصلاة",
    "القبلة",
    "الساعة الذكية",
    "السيارة وCarPlay",
    "الاستشارة الطبية",
    "الطوارئ وSOS",
    "الإشعارات والاهتزاز",
  ])
    expect(screen.getByText(text)).toBeTruthy();
  expect(
    screen.getByRole("list", { name: "مواقف الحياة اليومية" }).children,
  ).toHaveLength(14);
  expect(document.body.textContent).not.toMatch(/BLE متصل|248°|متصل بالساعة/);
  expect(
    (
      await axe.run(document.body, {
        rules: { "color-contrast": { enabled: false } },
      })
    ).violations,
  ).toEqual([]);
});
it("keeps real tool links and English future-state explanations at the subpath", async () => {
  render(<App />);
  await screen.findByRole("heading", { name: "مُعِين، في تفاصيل يومك" });
  fireEvent.click(screen.getByRole("button", { name: "English", exact: true }));
  await screen.findByRole("heading", { name: "MAEEN, throughout your day" });
  expect(
    screen.getByRole("main").querySelector('a[href="#radar"]'),
  ).toBeTruthy();
  expect(screen.getByText("Prayer times")).toBeTruthy();
  expect(window.location.pathname).toBe("/Maeen/");
  expect(document.documentElement.dir).toBe("ltr");
});
it("keeps radar history empty and separates four unavailable acoustic capabilities", () => {
  render(
    <main>
      <Radar t={en} />
    </main>,
  );
  expect(screen.getByText(en.noEvents)).toBeTruthy();
  expect(
    screen.getByText(
      "YAMNet sound recognition with microphone-level fallback.",
    ),
  ).toBeTruthy();
  expect(
    screen
      .getByRole("group", { name: "Sound categories" })
      .querySelectorAll("input"),
  ).toHaveLength(10);
  expect(screen.getByLabelText(en.audioLevel).getAttribute("value")).toBe(
    "-100",
  );
  expect(screen.queryByText(/90°|76 dB|Connected/)).toBeNull();
});
it("uses Arabic system fallbacks without downloading or redistributing a font", () => {
  const css = readFileSync(
    new NodeURL("./design.css", import.meta.url),
    "utf8",
  );
  expect(css).toContain('--font-arabic: Tahoma, "Segoe UI", Arial, sans-serif');
  expect(css).toContain('[lang="ar"]');
  expect(css).not.toMatch(/@font-face|fonts.googleapis|\.woff/);
});
