import type { Landmark3D, TemporalSignFrame } from "../recognition/words";
// MediaPipe indices; this order is part of maeen-temporal-v1.
export const UPPER_BODY_INDICES = [11, 12, 13, 14, 15, 16, 23, 24] as const;
export const FACE_INDICES = [
  1, 4, 13, 14, 33, 61, 70, 105, 107, 133, 152, 263, 291, 300, 334, 336, 362,
] as const;
export type DetectorResults = {
  hands?: {
    landmarks: Landmark3D[][];
    handedness: { categoryName: string }[][];
  };
  pose?: { landmarks: Landmark3D[][] };
  face?: { faceLandmarks: Landmark3D[][] };
};
export function validPoints(points: readonly Landmark3D[], count: number) {
  if (
    points.length !== count ||
    points.some(
      (p) =>
        ![p.x, p.y, p.z].every(Number.isFinite) ||
        (p.visibility !== undefined &&
          (!Number.isFinite(p.visibility) ||
            p.visibility < 0 ||
            p.visibility > 1)),
    )
  )
    throw new Error("Invalid landmark points");
}
/** Adapts actual SDK results, without acquiring media or inventing missing joints. */
export function toTemporalFrame(
  timestampMs: number,
  input: DetectorResults,
): TemporalSignFrame {
  if (!Number.isFinite(timestampMs) || timestampMs < 0)
    throw new Error("Invalid timestamp");
  const hands: TemporalSignFrame["hands"][number][] = [];
  if (input.hands) {
    if (
      input.hands.landmarks.length > 2 ||
      input.hands.handedness.length !== input.hands.landmarks.length
    )
      throw new Error("Invalid hand results");
    input.hands.landmarks.forEach((points, i) => {
      validPoints(points, 21);
      const name = input.hands!.handedness[i]?.[0]?.categoryName?.toLowerCase();
      if (
        (name !== "left" && name !== "right") ||
        hands.some((h) => h.handedness === name)
      )
        throw new Error("Ambiguous handedness");
      hands.push({
        handedness: name,
        landmarks: points.map((p) => ({ ...p })),
      });
    });
  }
  const pose = input.pose?.landmarks[0],
    face = input.face?.faceLandmarks[0];
  if (
    (input.pose && input.pose.landmarks.length > 1) ||
    (input.face && input.face.faceLandmarks.length > 1)
  )
    throw new Error("Multiple signers are unsupported");
  if (pose) validPoints(pose, 33);
  if (face && face.length !== 468 && face.length !== 478)
    throw new Error("Invalid face landmarks");
  if (face) validPoints(face, face.length);
  return {
    timestampMs,
    hands,
    upperBody: pose ? UPPER_BODY_INDICES.map((i) => ({ ...pose[i] })) : [],
    face: face ? FACE_INDICES.map((i) => ({ ...face[i] })) : [],
  };
}
