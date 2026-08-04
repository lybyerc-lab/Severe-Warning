import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'modernization-phase-2');
const baseUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
const executablePath = process.env.CHROME_BIN || undefined;
const phase2CompatibleIdentities = new Set([
  'phase-2-clocks',
  'phase-3-input-abilities',
  'phase-4-scoring-campaign',
]);

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
    '--disable-gpu-sandbox'
  ]
});

const viewports = [
  { name: 'desktop-1365x768', width: 1365, height: 768, isMobile: false },
  { name: 'mobile-915x412', width: 915, height: 412, isMobile: true }
];
const results = [];

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => (
    globalThis.__SW_MODERN_SHELL_READY__ === true
    && ['phase-2-clocks', 'phase-3-input-abilities', 'phase-4-scoring-campaign'].includes(
      globalThis.__SEVERE_WEATHER__?.modernizationPhase,
    )
    && globalThis.__SEVERE_WEATHER__?.qa?.getClockBridgeSnapshot?.().attached === true
    && globalThis.__SW_QA_FORENSICS__
  ));

  const evidence = await page.evaluate(async () => {
    const shell = globalThis.__SEVERE_WEATHER__;
    if (!shell) throw new Error('Modern shell unavailable');
    const probe = shell.clocks.runContractProbe();
    const bridge = shell.qa.getClockBridgeSnapshot();
    const overlay = document.getElementById('pauseOverlay');
    const trace = document.getElementById('qa4ForensicTrace');
    if (!overlay || !trace) throw new Error('Pause or forensic UI unavailable');

    overlay.classList.add('active');
    await new Promise(resolve => setTimeout(resolve, 50));
    const playerPause = {
      mode: document.documentElement.dataset.swQaForensics ?? null,
      traceHidden: trace.hidden,
      traceDisplay: getComputedStyle(trace).display,
      snapshotReason: globalThis.__SW_QA_PAUSE_TRACE__?.reason ?? null,
    };
    overlay.classList.remove('active');

    return {
      architecture: shell.architecture,
      modernizationPhase: shell.modernizationPhase,
      lifecycle: shell.app.getStatus(),
      clockProbe: probe,
      bridge,
      playerPause,
      documentPhase: document.documentElement.dataset.swModernizationPhase ?? null,
    };
  });

  const forensicPage = await context.newPage();
  const forensicUrl = new URL(baseUrl);
  forensicUrl.searchParams.set('qa4', 'forensic');
  await forensicPage.goto(forensicUrl.toString(), { waitUntil: 'networkidle', timeout: 60000 });
  await forensicPage.waitForFunction(() => globalThis.__SW_QA_FORENSICS__);
  const forensicEvidence = await forensicPage.evaluate(async () => {
    const trace = document.getElementById('qa4ForensicTrace');
    if (!trace) throw new Error('Forensic trace unavailable');
    globalThis.__SW_QA_FORENSICS__.snapshot('phase2-explicit-forensic-qa');
    await new Promise(resolve => setTimeout(resolve, 20));
    return {
      mode: document.documentElement.dataset.swQaForensics ?? null,
      traceHidden: trace.hidden,
      traceDisplay: getComputedStyle(trace).display,
      snapshotReason: globalThis.__SW_QA_PAUSE_TRACE__?.reason ?? null,
    };
  });
  await forensicPage.close();

  const checks = {
    phaseIdentity: phase2CompatibleIdentities.has(evidence.modernizationPhase)
      && evidence.documentPhase === evidence.modernizationPhase,
    bridgeAttached: evidence.bridge?.attached === true
      && evidence.bridge?.version === 'MODERNIZATION_PHASE2_CLOCKS_V1',
    clockContract: evidence.clockProbe?.passed === true,
    runningUsesWallTime: evidence.clockProbe?.checks?.runningUsesWallTime === true,
    pauseChargesZero: evidence.clockProbe?.checks?.pauseChargesZero === true,
    resumeChargesZero: evidence.clockProbe?.checks?.resumeTransitionChargesZero === true,
    suspensionChargesZero: evidence.clockProbe?.checks?.suspensionChargesZero === true,
    simulationCapped: evidence.clockProbe?.checks?.simulationDeltaIsCapped === true,
    playerPauseForensicsHidden: evidence.playerPause?.mode === 'silent'
      && evidence.playerPause?.traceHidden === true
      && evidence.playerPause?.traceDisplay === 'none'
      && evidence.playerPause?.snapshotReason === 'pause-overlay-became-active',
    explicitForensicModeVisible: forensicEvidence?.mode === 'visible'
      && forensicEvidence?.traceHidden === false
      && forensicEvidence?.traceDisplay !== 'none'
      && forensicEvidence?.snapshotReason === 'phase2-explicit-forensic-qa',
    noPageErrors: pageErrors.length === 0,
    noConsoleErrors: consoleErrors.length === 0,
  };

  const screenshotPath = path.join(outputDir, `${viewport.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });
  results.push({
    viewport,
    evidence,
    forensicEvidence,
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
  version: 'MODERNIZATION_PHASE2_CLOCK_QA_V4',
  generatedAt: new Date().toISOString(),
  sourceUrl: baseUrl,
  results,
  passed: results.every(result => result.passed),
};
await writeFile(path.join(outputDir, 'clock-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.viewport.name} :: ${JSON.stringify(result.checks)}`);
}
if (!report.passed) process.exitCode = 1;
