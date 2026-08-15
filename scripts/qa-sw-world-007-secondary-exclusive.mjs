import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
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

try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(String(error.message || error)));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

  await page.goto(`${origin}/index.html?intro=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.getSwWorld007SecondaryExclusiveState === 'function' && typeof globalThis.__SW_WORLD_007_QA__?.selectStorm === 'function', null, { timeout: 20000 });
  await page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView?.('slice6-storm'));

  const inspect = async (type) => page.evaluate((stormType) => {
    globalThis.__SW_WORLD_007_QA__.selectStorm(stormType);
    for (let i = 0; i < 6; i += 1) {
      globalThis.__SW_WORLD_007_QA__.triggerUpdate(performance.now() + i * 33);
      renderer.render(scene, camera);
    }
    return {
      activeStorm: globalThis.getSwWorld007State().activeStorm,
      exclusive: globalThis.getSwWorld007SecondaryExclusiveState(),
      slice6RootExists: typeof swVisualHeroSlice6StormRoot !== 'undefined' && Boolean(swVisualHeroSlice6StormRoot),
      slice6RootVisible: typeof swVisualHeroSlice6StormRoot !== 'undefined' && Boolean(swVisualHeroSlice6StormRoot?.visible),
      tornadoGroupVisible: typeof tornadoGroup !== 'undefined' && Boolean(tornadoGroup?.visible),
      supercellGroupVisible: typeof supercellGroup !== 'undefined' && Boolean(supercellGroup?.visible),
      derechoGroupVisible: typeof derechoGroup !== 'undefined' && Boolean(derechoGroup?.visible),
    };
  }, type);

  const supercell = await inspect('supercell');
  check('supercellActive', supercell.activeStorm === 'supercell', JSON.stringify(supercell));
  check('slice6RootExistsForExclusivityProof', supercell.slice6RootExists === true, JSON.stringify(supercell));
  check('slice6TornadoRootHiddenForSupercell', supercell.slice6RootVisible === false, JSON.stringify(supercell));
  check('legacyTornadoGroupHiddenForSupercell', supercell.tornadoGroupVisible === false, JSON.stringify(supercell));
  check('supercellGroupVisible', supercell.supercellGroupVisible === true, JSON.stringify(supercell));

  const derecho = await inspect('derecho');
  check('derechoActive', derecho.activeStorm === 'derecho', JSON.stringify(derecho));
  check('slice6TornadoRootHiddenForDerecho', derecho.slice6RootVisible === false, JSON.stringify(derecho));
  check('legacyTornadoGroupHiddenForDerecho', derecho.tornadoGroupVisible === false, JSON.stringify(derecho));
  check('derechoGroupVisible', derecho.derechoGroupVisible === true, JSON.stringify(derecho));
  check('slice6SuppressionTelemetryAdvanced', derecho.exclusive.slice6RootFramesSuppressed > 0, JSON.stringify(derecho.exclusive));

  const tornado = await inspect('tornado');
  check('tornadoActive', tornado.activeStorm === 'tornado', JSON.stringify(tornado));
  check('slice6TornadoRootRestoredForTornado', tornado.slice6RootVisible === true, JSON.stringify(tornado));
  check('secondaryGroupsHiddenOnTornadoReturn', tornado.supercellGroupVisible === false && tornado.derechoGroupVisible === false, JSON.stringify(tornado));
  check('noRuntimeErrors', errors.length === 0, `found ${errors.length}`);

  await context.close();
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}

const failed = checks.filter(item => !item.pass);
console.log(`WORLD-007 secondary exclusivity browser gate ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
