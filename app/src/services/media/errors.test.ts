import { expect, it } from "vitest";
import { captureIssue } from "./errors";
it.each([
  ["NotAllowedError", "permission"],
  ["NotFoundError", "missing"],
  ["NotReadableError", "busy"],
  ["NotSupportedError", "unsupported"],
])("maps %s into actionable device feedback", (name, expected) => {
  expect(captureIssue({ name }, "capture")).toBe(expected);
});
it("keeps model initialization failures separate from capture failures", () => {
  expect(captureIssue(new Error("WASM failed"), "model")).toBe("model");
});
