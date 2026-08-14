import { createServer } from 'node:http';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const candidate = path.join(root, '.sw-rpg-002-qa.html');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR) : path.join(root, 'qa-artifacts', 'sw-rpg-002');
const patches = [
  'apply-v431-source-patch.mjs','apply-v440-source-patch.mjs','apply-v441-source-patch.mjs','apply-v442-source-patch.mjs','fix-v450-parser.mjs','apply-v450-source-patch.mjs','apply-v450-rampage-music-patch.mjs','apply-qa-corrections-patch.mjs','apply-audio-mix-followup-patch.mjs','apply-ui-polish-followup-patch.mjs','apply-score-continuity-fix.mjs','apply-qa4-deterministic-lab-patch.mjs','apply-qa4-mobile-input-fix.mjs','apply-qa4-run-lock-fix.mjs','apply-qa4-pause-forensics.mjs','apply-pause-overlay-hit-test-fix.mjs','apply-pause-overlay-hard-hide.mjs','apply-qa4-popup-assertion-fix.mjs','apply-v500-campaign-patch.mjs','apply-v500-realtime-clock-fix.mjs','apply-v500-world-tour-patch.mjs','apply-v500-mobile-layout-fix.mjs','apply-v500-cow-signature-patch.mjs','apply-v510-production-slice.mjs','apply-sw-game-002-moo-level.mjs','apply-sw-ui-001-newspaper-presentation.mjs','apply-sw-score-001-persistent-scorekeeper.mjs','apply-sw-rpg-001-moolah-storm-triangle.mjs','apply-sw-rpg-002-slingshot.mjs'
];
const apply = script => execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: candidate }, stdio: 'pipe' });
const media = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.wav':'audio/wav','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png' };
const report = { task: 'SW-RPG-002', screenshots: [], checks: {}, pageErrors: [], runtimeConsoleErrors: [], assetTransportErrors: [], passed: false };
await mkdir(outputDir, { recursive: true }); await writeFile(candidate, await readFile(source, 'utf8'), 'utf8'); patches.forEach(apply);
const server = createServer(async (request, response) => {
  try { const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname); const safe = path.resolve(root, `.${pathname === '/' ? '/.sw-rpg-002-qa.html' : pathname}`); if (!safe.startsWith(root)) throw new Error('outside root'); const body = await readFile(safe); response.writeHead(200, { 'content-type': media[path.extname(safe)] || 'application/octet-stream' }); response.end(body); } catch (_) { response.writeHead(404); response.end('not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address(); const baseUrl = `http://127.0.0.1:${address.port}/.sw-rpg-002-qa.html?intro=0`;
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN || undefined, args: ['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message)); const consoleErrors = []; page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 }); await page.waitForFunction(() => globalThis.getSwSlingshotQaState?.().marker === 'SW_RPG_002_SLINGSHOT_V1', null, { timeout: 15000 });
  const ordinaryPull = await page.evaluate(async () => {
    const target = targets.find(item => !item.destroyed && !item.isCow && item.cowId !== 17); currentStorm = 'tornado'; runActive = true; storm.pos.set(0, terrainHeightAt(0, -24), -24); target.x = storm.radius * 2.1; target.z = -24; target.health = 1000; target.meshData.group.position.set(target.x, terrainHeightAt(target.x, target.z), target.z); cooldowns.primary.current = 0; triggerAbility('primary'); const state = globalThis.getSwSlingshotQaState(); const vortex = activePullVortex; const pullTimer = pullVortexTimer; activePullVortex = false; pullVortexTimer = 0; globalThis.__SW_RPG_002_QA__.reset(); return { pullActive: vortex, pullTimer, launches: state.telemetry.launches };
  });
  const ordinaryGust = await page.evaluate(() => {
    const target = targets.find(item => !item.destroyed && !item.isCow && item.cowId !== 17); target.x = 0; target.z = -46; target.health = 1000; target.meshData.group.position.set(target.x, terrainHeightAt(target.x, target.z), target.z); storm.pos.set(0, terrainHeightAt(0, -46), -46); cooldowns.secondary.current = 0; const before = target.health; triggerAbility('secondary'); return { damage: before - target.health, launches: globalThis.getSwSlingshotQaState().telemetry.launches };
  });
  const synergy = await page.evaluate(async () => {
    globalThis.__SW_RPG_002_QA__.reset(); currentStorm = 'tornado'; runActive = true; storm.radius = 10; const selected = targets.filter(item => !item.destroyed && !item.isCow && item.cowId !== 17).slice(0, 10); selected.forEach((target, index) => { target.destroyed = false; target.health = 1000; target.x = 600 + index * 30; target.z = 600; target.meshData.group.position.set(target.x, terrainHeightAt(target.x, target.z), target.z); });
    const place = (target, x, z, footprint) => { target.destroyed = false; target.health = 1000; target.x = x; target.z = z; target.meshData.footprint = footprint; target.meshData.group.position.set(x, terrainHeightAt(x, z), z); };
    const [light, lightEast, lightWest, lightNorth, lightSouth, heavy, heavyEast, heavyWest, heavyNorth, heavySouth] = selected; place(light, 7, 0, 4);
    storm.pos.set(-2, terrainHeightAt(-2, 0), 0); await new Promise(resolve => setTimeout(resolve, 100)); storm.pos.set(0, terrainHeightAt(0, 0), 0); cooldowns.primary.current = 0; triggerAbility('primary'); await new Promise(resolve => setTimeout(resolve, 650)); const captured = globalThis.getSwSlingshotQaState(); cooldowns.secondary.current = 0; triggerAbility('secondary'); const launchedLight = globalThis.getSwSlingshotQaState(); const lightAim = launchedLight.telemetry.lastLaunch.aim; const lightBody = launchedLight.bodies[0]; place(lightEast, lightBody.x + lightAim.x * 44, lightBody.z + lightAim.z * 44, 6); const lightFrame = performance.now(); for (let frame = 1; frame <= 6; frame++) animate(lightFrame + frame * 100); const lightResult = globalThis.getSwSlingshotQaState();
    place(heavy, 7, 24, 20); place(heavyEast, 72, 24, 7); place(heavyWest, -72, 24, 7); place(heavyNorth, 0, -48, 7); place(heavySouth, 0, 96, 7); storm.pos.set(-2, terrainHeightAt(-2, 24), 24); await new Promise(resolve => setTimeout(resolve, 100)); storm.pos.set(0, terrainHeightAt(0, 24), 24); cooldowns.primary.current = 0; triggerAbility('primary'); await new Promise(resolve => setTimeout(resolve, 650)); cooldowns.secondary.current = 0; triggerAbility('secondary'); const launchedHeavy = globalThis.getSwSlingshotQaState(); await new Promise(resolve => setTimeout(resolve, 1750)); const completed = globalThis.getSwSlingshotQaState();
    return { captured, launchedLight, lightResult, launchedHeavy, completed };
  });
  const shot = async name => { const file = path.join(outputDir, name); await page.screenshot({ path: file, fullPage: false }); report.screenshots.push(path.relative(root, file).replaceAll('\\', '/')); }; await shot('slingshot-impact-mobile.png');
  const scorekeeper = await page.evaluate(() => globalThis.__SW_SCOREKEEPER_QA__.completeNormal({ score: 1200, storm: 'tornado', campaignIndex: 0 })); await page.waitForTimeout(100);
  report.assetTransportErrors = consoleErrors.filter(message => /ERR_FILE_NOT_FOUND|Failed to load resource/.test(message)); report.runtimeConsoleErrors = consoleErrors.filter(message => !report.assetTransportErrors.includes(message)); report.ordinaryPull = ordinaryPull; report.ordinaryGust = ordinaryGust; report.synergy = synergy; report.scorekeeper = scorekeeper;
  const finalTelemetry = synergy.completed.telemetry; const lightLaunch = synergy.launchedLight.telemetry.lastLaunch; const heavyLaunch = synergy.launchedHeavy.telemetry.lastLaunch; const metadata = scorekeeper?.build?.futureMetadata?.slingshot;
  report.checks = {
    ordinaryPullRemainsLiveAndDoesNotLaunch: ordinaryPull.pullActive && ordinaryPull.pullTimer === 2.5 && ordinaryPull.launches === 0,
    ordinaryGustRemainsLiveAndDoesNotLaunch: ordinaryGust.damage === 90 && ordinaryGust.launches === 0,
    pullCaptureGustLaunchTravelAndPhysicalImpact: synergy.captured.held && synergy.launchedLight.telemetry.launches === 1 && finalTelemetry.impacts >= 1 && finalTelemetry.bestDistance >= 35,
    lightAndHeavyObjectsHaveMateriallyDifferentLaunches: Boolean(lightLaunch && heavyLaunch && lightLaunch.mass < heavyLaunch.mass && lightLaunch.speed > heavyLaunch.speed),
    telemetryFlowsIntoAcceptedScorekeeperMetadata: metadata?.version === 'slingshot-v1' && metadata.launches === 2 && metadata.impacts >= 1 && metadata.bestDistance >= 35,
    noPageErrors: report.pageErrors.length === 0,
    noRuntimeConsoleErrors: report.runtimeConsoleErrors.length === 0
  };
  report.passed = Object.values(report.checks).every(Boolean); await context.close();
} finally { if (browser) await browser.close(); await new Promise(resolve => server.close(resolve)); await rm(candidate, { force: true }); await writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8'); }
for (const [name, passed] of Object.entries(report.checks)) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`); if (!report.passed) process.exitCode = 1;
