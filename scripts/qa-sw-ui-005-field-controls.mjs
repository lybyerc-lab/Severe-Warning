import http from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
const outputDir = path.resolve('artifacts/sw-ui-005');
await mkdir(outputDir, { recursive: true });

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
    response.writeHead(200, { 'content-type': mime.get(path.extname(file)) || 'application/octet-stream', 'cache-control': 'no-store' });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end('not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const checks = [];
const errors = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};
let browser;

try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(String(error.message || error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto(`${origin}/index.html?intro=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.getSwUi005State === 'function' && typeof globalThis.getSwUi004State === 'function', null, { timeout: 20000 });
  await page.click('#btnStartMenu');
  await page.waitForTimeout(250);
  await page.evaluate(() => {
    globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.finish?.('qa-ui-005');
    globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__?.hideIntro?.();
    document.getElementById('districtOverlay')?.classList.remove('active');
    globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView?.('slice6-storm');
    globalThis.__SW_UI_005_APPLY__?.();
  });
  await page.waitForTimeout(120);

  const desktop = await page.evaluate(() => {
    const guide = document.querySelector('.key-guide');
    const rows = guide ? Array.from(guide.children).filter((node) => !node.classList.contains('sw-field-controls-header')) : [];
    const labels = rows.slice(0, 3).map((row) => row.querySelector(':scope > b:first-child')?.textContent?.trim() || '');
    const rect = guide?.getBoundingClientRect();
    return {
      state: globalThis.getSwUi005State(),
      guideClass: guide?.className || '',
      guideText: guide?.textContent?.replace(/\s+/g, ' ').trim() || '',
      labels,
      width: rect?.width || 0,
      viewportWidth: innerWidth,
      verbSpace: document.getElementById('verbSpace')?.textContent?.trim() || '',
      verbQ: document.getElementById('verbQ')?.textContent?.trim() || '',
      verbE: document.getElementById('verbE')?.textContent?.trim() || '',
      district: document.getElementById('stageStatusTag')?.textContent?.trim() || '',
      productTitle: document.body.textContent.includes('SEVERE WEATHER WARNING'),
    };
  });
  check('desktopAdapterActive', desktop.state.desktopActive === true && desktop.guideClass.includes('sw-field-controls'), JSON.stringify(desktop));
  check('desktopLabelsAreProductNative', JSON.stringify(desktop.labels) === JSON.stringify(['STEER', 'ABILITIES', 'WARNING AREA']), JSON.stringify(desktop.labels));
  check('desktopRetainsWASDTruth', /WASD/.test(desktop.guideText), desktop.guideText);
  check('desktopRetainsAbilityBindings', /SPACE:\s*Pull/i.test(desktop.verbSpace) && /Q:\s*Gust/i.test(desktop.verbQ) && /E:\s*Power Grid(?:\s+Chain)?\s+Zap/i.test(desktop.verbE), `${desktop.verbSpace} | ${desktop.verbQ} | ${desktop.verbE}`);
  check('desktopRetainsDistrictTruth', desktop.district.length > 0, desktop.district);
  check('desktopGuideIsCompact', desktop.width > 0 && desktop.width <= desktop.viewportWidth * 0.5, `${desktop.width}/${desktop.viewportWidth}`);
  check('acceptedProductTitleRemainsVisible', desktop.productTitle === true);
  await page.screenshot({ path: path.join(outputDir, '01_desktop_field_controls_1280x720.png'), fullPage: false });

  await page.setViewportSize({ width: 844, height: 390 });
  await page.evaluate(() => globalThis.__SW_UI_005_APPLY__?.());
  await page.waitForTimeout(120);
  const mobile = await page.evaluate(() => {
    const guide = document.querySelector('.key-guide');
    const rows = guide ? Array.from(guide.children).filter((node) => !node.classList.contains('sw-field-controls-header')) : [];
    return {
      state: globalThis.getSwUi005State(),
      guideClass: guide?.className || '',
      labels: rows.slice(0, 3).map((row) => row.querySelector(':scope > b:first-child')?.textContent?.trim() || ''),
      verbSpace: document.getElementById('verbSpace')?.textContent?.trim() || '',
      verbQ: document.getElementById('verbQ')?.textContent?.trim() || '',
      verbE: document.getElementById('verbE')?.textContent?.trim() || '',
      district: document.getElementById('stageStatusTag')?.textContent?.trim() || '',
    };
  });
  check('mobileAdapterPresentationIsInactive', mobile.state.desktopActive === false && !mobile.guideClass.includes('sw-field-controls'), JSON.stringify(mobile));
  check('mobileOriginalLabelsRestored', JSON.stringify(mobile.labels) === JSON.stringify(['Move:', 'Verbs:', 'District:']), JSON.stringify(mobile.labels));
  check('mobileBindingsRemainUnchanged', mobile.verbSpace === desktop.verbSpace && mobile.verbQ === desktop.verbQ && mobile.verbE === desktop.verbE, JSON.stringify(mobile));
  check('mobileDistrictTruthRemainsUnchanged', mobile.district === desktop.district, mobile.district);
  await page.screenshot({ path: path.join(outputDir, '02_mobile_unchanged_844x390.png'), fullPage: false });

  check('noRuntimeErrors', errors.length === 0, `found ${errors.length}`);
  await context.close();
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}

const failed = checks.filter(item => !item.pass);
await writeFile(path.join(outputDir, 'report.json'), JSON.stringify({ task: 'SW-UI-005', checks, errors, passed: failed.length === 0 }, null, 2), 'utf8');
console.log(`SW-UI-005 browser QA ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
