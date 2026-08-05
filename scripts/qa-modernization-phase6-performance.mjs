import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');

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
  server = createServer(async (req, res) => {
    try {
      const reqUrl = req.url ? req.url.split('?')[0] : '/';
      const safePath = reqUrl === '/' ? '/index.html' : reqUrl;
      const filePath = path.join(projectRoot, 'www', path.normalize(safePath));
      if (!filePath.startsWith(path.join(projectRoot, 'www'))) {
        res.statusCode = 403;
        res.end('Forbidden');
        return;
      }
      const data = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
      res.statusCode = 200;
      res.end(data);
    } catch {
      res.statusCode = 404;
      res.end('Not Found');
    }
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

  // Trigger debris pool allocation
  await page.evaluate(() => {
    if (typeof globalThis.phase6SpawnDebris === 'function') {
      for (let i = 0; i < 10; i++) {
        globalThis.phase6SpawnDebris('#38bdf8', 1.0, i * 5, 2.0, i * 5, 5, 10, 5, 0.2, 0.2, 2.0);
      }
    }
  });

  await page.waitForTimeout(500);
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
