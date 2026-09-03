import { chromium } from 'playwright';
const [W,H] = [Number(process.argv[2]||1600), Number(process.argv[3]||720)];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true,
  args: ['--autoplay-policy=no-user-gesture-required','--use-angle=swiftshader'] });
const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 })).newPage();
const errs=[]; p.on('pageerror', e=>errs.push(String(e).slice(0,160)));
await p.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded', timeout: 120000 });
await p.waitForSelector('canvas', { timeout: 60000 });
await p.waitForTimeout(4000);
await p.screenshot({ path: `/tmp/menu-${W}x${H}.png` });
console.log('errors', errs.length, errs.slice(0,2));
await b.close();
