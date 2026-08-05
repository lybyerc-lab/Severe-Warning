import { chromium } from 'playwright';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import serveStatic from 'serve-handler';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');

const checks = [];
function check(name, condition, detail = '') {
  const passed = Boolean(condition);
  checks.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

let server;
let baseUrl = process.env.SEVERE_WEATHER_QA_URL;

if (!baseUrl) {
  server = createServer((req, res) => {
    return serveStatic(req, res, { public: path.join(projectRoot, 'www') });
  });
  await new Promise((resolve) => server.listen(4181, resolve));
  baseUrl = 'http://127.0.0.1:4181/';
}

let browser;
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));

  await page.goto(baseUrl);

  await page.waitForFunction(() => typeof globalThis.getPhase6PerformanceSnapshot === 'function');

  check('no console page errors on load', pageErrors.length === 0);

  const snapshot = await page.evaluate(() => globalThis.getPhase6PerformanceSnapshot());
  check('Phase 6 snapshot version is valid', snapshot.version === 'MODERNIZATION_PHASE6_PERFORMANCE_V1');
  check('Debris pool capacity is bounded', snapshot.debrisPool.poolCapacity === 48);
  check('Adaptive quality tier is initialized', ['ULTRA', 'HIGH', 'BALANCED', 'PERFORMANCE', 'ECO'].includes(snapshot.adaptiveQuality.tier));

  // Trigger high destruction
  await page.evaluate(() => {
    if (typeof globalThis.explodeStructure === 'function') {
      for (let i = 0; i < 10; i++) {
        globalThis.explodeStructure(i * 5, i * 5, '#38bdf8', false, false, 6);
      }
    }
  });

  await page.waitForTimeout(1000);
  const destSnapshot = await page.evaluate(() => globalThis.getPhase6PerformanceSnapshot());
  check('Debris pool high water mark tracked', destSnapshot.debrisPool.highWaterMark > 0);
  check('Debris active count does not exceed capacity', destSnapshot.debrisPool.activeCount <= destSnapshot.debrisPool.poolCapacity);

} finally {
  if (browser) await browser.close();
  if (server) server.close();
}

const failedCount = checks.filter((c) => !c.passed).length;
console.log(`\nPhase 6 QA automated browser suite: ${checks.length - failedCount}/${checks.length} checks passed.`);
if (failedCount > 0) {
  process.exit(1);
}
