import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
const css = readFileSync(new URL("../app/design.css", import.meta.url), "utf8");
const token = (name: string) =>
  css.match(new RegExp(`--${name}:\\s*(#[a-f0-9]{6})`, "i"))![1];
function luminance(hex: string) {
  const rgb = hex
    .slice(1)
    .match(/../g)!
    .map((n) => parseInt(n, 16) / 255)
    .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function ratio(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
it("keeps normal text and meaningful control boundaries at AA contrast targets", () => {
  for (const [fg, bg] of [
    [token("ink"), token("surface")],
    [token("muted"), token("canvas")],
    [token("muted"), token("soft")],
    [token("brand"), token("surface")],
    ["#ffffff", token("brand")],
    ["#c2d7cd", token("rail")],
    ["#b7cfc0", "#0b211b"],
    ["#bfd9cb", "#102f28"],
    [token("muted"), "#e4f3e9"],
  ])
    expect(ratio(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
  expect(ratio(token("control-line"), token("surface"))).toBeGreaterThanOrEqual(
    3,
  );
  const placeholder = css.match(
    /textarea::placeholder\s*\{\s*color:\s*(#[a-f0-9]{6})/i,
  )![1];
  expect(ratio(placeholder, token("surface"))).toBeGreaterThanOrEqual(4.5);
});
