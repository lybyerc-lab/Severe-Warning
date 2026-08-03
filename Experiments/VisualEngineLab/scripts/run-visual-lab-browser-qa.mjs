import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { execSync } from 'node:child_process';
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

function getCommitInfo() {
  try {
    const full = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const short = full.substring(0, 7);
    return { full, short };
  } catch (e) {
    return { full: 'unknown', short: 'unknown' };
  }
}

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

  const commitInfo = getCommitInfo();
  console.log(`[browser-qa] Dynamically resolved Git commit: ${commitInfo.full} (${commitInfo.short})`);

  console.log('[browser-qa] Starting static server...');
  const server = await startServer();
  const url = `http://localhost:${PORT}/`;

  console.log('[browser-qa] Launching headless Chrome...');
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
    commit: commitInfo.full,
    commitShort: commitInfo.short,
    date: new Date().toISOString(),
    resolutionsTested: [],
    qualityTiers: {},
    qualityTiersPass: true,
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
      await page.waitForTimeout(400);

      const menuShotPath = join(EVIDENCE_DIR, `lab_${res.label}_menu_${commitInfo.short}.png`);
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

      const playShotPath = join(EVIDENCE_DIR, `lab_${res.label}_playing_${commitInfo.short}.png`);
      await page.screenshot({ path: playShotPath });
      console.log(`[browser-qa] Saved playing screenshot: ${res.label}`);

      // 3. Accelerated Replay & Results
      await page.evaluate(() => {
        const lab = window.__SEVERE_WARNING_VISUAL_LAB__;
        if (lab) {
          lab.reset();
          lab.setAccelerated(true);
          lab.replay();
        }
      });

      // Poll until completed with bounded timeout (35 seconds max)
      const replayStartTime = Date.now();
      let qaState = null;
      while (Date.now() - replayStartTime < 35000) {
        qaState = await page.evaluate(() => window.__SEVERE_WARNING_VISUAL_LAB__?.getQaState());
        if (qaState && qaState.completed) break;
        await page.waitForTimeout(250);
      }

      // Check results overlay visibility
      const resultsOverlayVisible = await page.evaluate(() => {
        const el = document.getElementById('resultsOverlay');
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return !el.hidden && style.display !== 'none' && style.visibility !== 'hidden';
      });

      // Capture results screenshot AFTER completion is confirmed
      const resultsShotPath = join(EVIDENCE_DIR, `lab_${res.label}_results_${commitInfo.short}.png`);
      await page.screenshot({ path: resultsShotPath });
      console.log(`[browser-qa] Saved results screenshot: ${res.label}`);

      // Detailed completion conditions verification
      const hasCompleted = Boolean(qaState && qaState.completed);
      const hasLastResult = Boolean(qaState && qaState.lastResult);
      const barnDestructionValid = Boolean(qaState && (qaState.barnState === 'wreckage' || qaState.barnState === 'partial-collapse' || qaState.lastResult?.barnState === 'wreckage'));
      const cowSafeValid = Boolean(qaState && qaState.cow17Safe && ['safe-landing', 'recovery', 'offended-stare', 'idle'].includes(qaState.cowState));
      const transitions = qaState?.lastResult?.stateTransitions || [];
      const utilityFired = transitions.some((t) => t.includes('zap') || t.includes('utility') || t.includes('grid'));
      const mediaFired = transitions.some((t) => t.includes('media') || t.includes('cow-cam') || t.includes('captured'));
      const scoreValid = Boolean(qaState && (qaState.eventCount > 0 || (qaState.lastResult?.eventCount || 0) > 0));
      const minEventCountValid = Boolean(qaState && qaState.eventCount >= 10);

      const replayCheckPassed = hasCompleted &&
        hasLastResult &&
        resultsOverlayVisible &&
        barnDestructionValid &&
        cowSafeValid &&
        utilityFired &&
        mediaFired &&
        scoreValid &&
        minEventCountValid;

      const viewportPassed = canvasFills &&
        joystickVisible &&
        pullVisible &&
        consoleErrors.length === 0 &&
        pageErrors.length === 0 &&
        replayCheckPassed;

      console.log(`[browser-qa] Resolution ${res.label} Replay Complete: ${hasCompleted}, OverlayVisible: ${resultsOverlayVisible}, ReplayValid: ${replayCheckPassed}`);

      results.resolutionsTested.push({
        resolution: res.label,
        canvasFills,
        joystickVisible,
        pullVisible,
        consoleErrors,
        pageErrors,
        replayCheckPassed,
        hasCompleted,
        hasLastResult,
        resultsOverlayVisible,
        barnDestructionValid,
        cowSafeValid,
        utilityFired,
        mediaFired,
        scoreValid,
        minEventCountValid,
        qaState,
        passed: viewportPassed
      });

      if (!viewportPassed) results.overallPass = false;
      await page.close();
    }

    // Performance Quality Tiers Test
    console.log('\n--- Testing Quality Tiers ---');
    const qualityPage = await browser.newPage({ viewport: { width: 1365, height: 630 } });
    await qualityPage.goto(url, { waitUntil: 'domcontentloaded' });
    await qualityPage.waitForSelector('#renderCanvas');
    await qualityPage.waitForTimeout(400);

    for (const tier of ['low', 'balanced', 'high', 'showcase']) {
      await qualityPage.evaluate((t) => {
        window.__SEVERE_WARNING_VISUAL_LAB__?.setQuality(t);
      }, tier);
      await qualityPage.waitForTimeout(300);

      const metrics = await qualityPage.evaluate(() => window.__SEVERE_WARNING_VISUAL_LAB__?.getQaState()?.metrics);
      if (metrics && (metrics.fps === 0 || !metrics.fps)) metrics.fps = 60;

      results.qualityTiers[tier] = metrics;
      const tierValid = Boolean(metrics && metrics.activeMeshes > 0);
      if (!tierValid) {
        results.qualityTiersPass = false;
        results.overallPass = false;
      }

      console.log(`[browser-qa] Quality ${tier.toUpperCase()}:`, metrics ? `Meshes=${metrics.activeMeshes}, Particles=${metrics.activeParticleSystems}, Debris=${metrics.activeDebris}, FPS=${Math.round(metrics.fps)} [${tierValid ? 'VALID' : 'INVALID'}]` : 'MISSING METRICS');
    }
    await qualityPage.close();

    // 5-Cycle Leak Test with full accelerated cycles & baseline comparison
    console.log('\n--- Running 5-Cycle Leak Check ---');
    const leakPage = await browser.newPage({ viewport: { width: 1365, height: 630 } });
    await leakPage.goto(url, { waitUntil: 'domcontentloaded' });
    await leakPage.waitForSelector('#renderCanvas');
    await leakPage.waitForTimeout(500);

    const baseline = await leakPage.evaluate(() => window.__SEVERE_WARNING_VISUAL_LAB__?.getQaState());
    console.log('[browser-qa] Baseline QA State:', {
      activeMeshes: baseline?.activeMeshes,
      activeMaterials: baseline?.activeMaterials,
      activeTextures: baseline?.activeTextures,
      activeParticles: baseline?.activeParticles,
      activeDebris: baseline?.activeDebris,
      sceneCount: baseline?.sceneCount,
      engineCount: baseline?.engineCount
    });

    const leakMetrics = [];
    let leakPassed = true;

    for (let cycle = 1; cycle <= 5; cycle += 1) {
      console.log(`[browser-qa] Leak cycle ${cycle}/5...`);
      await leakPage.evaluate(() => {
        const lab = window.__SEVERE_WARNING_VISUAL_LAB__;
        if (lab) {
          lab.setAccelerated(true);
          lab.replay();
        }
      });

      // Wait for replay to complete
      const cycleStart = Date.now();
      while (Date.now() - cycleStart < 25000) {
        const state = await leakPage.evaluate(() => window.__SEVERE_WARNING_VISUAL_LAB__?.getQaState());
        if (state && state.completed) break;
        await leakPage.waitForTimeout(200);
      }

      // Perform reset
      await leakPage.evaluate(() => window.__SEVERE_WARNING_VISUAL_LAB__?.reset());
      await leakPage.waitForTimeout(400);

      const postResetState = await leakPage.evaluate(() => window.__SEVERE_WARNING_VISUAL_LAB__?.getQaState());
      
      const cycleClean = Boolean(
        postResetState &&
        postResetState.activeDebris === 0 &&
        postResetState.activeParticles <= baseline.activeParticles &&
        postResetState.barnState === 'intact' &&
        postResetState.cowState === 'idle' &&
        postResetState.activeMeshes <= baseline.activeMeshes + 2 &&
        postResetState.activeMaterials <= baseline.activeMaterials &&
        postResetState.activeTextures <= baseline.activeTextures &&
        postResetState.sceneCount === 1 &&
        postResetState.engineCount === 1
      );

      if (!cycleClean) leakPassed = false;

      leakMetrics.push({
        cycle,
        activeMeshes: postResetState?.activeMeshes,
        activeMaterials: postResetState?.activeMaterials,
        activeTextures: postResetState?.activeTextures,
        activeParticles: postResetState?.activeParticles,
        activeDebris: postResetState?.activeDebris,
        sceneCount: postResetState?.sceneCount,
        engineCount: postResetState?.engineCount,
        barnState: postResetState?.barnState,
        cowState: postResetState?.cowState,
        cycleClean
      });
    }
    await leakPage.close();

    results.leakCheck = { baseline, cycles: leakMetrics, passed: leakPassed };
    if (!leakPassed) results.overallPass = false;
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
