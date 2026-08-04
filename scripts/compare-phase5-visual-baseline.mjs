import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_VISUAL_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_VISUAL_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'modernization-phase-5', 'visual-baseline');
const baseUrl = process.env.SEVERE_WEATHER_BASE_URL || 'http://127.0.0.1:4174/';
const candidateUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
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
    '--disable-gpu-sandbox',
  ],
});

const viewports = [
  { name: 'desktop-1365x768', width: 1365, height: 768, isMobile: false },
  { name: 'mobile-915x412', width: 915, height: 412, isMobile: true },
  { name: 'wide-landscape-1280x540', width: 1280, height: 540, isMobile: true },
];
const scenarios = ['initial', 'hero'];
const results = [];

function deterministicRandomScript() {
  let state = 0x5e1e5eed;
  Math.random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

async function capture(url, viewport, scenario, label) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
  });
  await context.addInitScript(deterministicRandomScript);
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForFunction(() => (
    globalThis.__SW_MODERN_SHELL_READY__ === true
    && globalThis.__SW_PRODUCTION_SLICE_READY__ === true
    && globalThis.__SEVERE_WEATHER__?.qa
  ));
  if (scenario === 'hero') {
    await page.evaluate(async () => {
      await globalThis.__SEVERE_WEATHER__.qa.prepareScenario('production-hero');
      globalThis.__SEVERE_WEATHER__.qa.advance(100);
    });
  }
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(scenario === 'hero' ? 150 : 350);

  const capture = await page.evaluate(() => {
    const source = document.getElementById('webgl');
    if (!(source instanceof HTMLCanvasElement)) throw new Error('WebGL canvas unavailable.');
    const width = 256;
    const height = Math.max(1, Math.round(width * source.height / source.width));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context2d = canvas.getContext('2d', { willReadFrequently: true });
    if (!context2d) throw new Error('2D comparison canvas unavailable.');
    context2d.drawImage(source, 0, 0, width, height);
    const imageData = context2d.getImageData(0, 0, width, height);
    const qa = globalThis.getProductionSliceQaState?.() ?? null;
    return {
      width,
      height,
      pixels: Array.from(imageData.data),
      semantic: qa ? {
        renderer: qa.renderer,
        quality: qa.quality,
        funnelLayers: qa.funnelLayers,
        suctionRings: qa.suctionRings,
        debrisInstances: qa.debrisInstances,
        dressing: qa.dressing,
        barn: qa.barn,
        cow17: qa.cow17,
        camera: qa.camera,
        fragments: qa.fragments,
        campaignId: qa.campaignId,
      } : null,
    };
  });

  const screenshotPath = path.join(outputDir, `${viewport.name}-${scenario}-${label}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  await context.close();
  return {
    ...capture,
    pageErrors,
    consoleErrors,
    screenshot: path.relative(projectRoot, screenshotPath).replaceAll('\\', '/'),
  };
}

function comparePixels(left, right) {
  if (left.width !== right.width || left.height !== right.height || left.pixels.length !== right.pixels.length) {
    throw new Error('Visual captures have incompatible dimensions.');
  }
  let changedPixels = 0;
  let absoluteError = 0;
  const pixelCount = left.width * left.height;
  for (let index = 0; index < left.pixels.length; index += 4) {
    const red = Math.abs(left.pixels[index] - right.pixels[index]);
    const green = Math.abs(left.pixels[index + 1] - right.pixels[index + 1]);
    const blue = Math.abs(left.pixels[index + 2] - right.pixels[index + 2]);
    absoluteError += red + green + blue;
    if (Math.max(red, green, blue) > 8) changedPixels += 1;
  }
  return {
    changedPixels,
    pixelCount,
    changedRatio: changedPixels / pixelCount,
    meanAbsoluteError: absoluteError / (pixelCount * 3),
  };
}

for (const viewport of viewports) {
  for (const scenario of scenarios) {
    const baseA = await capture(baseUrl, viewport, scenario, 'base-a');
    const baseB = await capture(baseUrl, viewport, scenario, 'base-b');
    const candidate = await capture(candidateUrl, viewport, scenario, 'candidate');
    const repeatNoise = comparePixels(baseA, baseB);
    const candidateDiff = comparePixels(baseA, candidate);
    const changedRatioThreshold = Math.max(0.0005, repeatNoise.changedRatio + 0.0005);
    const meanErrorThreshold = Math.max(0.5, repeatNoise.meanAbsoluteError + 0.5);
    const semanticMatch = JSON.stringify(baseA.semantic) === JSON.stringify(candidate.semantic);
    const checks = {
      baseRepeatClean: baseA.pageErrors.length === 0
        && baseA.consoleErrors.length === 0
        && baseB.pageErrors.length === 0
        && baseB.consoleErrors.length === 0,
      candidateClean: candidate.pageErrors.length === 0 && candidate.consoleErrors.length === 0,
      semanticMatch,
      changedRatioWithinMeasuredNoise: candidateDiff.changedRatio <= changedRatioThreshold,
      meanErrorWithinMeasuredNoise: candidateDiff.meanAbsoluteError <= meanErrorThreshold,
    };
    results.push({
      viewport,
      scenario,
      repeatNoise,
      candidateDiff,
      thresholds: { changedRatioThreshold, meanErrorThreshold },
      semantic: { base: baseA.semantic, candidate: candidate.semantic, match: semanticMatch },
      captures: { baseA, baseB, candidate },
      checks,
      passed: Object.values(checks).every(Boolean),
    });
    console.log(
      `${Object.values(checks).every(Boolean) ? 'PASS' : 'FAIL'} ${viewport.name} ${scenario}`
      + ` :: repeat=${(repeatNoise.changedRatio * 100).toFixed(4)}%`
      + ` candidate=${(candidateDiff.changedRatio * 100).toFixed(4)}%`
      + ` threshold=${(changedRatioThreshold * 100).toFixed(4)}%`,
    );
  }
}

await browser.close();
const report = {
  version: 'PHASE5_DUAL_BUILD_VISUAL_BASELINE_V1',
  generatedAt: new Date().toISOString(),
  baseUrl,
  candidateUrl,
  pixelLaw: {
    comparisonWidth: 256,
    changedPixelChannelThreshold: 8,
    marginChangedRatio: 0.0005,
    marginMeanAbsoluteError: 0.5,
  },
  results,
  passed: results.every((result) => result.passed),
};
await writeFile(
  path.join(outputDir, 'visual-baseline-report.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);
if (!report.passed) process.exitCode = 1;
