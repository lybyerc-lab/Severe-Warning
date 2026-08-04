import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'v510-production-slice');
const baseUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
const executablePath = process.env.CHROME_BIN || undefined;

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--enable-webgl',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--disable-gpu-sandbox'
  ]
});

const viewports = [
  { name: 'desktop-1365x768', width: 1365, height: 768, isMobile: false },
  { name: 'mobile-915x412', width: 915, height: 412, isMobile: true }
];
const results = [];

async function captureFailure(page, viewport, url, phase, error, pageErrors, consoleErrors) {
  const diagnostic = await page.evaluate(() => ({
    ready: globalThis.__SW_PRODUCTION_SLICE_READY__ === true,
    hasQaState: typeof globalThis.getProductionSliceQaState === 'function',
    hasQaTrigger: typeof globalThis.triggerProductionSliceQa === 'function',
    hasRebuild: typeof globalThis.__SW_V510_REBUILD__ === 'function',
    hasUpdate: typeof globalThis.__SW_V510_UPDATE__ === 'function',
    qaState: typeof globalThis.getProductionSliceQaState === 'function'
      ? globalThis.getProductionSliceQaState()
      : null,
    documentState: document.readyState,
    title: document.title,
    bodyClass: document.body.className
  })).catch(evaluationError => ({ evaluationError: evaluationError.message }));
  const failure = {
    phase,
    viewport,
    url: url.toString(),
    waitError: error.message,
    diagnostic,
    pageErrors,
    consoleErrors
  };
  await page.screenshot({ path: path.join(outputDir, `${viewport.name}-${phase}-failure.png`), fullPage: false }).catch(() => {});
  await writeFile(path.join(outputDir, `${viewport.name}-${phase}-failure.json`), `${JSON.stringify(failure, null, 2)}\n`, 'utf8');
  console.error(`Production slice ${phase} failure: ${JSON.stringify(failure)}`);
}

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile
  });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  const url = new URL(baseUrl);
  await page.goto(url.toString(), { waitUntil: 'networkidle', timeout: 60000 });

  try {
    await page.waitForFunction(() => globalThis.__SW_PRODUCTION_SLICE_READY__ === true, null, { timeout: 15000 });
  } catch (error) {
    await captureFailure(page, viewport, url, 'startup', error, pageErrors, consoleErrors);
    await context.close();
    await browser.close();
    throw error;
  }

  try {
    await page.evaluate(async () => {
      if (typeof globalThis.triggerProductionSliceQa !== 'function') {
        throw new Error('triggerProductionSliceQa is unavailable');
      }
      if (typeof globalThis.__SW_V510_UPDATE__ !== 'function') {
        throw new Error('__SW_V510_UPDATE__ is unavailable');
      }
      if (globalThis.triggerProductionSliceQa('hero') !== true) {
        throw new Error('Production slice hero setup did not initialize');
      }

      await new Promise((resolve, reject) => {
        let frames = 0;
        let previousNow = performance.now();
        const maxFrames = 240;

        const sampleFrame = now => {
          const dt = (now - previousNow) / 1000;
          previousNow = now;
          globalThis.__SW_V510_UPDATE__(dt, now, false);
          frames += 1;

          const state = globalThis.getProductionSliceQaState?.();
          if (state?.barn?.stage >= 2 && state.frameSampleCount >= 60) {
            resolve();
            return;
          }
          if (frames >= maxFrames) {
            reject(new Error(`Production slice did not stabilize after ${frames} real animation frames: ${JSON.stringify(state)}`));
            return;
          }
          requestAnimationFrame(sampleFrame);
        };

        requestAnimationFrame(sampleFrame);
      });
    }, { timeout: 60000 });

    await page.waitForFunction(() => {
      const state = globalThis.getProductionSliceQaState?.();
      return state && state.barn && state.barn.stage >= 2 && state.frameSampleCount >= 60;
    }, null, { timeout: 5000 });
  } catch (error) {
    await captureFailure(page, viewport, url, 'runtime', error, pageErrors, consoleErrors);
    await context.close();
    await browser.close();
    throw error;
  }

  const state = await page.evaluate(() => globalThis.getProductionSliceQaState());
  const screenshotPath = path.join(outputDir, `${viewport.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const checks = {
    marker: state.marker === 'V510_THREEJS_PRODUCTION_SLICE_V1',
    renderer: state.renderer === 'Three.js r128',
    funnelLayers: state.funnelLayers >= 3,
    suctionRings: state.suctionRings === 3,
    debrisInstances: state.debrisInstances >= 10,
    authoredBarn: state.barn?.stage >= 2 && state.barn?.roofLeftDetached === true,
    cow17: state.cow17?.scale >= 1.3 && state.cow17?.decorated === true,
    dressing: state.dressing?.cropRows >= 12 && state.dressing?.trees >= 18 && state.dressing?.fences > 0,
    realFpsSamples: state.frameSampleCount >= 60 && Number.isFinite(state.productionMeasuredFps) && state.productionMeasuredFps > 0,
    noPageErrors: pageErrors.length === 0,
    noConsoleErrors: consoleErrors.length === 0
  };

  results.push({
    viewport,
    url: url.toString(),
    screenshot: path.relative(projectRoot, screenshotPath).replaceAll('\\', '/'),
    state,
    checks,
    pageErrors,
    consoleErrors,
    passed: Object.values(checks).every(Boolean)
  });
  await context.close();
}

await browser.close();
const report = {
  version: 'V510_PRODUCTION_SLICE_QA_V2',
  generatedAt: new Date().toISOString(),
  sourceUrl: baseUrl,
  results,
  passed: results.every(result => result.passed)
};
await writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.viewport.name} :: ${JSON.stringify(result.checks)}`);
  console.log(`Measured median FPS: ${result.state.productionMeasuredFps} from ${result.state.frameSampleCount} real samples`);
}
if (!report.passed) process.exitCode = 1;
