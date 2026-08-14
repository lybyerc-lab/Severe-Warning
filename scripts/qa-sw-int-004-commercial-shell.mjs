import http from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
const outputDir = path.resolve('artifacts/sw-int-004');
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

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
const page = await context.newPage();
const pageErrors = [];
const consoleErrors = [];
const httpErrors = [];
page.on('pageerror', error => pageErrors.push(String(error.message || error)));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`); });

const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};

try {
  await page.goto(`${origin}/index.html?intro=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.getSwUi003State === 'function' && typeof globalThis.getSwUi004State === 'function', null, { timeout: 20000 });

  await page.click('#btnStartMenu');
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.finish?.('qa-int-004');
    globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__?.hideIntro?.();
    document.getElementById('districtOverlay')?.classList.remove('active');
    globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView?.('slice6-storm');
    globalThis.__SW_UI_004_APPLY__?.();
    if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') renderer.render(scene, camera);
  });
  await page.waitForTimeout(100);

  const gameplay = await page.evaluate(() => ({
    ui003: globalThis.getSwUi003State(),
    ui004: globalThis.getSwUi004State(),
    text: document.body.innerText.replace(/\s+/g, ' ').trim(),
  }));
  check('bothAcceptedModulesMounted', gameplay.ui003.marker === 'SW_UI_003_RUN_SHELL_IDENTITY_V1' && gameplay.ui004.marker === 'SW_UI_004_GAMEPLAY_PRODUCT_IDENTITY_V1');
  check('productTitleVisibleInGameplay', /SEVERE WEATHER WARNING/i.test(gameplay.text));
  check('prototypeChromeAbsentInGameplay', !/SEVERE WEATHER 3D|3D LAB|PRODUCTION SLICE/i.test(gameplay.text));
  check('controlsRemainVisible', /PULL/i.test(gameplay.text) && /GUST/i.test(gameplay.text) && /ZAP/i.test(gameplay.text));
  check('gameplayTruthStillVisible', /TIME/i.test(gameplay.text) && /SCORE/i.test(gameplay.text));
  await page.screenshot({ path: path.join(outputDir, '01_combined_gameplay_844x390.png'), fullPage: false });

  await page.evaluate(() => togglePauseMenu());
  await page.waitForTimeout(80);
  const pause = await page.evaluate(() => {
    const state = globalThis.getSwUi003State();
    const overlay = document.getElementById('pauseOverlay');
    const card = overlay?.querySelector('.pause-card');
    const rect = card?.getBoundingClientRect();
    return {
      active: state.pauseActive,
      location: state.pauseLocationText,
      masthead: document.getElementById('newspaperPauseMasthead')?.textContent?.trim() || '',
      cardHeight: rect?.height || 0,
      viewHeight: visualViewport?.height || innerHeight,
      bodyText: document.body.innerText.replace(/\s+/g, ' ').trim(),
    };
  });
  check('pauseIdentitySurvivesUI004', pause.active && /SEVERE WEATHER WARNING/.test(pause.masthead));
  check('pauseLocationTruthSurvivesUI004', /PINE/.test(pause.location));
  check('pauseFitsShortLandscape', pause.cardHeight <= pause.viewHeight);
  check('prototypeChromeAbsentWhilePaused', !/SEVERE WEATHER 3D|3D LAB|PRODUCTION SLICE/i.test(pause.bodyText));
  await page.screenshot({ path: path.join(outputDir, '02_combined_pause_844x390.png'), fullPage: false });

  await page.evaluate(() => {
    togglePauseMenu();
    destructionScore = 6450;
    efRating = 'EF-5';
    finishRun();
    globalThis.__SW_UI_004_APPLY__?.();
  });
  await page.waitForTimeout(100);
  const results = await page.evaluate(() => {
    const state = globalThis.getSwUi003State();
    const overlay = document.getElementById('resultsOverlay');
    const card = overlay?.querySelector('.results-card');
    const rect = card?.getBoundingClientRect();
    const actions = [...overlay.querySelectorAll('button')].filter(button => getComputedStyle(button).display !== 'none').map(button => button.textContent.trim());
    return {
      active: state.resultsActive,
      grade: overlay?.querySelector('.grade-stamp')?.textContent?.trim() || '',
      score: document.getElementById('resScore')?.textContent?.trim() || '',
      actions,
      cardHeight: rect?.height || 0,
      viewHeight: visualViewport?.height || innerHeight,
      bodyText: document.body.innerText.replace(/\s+/g, ' ').trim(),
    };
  });
  check('resultsIdentitySurvivesUI004', results.active && results.grade.length > 0 && results.score.length > 0);
  check('resultsActionsRemainReachable', results.actions.length >= 2);
  check('resultsFitShortLandscape', results.cardHeight <= results.viewHeight);
  check('prototypeChromeAbsentOnResults', !/SEVERE WEATHER 3D|3D LAB|PRODUCTION SLICE/i.test(results.bodyText));
  await page.screenshot({ path: path.join(outputDir, '03_combined_results_844x390.png'), fullPage: false });
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

check('noPageErrors', pageErrors.length === 0, `found ${pageErrors.length}`);
check('noRuntimeConsoleErrors', consoleErrors.length === 0, `found ${consoleErrors.length}`);
check('noHttpErrors', httpErrors.length === 0, `found ${httpErrors.length}`);

const failed = checks.filter(item => !item.pass);
await writeFile(path.join(outputDir, 'report.json'), JSON.stringify({
  task: 'SW-INT-004',
  checks,
  pageErrors,
  consoleErrors,
  httpErrors,
  passed: failed.length === 0,
}, null, 2), 'utf8');
console.log(`SW-INT-004 combined browser QA ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
