import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR) : path.join(root, 'qa-artifacts', 'sw-level-001');
const baseUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || undefined, args: ['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
await mkdir(outputDir, { recursive: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const pageErrors = []; const consoleErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
await page.goto(`${baseUrl}?stormsiteqa=1`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForFunction(() => globalThis.getStormSiteQaState?.().marker === 'SW_LEVEL_001_STORM_SITE_FRAMEWORK_V1', null, { timeout: 15000 });
const homeBefore = await page.evaluate(() => globalThis.getStormSiteQaState());
async function launch(siteId, imageName) {
  await page.evaluate(id => globalThis.__SW_STORM_SITE_QA__.launch(id), siteId);
  await page.waitForTimeout(900);
  const started = await page.evaluate(() => globalThis.getStormSiteQaState());
  await page.screenshot({ path: path.join(outputDir, imageName) });
  await page.evaluate(() => globalThis.__SW_STORM_SITE_QA__.destroySignature());
  await page.waitForTimeout(250);
  const signature = await page.evaluate(() => globalThis.getStormSiteQaState());
  return { started, signature };
}
const fair = await launch('county-fair', 'county-fair.png');
const fairReplay = await page.evaluate(() => globalThis.__SW_STORM_SITE_QA__.launch('county-fair'));
await page.waitForTimeout(400);
const fairReplayState = await page.evaluate(() => globalThis.getStormSiteQaState());
const boardwalk = await launch('coastal-boardwalk', 'coastal-boardwalk.png');
const boardwalkReplay = await page.evaluate(() => globalThis.__SW_STORM_SITE_QA__.launch('coastal-boardwalk'));
await page.waitForTimeout(400);
const boardwalkReplayState = await page.evaluate(() => globalThis.getStormSiteQaState());
await page.evaluate(() => globalThis.__SW_STORM_SITE_QA__.returnHome());
await page.waitForTimeout(400);
const homeAfter = await page.evaluate(() => globalThis.getStormSiteQaState());
const assetTransportErrors = consoleErrors.filter(message => /ERR_FILE_NOT_FOUND|URL scheme "file" is not supported/.test(message));
const runtimeConsoleErrors = consoleErrors.filter(message => !assetTransportErrors.includes(message));
const checks = {
  executorIntegration: homeBefore.executorTicks > 0 && boardwalk.started.executorTicks > homeBefore.executorTicks,
  campaignHomePreserved: homeBefore.campaignHomeSelected === true && homeAfter.campaignHomeSelected === true && homeAfter.targetCount === 0,
  mooProtected: homeBefore.mooProtected === true && fair.started.mooProtected === true && boardwalk.started.mooProtected === true,
  fairLaunch: fair.started.selectedSiteId === 'county-fair' && fair.started.targetCount >= 12 && fair.started.bounds?.width >= 300 && fair.started.acceptedRunState.runTimeRemaining <= 180 && fair.started.acceptedRunState.currentStage === 1,
  fairReplayVariation: fair.started.activeVariant !== fairReplayState.activeVariant,
  fairSignature: fair.signature.signature.fairWheelDestroyed === true,
  boardwalkLaunch: boardwalk.started.selectedSiteId === 'coastal-boardwalk' && boardwalk.started.targetCount >= 12 && boardwalk.started.bounds?.width >= 300 && boardwalk.started.acceptedRunState.runTimeRemaining <= 180 && boardwalk.started.acceptedRunState.currentStage === 1,
  boardwalkReplayVariation: boardwalk.started.activeVariant !== boardwalkReplayState.activeVariant,
  boatLaunchSignalOnly: boardwalk.signature.signature.boatLaunchSignal === true && boardwalk.signature.boatLaunchSignalOnly === true,
  noPageErrors: pageErrors.length === 0,
  noRuntimeConsoleErrors: runtimeConsoleErrors.length === 0,
};
const report = { task: 'SW-LEVEL-001', baseUrl, homeBefore, fair, fairReplayState, boardwalk, boardwalkReplayState, homeAfter, checks, pageErrors, runtimeConsoleErrors, assetTransportErrors, passed: Object.values(checks).every(Boolean) };
await writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await browser.close();
for (const [name, passed] of Object.entries(checks)) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (!report.passed) process.exit(1);
