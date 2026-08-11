import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR) : path.join(root, 'qa-artifacts', 'sw-game-002');
const baseUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || undefined, args: ['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
await mkdir(outputDir, { recursive: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const pageErrors = []; const consoleErrors = [];
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
await page.goto(`${baseUrl}?mooqa=1`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForFunction(() => globalThis.getMooLevelQaState?.().marker === 'SW_GAME_002_MOO_LEVEL_V1', null, { timeout: 15000 });
await page.waitForTimeout(500);
const started = await page.evaluate(() => globalThis.getMooLevelQaState());
await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.expireEncounter());
await page.waitForTimeout(500);
const failedEncounter = await page.evaluate(() => globalThis.getMooLevelQaState());
await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginEncounter());
await page.waitForTimeout(500);
await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.primeEncounterSuccess());
await page.waitForTimeout(3000);
const unlocked = await page.evaluate(() => globalThis.getMooLevelQaState());
await page.screenshot({ path: path.join(outputDir, 'hart-farm-unlocked.png') });
await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginMooLevel());
await page.waitForTimeout(750);
const mooStarted = await page.evaluate(() => globalThis.getMooLevelQaState());
await page.screenshot({ path: path.join(outputDir, 'moo-level-start.png') });
await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.primeMooObjectives());
await page.waitForTimeout(1800);
const mooCompleted = await page.evaluate(() => globalThis.getMooLevelQaState());
await page.screenshot({ path: path.join(outputDir, 'moo-level-objectives.png') });
const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('severe_weather_moo_level_v1') || '{}'));
const assetTransportErrors = consoleErrors.filter((message) => /ERR_FILE_NOT_FOUND|URL scheme "file" is not supported/.test(message));
const runtimeConsoleErrors = consoleErrors.filter((message) => !assetTransportErrors.includes(message));
const checks = {
  executorIntegration: started.executorTicks > 0 && unlocked.executorTicks > started.executorTicks && mooCompleted.executorTicks > mooStarted.executorTicks,
  hartFarmActivated: started.encounter?.activated === true,
  encounterFailureRearms: failedEncounter.encounter?.state === 'failed' && failedEncounter.progress?.mooLevelUnlocked === false,
  encounterUnlocked: unlocked.progress?.mooLevelUnlocked === true && unlocked.encounter?.state === 'complete',
  persistence: persisted.mooLevelUnlocked === true,
  lockedToUnlockedAccess: await page.locator('#menuCardMooLevel').count() === 1,
  dedicatedMooRun: mooStarted.mode === 'moo' && mooStarted.mooRun?.sponsorProps === 12 && mooStarted.safeCowCount === 28,
  objectiveSignals: mooCompleted.mooRun?.relocated >= 20 && mooCompleted.mooRun?.props >= 10 && mooCompleted.mooRun?.airtime > 0,
  cowSafety: started.safeCowCount === 8 && started.allMooCowsSafe === true && mooStarted.safeCowCount === 28 && mooStarted.allMooCowsSafe === true,
  normalCampaignRegression: started.normalCampaignMode === true && started.mode === 'normal',
  noPageErrors: pageErrors.length === 0,
  noRuntimeConsoleErrors: runtimeConsoleErrors.length === 0
};
const report = { task: 'SW-GAME-002', baseUrl, started, failedEncounter, unlocked, mooStarted, mooCompleted, persisted, checks, pageErrors, runtimeConsoleErrors, assetTransportErrors, passed: Object.values(checks).every(Boolean) };
await writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await browser.close();
for (const [name, passed] of Object.entries(checks)) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (!report.passed) process.exit(1);
