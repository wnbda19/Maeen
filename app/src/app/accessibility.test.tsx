// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import axe from "axe-core";
import App from "./App";
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/#home");
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it.each([
  ["home", "مساحة أوضح للتواصل."],
  ["translator", "من حركة اليد إلى حرف عربي"],
  ["radar", "الرادار الذكي للأصوات"],
  ["dictionary", "كلمات تساعد على التواصل"],
  ["about", "مُعِين، بخطوات يمكن التحقق منها"],
])(
  "exposes a named heading and no structural axe violations on %s",
  async (route, heading) => {
    window.history.replaceState(null, "", `/#${route}`);
    render(<App />);
    await screen.findByRole("heading", { level: 1, name: heading });
    const result = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(
      result.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`,
      ),
    ).toEqual([]);
    expect(screen.getByRole("main")).toBe(document.activeElement);
  },
);
it("switches language and direction and retains an editable Arabic communication message", async () => {
  window.history.replaceState(null, "", "/#dictionary");
  render(<App />);
  await screen.findByRole("heading", { name: "كلمات تساعد على التواصل" });
  fireEvent.click(screen.getByRole("button", { name: "English" }));
  await screen.findByRole("heading", { name: "Words to help you connect" });
  expect(document.documentElement.dir).toBe("ltr");
  fireEvent.change(screen.getByRole("searchbox"), {
    target: { value: "دواء" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "دواء وعلاج Medicine and treatment" }),
  );
  expect(
    (
      screen.getByRole("textbox", {
        name: "Your message",
      }) as HTMLTextAreaElement
    ).value,
  ).toBe("دواء وعلاج");
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  expect(
    (
      screen.getByRole("textbox", {
        name: "Your message",
      }) as HTMLTextAreaElement
    ).value,
  ).toBe("");
});
