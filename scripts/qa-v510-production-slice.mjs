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
const acceptedLifecycleStates = new Set(['ready', 'running', 'paused']);

async function captureFailure(page, viewport, url, phase, error, pageErrors, consoleErrors) {
  const diagnostic = await page.evaluate(() => ({
    legacyReady: globalThis.__SW_PRODUCTION_SLICE_READY__ === true,
    modernReady: globalThis.__SW_MODERN_SHELL_READY__ === true,
    architecture: globalThis.__SEVERE_WEATHER__?.architecture ?? null,
    lifecycle: globalThis.__SEVERE_WEATHER__?.app?.getStatus?.() ?? null,
    legacyStatus: globalThis.__SEVERE_WEATHER__?.qa?.getStatus?.() ?? null,
    qaState: globalThis.__SEVERE_WEATHER__?.qa?.getSnapshot?.() ?? null,
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

async function prepareAndSampleScenario(page) {
  const prepared = await page.evaluate(async () => {
    const bridge = globalThis.__SEVERE_WEATHER__?.qa;
    if (!bridge) throw new Error('Formal Severe Weather QA bridge is unavailable');
    await bridge.prepareScenario('production-hero');
    return true;
  });
  if (prepared !== true) throw new Error('Production slice hero setup did not initialize');

  let state = null;
  const maxSamples = 300;
  for (let sample = 0; sample < maxSamples; sample += 1) {
    await page.waitForTimeout(16);
    state = await page.evaluate(() => {
      const bridge = globalThis.__SEVERE_WEATHER__?.qa;
      if (!bridge) throw new Error('Formal Severe Weather QA bridge disappeared');
      bridge.advance(16);
      return bridge.getSnapshot();
    });
    if (state?.barn?.stage >= 2 && state.frameSampleCount >= 60) return state;
  }

  throw new Error(`Production slice did not stabilize after ${maxSamples} bounded samples: ${JSON.stringify(state)}`);
}

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  const url = new URL(baseUrl);
  await page.goto(url.toString(), { waitUntil: 'networkidle', timeout: 60000 });

  try {
    await page.waitForFunction(() => {
      const lifecycle = globalThis.__SEVERE_WEATHER__?.app?.getStatus?.().state;
      return globalThis.__SW_PRODUCTION_SLICE_READY__ === true
        && globalThis.__SW_MODERN_SHELL_READY__ === true
        && globalThis.__SEVERE_WEATHER__?.architecture === 'modern-shell-v1'
        && ['ready', 'running', 'paused'].includes(lifecycle);
    }, null, { timeout: 15000 });
  } catch (error) {
    await captureFailure(page, viewport, url, 'startup', error, pageErrors, consoleErrors);
    await context.close();
    await browser.close();
    throw error;
  }

  let state;
  try {
    state = await prepareAndSampleScenario(page);
  } catch (error) {
    await captureFailure(page, viewport, url, 'runtime', error, pageErrors, consoleErrors);
    await context.close();
    await browser.close();
    throw error;
  }

  const shellState = await page.evaluate(() => ({
    architecture: globalThis.__SEVERE_WEATHER__?.architecture ?? null,
    lifecycle: globalThis.__SEVERE_WEATHER__?.app?.getStatus?.() ?? null,
    legacyStatus: globalThis.__SEVERE_WEATHER__?.qa?.getStatus?.() ?? null,
    documentArchitecture: document.documentElement.dataset.swArchitecture ?? null
  }));
  const screenshotPath = path.join(outputDir, `${viewport.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const checks = {
    modernShell: shellState.architecture === 'modern-shell-v1'
      && acceptedLifecycleStates.has(shellState.lifecycle?.state)
      && shellState.documentArchitecture === 'modern-shell-v1',
    lifecycleSynchronized: shellState.lifecycle?.state === 'running',
    formalQaBridge: Object.values(shellState.legacyStatus ?? {}).every(Boolean),
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
    shellState,
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
  version: 'MODERN_SHELL_V1_QA',
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
