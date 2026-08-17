import http from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
const artifactDir = path.resolve('artifacts/sw-world-008');
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
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};
const errors = [];
let browser;

async function settle(page, frames = 10) {
  await page.evaluate((frameCount) => {
    const base = performance.now();
    for (let i = 0; i < frameCount; i += 1) {
      globalThis.__SW_WORLD_007_QA__?.triggerUpdate?.(base + i * 33);
      globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.update?.(1 / 30, base + i * 33);
    }
    renderer.render(scene, camera);
  }, frames);
  await page.waitForTimeout(120);
}

async function select(page, type) {
  await page.evaluate((stormType) => globalThis.__SW_WORLD_007_QA__?.selectStorm?.(stormType), type);
  await settle(page, 12);
  return page.evaluate(() => ({
    active: typeof currentStorm !== 'undefined' ? currentStorm : null,
    heritage: globalThis.getSwWorld008TornadoHeritageState?.(),
    world007: globalThis.getSwWorld007SecondaryExclusiveState?.(),
    slice6Visible: typeof swVisualHeroSlice6StormRoot !== 'undefined' && Boolean(swVisualHeroSlice6StormRoot?.visible),
    tornadoGroupVisible: typeof tornadoGroup !== 'undefined' && Boolean(tornadoGroup?.visible),
  }));
}

try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(String(error.message || error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto(`${origin}/index.html?intro=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => (
    typeof globalThis.getSwWorld008TornadoHeritageState === 'function'
    && typeof globalThis.__SW_WORLD_007_QA__?.selectStorm === 'function'
    && typeof globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView === 'function'
  ), null, { timeout: 25000 });

  await page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('slice6-storm'));
  const tornado = await select(page, 'tornado');
  const legacy = tornado.heritage?.legacy || {};
  const condensation = tornado.heritage?.condensation || {};
  const atmosphere = tornado.heritage?.atmosphere || {};
  const ribbon = tornado.heritage?.ribbon || {};
  check('tornadoSelected', tornado.active === 'tornado', JSON.stringify(tornado));
  check('heritageFramesAdvanced', (tornado.heritage?.tornadoFrames || 0) > 0, JSON.stringify(tornado.heritage));
  check('referenceTargetRecorded', tornado.heritage?.visualTarget === 'tornado-visual-dev-reference-v1', String(tornado.heritage?.visualTarget || ''));
  check('condensationAdvanced', (tornado.heritage?.condensationFrames || 0) > 0, String(tornado.heritage?.condensationFrames || 0));
  check('legacyVisibleSurfacesSuppressed', legacy.funnelVisible === false && legacy.outerVisible === false && legacy.dustVisible === false && legacy.canopyVisible === false, JSON.stringify(legacy));
  check('historicalDebrisSubordinate', legacy.debrisVisible === false && legacy.debrisOpacity <= 0.12, JSON.stringify(legacy));
  check('irregularCondensationVisible', condensation.rootVisible === true && condensation.coreVisible === true && condensation.sheathVisible === true, JSON.stringify(condensation));
  check('irregularCondensationBudget', condensation.vertexCount === 1960 && condensation.triangleCount === 3808, JSON.stringify(condensation));
  check('condensationMaterialsDenseAndBroken', condensation.coreOpacity === 1 && condensation.sheathOpacity >= 0.05 && condensation.sheathOpacity <= 0.09 && condensation.alphaTest >= 0.05, JSON.stringify(condensation));
  check('nonlinearSilhouetteTelemetry', condensation.ringBreakupRange?.[0] <= 0.72 && condensation.ringBreakupRange?.[1] >= 1.28 && condensation.centerlineOffsetScale >= 2.1, JSON.stringify(condensation));
  check('softAtmosphereBounded', atmosphere.drawFields === 4 && atmosphere.finePoints >= 85 && atmosphere.finePoints <= 135 && atmosphere.broadPoints >= 40 && atmosphere.broadPoints <= 65 && atmosphere.canopyPoints >= 52 && atmosphere.canopyPoints <= 80 && atmosphere.dustPoints >= 128 && atmosphere.dustPoints <= 175, JSON.stringify(atmosphere));
  check('churningTouchdownTelemetry', atmosphere.dustMotionLanes === 3 && atmosphere.canopyRadiusMax <= 10.0, JSON.stringify(atmosphere));
  check('slice6VisibleGeometryRemoved', ribbon.streaks >= 8 && ribbon.visibleStreaks === 0 && ribbon.visibleWisps === 0 && ribbon.visibleGroundPulls === 0, JSON.stringify(ribbon));
  check('tornadoPresentationRootsVisible', tornado.slice6Visible === true && tornado.tornadoGroupVisible === true, JSON.stringify(tornado));
  await page.screenshot({ path: path.join(artifactDir, '01_tornado_irregular_844x390.png'), fullPage: false });

  await page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('slice6-ground-contact'));
  await settle(page, 14);
  await page.screenshot({ path: path.join(artifactDir, '02_touchdown_irregular_844x390.png'), fullPage: false });

  await settle(page, 36);
  await page.screenshot({ path: path.join(artifactDir, '03_tornado_motion_sample_844x390.png'), fullPage: false });

  const supercell = await select(page, 'supercell');
  check('supercellStillExclusive', supercell.active === 'supercell' && supercell.tornadoGroupVisible === false && supercell.slice6Visible === false && supercell.heritage?.condensation?.rootVisible === false, JSON.stringify(supercell));
  const derecho = await select(page, 'derecho');
  check('derechoStillExclusive', derecho.active === 'derecho' && derecho.tornadoGroupVisible === false && derecho.slice6Visible === false && derecho.heritage?.condensation?.rootVisible === false, JSON.stringify(derecho));
  const tornadoReturn = await select(page, 'tornado');
  check('tornadoRestoresAfterSecondary', tornadoReturn.tornadoGroupVisible === true && tornadoReturn.heritage?.legacy?.debrisVisible === false && tornadoReturn.heritage?.condensation?.rootVisible === true, JSON.stringify(tornadoReturn));

  check('noRuntimeErrors', errors.length === 0, errors.join(' | '));
  await context.close();
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}

const failed = checks.filter(item => !item.pass);
const report = {
  version: 'SW_WORLD_008_BROWSER_V6',
  passed: failed.length === 0,
  checks,
  errors,
  evidence: {
    visualTarget: 'tornado-visual-dev-reference-v1',
    screenshots: [
      'artifacts/sw-world-008/01_tornado_irregular_844x390.png',
      'artifacts/sw-world-008/02_touchdown_irregular_844x390.png',
      'artifacts/sw-world-008/03_tornado_motion_sample_844x390.png'
    ]
  },
};
await writeFile(path.join(artifactDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`WORLD-008 browser gate ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
