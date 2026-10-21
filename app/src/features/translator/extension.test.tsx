// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { en } from "../../localization/strings";
import Translator from "./Translator";
import axe from "axe-core";
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it("switches prominent modes without treating the alphabet model as a word model", () => {
  render(
    <main>
      <Translator t={en} />
    </main>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: /^Arabic Words/ }),
  );
  expect(
    screen.getByRole("heading", { name: "Direct word recognition" }),
  ).toBeTruthy();
  expect(
    screen.getByText(
      "No trained word model is connected. Direct recognition is in development.",
    ),
  ).toBeTruthy();
  expect(screen.queryByRole("button", { name: en.start })).toBeNull();
  expect(screen.getAllByText("No words detected.")).toHaveLength(2);
  expect(
    screen.getByText("No validated vocabulary is available yet."),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", { name: en.speak }).hasAttribute("disabled"),
  ).toBe(true);
});
it("preserves composed letters across modes and supports deletion and copying", async () => {
  const writeText = vi.fn(async () => {});
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    get: () => ({ writeText }),
  });
  render(
    <main>
      <Translator t={en} />
    </main>,
  );
  fireEvent.change(screen.getByLabelText(en.buffer), {
    target: { value: "بلا" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Delete last letter" }));
  expect((screen.getByLabelText(en.buffer) as HTMLTextAreaElement).value).toBe(
    "بل",
  );
  fireEvent.click(screen.getByRole("button", { name: "Copy text" }));
  await screen.findByText("Text copied.");
  expect(writeText).toHaveBeenCalledWith("بل");
  fireEvent.click(
    screen.getByRole("button", { name: /^Arabic Words/ }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: /^Arabic Letters/ }),
  );
  expect((screen.getByLabelText(en.buffer) as HTMLTextAreaElement).value).toBe(
    "بل",
  );
  expect(
    screen
      .getByRole("button", { name: "Add detected letter" })
      .hasAttribute("disabled"),
  ).toBe(true);
});
it("provides all 37 exact model labels without claiming missing hand-pose artwork", async () => {
  render(
    <main>
      <Translator t={en} />
    </main>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Learn Signs", exact: true }),
  );
  expect(
    screen.getByRole("list", { name: "Model label gallery" }).children,
  ).toHaveLength(37);
  fireEvent.click(screen.getByRole("button", { name: "Inspect هـ" }));
  expect(
    screen.getByText(
      (_, element) =>
        element?.tagName === "P" &&
        element.textContent === "Selected model label: هـ",
    ),
  ).toBeTruthy();
  expect(
    screen.getByText(/Verified hand-pose images are not available yet/),
  ).toBeTruthy();
  expect(screen.queryByRole("img")).toBeNull();
  expect(
    (
      await axe.run(document.body, {
        rules: { "color-contrast": { enabled: false } },
      })
    ).violations,
  ).toEqual([]);
});
it('reports clipboard refusal without clearing the composed text',async()=>{
 Object.defineProperty(navigator,'clipboard',{configurable:true,get:()=>({writeText:async()=>{throw new Error('clipboard denied');}})});
 render(<main><Translator t={en}/></main>);
 fireEvent.change(screen.getByLabelText(en.buffer),{target:{value:'سلام'}});
 fireEvent.click(screen.getByRole('button',{name:en.copyText}));
 await screen.findByText(en.copyFailed);
 expect((screen.getByLabelText(en.buffer) as HTMLTextAreaElement).value).toBe('سلام');
});
it('exposes an accessible word workspace with no actionable recognition or reset until a model exists',async()=>{
 render(<main><Translator t={en}/></main>);
 fireEvent.click(screen.getByRole('button',{name:new RegExp("^"+en.wordsMode)}));
 expect(screen.getByRole('button',{name:en.resetWords}).hasAttribute('disabled')).toBe(true);
 expect((await axe.run(document.body,{rules:{'color-contrast':{enabled:false}}})).violations).toEqual([]);
});

