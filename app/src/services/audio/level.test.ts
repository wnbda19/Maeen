import { it, expect } from "vitest";
import { dbfs } from "./level";
it("measures full scale, half amplitude and silence without pretending SPL", () => {
  expect(dbfs(new Float32Array([1, -1]))).toBe(0);
  expect(dbfs(new Float32Array([0.5, -0.5]))).toBeCloseTo(-6.0206);
  expect(dbfs(new Float32Array(64))).toBe(-100);
});
