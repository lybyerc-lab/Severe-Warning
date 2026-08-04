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
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader', '--enable-webgl']
});

const viewports = [
  { name: 'desktop-1365x768', width: 1365, height: 768, isMobile: false },
  { name: 'mobile-915x412', width: 915, height: 412, isMobile: true }
];
const results = [];

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
  url.searchParams.set('sliceqa', '1');
  await page.goto(url.toString(), { waitUntil: 'networkidle', timeout: 60000 });

  try {
    await page.waitForFunction(() => globalThis.__SW_PRODUCTION_SLICE_READY__ === true, null, { timeout: 15000 });
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      ready: globalThis.__SW_PRODUCTION_SLICE_READY__ === true,
      hasQaState: typeof globalThis.getProductionSliceQaState === 'function',
      hasRebuild: typeof globalThis.__SW_V510_REBUILD__ === 'function',
      hasUpdate: typeof globalThis.__SW_V510_UPDATE__ === 'function',
      documentState: document.readyState,
      title: document.title,
      bodyClass: document.body.className
    })).catch(evaluationError => ({ evaluationError: evaluationError.message }));
    const failure = {
      viewport,
      url: url.toString(),
      waitError: error.message,
      diagnostic,
      pageErrors,
      consoleErrors
    };
    await page.screenshot({ path: path.join(outputDir, `${viewport.name}-startup-failure.png`), fullPage: false }).catch(() => {});
    await writeFile(path.join(outputDir, `${viewport.name}-startup-failure.json`), `${JSON.stringify(failure, null, 2)}\n`, 'utf8');
    console.error(`Production slice startup failure: ${JSON.stringify(failure)}`);
    await context.close();
    await browser.close();
    throw error;
  }

  await page.waitForFunction(() => {
    const state = globalThis.getProductionSliceQaState?.();
    return state && state.barn && state.barn.stage >= 2 && state.frameSampleCount >= 45;
  }, null, { timeout: 30000 });

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
    realFpsSamples: state.frameSampleCount >= 45 && Number.isFinite(state.productionMeasuredFps) && state.productionMeasuredFps > 0,
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
  version: 'V510_PRODUCTION_SLICE_QA_V1',
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
