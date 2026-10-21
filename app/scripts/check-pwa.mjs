import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = new URL("../../", import.meta.url),
  origin = "http://127.0.0.1:4200",
  base = origin + "/Maeen/";
const { chromium } = await import(
  pathToFileURL(
    process.env.PLAYWRIGHT_MODULE ||
      "C:/Users/Mohammed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs",
  ).href
);
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--use-file-for-fake-video-capture=" +
      fileURLToPath(new URL("phase5/data/camera-B.y4m", root)),
    "--use-file-for-fake-audio-capture=" +
      fileURLToPath(new URL("evaluation/audio/1-100032-A-0.wav", root)),
  ],
});
await fetch(origin + "/__phase6/reset");
const report = { physicalDevices: false, observations: [], startedAt: new Date().toISOString() };
const evidenceDirectory = process.env.PWA_EVIDENCE_DIR || "docs/phase6";
function assert(value, message) {
  if (!value) throw Error(message);
}
async function ready(page) {
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
}
async function instrument(context) {
  await context.addInitScript(() => {
    window.__devices = {
      tracks: [],
      workers: 0,
      maxWorkers: 0,
      contexts: [],
      listeners: new Map(),
      freezeEvents: 0,
      constraints: [],
    };
    const d = window.__devices;
    const acquire = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    );
    navigator.mediaDevices.getUserMedia = async (c) => {
      d.constraints.push(c);
      const s = await acquire(c);
      d.tracks.push(...s.getTracks());
      return s;
    };
    const WorkerClass = window.Worker;
    window.Worker = class extends WorkerClass {
      constructor(...args) {
        super(...args);
        this.done = false;
        d.workers++;
        d.maxWorkers = Math.max(d.maxWorkers, d.workers);
      }
      terminate() {
        if (!this.done) {
          d.workers--;
          this.done = true;
        }
        super.terminate();
      }
    };
    const Context = window.AudioContext;
    window.AudioContext = class extends Context {
      constructor(...args) {
        super(...args);
        d.contexts.push(this);
      }
    };
    document.addEventListener("freeze", () => d.freezeEvents++);
    const add = EventTarget.prototype.addEventListener,
      remove = EventTarget.prototype.removeEventListener;
    const watched = new Set([
      "pagehide",
      "freeze",
      "visibilitychange",
      "maeen:shutdown",
    ]);
    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      ...args
    ) {
      if ((this === window || this === document) && watched.has(type)) {
        const key = (this === window ? "window:" : "document:") + type;
        if (!d.listeners.has(key)) d.listeners.set(key, new Set());
        d.listeners.get(key).add(listener);
      }
      return add.call(this, type, listener, ...args);
    };
    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      ...args
    ) {
      if (watched.has(type))
        d.listeners
          .get((this === window ? "window:" : "document:") + type)
          ?.delete(listener);
      return remove.call(this, type, listener, ...args);
    };
  });
}
async function resources(page) {
  return page.evaluate(() => {
    window.__devices.tracks = window.__devices.tracks.filter(
      (t) => t.readyState === "live",
    );
    window.__devices.contexts = window.__devices.contexts.filter(
      (c) => c.state !== "closed",
    );
    return {
      liveTracks: window.__devices.tracks.filter((t) => t.readyState === "live")
        .length,
      workers: window.__devices.workers,
      maxWorkers: window.__devices.maxWorkers,
      openAudioContexts: window.__devices.contexts.filter(
        (c) => c.state !== "closed",
      ).length,
      listeners: [...window.__devices.listeners.entries()].map(([k, v]) => [
        k,
        v.size,
      ]),
    };
  });
}
async function translator(page, language) {
  await page.goto(base + "#translator");
  await page
    .getByLabel("Sign Language", { exact: true })
    .selectOption(language);
  const start = Date.now();
  await page.getByRole("button", { name: "Start camera", exact: true }).click();
  await page
    .locator(".camera-workspace .media-state.is-active")
    .waitFor({ timeout: 30000 });
  return Date.now() - start;
}
async function stopCamera(page) {
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  assert((await resources(page)).liveTracks === 0, "Orphaned camera");
}
async function radar(page) {
  await page.goto(base + "#radar");
  const start = Date.now();
  await page
    .getByRole("button", { name: "Start microphone", exact: true })
    .click();
  await page
    .getByText("Recognition running locally", { exact: true })
    .waitFor({ timeout: 35000 });
  return Date.now() - start;
}
try {
  const context = await browser.newContext({
    permissions: ["camera", "microphone"],
    viewport: { width: 375, height: 812 },
  });
  await instrument(context);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.getByRole("button", { name: "English", exact: true }).click();
  await ready(page);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Page.enable");
  report.installability = await cdp.send("Page.getInstallabilityErrors");
  report.manifest = await cdp.send("Page.getAppManifest");
  report.initial = await page.evaluate(() => ({
    navigationMs:
      performance.getEntriesByType("navigation")[0].domContentLoadedEventEnd,
    fcpMs: performance.getEntriesByName("first-contentful-paint")[0]?.startTime,
    aiRequests: performance
      .getEntriesByType("resource")
      .filter((e) =>
        /\/(models|sign-models|audio-models|runtime)\//.test(e.name),
      )
      .map((e) => e.name),
  }));
  assert(report.initial.aiRequests.length === 0, "Models eagerly downloaded");
  report.onlineCamera = { arslMs: await translator(page, "arsl") };
  await stopCamera(page);
  report.onlineCamera.aslMs = await translator(page, "asl");
  await page.waitForFunction(
    () => document.querySelector("#letter-buffer").value === "B",
    {},
    { timeout: 15000 },
  );
  await stopCamera(page);
  await page.locator(".camera-select select").selectOption("environment");
  await page.getByRole("button", { name: "Start camera", exact: true }).click();
  await page.locator(".camera-workspace .media-state.is-active").waitFor();
  report.rearCameraRequest = await page.evaluate(
    () =>
      window.__devices.constraints.filter((c) => c.video).at(-1).video
        .facingMode,
  );
  await stopCamera(page);
  report.onlineRadarReadyMs = await radar(page);
  await page
    .getByRole("heading", { name: "Sound history", exact: true })
    .locator("..")
    .locator("..")
    .getByText("Dog barking", { exact: true })
    .waitFor({ timeout: 15000 });
  report.radarMetrics = await page.getByText(/YAMNet · load/).innerText();
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  report.modelResourceTimings = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((e) => /\/(models|sign-models|runtime)\//.test(e.name))
      .map((e) => ({
        name: e.name.split("/Maeen/")[1],
        durationMs: e.duration,
        bytes: e.encodedBodySize,
      })),
  );
  report.onlineNetworkCounts = await (
    await fetch(origin + "/__phase6/stats")
  ).json();
  report.onlineResources = await resources(page);
  console.log("Online models verified");
  await fetch(origin + "/__phase6/offline", { method: "POST" });
  await context.setOffline(true);
  await page.reload();
  await page
    .getByRole("heading", { name: "Smart sound radar", exact: true })
    .waitFor();
  report.offlineReload = true;
  report.offlineRadarReadyMs = await radar(page);
  await page
    .getByRole("heading", { name: "Sound history", exact: true })
    .locator("..")
    .locator("..")
    .getByText("Dog barking", { exact: true })
    .waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Stop", exact: true }).click();
  report.offlineCamera = { arslMs: await translator(page, "arsl") };
  await stopCamera(page);
  report.offlineCamera.aslMs = await translator(page, "asl");
  await page.waitForFunction(
    () => document.querySelector("#letter-buffer").value === "B",
    {},
    { timeout: 15000 },
  );
  report.activeCameraOrientation = [];
  for (const [width, height] of [
    [375, 812],
    [812, 375],
  ]) {
    await page.setViewportSize({ width, height });
    report.activeCameraOrientation.push({
      width,
      height,
      resources: await resources(page),
    });
  }
  await stopCamera(page);
  report.offlineNetworkCounts = await (
    await fetch(origin + "/__phase6/stats")
  ).json();
  report.modelRedownloads = Object.entries(report.offlineNetworkCounts).filter(
    ([p, n]) =>
      /\/(models|sign-models|audio-models|runtime)\//.test(p) &&
      n !== (report.onlineNetworkCounts[p] || 0),
  );
  assert(
    report.modelRedownloads.length === 0,
    "Unexpected model network request while offline",
  );
  console.log("Offline shell, ArSL, ASL and Radar verified");
  const responsive = [];
  for (const [width, height] of [
    [375, 812],
    [812, 375],
    [768, 1024],
    [1024, 768],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height });
    responsive.push({
      width,
      height,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    });
  }
  report.responsive = responsive;
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({
    path: fileURLToPath(new URL(evidenceDirectory + "/mobile-offline.png", root)),
    fullPage: true,
  });
  const baseline = await resources(page);
  await cdp.send("HeapProfiler.collectGarbage");
  report.heapBefore = await cdp.send("Runtime.getHeapUsage");
  report.cycles = [];
  const cycleStart = Date.now();
  for (let i = 0; i < Number(process.env.PWA_CYCLES || 4); i++) {
    await translator(page, i % 2 ? "arsl" : "asl");
    if (process.env.PWA_DWELL_MS) await page.waitForTimeout(Number(process.env.PWA_DWELL_MS));
    await page
      .getByLabel("Sign Language", { exact: true })
      .selectOption(i % 2 ? "asl" : "ksl");
    await page.goto(base + "#home");
    report.cycles.push(await resources(page));
    if (process.env.PWA_RADAR_CYCLES) {
      await radar(page);
      if (process.env.PWA_DWELL_MS) await page.waitForTimeout(Number(process.env.PWA_DWELL_MS));
      await page.goto(base + "#home");
      report.cycles.push(await resources(page));
    }
  }
  report.cycleDurationMs = Date.now() - cycleStart;
  await cdp.send("HeapProfiler.collectGarbage");
  report.heapAfter = await cdp.send("Runtime.getHeapUsage");
  report.resourcesAfterCycles = await resources(page);
  report.listenerBaseline = baseline.listeners;
  // Record whether Chromium actually delivers freeze; otherwise test the handler explicitly.
  await translator(page, "asl");
  await cdp.send("Page.setWebLifecycleState", { state: "frozen" });
  await new Promise((r) => setTimeout(r, 250));
  await cdp.send("Page.setWebLifecycleState", { state: "active" });
  report.browserFreezeEvents = await page.evaluate(
    () => window.__devices.freezeEvents,
  );
  if (!report.browserFreezeEvents) {
    await page.evaluate(() => document.dispatchEvent(new Event("freeze")));
    report.freezeHandlerSimulated = true;
  }
  report.cameraAfterFreeze = await resources(page);
  assert(report.cameraAfterFreeze.liveTracks === 0, "Camera survived freeze");
  await radar(page);
  await page.evaluate(() =>
    window.__devices.tracks
      .filter((t) => t.readyState === "live")
      .forEach((t) => t.dispatchEvent(new Event("mute"))),
  );
  report.micAfterInterruption = await resources(page);
  assert(
    report.micAfterInterruption.liveTracks === 0,
    "Microphone survived interruption",
  );
  // Corrupt only a public cached model, then require an explicit failure offline.
  await page.evaluate(async () => {
    const name = (await caches.keys()).find((n) =>
      n.endsWith("model-assets-v1"),
    );
    const c = await caches.open(name);
    const request = (await c.keys()).find((r) =>
      r.url.endsWith("/sign-models/asl-static/model.json"),
    );
    await c.put(request, new Response("CORRUPT"));
  });
  await page.goto(base + "#translator");
  await page.getByLabel("Sign Language", { exact: true }).selectOption("asl");
  await page.getByRole("button", { name: "Start camera", exact: true }).click();
  await page.getByText(/This AI model is unavailable offline/).waitFor();
  report.corruptionRejected = true;
  await fetch(origin + "/__phase6/online", { method: "POST" });
  await context.setOffline(false);
  await translator(page, "asl");
  await stopCamera(page);
  report.onlineRepair = true;
  // A controlled local SW-only revision exercises waiting/explicit activation/reload.
  await page.evaluate(() => fetch("/__phase6/update", { method: "POST" }));
  await page.evaluate(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    await r.update();
  });
  await page
    .getByRole("button", { name: "Update app and reload", exact: true })
    .waitFor({ timeout: 30000 });
  await Promise.all([
    page.waitForEvent("load"),
    page
      .getByRole("button", { name: "Update app and reload", exact: true })
      .click(),
  ]);
  await ready(page);
  report.updateReload = true;
  report.cache = await page.evaluate(async () => {
    const rows = [];
    for (const name of await caches.keys()) {
      const c = await caches.open(name);
      rows.push({ name, urls: (await c.keys()).map((r) => r.url) });
    }
    return rows;
  });
  report.errors = errors;
  assert(
    report.cycles.every(
      (r) => r.liveTracks === 0 && r.workers === 0 && r.openAudioContexts === 0,
    ),
    "Resource leak during cycles",
  );
  assert(
    responsive.every((r) => !r.overflow),
    "Responsive overflow",
  );
  assert(errors.length === 0, "Page error");
  await context.close();
  // Cold AI assets: shell installation alone must not promise recognition offline.
  const cold = await browser.newContext({
    permissions: ["camera", "microphone"],
  });
  const p = await cold.newPage();
  await p.goto(base);
  await p.getByRole("button", { name: "English", exact: true }).click();
  await ready(p);
  await fetch(origin + "/__phase6/offline", { method: "POST" });
  await cold.setOffline(true);
  await p.reload();
  await p.goto(base + "#translator");
  await p.getByLabel("Sign Language", { exact: true }).selectOption("asl");
  await p.getByRole("button", { name: "Start camera", exact: true }).click();
  await p.getByText(/This AI model is unavailable offline/).waitFor();
  report.neverCachedModelFailure = true;
  await p.goto(base + "#radar");
  await p
    .getByRole("button", { name: "Start microphone", exact: true })
    .click();
  await p
    .getByText("Microphone-level mode — recognition unavailable or disabled", {
      exact: true,
    })
    .waitFor({ timeout: 35000 });
  await p.getByText(/This AI model is unavailable offline/).waitFor();
  report.neverCachedRadarFallback = true;
  await p.getByRole("button", { name: "Stop", exact: true }).click();
  await cold.close();
  await fetch(origin + "/__phase6/online", { method: "POST" });
  const profile = await mkdtemp(path.join(tmpdir(), "maeen-pwa-"));
  const installed = await chromium.launchPersistentContext(profile, {
    channel: "chrome",
    headless: true,
  });
  try {
    await installed.addInitScript(() => {
      window.__installPromptSeen = false;
      window.addEventListener(
        "beforeinstallprompt",
        () => (window.__installPromptSeen = true),
      );
    });
    const ip = installed.pages()[0];
    await ip.goto(base);
    await ready(ip);
    const ic = await installed.newCDPSession(ip);
    await ic.send("Page.enable");
    report.normalProfileInstallability = await ic.send(
      "Page.getInstallabilityErrors",
    );
    report.normalProfileManifest = await ic.send("Page.getAppManifest");
    report.nativeInstallEventSeen = await ip.evaluate(
      () => window.__installPromptSeen,
    );
    await ic.send("Emulation.setEmulatedMedia", {
      features: [{ name: "display-mode", value: "standalone" }],
    });
    await ip.reload();
    report.standaloneMediaEmulation = await ip.evaluate(
      () => matchMedia("(display-mode: standalone)").matches,
    );
  } finally {
    await installed.close();
    if (
      path.dirname(profile) === tmpdir() &&
      path.basename(profile).startsWith("maeen-pwa-")
    )
      await rm(profile, { recursive: true, force: true });
  }
  console.log(JSON.stringify(report, null, 2));
  await writeFile(
    new URL(evidenceDirectory + "/browser-check.json", root),
    JSON.stringify(report, null, 2),
  );
} catch (error) {
  for (const context of browser.contexts())
    for (const page of context.pages())
      try {
        report.lastPageText = await page.locator("main").innerText();
        report.lastResources = await resources(page);
        report.lastAudio = await page.evaluate(() =>
          window.__devices.tracks.map((t) => ({
            kind: t.kind,
            state: t.readyState,
            muted: t.muted,
            settings: t.getSettings(),
          })),
        );
      } catch {}
  await writeFile(
    new URL(evidenceDirectory + "/browser-partial.json", root),
    JSON.stringify({ ...report, error: String(error) }, null, 2),
  );
  throw error;
} finally {
  await fetch(origin + "/__phase6/online", { method: "POST" }).catch(() => {});
  await browser.close();
}
