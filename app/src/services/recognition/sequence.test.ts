import { expect, it } from "vitest";
import { prepareSequence, TemporalBuffer, FEATURE_WIDTH } from "./sequence";
import type { TemporalSignFrame, Landmark3D } from "./words";
const point = (x: number, y: number): Landmark3D => ({ x, y, z: 0 });
function frame(t: number, shift = 0): TemporalSignFrame {
  return {
    timestampMs: t,
    hands: [
      {
        handedness: "right",
        landmarks: Array.from({ length: 21 }, () =>
          point(0.5 + shift + t / 10000, 0.5),
        ),
      },
    ],
    upperBody: [
      point(0.3 + shift, 0.4),
      point(0.7 + shift, 0.4),
      ...Array.from({ length: 6 }, () => point(0.5 + shift, 0.6)),
    ],
    face: [],
  };
}
it("resamples temporal movement to a fixed shape with explicit missing-hand masks", () => {
  const result = prepareSequence(
    [frame(0), frame(100), frame(200), frame(300)],
    { steps: 8, minFrames: 4 },
  );
  expect(result.shape).toEqual([1, 8, FEATURE_WIDTH]);
  expect(result.values.every(Number.isFinite)).toBe(true);
  expect(result.values[3]).toBe(0); // left hand missing
  expect(result.values[21 * 4 + 3]).toBe(1); // right hand present
  expect(result.values[21 * 4]).not.toBe(
    result.values[7 * FEATURE_WIDTH + 21 * 4],
  );
});
it("is translation and scale invariant without reflecting left and right hands", () => {
  const input = [frame(0), frame(100), frame(200), frame(300)];
  const translated = input.map((f) => ({
    ...f,
    hands: f.hands.map((h) => ({
      ...h,
      landmarks: h.landmarks.map((p) => ({
        ...p,
        x: p.x * 2 + 0.1,
        y: p.y * 2 + 0.1,
        z: p.z * 2,
      })),
    })),
    upperBody: f.upperBody.map((p) => ({
      ...p,
      x: p.x * 2 + 0.1,
      y: p.y * 2 + 0.1,
      z: p.z * 2,
    })),
  }));
  const a = prepareSequence(input, { minFrames: 4 }),
    b = prepareSequence(translated, { minFrames: 4 });
  a.values.forEach((v, i) => expect(v).toBeCloseTo(b.values[i], 5));
});
it("does not interpolate a hand through missing detections or a long frame gap", () => {
  const seq = [frame(0), { ...frame(100), hands: [] }, frame(500), frame(600)];
  const result = prepareSequence(seq, {
    steps: 7,
    minFrames: 4,
    maxGapMs: 150,
  });
  expect(result.values[FEATURE_WIDTH + 21 * 4 + 3]).toBe(0);
  expect(result.values[3 * FEATURE_WIDTH + 21 * 4 + 3]).toBe(0);
});
it("rejects unsorted, nonfinite, malformed, too short and unanchored sequences", () => {
  expect(() => prepareSequence([frame(1), frame(0)])).toThrow();
  expect(() => prepareSequence([frame(NaN)])).toThrow();
  expect(() => prepareSequence([frame(0)])).toThrow();
  expect(() =>
    prepareSequence(
      [0, 100, 200, 300].map((t) => ({ ...frame(t), upperBody: [] })),
      { minFrames: 4 },
    ),
  ).toThrow();
  expect(() =>
    prepareSequence(
      [0, 100, 200, 300].map((t) => ({
        ...frame(t),
        hands: [{ handedness: "left", landmarks: [point(0, 0)] }],
      })),
      { minFrames: 4 },
    ),
  ).toThrow();
});
it("bounds the temporal buffer, rejects time reversal and resets without retaining landmarks", () => {
  const buffer = new TemporalBuffer(250, 4);
  buffer.push(frame(0));
  buffer.push(frame(100));
  buffer.push(frame(200));
  buffer.push(frame(400));
  expect(buffer.frames.map((f) => f.timestampMs)).toEqual([200, 400]);
  expect(() => buffer.push(frame(300))).toThrow();
  buffer.reset();
  expect(buffer.frames).toEqual([]);
});
it("only permits a fully hand-free clip when explicitly preparing a No Sign negative", () => {
  const frames = [0, 100, 200, 300].map((t) => ({ ...frame(t), hands: [] }));
  expect(() => prepareSequence(frames, { minFrames: 4 })).toThrow();
  const result = prepareSequence(frames, { minFrames: 4, allowNoHands: true });
  expect(result.values[3]).toBe(0);
  expect(result.values[21 * 4 + 3]).toBe(0);
});
it("accounts for non-square image coordinates before normalizing shoulder scale", () => {
  const square = [0, 100, 200, 300].map((t) => ({
    ...frame(t),
    imageSize: { width: 100, height: 100 },
  }));
  const wide = square.map((f) => ({
    ...f,
    imageSize: { width: 200, height: 100 },
    hands: f.hands.map((h) => ({
      ...h,
      landmarks: h.landmarks.map((p) => ({ ...p, x: p.x / 2 })),
    })),
    upperBody: f.upperBody.map((p) => ({ ...p, x: p.x / 2 })),
  }));
  const a = prepareSequence(square, { minFrames: 4 }),
    b = prepareSequence(wide, { minFrames: 4 });
  a.values.forEach((value, i) => expect(value).toBeCloseTo(b.values[i], 5));
});
