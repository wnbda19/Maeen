import { it, expect } from "vitest";
import { installMode } from "./install";
it("install availability distinguishes prompts, iOS guidance and standalone", () => {
  expect(installMode(false, false, "Chrome Windows", 0)).toBe("none");
  expect(installMode(true, false, "Chrome Android", 0)).toBe("prompt");
  expect(installMode(false, false, "iPhone Safari", 5)).toBe("ios");
  expect(installMode(false, false, "Macintosh Safari", 5)).toBe("ios");
  expect(installMode(true, true, "iPhone Safari", 5)).toBe("none");
});
