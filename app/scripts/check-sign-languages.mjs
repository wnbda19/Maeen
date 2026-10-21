import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
const root = new URL("../../", import.meta.url);
const { chromium } = await import(
  pathToFileURL(
    process.env.PLAYWRIGHT_MODULE ||
      "C:/Users/Mohammed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs",
  ).href
);
const source = await readFile(
  new URL("../src/services/signs/asl.ts", import.meta.url),
  "utf8",
);
const moduleUrl =
  "data:text/javascript;base64," +
  Buffer.from(
    ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    }).outputText,
  ).toString("base64");
const parity = JSON.parse(
  await readFile(new URL("docs/phase5/asl-parity.json", root), "utf8"),
);
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
  const context = await browser.newContext({ permissions: ["camera"] });
  const page = await context.newPage();
  const errors = [],
    requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) =>
    requests.push({ url: r.url(), method: r.method() }),
  );
  await page.goto("http://127.0.0.1:4199/#translator");
  await page.getByRole("button", { name: "English", exact: true }).click();
  const selector = page.getByLabel("Sign Language", { exact: true });
  await selector.selectOption("asl");
  const modelsBeforeStart = requests.filter((r) =>
    r.url.includes("/sign-models/"),
  ).length;
  const started = Date.now();
  await page.getByRole("button", { name: "Start camera", exact: true }).click();
  await page
    .waitForFunction(
      () => document.querySelector("#letter-buffer")?.value.includes("B"),
      {},
      { timeout: 15000 },
    )
    .catch(async (error) => {
      console.log(await page.locator("main").innerText());
      console.log("Page errors", errors);
      await page.screenshot({
        path: fileURLToPath(new URL("docs/phase5/camera-debug.png", root)),
        fullPage: true,
      });
      throw error;
    });
  const firstCompositionMs = Date.now() - started;
  const firstComposition = await page.locator("#letter-buffer").inputValue();
  await page.waitForTimeout(1000);
  const heldComposition = await page.locator("#letter-buffer").inputValue();
  await selector.selectOption("ksl");
  const reset = {
    textareas: await page.locator("#letter-buffer").count(),
    videos: await page.locator("video").count(),
    cameraButton: await page
      .getByRole("button", { name: "Start camera", exact: true })
      .count(),
  };
  await selector.selectOption("arsl");
  const arslBuffer = await page.locator("#letter-buffer").inputValue();
  await selector.selectOption("asl");
  const aslBufferAfterSwitch = await page
    .locator("#letter-buffer")
    .inputValue();
  const benchmark = await page.evaluate(
    async ({ moduleUrl, parity }) => {
      const { parseAslModel, inferAsl } = await import(moduleUrl);
      const start = performance.now();
      const model = parseAslModel(
        await (await fetch("/sign-models/asl-static/model.json")).json(),
      );
      const loadMs = performance.now() - start;
      const features = new Float32Array(parity.features),
        result = inferAsl(model, features);
      const differences = Array.from(result.logits, (n, i) =>
        Math.abs(n - parity.logits[i]),
      );
      const times = [];
      for (let i = 0; i < 1000; i++) {
        const a = performance.now();
        inferAsl(model, features);
        times.push(performance.now() - a);
      }
      times.sort((a, b) => a - b);
      return {
        loadMs,
        meanClassifierMs: times.reduce((a, b) => a + b, 0) / times.length,
        p95ClassifierMs: times[949],
        maxLogitDifference: Math.max(...differences),
        iterations: times.length,
        userAgent: navigator.userAgent,
      };
    },
    { moduleUrl, parity },
  );
  const responsive = [];
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    responsive.push({
      width,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    });
  }
  await page.screenshot({
    path: fileURLToPath(new URL("docs/phase5/translator-asl.png", root)),
    fullPage: true,
  });
  const report = {
    modelsBeforeStart,
    firstCompositionMs,
    firstComposition,
    heldComposition,
    reset,
    arslBuffer,
    aslBufferAfterSwitch,
    benchmark,
    responsive,
    errors,
    externalRequests: requests.filter(
      (r) =>
        !r.url.startsWith("http://127.0.0.1:4199/") &&
        !r.url.startsWith("data:"),
    ),
    nonGetRequests: requests.filter((r) => r.method !== "GET"),
    fixture:
      "Real CC0 B/B0001_test.jpg repeated only as an engineering camera fixture; not training data or a live-human accuracy test.",
  };
  await writeFile(
    new URL("docs/phase5/browser-check.json", root),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  if (
    modelsBeforeStart ||
    firstComposition !== "B" ||
    heldComposition !== "B" ||
    arslBuffer ||
    aslBufferAfterSwitch ||
    reset.videos ||
    reset.cameraButton ||
    errors.length ||
    responsive.some((r) => r.overflow)
  )
    throw Error("Language browser verification failed");
} finally {
  await browser.close();
}
