import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseForest, predict } from "./forest";
const bytes = readFileSync(
  new URL("../../../../models/arsl-forest.bin", import.meta.url),
);
const buffer = () => Uint8Array.from(bytes).buffer;
const labels = JSON.parse(
  readFileSync(
    new URL("../../../../models/arsl-labels.json", import.meta.url),
    "utf8",
  ),
).labels as string[];
describe("preserved ARSL model", () => {
  it("loads its actual 63-coordinate, 37-label, 100-tree contract", () => {
    const model = parseForest(buffer(), labels);
    expect([
      model.nFeatures,
      model.labels.length,
      model.trees.length,
      model.coordMode,
    ]).toEqual([63, 37, 100, "raw"]);
  });
  it("rejects truncated data and mismatched labels", () => {
    expect(() => parseForest(buffer().slice(0, 40), labels)).toThrow();
    expect(() => parseForest(buffer(), labels.slice(1))).toThrow();
  });
  it("rejects cyclic tree edges before inference", () => {
    const b = buffer();
    new DataView(b).setInt32(40, 0, true);
    expect(() => parseForest(b, labels)).toThrow();
  });
  it("rejects nonfinite and wrong-sized input, never substitutes a prediction", () => {
    const m = parseForest(buffer(), labels);
    expect(() => predict(m, [NaN, ...Array(62).fill(0)])).toThrow();
    expect(() => predict(m, [0])).toThrow();
  });
  it("matches original deployed forest traversal on deterministic vectors (not accuracy)", () => {
    const m = parseForest(buffer(), labels);
    for (let seed = 1; seed <= 8; seed++) {
      const x = Array.from(
        { length: 63 },
        (_, i) => Math.sin(seed * (i + 1)) * 0.5 + 0.5,
      );
      const view = new DataView(buffer()),
        votes = Array(37).fill(0);
      let offset = 28;
      for (let t = 0; t < 100; t++) {
        const count = view.getUint32(offset, true);
        offset += 4;
        let node = 0;
        for (let step = 0; step < count; step++) {
          const p = offset + 16 * node,
            f = view.getInt16(p, true),
            left = view.getInt32(p + 8, true);
          if (f < 0 || left < 0) {
            votes[view.getInt16(p + 2, true)]++;
            break;
          }
          node =
            x[f] <= view.getFloat32(p + 4, true)
              ? left
              : view.getInt32(p + 12, true);
        }
        offset += count * 16;
      }
      const best = votes.indexOf(Math.max(...votes));
      expect(predict(m, x)).toEqual({
        label: labels[best],
        score: votes[best] / 100,
      });
    }
  });
});
