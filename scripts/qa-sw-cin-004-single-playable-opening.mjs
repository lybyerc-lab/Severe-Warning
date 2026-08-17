import http from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
const artifactDir = path.resolve('artifacts/sw-cin-004');
await mkdir(artifactDir, { recursive: true });
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

async function launchOpening(page) {
  await page.goto(`${origin}/index.html?intro=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.getSwCin004State === 'function' && Boolean(globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__), null, { timeout: 25000 });
  await page.evaluate(() => localStorage.setItem('severe_weather_opening_seen_v1', '1'));
  await page.click('#btnStartMenu');
  await page.waitForFunction(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.().active === true, null, { timeout: 10000 });
  await page.evaluate(() => {
    globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.debugSeek(8.9);
    globalThis.__SW_CIN_004_SYNC__?.();
    renderer.render(scene, camera);
  });
  await page.waitForTimeout(180);
}

async function captureState(page) {
  return page.evaluate(() => {
    const button = document.getElementById('swCin004SkipOpening');
    const rect = button?.getBoundingClientRect?.();
    let playableRootCount = 0;
    scene?.traverse?.((object) => { if (object.name === 'SWCinematicPlayableOpeningPresentation') playableRootCount += 1; });
    return {
      cin004: globalThis.getSwCin004State?.(),
      playable: globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.(),
      legacyCount: document.querySelectorAll('#mooBrewIntro').length,
      playableRootCount,
      skipRect: rect ? { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height } : null,
      viewport: { width: innerWidth, height: innerHeight },
    };
  });
}

let browser;
try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

  const mobileContext = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const mobile = await mobileContext.newPage();
  mobile.on('pageerror', error => errors.push(String(error.message || error)));
  mobile.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await launchOpening(mobile);
  const mobileState = await captureState(mobile);
  check('mobileSingleNormalOpeningPath', mobileState.cin004?.normalOpeningPathCount === 1 && mobileState.legacyCount === 0 && mobileState.playableRootCount === 1, JSON.stringify(mobileState));
  check('mobilePlayableWorldOpeningActive', mobileState.playable?.active === true && mobileState.playable?.version === 'SW_CIN_003_PLAYABLE_OPENING_V1' && mobileState.playable?.stage?.farmFound === true, JSON.stringify(mobileState.playable));
  check('mobileNoFlatIntro', mobileState.cin004?.legacyFlatIntroPresent === false, JSON.stringify(mobileState.cin004));
  check('mobileSkipReachable', mobileState.cin004?.skip?.visible === true && mobileState.cin004?.skip?.canSkip === true && mobileState.skipRect?.right <= mobileState.viewport.width && mobileState.skipRect?.top >= 0, JSON.stringify(mobileState.skipRect));
  check('timerFrozenDuringOpening', mobileState.playable?.timerFrozenDuringCinematic === true, JSON.stringify(mobileState.playable));
  await mobile.screenshot({ path: path.join(artifactDir, '01_single_playable_opening_844x390.png'), fullPage: false });
  await mobile.click('#swCin004SkipOpening');
  await mobile.waitForFunction(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.().active === false && globalThis.getSwCin004State?.().directHandoff?.runActive === true, null, { timeout: 5000 });
  const handoff = await captureState(mobile);
  check('directPlayableHandoff', handoff.playable?.reason === 'skip-button' && handoff.cin004?.directHandoff?.gameStarted === true && handoff.cin004?.directHandoff?.runActive === true && handoff.cin004?.directHandoff?.handoffCount >= 1, JSON.stringify(handoff));
  await mobile.screenshot({ path: path.join(artifactDir, '02_direct_handoff_844x390.png'), fullPage: false });
  await mobileContext.close();

  const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 720 }, serviceWorkers: 'block' });
  const desktop = await desktopContext.newPage();
  desktop.on('pageerror', error => errors.push(String(error.message || error)));
  desktop.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await launchOpening(desktop);
  await desktop.evaluate(() => {
    globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.debugSeek(10.9);
    globalThis.__SW_CIN_004_SYNC__?.();
    renderer.render(scene, camera);
  });
  await desktop.waitForTimeout(120);
  const desktopState = await captureState(desktop);
  check('desktopSinglePlayableOpening', desktopState.legacyCount === 0 && desktopState.playableRootCount === 1 && desktopState.playable?.active === true, JSON.stringify(desktopState));
  check('desktopSkipInBounds', desktopState.skipRect?.right <= desktopState.viewport.width && desktopState.skipRect?.top >= 0, JSON.stringify(desktopState.skipRect));
  check('cinematicFramingCorrectedOnlyWhileActive', desktopState.cin004?.cinematicFovCorrections > 0 && desktopState.cin004?.gameplayCameraAuthorityChanged === false, JSON.stringify(desktopState.cin004));
  await desktop.screenshot({ path: path.join(artifactDir, '03_single_playable_opening_1280x720.png'), fullPage: false });
  await desktopContext.close();

  check('noRuntimeErrors', errors.length === 0, errors.join(' | '));
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}

const failed = checks.filter((entry) => !entry.pass);
const report = {
  version: 'SW_CIN_004_BROWSER_V1',
  passed: failed.length === 0,
  checks,
  errors,
  evidence: {
    base: 'de2e62835e79567b4bbfc079a372ce2af4ee0879',
    screenshots: [
      'artifacts/sw-cin-004/01_single_playable_opening_844x390.png',
      'artifacts/sw-cin-004/02_direct_handoff_844x390.png',
      'artifacts/sw-cin-004/03_single_playable_opening_1280x720.png',
    ],
  },
};
await writeFile(path.join(artifactDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`SW-CIN-004 browser gate ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
