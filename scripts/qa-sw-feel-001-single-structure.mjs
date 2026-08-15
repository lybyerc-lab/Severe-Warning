import http from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
const outputDir = path.resolve('artifacts/feel-001-evidence/single-structure');
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

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, serviceWorkers: 'block' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(String(error.message || error)));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};

try {
  await page.goto(`${origin}/index.html?intro=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.getSwFeel001State === 'function' && typeof globalThis.getSwFeel001StructuralAnatomyState === 'function' && typeof globalThis.getSwFeel001StructuralPriorityState === 'function', null, { timeout: 20000 });
  await page.click('#btnStartMenu');
  await page.waitForTimeout(300);

  const target = await page.evaluate(() => {
    globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.finish?.('qa-feel-single');
    globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__?.hideIntro?.();
    document.getElementById('districtOverlay')?.classList.remove('active');
    globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView?.('slice6-storm');
    globalThis.__SW_FEEL_001_RESET__?.();

    const candidate = targets.find((item) => !item.destroyed && !item.isTree && !item.isCow && ['cottage','garage','shop','office','rowhouse','apartment','warehouse'].includes(String(item.kind || '').toLowerCase()))
      || targets.find((item) => !item.destroyed && !item.isTree && !item.isCow);
    if (!candidate) return null;

    const groundY = typeof terrainHeightAt === 'function' ? terrainHeightAt(candidate.x, candidate.z) : 0;
    camera.position.set(candidate.x + 27, groundY + 17, candidate.z + 27);
    camera.lookAt(candidate.x, groundY + 4, candidate.z);
    renderer.render(scene, camera);

    return {
      x: candidate.x,
      z: candidate.z,
      kind: candidate.kind || 'unknown',
      family: typeof swFeel001GetMaterialFamily === 'function' ? swFeel001GetMaterialFamily(candidate) : 'unknown',
      index: targets.indexOf(candidate),
    };
  });
  check('singleStructuralTargetFound', Boolean(target), JSON.stringify(target));
  if (!target) throw new Error('No structural target found for FEEL-001 single-structure proof.');

  const before = await page.evaluate(() => globalThis.getSwFeel001State());
  await page.evaluate((index) => {
    const candidate = targets[index];
    damageTarget(candidate, 9999, 'qa-feel-single');
    renderer.render(scene, camera);
  }, target.index);

  for (let i = 0; i < 2; i++) {
    await page.waitForTimeout(45);
    await page.evaluate(() => renderer.render(scene, camera));
  }

  const active = await page.evaluate(({ x, z }) => {
    const visibleLegacyCubes = typeof activeExplosionFragments === 'undefined' ? [] : activeExplosionFragments.filter((entry) => {
      const mesh = entry?.mesh;
      const geometry = mesh?.geometry;
      if (!mesh || mesh.visible === false || geometry?.type !== 'BoxGeometry') return false;
      const params = geometry.parameters || {};
      const exactLegacyCube = Math.abs(Number(params.width || 0) - 0.75) < 0.001
        && Math.abs(Number(params.height || 0) - 0.75) < 0.001
        && Math.abs(Number(params.depth || 0) - 0.75) < 0.001;
      if (!exactLegacyCube) return false;
      return Math.hypot(Number(mesh.position?.x || 0) - x, Number(mesh.position?.z || 0) - z) <= 12;
    });
    return {
      feel: globalThis.getSwFeel001State(),
      anatomy: globalThis.getSwFeel001StructuralAnatomyState(),
      priority: globalThis.getSwFeel001StructuralPriorityState(),
      visibleLegacyCubeCount: visibleLegacyCubes.length,
      menuVisible: (() => {
        const menu = document.getElementById('mainMenu');
        if (!menu) return false;
        const style = getComputedStyle(menu); const rect = menu.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
      })(),
    };
  }, { x: target.x, z: target.z });
  check('authoritativeDestructionHandledOnce', active.feel.totalDestructionsHandled === before.totalDestructionsHandled + 1, `${before.totalDestructionsHandled} -> ${active.feel.totalDestructionsHandled}`);
  check('structuralAnatomyEventRecorded', active.anatomy.events >= 1, JSON.stringify(active.anatomy));
  check('structuralPriorityApplied', active.priority.structuralEvents >= 1, JSON.stringify(active.priority));
  check('genericFragmentsSuppressed', active.priority.genericFragmentsSuppressed > 0, JSON.stringify(active.priority));
  check('inheritedLegacyCubesWereHidden', active.priority.inheritedCubeFragmentsHidden > 0, JSON.stringify(active.priority));
  check('noVisibleLegacyCubeBurstNearDestroyedStructure', active.visibleLegacyCubeCount === 0, `visible=${active.visibleLegacyCubeCount}`);
  check('menuHiddenForVisualProof', active.menuVisible === false);
  await page.screenshot({ path: path.join(outputDir, '01_single_structure_active_844x390.png'), fullPage: false });

  for (let i = 0; i < 7; i++) {
    await page.waitForTimeout(90);
    await page.evaluate(() => renderer.render(scene, camera));
  }

  const settled = await page.evaluate(({ x, z }) => {
    const visibleLegacyCubeCount = typeof activeExplosionFragments === 'undefined' ? 0 : activeExplosionFragments.filter((entry) => {
      const mesh = entry?.mesh;
      const geometry = mesh?.geometry;
      if (!mesh || mesh.visible === false || geometry?.type !== 'BoxGeometry') return false;
      const params = geometry.parameters || {};
      const exactLegacyCube = Math.abs(Number(params.width || 0) - 0.75) < 0.001
        && Math.abs(Number(params.height || 0) - 0.75) < 0.001
        && Math.abs(Number(params.depth || 0) - 0.75) < 0.001;
      return exactLegacyCube && Math.hypot(Number(mesh.position?.x || 0) - x, Number(mesh.position?.z || 0) - z) <= 12;
    }).length;
    return { visibleLegacyCubeCount };
  }, { x: target.x, z: target.z });
  check('legacyCubeBurstRemainsInvisibleWhenSettled', settled.visibleLegacyCubeCount === 0, `visible=${settled.visibleLegacyCubeCount}`);
  await page.screenshot({ path: path.join(outputDir, '02_single_structure_settled_844x390.png'), fullPage: false });
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

check('noRuntimeErrors', errors.length === 0, `found ${errors.length}`);
const failed = checks.filter(item => !item.pass);
await writeFile(path.join(outputDir, 'report.json'), JSON.stringify({ task: 'SW-FEEL-001-SINGLE-STRUCTURE', checks, errors, passed: failed.length === 0 }, null, 2), 'utf8');
console.log(`FEEL-001 single-structure visual proof ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
