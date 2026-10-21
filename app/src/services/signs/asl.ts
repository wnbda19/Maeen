import type { Prediction } from "../recognition/forest";
export const ASL_LABELS = Array.from("ABCDEFGHIKLMNOPQRSTUVWXY");
type Point = { x: number; y: number; z: number };
export function normalizeAsl(
  points: readonly Point[],
  handedness: string,
): Float32Array | null {
  if (
    points.length !== 21 ||
    points.some((p) => ![p.x, p.y, p.z].every(Number.isFinite))
  )
    return null;
  const origin = points[0],
    palm = points[9],
    scale = Math.hypot(palm.x - origin.x, palm.y - origin.y, palm.z - origin.z);
  if (scale < 1e-4) return null;
  return new Float32Array(
    points.flatMap((p) => [
      ((p.x - origin.x) / scale) * (handedness === "Left" ? -1 : 1),
      (p.y - origin.y) / scale,
      (p.z - origin.z) / scale,
    ]),
  );
}
type Layer = {
  input: number;
  output: number;
  weights: number[];
  bias: number[];
};
export type AslModel = {
  format: string;
  version: string;
  labels: string[];
  normalization: string;
  layers: Layer[];
};
export function parseAslModel(value: unknown): AslModel {
  const m = value as AslModel;
  if (
    !m ||
    m.format !== "maeen-asl-mlp-v1" ||
    m.version !== "1.0.0-experimental" ||
    m.normalization !== "wrist-middle-mcp-handedness-v1" ||
    JSON.stringify(m.labels) !== JSON.stringify(ASL_LABELS) ||
    !Array.isArray(m.layers) ||
    m.layers.length !== 3
  )
    throw Error("Incompatible ASL model");
  const dims = [63, 128, 64, 24];
  m.layers.forEach((l, i) => {
    if (
      l.input !== dims[i] ||
      l.output !== dims[i + 1] ||
      !Array.isArray(l.weights) ||
      !Array.isArray(l.bias) ||
      l.weights.length !== l.input * l.output ||
      l.bias.length !== l.output ||
      [...l.weights, ...l.bias].some(
        (v) => typeof v !== "number" || !Number.isFinite(v),
      )
    )
      throw Error("Malformed ASL weights");
  });
  return m;
}
export function inferAsl(
  model: AslModel,
  features: Float32Array,
): { logits: Float64Array; scores: number[] } {
  if (features.length !== 63 || features.some((v) => !Number.isFinite(v)))
    throw Error("Invalid ASL features");
  let input: ArrayLike<number> = features;
  model.layers.forEach((l, index) => {
    const out = new Float64Array(l.output);
    for (let row = 0; row < l.output; row++) {
      let n = l.bias[row];
      for (let col = 0; col < l.input; col++)
        n += l.weights[row * l.input + col] * input[col];
      out[row] = index < 2 ? Math.max(0, n) : n;
    }
    input = out;
  });
  const logits = input as Float64Array,
    max = Math.max(...logits),
    exp = Array.from(logits, (n) => Math.exp(n - max)),
    sum = exp.reduce((a, b) => a + b, 0);
  return { logits, scores: exp.map((n) => n / sum) };
}
export class AslSmoother {
  private ema: number[] | null = null;
  reset() {
    this.ema = null;
  }
  accept(scores: number[] | null): Prediction | null {
    if (scores === null) {
      this.reset();
      return null;
    }
    if (
      scores.length !== 24 ||
      scores.some((v) => !Number.isFinite(v) || v < 0 || v > 1)
    ) {
      this.reset();
      return { label: "", score: 0 };
    }
    this.ema = this.ema
      ? scores.map((v, i) => 0.4 * v + 0.6 * this.ema![i])
      : [...scores];
    const ranked = this.ema
      .map((score, i) => ({ score, label: ASL_LABELS[i] }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    return {
      ...best,
      label:
        best.score >= 0.7 && best.score - ranked[1].score >= 0.15
          ? best.label
          : "",
    };
  }
}
