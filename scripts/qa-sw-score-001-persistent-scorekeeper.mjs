import { createServer } from 'node:http';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const candidate = path.join(root, '.sw-score-001-qa.html');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR) : path.join(root, 'qa-artifacts', 'sw-score-001');
const patches = [
  'apply-v431-source-patch.mjs','apply-v440-source-patch.mjs','apply-v441-source-patch.mjs','apply-v442-source-patch.mjs',
  'fix-v450-parser.mjs','apply-v450-source-patch.mjs','apply-v450-rampage-music-patch.mjs','apply-qa-corrections-patch.mjs',
  'apply-audio-mix-followup-patch.mjs','apply-ui-polish-followup-patch.mjs','apply-score-continuity-fix.mjs','apply-qa4-deterministic-lab-patch.mjs',
  'apply-qa4-mobile-input-fix.mjs','apply-qa4-run-lock-fix.mjs','apply-qa4-pause-forensics.mjs','apply-pause-overlay-hit-test-fix.mjs','apply-pause-overlay-hard-hide.mjs',
  'apply-qa4-popup-assertion-fix.mjs','apply-v500-campaign-patch.mjs','apply-v500-realtime-clock-fix.mjs','apply-v500-world-tour-patch.mjs',
  'apply-v500-mobile-layout-fix.mjs','apply-v500-cow-signature-patch.mjs','apply-v510-production-slice.mjs','apply-sw-game-002-moo-level.mjs',
  'apply-sw-ui-001-newspaper-presentation.mjs','apply-sw-score-001-persistent-scorekeeper.mjs'
];
const apply = (script) => execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: candidate }, stdio: 'pipe' });
const media = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.wav':'audio/wav','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png' };
const report = { task: 'SW-SCORE-001', screenshots: [], checks: {}, pageErrors: [], runtimeConsoleErrors: [], assetTransportErrors: [], passed: false };
await mkdir(outputDir, { recursive: true });
await writeFile(candidate, await readFile(source, 'utf8'), 'utf8');
patches.forEach(apply);
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
    const safe = path.resolve(root, `.${pathname === '/' ? '/.sw-score-001-qa.html' : pathname}`);
    if (!safe.startsWith(root)) throw new Error('outside root');
    const body = await readFile(safe); response.writeHead(200, { 'content-type': media[path.extname(safe)] || 'application/octet-stream' }); response.end(body);
  } catch (_) { response.writeHead(404); response.end('not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address(); const baseUrl = `http://127.0.0.1:${address.port}/.sw-score-001-qa.html?intro=0`;
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || undefined, args: ['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message));
  const consoleErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => globalThis.getScorekeeperQaState?.().marker === 'SW_SCORE_001_PERSISTENT_SCOREKEEPER_V1', null, { timeout: 15000 });
  // Re-run the inherited GAME-002 executor path in this exact scorekeeper
  // candidate before record fixtures begin. This uses the live animal update
  // loop and Moo finish wrapper rather than replacing it with score fixtures.
  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.resetProgress());
  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginEncounter());
  await page.waitForTimeout(500);
  const mooRegressionStarted = await page.evaluate(() => globalThis.getMooLevelQaState());
  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.expireEncounter());
  await page.waitForTimeout(500);
  const mooRegressionFailed = await page.evaluate(() => globalThis.getMooLevelQaState());
  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginEncounter());
  await page.waitForTimeout(500);
  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.primeEncounterSuccess());
  await page.waitForTimeout(3000);
  const mooRegressionUnlocked = await page.evaluate(() => globalThis.getMooLevelQaState());
  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginMooLevel());
  await page.waitForTimeout(650);
  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.primeMooObjectives());
  await page.waitForTimeout(1800);
  const mooRegressionCompleted = await page.evaluate(() => globalThis.getMooLevelQaState());
  await page.evaluate(() => globalThis.__SW_SCOREKEEPER_QA__.reset());
  const first = await page.evaluate(() => globalThis.__SW_SCOREKEEPER_QA__.completeNormal({ score: 1200, storm: 'tornado', campaignIndex: 0, grid: 1, chains: 2, blocks: 3, media: 1, objectives: 1 }));
  await page.waitForTimeout(120);
  const normalCampaign = await page.evaluate(() => ({ moo: globalThis.getMooLevelQaState(), campaign: JSON.parse(localStorage.getItem('severe_weather_campaign_v1') || '{}') }));
  const lower = await page.evaluate(() => globalThis.__SW_SCOREKEEPER_QA__.completeNormal({ score: 900, storm: 'tornado', campaignIndex: 0, grid: 0, chains: 1, blocks: 1, media: 0, objectives: 0 }));
  await page.waitForTimeout(120);
  const higher = await page.evaluate(() => globalThis.__SW_SCOREKEEPER_QA__.completeNormal({ score: 1500, storm: 'tornado', campaignIndex: 0, grid: 2, chains: 4, blocks: 4, media: 2, objectives: 1 }));
  await page.waitForTimeout(150);
  const highNewspaper = await page.evaluate(() => ({ state: globalThis.getScorekeeperQaState(), rail: document.getElementById('newspaperScorekeeperRail')?.innerText || '', active: document.getElementById('resultsOverlay')?.classList.contains('active'), railRect: document.getElementById('newspaperScorekeeperRail')?.getBoundingClientRect().toJSON() }));
  const shot = async (name) => { const file = path.join(outputDir, name); await page.screenshot({ path: file, fullPage: false }); report.screenshots.push(path.relative(root, file).replaceAll('\\', '/')); };
  await shot('new-personal-best-mobile.png');
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => globalThis.getScorekeeperQaState?.().marker === 'SW_SCORE_001_PERSISTENT_SCOREKEEPER_V1', null, { timeout: 15000 });
  const afterReload = await page.evaluate(() => ({ state: globalThis.getScorekeeperQaState(), raw: JSON.parse(localStorage.getItem('severe_weather_scorekeeper_v1') || '{}') }));
  const otherSite = await page.evaluate(() => globalThis.__SW_SCOREKEEPER_QA__.completeNormal({ score: 800, storm: 'supercell', campaignIndex: 1, grid: 1, chains: 1, blocks: 1, media: 1, objectives: 0 }));
  await page.waitForTimeout(120);
  const moo = await page.evaluate(() => globalThis.__SW_SCOREKEEPER_QA__.completeMoo({ score: 2100, cows: 20, airtime: 45, sponsors: 10 }));
  await page.waitForTimeout(180);
  const mooNewspaper = await page.evaluate(() => ({ state: globalThis.getScorekeeperQaState(), rail: document.getElementById('newspaperScorekeeperRail')?.innerText || '', returnVisible: getComputedStyle(document.getElementById('mooReturnButton')).display !== 'none', districtOverlayActive: document.getElementById('districtOverlay')?.classList.contains('active') === true }));
  await shot('moo-record-mobile.png');
  await page.locator('#mooReturnButton').click();
  await page.waitForTimeout(100);
  const weatherMapReturn = await page.evaluate(() => ({ menuVisible: getComputedStyle(document.getElementById('mainMenu')).display !== 'none', moo: globalThis.getMooLevelQaState() }));
  await page.evaluate(() => globalThis.__SW_SCOREKEEPER_QA__.completeNormal({ score: 700, storm: 'tornado', campaignIndex: 0 }));
  await page.waitForTimeout(100);
  await page.getByRole('button', { name: /retry county/i }).click();
  await page.waitForTimeout(100);
  const replay = await page.evaluate(() => ({ resultsActive: document.getElementById('resultsOverlay')?.classList.contains('active'), menuVisible: getComputedStyle(document.getElementById('mainMenu')).display !== 'none' }));
  await page.evaluate(() => finishRun());
  await page.waitForTimeout(80);
  await page.getByRole('button', { name: /weather map/i }).click();
  await page.waitForTimeout(100);
  const weatherMap = await page.evaluate(() => ({ resultsActive: document.getElementById('resultsOverlay')?.classList.contains('active'), menuVisible: getComputedStyle(document.getElementById('mainMenu')).display !== 'none' }));
  report.assetTransportErrors = consoleErrors.filter(message => /ERR_FILE_NOT_FOUND|Failed to load resource/.test(message));
  report.runtimeConsoleErrors = consoleErrors.filter(message => !report.assetTransportErrors.includes(message));
  report.mooRegression = { started: mooRegressionStarted, failed: mooRegressionFailed, unlocked: mooRegressionUnlocked, completed: mooRegressionCompleted };
  report.first = first; report.normalCampaign = normalCampaign; report.lower = lower; report.higher = higher; report.highNewspaper = highNewspaper; report.afterReload = afterReload; report.otherSite = otherSite; report.moo = moo; report.mooNewspaper = mooNewspaper; report.weatherMapReturn = weatherMapReturn; report.replay = replay; report.weatherMap = weatherMap;
  const reloadedLincoln = afterReload.state.buckets.find(bucket => bucket.id === 'campaign|lincoln-county|tornado')?.records?.['legacy-score-rules-v5.1.0'];
  report.checks = {
    firstRunCreatesDurableSiteModeRecord: first.isPersonalBest && first.firstRecord && first.currentBest === 1200 && first.bucket.id === 'campaign|lincoln-county|tornado',
    lowerRunDoesNotReplacePersonalBest: !lower.isPersonalBest && lower.currentBest === 1200 && lower.previousBest === 1200,
    higherRunCreatesPbWithPreviousAndMargin: higher.isPersonalBest && !higher.firstRecord && higher.previousBest === 1200 && higher.margin === 300 && higher.currentBest === 1500,
    recordsSurviveReloadRestart: reloadedLincoln?.bestScore === 1500 && reloadedLincoln?.runs === 3,
    scoringVersionIsExplicitAndPartitioned: afterReload.raw?.schemaVersion === 1 && reloadedLincoln && afterReload.raw.records['campaign|lincoln-county|tornado'].versions['legacy-score-rules-v5.1.0'].gameBuild === '5.1.0',
    siteAndVariantBucketsDoNotContaminate: otherSite.bucket.id === 'campaign|prairie-junction|supercell' && otherSite.currentBest === 800 && reloadedLincoln?.bestScore === 1500,
    mooRecordsRemainDistinct: moo.bucket.id === 'moo|moo-county-fair|bovine-score-attack' && moo.currentBest === 2100 && moo.record?.bestStats?.cows === 20 && moo.record?.bestStats?.airtime === 45,
    newspaperIsLegibleAndMotivating: highNewspaper.active && /NEW PERSONAL BEST/.test(highNewspaper.rail) && /1,200 \/ \+300/.test(highNewspaper.rail) && /NEXT/.test(highNewspaper.rail) && highNewspaper.railRect?.height > 0 && mooNewspaper.returnVisible && !mooNewspaper.districtOverlayActive,
    replayAndWeatherMapActionsWork: !replay.resultsActive && !replay.menuVisible && weatherMapReturn.menuVisible && weatherMapReturn.moo.normalCampaignMode && weatherMap.menuVisible,
    inheritedGame002AndCampaignRegression: mooRegressionStarted.executorTicks > 0 && mooRegressionFailed.encounter?.state === 'failed' && mooRegressionUnlocked.progress?.mooLevelUnlocked === true && mooRegressionCompleted.mode === 'moo' && mooRegressionCompleted.mooRun?.relocated >= 20 && mooRegressionCompleted.mooRun?.props >= 10 && mooRegressionCompleted.allMooCowsSafe === true && normalCampaign.moo.normalCampaignMode === true && normalCampaign.campaign.levels?.['lincoln-county']?.runs >= 1,
    futureMetadataIsOnlyReserved: afterReload.state.futureMetadata?.authority === 'reserved-not-active' && afterReload.state.futureMetadata?.stormTriangleVersion === null,
    noPageErrors: report.pageErrors.length === 0,
    noRuntimeConsoleErrors: report.runtimeConsoleErrors.length === 0
  };
  report.passed = Object.values(report.checks).every(Boolean);
  await context.close();
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  await rm(candidate, { force: true });
  await writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}
for (const [name, passed] of Object.entries(report.checks)) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (!report.passed) process.exitCode = 1;
