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
    && globalThis.__SEVERE_WEATHER__?.modernizationPhase === 'phase-2-clocks'
    && globalThis.__SEVERE_WEATHER__?.qa?.getClockBridgeSnapshot?.().attached === true
  ));

  const evidence = await page.evaluate(() => {
    const shell = globalThis.__SEVERE_WEATHER__;
    if (!shell) throw new Error('Modern shell unavailable');
    const probe = shell.clocks.runContractProbe();
    const bridge = shell.qa.getClockBridgeSnapshot();
    return {
      architecture: shell.architecture,
      modernizationPhase: shell.modernizationPhase,
      lifecycle: shell.app.getStatus(),
      clockProbe: probe,
      bridge,
      documentPhase: document.documentElement.dataset.swModernizationPhase ?? null,
    };
  });

  const checks = {
    phaseIdentity: evidence.modernizationPhase === 'phase-2-clocks'
      && evidence.documentPhase === 'phase-2-clocks',
    bridgeAttached: evidence.bridge?.attached === true
      && evidence.bridge?.version === 'MODERNIZATION_PHASE2_CLOCKS_V1',
    clockContract: evidence.clockProbe?.passed === true,
    runningUsesWallTime: evidence.clockProbe?.checks?.runningUsesWallTime === true,
    pauseChargesZero: evidence.clockProbe?.checks?.pauseChargesZero === true,
    resumeChargesZero: evidence.clockProbe?.checks?.resumeTransitionChargesZero === true,
    suspensionChargesZero: evidence.clockProbe?.checks?.suspensionChargesZero === true,
    simulationCapped: evidence.clockProbe?.checks?.simulationDeltaIsCapped === true,
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
  version: 'MODERNIZATION_PHASE2_CLOCK_QA_V1',
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
