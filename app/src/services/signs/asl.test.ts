import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { normalizeAsl, parseAslModel, inferAsl, AslSmoother } from "./asl";
it("normalizes position, scale and handedness independently of Arabic", () => {
  const p = Array.from({ length: 21 }, (_, i) => ({
    x: i * 0.01,
    y: i * 0.02,
    z: i * 0.005,
  }));
  const a = normalizeAsl(p, "Right");
  expect(a).not.toBeNull();
  const b = normalizeAsl(
    p.map((v) => ({ x: v.x * 2 + 3, y: v.y * 2 + 1, z: v.z * 2 - 4 })),
    "Right",
  );
  a!.forEach((v, i) => expect(v).toBeCloseTo(b![i], 4));
  const mirrored = normalizeAsl(
    p.map((v) => ({ ...v, x: -v.x })),
    "Left",
  );
  a!.forEach((v, i) => expect(mirrored![i]).toBeCloseTo(v, 6));
  expect(normalizeAsl([], "Right")).toBeNull();
  expect(
    normalizeAsl(
      p.map(() => ({ x: 0, y: 0, z: 0 })),
      "Right",
    ),
  ).toBeNull();
});
it("matches real PyTorch model logits on an extracted test image", () => {
  const model = parseAslModel(
    JSON.parse(
      readFileSync(
        new URL(
          "../../../../sign-models/asl-static/model.json",
          import.meta.url,
        ),
        "utf8",
      ),
    ),
  );
  const parity = JSON.parse(
    readFileSync(
      new URL("../../../../docs/phase5/asl-parity.json", import.meta.url),
      "utf8",
    ),
  );
  const result = inferAsl(model, new Float32Array(parity.features));
  result.logits.forEach((v, i) => expect(v).toBeCloseTo(parity.logits[i], 4));
  expect(result.scores.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
});
it("rejects incompatible or motion-letter model manifests", () => {
  expect(() => parseAslModel({ format: "other" })).toThrow();
  expect(() =>
    parseAslModel({ format: "maeen-asl-mlp-v1", labels: ["J"], layers: [] }),
  ).toThrow();
});
it("smoothing has Unknown and No Sign states and resets evidence", () => {
  const s = new AslSmoother();
  const scores = Array(24).fill(0);
  scores[0] = 0.95;
  expect(s.accept(scores)?.label).toBe("A");
  expect(s.accept(Array(24).fill(1 / 24))?.label).toBe("");
  expect(s.accept(scores)?.label).toBe("A");
  s.reset();
  expect(s.accept(Array(24).fill(1 / 24))?.label).toBe("");
  expect(s.accept(null)).toBeNull();
  expect(s.accept([NaN])?.label).toBe("");
});
