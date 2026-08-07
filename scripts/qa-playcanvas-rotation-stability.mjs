import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { chromium } from 'playwright';

const url = process.env.PLAYCANVAS_SLICE_URL ?? 'http://127.0.0.1:4175/?qa=1';
const evidenceDir = 'playcanvas-slice-evidence';
const reportPath = `${evidenceDir}/playcanvas-rotation-stability-report.json`;
const TWO_PI = Math.PI * 2;

await mkdir(evidenceDir, { recursive: true });

function wrappedAngleDelta(before, after) {
  if (!Number.isFinite(before) || !Number.isFinite(after)) return Infinity;
  let delta = (after - before + Math.PI) % TWO_PI;
  if (delta < 0) delta += TWO_PI;
  return Math.abs(delta - Math.PI);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1365, height: 630 }, deviceScaleFactor: 1 });
const consoleErrors = [];
const pageErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));

async function readCameraState() {
  return page.evaluate(() => {
    const data = document.documentElement.dataset;
    const numberOrNull = (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };
    return {
      heading: numberOrNull(data.swPlaycanvasCameraHeading),
      desiredHeading: numberOrNull(data.swPlaycanvasCameraDesiredHeading),
      headingError: numberOrNull(data.swPlaycanvasCameraHeadingError),
      turning: data.swPlaycanvasCameraTurning === 'true',
      inputActive: data.swPlaycanvasCameraInputActive === 'true',
      screenX: numberOrNull(data.swPlaycanvasScreenInputX),
      screenY: numberOrNull(data.swPlaycanvasScreenInputY),
    };
  });
}

async function readCowState() {
  return page.evaluate(() => {
    const handle = globalThis.__SW_PLAYCANVAS_SLICE__;
    const frame = document.querySelector('#playcanvas-authority-frame');
    const bovine = typeof frame?.contentWindow?.getBovineQaState === 'function'
      ? frame.contentWindow.getBovineQaState()
      : null;
    return {
      snapshot: handle?.getAuthoritySnapshot() ?? null,
      bovine,
    };
  });
}

let report;
try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90_000 });
  await page.waitForFunction(() => document.documentElement.dataset.swPlaycanvasSliceReady === 'true', null, { timeout: 90_000 });
  await page.waitForFunction(() => Boolean(document.documentElement.dataset.swPlaycanvasCameraHeading), null, { timeout: 10_000 });

  // ------------------------------------------------------------------------
  // [SW:PLAYCANVAS:HELD_INTENT_SPIN_REGRESSION]
  // A stationary held D input used to move the desired heading every frame as
  // the camera itself rotated. The target must now stay fixed and the camera
  // must settle instead of continuously orbiting the tornado.
  // ------------------------------------------------------------------------
  await page.evaluate(() => globalThis.__SW_PLAYCANVAS_SLICE__?.reset());
  await page.waitForTimeout(350);
  const cameraStart = await readCameraState();
  await page.keyboard.down('d');
  await page.waitForTimeout(1900);
  const cameraMid = await readCameraState();
  await page.waitForTimeout(1200);
  const cameraHeldSettled = await readCameraState();
  await page.screenshot({ path: `${evidenceDir}/playcanvas-slice-camera-stability.png`, fullPage: true });
  await page.keyboard.up('d');
  await page.waitForTimeout(800);
  const cameraReleased = await readCameraState();

  const heldHeadingDelta = wrappedAngleDelta(cameraStart.heading, cameraHeldSettled.heading);
  const heldDesiredDrift = wrappedAngleDelta(cameraMid.desiredHeading, cameraHeldSettled.desiredHeading);
  const lateHeldHeadingDrift = wrappedAngleDelta(cameraMid.heading, cameraHeldSettled.heading);
  const releaseHeadingDrift = wrappedAngleDelta(cameraHeldSettled.heading, cameraReleased.heading);

  // ------------------------------------------------------------------------
  // [SW:PLAYCANVAS:COW_ORBIT_SPIN_REGRESSION]
  // Drive the real accepted authority toward Cow 17 until the safe-cow flight
  // begins. The PlayCanvas-only authority preparation patch must force a bounded
  // orbit, landing, and no immediate relaunch while the storm remains nearby.
  // ------------------------------------------------------------------------
  await page.evaluate(() => globalThis.__SW_PLAYCANVAS_SLICE__?.reset());
  await page.waitForTimeout(250);
  let cowLaunchState = await readCowState();
  const approachStarted = Date.now();
  while (!cowLaunchState.snapshot?.cow17?.airborne && Date.now() - approachStarted < 6500) {
    await page.evaluate(() => {
      const handle = globalThis.__SW_PLAYCANVAS_SLICE__;
      const frame = document.querySelector('#playcanvas-authority-frame');
      const bridge = frame?.contentWindow?.__SW_PLAYCANVAS_AUTHORITY__;
      const snapshot = handle?.getAuthoritySnapshot();
      if (!bridge || !snapshot?.cow17) return;
      const dx = snapshot.cow17.x - snapshot.storm.x;
      const dz = snapshot.cow17.z - snapshot.storm.z;
      const length = Math.max(0.001, Math.hypot(dx, dz));
      bridge.setJoystick(dx / length, dz / length, true);
    });
    await page.waitForTimeout(120);
    cowLaunchState = await readCowState();
  }
  await page.evaluate(() => {
    const frame = document.querySelector('#playcanvas-authority-frame');
    frame?.contentWindow?.__SW_PLAYCANVAS_AUTHORITY__?.setJoystick(0, 0, false);
  });

  const cowLaunched = cowLaunchState.snapshot?.cow17?.airborne === true;
  const cowAirborneSamples = [];
  const flightObserveStarted = Date.now();
  let cowLandedState = cowLaunchState;
  while (cowLaunched && Date.now() - flightObserveStarted < 6000) {
    await page.waitForTimeout(180);
    cowLandedState = await readCowState();
    cowAirborneSamples.push({
      elapsedMs: Date.now() - flightObserveStarted,
      airborne: cowLandedState.snapshot?.cow17?.airborne ?? null,
      altitude: cowLandedState.bovine?.cow17?.altitude ?? null,
      flightTime: cowLandedState.bovine?.cow17?.flightTime ?? null,
    });
    if (cowLandedState.snapshot?.cow17?.airborne === false) break;
  }

  const cowLanded = cowLaunched && cowLandedState.snapshot?.cow17?.airborne === false;
  await page.waitForTimeout(1100);
  const cowPostLanding = await readCowState();
  const cowStayedLanded = cowLanded && cowPostLanding.snapshot?.cow17?.airborne === false;
  await page.screenshot({ path: `${evidenceDir}/playcanvas-slice-cow-stability.png`, fullPage: true });

  const checks = [
    {
      name: 'held-camera-target-stable',
      passed: heldDesiredDrift < 0.05,
      detail: JSON.stringify({ heldDesiredDrift, cameraMid, cameraHeldSettled }),
    },
    {
      name: 'held-camera-turn-bounded',
      passed: heldHeadingDelta > 0.45 && heldHeadingDelta < 1.75,
      detail: JSON.stringify({ heldHeadingDelta, cameraStart, cameraHeldSettled }),
    },
    {
      name: 'held-camera-settles-not-spins',
      passed: lateHeldHeadingDrift < 0.12 && cameraHeldSettled.turning === false,
      detail: JSON.stringify({ lateHeldHeadingDrift, cameraMid, cameraHeldSettled }),
    },
    {
      name: 'released-camera-does-not-wander',
      passed: releaseHeadingDrift < 0.16,
      detail: JSON.stringify({ releaseHeadingDrift, cameraHeldSettled, cameraReleased }),
    },
    {
      name: 'cow17-safe-flight-starts',
      passed: cowLaunched && cowLaunchState.snapshot?.cow17?.safe === true,
      detail: JSON.stringify(cowLaunchState),
    },
    {
      name: 'cow17-orbit-is-bounded',
      passed: cowLanded,
      detail: JSON.stringify({ cowLaunchState, cowLandedState, cowAirborneSamples }),
    },
    {
      name: 'cow17-does-not-immediately-relaunch',
      passed: cowStayedLanded && cowPostLanding.snapshot?.cow17?.safe === true,
      detail: JSON.stringify(cowPostLanding),
    },
    {
      name: 'rotation-stability-no-console-errors',
      passed: consoleErrors.length === 0,
      detail: JSON.stringify(consoleErrors),
    },
    {
      name: 'rotation-stability-no-page-errors',
      passed: pageErrors.length === 0,
      detail: JSON.stringify(pageErrors),
    },
  ];

  report = {
    version: 'PLAYCANVAS_ROTATION_STABILITY_V1',
    passed: checks.every((check) => check.passed),
    checks,
    failedChecks: checks.filter((check) => !check.passed).map((check) => check.name),
    evidence: {
      camera: {
        start: cameraStart,
        mid: cameraMid,
        heldSettled: cameraHeldSettled,
        released: cameraReleased,
        heldHeadingDelta,
        heldDesiredDrift,
        lateHeldHeadingDrift,
        releaseHeadingDrift,
      },
      cow17: {
        launch: cowLaunchState,
        landed: cowLandedState,
        postLanding: cowPostLanding,
        airborneSamples: cowAirborneSamples,
      },
      consoleErrors,
      pageErrors,
    },
  };

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  if (!report.passed) throw new Error(`Rotation stability QA failed: ${report.failedChecks.join(', ')}`);
  console.log(`PlayCanvas rotation stability QA passed ${checks.length}/${checks.length}.`);
} catch (error) {
  if (!report) {
    report = {
      version: 'PLAYCANVAS_ROTATION_STABILITY_V1',
      passed: false,
      checks: [],
      failedChecks: ['harness-exception'],
      evidence: { consoleErrors, pageErrors, error: String(error?.stack ?? error) },
    };
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }
  throw error;
} finally {
  await browser.close();
}
