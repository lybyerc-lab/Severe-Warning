import http from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
const capturesDir = path.join(path.resolve('.'), 'artifacts', 'feel-001-evidence', 'captures');
await mkdir(capturesDir, { recursive: true });

const mime = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.wav', 'audio/wav'], ['.woff2', 'font/woff2'],
  ['.png', 'image/png'],
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
page.on('pageerror', error => pageErrors.push(String(error.message || error)));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });

const checks = [];
function check(name, pass, detail = '') {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

try {
  await page.goto(`${origin}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.getSwFeel001State === 'function', null, { timeout: 20000 });
  await page.waitForSelector('#mainMenu', { timeout: 20000 });

  // 1. Initial state check
  const initialState = await page.evaluate(() => globalThis.getSwFeel001State());
  check('feel001StateInitialized', Boolean(initialState && initialState.version === 'SW_FEEL_001_DESTRUCTION_CONSEQUENCE_V1'));
  check('debrisPoolSizeBounded', initialState.poolStats.debrisPoolSize === 48);

  // 2. Start game and trigger destruction of targets
  await page.click('#btnStartMenu');
  await page.waitForTimeout(400);

  // Fast forward cinematic if active
  await page.evaluate(() => {
    if (globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.().active) {
      globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.finish('qa-feel');
    }
    globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__?.hideIntro?.();
    document.getElementById('districtOverlay')?.classList.remove('active');
  });
  await page.waitForTimeout(300);

  // 3. Trigger multiple structural destructions across different material archetypes
  const destructionResults = await page.evaluate(() => {
    const stateBefore = globalThis.getSwFeel001State();
    
    // Find representative targets
    const targetWood = targets.find(t => !t.destroyed && (t.materialFamily === 'wood' || t.kind === 'cottage'));
    const targetGlass = targets.find(t => !t.destroyed && (t.materialFamily === 'glass' || t.kind === 'shop'));
    const targetTree = targets.find(t => !t.destroyed && (t.isTree || t.materialFamily === 'tree'));

    if (targetWood) damageTarget(targetWood, 9999, 'qa-feel-test');
    if (targetGlass) damageTarget(targetGlass, 9999, 'qa-feel-test');
    if (targetTree) damageTarget(targetTree, 9999, 'qa-feel-test');

    // Run a few render update frames
    renderer.render(scene, camera);

    const stateAfter = globalThis.getSwFeel001State();
    const effectsGroup = scene.getObjectByName('SWFeel001EffectsGroup');

    return {
      stateBefore,
      stateAfter,
      hasEffectsGroup: Boolean(effectsGroup),
      activeChildren: effectsGroup?.children?.filter(c => c.visible).length || 0,
    };
  });

  check('destructionHandledCountIncrements', destructionResults.stateAfter.totalDestructionsHandled >= 3, `Count: ${destructionResults.stateAfter.totalDestructionsHandled}`);
  check('materialBreakdownRecorded', 
    destructionResults.stateAfter.materialBreakdown.wood > 0 &&
    destructionResults.stateAfter.materialBreakdown.glass > 0 &&
    destructionResults.stateAfter.materialBreakdown.tree > 0
  );
  check('effectsGroupPresentInScene', destructionResults.hasEffectsGroup);
  check('activeDebrisBounded', destructionResults.stateAfter.activeDebrisCount <= 48, `Active: ${destructionResults.stateAfter.activeDebrisCount}`);

  // Screenshot during active destruction
  await page.screenshot({ path: path.join(capturesDir, 'feel_001_active_destruction_844x390.png') });

  // 4. Test frame animation and ground settle over time
  await page.evaluate(() => {
    for (let f = 0; f < 30; f++) {
      renderer.render(scene, camera);
    }
  });
  await page.screenshot({ path: path.join(capturesDir, 'feel_001_debris_settled_844x390.png') });

  // 5. Test reset-to-zero lifecycle cleanup
  const resetResult = await page.evaluate(() => {
    globalThis.__SW_FEEL_001_RESET__();
    renderer.render(scene, camera);
    const state = globalThis.getSwFeel001State();
    const effectsGroup = scene.getObjectByName('SWFeel001EffectsGroup');
    const visibleCount = effectsGroup?.children?.filter(c => c.visible).length || 0;
    return {
      activeDebris: state.activeDebrisCount,
      activeShockwaves: state.activeShockwaveCount,
      activeDust: state.activeDustPuffCount,
      visibleCount,
      resetsCount: state.resetsCount,
    };
  });

  check('resetClearsAllActiveDebris', resetResult.activeDebris === 0, `Active: ${resetResult.activeDebris}`);
  check('resetHidesAllPooledMeshes', resetResult.visibleCount === 0, `Visible: ${resetResult.visibleCount}`);
  check('resetsCountIncrements', resetResult.resetsCount > 0);

  // 6. Wide 1280x720 capture
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.evaluate(() => renderer.render(scene, camera));
  await page.screenshot({ path: path.join(capturesDir, 'feel_001_gameplay_1280x720.png') });

  const finalTelemetry = await page.evaluate(() => globalThis.getSwFeel001State());
  await writeFile(
    path.join(path.resolve('.'), 'artifacts', 'feel-001-evidence', 'telemetry.json'),
    JSON.stringify(finalTelemetry, null, 2),
    'utf8'
  );

} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

const failed = checks.filter(c => !c.pass);
console.log(`\nSW-FEEL-001 QA: ${checks.length - failed.length}/${checks.length} assertions PASS`);
if (pageErrors.length > 0) {
  console.error('Page errors encountered:', pageErrors);
  process.exit(1);
}
if (failed.length > 0) {
  process.exit(1);
}
