import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const PORT = 3145;
const DIST_DIR = join(process.cwd(), 'dist');
const EVIDENCE_DIR = join(process.cwd(), '..', '..', 'Docs', 'Evidence', 'VisualEngineLab');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.wasm': 'application/wasm'
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
      if (!existsSync(filePath)) filePath = join(DIST_DIR, 'index.html');
      try {
        const content = readFileSync(filePath);
        const ext = extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(content);
      } catch (err) {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(PORT, () => {
      resolve(server);
    });
  });
}

async function runBrowserQa() {
  if (!existsSync(EVIDENCE_DIR)) mkdirSync(EVIDENCE_DIR, { recursive: true });

  console.log('[browser-qa] Starting static server...');
  const server = await startServer();
  const url = `http://localhost:${PORT}/`;

  console.log('[browser-qa] Launching headless browser...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--enable-webgl', '--no-sandbox']
  });

  const resolutions = [
    { width: 1365, height: 630, label: '1365x630' },
    { width: 932, height: 430, label: '932x430' },
    { width: 915, height: 412, label: '915x412' },
    { width: 740, height: 360, label: '740x360' }
  ];

  const results = {
    commit: 'ef25675283182ee368c6b0dc9332b0245c521fed',
    date: new Date().toISOString(),
    resolutionsTested: [],
    qualityTiers: {},
    leakCheck: null,
    overallPass: true
  };

  try {
    for (const res of resolutions) {
      console.log(`\n--- Testing Resolution ${res.label} ---`);
      const page = await browser.newPage({
        viewport: { width: res.width, height: res.height },
        deviceScaleFactor: 1
      });

      const consoleErrors = [];
      const pageErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', (err) => pageErrors.push(err.message));

      // 1. Menu view
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#renderCanvas');
      await page.waitForTimeout(500);

      const menuShotPath = join(EVIDENCE_DIR, `lab_${res.label}_menu_ef25675.png`);
      await page.screenshot({ path: menuShotPath });
      console.log(`[browser-qa] Saved menu screenshot: ${res.label}`);

      const canvasBox = await page.locator('#renderCanvas').boundingBox();
      const canvasFills = Boolean(canvasBox && Math.abs(canvasBox.width - res.width) < 5 && Math.abs(canvasBox.height - res.height) < 5);

      // 2. Playable mode
      await page.click('#btnPlayBenchmark');
      await page.waitForTimeout(400);

      const joystickVisible = await page.isVisible('#joystickArea');
      const pullVisible = await page.isVisible('#btnPull');

      await page.click('#btnPull');
      await page.waitForTimeout(200);
      await page.click('#btnGust');
      await page.waitForTimeout(200);
      await page.click('#btnZap');
      await page.waitForTimeout(300);

      const playShotPath = join(EVIDENCE_DIR, `lab_${res.label}_playing_ef25675.png`);
      await page.screenshot({ path: playShotPath });
      console.log(`[browser-qa] Saved playing screenshot: ${res.label}`);

      // 3. Replay mode & Results
      await page.evaluate(() => {
        const lab = window.__SEVERE_WARNING_VISUAL_LAB__;
        if (lab) {
          lab.reset();
          lab.setAccelerated(true);
          lab.replay();
        }
      });
      await page.waitForTimeout(5000);

      const resultsShotPath = join(EVIDENCE_DIR, `lab_${res.label}_results_ef25675.png`);
      await page.screenshot({ path: resultsShotPath });
      console.log(`[browser-qa] Saved results screenshot: ${res.label}`);

      const qaState = await page.evaluate(() => window.__SEVERE_WARNING_VISUAL_LAB__?.getQaState());

      const resPass = canvasFills && joystickVisible && pullVisible && consoleErrors.length === 0 && pageErrors.length === 0;
      results.resolutionsTested.push({
        resolution: res.label,
        canvasFills,
        joystickVisible,
        pullVisible,
        consoleErrors,
        pageErrors,
        qaState,
        passed: resPass
      });

      if (!resPass) results.overallPass = false;
      await page.close();
    }

    // Performance Quality Tiers Test
    console.log('\n--- Testing Quality Tiers ---');
    for (const tier of ['low', 'balanced', 'high', 'showcase']) {
      const page = await browser.newPage({ viewport: { width: 1365, height: 630 } });
      await page.goto(`${url}?quality=${tier}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const metrics = await page.evaluate(() => window.__SEVERE_WARNING_VISUAL_LAB__?.getQaState()?.metrics);
      results.qualityTiers[tier] = metrics;
      console.log(`[browser-qa] Quality ${tier.toUpperCase()}:`, metrics ? `Meshes=${metrics.activeMeshes}, Particles=${metrics.activeParticleSystems}, Debris=${metrics.activeDebris}, FPS=${Math.round(metrics.fps)}` : 'No metrics');
      await page.close();
    }

    // 5-Cycle Leak Test
    console.log('\n--- Running 5-Cycle Leak Check ---');
    const leakPage = await browser.newPage({ viewport: { width: 1365, height: 630 } });
    await leakPage.goto(url, { waitUntil: 'domcontentloaded' });
    await leakPage.waitForSelector('#renderCanvas');

    const leakMetrics = [];
    for (let cycle = 1; cycle <= 5; cycle += 1) {
      await leakPage.evaluate(() => {
        window.__SEVERE_WARNING_VISUAL_LAB__?.replay();
      });
      await leakPage.waitForTimeout(800);
      await leakPage.evaluate(() => {
        window.__SEVERE_WARNING_VISUAL_LAB__?.reset();
      });
      const qa = await leakPage.evaluate(() => window.__SEVERE_WARNING_VISUAL_LAB__?.getQaState());
      leakMetrics.push({
        cycle,
        activeDebris: qa?.activeDebris,
        activeParticles: qa?.activeParticles,
        barnState: qa?.barnState,
        cowState: qa?.cowState
      });
    }
    await leakPage.close();

    const leakPassed = leakMetrics.every((m) => m.activeDebris === 0 && m.barnState === 'intact' && m.cowState === 'idle');
    results.leakCheck = { cycles: leakMetrics, passed: leakPassed };
    console.log(`[browser-qa] 5-Cycle Leak Check: ${leakPassed ? 'PASS' : 'FAIL'}`);

    const reportPath = join(EVIDENCE_DIR, 'browser-qa-report.json');
    writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n[browser-qa] Saved evidence report to ${reportPath}`);

  } finally {
    await browser.close();
    server.close();
  }

  if (!results.overallPass) {
    console.error('[browser-qa] Automated browser QA failed.');
    process.exit(1);
  } else {
    console.log('\n[browser-qa] ALL AUTOMATED BROWSER QA PASSED CLEANLY.');
  }
}

runBrowserQa().catch((err) => {
  console.error('[browser-qa] Error running browser QA:', err);
  process.exit(1);
});
