import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'modernization-phase-3');
const baseUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
const executablePath = process.env.CHROME_BIN || undefined;
const phase3CompatibleIdentities = new Set([
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
    && ['phase-3-input-abilities', 'phase-4-scoring-campaign'].includes(
      globalThis.__SEVERE_WEATHER__?.modernizationPhase,
    )
    && globalThis.__SEVERE_WEATHER__?.qa?.getInputAbilityBridgeSnapshot?.().attached === true
  ));

  const evidence = await page.evaluate(() => {
    const shell = globalThis.__SEVERE_WEATHER__;
    const bridge = globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__;
    if (!shell || !bridge) throw new Error('Phase 3 shell or lexical bridge unavailable');

    const inputProbe = shell.input.runContractProbe();
    const abilityProbe = shell.abilities.runContractProbe();

    shell.input.reset();
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'w', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD', key: 'd', bubbles: true }));
    const keyboard = bridge.getSnapshot();
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'w', bubbles: true }));
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD', key: 'd', bubbles: true }));

    bridge.setJoystick(0.4, -0.75, true);
    const touch = bridge.getSnapshot();
    bridge.setJoystick(0, 0, false);
    const released = bridge.getSnapshot();

    bridge.reset();
    bridge.requestAbility('primary', 'touch');
    bridge.requestAbility('primary', 'touch');
    const duplicate = bridge.getSnapshot();

    const forensicPanel = document.getElementById('qa4ForensicTrace');
    return {
      architecture: shell.architecture,
      modernizationPhase: shell.modernizationPhase,
      documentPhase: document.documentElement.dataset.swModernizationPhase ?? null,
      inputProbe,
      abilityProbe,
      keyboard,
      touch,
      released,
      duplicate,
      forensicHidden: forensicPanel?.hidden === true,
    };
  });

  const checks = {
    phaseIdentity: phase3CompatibleIdentities.has(evidence.modernizationPhase)
      && evidence.documentPhase === evidence.modernizationPhase,
    inputContract: evidence.inputProbe?.passed === true,
    abilityContract: evidence.abilityProbe?.passed === true,
    keyboardMovement: evidence.keyboard?.movement?.x === 1
      && evidence.keyboard?.movement?.z === -1
      && evidence.keyboard?.movement?.source === 'keyboard',
    touchMovement: evidence.touch?.movement?.x === 0.4
      && evidence.touch?.movement?.z === -0.75
      && evidence.touch?.movement?.source === 'touch',
    releaseClearsTouch: evidence.released?.movement?.source === 'none'
      && evidence.released?.movement?.active === false,
    duplicateSuppressed: evidence.duplicate?.abilityRequests === 2
      && evidence.duplicate?.suppressedDuplicates === 1
      && evidence.duplicate?.abilities?.requestCount === 1,
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
  version: 'MODERNIZATION_PHASE3_INPUT_ABILITY_QA_V2',
  generatedAt: new Date().toISOString(),
  sourceUrl: baseUrl,
  results,
  passed: results.every((result) => result.passed),
};
await writeFile(path.join(outputDir, 'input-ability-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.viewport.name} :: ${JSON.stringify(result.checks)}`);
}
if (!report.passed) process.exitCode = 1;
