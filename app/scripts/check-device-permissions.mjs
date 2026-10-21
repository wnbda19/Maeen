import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    process.env.PLAYWRIGHT_MODULE ||
      "C:/Users/Mohammed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs",
  ).href
);
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--deny-permission-prompts", "--use-fake-device-for-media-stream"],
});
try {
  const context = await browser.newContext({
    isMobile: true,
    hasTouch: true,
    viewport: { width: 375, height: 812 },
  });
  const page = await context.newPage();
  const results = [];
  await page.goto("http://127.0.0.1:4200/Maeen/#translator");
  await page.getByRole("button", { name: "English", exact: true }).click();
  for (const [route, button] of [
    ["translator", "Start camera"],
    ["radar", "Start microphone"],
  ]) {
    await page.goto("http://127.0.0.1:4200/Maeen/#" + route);
    await page.getByRole("button", { name: button, exact: true }).click();
    await page.getByRole("alert").waitFor({ timeout: 30000 });
    const message = await page.getByRole("alert").innerText();
    results.push({ route, message });
    if (!/permission|denied/i.test(message)) throw Error("Wrong denial state");
  }
  await writeFile(
    new URL("../../docs/phase6/permission-check.json", import.meta.url),
    JSON.stringify(
      {
        physicalDevices: false,
        method:
          "Chromium permission-denial policy with virtual capture devices; no user camera or microphone accessed",
        results,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
