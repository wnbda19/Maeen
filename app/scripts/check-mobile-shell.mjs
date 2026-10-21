import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(
    process.env.PLAYWRIGHT_MODULE ||
      "C:/Users/Mohammed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs",
  ).href
);
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  base = "http://127.0.0.1:4200/Maeen/";
try {
  const context = await browser.newContext({ isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const checks = [];
  for (const lang of ["ar", "en"])
    for (const [width, height] of [
      [375, 812],
      [812, 375],
      [768, 1024],
      [1024, 768],
      [1440, 900],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto(base + "#home");
      if ((await page.evaluate(() => document.documentElement.lang)) !== lang)
        await page
          .getByRole("button", {
            name: lang === "en" ? "English" : "العربية",
            exact: true,
          })
          .click();
      for (const route of [
        "home",
        "translator",
        "radar",
        "dictionary",
        "more",
        "settings",
      ]) {
        await page.goto(base + "#" + route);
        await page.waitForFunction(
          () =>
            document.querySelector("main h1") &&
            document
              .querySelector('nav [aria-current="page"]')
              ?.getAttribute("href") === location.hash,
        );
        const result = await page.evaluate(() => {
          const header = document
              .querySelector(".topbar")
              .getBoundingClientRect(),
            heading = document.querySelector("main h1").getBoundingClientRect();
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            direction: document.documentElement.dir,
            headerCount: document.querySelectorAll(".topbar").length,
            headerOverlapsHeading: header.bottom > heading.top + 1,
            navLinks: [...document.querySelectorAll("nav a")].map((a) =>
              a.getAttribute("href"),
            ),
            smallButtons: [
              ...document.querySelectorAll('button,select,input[type="range"]'),
            ]
              .filter(
                (e) =>
                  e.getBoundingClientRect().height > 0 &&
                  e.getBoundingClientRect().height < 44,
              )
              .map((e) => ({
                text: e.textContent?.slice(0, 40),
                height: e.getBoundingClientRect().height,
              })),
          };
        });
        checks.push({ lang, width, height, route, ...result });
      }
    }
  const failed = checks.filter(
    (c) =>
      c.overflow ||
      c.headerCount !== 1 ||
      c.headerOverlapsHeading ||
      c.direction !== (c.lang === "ar" ? "rtl" : "ltr") ||
      c.navLinks.length !== 6 ||
      c.smallButtons.length,
  );
  await writeFile(
    new URL("../../docs/phase6/mobile-shell.json", import.meta.url),
    JSON.stringify(
      {
        checks: checks.length,
        failed,
        results: checks,
        physicalDevices: false,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ checks: checks.length, failed }, null, 2));
  if (failed.length) throw Error("Mobile shell regression");
} finally {
  await browser.close();
}
