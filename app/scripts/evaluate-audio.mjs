// Evaluation-only: real CC BY ESC-10 clips never enter public/ or dist/.
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import ts from "typescript";
const { chromium } = await import(
  pathToFileURL(
    process.env.PLAYWRIGHT_MODULE ||
      "C:/Users/Mohammed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs",
  ).href
);
const root = new URL("../../", import.meta.url),
  samples = JSON.parse(
    await readFile(new URL("evaluation/audio/samples.json", root), "utf8"),
  );
const source = await readFile(
  new URL("../src/services/audio/events.ts", import.meta.url),
  "utf8",
);
const { SoundFilter } = await import(
  "data:text/javascript;base64," +
    Buffer.from(
      ts.transpileModule(source, {
        compilerOptions: {
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
    ).toString("base64")
);
const worker = (
  await readdir(new URL("../dist/assets/", import.meta.url))
).find((n) => n.startsWith("audio.worker-"));
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") console.error(m.text());
  });
  await page.route("**/evaluation/*.wav", async (route) => {
    const name = new URL(route.request().url()).pathname.split("/").pop();
    await route.fulfill({
      body: await readFile(new URL("evaluation/audio/" + name, root)),
      contentType: "audio/wav",
    });
  });
  await page.goto("http://127.0.0.1:4199/#radar");
  const result = await page.evaluate(
    async ({ worker, samples }) => {
      const w = new Worker("/assets/" + worker);
      const ask = (data) =>
        new Promise((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(Error("Worker timeout")),
            30000,
          );
          w.onerror = (e) => {
            clearTimeout(timeout);
            reject(Error(e.message));
          };
          w.onmessage = ({ data }) => {
            clearTimeout(timeout);
            data.type === "error" ? reject(Error(data.message)) : resolve(data);
          };
          w.postMessage(data);
        });
      const ready = await ask({ type: "load", base: location.origin + "/" });
      const ctx = new AudioContext({ sampleRate: 16000 });
      const clips = [];
      for (const sample of samples) {
        const buffer = await ctx.decodeAudioData(
          await (await fetch("/evaluation/" + sample.filename)).arrayBuffer(),
        );
        const pcm = buffer.getChannelData(0),
          windows = [];
        for (let offset = 0; offset + 15600 <= pcm.length; offset += 7680) {
          const r = await ask({
            type: "infer",
            samples: pcm.slice(offset, offset + 15600),
            sampleRate: buffer.sampleRate,
          });
          windows.push({ ...r, at: (offset / buffer.sampleRate) * 1000 });
        }
        clips.push({
          filename: sample.filename,
          category: sample.category,
          windows,
        });
      }
      w.terminate();
      await ctx.close();
      return { loadMs: ready.loadMs, clips, userAgent: navigator.userAgent };
    },
    { worker, samples },
  );
  const latencies = [];
  for (const clip of result.clips) {
    const f = new SoundFilter();
    clip.alerts = [];
    for (const window of clip.windows) {
      latencies.push(window.inferenceMs);
      const e = f.push(window.scores, window.at);
      if (e)
        clip.alerts.push({
          id: e.kind.id,
          confidence: e.confidence,
          decisionTimeMs: window.at + 975 + window.inferenceMs,
        });
    }
  }
  result.meanInferenceMs =
    latencies.reduce((a, b) => a + b, 0) / latencies.length;
  result.windowCount = latencies.length;
  await mkdir(new URL("docs/phase4/", root), { recursive: true });
  await writeFile(
    new URL("docs/phase4/audio-evaluation.json", root),
    JSON.stringify(result, null, 2),
  );
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.screenshot({
    path: fileURLToPath(new URL("docs/phase4/radar.png", root)),
    fullPage: true,
  });
  console.log(
    JSON.stringify(
      {
        loadMs: result.loadMs,
        meanInferenceMs: result.meanInferenceMs,
        windows: result.windowCount,
        clips: result.clips.map((c) => ({
          file: c.filename,
          category: c.category,
          alerts: c.alerts,
        })),
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
