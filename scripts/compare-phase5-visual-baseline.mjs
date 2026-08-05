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
const fixedTimestamps = [1000.0, 1016.6667, 1033.3334, 1050.0001, 1066.6668];

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
  { name: 'wide-landscape-1280x540', width: 1280, height: 540, isMobile: false },
];
const scenarios = ['initial', 'hero'];
const results = [];

function installQaTimeController() {
  let randomState = 0x5e1e5eed;
  Math.random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 0x100000000;
  };

  const nativeRaf = window.requestAnimationFrame.bind(window);
  const nativeCancelRaf = window.cancelAnimationFrame.bind(window);
  const nativePerformanceNow = performance.now.bind(performance);
  const nativeDateNow = Date.now.bind(Date);

  let frozen = false;
  let simulatedTimestamp = 1000.0;
  let nextCallbackId = 1;
  let steppedFrameCount = 0;
  const timestampSequence = [];
  const queuedRafCallbacks = new Map();

  performance.now = () => (frozen ? simulatedTimestamp : nativePerformanceNow());
  Date.now = () => (frozen ? Math.round(simulatedTimestamp) : nativeDateNow());

  window.requestAnimationFrame = (callback) => {
    const id = nextCallbackId++;
    if (frozen) {
      queuedRafCallbacks.set(id, callback);
      return id;
    }
    return nativeRaf((timestamp) => {
      simulatedTimestamp = timestamp;
      callback(timestamp);
    });
  };

  window.cancelAnimationFrame = (id) => {
    queuedRafCallbacks.delete(id);
    nativeCancelRaf(id);
  };

  globalThis.__SW_QA_TIME_CONTROLLER__ = {
    freeze() {
      frozen = true;
      return true;
    },
    reset() {
      randomState = 0x5e1e5eed;
      steppedFrameCount = 0;
      simulatedTimestamp = 1000.0;
      timestampSequence.length = 0;
    },
    stepFrame(timestamp) {
      frozen = true;
      simulatedTimestamp = timestamp;
      steppedFrameCount += 1;
      timestampSequence.push(timestamp);
      const currentQueue = Array.from(queuedRafCallbacks.values());
      queuedRafCallbacks.clear();
      for (const callback of currentQueue) callback(timestamp);
      return this.getStatus();
    },
    getStatus() {
      return Object.freeze({
        frozen,
        queueSize: queuedRafCallbacks.size,
        steppedFrameCount,
        simulatedTimestamp,
        timestampSequence: [...timestampSequence],
      });
    },
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

  const decompressed = inflateSync(Buffer.concat(idatChunks));
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
      const upperLeft = x >= 4 && y > 0 ? pixels[(y - 1) * width * 4 + x - 4] : 0;
      let value = raw;
      if (filter === 1) value = (raw + left) & 0xff;
      else if (filter === 2) value = (raw + up) & 0xff;
      else if (filter === 3) value = (raw + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) {
        const estimate = left + up - upperLeft;
        const distanceLeft = Math.abs(estimate - left);
        const distanceUp = Math.abs(estimate - up);
        const distanceUpperLeft = Math.abs(estimate - upperLeft);
        const predictor = distanceLeft <= distanceUp && distanceLeft <= distanceUpperLeft
          ? left
          : (distanceUp <= distanceUpperLeft ? up : upperLeft);
        value = (raw + predictor) & 0xff;
      }
      pixels[outRowStart + x] = value;
    }
  }
  return { width, height, pixels };
}

function analyzeCaptureValidity(decoded) {
  const pixelCount = decoded.width * decoded.height;
  let nonBlackCount = 0;
  let luminanceTotal = 0;
  const colors = new Set();
  const luminances = new Float64Array(pixelCount);

  for (let pixel = 0, index = 0; index < decoded.pixels.length; index += 4, pixel += 1) {
    const red = decoded.pixels[index];
    const green = decoded.pixels[index + 1];
    const blue = decoded.pixels[index + 2];
    if (red > 5 || green > 5 || blue > 5) nonBlackCount += 1;
    colors.add((red << 16) | (green << 8) | blue);
    const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;
    luminances[pixel] = luminance;
    luminanceTotal += luminance;
  }

  const meanLuminance = luminanceTotal / pixelCount;
  let varianceTotal = 0;
  for (const luminance of luminances) varianceTotal += (luminance - meanLuminance) ** 2;
  const luminanceVariance = varianceTotal / pixelCount;
  const nonBlackRatio = nonBlackCount / pixelCount;
  const distinctColors = colors.size;

  return {
    width: decoded.width,
    height: decoded.height,
    nonBlackCount,
    nonBlackRatio,
    distinctColors,
    meanLuminance,
    luminanceVariance,
    valid: nonBlackRatio >= 0.05 && luminanceVariance >= 10 && distinctColors >= 100,
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
    && base.debrisInstances === candidate.debrisInstances
    && base.dressing?.cropRows === candidate.dressing?.cropRows
    && base.dressing?.trees === candidate.dressing?.trees
    && base.dressing?.fences === candidate.dressing?.fences
    && base.dressing?.streetProps === candidate.dressing?.streetProps
    && base.barn?.stage === candidate.barn?.stage
    && base.barn?.health === candidate.barn?.health
    && base.fragments === candidate.fragments
    && base.campaignId === candidate.campaignId;
  const cameraMatch = base.camera?.fov === candidate.camera?.fov
    && base.camera?.y === candidate.camera?.y
    && base.camera?.z === candidate.camera?.z;
  const cow17Match = (!base.cow17 || !candidate.cow17) || (
    base.cow17.decorated === candidate.cow17.decorated
    && base.cow17.airborne === candidate.cow17.airborne
    && base.cow17.scale === candidate.cow17.scale
  );
  return { stableMatch, cameraMatch, cow17Match, match: stableMatch && cameraMatch && cow17Match };
}

async function capture(url, viewport, scenario, label) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
  });
  await context.addInitScript(installQaTimeController);
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

  const controllerStatus = await page.evaluate(async ({ scenarioName, timestamps }) => {
    const controller = globalThis.__SW_QA_TIME_CONTROLLER__;
    if (!controller) throw new Error('QA time controller is missing in page context.');
    controller.freeze();
    controller.reset();

    let randomState = 0x5e1e5eed;
    Math.random = () => {
      randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
      return randomState / 0x100000000;
    };

    const shell = globalThis.__SEVERE_WEATHER__;
    const qa = shell?.qa;
    globalThis.__SW_PHASE2_CLOCK_BRIDGE__?.pause?.();
    if (typeof productionQuality !== 'undefined') productionQuality = 'HIGH';
    shell?.app?.reset?.();
    window.dispatchEvent(new Event('resize'));

    if (scenarioName === 'hero' && qa?.prepareScenario) {
      await qa.prepareScenario('production-hero');
      if (typeof productionFragments !== 'undefined') {
        productionFragments.forEach((fragment) => { if (fragment.mesh) fragment.mesh.visible = false; });
        productionFragments.length = 0;
      }
      if (typeof productionPulseEffects !== 'undefined') {
        productionPulseEffects.forEach((effect) => { if (effect.mesh) effect.mesh.visible = false; });
        productionPulseEffects.length = 0;
      }
    }

    for (const timestamp of timestamps) controller.stepFrame(timestamp);
    if (typeof cameraShakeIntensity !== 'undefined') cameraShakeIntensity = 0;
    if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
      renderer.render(scene, camera);
    }

    const style = document.createElement('style');
    style.id = 'sw-phase5-visual-parity-normalization';
    style.textContent = `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      #districtOverlay,
      #rampageFeedbackLayer,
      .rampage-banner {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `;
    document.head.append(style);
    document.querySelectorAll('.rampage-banner').forEach((element) => element.remove());
    document.getElementById('districtOverlay')?.classList.remove('active');
    if (document.fonts?.ready) await document.fonts.ready;

    return controller.getStatus();
  }, { scenarioName: scenario, timestamps: fixedTimestamps });

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
    controllerStatus,
    pageErrors,
    consoleErrors,
    screenshot: path.relative(projectRoot, screenshotPath).replaceAll('\\', '/'),
  };
}

for (const viewport of viewports) {
  for (const scenario of scenarios) {
    const baseA = await capture(baseUrl, viewport, scenario, 'base-a');
    const baseB = await capture(baseUrl, viewport, scenario, 'base-b');
    const candidate = await capture(candidateUrl, viewport, scenario, 'candidate');
    const repeatNoise = comparePixels(baseA, baseB);
    const candidateDiff = comparePixels(baseA, candidate);
    const baseRepeatNoiseWithinLimit = repeatNoise.changedRatio <= 0.0005;
    const changedRatioThreshold = repeatNoise.changedRatio + 0.001;
    const meanErrorThreshold = repeatNoise.meanAbsoluteError + 0.5;
    const semanticDiff = compareSemantics(baseA.semantic, candidate.semantic);
    const captureValidityPass = baseA.validity.valid && baseB.validity.valid && candidate.validity.valid;
    const checks = {
      baseRepeatClean: baseA.pageErrors.length === 0
        && baseA.consoleErrors.length === 0
        && baseB.pageErrors.length === 0
        && baseB.consoleErrors.length === 0,
      candidateClean: candidate.pageErrors.length === 0 && candidate.consoleErrors.length === 0,
      captureValidityPass,
      baseRepeatNoiseWithinLimit,
      semanticMatch: semanticDiff.match,
      changedRatioWithinMeasuredNoise: candidateDiff.changedRatio <= changedRatioThreshold,
      meanErrorWithinMeasuredNoise: candidateDiff.meanAbsoluteError <= meanErrorThreshold,
      timeControllerFrozen: baseA.controllerStatus?.frozen === true
        && baseB.controllerStatus?.frozen === true
        && candidate.controllerStatus?.frozen === true,
      exactFrameSequence: JSON.stringify(baseA.controllerStatus?.timestampSequence) === JSON.stringify(fixedTimestamps)
        && JSON.stringify(baseB.controllerStatus?.timestampSequence) === JSON.stringify(fixedTimestamps)
        && JSON.stringify(candidate.controllerStatus?.timestampSequence) === JSON.stringify(fixedTimestamps),
    };

    const sanitizeCapture = (capture) => ({
      width: capture.width,
      height: capture.height,
      validity: capture.validity,
      semantic: capture.semantic,
      controllerStatus: capture.controllerStatus,
      pageErrors: capture.pageErrors,
      consoleErrors: capture.consoleErrors,
      screenshot: capture.screenshot,
    });

    const passed = Object.values(checks).every(Boolean);
    results.push({
      viewport,
      scenario,
      repeatNoise,
      candidateDiff,
      thresholds: { maxBaseRepeatNoiseRatio: 0.0005, changedRatioThreshold, meanErrorThreshold },
      semantic: { base: baseA.semantic, candidate: candidate.semantic, diff: semanticDiff },
      validity: { baseA: baseA.validity, baseB: baseB.validity, candidate: candidate.validity },
      captures: { baseA: sanitizeCapture(baseA), baseB: sanitizeCapture(baseB), candidate: sanitizeCapture(candidate) },
      checks,
      passed,
    });

    console.log(
      `${passed ? 'PASS' : 'FAIL'} ${viewport.name} ${scenario}`
      + ` :: repeat=${(repeatNoise.changedRatio * 100).toFixed(4)}%`
      + ` candidate=${(candidateDiff.changedRatio * 100).toFixed(4)}%`
      + ` valid=${captureValidityPass}`
      + ` semantic=${semanticDiff.match}`
      + ` rafFrozen=${candidate.controllerStatus?.frozen}`
      + ` frames=${candidate.controllerStatus?.steppedFrameCount}`
      + ` timestamps=[${candidate.controllerStatus?.timestampSequence?.map((timestamp) => timestamp.toFixed(1)).join(',')}]`
      + ` camera=${JSON.stringify(candidate.semantic?.camera ?? null)}`
      + ` cow17=${JSON.stringify(candidate.semantic?.cow17 ?? null)}`,
    );
  }
}

await browser.close();
const report = {
  version: 'PHASE5_DUAL_BUILD_VISUAL_BASELINE_V3',
  generatedAt: new Date().toISOString(),
  baseUrl,
  candidateUrl,
  pixelLaw: {
    comparisonSource: 'Playwright canvas locator PNG screenshot with QA-only CSS and deterministic RAF normalization',
    changedPixelChannelThreshold: 8,
    maxBaseRepeatNoiseRatio: 0.0005,
    marginCandidateChangedRatio: 0.001,
    marginMeanAbsoluteError: 0.5,
    validityRequirements: { minNonBlackRatio: 0.05, minLuminanceVariance: 10, minDistinctColors: 100 },
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
