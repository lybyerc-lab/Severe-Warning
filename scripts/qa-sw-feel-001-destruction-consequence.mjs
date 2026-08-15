import http from 'node:http';
import { createHash } from 'node:crypto';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
const evidenceRoot = path.join(path.resolve('.'), 'artifacts', 'feel-001-evidence');
const capturesDir = path.join(evidenceRoot, 'captures');
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
const httpErrors = [];
page.on('pageerror', error => pageErrors.push(String(error.message || error)));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`); });

const checks = [];
const screenshotHashes = {};
function check(name, pass, detail = '') {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

async function capture(filename) {
  const file = path.join(capturesDir, filename);
  await page.screenshot({ path: file, fullPage: false });
  const bytes = await readFile(file);
  screenshotHashes[filename] = createHash('sha256').update(bytes).digest('hex');
}

async function menuVisibility() {
  return page.evaluate(() => {
    const menu = document.getElementById('mainMenu');
    if (!menu) return { visible: false, reason: 'missing' };
    const style = getComputedStyle(menu);
    const rect = menu.getBoundingClientRect();
    return {
      visible: style.display !== 'none'
        && style.visibility !== 'hidden'
        && Number(style.opacity || 1) > 0
        && rect.width > 0
        && rect.height > 0,
      className: menu.className,
      display: style.display,
    };
  });
}

try {
  await page.goto(`${origin}/index.html?intro=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.getSwFeel001State === 'function', null, { timeout: 20000 });
  await page.waitForSelector('#mainMenu', { timeout: 20000 });

  const initialState = await page.evaluate(() => globalThis.getSwFeel001State());
  check('feel001StateInitialized', Boolean(initialState && initialState.version === 'SW_FEEL_001_DESTRUCTION_CONSEQUENCE_V1'));
  check('debrisPoolSizeBounded', initialState.poolStats.debrisPoolSize === 48);

  // Enter the normal start path, then use the established presentation-only QA view
  // to guarantee the newspaper/menu cannot cover destruction evidence.
  await page.click('#btnStartMenu');
  await page.waitForTimeout(350);
  const qaView = await page.evaluate(() => {
    if (globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.().active) {
      globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.finish('qa-feel');
    }
    globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__?.hideIntro?.();
    document.getElementById('districtOverlay')?.classList.remove('active');
    const prepared = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView?.('slice6-storm');
    if (typeof renderer !== 'undefined' && renderer.render && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
      renderer.render(scene, camera);
    }
    return { prepared: Boolean(prepared) };
  });
  const menuAfterPrepare = await menuVisibility();
  check('gameplayQaViewPrepared', qaView.prepared === true, JSON.stringify(qaView));
  check('mainMenuHiddenBeforeDestructionEvidence', menuAfterPrepare.visible === false, JSON.stringify(menuAfterPrepare));

  // Trigger real authoritative destruction hooks for three material families and
  // focus the gameplay camera on the first destroyed structure so the pixels
  // actually show the consequence layer under review.
  const destructionResults = await page.evaluate(() => {
    const stateBefore = globalThis.getSwFeel001State();
    const targetWood = targets.find(t => !t.destroyed && (t.materialFamily === 'wood' || t.kind === 'cottage'));
    const targetGlass = targets.find(t => !t.destroyed && (t.materialFamily === 'glass' || t.kind === 'shop'));
    const targetTree = targets.find(t => !t.destroyed && (t.isTree || t.materialFamily === 'tree'));
    const focusTarget = targetWood || targetGlass || targetTree;

    if (targetWood) damageTarget(targetWood, 9999, 'qa-feel-test');
    if (targetGlass) damageTarget(targetGlass, 9999, 'qa-feel-test');
    if (targetTree) damageTarget(targetTree, 9999, 'qa-feel-test');

    if (focusTarget && typeof camera !== 'undefined') {
      const groundY = typeof terrainHeightAt === 'function' ? terrainHeightAt(focusTarget.x, focusTarget.z) : 0;
      camera.position.set(focusTarget.x + 28, groundY + 18, focusTarget.z + 28);
      camera.lookAt(focusTarget.x, groundY + 4, focusTarget.z);
    }
    renderer.render(scene, camera);

    const stateAfter = globalThis.getSwFeel001State();
    const effectsGroup = scene.getObjectByName('SWFeel001EffectsGroup');
    return {
      stateBefore,
      stateAfter,
      focus: focusTarget ? { x: focusTarget.x, z: focusTarget.z, kind: focusTarget.kind || 'unknown' } : null,
      hasEffectsGroup: Boolean(effectsGroup),
      activeChildren: effectsGroup?.children?.filter(c => c.visible).length || 0,
    };
  });

  check('destructionHandledCountIncrements', destructionResults.stateAfter.totalDestructionsHandled >= 3, `Count: ${destructionResults.stateAfter.totalDestructionsHandled}`);
  check('materialBreakdownRecorded',
    destructionResults.stateAfter.materialBreakdown.wood > 0
      && destructionResults.stateAfter.materialBreakdown.glass > 0
      && destructionResults.stateAfter.materialBreakdown.tree > 0
  );
  check('effectsGroupPresentInScene', destructionResults.hasEffectsGroup);
  check('activeDebrisBounded', destructionResults.stateAfter.activeDebrisCount <= 48, `Active: ${destructionResults.stateAfter.activeDebrisCount}`);
  check('destructionEvidenceHasFocusTarget', Boolean(destructionResults.focus), JSON.stringify(destructionResults.focus));
  check('destructionEvidenceHasVisibleEffects', destructionResults.activeChildren > 0, `Visible effects: ${destructionResults.activeChildren}`);

  // Let the render hook advance enough to produce readable separation, but keep
  // the active consequence alive for the first capture.
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(45);
    await page.evaluate(() => renderer.render(scene, camera));
  }
  check('mainMenuHiddenAtActiveCapture', (await menuVisibility()).visible === false);
  await capture('feel_001_active_destruction_844x390.png');

  // Advance pooled debris so the second frame proves temporal consequence rather
  // than a duplicate screenshot.
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(70);
    await page.evaluate(() => renderer.render(scene, camera));
  }
  check('mainMenuHiddenAtSettledCapture', (await menuVisibility()).visible === false);
  await capture('feel_001_debris_settled_844x390.png');

  // Wide capture while the same gameplay view is still active. If the first
  // effect has fully recycled, trigger one more representative real destruction.
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.evaluate(() => {
    const state = globalThis.getSwFeel001State();
    if (state.activeDebrisCount === 0) {
      const target = targets.find(t => !t.destroyed && !t.isCow && !t.isTree);
      if (target) {
        const groundY = typeof terrainHeightAt === 'function' ? terrainHeightAt(target.x, target.z) : 0;
        damageTarget(target, 9999, 'qa-feel-wide');
        camera.position.set(target.x + 34, groundY + 22, target.z + 34);
        camera.lookAt(target.x, groundY + 4, target.z);
      }
    }
    renderer.render(scene, camera);
  });
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(45);
    await page.evaluate(() => renderer.render(scene, camera));
  }
  check('mainMenuHiddenAtWideCapture', (await menuVisibility()).visible === false);
  await capture('feel_001_gameplay_1280x720.png');

  const uniqueHashes = new Set(Object.values(screenshotHashes));
  check('destructionEvidenceFramesAreDistinct', uniqueHashes.size === 3, `${uniqueHashes.size}/3 unique :: ${JSON.stringify(screenshotHashes)}`);

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

  const finalTelemetry = await page.evaluate(() => globalThis.getSwFeel001State());
  await writeFile(path.join(evidenceRoot, 'telemetry.json'), JSON.stringify({ ...finalTelemetry, screenshotHashes }, null, 2), 'utf8');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

check('noPageErrors', pageErrors.length === 0, `found ${pageErrors.length}`);
check('noRuntimeConsoleErrors', consoleErrors.length === 0, `found ${consoleErrors.length}`);
check('noHttpErrors', httpErrors.length === 0, `found ${httpErrors.length}`);

const failed = checks.filter(c => !c.pass);
await writeFile(
  path.join(evidenceRoot, 'qa-report.json'),
  JSON.stringify({ task: 'SW-FEEL-001', checks, screenshotHashes, pageErrors, consoleErrors, httpErrors, passed: failed.length === 0 }, null, 2),
  'utf8'
);
console.log(`\nSW-FEEL-001 QA: ${checks.length - failed.length}/${checks.length} assertions PASS`);
if (failed.length > 0) process.exit(1);
