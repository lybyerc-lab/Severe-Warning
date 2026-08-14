import http from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
const artifactRoot = path.join(path.resolve('.'), 'artifacts', 'sw-ui-004');
await mkdir(artifactRoot, { recursive: true });

const mime = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.wav', 'audio/wav'], ['.woff2', 'font/woff2'], ['.png', 'image/png'],
]);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root)) throw new Error('outside root');
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not file');
    response.writeHead(200, { 'content-type': mime.get(path.extname(file)) || 'application/octet-stream' });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const context = await browser.newContext({
  viewport: { width: 844, height: 390 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const pageErrors = [];
const consoleErrors = [];
const httpErrors = [];
page.on('pageerror', error => pageErrors.push(String(error.message || error)));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`); });

const checks = [];
function check(name, pass, detail = '') {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

try {
  await page.goto(`${origin}/index.html?intro=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.getSwUi004State === 'function', null, { timeout: 20000 });
  await page.waitForSelector('#mainMenu', { timeout: 20000 });
  await page.click('#btnStartMenu');
  await page.waitForTimeout(350);

  await page.evaluate(() => {
    if (globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.().active) {
      globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.finish('qa-ui004');
    }
    globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__?.hideIntro?.();
    document.getElementById('districtOverlay')?.classList.remove('active');
    globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView?.('slice6-storm');
    globalThis.__SW_UI_004_APPLY__?.();
    if (typeof renderer !== 'undefined' && renderer.render && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
      renderer.render(scene, camera);
    }
  });
  await page.waitForTimeout(120);

  const state = await page.evaluate(() => globalThis.getSwUi004State());
  const visibleText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim());
  check('ui004StateInitialized', state.marker === 'SW_UI_004_GAMEPLAY_PRODUCT_IDENTITY_V1');
  check('productTitleVisible', /SEVERE WEATHER WARNING/i.test(visibleText), visibleText.slice(0, 220));
  check('legacySevereWeather3dNotVisible', !/SEVERE WEATHER 3D/i.test(visibleText));
  check('threeDLabNotVisible', !/3D LAB/i.test(visibleText));
  check('productionSliceNotVisible', !/PRODUCTION SLICE/i.test(visibleText));
  check('warningNoLongerAdvertises3D', !/NOAA EAS[^\n]*WARNING:\s*3D/i.test(visibleText));
  check('pullControlStillVisible', /\bPULL\b/i.test(visibleText));
  check('gustControlStillVisible', /\bGUST\b/i.test(visibleText));
  check('zapControlStillVisible', /\bZAP\b/i.test(visibleText));
  check('timerStillVisible', /\bTIME\b/i.test(visibleText));
  check('scoreStillVisible', /\bSCORE\b/i.test(visibleText));
  check('identityAdapterActuallyChangedPresentation', state.titleReplacements > 0 || state.hiddenDevChrome > 0,
    `titles=${state.titleReplacements} hidden=${state.hiddenDevChrome}`);

  await page.screenshot({ path: path.join(artifactRoot, '01_gameplay_844x390.png'), fullPage: false });

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.evaluate(() => {
    globalThis.__SW_UI_004_APPLY__?.();
    if (typeof renderer !== 'undefined' && renderer.render && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
      renderer.render(scene, camera);
    }
  });
  await page.waitForTimeout(80);
  const desktopText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim());
  check('desktopProductTitleVisible', /SEVERE WEATHER WARNING/i.test(desktopText));
  check('desktopDevChromeAbsent', !/SEVERE WEATHER 3D|3D LAB|PRODUCTION SLICE/i.test(desktopText));
  await page.screenshot({ path: path.join(artifactRoot, '02_gameplay_1280x720.png'), fullPage: false });
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

check('noPageErrors', pageErrors.length === 0, `found ${pageErrors.length}`);
check('noRuntimeConsoleErrors', consoleErrors.length === 0, `found ${consoleErrors.length}`);
check('noHttpErrors', httpErrors.length === 0, `found ${httpErrors.length}`);

const failed = checks.filter(item => !item.pass);
await writeFile(path.join(artifactRoot, 'report.json'), JSON.stringify({
  task: 'SW-UI-004',
  checks,
  pageErrors,
  consoleErrors,
  httpErrors,
  passed: failed.length === 0,
}, null, 2), 'utf8');
console.log(`SW-UI-004 browser QA ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
