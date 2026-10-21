import { pathToFileURL, fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";
const { chromium } = await import(
  pathToFileURL(
    process.env.PLAYWRIGHT_MODULE ||
      "C:/Users/Mohammed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs",
  ).href
);
const root = new URL("../../", import.meta.url);
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--use-file-for-fake-audio-capture=" +
      fileURLToPath(new URL("evaluation/audio/1-100032-A-0.wav", root)),
  ],
});
try {
  const context = await browser.newContext({ permissions: ["microphone"] });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const requests = [];
  page.on("request", (r) =>
    requests.push({ method: r.method(), url: r.url() }),
  );
  await page.goto("http://127.0.0.1:4199/#radar");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page
    .getByRole("button", { name: "Start microphone", exact: true })
    .click();
  await page
    .getByText("Recognition running locally", { exact: true })
    .waitFor({ timeout: 30000 });
  await page
    .getByRole("heading", { name: "Sound history", exact: true })
    .locator("..")
    .locator("..")
    .getByText("Dog barking", { exact: true })
    .waitFor({ timeout: 20000 });
  const history = await page
    .getByRole("heading", { name: "Sound history", exact: true })
    .locator("..")
    .locator("..")
    .innerText();
  await page
    .getByRole("heading", { name: "Sound history", exact: true })
    .locator("..")
    .getByRole("button", { name: "Clear", exact: true })
    .click();
  await page.getByText("No confirmed sounds yet", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  await page.getByText("Stopped", { exact: true }).waitFor();
  const responsive = [];
  for (const width of [360, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    responsive.push({
      width,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    });
  }
  await page.screenshot({
    path: fileURLToPath(new URL("docs/phase4/radar.png", root)),
    fullPage: true,
  });
  await page.setViewportSize({ width: 360, height: 900 });
  await page.screenshot({
    path: fileURLToPath(new URL("docs/phase4/radar-mobile.png", root)),
    fullPage: true,
  });
  // Exercise genuine runtime failure, not an invented model result.
  await page.route("**/runtime/audio/**", (r) => r.abort());
  await page
    .getByRole("button", { name: "Start microphone", exact: true })
    .click();
  await page
    .getByText("Microphone-level mode — recognition unavailable or disabled", {
      exact: true,
    })
    .waitFor({ timeout: 35000 });
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  const report = {
    input:
      "Real CC BY dog recording injected through browser test microphone; not a physical microphone",
    history,
    errors,
    responsive,
    fallbackVerified: true,
    externalRequests: requests.filter(
      (r) => !r.url.startsWith("http://127.0.0.1:4199/"),
    ),
    nonGetRequests: requests.filter((r) => r.method !== "GET"),
  };
  await writeFile(
    new URL("docs/phase4/browser-check.json", root),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
