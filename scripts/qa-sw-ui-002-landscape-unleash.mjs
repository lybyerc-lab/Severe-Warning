import { createServer } from 'node:http';
import { readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const candidate = path.join(root, '.sw-ui-002-landscape-qa.html');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR) : path.join(root, 'qa-artifacts', 'sw-ui-002-landscape');
const packagedDir = path.join(outputDir, 'www');
const patches = [
  'apply-v431-source-patch.mjs',
  'apply-v440-source-patch.mjs',
  'apply-v441-source-patch.mjs',
  'apply-v442-source-patch.mjs',
  'fix-v450-parser.mjs',
  'apply-v450-source-patch.mjs',
  'apply-v450-rampage-music-patch.mjs',
  'apply-qa-corrections-patch.mjs',
  'apply-audio-mix-followup-patch.mjs',
  'apply-ui-polish-followup-patch.mjs',
  'apply-score-continuity-fix.mjs',
  'apply-qa4-deterministic-lab-patch.mjs',
  'apply-qa4-mobile-input-fix.mjs',
  'apply-qa4-run-lock-fix.mjs',
  'apply-qa4-pause-forensics.mjs',
  'apply-pause-overlay-hit-test-fix.mjs',
  'apply-pause-overlay-hard-hide.mjs',
  'apply-qa4-popup-assertion-fix.mjs',
  'apply-qa4-rampage-popup-fix.mjs',
  'apply-v500-campaign-patch.mjs',
  'apply-v500-realtime-clock-fix.mjs',
  'apply-v500-world-tour-patch.mjs',
  'apply-v500-mobile-layout-fix.mjs',
  'apply-v500-cow-signature-patch.mjs',
  'apply-v510-production-slice.mjs',
  'apply-modernization-phase2-clocks.mjs',
  'apply-phase2-player-forensics-guard.mjs',
  'apply-modernization-phase3-input-abilities.mjs',
  'apply-modernization-phase4-scoring-campaign.mjs',
  'apply-modernization-phase5-presentation-world.mjs',
  'apply-modernization-phase6-performance.mjs',
  'apply-city-fabric-destruction.mjs',
  'apply-presentation-identity-moo-brew.mjs',
  'apply-threejs-asset-pipeline.mjs',
  'apply-threejs-visual-foundation.mjs',
  'apply-threejs-hero-slice4.mjs',
  'apply-threejs-hero-slice5.mjs',
  'apply-threejs-hero-slice6.mjs',
  'apply-sw-game-002-moo-level.mjs',
  'apply-sw-ui-001-newspaper-presentation.mjs',
  'apply-sw-score-001-persistent-scorekeeper.mjs',
  'apply-sw-rpg-001-moolah-storm-triangle.mjs',
  'apply-sw-rpg-002-slingshot.mjs',
  'apply-sw-level-001-storm-site-framework.mjs',
  'apply-sw-ui-002-landscape-unleash.mjs',
];
const apply = (script) => execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: candidate }, stdio: 'pipe' });
const media = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.wav':'audio/wav','.woff2':'font/woff2','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png' };
const report = { task:'SW-UI-002', fixture:'packaged-web-bundle', viewport:{ width:844, height:390 }, screenshots:[], checks:{}, pageErrors:[], runtimeConsoleErrors:[], assetTransportErrors:[], http404Paths:[], passed:false };

await mkdir(outputDir, { recursive:true });
await writeFile(candidate, await readFile(source, 'utf8'), 'utf8');
patches.forEach(apply);
execFileSync(process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'], { cwd: root, stdio:'pipe' });
execFileSync(process.execPath, [path.join(root, 'scripts', 'build-web.mjs')], {
  cwd: root,
  env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH:candidate, SEVERE_WEATHER_WWW_DIR:packagedDir },
  stdio:'pipe'
});

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
  try {
    const safe = path.resolve(packagedDir, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!safe.startsWith(packagedDir)) throw new Error('outside packaged root');
    const body = await readFile(safe);
    response.writeHead(200, { 'content-type':media[path.extname(safe)] || 'application/octet-stream', 'cache-control':'no-store' });
    response.end(body);
  } catch (_) {
    report.http404Paths.push(pathname);
    response.writeHead(404);
    response.end('not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}/?intro=0`;
let browser;

try {
  browser = await chromium.launch({ headless:true, executablePath:process.env.CHROME_BIN || undefined, args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport:{ width:844, height:390 }, screen:{ width:844, height:390 }, isMobile:true, hasTouch:true, deviceScaleFactor:1, serviceWorkers:'block' });
  const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message));
  const consoleErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });

  await page.goto(baseUrl, { waitUntil:'networkidle', timeout:60000 });
  await page.waitForFunction(() => globalThis.getLandscapeUnleashQaState?.().marker === 'SW_UI_002_LANDSCAPE_UNLEASH_V1', null, { timeout:15000 });
  await page.waitForFunction(() => globalThis.getNewspaperPresentationQaState?.().marker === 'SW_UI_001_NEWSPAPER_PRESENTATION_V1', null, { timeout:15000 });

  const shot = async (name) => {
    const file = path.join(outputDir, name);
    await page.screenshot({ path:file, fullPage:false });
    report.screenshots.push(path.relative(root, file).replaceAll('\\','/'));
  };

  report.initial = await page.evaluate(() => ({ correction:globalThis.getLandscapeUnleashQaState(), newspaper:globalThis.getNewspaperPresentationQaState() }));
  await shot('landscape-before-scroll.png');

  const card = page.locator('#mainMenu .menu-card.newspaper-front-page');
  const cardBox = await card.boundingBox();
  if (!cardBox) throw new Error('Newspaper card has no landscape bounding box.');
  const cdp = await context.newCDPSession(page);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const state = await page.evaluate(() => globalThis.getLandscapeUnleashQaState());
    if (state.launchWithinVisualViewport) break;
    const x = Math.round(cardBox.x + cardBox.width * 0.78);
    const startY = Math.round(Math.min(cardBox.y + cardBox.height - 28, 360));
    const endY = Math.round(Math.max(cardBox.y + 30, 28));
    await cdp.send('Input.dispatchTouchEvent', { type:'touchStart', touchPoints:[{ x, y:startY, radiusX:8, radiusY:8, force:1 }] });
    for (let step = 1; step <= 5; step += 1) {
      const y = Math.round(startY + (endY - startY) * (step / 5));
      await cdp.send('Input.dispatchTouchEvent', { type:'touchMove', touchPoints:[{ x, y, radiusX:8, radiusY:8, force:1 }] });
      await page.waitForTimeout(30);
    }
    await cdp.send('Input.dispatchTouchEvent', { type:'touchEnd', touchPoints:[] });
    await page.waitForTimeout(120);
  }

  report.afterTouchScroll = await page.evaluate(() => globalThis.getLandscapeUnleashQaState());
  await shot('landscape-launch-reached.png');

  await page.locator('#btnStartMenu').click({ timeout:15000 });
  await page.waitForFunction(() => {
    const cinematic = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.();
    return Boolean(cinematic?.active && cinematic?.gameStarted && cinematic?.startCount >= 1);
  }, null, { timeout:15000 });
  report.afterLaunch = await page.evaluate(() => ({
    cinematic:globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.() || null,
    menuHidden:document.getElementById('mainMenu')?.classList.contains('hidden') || getComputedStyle(document.getElementById('mainMenu')).display === 'none'
  }));

  report.assetTransportErrors = [
    ...consoleErrors.filter(message => /ERR_FILE_NOT_FOUND|Failed to load resource|404 \(Not Found\)/.test(message)),
    ...report.http404Paths.map(pathname => `HTTP 404 ${pathname}`)
  ];
  report.runtimeConsoleErrors = consoleErrors.filter(message => !/ERR_FILE_NOT_FOUND|Failed to load resource|404 \(Not Found\)/.test(message));
  const initialCorrection = report.initial.correction;
  const after = report.afterTouchScroll;
  const cinematic = report.afterLaunch.cinematic;
  report.checks = {
    exactCorrectionRuntime: initialCorrection.marker === 'SW_UI_002_LANDSCAPE_UNLEASH_V1',
    inheritedNewspaperRuntime: report.initial.newspaper.marker === 'SW_UI_001_NEWSPAPER_PRESENTATION_V1',
    landscapeUsesScrollablePaper: ['auto','scroll'].includes(initialCorrection.overflowY) && initialCorrection.scrollHeight > initialCorrection.clientHeight,
    touchGestureMovesPaper: after.scrollTop > initialCorrection.scrollTop,
    launchReachableAfterTouchScroll: after.launchWithinVisualViewport === true,
    realLaunchButtonStartsExistingFlow: Boolean(cinematic?.active && cinematic?.gameStarted && cinematic?.startCount >= 1 && cinematic?.runActive === false),
    menuLeavesSelectionSurface: report.afterLaunch.menuHidden === true,
    noPageErrors: report.pageErrors.length === 0,
    noRuntimeConsoleErrors: report.runtimeConsoleErrors.length === 0,
    noAssetTransportErrors: report.assetTransportErrors.length === 0,
  };
  report.passed = Object.values(report.checks).every(Boolean);
  await context.close();
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  await rm(candidate, { force:true });
  await writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

for (const [name, passed] of Object.entries(report.checks)) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (report.assetTransportErrors.length) console.log(`ASSET_ERRORS ${JSON.stringify(report.assetTransportErrors)}`);
if (!report.passed) process.exitCode = 1;