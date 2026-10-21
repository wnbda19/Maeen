// @vitest-environment jsdom
import { it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import WordMode from "./WordMode";
import { en } from "../../localization/strings";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("keeps words explicitly unimplemented and does not fetch a model or request a camera", () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  render(
    <main>
      <WordMode t={en} />
    </main>,
  );
  expect(
    screen.getByText("Not Implemented / Data Access Required"),
  ).toBeTruthy();
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: en.start })).toBeNull();
});
