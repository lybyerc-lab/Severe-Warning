import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const artifactsDir = path.join(projectRoot, 'qa-artifacts', 'phase6-performance');

await mkdir(artifactsDir, { recursive: true });

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
  await new Promise((resolve) => server.listen(4180, resolve));
  baseUrl = 'http://127.0.0.1:4180/';
  console.log('[SW:PERF] Local server started on http://127.0.0.1:4180');
}

let browser;
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required'],
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(`${baseUrl}?qa=1&perf=1`);

  await page.waitForFunction(() => typeof globalThis.getPhase6PerformanceSnapshot === 'function');

  // Scenario 1: Initial Gameplay
  console.log('[SW:PERF] Benchmarking Scenario 1: Initial Gameplay...');
  await page.waitForTimeout(2000);
  const initialSnapshot = await page.evaluate(() => globalThis.getPhase6PerformanceSnapshot());

  // Scenario 2: Movement & Active Storm
  console.log('[SW:PERF] Benchmarking Scenario 2: Movement & Active Storm...');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(3000);
  await page.keyboard.up('ArrowUp');
  const movementSnapshot = await page.evaluate(() => globalThis.getPhase6PerformanceSnapshot());

  // Scenario 3: Heavy Destruction
  console.log('[SW:PERF] Benchmarking Scenario 3: Heavy Destruction...');
  await page.evaluate(() => {
    if (typeof globalThis.phase6SpawnDebris === 'function') {
      for (let i = 0; i < 15; i++) {
        globalThis.phase6SpawnDebris('#ef4444', 1.2, i * 4, 3.0, i * 4, 8, 12, 8, 0.3, 0.3, 2.5);
      }
    }
  });
  await page.waitForTimeout(2000);
  const destructionSnapshot = await page.evaluate(() => globalThis.getPhase6PerformanceSnapshot());

  const perfReport = {
    version: 'MODERNIZATION_PHASE6_PERFORMANCE_V1',
    timestamp: new Date().toISOString(),
    scenarios: {
      initialGameplay: initialSnapshot,
      movement: movementSnapshot,
      heavyDestruction: destructionSnapshot,
    },
    metricsSummary: {
      debrisPoolCapacity: destructionSnapshot.debrisPool.poolCapacity,
      debrisHighWaterMark: destructionSnapshot.debrisPool.highWaterMark,
      activeQualityTier: destructionSnapshot.adaptiveQuality.tier,
      recycledDebrisCount: destructionSnapshot.debrisPool.recycledCount,
    },
  };

  const jsonPath = path.join(artifactsDir, 'phase6-performance-report.json');
  await writeFile(jsonPath, JSON.stringify(perfReport, null, 2), 'utf8');

  const mdReport = `# Phase 6 Android Performance Evidence Report

**Generated:** ${perfReport.timestamp}  
**Engine Version:** ${perfReport.version}  

## Key Telemetry & Pool Bounds

- **Debris Pool Capacity:** ${perfReport.metricsSummary.debrisPoolCapacity}
- **Debris Pool High-Water Mark:** ${perfReport.metricsSummary.debrisHighWaterMark}
- **Recycled Debris Count:** ${perfReport.metricsSummary.recycledDebrisCount}
- **Active Quality Tier:** ${perfReport.metricsSummary.activeQualityTier}

## Scenario Performance Snapshots

### 1. Initial Gameplay
- Active Debris: ${initialSnapshot.debrisPool.activeCount}
- Quality Tier: ${initialSnapshot.adaptiveQuality.tier}

### 2. Movement & Active Storm
- Active Debris: ${movementSnapshot.debrisPool.activeCount}
- Quality Tier: ${movementSnapshot.adaptiveQuality.tier}

### 3. Heavy Destruction Load
- Active Debris: ${destructionSnapshot.debrisPool.activeCount}
- High-Water Mark: ${destructionSnapshot.debrisPool.highWaterMark}
- Quality Tier: ${destructionSnapshot.adaptiveQuality.tier}
`;

  const mdPath = path.join(artifactsDir, 'phase6-performance-report.md');
  await writeFile(mdPath, mdReport, 'utf8');

  console.log(`[SW:PERF] Performance evidence saved to:\n  - ${jsonPath}\n  - ${mdPath}`);
} finally {
  if (browser) await browser.close();
  if (server) server.close();
}
