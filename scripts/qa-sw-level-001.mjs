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
const pageErrors = []; const consoleErrors = []; const httpErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) httpErrors.push({ status: response.status(), url: response.url() }); });
await page.goto(`${baseUrl}?stormsiteqa=1`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForFunction(() => globalThis.getStormSiteQaState?.().marker === 'SW_LEVEL_001_STORM_SITE_FRAMEWORK_V1', null, { timeout: 15000 });
const homeBefore = await page.evaluate(() => globalThis.getStormSiteQaState());
async function frameAuthoredSite(siteId) {
  await page.evaluate(id => {
    if (!globalThis.camera) return false;
    const view = id === 'county-fair'
      ? { x: 185, y: 94, z: 185, lookX: 0, lookY: 3, lookZ: 0 }
      : { x: 205, y: 88, z: 172, lookX: 18, lookY: 3, lookZ: 6 };
    camera.position.set(view.x, view.y, view.z);
    camera.lookAt(view.lookX, view.lookY, view.lookZ);
    camera.updateMatrixWorld();
    return true;
  }, siteId);
}
async function launch(siteId, imageName, signatureId) {
  await page.evaluate(id => globalThis.__SW_STORM_SITE_QA__.launch(id), siteId);
  // Wait beyond the inherited campaign-stage announcement so the captured
  // player-facing frame shows the actual Storm Site rather than a temporary
  // Heartland banner.
  await page.waitForTimeout(2600);
  const started = await page.evaluate(() => globalThis.getStormSiteQaState());
  await frameAuthoredSite(siteId);
  await page.screenshot({ path: path.join(outputDir, imageName) });
  const signatureTargetFound = await page.evaluate(targetSignature => globalThis.__SW_STORM_SITE_QA__.destroySignature(targetSignature), signatureId);
  await page.waitForFunction(targetSignature => {
    const state = globalThis.getStormSiteQaState();
    return targetSignature === 'boat-launch-signal'
      ? state.signature.boatLaunchSignal === true
      : state.signature.fairWheelDestroyed === true;
  }, signatureId, { timeout: 2000 });
  const signatureState = await page.evaluate(() => globalThis.getStormSiteQaState());
  return { started, signatureTargetFound, signature: signatureState };
}
const fair = await launch('county-fair', 'county-fair.png', 'fair-wheel-flight');
const fairReplay = await page.evaluate(() => globalThis.__SW_STORM_SITE_QA__.launch('county-fair'));
await page.waitForTimeout(400);
const fairReplayState = await page.evaluate(() => globalThis.getStormSiteQaState());
const boardwalk = await launch('coastal-boardwalk', 'coastal-boardwalk.png', 'boat-launch-signal');
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
  campaignHomeRestored: homeBefore.campaignHomeSelected === true && homeAfter.campaignHomeSelected === true && homeAfter.targetCount === 0 && homeAfter.decorativeMeshCount === 0 && homeAfter.activeVariant === null && homeAfter.stormSiteWorldAttached === false && homeAfter.signature.fairWheelDestroyed === false && homeAfter.signature.boatLaunchSignal === false && homeAfter.acceptedCampaignTargetCount > 0 && homeAfter.acceptedCampaignDecorativeCount > 0,
  mooProtected: homeBefore.mooProtected === true && fair.started.mooProtected === true && boardwalk.started.mooProtected === true,
  fairLaunch: fair.started.selectedSiteId === 'county-fair' && fair.started.targetCount >= 12 && fair.started.bounds?.width >= 300 && fair.started.acceptedRunState.runTimeRemaining <= 180 && fair.started.acceptedRunState.currentStage === 1 && fair.started.presentationIntroActive === false,
  fairReplayVariation: fair.started.activeVariant !== fairReplayState.activeVariant,
  fairSignature: fair.signatureTargetFound === true && fair.signature.signature.fairWheelDestroyed === true,
  boardwalkLaunch: boardwalk.started.selectedSiteId === 'coastal-boardwalk' && boardwalk.started.targetCount >= 12 && boardwalk.started.bounds?.width >= 300 && boardwalk.started.acceptedRunState.runTimeRemaining <= 180 && boardwalk.started.acceptedRunState.currentStage === 1 && boardwalk.started.presentationIntroActive === false,
  boardwalkReplayVariation: boardwalk.started.activeVariant !== boardwalkReplayState.activeVariant,
  boatLaunchSignalOnly: boardwalk.signatureTargetFound === true && boardwalk.signature.signature.boatLaunchSignal === true && boardwalk.signature.boatLaunchSignalOnly === true,
  noPageErrors: pageErrors.length === 0,
  noHttpErrors: httpErrors.length === 0,
  noRuntimeConsoleErrors: runtimeConsoleErrors.length === 0,
};
const report = { task: 'SW-LEVEL-001', baseUrl, homeBefore, fair, fairReplayState, boardwalk, boardwalkReplayState, homeAfter, checks, pageErrors, httpErrors, runtimeConsoleErrors, assetTransportErrors, passed: Object.values(checks).every(Boolean) };
await writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await browser.close();
for (const [name, passed] of Object.entries(checks)) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (!report.passed) process.exit(1);
