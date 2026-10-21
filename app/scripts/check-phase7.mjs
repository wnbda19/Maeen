// Local production audit; no user data, device capture or external uploads.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || 'C:/Users/Mohammed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { physicalDevices: false, screenReader: 'UNTESTED', routes: [], keyboard: [], requests: [], errors: [] };
const base = 'http://127.0.0.1:4200/Maeen/';
try {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.on('request', r => report.requests.push({ url: r.url(), method: r.method(), resource: r.resourceType(), bodyBytes: r.postDataBuffer()?.length || 0 }));
  page.on('pageerror', e => report.errors.push(e.message));
  const axe = await readFile(new URL('../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');
  for (const language of ['ar', 'en']) {
    await page.goto(base);
    if (!report.paint) {
      await page.waitForFunction(() => performance.getEntriesByName('first-contentful-paint').length > 0);
      report.paint = await page.evaluate(() => ({ fcpMs: performance.getEntriesByName('first-contentful-paint')[0].startTime, domContentLoadedMs: performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd }));
    }
    if (await page.evaluate(() => document.documentElement.lang) !== language)
      await page.getByRole('button', { name: language === 'en' ? 'English' : 'العربية', exact: true }).click();
    for (const route of ['home', 'translator', 'radar', 'dictionary', 'more', 'settings']) {
      await page.goto(base + '#' + route);
      await page.waitForFunction(() => document.querySelector('main h1') && document.querySelector('nav [aria-current="page"]')?.getAttribute('href') === location.hash);
      await page.addScriptTag({ content: axe });
      const result = await page.evaluate(async () => {
        const scan = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] } });
        return { violations: scan.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })), incomplete: scan.incomplete.map(v => v.id), liveRegions: [...document.querySelectorAll('[aria-live],[role="status"],[role="alert"]')].map(e => ({ role: e.getAttribute('role'), live: e.getAttribute('aria-live') })), dialogs: document.querySelectorAll('dialog,[role="dialog"]').length };
      });
      await page.evaluate(() => document.documentElement.style.fontSize = '200%');
      const text200 = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, fontSize: getComputedStyle(document.documentElement).fontSize }));
      await page.evaluate(() => document.documentElement.style.fontSize = '');
      await page.setViewportSize({ width: 640, height: 450 });
      const zoomEquivalent = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, headingVisible: document.querySelector('main h1').getBoundingClientRect().width > 0 }));
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.locator('main').focus();
      const focus = [];
      for (let i = 0; i < 14; i++) {
        await page.keyboard.press('Tab');
        focus.push(await page.evaluate(() => { const e = document.activeElement, s = getComputedStyle(e); return { tag: e.tagName, name: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 90), outline: s.outlineStyle, outlineWidth: s.outlineWidth, hidden: e.getBoundingClientRect().height === 0 }; }));
      }
      report.routes.push({ language, route, ...result, text200, zoomEquivalent, reducedMotion: await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches) });
      report.keyboard.push({ language, route, focus });
    }
  }
  await page.goto(base + '#dictionary');
  await page.getByRole('textbox', { name: 'Your message' }).waitFor();
  await page.getByRole('textbox', { name: 'Your message' }).focus();
  await page.keyboard.type('Keyboard review');
  const typed = await page.getByRole('textbox', { name: 'Your message' }).inputValue();
  await page.getByRole('button', { name: 'Clear', exact: true }).focus();
  await page.keyboard.press('Enter');
  const cleared = await page.getByRole('textbox', { name: 'Your message' }).inputValue();
  await page.locator('.skip').focus();
  await page.keyboard.press('Enter');
  const skipWorks = await page.evaluate(() => document.activeElement === document.querySelector('main'));
  await page.locator('nav a[href="#translator"]').focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => location.hash === '#translator' && document.activeElement === document.querySelector('main'));
  report.keyboardInteractions = { typed, cleared, skipWorks, navigationMainFocus: true };
  await page.keyboard.press('Tab');
  await page.screenshot({ path: fileURLToPath(new URL('../../docs/phase7/keyboard-translator.png', import.meta.url)), fullPage: true });
  report.externalRequests = report.requests.filter(r => new URL(r.url).origin !== new URL(base).origin);
  report.nonGetRequests = report.requests.filter(r => r.method !== 'GET');
} finally {
  await mkdir(new URL('../../docs/phase7/', import.meta.url), { recursive: true });
  await writeFile(new URL('../../docs/phase7/browser-accessibility.json', import.meta.url), JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(JSON.stringify({ routes: report.routes.length, violations: report.routes.filter(r => r.violations.length).map(r => ({ language: r.language, route: r.route, violations: r.violations })), textOverflow: report.routes.filter(r => r.text200.overflow || r.zoomEquivalent.overflow).map(r => ({ language: r.language, route: r.route })), externalRequests: report.externalRequests, errors: report.errors }, null, 2));
