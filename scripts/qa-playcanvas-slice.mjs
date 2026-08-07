import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { chromium } from 'playwright';

const url = process.env.PLAYCANVAS_SLICE_URL ?? 'http://127.0.0.1:4175/?qa=1';
const evidenceDir = 'playcanvas-slice-evidence';
await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1365, height: 630 }, deviceScaleFactor: 1 });
const consoleErrors = [];
const pageErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));

const distanceToBarn = (snapshot) => snapshot?.barn
  ? Math.hypot(snapshot.storm.x - snapshot.barn.x, snapshot.storm.z - snapshot.barn.z)
  : null;

let report;
try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90_000 });
  await page.waitForFunction(() => document.documentElement.dataset.swPlaycanvasSliceReady === 'true', null, { timeout: 90_000 });

  const initial = await page.evaluate(() => {
    const canvas = document.querySelector('#app > canvas');
    const handle = globalThis.__SW_PLAYCANVAS_SLICE__;
    return {
      data: { ...document.documentElement.dataset },
      canvas: canvas ? { width: canvas.width, height: canvas.height } : null,
      telemetry: handle?.telemetry ?? null,
      authority: handle?.getAuthoritySnapshot() ?? null,
      authorityFramePresent: Boolean(document.querySelector('#playcanvas-authority-frame')),
    };
  });

  const initialStorm = initial.authority?.storm ?? null;
  const initialBarnHealth = initial.authority?.barn?.health ?? null;
  const initialDistance = distanceToBarn(initial.authority);

  await page.keyboard.down('a');
  await page.keyboard.down('s');
  await page.waitForTimeout(900);
  await page.keyboard.up('s');
  await page.keyboard.up('a');
  await page.waitForTimeout(150);

  const afterMovement = await page.evaluate(() => globalThis.__SW_PLAYCANVAS_SLICE__?.getAuthoritySnapshot() ?? null);
  const afterMovementDistance = distanceToBarn(afterMovement);

  const abilityResults = await page.evaluate(() => {
    const handle = globalThis.__SW_PLAYCANVAS_SLICE__;
    if (!handle) return null;
    return {
      secondary: handle.requestAbility('secondary', 'qa'),
      primary: handle.requestAbility('primary', 'qa'),
      tertiary: handle.requestAbility('tertiary', 'qa'),
    };
  });
  await page.waitForTimeout(250);

  const afterAbilities = await page.evaluate(() => ({
    authority: globalThis.__SW_PLAYCANVAS_SLICE__?.getAuthoritySnapshot() ?? null,
    data: { ...document.documentElement.dataset },
  }));

  await page.screenshot({ path: `${evidenceDir}/playcanvas-slice.png`, fullPage: true });

  const reset = await page.evaluate(() => {
    const handle = globalThis.__SW_PLAYCANVAS_SLICE__;
    const snapshot = handle?.reset() ?? null;
    return {
      snapshot,
      acceptedCount: document.documentElement.dataset.swPlaycanvasAbilityAcceptedCount ?? null,
    };
  });
  await page.waitForTimeout(120);

  const disposal = await page.evaluate(() => {
    globalThis.__SW_PLAYCANVAS_SLICE__?.dispose();
    return {
      canvasPresent: Boolean(document.querySelector('#app > canvas')),
      authorityFramePresent: Boolean(document.querySelector('#playcanvas-authority-frame')),
      globalPresent: Boolean(globalThis.__SW_PLAYCANVAS_SLICE__),
      readyValue: document.documentElement.dataset.swPlaycanvasSliceReady ?? null,
      versionValue: document.documentElement.dataset.swPlaycanvasEngineVersion ?? null,
      revisionValue: document.documentElement.dataset.swPlaycanvasEngineRevision ?? null,
      authorityValue: document.documentElement.dataset.swPlaycanvasGameplayAuthority ?? null,
    };
  });
  await page.waitForTimeout(100);

  const engineRevision = initial.telemetry?.engineRevision;
  const movementDistance = initialStorm && afterMovement?.storm
    ? Math.hypot(afterMovement.storm.x - initialStorm.x, afterMovement.storm.z - initialStorm.z)
    : 0;
  const finalBarnHealth = afterAbilities.authority?.barn?.health ?? null;
  const authorityAbilities = afterAbilities.authority?.inputAbilities?.abilities ?? null;
  const checks = [
    { name: 'canvas-present', passed: Boolean(initial.canvas), detail: JSON.stringify(initial.canvas) },
    { name: 'canvas-landscape-width', passed: (initial.canvas?.width ?? 0) >= 1000, detail: JSON.stringify(initial.canvas) },
    { name: 'canvas-landscape-height', passed: (initial.canvas?.height ?? 0) >= 500, detail: JSON.stringify(initial.canvas) },
    { name: 'renderer-identity', passed: initial.telemetry?.renderer === 'PlayCanvas', detail: JSON.stringify(initial.telemetry) },
    { name: 'engine-version-exported', passed: initial.telemetry?.engineVersion === '2.21.3', detail: JSON.stringify(initial.telemetry) },
    { name: 'engine-revision-exported', passed: typeof engineRevision === 'string' && engineRevision.length >= 7 && !engineRevision.includes('$_CURRENT_'), detail: JSON.stringify(initial.telemetry) },
    { name: 'engine-version-dataset-agrees', passed: initial.data.swPlaycanvasEngineVersion === initial.telemetry?.engineVersion, detail: JSON.stringify(initial.data) },
    { name: 'engine-revision-dataset-agrees', passed: initial.data.swPlaycanvasEngineRevision === engineRevision, detail: JSON.stringify(initial.data) },
    { name: 'gameplay-authority-connected', passed: initial.telemetry?.gameplayAuthority === 'PLAYCANVAS_AUTHORITY_V1' && initial.authority?.version === 'PLAYCANVAS_AUTHORITY_V1' && initial.authority?.ready === true, detail: JSON.stringify(initial.authority) },
    { name: 'authority-frame-present', passed: initial.authorityFramePresent === true, detail: JSON.stringify(initial.authorityFramePresent) },
    { name: 'warning-run-active', passed: initial.authority?.run?.runActive === true && (initial.authority?.run?.remainingSeconds ?? 0) > 170, detail: JSON.stringify(initial.authority?.run) },
    { name: 'keyboard-moves-real-storm', passed: movementDistance > 1, detail: JSON.stringify({ initialStorm, after: afterMovement?.storm, movementDistance }) },
    { name: 'movement-approaches-live-target', passed: initialDistance !== null && afterMovementDistance !== null && afterMovementDistance < initialDistance, detail: JSON.stringify({ initialDistance, afterMovementDistance }) },
    { name: 'gust-executor-accepted', passed: abilityResults?.secondary === true, detail: JSON.stringify(abilityResults) },
    { name: 'pull-executor-accepted', passed: abilityResults?.primary === true, detail: JSON.stringify(abilityResults) },
    { name: 'zap-executor-accepted', passed: abilityResults?.tertiary === true, detail: JSON.stringify(abilityResults) },
    { name: 'ability-telemetry-counts', passed: (authorityAbilities?.acceptedCount ?? 0) >= 3 && Number(afterAbilities.data.swPlaycanvasAbilityAcceptedCount ?? 0) >= 3, detail: JSON.stringify({ authorityAbilities, data: afterAbilities.data }) },
    { name: 'destruction-state-changed', passed: initialBarnHealth !== null && finalBarnHealth !== null && finalBarnHealth < initialBarnHealth, detail: JSON.stringify({ initialBarnHealth, finalBarnHealth, barn: afterAbilities.authority?.barn }) },
    { name: 'score-never-regresses', passed: (afterAbilities.authority?.score?.destructionScore ?? -1) >= (initial.authority?.score?.destructionScore ?? 0), detail: JSON.stringify({ initial: initial.authority?.score, after: afterAbilities.authority?.score }) },
    { name: 'combo-law-bounded', passed: (afterAbilities.authority?.score?.comboMultiplier ?? 0) >= 1 && (afterAbilities.authority?.score?.comboMultiplier ?? 99) <= 3.5, detail: JSON.stringify(afterAbilities.authority?.score) },
    { name: 'cow17-safe', passed: afterAbilities.authority?.cow17?.safe === true, detail: JSON.stringify(afterAbilities.authority?.cow17) },
    { name: 'road-above-terrain', passed: (initial.telemetry?.roadClearance ?? 0) >= 0.1, detail: JSON.stringify(initial.telemetry) },
    { name: 'tornado-above-road', passed: (initial.telemetry?.tornadoGroundClearance ?? 0) >= 0.18, detail: JSON.stringify(initial.telemetry) },
    { name: 'scene-populated', passed: (initial.telemetry?.entityCount ?? 0) >= 55, detail: JSON.stringify(initial.telemetry) },
    { name: 'qa-mode', passed: initial.telemetry?.qaMode === true, detail: JSON.stringify(initial.telemetry) },
    { name: 'reset-clears-local-ability-count', passed: reset.acceptedCount === '0', detail: JSON.stringify(reset) },
    { name: 'reset-restores-active-run', passed: reset.snapshot?.run?.runActive === true && (reset.snapshot?.run?.remainingSeconds ?? 0) > 170, detail: JSON.stringify(reset.snapshot?.run) },
    { name: 'dispose-canvas-removed', passed: disposal.canvasPresent === false, detail: JSON.stringify(disposal) },
    { name: 'dispose-authority-frame-removed', passed: disposal.authorityFramePresent === false, detail: JSON.stringify(disposal) },
    { name: 'dispose-global-cleared', passed: disposal.globalPresent === false, detail: JSON.stringify(disposal) },
    { name: 'dispose-ready-cleared', passed: disposal.readyValue === null, detail: JSON.stringify(disposal) },
    { name: 'dispose-version-cleared', passed: disposal.versionValue === null, detail: JSON.stringify(disposal) },
    { name: 'dispose-revision-cleared', passed: disposal.revisionValue === null, detail: JSON.stringify(disposal) },
    { name: 'dispose-authority-telemetry-cleared', passed: disposal.authorityValue === null, detail: JSON.stringify(disposal) },
    { name: 'no-console-errors', passed: consoleErrors.length === 0, detail: JSON.stringify(consoleErrors) },
    { name: 'no-page-errors', passed: pageErrors.length === 0, detail: JSON.stringify(pageErrors) },
  ];

  const failed = checks.filter((item) => !item.passed);
  report = {
    passed: failed.length === 0,
    url,
    checks,
    failedChecks: failed.map((item) => item.name),
    consoleErrors,
    pageErrors,
    evidence: { initial, afterMovement, abilityResults, afterAbilities, reset },
    disposal,
  };
} catch (error) {
  report = {
    passed: false,
    url,
    failedChecks: ['browser-harness'],
    consoleErrors,
    pageErrors,
    harnessError: error instanceof Error ? error.stack ?? error.message : String(error),
  };
} finally {
  await browser.close();
}

await writeFile(`${evidenceDir}/playcanvas-slice-report.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exit(1);
