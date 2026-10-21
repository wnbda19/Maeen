import { expect, it } from "vitest";
import { readPreferences, defaultPreferences } from "./preferences";
it("rejects malformed preferences and ignores untrusted option values", () => {
  expect(readPreferences("{bad")).toEqual(defaultPreferences);
  expect(
    readPreferences('{"motion":"fast","textSize":"huge","contrast":"low"}'),
  ).toEqual(defaultPreferences);
});
it("restores only supported accessibility preferences", () => {
  expect(
    readPreferences(
      '{"motion":"reduce","textSize":"large","contrast":"high","extra":1}',
    ),
  ).toEqual({ motion: "reduce", textSize: "large", contrast: "high" });
});
