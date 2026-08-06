import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'modernization-phase-6', 'phase6');
await mkdir(outputDir, { recursive: true });

const checks = [];
function check(name, condition, detail = '') {
  const passed = Boolean(condition);
  checks.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
};

let server;
let baseUrl = process.env.SEVERE_WEATHER_QA_URL;
if (!baseUrl) {
  server = createServer(async (request, response) => {
    try {
      const requestUrl = request.url ? request.url.split('?')[0] : '/';
      const safePath = requestUrl === '/' ? '/index.html' : requestUrl;
      const webRoot = path.join(projectRoot, 'www');
      const filePath = path.join(webRoot, path.normalize(safePath));
      if (!filePath.startsWith(webRoot)) {
        response.statusCode = 403;
        response.end('Forbidden');
        return;
      }
      const data = await readFile(filePath);
      response.setHeader('Content-Type', MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
      response.statusCode = 200;
      response.end(data);
    } catch {
      response.statusCode = 404;
      response.end('Not Found');
    }
  });
  await new Promise((resolve) => server.listen(4181, resolve));
  baseUrl = 'http://127.0.0.1:4181/';
}

let browser;
const browserLog = [];
const pageErrors = [];
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('console', (message) => {
    browserLog.push(`[${message.type()}] ${message.text()}`);
    if (message.type() === 'error') pageErrors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => pageErrors.push(`pageerror: ${error.message}`));

  await page.goto(`${baseUrl}?qa=1&phase6qa=1`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (
    globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__?.version === 'MODERNIZATION_PHASE6_PERFORMANCE_V2'
    && typeof globalThis.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.getSnapshot === 'function'
    && typeof globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.getSnapshot === 'function'
  ));
  await page.waitForTimeout(1500);

  const initial = await page.evaluate(() => globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__.getSnapshot());
  check('Phase 6 V2 bridge is active', initial.version === 'MODERNIZATION_PHASE6_PERFORMANCE_V2');
  check('production update loop feeds performance authority', initial.integration.productionUpdateSamples > 0, `samples=${initial.integration.productionUpdateSamples}`);
  check('pool is bounded to 48 items', initial.debrisPool.poolCapacity === 48);
  check('quality controller is attached to renderer', ['ULTRA', 'HIGH', 'BALANCED', 'PERFORMANCE', 'ECO'].includes(initial.adaptiveQuality.tier));
  check('exact lifecycle listener count is stable', initial.input.listenerCount === 2, `listeners=${initial.input.listenerCount}`);

  const movementBefore = await page.evaluate(() => {
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', key: 'ArrowUp', bubbles: true }));
    return globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__.getSnapshot().movement;
  });
  check('Phase 3 authority receives keyboard movement before interruption', movementBefore.active === true);
  const interruptionsBefore = initial.integration.inputInterruptions;
  const movementAfter = await page.evaluate(() => {
    window.dispatchEvent(new Event('blur'));
    return globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__.getSnapshot().movement;
  });
  const inputAfter = await page.evaluate(() => globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__.getSnapshot());
  check('blur clears the actual Phase 3 movement authority', movementAfter.active === false);
  check('blur clears legacy joystick state', inputAfter.input.phase3.legacy.joystickActive === false);
  check('input interruption is recorded once', inputAfter.integration.inputInterruptions === interruptionsBefore + 1);

  const dustBefore = inputAfter.integration.productionDustBurstCalls;
  const triggered = await page.evaluate(() => globalThis.triggerProductionSliceQa('hero'));
  await page.waitForTimeout(120);
  const heavy = await page.evaluate(() => globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__.getSnapshot());
  check('real Hart Farm hero path executed', triggered === true);
  check('real production dust executor called the Phase 6 pool', heavy.integration.productionDustBurstCalls > dustBefore, `calls=${heavy.integration.productionDustBurstCalls}`);
  check('pooled production dust was spawned', heavy.integration.pooledDustSpawned > 0, `spawned=${heavy.integration.pooledDustSpawned}`);
  check('pool high-water mark reflects live destruction', heavy.debrisPool.highWaterMark > 0, `highWater=${heavy.debrisPool.highWaterMark}`);
  check('pool never exceeds its active limit', heavy.debrisPool.activeCount <= heavy.debrisPool.activeLimit);
  await page.screenshot({ path: path.join(outputDir, 'phase6-heavy-destruction.png'), fullPage: true });

  const resetBefore = heavy.integration.resetCount;
  await page.evaluate(() => globalThis.__SW_V510_REBUILD__());
  await page.waitForTimeout(120);
  const reset = await page.evaluate(() => globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__.getSnapshot());
  check('retry/rebuild releases every pooled transient', reset.debrisPool.activeCount === 0, `active=${reset.debrisPool.activeCount}`);
  check('retry/rebuild records bounded cleanup', reset.integration.resetCount > resetBefore, `resets=${reset.integration.resetCount}`);
  check('retry/rebuild does not multiply lifecycle listeners', reset.input.listenerCount === 2);

  const probe = await page.evaluate(() => globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__.runDeterministicQualityProbe());
  check('adaptive quality downshifts under deterministic frame pressure', probe.downshifted === true, JSON.stringify(probe));
  check('adaptive quality probe restores the original tier', probe.restored === true, JSON.stringify(probe));

  const finalSnapshot = await page.evaluate(() => globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__.getSnapshot());
  check('no browser page or console errors', pageErrors.length === 0, pageErrors.join(' | '));

  await page.screenshot({ path: path.join(outputDir, 'phase6-after-reset.png'), fullPage: true });
  const report = {
    version: 'MODERNIZATION_PHASE6_QA_V2',
    generatedAt: new Date().toISOString(),
    checks,
    passed: checks.every((entry) => entry.passed),
    snapshots: { initial, inputAfter, heavy, reset, final: finalSnapshot },
    qualityProbe: probe,
    pageErrors,
  };
  await writeFile(path.join(outputDir, 'phase6-qa-report.json'), JSON.stringify(report, null, 2), 'utf8');
  await writeFile(path.join(outputDir, 'phase6-browser.log'), `${browserLog.join('\n')}\n`, 'utf8');
} finally {
  if (browser) await browser.close();
  if (server) server.close();
}

const failedCount = checks.filter((entry) => !entry.passed).length;
console.log(`\nPhase 6 integrated browser QA: ${checks.length - failedCount}/${checks.length} checks passed.`);
if (failedCount > 0) process.exit(1);
