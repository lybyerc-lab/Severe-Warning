import http from 'node:http';
import { readFile, stat, mkdir, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const wwwRoot = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || path.join(projectRoot, 'www'));
const qaArtifactsDir = path.join(projectRoot, 'qa-artifacts', 'sw-world-007');
const visualArtifactsDir = path.join(projectRoot, 'artifacts', 'sw-world-007-visual');

await mkdir(qaArtifactsDir, { recursive: true });
await mkdir(visualArtifactsDir, { recursive: true });

const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.wav', 'audio/wav'],
  ['.woff2', 'font/woff2'],
  ['.webmanifest', 'application/manifest+json'],
]);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(wwwRoot, relative);
    if (!file.startsWith(wwwRoot)) throw new Error('outside root');
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not file');
    response.writeHead(200, { 'content-type': mime.get(path.extname(file)) || 'application/octet-stream' });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('not found');
  }
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const checks = [];
function check(name, pass, detail = '') {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

const pageErrors = [];
const consoleErrors = [];
const httpErrors = [];
const screenshots = [];

let browser = null;

try {
  browser = await chromium.launch({
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
  page.on('pageerror', (error) => pageErrors.push(String(error.message || error)));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto(`${origin}/index.html?intro=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.getSwWorld007State === 'function', null, { timeout: 20000 });

  const captureFrame = async (filename) => {
    const qaPath = path.join(qaArtifactsDir, filename);
    const visualPath = path.join(visualArtifactsDir, filename);
    await page.screenshot({ path: qaPath, fullPage: false });
    await copyFile(qaPath, visualPath);
    screenshots.push(filename);
  };

  // 1. Initial State Check
  const initState = await page.evaluate(() => globalThis.getSwWorld007State());
  check('initialStateMarkerIsCorrect', initState.marker === 'SW_WORLD_007_SECONDARY_STORM_FORMS_V1');

  // 2. Select Supercell
  await page.evaluate(() => {
    globalThis.__SW_WORLD_007_QA__.selectStorm('supercell');
    if (typeof renderer !== 'undefined' && renderer.render && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
      renderer.render(scene, camera);
    }
  });
  await page.waitForTimeout(200);

  const supercellState = await page.evaluate(() => {
    // Advance frames to simulate motion
    for (let i = 0; i < 10; i++) {
      globalThis.__SW_WORLD_007_QA__.triggerUpdate(performance.now() + i * 33);
      if (typeof renderer !== 'undefined' && renderer.render && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
        renderer.render(scene, camera);
      }
    }
    return globalThis.getSwWorld007State();
  });

  check('supercellSelectionIsActive', supercellState.activeStorm === 'supercell');
  check('supercellMeshRootConstructed', supercellState.supercellMeshFound === true);
  check('supercellAnvilDeckPresent', supercellState.supercellDetails.hasAnvil === true);
  check('supercellMammatusClustersPresent', supercellState.supercellDetails.hasMammatus === true);
  check('supercellMesoCorePresent', supercellState.supercellDetails.hasMesoCore === true);
  check('supercellWallCloudPresent', supercellState.supercellDetails.hasWallCloud === true);
  check('supercellInflowCollarPresent', supercellState.supercellDetails.hasInflowCollar === true);
  check('supercellPuffOrbitsPresent', supercellState.supercellDetails.hasPuffOrbits === true);
  check('supercellHailShaftPresent', supercellState.supercellDetails.hasHailShaft === true);
  check('supercellFramesAnimated', supercellState.supercellFrames >= 10);

  // Position camera for Supercell overview
  await page.evaluate(() => {
    if (typeof camera !== 'undefined' && typeof storm !== 'undefined') {
      camera.position.set(storm.pos.x + 65, storm.pos.y + 45, storm.pos.z + 75);
      camera.lookAt(storm.pos.x, storm.pos.y + 20, storm.pos.z);
      renderer.render(scene, camera);
    }
  });
  await captureFrame('01-supercell-overview.png');

  // Position camera for Supercell ground-level action view
  await page.evaluate(() => {
    if (typeof camera !== 'undefined' && typeof storm !== 'undefined') {
      camera.position.set(storm.pos.x + 35, storm.pos.y + 8, storm.pos.z + 40);
      camera.lookAt(storm.pos.x, storm.pos.y + 14, storm.pos.z);
      renderer.render(scene, camera);
    }
  });
  await captureFrame('02-supercell-ground.png');

  // 3. Select Derecho
  await page.evaluate(() => {
    globalThis.__SW_WORLD_007_QA__.selectStorm('derecho');
    if (typeof renderer !== 'undefined' && renderer.render && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
      renderer.render(scene, camera);
    }
  });
  await page.waitForTimeout(200);

  const derechoState = await page.evaluate(() => {
    for (let i = 0; i < 10; i++) {
      globalThis.__SW_WORLD_007_QA__.triggerUpdate(performance.now() + i * 33);
      if (typeof renderer !== 'undefined' && renderer.render && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
        renderer.render(scene, camera);
      }
    }
    return globalThis.getSwWorld007State();
  });

  check('derechoSelectionIsActive', derechoState.activeStorm === 'derecho');
  check('derechoMeshRootConstructed', derechoState.derechoMeshFound === true);
  check('derechoShelfArcPresent', derechoState.derechoDetails.hasShelfArc === true);
  check('derechoRollCloudsPresent', derechoState.derechoDetails.hasRollClouds === true);
  check('derechoMicroburstStreaksPresent', derechoState.derechoDetails.hasMicroburstStreaks === true);
  check('derechoOutflowDustPresent', derechoState.derechoDetails.hasOutflowDust === true);
  check('derechoFramesAnimated', derechoState.derechoFrames >= 10);

  // Position camera for Derecho overview
  await page.evaluate(() => {
    if (typeof camera !== 'undefined' && typeof storm !== 'undefined') {
      camera.position.set(storm.pos.x + 70, storm.pos.y + 40, storm.pos.z + 80);
      camera.lookAt(storm.pos.x, storm.pos.y + 12, storm.pos.z);
      renderer.render(scene, camera);
    }
  });
  await captureFrame('03-derecho-overview.png');

  // Position camera for Derecho front-facing microburst view
  await page.evaluate(() => {
    if (typeof camera !== 'undefined' && typeof storm !== 'undefined') {
      camera.position.set(storm.pos.x, storm.pos.y + 6, storm.pos.z + 55);
      camera.lookAt(storm.pos.x, storm.pos.y + 14, storm.pos.z);
      renderer.render(scene, camera);
    }
  });
  await captureFrame('04-derecho-front.png');

  // 4. Return to Tornado
  await page.evaluate(() => {
    globalThis.__SW_WORLD_007_QA__.selectStorm('tornado');
    if (typeof renderer !== 'undefined' && renderer.render && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
      renderer.render(scene, camera);
    }
  });
  await page.waitForTimeout(100);

  const tornadoReturnState = await page.evaluate(() => {
    const tornadoVis = typeof tornadoGroup !== 'undefined' && tornadoGroup.visible;
    const supercellVis = typeof supercellGroup !== 'undefined' && supercellGroup.visible;
    const derechoVis = typeof derechoGroup !== 'undefined' && derechoGroup.visible;
    return {
      activeStorm: globalThis.getSwWorld007State().activeStorm,
      tornadoVis,
      supercellVis,
      derechoVis,
    };
  });

  check('returnToTornadoActive', tornadoReturnState.activeStorm === 'tornado');
  check('tornadoGroupVisible', tornadoReturnState.tornadoVis === true);
  check('supercellGroupHidden', tornadoReturnState.supercellVis === false);
  check('derechoGroupHidden', tornadoReturnState.derechoVis === false);

  await captureFrame('05-storm-switch-tornado.png');

  // Error assertions
  check('noPageErrors', pageErrors.length === 0, `found ${pageErrors.length}`);
  check('noRuntimeConsoleErrors', consoleErrors.length === 0, `found ${consoleErrors.length}`);
  check('noHttpErrors', httpErrors.length === 0, `found ${httpErrors.length}`);
} finally {
  if (browser) await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

const failed = checks.filter((item) => !item.pass);
const report = {
  task: 'SW-WORLD-007',
  marker: 'SW_WORLD_007_SECONDARY_STORM_FORMS_V1',
  timestamp: new Date().toISOString(),
  checks,
  passed: failed.length === 0,
  pageErrors,
  consoleErrors,
  httpErrors,
  screenshots,
};

await writeFile(path.join(qaArtifactsDir, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`SW-WORLD-007 browser QA ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
