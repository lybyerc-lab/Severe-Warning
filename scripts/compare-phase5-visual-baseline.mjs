import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
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

function decodePng(buffer) {
  let offset = 8;
  let width = 0;
  let height = 0;
  const idatChunks = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    if (type === 'IHDR') {
      width = buffer.readUInt32BE(offset + 8);
      height = buffer.readUInt32BE(offset + 12);
    } else if (type === 'IDAT') {
      idatChunks.push(buffer.subarray(offset + 8, offset + 8 + length));
    }
    offset += 12 + length;
  }
  const compressed = Buffer.concat(idatChunks);
  const decompressed = inflateSync(compressed);
  const stride = width * 4 + 1;
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * stride;
    const filter = decompressed[rowStart];
    const outRowStart = y * width * 4;
    for (let x = 0; x < width * 4; x += 1) {
      const raw = decompressed[rowStart + 1 + x];
      const left = x >= 4 ? pixels[outRowStart + x - 4] : 0;
      const up = y > 0 ? pixels[(y - 1) * width * 4 + x] : 0;
      const upperLeft = (x >= 4 && y > 0) ? pixels[(y - 1) * width * 4 + x - 4] : 0;
      let val = 0;
      if (filter === 0) val = raw;
      else if (filter === 1) val = (raw + left) & 0xff;
      else if (filter === 2) val = (raw + up) & 0xff;
      else if (filter === 3) val = (raw + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) {
        const p = left + up - upperLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upperLeft);
        const pr = (pa <= pb && pa <= pc) ? left : (pb <= pc ? up : upperLeft);
        val = (raw + pr) & 0xff;
      }
      pixels[outRowStart + x] = val;
    }
  }
  return { width, height, pixels };
}

function analyzeCaptureValidity(decoded) {
  const pixelCount = decoded.width * decoded.height;
  let nonBlackCount = 0;
  const colors = new Set();
  let sumLuminance = 0;

  for (let i = 0; i < decoded.pixels.length; i += 4) {
    const r = decoded.pixels[i];
    const g = decoded.pixels[i + 1];
    const b = decoded.pixels[i + 2];
    if (r > 5 || g > 5 || b > 5) nonBlackCount += 1;
    colors.add((r << 16) | (g << 8) | b);
    sumLuminance += 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const meanLuminance = sumLuminance / pixelCount;
  let varianceSum = 0;
  for (let i = 0; i < decoded.pixels.length; i += 4) {
    const r = decoded.pixels[i];
    const g = decoded.pixels[i + 1];
    const b = decoded.pixels[i + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    varianceSum += (luminance - meanLuminance) ** 2;
  }
  const luminanceVariance = varianceSum / pixelCount;
  const nonBlackRatio = nonBlackCount / pixelCount;
  const distinctColors = colors.size;
  const valid = nonBlackRatio >= 0.05 && luminanceVariance >= 10.0 && distinctColors >= 100;

  return {
    width: decoded.width,
    height: decoded.height,
    nonBlackCount,
    nonBlackRatio,
    distinctColors,
    meanLuminance,
    luminanceVariance,
    valid,
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

  // Deterministic capture point: prepare scenario, advance through QA bridge, freeze clock
  await page.evaluate(async (scenarioName) => {
    if (globalThis.__SW_PHASE2_CLOCK_BRIDGE__?.pause) {
      globalThis.__SW_PHASE2_CLOCK_BRIDGE__.pause();
    }
    const qa = globalThis.__SEVERE_WEATHER__.qa;
    if (scenarioName === 'hero') {
      await qa.prepareScenario('production-hero');
    }
    qa.advance(0);
    if (qa.renderFrame) {
      qa.renderFrame();
    }
    if (document.fonts?.ready) await document.fonts.ready;
  }, scenario);

  const canvasLocator = page.locator('#webgl, canvas#gameCanvas, canvas').first();
  const pngBuffer = await canvasLocator.screenshot({ type: 'png' });
  const decoded = decodePng(pngBuffer);
  const validity = analyzeCaptureValidity(decoded);

  const semantic = await page.evaluate(() => {
    const qa = globalThis.getProductionSliceQaState?.() ?? null;
    if (!qa) return null;
    return {
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
    };
  });

  const screenshotPath = path.join(outputDir, `${viewport.name}-${scenario}-${label}.png`);
  await writeFile(screenshotPath, pngBuffer);
  await context.close();

  return {
    width: decoded.width,
    height: decoded.height,
    pixels: decoded.pixels,
    validity,
    semantic,
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

function compareSemantics(base, candidate) {
  if (!base || !candidate) return { match: false, stableMatch: false, cameraMatch: false, cow17Match: false };
  const stableMatch = base.renderer === candidate.renderer
    && base.quality === candidate.quality
    && base.funnelLayers === candidate.funnelLayers
    && base.suctionRings === candidate.suctionRings
    && base.dressing?.cropRows === candidate.dressing?.cropRows
    && base.dressing?.trees === candidate.dressing?.trees
    && base.dressing?.fences === candidate.dressing?.fences
    && base.dressing?.streetProps === candidate.dressing?.streetProps
    && base.barn?.stage === candidate.barn?.stage
    && base.campaignId === candidate.campaignId;

  const cameraMatch = base.camera?.fov === candidate.camera?.fov
    && Math.abs((base.camera?.y ?? 0) - (candidate.camera?.y ?? 0)) < 15.0
    && Math.abs((base.camera?.z ?? 0) - (candidate.camera?.z ?? 0)) < 25.0;

  const cow17Match = (!base.cow17 || !candidate.cow17) || (
    base.cow17.decorated === candidate.cow17.decorated
    && base.cow17.airborne === candidate.cow17.airborne
    && Math.abs((base.cow17.scale ?? 0) - (candidate.cow17.scale ?? 0)) < 0.05
  );

  return {
    stableMatch,
    cameraMatch,
    cow17Match,
    match: stableMatch && cameraMatch && cow17Match,
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

    const semanticDiff = compareSemantics(baseA.semantic, candidate.semantic);
    const captureValidityPass = baseA.validity.valid && baseB.validity.valid && candidate.validity.valid;

    const checks = {
      baseRepeatClean: baseA.pageErrors.length === 0
        && baseA.consoleErrors.length === 0
        && baseB.pageErrors.length === 0
        && baseB.consoleErrors.length === 0,
      candidateClean: candidate.pageErrors.length === 0 && candidate.consoleErrors.length === 0,
      captureValidityPass,
      semanticMatch: semanticDiff.match,
      changedRatioWithinMeasuredNoise: candidateDiff.changedRatio <= changedRatioThreshold,
      meanErrorWithinMeasuredNoise: candidateDiff.meanAbsoluteError <= meanErrorThreshold,
    };

    // Omit large pixel buffers from report JSON to keep output compact and clean
    const sanitizeCapture = (cap) => ({
      width: cap.width,
      height: cap.height,
      validity: cap.validity,
      semantic: cap.semantic,
      pageErrors: cap.pageErrors,
      consoleErrors: cap.consoleErrors,
      screenshot: cap.screenshot,
    });

    results.push({
      viewport,
      scenario,
      repeatNoise,
      candidateDiff,
      thresholds: { changedRatioThreshold, meanErrorThreshold },
      semantic: { base: baseA.semantic, candidate: candidate.semantic, diff: semanticDiff },
      validity: { baseA: baseA.validity, baseB: baseB.validity, candidate: candidate.validity },
      captures: {
        baseA: sanitizeCapture(baseA),
        baseB: sanitizeCapture(baseB),
        candidate: sanitizeCapture(candidate),
      },
      checks,
      passed: Object.values(checks).every(Boolean),
    });

    console.log(
      `${Object.values(checks).every(Boolean) ? 'PASS' : 'FAIL'} ${viewport.name} ${scenario}`
      + ` :: repeat=${(repeatNoise.changedRatio * 100).toFixed(4)}%`
      + ` candidate=${(candidateDiff.changedRatio * 100).toFixed(4)}%`
      + ` valid=${captureValidityPass}`
      + ` semantic=${semanticDiff.match}`,
    );
  }
}

await browser.close();
const report = {
  version: 'PHASE5_DUAL_BUILD_VISUAL_BASELINE_V2',
  generatedAt: new Date().toISOString(),
  baseUrl,
  candidateUrl,
  pixelLaw: {
    comparisonSource: 'Playwright locator canvas PNG screenshot',
    changedPixelChannelThreshold: 8,
    marginChangedRatio: 0.0005,
    marginMeanAbsoluteError: 0.5,
    validityRequirements: { minNonBlackRatio: 0.05, minLuminanceVariance: 10.0, minDistinctColors: 100 },
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
