import { createServer } from 'node:http';
import { readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const candidate = path.join(root, '.sw-ui-003-run-shell-qa.html');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR) : path.join(root, 'qa-artifacts', 'sw-ui-003-run-shell');
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
  'apply-sw-quality-001-owner-playtest-rescue.mjs',
  'apply-sw-quality-002-visual-rescue.mjs',
  'apply-sw-quality-002-storm-frame-bridge.mjs',
  'apply-sw-ui-003-run-shell-identity.mjs',
];

const apply = (script) => execFileSync(process.execPath, [path.join(root, 'scripts', script)], {
  cwd: root,
  env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: candidate },
  stdio: 'pipe'
});

const media = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

const report = {
  task: 'SW-UI-003',
  fixture: 'packaged-web-bundle',
  viewport: { width: 844, height: 390 },
  screenshots: [],
  checks: {},
  pageErrors: [],
  runtimeConsoleErrors: [],
  assetTransportErrors: [],
  http404Paths: [],
  passed: false
};

await mkdir(outputDir, { recursive: true });
await writeFile(candidate, await readFile(source, 'utf8'), 'utf8');
patches.forEach(apply);

execFileSync(process.execPath, [path.join(root, 'scripts', 'vendor-threejs-hero-slice4-assets.mjs')], { cwd: root, stdio: 'pipe' });
execFileSync(process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'], { cwd: root, stdio: 'pipe' });
execFileSync(process.execPath, [path.join(root, 'scripts', 'build-web.mjs')], {
  cwd: root,
  env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: candidate, SEVERE_WEATHER_WWW_DIR: packagedDir },
  stdio: 'pipe'
});

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
  try {
    const safe = path.resolve(packagedDir, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!safe.startsWith(packagedDir)) throw new Error('outside packaged root');
    const body = await readFile(safe);
    response.writeHead(200, { 'content-type': media[path.extname(safe)] || 'application/octet-stream', 'cache-control': 'no-store' });
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
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_BIN || undefined,
    args: ['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    screen: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    serviceWorkers: 'block'
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message));
  const consoleErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.getSwUi003State === 'function', null, { timeout: 15000 });

  // 1. Initial State Check
  const initial = await page.evaluate(() => globalThis.getSwUi003State());
  report.checks.moduleMarker = initial.marker === 'SW_UI_003_RUN_SHELL_IDENTITY_V1';
  report.checks.pauseConfigured = initial.pauseConfigured === true;
  report.checks.resultsConfigured = initial.resultsConfigured === true;

  // 2. Heartland Pause Screen
  await page.evaluate(() => {
    if (globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__) {
      globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.finish('qa-skip');
    }
    if (!gameStarted) {
      document.getElementById('btnStartMenu')?.click();
      if (globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__) {
        globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.finish('qa-skip');
      }
    }
    togglePauseMenu();
  });

  const heartlandPause = await page.evaluate(() => {
    const overlay = document.getElementById('pauseOverlay');
    const card = overlay?.querySelector('.pause-card');
    const masthead = document.getElementById('newspaperPauseMasthead');
    const kicker = document.getElementById('newspaperPauseKicker');
    const loc = document.getElementById('swPauseLocationVal');
    const rect = card?.getBoundingClientRect();
    return {
      active: overlay?.classList.contains('active'),
      display: overlay ? getComputedStyle(overlay).display : '',
      masthead: masthead?.textContent?.trim() || '',
      kicker: kicker?.textContent?.trim() || '',
      location: loc?.textContent?.trim() || '',
      cardHeight: rect?.height || 0,
      visualHeight: visualViewport?.height || innerHeight,
    };
  });

  report.checks.heartlandPauseActive = heartlandPause.active === true && heartlandPause.display === 'flex';
  report.checks.heartlandPauseMasthead = heartlandPause.masthead.includes('SEVERE WEATHER WARNING');
  report.checks.heartlandPauseLocation = heartlandPause.location === 'PINE RIDGE' || heartlandPause.location.includes('PINE');
  report.checks.heartlandPauseFits = heartlandPause.cardHeight <= heartlandPause.visualHeight;

  const shot1 = path.join(outputDir, '01_heartland_pause_overlay.png');
  await page.screenshot({ path: shot1 });
  report.screenshots.push(shot1);

  // 3. County Fair Pause Screen
  await page.evaluate(() => togglePauseMenu());
  const fairPause = await page.evaluate(() => {
    quitToMainMenu();
    globalThis.__SW_STORM_SITE_QA__.launch('county-fair');
    togglePauseMenu();
    const state = globalThis.getSwUi003State();
    return {
      active: state.pauseActive,
      location: state.pauseLocationText,
      kicker: state.pauseKickerText,
      siteType: state.activeLocation?.districtType,
    };
  });

  report.checks.countyFairPauseLocation = fairPause.active === true && fairPause.location.includes('COUNTY FAIR');
  report.checks.countyFairPauseKicker = fairPause.kicker.includes('MIDWAY') || fairPause.kicker.includes('INSURANCE');
  report.checks.countyFairSiteType = fairPause.siteType === 'SITE';

  const shot2 = path.join(outputDir, '02_county_fair_pause_overlay.png');
  await page.screenshot({ path: shot2 });
  report.screenshots.push(shot2);

  // 4. Coastal Boardwalk Pause Screen
  await page.evaluate(() => togglePauseMenu());
  const coastPause = await page.evaluate(() => {
    quitToMainMenu();
    globalThis.__SW_STORM_SITE_QA__.launch('coastal-boardwalk');
    togglePauseMenu();
    const state = globalThis.getSwUi003State();
    return {
      active: state.pauseActive,
      location: state.pauseLocationText,
      kicker: state.pauseKickerText,
      siteType: state.activeLocation?.districtType,
    };
  });

  report.checks.coastalPauseLocation = coastPause.active === true && (coastPause.location.includes('GULLWIND') || coastPause.location.includes('BOARDWALK'));
  report.checks.coastalPauseKicker = coastPause.kicker.includes('PIER') || coastPause.kicker.includes('LIFE VEST');

  const shot3 = path.join(outputDir, '03_coastal_boardwalk_pause_overlay.png');
  await page.screenshot({ path: shot3 });
  report.screenshots.push(shot3);

  // 5. Secret Moo Level Pause Screen
  await page.evaluate(() => togglePauseMenu());
  const mooPause = await page.evaluate(() => {
    quitToMainMenu();
    if (globalThis.__SW_MOO_LEVEL_QA__?.beginMooLevel) {
      globalThis.__SW_MOO_LEVEL_QA__.beginMooLevel();
    } else if (typeof launchMooLevelRun === 'function') {
      launchMooLevelRun('qa');
    } else {
      mooLevelMode = 'moo-level';
      resetWarningRun();
    }
    togglePauseMenu();
    const state = globalThis.getSwUi003State();
    return {
      active: state.pauseActive,
      location: state.pauseLocationText,
      kicker: state.pauseKickerText,
      siteType: state.activeLocation?.districtType,
    };
  });

  report.checks.mooLevelPauseLocation = mooPause.active === true && (mooPause.location.includes('BOVINE') || mooPause.location.includes('PASTURE'));

  const shot4 = path.join(outputDir, '04_moo_level_pause_overlay.png');
  await page.screenshot({ path: shot4 });
  report.screenshots.push(shot4);

  // 6. Results Screen & Ink Stamped Grade Badge
  await page.evaluate(() => {
    togglePauseMenu();
    document.getElementById('btnStartMenu')?.click();
    if (globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__) {
      globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.finish('qa-results');
    }
    destructionScore = 6450;
    efRating = 'EF-5';
    if (typeof finishRun === 'function') {
      finishRun();
    }
  });

  const resultsData = await page.evaluate(() => {
    const state = globalThis.getSwUi003State();
    const overlay = document.getElementById('resultsOverlay');
    const grade = overlay?.querySelector('.grade-stamp');
    const breakdown = document.getElementById('newspaperBreakdownGrid');
    const card = overlay?.querySelector('.results-card');
    const gradeStyle = grade ? getComputedStyle(grade) : null;
    const cardRect = card?.getBoundingClientRect();

    return {
      active: state.resultsActive,
      gradeText: grade?.textContent?.trim() || '',
      gradeBorder: gradeStyle?.borderColor || '',
      hasBreakdownGrid: Boolean(breakdown),
      cardHeight: cardRect?.height || 0,
      visualHeight: visualViewport?.height || innerHeight,
    };
  });

  report.checks.resultsOverlayActive = resultsData.active === true;
  report.checks.resultsGradeStamp = Boolean(resultsData.gradeText);
  report.checks.resultsBreakdownGrid = resultsData.hasBreakdownGrid === true;
  report.checks.resultsCardFits = resultsData.cardHeight <= resultsData.visualHeight;

  const shot5 = path.join(outputDir, '05_results_overlay_grade_stamp.png');
  await page.screenshot({ path: shot5 });
  report.screenshots.push(shot5);

  // 7. Desktop Viewport (1280x720) Check
  await page.setViewportSize({ width: 1280, height: 720 });
  const desktopResults = await page.evaluate(() => {
    const card = document.querySelector('#resultsOverlay .results-card');
    const rect = card?.getBoundingClientRect();
    return {
      cardHeight: rect?.height || 0,
      visualHeight: window.innerHeight,
    };
  });
  report.checks.desktopResultsCardFits = desktopResults.cardHeight <= desktopResults.visualHeight;

  const shot6 = path.join(outputDir, '07_desktop_1280x720_results.png');
  await page.screenshot({ path: shot6 });
  report.screenshots.push(shot6);

  await page.evaluate(() => {
    document.getElementById('resultsOverlay')?.classList.remove('active');
    document.getElementById('btnStartMenu')?.click();
    if (globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__) {
      globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.finish('qa-desktop-pause');
    }
    togglePauseMenu();
  });

  const desktopPause = await page.evaluate(() => {
    const card = document.querySelector('#pauseOverlay .pause-card');
    const rect = card?.getBoundingClientRect();
    return {
      cardHeight: rect?.height || 0,
      visualHeight: window.innerHeight,
    };
  });
  report.checks.desktopPauseCardFits = desktopPause.cardHeight <= desktopPause.visualHeight;

  const shot7 = path.join(outputDir, '06_desktop_1280x720_pause.png');
  await page.screenshot({ path: shot7 });
  report.screenshots.push(shot7);

  report.assetTransportErrors = [
    ...consoleErrors.filter(message => /ERR_FILE_NOT_FOUND|Failed to load resource|404 \(Not Found\)/.test(message)),
    ...report.http404Paths.map(pathname => `HTTP 404 ${pathname}`)
  ];
  report.runtimeConsoleErrors = consoleErrors.filter(message => !/ERR_FILE_NOT_FOUND|Failed to load resource|404 \(Not Found\)/.test(message));
  report.checks.noPageErrors = report.pageErrors.length === 0;
  report.checks.noConsoleErrors = report.runtimeConsoleErrors.length === 0;
  report.checks.noAssetTransportErrors = report.assetTransportErrors.length === 0;

  const checkKeys = Object.keys(report.checks);
  const passedKeys = checkKeys.filter(key => report.checks[key]);
  report.passed = passedKeys.length === checkKeys.length;

  console.log(`SW-UI-003 browser QA ${passedKeys.length}/${checkKeys.length} PASS`);
  Object.entries(report.checks).forEach(([key, pass]) => {
    console.log(`${pass ? 'PASS' : 'FAIL'} ${key}`);
  });
} finally {
  await writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  await rm(candidate, { force: true });
}

if (!report.passed) process.exit(1);
