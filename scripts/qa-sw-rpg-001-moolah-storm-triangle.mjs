import { createServer } from 'node:http';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const candidate = path.join(root, '.sw-rpg-001-qa.html');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR) : path.join(root, 'qa-artifacts', 'sw-rpg-001');
const patches = [
  'apply-v431-source-patch.mjs','apply-v440-source-patch.mjs','apply-v441-source-patch.mjs','apply-v442-source-patch.mjs',
  'fix-v450-parser.mjs','apply-v450-source-patch.mjs','apply-v450-rampage-music-patch.mjs','apply-qa-corrections-patch.mjs',
  'apply-audio-mix-followup-patch.mjs','apply-ui-polish-followup-patch.mjs','apply-score-continuity-fix.mjs','apply-qa4-deterministic-lab-patch.mjs',
  'apply-qa4-mobile-input-fix.mjs','apply-qa4-run-lock-fix.mjs','apply-qa4-pause-forensics.mjs','apply-pause-overlay-hit-test-fix.mjs',
  'apply-pause-overlay-hard-hide.mjs','apply-qa4-popup-assertion-fix.mjs','apply-v500-campaign-patch.mjs','apply-v500-realtime-clock-fix.mjs',
  'apply-v500-world-tour-patch.mjs','apply-v500-mobile-layout-fix.mjs','apply-v500-cow-signature-patch.mjs','apply-v510-production-slice.mjs',
  'apply-sw-game-002-moo-level.mjs','apply-sw-ui-001-newspaper-presentation.mjs','apply-sw-score-001-persistent-scorekeeper.mjs','apply-sw-rpg-001-moolah-storm-triangle.mjs'
];
const apply = script => execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: candidate }, stdio: 'pipe' });
const media = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.wav':'audio/wav','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png' };
const report = { task: 'SW-RPG-001', screenshots: [], checks: {}, pageErrors: [], runtimeConsoleErrors: [], assetTransportErrors: [], passed: false };

await mkdir(outputDir, { recursive: true });
await writeFile(candidate, await readFile(source, 'utf8'), 'utf8');
patches.forEach(apply);
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
    const safe = path.resolve(root, `.${pathname === '/' ? '/.sw-rpg-001-qa.html' : pathname}`);
    if (!safe.startsWith(root)) throw new Error('outside root');
    const body = await readFile(safe); response.writeHead(200, { 'content-type': media[path.extname(safe)] || 'application/octet-stream' }); response.end(body);
  } catch (_) { response.writeHead(404); response.end('not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address(); const baseUrl = `http://127.0.0.1:${address.port}/.sw-rpg-001-qa.html?intro=0`;
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || undefined, args: ['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message));
  const consoleErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => globalThis.getSwRpgQaState?.().marker === 'SW_RPG_001_MOOLAH_STORM_TRIANGLE_V1', null, { timeout: 15000 });
  await page.evaluate(() => { globalThis.__SW_SCOREKEEPER_QA__.reset(); globalThis.__SW_RPG_001_QA__.reset(); });
  const baseline = await page.evaluate(() => {
    const target = targets.find(item => !item.destroyed && !item.isCow && item.cowId !== 17);
    currentStorm = 'tornado'; storm.pos.x = target.x; storm.pos.z = target.z; runActive = true;
    cooldowns.primary.current = 0; triggerAbility('primary'); const pullTimer = pullVortexTimer;
    activePullVortex = false; pullVortexTimer = 0; cooldowns.secondary.current = 0; target.health = 1000; target.destroyed = false;
    const beforeHealth = target.health; triggerAbility('secondary'); const gustDamage = beforeHealth - target.health;
    const poles = Array.from({ length: 12 }, (_, networkIndex) => ({ x: networkIndex * 70, z: 0, networkGroup: 'qa-main', networkIndex }));
    const gridNodes = selectGridZapTopology(poles, { stormX: 0, stormZ: 0, acquisitionRadius: 8, maxHopDistance: 80, maxNodes: 8 }).length;
    return { pullTimer, gustDamage, gridNodes, targetDamage: GRID_ZAP_TARGET_DAMAGE, state: globalThis.getSwRpgQaState() };
  });
  const first = await page.evaluate(() => globalThis.__SW_SCOREKEEPER_QA__.completeNormal({ score: 10000, storm: 'tornado', campaignIndex: 0 }));
  const second = await page.evaluate(() => globalThis.__SW_SCOREKEEPER_QA__.completeNormal({ score: 10000, storm: 'tornado', campaignIndex: 0 }));
  const third = await page.evaluate(() => globalThis.__SW_SCOREKEEPER_QA__.completeNormal({ score: 10000, storm: 'tornado', campaignIndex: 0 }));
  await page.waitForTimeout(120);
  const funded = await page.evaluate(() => globalThis.getSwRpgQaState());
  for (const key of ['pull', 'gust', 'gridZap']) await page.locator(`#swRpgPurchase-${key}`).click();
  await page.waitForTimeout(120);
  const purchased = await page.evaluate(() => {
    const target = targets.find(item => !item.destroyed && !item.isCow && item.cowId !== 17);
    currentStorm = 'tornado'; storm.pos.x = target.x; storm.pos.z = target.z; runActive = true;
    cooldowns.primary.current = 0; triggerAbility('primary'); const pullTimer = pullVortexTimer;
    activePullVortex = false; pullVortexTimer = 0; cooldowns.secondary.current = 0; target.health = 1000; target.destroyed = false;
    const beforeHealth = target.health; triggerAbility('secondary'); const gustDamage = beforeHealth - target.health;
    const poles = Array.from({ length: 12 }, (_, networkIndex) => ({ x: networkIndex * 70, z: 0, networkGroup: 'qa-main', networkIndex }));
    const gridNodes = selectGridZapTopology(poles, { stormX: 0, stormZ: 0, acquisitionRadius: 8, maxHopDistance: 80, maxNodes: 8 }).length;
    return { pullTimer, gustDamage, gridNodes, targetDamage: GRID_ZAP_TARGET_DAMAGE, state: globalThis.getSwRpgQaState(), rail: document.getElementById('swRpgRewardsRail')?.innerText || '' };
  });
  const shot = async name => { const file = path.join(outputDir, name); await page.screenshot({ path: file, fullPage: false }); report.screenshots.push(path.relative(root, file).replaceAll('\\', '/')); };
  await shot('moolah-reward-and-upgrades-mobile.png');
  const metadataRun = await page.evaluate(() => globalThis.__SW_SCOREKEEPER_QA__.completeNormal({ score: 2000, storm: 'tornado', campaignIndex: 0 }));
  await page.waitForTimeout(100);
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => globalThis.getSwRpgQaState?.().marker === 'SW_RPG_001_MOOLAH_STORM_TRIANGLE_V1', null, { timeout: 15000 });
  const reloaded = await page.evaluate(() => ({ rpg: globalThis.getSwRpgQaState(), raw: JSON.parse(localStorage.getItem('severe_weather_moolah_v1') || '{}'), score: globalThis.getScorekeeperQaState() }));
  report.assetTransportErrors = consoleErrors.filter(message => /ERR_FILE_NOT_FOUND|Failed to load resource/.test(message));
  report.runtimeConsoleErrors = consoleErrors.filter(message => !report.assetTransportErrors.includes(message));
  report.baseline = baseline; report.first = first; report.second = second; report.third = third; report.funded = funded; report.purchased = purchased; report.metadataRun = metadataRun; report.reloaded = reloaded;
  const metadata = metadataRun?.build?.futureMetadata;
  report.checks = {
    moolahEarnsOnlyFromAcceptedFinalResults: first?.score === 10000 && second?.score === 10000 && third?.score === 10000 && funded.earned === 300 && funded.moolah === 300 && funded.lastReward?.amount === 100,
    baselineValuesStayExact: baseline.pullTimer === 2.5 && baseline.gustDamage === 90 && baseline.gridNodes === 8 && baseline.targetDamage === 135,
    purchasesUseVisibleMoolahAndPersistThreeBoundedUpgrades: purchased.state.upgrades.pull === 1 && purchased.state.upgrades.gust === 1 && purchased.state.upgrades.gridZap === 1 && purchased.state.spent === 225 && purchased.state.moolah === 75,
    upgradedEffectsAreExactAndGridDamageIsUntuned: purchased.pullTimer === 3.25 && purchased.gustDamage === 115 && purchased.gridNodes === 10 && purchased.targetDamage === 135,
    stormTriangleHasExactlyThreeExistingActiveSlots: purchased.state.stormTriangle.version === 'storm-triangle-v1' && purchased.state.stormTriangle.slots.join('|') === 'pull|gust|gridZap',
    scorekeeperCapturesActiveBuildIdentity: metadata?.authority === 'active-local-first' && metadata?.stormTriangleVersion === 'storm-triangle-v1' && metadata?.upgradeLoadoutVersion === 'moolah-upgrades-v1' && metadata?.upgrades?.gridZap === 1,
    reloadPreservesWalletPurchasesAndSchema: reloaded.raw?.schemaVersion === 1 && reloaded.rpg.moolah === 95 && reloaded.rpg.upgrades.pull === 1 && reloaded.rpg.upgrades.gust === 1 && reloaded.rpg.upgrades.gridZap === 1 && reloaded.rpg.stormTriangle.slots.length === 3,
    newspaperRewardAndPurchaseRailIsLegible: /MOO-LAH DESK/.test(purchased.rail) && /STORM TRIANGLE/.test(purchased.rail) && /FILED/.test(purchased.rail),
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
