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
const randomSeed = 0x5e1e5eed;
const frameDurationMs = 16.6667;
const scenarioFrameCount = 5;
const maxBootFrames = 240;

await mkdir(outputDir, { recursive: true });

const viewports = [
  { name: 'desktop-1365x768', width: 1365, height: 768, isMobile: false },
  { name: 'mobile-915x412', width: 915, height: 412, isMobile: true },
  { name: 'wide-landscape-1280x540', width: 1280, height: 540, isMobile: false },
];
const scenarios = ['initial', 'hero'];
const results = [];
let fatalError = null;

function installQaFrameController(seed) {
  let randomState = seed >>> 0;
  Math.random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 0x100000000;
  };

  const nativeRaf = window.requestAnimationFrame.bind(window);
  const nativeCancelRaf = window.cancelAnimationFrame.bind(window);
  const nativePerformanceNow = performance.now.bind(performance);
  const nativeDateNow = Date.now.bind(Date);

  let frozen = true;
  let simulatedTimestamp = 1000.0;
  let nextCallbackId = 1;
  let steppedFrameCount = 0;
  const timestampSequence = [];
  const queuedCallbacks = new Map();
  const activeCallbacks = new Map();

  performance.now = () => (frozen ? simulatedTimestamp : nativePerformanceNow());
  Date.now = () => (frozen ? Math.round(simulatedTimestamp) : nativeDateNow());

  window.requestAnimationFrame = (callback) => {
    const id = nextCallbackId++;
    if (frozen) {
      queuedCallbacks.set(id, callback);
      return id;
    }
    const nativeId = nativeRaf((timestamp) => {
      activeCallbacks.delete(id);
      simulatedTimestamp = timestamp;
      callback(timestamp);
    });
    activeCallbacks.set(id, { nativeId, callback });
    return id;
  };

  window.cancelAnimationFrame = (id) => {
    queuedCallbacks.delete(id);
    const active = activeCallbacks.get(id);
    if (active) nativeCancelRaf(active.nativeId);
    activeCallbacks.delete(id);
  };

  const getStatus = () => Object.freeze({
    frozen,
    queueSize: queuedCallbacks.size,
    activeNativeRafCount: activeCallbacks.size,
    steppedFrameCount,
    simulatedTimestamp,
    timestampSequence: [...timestampSequence],
  });

  globalThis.__SW_QA_TIME_CONTROLLER__ = {
    freeze() {
      if (frozen) return true;
      frozen = true;
      for (const [id, active] of activeCallbacks) {
        nativeCancelRaf(active.nativeId);
        queuedCallbacks.set(id, active.callback);
      }
      activeCallbacks.clear();
      return true;
    },
    reset(seedOverride = seed) {
      randomState = seedOverride >>> 0;
      steppedFrameCount = 0;
      simulatedTimestamp = 1000.0;
      timestampSequence.length = 0;
    },
    stepFrame(timestamp) {
      frozen = true;
      simulatedTimestamp = timestamp;
      steppedFrameCount += 1;
      timestampSequence.push(timestamp);
      const callbacks = Array.from(queuedCallbacks.values());
      queuedCallbacks.clear();
      for (const callback of callbacks) callback(timestamp);
      return getStatus();
    },
    getStatus,
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

  if (!width || !height || idatChunks.length === 0) throw new Error('Invalid PNG capture.');
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

async function advanceFrozenBoot(page) {
  const result = await page.evaluate(async ({ frameDuration, frameLimit }) => {
    const controller = globalThis.__SW_QA_TIME_CONTROLLER__;
    if (!controller) throw new Error('QA time controller is missing before boot advancement.');
    const isReady = () => (
      globalThis.__SW_MODERN_SHELL_READY__ === true
      && globalThis.__SW_PRODUCTION_SLICE_READY__ === true
      && Boolean(globalThis.__SEVERE_WEATHER__?.qa)
      && typeof globalThis.triggerProductionSliceQa === 'function'
      && typeof globalThis.getProductionSliceQaState === 'function'
    );

    for (let frame = 0; frame < frameLimit && !isReady(); frame += 1) {
      controller.stepFrame(1000.0 + frame * frameDuration);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return {
      ready: isReady(),
      controller: controller.getStatus(),
      shellReady: globalThis.__SW_MODERN_SHELL_READY__ === true,
      productionReady: globalThis.__SW_PRODUCTION_SLICE_READY__ === true,
      qaReady: Boolean(globalThis.__SEVERE_WEATHER__?.qa),
      triggerReady: typeof globalThis.triggerProductionSliceQa === 'function',
      snapshotReady: typeof globalThis.getProductionSliceQaState === 'function',
    };
  }, { frameDuration: frameDurationMs, frameLimit: maxBootFrames });

  if (!result.ready) {
    throw new Error(`Deterministic boot did not reach QA readiness: ${JSON.stringify(result)}`);
  }
  return result;
}

async function capture(browser, url, viewport, scenario, label) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
  });
  await context.addInitScript(installQaFrameController, randomSeed);
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    const boot = await advanceFrozenBoot(page);

    const controllerStatus = await page.evaluate(async ({ scenarioName, seed, frameDuration, frameCount }) => {
      const controller = globalThis.__SW_QA_TIME_CONTROLLER__;
      if (!controller) throw new Error('QA time controller is missing in page context.');
      controller.freeze();
      controller.reset(seed);

      let randomState = seed >>> 0;
      Math.random = () => {
        randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
        return randomState / 0x100000000;
      };

      const shell = globalThis.__SEVERE_WEATHER__;
      globalThis.__SW_PHASE2_CLOCK_BRIDGE__?.pause?.();
      if (typeof productionQuality !== 'undefined') productionQuality = 'HIGH';
      shell?.app?.reset?.();
      window.dispatchEvent(new Event('resize'));
      globalThis.__SW_V510_REBUILD__?.();

      const normalizeCow17 = () => {
        if (typeof animals === 'undefined') return;
        animals.forEach((animal) => {
          if (!animal?.mesh) return;
          animal.mesh.visible = animal.id === 17;
          if (animal.id !== 17) return;
          animal.airborne = false;
          animal.altitude = 0.8;
          animal.flightTime = 0;
          animal.flightDistance = 0;
          animal.flightMaxAltitude = 0;
          animal.previousX = animal.x;
          animal.previousZ = animal.z;
          animal.exceptionalCallout = false;
          animal.flightCounted = false;
          animal.orbitAngle = 0;
          animal.mesh.rotation.set(0, 0, 0);
        });
        if (typeof bovineCowCam !== 'undefined') {
          bovineCowCam = { active: false, timer: 0, triggered: false, cow: null };
        }
        document.body.classList.remove('cow-cam-active');
        document.getElementById('cowCamOverlay')?.classList.remove('active');
      };

      normalizeCow17();
      const prepared = globalThis.triggerProductionSliceQa(scenarioName === 'hero' ? 'hero' : 'initial');
      if (prepared !== true) throw new Error(`Failed to prepare ${scenarioName} visual scenario.`);
      normalizeCow17();

      const cow17 = typeof animals !== 'undefined'
        ? animals.find((animal) => animal.id === 17)
        : null;
      if (cow17 && typeof productionBarn !== 'undefined' && productionBarn) {
        cow17.x = productionBarn.x + 14;
        cow17.z = productionBarn.z + 10;
        cow17.groundY = terrainHeightAt(cow17.x, cow17.z);
        cow17.previousX = cow17.x;
        cow17.previousZ = cow17.z;
        cow17.mesh.position.set(cow17.x, cow17.groundY + cow17.altitude, cow17.z);
        cow17.mesh.rotation.set(0, 0, 0);
      }

      if (typeof productionQaPrepared !== 'undefined') productionQaPrepared = false;
      if (typeof campaignAnimatedMeshes !== 'undefined') {
        campaignAnimatedMeshes.forEach((item) => {
          if (item?.mesh && item.axis) item.mesh.rotation[item.axis] = 0;
        });
      }
      if (typeof productionTornadoRoot !== 'undefined' && productionTornadoRoot) {
        productionTornadoRoot.rotation.set(0, 0, 0);
      }
      if (typeof productionBarn !== 'undefined' && productionBarn) {
        productionBarn.group.rotation.set(0, 0, 0);
        productionBarn.beacon.rotation.z = 0;
      }
      if (typeof productionFlashTimer !== 'undefined') productionFlashTimer = 0;
      if (typeof productionFragments !== 'undefined') {
        productionFragments.forEach((fragment) => { if (fragment.mesh) fragment.mesh.visible = false; });
        productionFragments.length = 0;
      }
      if (typeof productionPulseEffects !== 'undefined') {
        productionPulseEffects.forEach((effect) => { if (effect.mesh) effect.mesh.visible = false; });
        productionPulseEffects.length = 0;
      }
      if (typeof renderer !== 'undefined') renderer.toneMappingExposure = 0.94;
      if (typeof scene !== 'undefined' && scene.fog) {
        const blueprint = typeof getCampaignWorldBlueprint === 'function' ? getCampaignWorldBlueprint() : null;
        scene.fog.density = blueprint?.fogDensity ?? 0.0021;
        scene.fog.color.set('#162437');
        if (scene.background?.set) scene.background.set('#162437');
      }
      if (typeof ambientLight !== 'undefined') ambientLight.intensity = 1.02;
      if (typeof skyLight !== 'undefined') skyLight.intensity = 0.46;
      if (typeof dirLight !== 'undefined') {
        dirLight.intensity = 1.72;
        dirLight.color.set('#f1ddb0');
      }

      for (let frame = 0; frame < frameCount; frame += 1) {
        controller.stepFrame(1000.0 + frame * frameDuration);
      }
      if (typeof cameraShakeIntensity !== 'undefined') cameraShakeIntensity = 0;
      if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
        renderer.render(scene, camera);
      }

      let style = document.getElementById('sw-phase5-visual-parity-normalization');
      if (!style) {
        style = document.createElement('style');
        style.id = 'sw-phase5-visual-parity-normalization';
        document.head.append(style);
      }
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
      document.querySelectorAll('.rampage-banner').forEach((element) => element.remove());
      document.getElementById('districtOverlay')?.classList.remove('active');
      if (document.fonts?.ready) await document.fonts.ready;
      return controller.getStatus();
    }, {
      scenarioName: scenario,
      seed: randomSeed,
      frameDuration: frameDurationMs,
      frameCount: scenarioFrameCount,
    });

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
    return {
      width: decoded.width,
      height: decoded.height,
      pixels: decoded.pixels,
      validity,
      semantic,
      boot,
      controllerStatus,
      pageErrors,
      consoleErrors,
      screenshot: path.relative(projectRoot, screenshotPath).replaceAll('\\', '/'),
    };
  } finally {
    await context.close();
  }
}

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

try {
  for (const viewport of viewports) {
    for (const scenario of scenarios) {
      const baseA = await capture(browser, baseUrl, viewport, scenario, 'base-a');
      const baseB = await capture(browser, baseUrl, viewport, scenario, 'base-b');
      const candidate = await capture(browser, candidateUrl, viewport, scenario, 'candidate');
      const repeatNoise = comparePixels(baseA, baseB);
      const candidateDiff = comparePixels(baseA, candidate);
      const semanticDiff = compareSemantics(baseA.semantic, candidate.semantic);
      const changedRatioThreshold = repeatNoise.changedRatio + 0.0010;
      const meanErrorThreshold = repeatNoise.meanAbsoluteError + 0.5;
      const captureValidityPass = baseA.validity.valid && baseB.validity.valid && candidate.validity.valid;
      const checks = {
        baseRepeatClean: baseA.pageErrors.length === 0
          && baseA.consoleErrors.length === 0
          && baseB.pageErrors.length === 0
          && baseB.consoleErrors.length === 0,
        candidateClean: candidate.pageErrors.length === 0 && candidate.consoleErrors.length === 0,
        captureValidityPass,
        baseRepeatNoiseWithinLimit: repeatNoise.changedRatio <= 0.0005,
        semanticMatch: semanticDiff.match,
        changedRatioWithinMeasuredNoise: candidateDiff.changedRatio <= changedRatioThreshold,
        meanErrorWithinMeasuredNoise: candidateDiff.meanAbsoluteError <= meanErrorThreshold,
      };
      const sanitizeCapture = (captureResult) => ({
        width: captureResult.width,
        height: captureResult.height,
        validity: captureResult.validity,
        semantic: captureResult.semantic,
        boot: captureResult.boot,
        controllerStatus: captureResult.controllerStatus,
        pageErrors: captureResult.pageErrors,
        consoleErrors: captureResult.consoleErrors,
        screenshot: captureResult.screenshot,
      });
      const passed = Object.values(checks).every(Boolean);
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
        passed,
      });
      console.log(
        `${passed ? 'PASS' : 'FAIL'} ${viewport.name} ${scenario}`
        + ` :: repeat=${(repeatNoise.changedRatio * 100).toFixed(4)}%`
        + ` candidate=${(candidateDiff.changedRatio * 100).toFixed(4)}%`
        + ` valid=${captureValidityPass}`
        + ` semantic=${semanticDiff.match}`
        + ` frames=${candidate.controllerStatus?.steppedFrameCount}`,
      );
    }
  }
} catch (error) {
  fatalError = error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack ?? null }
    : { name: 'UnknownError', message: String(error), stack: null };
  console.error(fatalError.stack ?? fatalError.message);
} finally {
  await browser.close();
}

const report = {
  version: 'PHASE5_DUAL_BUILD_VISUAL_BASELINE_V8',
  generatedAt: new Date().toISOString(),
  baseUrl,
  candidateUrl,
  pixelLaw: {
    comparisonSource: 'Playwright canvas PNG after deterministic frozen boot, authored scenario normalization, and explicit render',
    changedPixelChannelThreshold: 8,
    maxBaseRepeatNoiseRatio: 0.0005,
    marginCandidateChangedRatio: 0.0010,
    marginMeanAbsoluteError: 0.5,
    validityRequirements: { minNonBlackRatio: 0.05, minLuminanceVariance: 10.0, minDistinctColors: 100 },
  },
  fatalError,
  results,
  passed: fatalError === null && results.length === viewports.length * scenarios.length && results.every((result) => result.passed),
};

await writeFile(
  path.join(outputDir, 'visual-baseline-report.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);

if (!report.passed) process.exitCode = 1;
