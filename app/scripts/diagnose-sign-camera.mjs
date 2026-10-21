import { readFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
const { chromium } =
  await import("file:///C:/Users/Mohammed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs");
const sdk =
  "data:text/javascript;base64," +
  Buffer.from(
    await readFile(
      new URL(
        "../node_modules/@mediapipe/tasks-vision/vision_bundle.mjs",
        import.meta.url,
      ),
    ),
  ).toString("base64");
const root = new URL("../../", import.meta.url);
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--use-file-for-fake-video-capture=" +
      fileURLToPath(new URL("phase5/data/camera-B.y4m", root)),
  ],
});
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4199/");
  const original =
    "data:image/jpeg;base64," +
    (
      await readFile(new URL("phase5/data/asl-test-cc0/B/B0001_test.jpg", root))
    ).toString("base64");
  const report = await page.evaluate(
    async ({ sdk, original }) => {
      const { FilesetResolver, HandLandmarker } = await import(sdk);
      const files = await FilesetResolver.forVisionTasks("/runtime/vision");
      const video = document.createElement("video");
      video.muted = true;
      video.srcObject = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      await video.play();
      const rows = [];
      const image = new Image();
      image.src = original;
      await image.decode();
      for (const delegate of ["GPU", "CPU"]) {
        const hand = await HandLandmarker.createFromOptions(files, {
          baseOptions: {
            modelAssetPath: "/models/hand_landmarker.task",
            delegate,
          },
          runningMode: "VIDEO",
          numHands: 1,
        });
        for (let i = 0; i < 3; i++) {
          const r = hand.detectForVideo(video, performance.now());
          rows.push({
            delegate,
            hands: r.landmarks.length,
            handedness: r.handedness,
          });
          await new Promise((r) => setTimeout(r, 100));
        }
        await hand.setOptions({ runningMode: "IMAGE" });
        const raw = hand.detect(image);
        rows.push({ delegate, originalImageHands: raw.landmarks.length });
        hand.close();
      }
      video.srcObject.getTracks().forEach((t) => t.stop());
      return rows;
    },
    { sdk, original },
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
