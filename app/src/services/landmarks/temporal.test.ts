import { expect, it } from "vitest";
import { toTemporalFrame } from "./temporal";
const points = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ x: i / n, y: 0.5, z: 0 }));
it("extracts separate left and right hands, eight body joints and selected face landmarks", () => {
  const f = toTemporalFrame(123, {
    hands: {
      landmarks: [points(21), points(21)],
      handedness: [[{ categoryName: "Left" }], [{ categoryName: "Right" }]],
    },
    pose: { landmarks: [points(33)] },
    face: { faceLandmarks: [points(468)] },
  });
  expect(f.hands.map((h) => h.handedness)).toEqual(["left", "right"]);
  expect(f.upperBody).toHaveLength(8);
  expect(f.face).toHaveLength(17);
});
it("represents missing modalities explicitly and rejects duplicate hands or malformed detector output", () => {
  expect(toTemporalFrame(0, {})).toEqual({
    timestampMs: 0,
    hands: [],
    upperBody: [],
    face: [],
  });
  expect(() => toTemporalFrame(NaN, {})).toThrow();
  expect(() =>
    toTemporalFrame(0, {
      hands: {
        landmarks: [points(2)],
        handedness: [[{ categoryName: "Left" }]],
      },
    }),
  ).toThrow();
  expect(() =>
    toTemporalFrame(0, {
      hands: {
        landmarks: [points(21), points(21)],
        handedness: [[{ categoryName: "Left" }], [{ categoryName: "Left" }]],
      },
    }),
  ).toThrow();
});
