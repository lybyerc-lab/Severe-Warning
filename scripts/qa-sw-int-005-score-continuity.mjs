import http from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
const outputDir = path.resolve('artifacts/sw-int-005-score');
await mkdir(outputDir, { recursive: true });

const mime = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.wav', 'audio/wav'], ['.woff2', 'font/woff2'], ['.png', 'image/png'],
]);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root)) throw new Error('outside root');
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not file');
    response.writeHead(200, {
      'content-type': mime.get(path.extname(file)) || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end('not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const checks = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};

const pageErrors = [];
const consoleErrors = [];
const httpErrors = [];
let browser;
let evidence = {};

function scoreRecordFromState(state, id = 'campaign|lincoln-county|tornado') {
  const bucket = state?.buckets?.find(item => item.id === id);
  if (!bucket) return null;
  return bucket.records?.[state.scoringVersion] || null;
}

try {
  browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const context = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  page.on('pageerror', error => pageErrors.push(String(error.message || error)));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`); });

  const waitForCombinedScoreRuntime = async () => {
    await page.waitForFunction(() => (
      typeof globalThis.__SW_SCOREKEEPER_QA__?.completeNormal === 'function' &&
      typeof globalThis.getScorekeeperQaState === 'function' &&
      typeof globalThis.getSwUi003State === 'function' &&
      typeof globalThis.getSwUi004State === 'function' &&
      typeof globalThis.getSwUi005State === 'function' &&
      typeof globalThis.getSwWorld007State === 'function' &&
      typeof globalThis.getSwFeel001State === 'function'
    ), null, { timeout: 20000 });
  };

  const inspectCampaignStorage = async () => page.evaluate(() => {
    const entries = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      const raw = key ? localStorage.getItem(key) : null;
      if (!key || raw == null) continue;
      let parsed = null;
      try { parsed = JSON.parse(raw); } catch (_) {}
      entries.push({ key, raw, parsed });
    }
    const campaignEntry = entries.find(entry => Number(entry.parsed?.levels?.['lincoln-county']?.runs || 0) > 0)
      || entries.find(entry => /campaign/i.test(entry.key) && entry.parsed?.levels?.['lincoln-county']);
    return {
      key: campaignEntry?.key || null,
      runs: Number(campaignEntry?.parsed?.levels?.['lincoln-county']?.runs || 0),
      selectedLevel: campaignEntry?.parsed?.selectedLevel ?? null,
      unlockedLevel: campaignEntry?.parsed?.unlockedLevel ?? null,
      keys: entries.map(entry => entry.key),
    };
  });

  await page.goto(`${origin}/index.html?intro=0`, { waitUntil: 'domcontentloaded' });
  await waitForCombinedScoreRuntime();

  await page.evaluate(() => {
    globalThis.__SW_SCOREKEEPER_QA__.reset();
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key && /campaign/i.test(key)) localStorage.removeItem(key);
    }
  });

  const first = await page.evaluate(() => {
    globalThis.__SW_SCOREKEEPER_QA__.completeNormal({
      score: 1200,
      storm: 'tornado',
      campaignIndex: 0,
      grid: 2,
      chains: 3,
      blocks: 4,
      media: 1,
      objectives: 1,
    });
    const state = globalThis.getScorekeeperQaState();
    const resultsOverlay = document.getElementById('resultsOverlay');
    const scoreText = document.getElementById('resScore')?.textContent?.trim() || '';
    const gradeText = document.getElementById('resGrade')?.textContent?.trim() || '';
    return {
      state,
      resultsActive: Boolean(resultsOverlay?.classList.contains('active')),
      scoreText,
      scoreValue: Number(scoreText.replace(/[^0-9.-]/g, '')),
      gradeText,
      ui003: globalThis.getSwUi003State(),
      ui004: globalThis.getSwUi004State(),
      ui005: globalThis.getSwUi005State(),
      world: globalThis.getSwWorld007State(),
      feel: globalThis.getSwFeel001State(),
      campaignRunsLive: typeof campaignProgress !== 'undefined'
        ? Number(campaignProgress?.levels?.['lincoln-county']?.runs || 0)
        : 0,
      mooModeLive: typeof mooLevelMode !== 'undefined' ? mooLevelMode : null,
    };
  });
  const firstRecord = scoreRecordFromState(first.state);
  const firstCampaign = await inspectCampaignStorage();
  evidence.first = { ...first, campaignStorage: firstCampaign };

  check('combinedModulesMountedForScoreProof',
    first.ui003?.marker === 'SW_UI_003_RUN_SHELL_IDENTITY_V1' &&
    first.ui004?.marker === 'SW_UI_004_GAMEPLAY_PRODUCT_IDENTITY_V1' &&
    first.ui005?.marker === 'SW_UI_005_FIELD_CONTROLS_V1' &&
    Boolean(first.world?.marker) &&
    first.feel?.version === 'SW_FEEL_001_DESTRUCTION_CONSEQUENCE_V1',
    JSON.stringify({
      ui003: first.ui003?.marker,
      ui004: first.ui004?.marker,
      ui005: first.ui005?.marker,
      world: first.world?.marker,
      feel: first.feel?.version,
    }));
  check('firstRunCreatesCampaignTornadoRecord', Boolean(firstRecord), JSON.stringify(first.state));
  check('firstRunPersonalBest1200',
    first.state?.lastResult?.isPersonalBest === true &&
    first.state?.lastResult?.firstRecord === true &&
    first.state?.lastResult?.currentBest === 1200 &&
    firstRecord?.bestScore === 1200 && firstRecord?.runs === 1,
    JSON.stringify({ lastResult: first.state?.lastResult, record: firstRecord }));
  check('firstRunUsesRealResultsShell',
    first.resultsActive === true && first.scoreValue === 1200 && first.gradeText.length > 0,
    JSON.stringify({ active: first.resultsActive, scoreText: first.scoreText, scoreValue: first.scoreValue, grade: first.gradeText }));
  check('firstRunAdvancesCampaign',
    first.campaignRunsLive >= 1 && firstCampaign.runs >= 1,
    JSON.stringify({ live: first.campaignRunsLive, storage: firstCampaign }));
  check('firstRunRemainsNormalCampaignMode', first.mooModeLive === 'normal', `mooLevelMode=${first.mooModeLive}`);

  const second = await page.evaluate(() => {
    globalThis.__SW_SCOREKEEPER_QA__.completeNormal({
      score: 1500,
      storm: 'tornado',
      campaignIndex: 0,
      grid: 3,
      chains: 4,
      blocks: 5,
      media: 2,
      objectives: 1,
    });
    const state = globalThis.getScorekeeperQaState();
    const scoreText = document.getElementById('resScore')?.textContent?.trim() || '';
    return {
      state,
      resultsActive: Boolean(document.getElementById('resultsOverlay')?.classList.contains('active')),
      scoreText,
      scoreValue: Number(scoreText.replace(/[^0-9.-]/g, '')),
      campaignRunsLive: typeof campaignProgress !== 'undefined'
        ? Number(campaignProgress?.levels?.['lincoln-county']?.runs || 0)
        : 0,
      mooModeLive: typeof mooLevelMode !== 'undefined' ? mooLevelMode : null,
    };
  });
  const secondRecord = scoreRecordFromState(second.state);
  const secondCampaign = await inspectCampaignStorage();
  evidence.second = { ...second, campaignStorage: secondCampaign };

  check('higherRunCreatesExactPersonalBest',
    second.state?.lastResult?.isPersonalBest === true &&
    second.state?.lastResult?.previousBest === 1200 &&
    second.state?.lastResult?.margin === 300 &&
    second.state?.lastResult?.currentBest === 1500 &&
    secondRecord?.bestScore === 1500 && secondRecord?.runs === 2,
    JSON.stringify({ lastResult: second.state?.lastResult, record: secondRecord }));
  check('secondRunResultsRemainAuthoritative',
    second.resultsActive === true && second.scoreValue === 1500,
    JSON.stringify({ active: second.resultsActive, scoreText: second.scoreText, scoreValue: second.scoreValue }));
  check('secondRunKeepsCampaignTruth',
    second.campaignRunsLive >= 1 && secondCampaign.runs >= 1 && second.mooModeLive === 'normal',
    JSON.stringify({ live: second.campaignRunsLive, storage: secondCampaign, mooMode: second.mooModeLive }));

  await page.screenshot({ path: path.join(outputDir, '01_score_continuity_results_844x390.png'), fullPage: false });

  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForCombinedScoreRuntime();
  const reloaded = await page.evaluate(() => ({
    state: globalThis.getScorekeeperQaState(),
    scoreRail: document.getElementById('newspaperScorekeeperRail')?.textContent?.replace(/\s+/g, ' ').trim() || '',
  }));
  const reloadRecord = scoreRecordFromState(reloaded.state);
  const reloadCampaign = await inspectCampaignStorage();
  evidence.reloaded = { ...reloaded, campaignStorage: reloadCampaign };

  check('scoreRecordSurvivesReload',
    reloadRecord?.bestScore === 1500 && reloadRecord?.runs === 2,
    JSON.stringify(reloadRecord));
  check('campaignRecordSurvivesReload', reloadCampaign.runs >= 1, JSON.stringify(reloadCampaign));
  check('scoringVersionRemainsExplicit',
    typeof reloaded.state?.scoringVersion === 'string' && reloaded.state.scoringVersion.length > 0,
    String(reloaded.state?.scoringVersion || ''));
  check('noPageErrors', pageErrors.length === 0, `found ${pageErrors.length}`);
  check('noRuntimeConsoleErrors', consoleErrors.length === 0, `found ${consoleErrors.length}`);
  check('noHttpErrors', httpErrors.length === 0, `found ${httpErrors.length}`);

  await context.close();
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}

const failed = checks.filter(item => !item.pass);
await writeFile(path.join(outputDir, 'report.json'), JSON.stringify({
  task: 'SW-INT-005-SCORE-CONTINUITY',
  source: 'assembled combined www bundle',
  checks,
  evidence,
  pageErrors,
  consoleErrors,
  httpErrors,
  passed: failed.length === 0,
}, null, 2), 'utf8');
console.log(`SW-INT-005 combined score/campaign QA ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
