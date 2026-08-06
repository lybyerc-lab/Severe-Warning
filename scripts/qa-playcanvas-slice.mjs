import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { chromium } from 'playwright';

const url = process.env.PLAYCANVAS_SLICE_URL ?? 'http://127.0.0.1:4175/?qa=1';
const evidenceDir = 'playcanvas-slice-evidence';
await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1365, height: 630 }, deviceScaleFactor: 1 });
const consoleErrors = [];
const pageErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));

let report;
try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForFunction(() => document.documentElement.dataset.swPlaycanvasSliceReady === 'true', null, { timeout: 60_000 });

  const evidence = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const handle = globalThis.__SW_PLAYCANVAS_SLICE__;
    return {
      data: { ...document.documentElement.dataset },
      canvas: canvas ? { width: canvas.width, height: canvas.height } : null,
      telemetry: handle?.telemetry ?? null,
    };
  });

  await page.screenshot({ path: `${evidenceDir}/playcanvas-slice.png`, fullPage: true });

  const disposal = await page.evaluate(() => {
    globalThis.__SW_PLAYCANVAS_SLICE__?.dispose();
    return {
      canvasPresent: Boolean(document.querySelector('canvas')),
      globalPresent: Boolean(globalThis.__SW_PLAYCANVAS_SLICE__),
      readyValue: document.documentElement.dataset.swPlaycanvasSliceReady ?? null,
    };
  });
  await page.waitForTimeout(100);

  const checks = [
    { name: 'canvas-present', passed: Boolean(evidence.canvas), detail: JSON.stringify(evidence.canvas) },
    { name: 'canvas-landscape-width', passed: (evidence.canvas?.width ?? 0) >= 1000, detail: JSON.stringify(evidence.canvas) },
    { name: 'canvas-landscape-height', passed: (evidence.canvas?.height ?? 0) >= 500, detail: JSON.stringify(evidence.canvas) },
    { name: 'renderer-identity', passed: evidence.telemetry?.renderer === 'PlayCanvas', detail: JSON.stringify(evidence.telemetry) },
    { name: 'engine-version', passed: evidence.telemetry?.engineVersion === '2.21.3', detail: JSON.stringify(evidence.telemetry) },
    { name: 'road-above-terrain', passed: (evidence.telemetry?.roadClearance ?? 0) >= 0.1, detail: JSON.stringify(evidence.telemetry) },
    { name: 'tornado-above-road', passed: (evidence.telemetry?.tornadoGroundClearance ?? 0) >= 0.18, detail: JSON.stringify(evidence.telemetry) },
    { name: 'scene-populated', passed: (evidence.telemetry?.entityCount ?? 0) >= 40, detail: JSON.stringify(evidence.telemetry) },
    { name: 'qa-mode', passed: evidence.telemetry?.qaMode === true, detail: JSON.stringify(evidence.telemetry) },
    { name: 'dispose-canvas-removed', passed: disposal.canvasPresent === false, detail: JSON.stringify(disposal) },
    { name: 'dispose-global-cleared', passed: disposal.globalPresent === false, detail: JSON.stringify(disposal) },
    { name: 'dispose-ready-cleared', passed: disposal.readyValue === null, detail: JSON.stringify(disposal) },
    { name: 'no-console-errors', passed: consoleErrors.length === 0, detail: JSON.stringify(consoleErrors) },
    { name: 'no-page-errors', passed: pageErrors.length === 0, detail: JSON.stringify(pageErrors) },
  ];

  const failed = checks.filter((item) => !item.passed);
  report = {
    passed: failed.length === 0,
    url,
    checks,
    failedChecks: failed.map((item) => item.name),
    consoleErrors,
    pageErrors,
    evidence,
    disposal,
  };
} catch (error) {
  report = {
    passed: false,
    url,
    failedChecks: ['browser-harness'],
    consoleErrors,
    pageErrors,
    harnessError: error instanceof Error ? error.stack ?? error.message : String(error),
  };
} finally {
  await browser.close();
}

await writeFile(`${evidenceDir}/playcanvas-slice-report.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exit(1);
