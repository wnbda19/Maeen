import type { Landmark3D, TemporalSignFrame } from "./words";
import { validPoints } from "../landmarks/temporal";
export const FEATURE_VERSION = "maeen-temporal-v1";
export const FEATURE_WIDTH = (21 * 2 + 8 + 17) * 4; // x,y,z,visibility mask per joint
export type SequenceOptions = {
  steps?: number;
  minFrames?: number;
  maxGapMs?: number;
  rotateShoulders?: boolean;
  allowNoHands?: boolean;
};
export function validateFrame(f: TemporalSignFrame) {
  if (
    f?.imageSize &&
    (!Number.isInteger(f.imageSize.width) ||
      !Number.isInteger(f.imageSize.height) ||
      f.imageSize.width < 1 ||
      f.imageSize.height < 1)
  )
    throw new Error("Invalid frame dimensions");
  if (
    !f ||
    !Number.isFinite(f.timestampMs) ||
    f.timestampMs < 0 ||
    !Array.isArray(f.hands) ||
    !Array.isArray(f.upperBody) ||
    !Array.isArray(f.face) ||
    f.hands.length > 2
  )
    throw new Error("Invalid frame");
  const seen = new Set<string>();
  for (const h of f.hands) {
    if (
      h.handedness === "unknown" ||
      seen.has(h.handedness) ||
      !["left", "right"].includes(h.handedness)
    )
      throw new Error("Ambiguous hand");
    seen.add(h.handedness);
    validPoints(h.landmarks, 21);
  }
  if (f.upperBody.length) validPoints(f.upperBody, 8);
  if (f.face.length) validPoints(f.face, 17);
}
export class TemporalBuffer {
  private items: TemporalSignFrame[] = [];
  constructor(
    private durationMs = 4000,
    private maxFrames = 180,
  ) {
    if (
      !Number.isFinite(durationMs) ||
      durationMs <= 0 ||
      !Number.isInteger(maxFrames) ||
      maxFrames < 2
    )
      throw new Error("Invalid buffer limits");
  }
  push(frame: TemporalSignFrame) {
    validateFrame(frame);
    if (
      this.items.length &&
      frame.timestampMs <= this.items[this.items.length - 1].timestampMs
    )
      throw new Error("Frames must increase in time");
    this.items.push(structuredClone(frame));
    this.items = this.items
      .filter((f) => f.timestampMs >= frame.timestampMs - this.durationMs)
      .slice(-this.maxFrames);
  }
  get frames(): readonly TemporalSignFrame[] {
    return structuredClone(this.items);
  }
  reset() {
    this.items = [];
  }
}
/** Clip-fixed translation/scale; optional clip-fixed rotation (off by default).
 * No reflection, handedness swapping or per-frame motion-erasing alignment.
 * Modality-relative depth remains separate: hand z is wrist-relative, pose z
 * shoulder-relative, face z nose-relative. These are not global 3D measurements.
 */
export function prepareSequence(
  frames: readonly TemporalSignFrame[],
  options: SequenceOptions = {},
) {
  const {
    steps = 32,
    minFrames = 8,
    maxGapMs = 200,
    rotateShoulders = false,
    allowNoHands = false,
  } = options;
  if (
    !Number.isInteger(steps) ||
    steps < 2 ||
    steps > 256 ||
    !Number.isInteger(minFrames) ||
    minFrames < 2 ||
    !Number.isFinite(maxGapMs) ||
    maxGapMs <= 0 ||
    frames.length < minFrames ||
    frames.length > 10000
  )
    throw new Error("Invalid sequence length/options");
  frames.forEach((f, i) => {
    validateFrame(f);
    if (i && f.timestampMs <= frames[i - 1].timestampMs)
      throw new Error("Non-monotonic sequence");
  });
  const aspect = frames[0].imageSize
    ? frames[0].imageSize.width / frames[0].imageSize.height
    : 1;
  if (
    frames.some(
      (f) =>
        (f.imageSize ? f.imageSize.width / f.imageSize.height : 1) !== aspect,
    )
  )
    throw new Error("Changing image aspect ratio");
  const visible = (p: Landmark3D | undefined) =>
    Boolean(p && (p.visibility ?? 1) >= 0.5);
  const anchor = frames.find(
    (f) =>
      visible(f.upperBody[0]) &&
      visible(f.upperBody[1]) &&
      Math.hypot(
        f.upperBody[1].x - f.upperBody[0].x,
        f.upperBody[1].y - f.upperBody[0].y,
      ) > 0.001,
  );
  if (!anchor) throw new Error("Visible shoulders required");
  if (!allowNoHands && !frames.some((f) => f.hands.length))
    throw new Error("No hand observations");
  const [l, r] = anchor.upperBody,
    origin = { x: (l.x + r.x) / 2, y: (l.y + r.y) / 2, z: (l.z + r.z) / 2 };
  const scale = Math.hypot((r.x - l.x) * aspect, r.y - l.y),
    angle = rotateShoulders ? Math.atan2(r.y - l.y, (r.x - l.x) * aspect) : 0,
    c = Math.cos(angle),
    s = Math.sin(angle);
  const encode = (f: TemporalSignFrame) => {
    const row = new Float32Array(FEATURE_WIDTH);
    let index = 0;
    const group = (
      points: readonly Landmark3D[],
      count: number,
      zOrigin: number,
    ) => {
      for (let i = 0; i < count; i++, index += 4) {
        const p = points[i];
        if (!visible(p)) continue;
        const x = ((p.x - origin.x) * aspect) / scale,
          y = (p.y - origin.y) / scale;
        row[index] = x * c + y * s;
        row[index + 1] = -x * s + y * c;
        row[index + 2] = ((p.z - zOrigin) * aspect) / scale;
        row[index + 3] = 1;
      }
    };
    for (const side of ["left", "right"]) {
      const h = f.hands.find((h) => h.handedness === side);
      group(h?.landmarks ?? [], 21, h?.landmarks[0].z ?? 0);
    }
    group(f.upperBody, 8, origin.z);
    group(f.face, 17, f.face[0]?.z ?? 0);
    if (row.some((x) => !Number.isFinite(x)))
      throw new Error("Nonfinite normalized features");
    return row;
  };
  const rows = frames.map(encode),
    values = new Float32Array(steps * FEATURE_WIDTH);
  const first = frames[0].timestampMs,
    last = frames[frames.length - 1].timestampMs;
  let lower = 0,
    observed = 0;
  for (let step = 0; step < steps; step++) {
    const time = first + ((last - first) * step) / (steps - 1);
    while (lower + 1 < frames.length && frames[lower + 1].timestampMs < time)
      lower++;
    const upper = Math.min(lower + 1, frames.length - 1),
      a = frames[lower].timestampMs,
      b = frames[upper].timestampMs;
    const exact = time === a ? lower : time === b ? upper : -1;
    if (exact >= 0) {
      values.set(rows[exact], step * FEATURE_WIDTH);
      observed++;
      continue;
    }
    if (b - a > maxGapMs) continue;
    const ratio = (time - a) / (b - a);
    for (let feature = 0; feature < FEATURE_WIDTH; feature += 4) {
      if (!rows[lower][feature + 3] || !rows[upper][feature + 3]) continue;
      const base = step * FEATURE_WIDTH + feature;
      for (let axis = 0; axis < 3; axis++)
        values[base + axis] =
          rows[lower][feature + axis] * (1 - ratio) +
          rows[upper][feature + axis] * ratio;
      values[base + 3] = 1;
    }
    observed++;
  }
  return {
    version: FEATURE_VERSION,
    shape: [1, steps, FEATURE_WIDTH] as const,
    values,
    durationMs: last - first,
    temporalCoverage: observed / steps,
  };
}
