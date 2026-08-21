import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.QA_PLAY_URL || 'http://127.0.0.1:4173/';
const outputDir = path.resolve(process.env.QA_PLAY_OUTPUT || 'Docs');
const testedCommit = process.env.GITHUB_SHA || 'local';
const workflowRun = process.env.GITHUB_RUN_NUMBER || 'local';
const startedAt = new Date().toISOString();

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.QA_PLAY_BROWSER || undefined,
  headless: true,
  args: [
    '--autoplay-policy=no-user-gesture-required',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--use-angle=swiftshader'
  ]
});

const context = await browser.newContext({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true
});
const page = await context.newPage();

const consoleErrors = [];
const pageErrors = [];
const consoleWarnings = [];
page.on('console', message => {
  const entry = `${message.type()}: ${message.text()}`;
  if (message.type() === 'error') consoleErrors.push(entry);
  if (message.type() === 'warning') consoleWarnings.push(entry);
});
page.on('pageerror', error => pageErrors.push(String(error?.stack || error)));

async function readState() {
  return page.evaluate(() => {
    const safe = (fn, fallback = null) => {
      try { return fn(); } catch { return fallback; }
    };
    const visible = element => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
    };
    const popupSelectors = [
      '.damage-popup', '.rampage-popup', '.score-popup', '.floating-score',
      '#rampageFeedbackLayer > *', '[class*="callout"]'
    ];
    const popupSet = new Set();
    for (const selector of popupSelectors) {
      document.querySelectorAll(selector).forEach(element => {
        if (visible(element)) popupSet.add(element);
      });
    }
    const relevantDom = {};
    document.querySelectorAll('[id]').forEach(element => {
      if (!/(timer|time|score|district|stage|combo|result|audio|voice|music|glass|objective|fps)/i.test(element.id)) return;
      const text = String(element.textContent || '').replace(/\s+/g, ' ').trim();
      if (text) relevantDom[element.id] = text.slice(0, 500);
    });
    const direct = safe(() => ({
      runTimeRemaining: typeof runTimeRemaining !== 'undefined' ? runTimeRemaining : null,
      runActive: typeof runActive !== 'undefined' ? runActive : null,
      gameStarted: typeof gameStarted !== 'undefined' ? gameStarted : null,
      currentStage: typeof currentStage !== 'undefined' ? currentStage : null,
      destructionScore: typeof destructionScore !== 'undefined' ? destructionScore : null,
      baseScore: typeof baseScore !== 'undefined' ? baseScore : null,
      comboMultiplier: typeof comboMultiplier !== 'undefined' ? comboMultiplier : null,
      maxComboReached: typeof maxComboReached !== 'undefined' ? maxComboReached : null,
      stage3ElapsedSeconds: typeof stage3ElapsedSeconds !== 'undefined' ? stage3ElapsedSeconds : null,
      stormAudioReady: typeof stormAudioReady !== 'undefined' ? stormAudioReady : null,
      audioContextState: typeof audioCtx !== 'undefined' && audioCtx ? audioCtx.state : null,
      activeVoices: typeof activeVoiceCount === 'function' ? activeVoiceCount() : null,
      activeMusicVoices: typeof activeVoiceCount === 'function' ? activeVoiceCount('music') : null,
      musicLowEnergy: typeof decodedClipEnergy === 'function' ? decodedClipEnergy('music_drive_low') : null,
      musicHighEnergy: typeof decodedClipEnergy === 'function' ? decodedClipEnergy('music_drive_high') : null,
      stormPosition: typeof storm !== 'undefined' && storm?.pos ? { x: storm.pos.x, y: storm.pos.y, z: storm.pos.z } : null,
      recentAudioEvents: typeof recentAudioEvents !== 'undefined' ? recentAudioEvents.slice(0, 30).map(event => ({ ...event })) : []
    }), {});
    return {
      capturedAt: new Date().toISOString(),
      direct,
      visiblePopupCount: popupSet.size,
      resultsVisible: visible(document.getElementById('resultsOverlay')) || visible(document.getElementById('resultsModal')) || visible(document.querySelector('[class*="results"][class*="active"]')),
      mainMenuVisible: visible(document.getElementById('mainMenu')),
      audioPanelVisible: visible(document.getElementById('audioLabPanel')),
      relevantDom
    };
  });
}

const movementPattern = [
  ['KeyW'], ['KeyW', 'KeyD'], ['KeyD'], ['KeyS', 'KeyD'],
  ['KeyS'], ['KeyS', 'KeyA'], ['KeyA'], ['KeyW', 'KeyA']
];
const activeKeys = new Set();
async function setMovement(keys) {
  for (const key of [...activeKeys]) {
    if (!keys.includes(key)) {
      await page.keyboard.up(key);
      activeKeys.delete(key);
    }
  }
  for (const key of keys) {
    if (!activeKeys.has(key)) {
      await page.keyboard.down(key);
      activeKeys.add(key);
    }
  }
}

const snapshots = [];
let completed = false;
let harnessError = null;
let movementIndex = 0;
let nextMoveAt = 0;
let nextAbilityAt = 0;
let nextSnapshotAt = 0;
let runtimeMs = 0;

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForSelector('canvas', { timeout: 60000 });
  await page.waitForSelector('#btnStartMenu', { timeout: 60000 });
  await page.click('#btnStartMenu', { force: true });
  await page.waitForTimeout(1500);

  const startState = await readState();
  snapshots.push({ label: 'start', elapsedSeconds: 0, ...startState });

  const roundStart = Date.now();
  // The run clock is real time, but any frame taking over a second contributes
  // ZERO to it (a guard against backgrounded tabs). On a slow software renderer
  // enough frames cross that line for a 180-second run to need well over 180
  // seconds of wall clock. At the old 205s the deadline was doing double duty as
  // an unreliable performance test: every run from #28 onward failed here on
  // `roundCompleted` while finishing the round perfectly well in about 225s.
  //
  // This check answers "does a round complete", so give it room to answer that.
  // Actual pace is reported as runtimeSeconds and wallClockOvershootSeconds
  // below (runtimeSeconds is already wall clock), which is where a genuine
  // slowdown should be read from.
  const hardDeadline = roundStart + 300000;
  while (Date.now() < hardDeadline) {
    runtimeMs = Date.now() - roundStart;
    if (runtimeMs >= nextMoveAt) {
      await setMovement(movementPattern[movementIndex % movementPattern.length]);
      movementIndex += 1;
      nextMoveAt += 6500;
    }
    if (runtimeMs >= nextAbilityAt) {
      await page.evaluate(() => {
        if (typeof triggerAbility === 'function') {
          triggerAbility('primary');
          triggerAbility('secondary');
          triggerAbility('tertiary');
        }
      });
      nextAbilityAt += 1300;
    }
    if (runtimeMs >= nextSnapshotAt) {
      const state = await readState();
      snapshots.push({ label: 'round', elapsedSeconds: Math.round(runtimeMs / 1000), ...state });
      const direct = state.direct || {};
      if (direct.runActive === false || state.resultsVisible || (Number.isFinite(direct.runTimeRemaining) && direct.runTimeRemaining <= 0)) {
        completed = true;
        break;
      }
      nextSnapshotAt += 5000;
    }
    await page.waitForTimeout(250);
  }

  await setMovement([]);
  await page.waitForTimeout(2500);

  await page.evaluate(() => {
    const button = document.getElementById('audioLabToggle');
    if (button) button.click();
  });
  await page.waitForTimeout(1000);

  const finalState = await readState();
  snapshots.push({ label: 'final', elapsedSeconds: Math.round(runtimeMs / 1000), ...finalState });
  await page.screenshot({ path: path.join(outputDir, 'QA_AUTOPLAY_SCREENSHOT.png'), fullPage: true });
} catch (error) {
  harnessError = String(error?.stack || error);
  try {
    snapshots.push({ label: 'failure', elapsedSeconds: Math.round(runtimeMs / 1000), ...(await readState()) });
    await page.screenshot({ path: path.join(outputDir, 'QA_AUTOPLAY_SCREENSHOT.png'), fullPage: true });
  } catch {}
} finally {
  await setMovement([]).catch(() => {});
  await browser.close();
}

const stageSequence = snapshots
  .map(snapshot => snapshot.direct?.currentStage)
  .filter(value => Number.isFinite(value));
const progressionMonotonic = stageSequence.every((value, index) => index === 0 || value >= stageSequence[index - 1]);
const finalSnapshot = snapshots.at(-1) || {};
const finalEvents = finalSnapshot.direct?.recentAudioEvents || [];
const allEvents = snapshots.flatMap(snapshot => snapshot.direct?.recentAudioEvents || []);
const uniqueEvents = [...new Map(allEvents.map(event => [
  `${event.at}|${event.clip}|${event.trigger}|${event.status}`,
  event
])).values()];
const musicEvents = uniqueEvents.filter(event => String(event.clip || '').startsWith('music_'));
const mooEvents = uniqueEvents.filter(event => event.clip === 'moo_1' || String(event.trigger || '').includes('moo'));
const glassEvents = uniqueEvents.filter(event => String(event.clip || '').includes('glass') || String(event.trigger || '').includes('glass'));
const maxVisiblePopupCount = Math.max(0, ...snapshots.map(snapshot => snapshot.visiblePopupCount || 0));
const lowEnergy = Math.max(0, ...snapshots.map(snapshot => Number(snapshot.direct?.musicLowEnergy) || 0));
const highEnergy = Math.max(0, ...snapshots.map(snapshot => Number(snapshot.direct?.musicHighEnergy) || 0));

const checks = {
  roundCompleted: completed || finalSnapshot.direct?.runActive === false || finalSnapshot.resultsVisible === true,
  noPageErrors: pageErrors.length === 0,
  noConsoleErrors: consoleErrors.length === 0,
  districtProgressionMonotonic: progressionMonotonic,
  reachedDistrictThree: stageSequence.includes(3),
  popupCapObserved: maxVisiblePopupCount <= 4,
  musicDecodedWithEnergy: lowEnergy > 0 && highEnergy > 0,
  musicEventsObserved: musicEvents.length > 0,
  syntheticMooNeverPlayed: mooEvents.every(event => event.status === 'disabled-synthetic-source'),
  audioContextInitialized: snapshots.some(snapshot => snapshot.direct?.audioContextState === 'running'),
  harnessCompletedWithoutException: harnessError === null
};

const report = {
  schemaVersion: 1,
  testedCommit,
  workflowRun,
  startedAt,
  finishedAt: new Date().toISOString(),
  url: baseUrl,
  mode: 'normal-audio scripted full round',
  runtimeSeconds: Math.round(runtimeMs / 1000),
  wallClockOvershootSeconds: Math.max(0, Math.round(runtimeMs / 1000) - 180),
  checks,
  summary: {
    finalStage: finalSnapshot.direct?.currentStage ?? null,
    finalTimeRemaining: finalSnapshot.direct?.runTimeRemaining ?? null,
    finalDestructionScore: finalSnapshot.direct?.destructionScore ?? null,
    finalBaseScore: finalSnapshot.direct?.baseScore ?? null,
    maximumCombo: Math.max(0, ...snapshots.map(snapshot => Number(snapshot.direct?.maxComboReached) || 0)),
    maxVisiblePopupCount,
    musicLowEnergy: lowEnergy,
    musicHighEnergy: highEnergy,
    musicEventCount: musicEvents.length,
    mooEventCount: mooEvents.length,
    glassEventCount: glassEvents.length,
    finalActiveVoices: finalSnapshot.direct?.activeVoices ?? null,
    finalActiveMusicVoices: finalSnapshot.direct?.activeMusicVoices ?? null
  },
  consoleErrors,
  consoleWarnings,
  pageErrors,
  harnessError,
  musicEvents,
  mooEvents,
  glassEvents,
  finalAudioEvents: finalEvents,
  snapshots
};

await writeFile(path.join(outputDir, 'QA_AUTOPLAY_REPORT.json'), `${JSON.stringify(report, null, 2)}\n`);

const status = value => value ? 'PASS' : 'FAIL';
const markdown = `# QA Automated Full-Round Report

- Tested commit: \`${testedCommit}\`
- Workflow run: \`${workflowRun}\`
- Mode: normal-audio scripted full round
- Started: ${startedAt}
- Finished: ${report.finishedAt}
- Runtime: ${report.runtimeSeconds} seconds

## Checks

| Check | Result |
|---|---|
${Object.entries(checks).map(([name, value]) => `| ${name} | ${status(value)} |`).join('\n')}

## Round result

- Final district: ${report.summary.finalStage ?? 'unknown'}
- Time remaining: ${report.summary.finalTimeRemaining ?? 'unknown'}
- Destruction score: ${report.summary.finalDestructionScore ?? 'unknown'}
- Base score: ${report.summary.finalBaseScore ?? 'unknown'}
- Maximum combo: ${report.summary.maximumCombo}
- Maximum simultaneous visible popups: ${report.summary.maxVisiblePopupCount}
- Music low/high decoded energy: ${report.summary.musicLowEnergy.toFixed(6)} / ${report.summary.musicHighEnergy.toFixed(6)}
- Music events observed: ${report.summary.musicEventCount}
- Moo events observed: ${report.summary.mooEventCount}
- Glass events observed: ${report.summary.glassEventCount}
- Final active voices: ${report.summary.finalActiveVoices ?? 'unknown'}

## Errors

- Page errors: ${pageErrors.length}
- Console errors: ${consoleErrors.length}
- Harness exception: ${harnessError ? 'yes' : 'no'}

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
`;
await writeFile(path.join(outputDir, 'QA_AUTOPLAY_REPORT.md'), markdown);

const failedChecks = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

if (failedChecks.length > 0) {
  console.error(`Full-round QA failed required checks: ${failedChecks.join(', ')}`);
  process.exitCode = 1;
}
