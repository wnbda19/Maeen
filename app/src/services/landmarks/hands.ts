import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
export const landmarkCapabilities = {
  hands: true,
  face: false,
  pose: false,
} as const;
export async function createHands() {
  const files = await FilesetResolver.forVisionTasks(
    `${import.meta.env.BASE_URL}runtime/vision`,
  );
  const options = {
    baseOptions: {
      modelAssetPath: `${import.meta.env.BASE_URL}models/hand_landmarker.task`,
    },
    runningMode: "VIDEO" as const,
    numHands: 1,
  };
  try {
    return await HandLandmarker.createFromOptions(files, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: "GPU" },
    });
  } catch {
    return HandLandmarker.createFromOptions(files, {
      ...options,
      baseOptions: { ...options.baseOptions, delegate: "CPU" },
    });
  }
}
