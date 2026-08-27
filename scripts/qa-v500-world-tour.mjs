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
  // Matches qa-play-full-round.mjs: lets this run against a pre-installed
  // Chromium instead of only a `playwright install` one. Unset in CI.
  executablePath: process.env.QA_PLAY_BROWSER || undefined,
  headless: true,
  args: [
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--use-angle=swiftshader'
  ]
});

const context = await browser.newContext({
  viewport: { width: 932, height: 430 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true
});

await context.addInitScript(() => {
  localStorage.setItem('severe_weather_campaign_v1', JSON.stringify({
    schema: 1,
    unlockedLevel: 3,
    selectedLevel: 0,
    levels: {}
  }));
});

const page = await context.newPage();
const consoleErrors = [];
const pageErrors = [];
// See the same block in qa-play-full-round.mjs: the audio sprite is resolved by
// probing three candidate paths, so a healthy packaged boot logs two 404s by
// design. Chrome's console line for those carries no URL, so failing requests
// are tracked by URL separately and the URL-less generic lines are dropped.
const failedRequests = [];
const BENIGN_PROBE_PATHS = [
  '/assets/audio/storm-feel-manifest.json',
  '/assets/audio/storm-feel-sprite.wav'
];
const isBenignProbeMiss = url => BENIGN_PROBE_PATHS.some(suffix => {
  try {
    return new URL(url).pathname.endsWith(suffix);
  } catch {
    return false;
  }
});
const GENERIC_RESOURCE_ERROR = /^error: Failed to load resource:/;
// Chrome refuses navigator.vibrate() until the frame has been tapped, and logs
// an error for each refused call. Headless-only: on a device the player taps to
// start, so the call lands. Deliberately NOT fixed by gating the game's haptics
// on navigator.userActivation -- that silences this line but makes triggerHaptic
// untestable without a gesture, which breaks the haptic waveform audit. The
// harness is the right place to know this is an artifact of how it drives the
// page.
const BLOCKED_VIBRATE = /Blocked call to navigator\.vibrate/;

page.on('response', response => {
  if (response.status() < 400) return;
  const url = response.url();
  if (isBenignProbeMiss(url)) return;
  failedRequests.push(`${response.status()} ${url}`);
});
page.on('console', message => {
  const entry = `${message.type()}: ${message.text()}`;
  if (message.type() === 'error' && !GENERIC_RESOURCE_ERROR.test(entry) && !BLOCKED_VIBRATE.test(entry)) consoleErrors.push(entry);
});
page.on('pageerror', error => pageErrors.push(String(error?.stack || error)));

const states = [];
let harnessError = null;

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForSelector('#campaignMapGrid', { timeout: 60000, state: 'attached' });
  await page.waitForFunction(() => typeof window.getCampaignWorldQaState === 'function', null, { timeout: 60000 });

  for (let index = 0; index < 4; index++) {
    const state = await page.evaluate(selectedIndex => {
      if (typeof selectCampaignLevel !== 'function' || !selectCampaignLevel(selectedIndex)) {
        throw new Error(`Unable to select campaign stop ${selectedIndex}`);
      }
      gameStarted = true;
      isPaused = false;
      resetWarningRun();
      document.getElementById('mainMenu')?.classList.add('hidden');
      document.getElementById('resultsOverlay')?.classList.remove('active');
      isPaused = true;
      return {
        ...window.getCampaignWorldQaState(),
        bovine: typeof window.getBovineQaState === 'function' ? window.getBovineQaState() : null
      };
    }, index);
    states.push(state);
    await page.waitForTimeout(350);
    // One capture per county. This used to take a single screenshot after the
    // last stop, so three of the four counties were swept without anyone ever
    // seeing them - which is how roads floating up to twelve units over the
    // ground on Prairie Junction reached a phone.
    await page.screenshot({
      path: path.join(outputDir, `QA_V500_WORLD_TOUR_${index}_${state.levelId}.png`),
      fullPage: false,
    });
  }

  await page.screenshot({ path: path.join(outputDir, 'QA_V500_WORLD_TOUR_SCREENSHOT.png'), fullPage: true });
} catch (error) {
  harnessError = String(error?.stack || error);
  try {
    await page.screenshot({ path: path.join(outputDir, 'QA_V500_WORLD_TOUR_SCREENSHOT.png'), fullPage: true });
  } catch {}
} finally {
  await browser.close();
}

const expectedIds = ['lincoln-county', 'prairie-junction', 'grain-belt', 'state-fair-finale'];
const profileSet = new Set(states.map(state => state.profile));
const terrainSet = new Set(states.map(state => JSON.stringify(state.terrainSamples)));
const landmarkNames = states.flatMap(state => state.landmarks || []);
const challengeSet = new Set(states.map(state => state.challenge));
const broadcastSet = new Set(states.map(state => state.broadcast));
const animalCounts = states.map(state => state.animals);

const checks = {
  allFourStopsLoaded: states.length === 4 && states.every((state, index) => state.levelId === expectedIds[index]),
  uniqueTerrainProfiles: profileSet.size === 4,
  uniqueTerrainSamples: terrainSet.size === 4,
  twoLandmarksPerStop: states.every(state => Array.isArray(state.landmarks) && state.landmarks.length === 2),
  eightUniqueLandmarks: landmarkNames.length === 8 && new Set(landmarkNames).size === 8,
  authoredSceneryPresent: states.every(state => state.sceneryCount >= 10),
  animatedSpectaclePresent: states.slice(1).every(state => state.animatedCount >= 1),
  uniqueRegionalChallenges: challengeSet.size === 4,
  uniqueBroadcastIdentity: broadcastSet.size === 4,
  intentionalAnimalDensity: JSON.stringify(animalCounts) === JSON.stringify([38, 24, 18, 8]),
  cow17PresentAtEveryStop: states.every(state => state.bovine?.cow17?.id === 17),
  cow17EarTagPersists: states.every(state => state.bovine?.cow17?.tagged === true),
  fourHayBaleLandingZones: states.every(state => state.bovine?.hayBales === 4),
  animalsRemainUnharmed: states.every(state => state.bovine?.invariant === 'Cow injuries: 0'),
  // [SW:AREA:TERRAIN_ROADS] Every road vertex is conformed to terrainHeightAt +
  // its lift, so this is zero in a correct build. Selecting a county rebuilds the
  // ground; anything conformed at page load has to be rebuilt with it. When it
  // was not, this reached 11.91 units on Prairie Junction, 8.51 on Grain Belt and
  // 11.07 on the finale, while Lincoln County - the default, and the only one
  // anybody ever rendered - stayed correct and hid it.
  roadsFollowGroundAtEveryStop: states.every(state => (state.groundAgreement?.maxLiftError ?? Infinity) < 0.01),
  noPageErrors: pageErrors.length === 0,
  noConsoleErrors: consoleErrors.length === 0,
  noFailedRequests: failedRequests.length === 0,
  harnessCompletedWithoutException: harnessError === null
};

const report = {
  schemaVersion: 1,
  testedCommit,
  workflowRun,
  startedAt,
  finishedAt: new Date().toISOString(),
  url: baseUrl,
  mode: 'mobile-landscape four-stop authored-world sweep',
  checks,
  states,
  consoleErrors,
  failedRequests,
  pageErrors,
  harnessError
};

await writeFile(path.join(outputDir, 'QA_V500_WORLD_TOUR_REPORT.json'), `${JSON.stringify(report, null, 2)}\n`);

const status = value => value ? 'PASS' : 'FAIL';
const markdown = `# V5 Heartland World-Tour QA Report

- Tested commit: \`${testedCommit}\`
- Workflow run: \`${workflowRun}\`
- Mode: mobile-landscape four-stop authored-world sweep
- Started: ${startedAt}
- Finished: ${report.finishedAt}

## Checks

| Check | Result |
|---|---|
${Object.entries(checks).map(([name, value]) => `| ${name} | ${status(value)} |`).join('\n')}

## Stop contracts

| Stop | Profile | Scenery | Landmarks | Animals | Cow 17 | Terrain samples |
|---|---:|---:|---|---:|---|---|
${states.map(state => `| ${state.levelId} | ${state.profile} | ${state.sceneryCount} | ${(state.landmarks || []).join(', ')} | ${state.animals} | ${state.bovine?.cow17?.tagged ? 'tagged' : 'missing'} | ${(state.terrainSamples || []).join(' / ')} |`).join('\n')}

## Errors

- Page errors: ${pageErrors.length}
- Console errors: ${consoleErrors.length}
- Harness exception: ${harnessError ? 'yes' : 'no'}

## Interpretation boundary

This sweep proves that every stop constructs a distinct terrain, scenery, landmark, challenge, media, and animal-density contract without browser errors. It does not replace subjective phone play, thermal testing, or judging whether the authored differences are fun enough.
`;

await writeFile(path.join(outputDir, 'QA_V500_WORLD_TOUR_REPORT.md'), markdown);

const failedChecks = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
if (failedChecks.length > 0) {
  console.error(`V5 world-tour QA failed required checks: ${failedChecks.join(', ')}`);
  process.exitCode = 1;
}
