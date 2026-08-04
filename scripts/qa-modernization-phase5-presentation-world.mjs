import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'modernization-phase-5');
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
  { name: 'wide-landscape-1280x540', width: 1280, height: 540, isMobile: true }
];
const results = [];

for (const viewport of viewports) {
  console.log(`Starting QA run for viewport: ${viewport.name}`);
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => {
    console.error(`[Page Error ${viewport.name}]:`, error.message);
    pageErrors.push(error.message);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      console.error(`[Console Error ${viewport.name}]:`, message.text());
      consoleErrors.push(message.text());
    }
  });

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  console.log(`Navigated to ${baseUrl} for ${viewport.name}, waiting for modern shell ready...`);

  await page.waitForFunction(() => (
    globalThis.__SW_MODERN_SHELL_READY__ === true
    && globalThis.__SEVERE_WEATHER__?.modernizationPhase === 'phase-5-rendering-world'
    && globalThis.__SEVERE_WEATHER__?.qa?.getPresentationWorldBridgeSnapshot?.().attached === true
  ), { timeout: 30_000 });

  console.log(`Modern shell ready for ${viewport.name}. Collecting evidence...`);

  const evidence = await page.evaluate(() => {
    const shell = globalThis.__SEVERE_WEATHER__;
    const bridge = globalThis.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__;
    if (!shell || !bridge) throw new Error('Phase 5 shell or lexical bridge unavailable');

    const snap = bridge.getSnapshot();
    const forensicPanel = document.getElementById('qa4ForensicTrace');

    return {
      architecture: shell.architecture,
      modernizationPhase: shell.modernizationPhase,
      documentPhase: document.documentElement.dataset.swModernizationPhase ?? null,
      snap,
      forensicHidden: forensicPanel?.hidden === true,
    };
  });

  const checks = {
    phaseIdentity: evidence.modernizationPhase === 'phase-5-rendering-world'
      && evidence.documentPhase === 'phase-5-rendering-world',
    rendererAttached: evidence.snap?.renderer?.rendererName === 'Three.js WebGLRenderer',
    sceneAttached: evidence.snap?.scene?.sceneId === 'production-scene-r128',
    cameraAttached: evidence.snap?.camera?.fov === 45,
    atmosphereAttached: evidence.snap?.atmosphere?.fogDensity > 0,
    tornadoAttached: evidence.snap?.tornado?.funnelLayerCount >= 4,
    worldAttached: evidence.snap?.world?.cow17Present === true,
    hartFarmAttached: evidence.snap?.setpieces?.hartFarm?.setpieceId === 'hart-farm-barn',
    secondStructureAttached: evidence.snap?.setpieces?.secondStructure?.setpieceId === 'lincoln-grain-silo',
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
  version: 'MODERNIZATION_PHASE5_PRESENTATION_WORLD_QA_V1',
  generatedAt: new Date().toISOString(),
  sourceUrl: baseUrl,
  results,
  passed: results.every((result) => result.passed),
};
await writeFile(path.join(outputDir, 'presentation-world-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
for (const result of results) {
  console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.viewport.name} :: ${JSON.stringify(result.checks)}`);
}
if (!report.passed) process.exitCode = 1;
