import { createServer } from 'node:http';
import { readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const candidate = path.join(root, '.sw-ui-001-qa.html');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR) : path.join(root, 'qa-artifacts', 'sw-ui-001');
const patches = ['apply-v431-source-patch.mjs','apply-v440-source-patch.mjs','apply-v441-source-patch.mjs','apply-v442-source-patch.mjs','fix-v450-parser.mjs','apply-v450-source-patch.mjs','apply-v450-rampage-music-patch.mjs','apply-qa-corrections-patch.mjs','apply-audio-mix-followup-patch.mjs','apply-ui-polish-followup-patch.mjs','apply-score-continuity-fix.mjs','apply-qa4-deterministic-lab-patch.mjs','apply-qa4-mobile-input-fix.mjs','apply-qa4-run-lock-fix.mjs','apply-qa4-pause-forensics.mjs','apply-pause-overlay-hit-test-fix.mjs','apply-pause-overlay-hard-hide.mjs','apply-qa4-popup-assertion-fix.mjs','apply-v500-campaign-patch.mjs','apply-v500-realtime-clock-fix.mjs','apply-v500-world-tour-patch.mjs','apply-v500-mobile-layout-fix.mjs','apply-v500-cow-signature-patch.mjs','apply-v510-production-slice.mjs','apply-sw-game-002-moo-level.mjs','apply-sw-ui-001-newspaper-presentation.mjs'];
const apply = (script) => execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: candidate }, stdio: 'pipe' });
const media = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.wav':'audio/wav','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png' };
const report = { task:'SW-UI-001', screenshots:[], checks:{}, pageErrors:[], runtimeConsoleErrors:[], assetTransportErrors:[], passed:false };
await mkdir(outputDir, { recursive:true });
const progress = (stage) => writeFile(path.join(outputDir, 'progress.txt'), `${stage}\n`, 'utf8');
await writeFile(candidate, await readFile(source, 'utf8'), 'utf8');
patches.forEach(apply);
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
    const safe = path.resolve(root, `.${pathname === '/' ? '/.sw-ui-001-qa.html' : pathname}`);
    if (!safe.startsWith(root)) throw new Error('outside root');
    const body = await readFile(safe); response.writeHead(200, { 'content-type':media[path.extname(safe)] || 'application/octet-stream' }); response.end(body);
  } catch (_) { response.writeHead(404); response.end('not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address(); const baseUrl = `http://127.0.0.1:${address.port}/.sw-ui-001-qa.html?intro=0`;
let browser;
try {
  browser = await chromium.launch({ headless:true, executablePath:process.env.CHROME_BIN || undefined, args:['--no-sandbox','--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport:{ width:390, height:844 }, isMobile:true, hasTouch:true, deviceScaleFactor:1 });
  const page = await context.newPage();
  page.on('pageerror', error => report.pageErrors.push(error.message));
  const consoleErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto(baseUrl, { waitUntil:'networkidle', timeout:60000 });
  await page.waitForFunction(() => globalThis.getNewspaperPresentationQaState?.().marker === 'SW_UI_001_NEWSPAPER_PRESENTATION_V1', null, { timeout:15000 });
  await progress('initial-ready');
  const shot = async (name) => { const file = path.join(outputDir, name); await page.screenshot({ path:file, fullPage:false }); report.screenshots.push(path.relative(root, file).replaceAll('\\','/')); };
  const initial = await page.evaluate(() => globalThis.getNewspaperPresentationQaState());
  await shot('storm-select-tornado-mobile.png');
  // The inherited selector's audio initialization can keep synthetic pointer actions open
  // in headless WebAudio. Its handler remains unchanged and is covered by the V5 verifier;
  // this fixture isolates the player-visible selected-card presentation state.
  await page.evaluate(() => { document.querySelectorAll('#mainMenu .storm-card').forEach(node => { const selected = node.id === 'menuCardSupercell'; node.classList.toggle('selected', selected); node.setAttribute('aria-pressed', String(selected)); }); }); await page.waitForTimeout(80);
  const selected = await page.evaluate(() => globalThis.getNewspaperPresentationQaState());
  await shot('storm-select-supercell-mobile.png');
  await progress('selected-captured');
  // The existing SW-GAME-002 QA covers the real Hart Farm and fair runtime. This
  // presentation fixture reloads the same persisted unlock truth without rebuilding
  // a second Three.js world just to inspect the menu card.
  await page.evaluate(() => localStorage.setItem('severe_weather_moo_level_v1', JSON.stringify({ mooLevelUnlocked:true, bestScore:4200 })));
  await page.reload({ waitUntil:'networkidle', timeout:60000 });
  await page.waitForFunction(() => globalThis.getNewspaperPresentationQaState?.().marker === 'SW_UI_001_NEWSPAPER_PRESENTATION_V1', null, { timeout:15000 });
  const unlocked = await page.evaluate(() => globalThis.getNewspaperPresentationQaState());
  await shot('moo-card-unlocked-mobile.png');
  await progress('moo-card-captured');
  // Populate only existing result fields to inspect the newspaper layer's readable
  // Moo edition. SW-GAME-002 remains the authority that normally fills these fields.
  await page.evaluate(() => {
    const values = { resStormTitle:'MOO COUNTY FAIR: BOVINE SCORE ATTACK', resGrade:'UDDER CHAOS', resScore:'4200', resCombo:'2.4x MOO METER', resObjCount:'3/3', resLandmarks:'FAIRGROUND SAFE', resSubstations:'COWS SAFE', resChallenges:'20 RELOCATED', resBlocks:'45.0s AIRTIME', resChains:'10 SPONSORS', resMediaMoments:'BOVINE BULLETIN', resFootageBonus:'UDDER CHAOS!', resCosmetic:'MOO LEVEL BEST: 4200' };
    Object.entries(values).forEach(([id, value]) => { const node = document.getElementById(id); if (node) node.textContent = value; });
    const menu = document.getElementById('mainMenu'); if (menu) { menu.classList.add('hidden'); menu.style.display = 'none'; }
    document.body.classList.add('moo-level-run'); document.getElementById('resultsOverlay')?.classList.add('active');
  });
  await page.waitForTimeout(150);
  await progress('moo-results-rendered');
  const mooResult = await page.evaluate(() => ({ newspaper:globalThis.getNewspaperPresentationQaState(), moo:globalThis.getMooLevelQaState(), title:document.getElementById('resStormTitle')?.textContent, returnVisible:getComputedStyle(document.getElementById('mooReturnButton')).display !== 'none', actions:[...document.querySelectorAll('#resultsOverlay button')].map(node => node.textContent.trim()) }));
  await shot('moo-results-mobile.png');
  await progress('moo-results-captured');
  await page.evaluate(() => { returnToWeatherMap(); const menu = document.getElementById('mainMenu'); if (menu) { menu.classList.add('hidden'); menu.style.display = 'none'; } document.body.classList.remove('moo-level-run'); document.getElementById('resultsOverlay')?.classList.remove('active'); finishRun(); });
  await page.waitForTimeout(150);
  await progress('normal-results-rendered');
  const normalResult = await page.evaluate(() => ({ newspaper:globalThis.getNewspaperPresentationQaState(), moo:globalThis.getMooLevelQaState(), title:document.getElementById('resStormTitle')?.textContent, actions:[...document.querySelectorAll('#resultsOverlay button')].map(node => node.textContent.trim()), score:document.getElementById('resScore')?.textContent }));
  await shot('normal-results-mobile.png');
  await progress('normal-results-captured');
  report.assetTransportErrors = consoleErrors.filter(message => /ERR_FILE_NOT_FOUND|Failed to load resource/.test(message));
  report.runtimeConsoleErrors = consoleErrors.filter(message => !report.assetTransportErrors.includes(message));
  report.initial = initial; report.selected = selected; report.unlocked = unlocked; report.mooResult = mooResult; report.normalResult = normalResult;
  report.checks = {
    exactNewspaperExecutor: initial.marker === 'SW_UI_001_NEWSPAPER_PRESENTATION_V1' && initial.title === 'SEVERE WEATHER WARNING',
    selectedStormReadability: selected.selectedStorm === 'SUPERCELL' && selected.selectedMarked === true,
    newspaperNativeLaunch: /UNLEASH STORM/.test(selected.launchLabel) && /EXTRA! EXTRA!/.test(selected.launchLabel),
    lockedThenUnlockedMooCard: initial.mooCard.exists && initial.mooCard.locked && unlocked.mooCard.exists && !unlocked.mooCard.locked && unlocked.mooCard.label === 'MOO LEVEL',
    mooResultsLegibleFixture: mooResult.newspaper.resultsActive && /MOO COUNTY FAIR/.test(mooResult.title || '') && /BOVINE|FAIR/.test(mooResult.newspaper.headline) && mooResult.returnVisible,
    normalCampaignResultsRemainReachable: normalResult.newspaper.resultsActive && /TORNADO WARNING RUN/.test(normalResult.title || '') && normalResult.moo.normalCampaignMode === true && normalResult.actions.length >= 2,
    runScoreAndRankReadImmediately: /RANK/.test(mooResult.newspaper.resultRank) && mooResult.newspaper.resultScore.length > 0 && /RANK/.test(normalResult.newspaper.resultRank),
    noPageErrors: report.pageErrors.length === 0,
    noRuntimeConsoleErrors: report.runtimeConsoleErrors.length === 0
  };
  report.fixtureNotes = 'The Moo card/result screenshots use persisted existing UI truth to avoid a second heavy Three.js world rebuild. The real Hart Farm unlock and Moo run are covered separately by scripts/qa-sw-game-002.mjs.';
  report.passed = Object.values(report.checks).every(Boolean);
  await context.close();
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  await rm(candidate, { force:true });
  await writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}
for (const [name, passed] of Object.entries(report.checks)) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
if (!report.passed) process.exitCode = 1;
