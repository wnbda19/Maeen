import { writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || 'C:/Users/Mohammed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
const browser = await chromium.launch({channel:'chrome',headless:true});
const checks=[];
try {
 const context=await browser.newContext(); const page=await context.newPage(); const modelRequests=[];
 page.on('request',r=>{if(/\/(models|runtime|sign-models|audio-models)\//.test(r.url()))modelRequests.push(r.url());});
 for(const ar of [true,false])for(const width of [375,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:4200/Maeen/#more');await page.waitForSelector('main h1');
  if(await page.evaluate(()=>document.documentElement.lang)!==(ar?'ar':'en'))await page.getByRole('button',{name:ar?'العربية':'English',exact:true}).click();
  await page.locator('.competition-information summary').click();
  await page.getByRole('button',{name:ar?'بدء دليل العرض':'Start demo guide',exact:true}).click();
  await page.locator('nav a[href="#translator"]').click();
  await page.waitForSelector('.competition-guide');
  await page.waitForSelector('main h1');
  const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,guide:!!document.querySelector('.competition-guide'),dir:document.documentElement.dir,smallButtons:[...document.querySelectorAll('button')].filter(e=>{const r=e.getBoundingClientRect();return r.height>0&&r.height<44;}).map(e=>e.textContent)}));
  const axe=await import('node:fs/promises').then(fs=>fs.readFile(new URL('../node_modules/axe-core/axe.min.js',import.meta.url),'utf8'));
  await page.addScriptTag({content:axe});const violations=await page.evaluate(async()=> (await window.axe.run(document)).violations.map(v=>({id:v.id,tags:v.tags,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));
  checks.push({ar,width,...result,violations});
  if(width===375)await page.screenshot({path:fileURLToPath(new URL(`../../docs/phase8/demo-${ar?'ar':'en'}.png`,import.meta.url)),fullPage:true});
  await page.getByRole('button',{name:ar?'إنهاء دليل العرض':'Exit demo guide',exact:true}).click();
 }
 await writeFile(new URL('../../docs/phase8/demo-review.json',import.meta.url),JSON.stringify({checks,modelRequests,physicalDevices:false},null,2));
 const wcag = c => c.violations.some(v => v.tags.some(t=>/^wcag/.test(t)));
 console.log(JSON.stringify({checks:checks.length,failed:checks.filter(c=>c.overflow||!c.guide||c.smallButtons.length||wcag(c)),advisories:checks.flatMap(c=>c.violations.map(v=>({ar:c.ar,width:c.width,...v}))),modelRequests},null,2));
 if(checks.some(c=>c.overflow||!c.guide||c.smallButtons.length||wcag(c))||modelRequests.length)process.exitCode=1;
}finally{await browser.close();}
