import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { chromium } from 'playwright';

const baseUrl = process.env.PLAYCANVAS_SLICE_URL ?? 'http://127.0.0.1:4175/';
const evidenceDir = 'playcanvas-slice-evidence';
const reportPath = `${evidenceDir}/playcanvas-intro-report.json`;
const phases = [
  'newspaper',
  'farm-reveal',
  'moo-brew-sip',
  'weather-warning',
  'cow-double-take',
  'chicken-scatter',
  'tornado-touchdown',
  'tactical-handoff',
];

await mkdir(evidenceDir, { recursive: true });

function withParams(values) {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(values)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  return url.toString();
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 932, height: 430 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));

// [SW:PLAYCANVAS:INTRO_QA_SETTLE]
// Deterministic phase selection is immediate, while the real presentation uses
// CSS transitions. Wait for the actual transition set to settle before reading
// visibility or capturing screenshots so QA measures the intended steady state
// without changing player-facing animation behavior.
async function settleIntroPhase(expectedPhase) {
  await page.waitForFunction((phase) => {
    const handle = globalThis.__SW_PLAYCANVAS_INTRO__;
    const overlay = document.getElementById('playcanvas-moo-brew-intro');
    if (!handle || !overlay || handle.getSnapshot().phase !== phase) return false;
    return overlay.getAnimations({ subtree: true }).every((animation) => (
      animation.playState !== 'running' && animation.playState !== 'pending'
    ));
  }, expectedPhase, { timeout: 5_000 });

  return page.evaluate(() => globalThis.__SW_PLAYCANVAS_INTRO__?.getSnapshot() ?? null);
}

let report;
try {
  // Normal repository QA must not pay the cinematic time cost.
  await page.goto(withParams({ qa: '1', intro: null }), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForFunction(() => document.documentElement.dataset.swPlaycanvasSliceReady === 'true', null, { timeout: 90_000 });
  const defaultQa = await page.evaluate(() => ({
    intro: globalThis.__SW_PLAYCANVAS_INTRO__?.getSnapshot() ?? null,
    authority: globalThis.__SW_PLAYCANVAS_SLICE__?.getAuthoritySnapshot() ?? null,
  }));

  // Explicit intro QA is deterministic: phases do not advance behind the harness.
  await page.goto(withParams({ qa: '1', intro: '1' }), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForFunction(() => Boolean(globalThis.__SW_PLAYCANVAS_INTRO__), null, { timeout: 15_000 });
  const beforeHandoff = await page.evaluate(() => ({
    intro: globalThis.__SW_PLAYCANVAS_INTRO__?.getSnapshot() ?? null,
    sliceExists: Boolean(globalThis.__SW_PLAYCANVAS_SLICE__),
  }));

  const phaseSnapshots = [];
  for (const phase of phases) {
    await page.evaluate((value) => {
      const handle = globalThis.__SW_PLAYCANVAS_INTRO__;
      if (!handle?.setPhase(value)) throw new Error(`Could not set intro phase ${value}`);
    }, phase);
    const snapshot = await settleIntroPhase(phase);
    phaseSnapshots.push(snapshot);
    if (phase === 'newspaper') {
      await page.screenshot({ path: `${evidenceDir}/playcanvas-intro-newspaper.png`, fullPage: true });
    }
    if (phase === 'moo-brew-sip') {
      await page.screenshot({ path: `${evidenceDir}/playcanvas-intro-moo-brew.png`, fullPage: true });
    }
    if (phase === 'tornado-touchdown') {
      await page.screenshot({ path: `${evidenceDir}/playcanvas-intro-touchdown.png`, fullPage: true });
    }
  }

  await page.evaluate(() => globalThis.__SW_PLAYCANVAS_INTRO__?.finish());
  await page.waitForFunction(() => document.documentElement.dataset.swPlaycanvasSliceReady === 'true', null, { timeout: 90_000 });
  const afterHandoff = await page.evaluate(() => ({
    intro: globalThis.__SW_PLAYCANVAS_INTRO__?.getSnapshot() ?? null,
    authority: globalThis.__SW_PLAYCANVAS_SLICE__?.getAuthoritySnapshot() ?? null,
  }));
  await page.screenshot({ path: `${evidenceDir}/playcanvas-intro-playable-handoff.png`, fullPage: true });

  const phaseOrderExact = phaseSnapshots.length === phases.length
    && phaseSnapshots.every((snapshot, index) => snapshot.phase === phases[index])
    && phaseSnapshots.every((snapshot) => JSON.stringify(snapshot.phases) === JSON.stringify(phases));
  const newspaperReadable = phaseSnapshots[0]?.visibility?.newspaper === true;
  const mooBrewReadable = phaseSnapshots[2]?.visibility?.cow === true && phaseSnapshots[2]?.visibility?.cup === true;
  const chickenReadable = phaseSnapshots[5]?.visibility?.chickens === true;
  const touchdownReadable = phaseSnapshots[6]?.visibility?.tornado === true;
  const warningStart = Number(afterHandoff.authority?.run?.remainingSeconds);
  const authorityStartsFresh = afterHandoff.authority?.run?.runActive === true
    && afterHandoff.authority?.run?.stage === 1
    && Number.isFinite(warningStart)
    && warningStart >= 176
    && Number(afterHandoff.authority?.score?.destructionScore) === 0;

  const checks = [
    {
      name: 'qa-default-skips-timed-intro',
      passed: defaultQa.intro?.decision === 'qa-bypass'
        && defaultQa.intro?.active === false
        && defaultQa.intro?.completed === true
        && defaultQa.authority?.ready === true,
      detail: defaultQa,
    },
    {
      name: 'forced-qa-intro-is-deterministic',
      passed: beforeHandoff.intro?.decision === 'forced'
        && beforeHandoff.intro?.deterministic === true
        && beforeHandoff.intro?.active === true,
      detail: beforeHandoff.intro,
    },
    {
      name: 'authority-not-loaded-before-intro-finish',
      passed: beforeHandoff.sliceExists === false && beforeHandoff.intro?.gameplayLoaded === false,
      detail: beforeHandoff,
    },
    { name: 'canonical-intro-phase-order', passed: phaseOrderExact, detail: phaseSnapshots.map((snapshot) => snapshot.phase) },
    { name: 'newspaper-phase-readable', passed: newspaperReadable, detail: phaseSnapshots[0] },
    { name: 'moo-brew-cow-cup-phase-readable', passed: mooBrewReadable, detail: phaseSnapshots[2] },
    { name: 'chicken-scatter-phase-readable', passed: chickenReadable, detail: phaseSnapshots[5] },
    { name: 'touchdown-phase-readable', passed: touchdownReadable, detail: phaseSnapshots[6] },
    {
      name: 'intro-finish-hands-off-to-gameplay',
      passed: afterHandoff.intro?.completed === true
        && afterHandoff.intro?.active === false
        && afterHandoff.intro?.gameplayLoaded === true
        && afterHandoff.authority?.ready === true,
      detail: afterHandoff,
    },
    { name: 'warning-run-starts-fresh-after-intro', passed: authorityStartsFresh, detail: { warningStart, authority: afterHandoff.authority } },
    { name: 'no-console-errors-intro', passed: consoleErrors.length === 0, detail: consoleErrors },
    { name: 'no-page-errors-intro', passed: pageErrors.length === 0, detail: pageErrors },
  ];

  const failedChecks = checks.filter((check) => !check.passed).map((check) => check.name);
  report = {
    version: 'PLAYCANVAS_MOO_BREW_INTRO_QA_V1',
    passed: failedChecks.length === 0,
    checks,
    failedChecks,
    evidence: { defaultQa, beforeHandoff, phaseSnapshots, afterHandoff, consoleErrors, pageErrors },
  };
} catch (error) {
  report = {
    version: 'PLAYCANVAS_MOO_BREW_INTRO_QA_V1',
    passed: false,
    checks: [],
    failedChecks: ['harness-exception'],
    evidence: { consoleErrors, pageErrors },
    error: error instanceof Error ? error.stack ?? error.message : String(error),
  };
} finally {
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
