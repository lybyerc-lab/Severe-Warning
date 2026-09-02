import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { installQaFrameController, decodePng } from './lib/qa-visual-rig.mjs';

// [SW:QA:CANVAS_TARGET] Resolve the RENDER canvas, in preference order.
//
// This was `page.locator('#webgl, canvas#gameCanvas, canvas').first()`, which
// reads as "the webgl canvas, or these fallbacks" and is not what it does:
// Playwright's .first() takes the first element in DOCUMENT order matching ANY
// of the three, so the moment a second canvas appeared earlier in the markup --
// the menu's dispatch-card previews, added 2026-09-02 -- every capture targeted
// that instead. It is hidden once a run starts, so the screenshot waited for it
// to become visible and timed out after 60s, and the gate reported INCONCLUSIVE
// on a build that rendered perfectly well.
//
// Preference order now means preference order, and the last resort explicitly
// excludes the card previews rather than trusting document order.
async function resolveRenderCanvas(page) {
  for (const selector of ['#webgl', 'canvas#gameCanvas', 'canvas:not(.tv-card-canvas)', 'canvas']) {
    const locator = page.locator(selector).first();
    if (await locator.count()) return locator;
  }
  return page.locator('canvas').first();
}


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
// Boot to a FIXED number of stepped frames, not "however many it took".
//
// requestAnimationFrame is frozen from page load, so every frame this world has
// ever advanced is one this controller stepped. That makes the animation phase
// of everything on screen - the mesocyclone canopy at +0.04 rad a frame, the
// funnel at +0.15, the dust skirt's orbit angle, the camera's follow smoothing -
// a pure function of how many steps have been taken. The boot loop used to stop
// the moment the page reported ready, which is a WALL-CLOCK quantity: a fast
// machine got there in 0 frames and a loaded CI runner in dozens, so the same
// build captured a different phase of the same animation and about a fifth of
// the frame changed. Padding to a constant makes the captured frame a function
// of the build again.
//
// 24 rather than a rounder, larger number because every padding frame is a full
// software-rendered frame of a 2110-object scene and costs about 0.6s on CI
// hardware; 90 turned a four-minute comparison into twenty. The pad only has to
// clear the frame count readiness actually needs - 6 even under a 20x CPU
// throttle - and boot overrunning it is a loud error rather than a silent
// return to measuring different animation phases.
const deterministicBootFrames = 24;
// Reproducing a loaded CI runner on a fast machine. Off by default.
//
// The visual flake this harness spent months working around was invisible here
// and constant on CI, because the difference is how long the page takes to boot
// in WALL-CLOCK terms - a quantity no amount of frame freezing controls. Chrome
// can be told to pretend, so set SEVERE_WEATHER_VISUAL_CPU_THROTTLE=20 to make
// the slow-runner condition reproducible instead of mythical.
const cpuThrottleRate = Number(process.env.SEVERE_WEATHER_VISUAL_CPU_THROTTLE || 0);

await mkdir(outputDir, { recursive: true });

// [SW:QA:SKIN_SCENARIO] 'hero-skinned' is 'hero' with a funnel skin equipped.
//
// It exists because this gate could not see the cosmetic system at all. Five
// skins recolour the funnel, the outer vapour sheath and the suction rings, and
// neither authored scenario equips one -- so when the sheath opacity was changed
// for skinned storms specifically, the gate compared the two builds and reported
// 0.0000% across every scenario. That was the correct answer for the default
// look and told nobody anything about the change actually under test.
//
// It runs on ONE viewport rather than three, deliberately. A skin is a material
// tint and does not interact with layout, so a second and third viewport would
// re-measure the same thing at the cost of the job's remaining budget: captures
// scale with viewports x scenarios x 3, and one attempt already runs ~20 minutes
// on CI. mobile-915x412 is the phone the game ships to, so it is the one that
// carries the scenario.
const SKIN_SCENARIO = 'hero-skinned';
const SKIN_SCENARIO_KEY = 'crimson-fury';

const viewports = [
  { name: 'desktop-1365x768', width: 1365, height: 768, isMobile: false, scenarios: ['initial', 'hero'] },
  { name: 'mobile-915x412', width: 915, height: 412, isMobile: true, scenarios: ['initial', 'hero', SKIN_SCENARIO] },
  { name: 'wide-landscape-1280x540', width: 1280, height: 540, isMobile: false, scenarios: ['initial', 'hero'] },
];
const expectedResultCount = viewports.reduce((total, viewport) => total + viewport.scenarios.length, 0);
const results = [];
let fatalError = null;

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

// Report WHICH fields moved, not just that something did.
//
// For a long time this returned booleans only, so a divergence printed as
// `semantic=false` and told nobody anything. The ~20% "renderer
// nondeterminism" this harness was built to tolerate turned out to be two
// fields - camera.y and camera.z - drifting by a fraction of a unit, and the
// evidence needed to see that was thrown away on every run.
function describeSemanticDifferences(base, candidate) {
  const flatten = (value, prefix = '') => (
    value && typeof value === 'object' && !Array.isArray(value)
      ? Object.entries(value).flatMap(([key, inner]) => flatten(inner, `${prefix}${key}.`))
      : [[prefix.replace(/\.$/, ''), JSON.stringify(value) ?? 'undefined']]
  );
  const baseFields = new Map(flatten(base));
  const candidateFields = new Map(flatten(candidate));
  const differences = [];
  for (const key of new Set([...baseFields.keys(), ...candidateFields.keys()])) {
    if (baseFields.get(key) !== candidateFields.get(key)) {
      differences.push({ field: key, base: baseFields.get(key) ?? null, candidate: candidateFields.get(key) ?? null });
    }
  }
  return differences;
}

function compareSemantics(base, candidate) {
  if (!base || !candidate) {
    return { match: false, stableMatch: false, cameraMatch: false, cow17Match: false, differences: [] };
  }
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
  return {
    stableMatch,
    cameraMatch,
    cow17Match,
    match: stableMatch && cameraMatch && cow17Match,
    differences: describeSemanticDifferences(base, candidate),
  };
}

async function advanceFrozenBoot(page) {
  const result = await page.evaluate(async ({ frameDuration, frameLimit, padTo }) => {
    const controller = globalThis.__SW_QA_TIME_CONTROLLER__;
    if (!controller) throw new Error('QA time controller is missing before boot advancement.');
    const isReady = () => (
      globalThis.__SW_MODERN_SHELL_READY__ === true
      && globalThis.__SW_PRODUCTION_SLICE_READY__ === true
      && Boolean(globalThis.__SEVERE_WEATHER__?.qa)
      && typeof globalThis.triggerProductionSliceQa === 'function'
      && typeof globalThis.getProductionSliceQaState === 'function'
    );

    let readyAtFrame = -1;
    let stepped = 0;
    while (stepped < frameLimit) {
      if (readyAtFrame < 0 && isReady()) readyAtFrame = stepped;
      if (readyAtFrame >= 0 && stepped >= padTo) break;
      controller.stepFrame(1000.0 + stepped * frameDuration);
      stepped += 1;
      // Yield only while the page is still coming up; boot needs the microtask
      // turn to make progress, the padding frames do not, and every yield is
      // wall-clock time in which an unfrozen timer could fire.
      if (readyAtFrame < 0) await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return {
      ready: isReady(),
      readyAtFrame,
      framesUsed: stepped,
      controller: controller.getStatus(),
      shellReady: globalThis.__SW_MODERN_SHELL_READY__ === true,
      productionReady: globalThis.__SW_PRODUCTION_SLICE_READY__ === true,
      qaReady: Boolean(globalThis.__SEVERE_WEATHER__?.qa),
      triggerReady: typeof globalThis.triggerProductionSliceQa === 'function',
      snapshotReady: typeof globalThis.getProductionSliceQaState === 'function',
    };
  }, { frameDuration: frameDurationMs, frameLimit: maxBootFrames, padTo: deterministicBootFrames });

  if (!result.ready) {
    throw new Error(`Deterministic boot did not reach QA readiness: ${JSON.stringify(result)}`);
  }
  // Fail loudly rather than quietly measuring a different animation phase than
  // the other captures in this run.
  if (result.framesUsed !== deterministicBootFrames) {
    throw new Error(
      `Boot needed ${result.framesUsed} frames, past the fixed ${deterministicBootFrames}; `
      + 'captures in this run would not share an animation phase.',
    );
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
  if (cpuThrottleRate > 1) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottleRate });
  }
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    const boot = await advanceFrozenBoot(page);

    const controllerStatus = await page.evaluate(async ({ scenarioName, seed, frameDuration, frameCount, skinScenario, skinKey }) => {
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
      // The page may spend anywhere from zero to dozens of stepped frames
      // booting depending on how loaded the machine is, and every one of them
      // pushes a sample here. Clearing it keeps the QA snapshot's measured FPS
      // and sample count identical across captures.
      if (typeof productionFrameSamples !== 'undefined') productionFrameSamples.length = 0;
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
      // 'hero-skinned' uses the hero pose; only its materials differ.
      const prepared = globalThis.triggerProductionSliceQa(scenarioName.startsWith('hero') ? 'hero' : 'initial');
      if (prepared !== true) throw new Error(`Failed to prepare ${scenarioName} visual scenario.`);
      if (scenarioName === skinScenario) {
        // Loud rather than silent. Skipping this would leave the scenario byte
        // identical to plain hero, quietly asserting nothing -- which is the
        // exact failure the scenario was added to end.
        if (typeof applyFunnelSkinMaterials !== 'function') {
          throw new Error(`${scenarioName} needs applyFunnelSkinMaterials, which this build does not have.`);
        }
        applyFunnelSkinMaterials(skinKey);
      }
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

      // Re-pin the camera to the authored QA pose before the capture render.
      //
      // triggerProductionSliceQa sets it exactly, then sets productionQaPrepared
      // to park the follow rig - and the normalization above clears that flag so
      // the world keeps animating across the stepped frames. That also reopens
      // the follow lerp, which drags the camera back off the pose toward a
      // target built from currentCamY / currentCamZ. Those accumulators smooth
      // at 0.06 per frame and survive controller.reset(), so they still carry
      // however many frames the page happened to spend booting - a wall-clock
      // quantity. Five frames at 0.08 clear only a third of the resulting error,
      // so the camera lands a fraction of a unit off, the horizon moves, and
      // about a fifth of the frame changes. That was the ~20% flake.
      //
      // The fallback matters: the baseline side of the gate is an older build
      // that may predate the shared helper, and both sides must end up at the
      // same pose or the fix would itself read as a visual change.
      if (typeof globalThis.applyProductionSliceQaCamera === 'function') {
        globalThis.applyProductionSliceQaCamera();
      } else if (typeof camera !== 'undefined' && typeof productionBarn !== 'undefined' && productionBarn) {
        camera.position.set(storm.pos.x + 52, storm.pos.y + 50, storm.pos.z + 68);
        camera.lookAt(productionBarn.x, terrainHeightAt(productionBarn.x, productionBarn.z) + 8, productionBarn.z);
      }

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
      skinScenario: SKIN_SCENARIO,
      skinKey: SKIN_SCENARIO_KEY,
      seed: randomSeed,
      frameDuration: frameDurationMs,
      frameCount: scenarioFrameCount,
    });

    const canvasLocator = await resolveRenderCanvas(page);
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
    for (const scenario of viewport.scenarios) {
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
        + (semanticDiff.match ? '' : ` [${semanticDiff.differences.map(d => `${d.field} ${d.base}->${d.candidate}`).join(', ')}]`)
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
  cpuThrottleRate,
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
  passed: fatalError === null && results.length === expectedResultCount && results.every((result) => result.passed),
};

await writeFile(
  path.join(outputDir, 'visual-baseline-report.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);

if (!report.passed) process.exitCode = 1;
