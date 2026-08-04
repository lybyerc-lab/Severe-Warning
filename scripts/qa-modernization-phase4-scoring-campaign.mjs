import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'modernization-phase-4');
const baseUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
const executablePath = process.env.CHROME_BIN || undefined;

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--enable-webgl',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--disable-gpu-sandbox',
  ],
});

const viewports = [
  { name: 'desktop-1365x768', width: 1365, height: 768, isMobile: false },
  { name: 'mobile-915x412', width: 915, height: 412, isMobile: true },
];
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15_000);
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForFunction(() => (
    globalThis.__SW_MODERN_SHELL_READY__ === true
    && globalThis.__SEVERE_WEATHER__?.modernizationPhase === 'phase-4-scoring-campaign'
    && globalThis.__SEVERE_WEATHER__?.qa?.getScoringCampaignBridgeSnapshot?.().attached === true
  ));

  const evidence = await page.evaluate(() => {
    const shell = globalThis.__SEVERE_WEATHER__;
    const bridge = globalThis.__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__;
    if (!shell || !bridge) throw new Error('Phase 4 shell or lexical bridge unavailable');

    const storageKey = 'severe_weather_campaign_v1';
    const playerSaveBefore = localStorage.getItem(storageKey);
    const contractProbe = bridge.runContractProbe();
    const snapshot = shell.qa.getScoringCampaignBridgeSnapshot();
    const playerSaveAfter = localStorage.getItem(storageKey);
    const stopIds = shell.campaign.stops.map((stop) => stop.id);
    const forensicPanel = document.getElementById('qa4ForensicTrace');

    return {
      architecture: shell.architecture,
      modernizationPhase: shell.modernizationPhase,
      documentPhase: document.documentElement.dataset.swModernizationPhase ?? null,
      bridgeVersion: snapshot.version,
      contractProbe,
      snapshot,
      stopIds,
      playerSaveUnchanged: playerSaveBefore === playerSaveAfter,
      forensicHidden: forensicPanel?.hidden === true,
    };
  });

  const scoreAuthority = evidence.snapshot?.score?.authority;
  const scoreLegacy = evidence.snapshot?.score?.legacy;
  const districtAuthority = evidence.snapshot?.district?.authority;
  const districtLegacy = evidence.snapshot?.district?.legacy;
  const campaignSave = evidence.snapshot?.campaign?.save;
  const campaignLegacy = evidence.snapshot?.campaign?.legacy;

  const checks = {
    phaseIdentity: evidence.modernizationPhase === 'phase-4-scoring-campaign'
      && evidence.documentPhase === 'phase-4-scoring-campaign',
    bridgeIdentity: evidence.bridgeVersion === 'MODERNIZATION_PHASE4_SCORING_CAMPAIGN_V2',
    scoringContract: evidence.contractProbe?.scoring?.passed === true,
    exactComboCap: evidence.contractProbe?.scoring?.checks?.maxComboIsThreePointFive === true,
    exactComboStep: evidence.contractProbe?.scoring?.checks?.comboStepIsPointZeroFive === true,
    exactComboDecay: evidence.contractProbe?.scoring?.checks?.decayIsFourPointFiveSeconds === true,
    campaignMultiplierPreserved: evidence.contractProbe?.scoring?.checks?.campaignMultiplierApplied === true,
    scoreDoublerPreserved: evidence.contractProbe?.scoring?.checks?.scoreDoublerApplied === true,
    districtContract: evidence.contractProbe?.districts?.passed === true,
    districtForwardOnly: evidence.contractProbe?.districts?.checks?.regressionRejected === true,
    campaignContract: evidence.contractProbe?.campaign?.passed === true,
    exactCampaignIds: evidence.stopIds?.join('|')
      === 'lincoln-county|prairie-junction|grain-belt|state-fair-finale',
    starFormulaPreserved: evidence.contractProbe?.campaign?.checks?.threeStarsNeedsTargetAndObjectives === true,
    positiveStarsUnlockNext: evidence.contractProbe?.campaign?.checks?.anyPositiveStarsUnlockNext === true,
    persistenceContract: evidence.contractProbe?.persistence?.passed === true,
    legacySchemaPreserved: evidence.contractProbe?.persistence?.checks?.exactLevelFieldsPreserved === true,
    corruptSaveRecovery: evidence.contractProbe?.persistence?.checks?.malformedSaveRecovers === true,
    qaStorageIsolated: evidence.contractProbe?.persistence?.checks?.qaStoreIsIsolated === true,
    playerSaveUntouchedByProbe: evidence.playerSaveUnchanged === true,
    scoringMirrorMatchesLegacy: scoreAuthority?.destructionScore === scoreLegacy?.destructionScore
      && scoreAuthority?.baseScore === scoreLegacy?.baseScore
      && scoreAuthority?.comboMultiplier === scoreLegacy?.comboMultiplier,
    districtMirrorMatchesLegacy: districtAuthority?.currentStage === districtLegacy?.stage,
    campaignMirrorMatchesLegacy: campaignSave?.selectedLevel === campaignLegacy?.selectedLevel
      && campaignSave?.unlockedLevel === campaignLegacy?.unlockedLevel,
    playerForensicsHidden: evidence.forensicHidden === true,
    noPageErrors: pageErrors.length === 0,
    noConsoleErrors: consoleErrors.length === 0,
  };

  const screenshotPath = path.join(outputDir, `${viewport.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  results.push({
    viewport,
    evidence,
    checks,
    pageErrors,
    consoleErrors,
    screenshot: path.relative(projectRoot, screenshotPath).replaceAll('\\', '/'),
    passed: Object.values(checks).every(Boolean),
  });
  await context.close();
}

await browser.close();
const report = {
  version: 'MODERNIZATION_PHASE4_SCORING_CAMPAIGN_QA_V2',
  generatedAt: new Date().toISOString(),
  sourceUrl: baseUrl,
  results,
  passed: results.every((result) => result.passed),
};
await writeFile(path.join(outputDir, 'scoring-campaign-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.viewport.name} :: ${JSON.stringify(result.checks)}`);
}
if (!report.passed) process.exitCode = 1;
