import { createServer } from 'node:http';
import { readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const candidate = path.join(root, '.sw-polish-001-qa.html');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR) : path.join(root, 'qa-artifacts', 'sw-polish-001');
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
  'apply-sw-polish-001-quality-rescue.mjs',
];
const apply = (script) => execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: candidate }, stdio: 'pipe' });
const media = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.wav':'audio/wav','.woff2':'font/woff2','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png' };
const report = {
  task:'SW-POLISH-001', fixture:'packaged-web-bundle', viewport:{ width:844, height:390 },
  screenshots:[], checks:{}, pageErrors:[], runtimeConsoleErrors:[], assetTransportErrors:[], http404Paths:[], passed:false,
};

const motionDelta = (a, b) => {
  if (!a || !b) return 0;
  return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)+Math.abs(a.z-b.z)+Math.abs(a.rx-b.rx)+Math.abs(a.ry-b.ry)+Math.abs(a.rz-b.rz);
};

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
  const consoleErrors = [];
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });

  const shot = async (name) => {
    const file = path.join(outputDir, name);
    await page.screenshot({ path:file, fullPage:false });
    report.screenshots.push(path.relative(root, file).replaceAll('\\','/'));
  };

  await page.goto(baseUrl, { waitUntil:'networkidle', timeout:60000 });
  await page.waitForFunction(() => globalThis.getSwPolish001QaState?.().marker === 'SW_POLISH_001_QUALITY_RESCUE_V1', null, { timeout:15000 });
  await page.waitForFunction(() => globalThis.getLandscapeUnleashQaState?.().marker === 'SW_UI_002_LANDSCAPE_UNLEASH_V1', null, { timeout:15000 });
  await page.waitForFunction(() => globalThis.getNewspaperPresentationQaState?.().marker === 'SW_UI_001_NEWSPAPER_PRESENTATION_V1', null, { timeout:15000 });

  report.newspaperInitial = await page.evaluate(() => globalThis.getSwPolish001QaState().newspaper);
  await shot('01-newspaper-large-phone-landscape.png');
  await page.locator('#btnStartMenu').click({ timeout:15000 });
  await page.waitForFunction(() => Boolean(globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.()?.active), null, { timeout:15000 });

  const seekShot = async (seconds, name) => {
    await page.evaluate((value) => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.debugSeek(value), seconds);
    await page.waitForTimeout(100);
    await shot(name);
    return page.evaluate(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.getSnapshot());
  };
  report.cinematicEarly = await seekShot(0.65, '02-cinematic-location-slug.png');
  report.cinematicActing = await seekShot(6.6, '03-cinematic-double-take.png');
  report.cinematicStorm = await seekShot(10.9, '04-cinematic-storm-reveal.png');

  const preHandoff = await page.evaluate(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.getSnapshot());
  await page.evaluate(() => {
    const api = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__;
    api.debugSeek(api.duration - 0.02);
    api.frame(performance.now(), 0.1);
  });
  await page.waitForFunction(() => {
    const state = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.();
    return Boolean(state && !state.active && state.runActive && state.handoffCount >= 1);
  }, null, { timeout:15000 });
  report.afterHandoff = await page.evaluate(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.getSnapshot());

  await page.evaluate(() => globalThis.__SW_POLISH_001_QA__.setStormReviewCamera());
  report.stormSamples = [];
  const stormTimes = [1.0, 1.75, 2.5];
  for (let index = 0; index < stormTimes.length; index += 1) {
    const seconds = stormTimes[index];
    report.stormSamples.push(await page.evaluate((value) => globalThis.__SW_POLISH_001_QA__.sampleStormAt(value), seconds));
    await page.waitForTimeout(60);
    await shot(`0${5 + index}-tornado-whole-body-t${index + 1}.png`);
  }

  const launchSiteAndCapture = async (siteId, screenshot) => {
    await page.evaluate((id) => globalThis.__SW_STORM_SITE_QA__.launch(id), siteId);
    await page.waitForFunction((id) => {
      const state = globalThis.getStormSiteQaState?.();
      const polish = globalThis.getSwPolish001QaState?.();
      const opening = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.();
      return state?.selectedSiteId === id
        && state?.stormSiteWorldAttached
        && polish?.site?.profile?.includes(id === 'county-fair' ? 'county-fair' : 'coastal-boardwalk')
        && opening?.active === false;
    }, siteId, { timeout:15000 });
    await page.waitForFunction(() => !document.getElementById('districtOverlay')?.classList.contains('active'), null, { timeout:7000 }).catch(() => {});
    await page.evaluate(() => {
      globalThis.productionQaPrepared = true;
      globalThis.__SW_POLISH_001_QA__.setTargetsVisible(false);
      globalThis.__SW_POLISH_001_QA__.setSiteReviewCamera();
    });
    await page.waitForTimeout(160);
    await shot(screenshot);
    const state = await page.evaluate(() => ({
      site:globalThis.getSwPolish001QaState().site,
      accepted:globalThis.getStormSiteQaState(),
      opening:globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.getSnapshot(),
    }));
    await page.evaluate(() => {
      globalThis.__SW_POLISH_001_QA__.setTargetsVisible(true);
      globalThis.productionQaPrepared = false;
    });
    return state;
  };

  report.fair = await launchSiteAndCapture('county-fair', '08-site-county-fair-no-targets.png');
  report.coastal = await launchSiteAndCapture('coastal-boardwalk', '09-site-coastal-no-targets.png');

  report.assetTransportErrors = [
    ...consoleErrors.filter(message => /ERR_FILE_NOT_FOUND|Failed to load resource|404 \(Not Found\)/.test(message)),
    ...report.http404Paths.map(pathname => `HTTP 404 ${pathname}`)
  ];
  report.runtimeConsoleErrors = consoleErrors.filter(message => !/ERR_FILE_NOT_FOUND|Failed to load resource|404 \(Not Found\)/.test(message));

  const s0 = report.stormSamples[0];
  const s1 = report.stormSamples[1];
  const s2 = report.stormSamples[2];
  const lowerMotion = Math.max(motionDelta(s0.lower, s1.lower), motionDelta(s1.lower, s2.lower));
  const bodyMotion = Math.max(motionDelta(s0.body, s1.body), motionDelta(s1.body, s2.body));
  const upperMotion = Math.max(motionDelta(s0.upper, s1.upper), motionDelta(s1.upper, s2.upper));
  const helixMotion = Math.max(motionDelta(s0.helix, s1.helix), motionDelta(s1.helix, s2.helix));

  report.checks = {
    correctionRuntimePresent: report.newspaperInitial.cardExists === true,
    newspaperFitsVisualViewport: report.newspaperInitial.cardHeight <= report.newspaperInitial.visualHeight + 1,
    newspaperFitsWithoutInternalScroll: report.newspaperInitial.cardScrollHeight <= report.newspaperInitial.cardClientHeight + 2,
    newspaperLaunchVisibleWithoutScroll: report.newspaperInitial.launchWithinVisualViewport === true,
    newspaperNoVisibleTinyLeafText: report.newspaperInitial.visibleTinyTextCount === 0,
    newspaperDenseStormBodyCopyRemovedOnShortLandscape: report.newspaperInitial.stormBodyDisplay === 'none',
    cinematicPresentationActive: report.cinematicEarly.polish001?.overlayActive === true && report.cinematicEarly.polish001?.lightCount >= 2 && report.cinematicEarly.polish001?.dustMotes >= 30,
    cinematicFarmSetActive: report.cinematicEarly.polish001?.farmApronPresent === true,
    cinematicActorStyleActive: report.cinematicEarly.polish001?.actorStyled === true,
    cinematicPrototypeNewspaperSuppressed: report.cinematicEarly.polish001?.originalNewspaperVisible === false,
    cinematicDebugBadgeSuppressed: report.cinematicEarly.polish001?.productionBadgeVisible === false,
    cinematicBroadcastBugSuppressed: report.cinematicEarly.polish001?.broadcastBugVisible === false,
    cinematicAcceptedActingStillPresent: Boolean(report.cinematicActing.actors?.cow17 && report.cinematicActing.gameStarted && report.cinematicActing.runActive === false),
    cinematicProductionStormStillUsed: report.cinematicStorm.stormRevealUsesProductionStorm === true,
    cinematicNaturalHandoffPreserved: preHandoff.active === true && report.afterHandoff.active === false && report.afterHandoff.runActive === true && report.afterHandoff.handoffCount >= 1,
    tornadoLowerCirculationMoves: lowerMotion > 0.18,
    tornadoBodyCirculationMoves: bodyMotion > 0.45,
    tornadoUpperCirculationMoves: upperMotion > 0.65,
    tornadoHelixCirculationMoves: helixMotion > 0.25,
    tornadoHelixVeilsPresent: s2.helixCount >= 5,
    tornadoHiddenStructuralShellLawPreserved: s2.hiddenStructuralShells >= 3,
    countyFairIdentityAttached: report.fair.site.fairAttached === true && report.fair.site.fairIdentityObjects >= 40,
    coastalIdentityAttached: report.coastal.site.coastalAttached === true && report.coastal.site.coastalIdentityObjects >= 30,
    siteProfilesDistinct: report.fair.site.profile !== report.coastal.site.profile,
    stormSitesDoNotReplayHeartlandOpening: report.fair.opening.active === false && report.coastal.opening.active === false && report.coastal.site.openingBypasses >= 2,
    acceptedSiteAuthorityPreserved: report.fair.accepted.selectedSiteId === 'county-fair' && report.coastal.accepted.selectedSiteId === 'coastal-boardwalk' && report.fair.accepted.targetCount > 0 && report.coastal.accepted.targetCount > 0,
    noPageErrors: report.pageErrors.length === 0,
    noRuntimeConsoleErrors: report.runtimeConsoleErrors.length === 0,
    noAssetTransportErrors: report.assetTransportErrors.length === 0,
  };
  report.motion = { lowerMotion, bodyMotion, upperMotion, helixMotion };
  report.passed = Object.values(report.checks).every(Boolean);
  await context.close();
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  await rm(candidate, { force:true });
  await writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

for (const [name, passed] of Object.entries(report.checks)) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
console.log(`MOTION ${JSON.stringify(report.motion || {})}`);
if (report.runtimeConsoleErrors.length) console.log(`RUNTIME_ERRORS ${JSON.stringify(report.runtimeConsoleErrors)}`);
if (report.assetTransportErrors.length) console.log(`ASSET_ERRORS ${JSON.stringify(report.assetTransportErrors)}`);
if (!report.passed) process.exitCode = 1;
