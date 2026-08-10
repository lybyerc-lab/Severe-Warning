import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR || path.join(projectRoot, 'qa-artifacts', 'opening-cinematic-playable');
const qaUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
page.setDefaultTimeout(30000);
const errors = [];
const logs = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  logs.push(`[${message.type()}] ${message.text()}`);
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

const report = {
  version: 'SW_CIN_003_BROWSER_QA_V1',
  generatedAt: new Date().toISOString(),
  passed: false,
  frames: {},
  lifecycle: {},
  failures: [],
  errors,
};
function requireCondition(condition, message) { if (!condition) report.failures.push(message); }

async function snapshot(label, time, filename) {
  const data = await page.evaluate((seconds) => {
    const bridge = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__;
    bridge.debugSeek(seconds);
    return bridge.getSnapshot();
  }, time);
  await page.waitForTimeout(70);
  report.frames[label] = data;
  await page.screenshot({ path: path.join(outputDir, filename), fullPage: true });
  requireCondition(data.active === true, `${label}: cinematic should still be active.`);
  requireCondition(data.runActive === false, `${label}: gameplay activated before handoff.`);
  requireCondition(data.timerFrozenDuringCinematic === true, `${label}: warning clock did not remain frozen at 3:00.`);
  requireCondition(Math.abs(Number(data.runTimeRemaining) - 180) < 0.001, `${label}: runTimeRemaining changed before handoff (${data.runTimeRemaining}).`);
  requireCondition(data.stage?.farmFound === true, `${label}: authored Hart Farm anchor was not resolved.`);
  requireCondition(data.actors?.cow17 === true && Number(data.actors?.chickens) >= 2 && data.actors?.cup === true, `${label}: Cow 17/chicken/Moo Brew actor composition is incomplete.`);
  return data;
}

try {
  await page.goto(qaUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot === 'function');
  await page.evaluate(() => {
    try { localStorage.removeItem('severe_weather_opening_seen_v1'); } catch (_) {}
    globalThis.startRunFromMenu();
  });
  await page.waitForFunction(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.().active === true);

  const initial = await page.evaluate(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.getSnapshot());
  report.lifecycle.initial = initial;
  requireCondition(initial.canSkip === false, 'First viewing unexpectedly allowed skip.');
  requireCondition(initial.startCount === 1, `Expected one cinematic start, received ${initial.startCount}.`);

  await snapshot('newspaper', 0.75, 'sw-cin-003-newspaper.png');
  await snapshot('fence-conversation', 2.05, 'sw-cin-003-fence-conversation.png');
  await snapshot('double-take', 6.55, 'sw-cin-003-double-take.png');
  await snapshot('last-sip', 8.85, 'sw-cin-003-last-sip.png');
  const panic = await snapshot('panic-touchdown', 11.35, 'sw-cin-003-panic-touchdown.png');
  requireCondition(panic.stormRevealPresent === true, 'Panic/touchdown frame is missing the presentation storm reveal.');
  requireCondition(panic.roofPeelPresent === true, 'Panic/touchdown frame is missing the barn roof peel presentation.');

  await page.evaluate(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.finish('natural'));
  await page.waitForTimeout(70);
  const handoff = await page.evaluate(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.getSnapshot());
  report.lifecycle.handoff = handoff;
  await page.screenshot({ path: path.join(outputDir, 'sw-cin-003-gameplay-handoff.png'), fullPage: true });
  requireCondition(handoff.active === false, 'Cinematic remained active after handoff.');
  requireCondition(handoff.runActive === true, 'Gameplay did not activate after handoff.');
  requireCondition(handoff.handoffCount === 1, `Expected one handoff, received ${handoff.handoffCount}.`);
  requireCondition(Number(handoff.runTimeRemaining) > 179.7, `Gameplay clock lost time during cinematic (${handoff.runTimeRemaining}).`);

  const cleanupCounts = await page.evaluate(() => ({
    foundationRoots: document.querySelectorAll('canvas').length,
    sceneFoundationRoots: globalThis.scene?.getObjectByName?.('MooBrewOpeningFoundationRoot') ? 1 : 0,
    customRoots: globalThis.scene?.getObjectByName?.('SWCinematicPlayableOpeningPresentation') ? 1 : 0,
    revealRoots: globalThis.scene?.getObjectByName?.('SWCinematicTouchdownPresentation') ? 1 : 0,
  }));
  report.lifecycle.cleanup = cleanupCounts;
  requireCondition(cleanupCounts.sceneFoundationRoots === 0 && cleanupCounts.customRoots === 0 && cleanupCounts.revealRoots === 0, `Cinematic cleanup left scene roots behind: ${JSON.stringify(cleanupCounts)}.`);

  await page.evaluate(() => {
    globalThis.resetWarningRun();
    globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.begin();
  });
  const secondStart = await page.evaluate(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.getSnapshot());
  report.lifecycle.secondStart = secondStart;
  requireCondition(secondStart.active === true, 'Second cinematic mount failed after reset.');
  requireCondition(secondStart.canSkip === true, 'Seen-state did not enable later-viewing skip eligibility.');
  requireCondition(secondStart.startCount === 2, `Expected second mount count 2, received ${secondStart.startCount}.`);
  await page.evaluate(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.finish('skip'));
  const secondCleanup = await page.evaluate(() => ({
    foundation: globalThis.scene?.getObjectByName?.('MooBrewOpeningFoundationRoot') ? 1 : 0,
    custom: globalThis.scene?.getObjectByName?.('SWCinematicPlayableOpeningPresentation') ? 1 : 0,
    reveal: globalThis.scene?.getObjectByName?.('SWCinematicTouchdownPresentation') ? 1 : 0,
    snapshot: globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.getSnapshot(),
  }));
  report.lifecycle.secondCleanup = secondCleanup;
  requireCondition(secondCleanup.foundation === 0 && secondCleanup.custom === 0 && secondCleanup.reveal === 0, 'Second cleanup left duplicate cinematic roots.');
  requireCondition(secondCleanup.snapshot.runActive === true, 'Skip path did not resume gameplay.');
} finally {
  await writeFile(path.join(outputDir, 'sw-cin-003-browser.log'), `${logs.join('\n')}\n`, 'utf8');
  await browser.close();
}

if (errors.length) report.failures.push(`Browser errors: ${errors.join(' | ')}`);
report.passed = report.failures.length === 0;
await writeFile(path.join(outputDir, 'sw-cin-003-browser-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`SW-CIN-003 browser QA: ${report.passed ? 'PASS' : 'FAIL'}; frames=${Object.keys(report.frames).length}.`);
if (!report.passed) {
  report.failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
