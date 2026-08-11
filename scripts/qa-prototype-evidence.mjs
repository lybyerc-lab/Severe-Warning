import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = path.resolve(process.env.SEVERE_WEATHER_PROTOTYPE_DIR || path.join(projectRoot, 'prototype-evidence'));
const baseUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
const profileName = process.env.SEVERE_WEATHER_PROTOTYPE_PROFILE || 'mobile-default';
const sourceCommit = process.env.SEVERE_WEATHER_PROTOTYPE_SOURCE_COMMIT || 'local';
const sourceRef = process.env.SEVERE_WEATHER_PROTOTYPE_SOURCE_REF || 'local';
const prototypeTaskId = process.env.SEVERE_WEATHER_PROTOTYPE_TASK_ID || 'local-prototype';
const profiles = {
  'mobile-default': { width: 932, height: 430, isMobile: true },
  'mobile-landscape': { width: 932, height: 430, isMobile: true },
  'mobile-portrait': { width: 430, height: 932, isMobile: true },
};
const profile = profiles[profileName];

if (!profile) throw new Error(`Unknown prototype screenshot profile: ${profileName}`);
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const context = await browser.newContext({ viewport: profile, deviceScaleFactor: 1, isMobile: profile.isMobile, hasTouch: profile.isMobile });
const page = await context.newPage();
const pageErrors = [];
const consoleErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });

try {
  await page.addInitScript(() => {
    globalThis.__SW_PROTOTYPE_KEYDOWN_SEEN__ = false;
    document.addEventListener('keydown', () => { globalThis.__SW_PROTOTYPE_KEYDOWN_SEEN__ = true; }, { once: true });
  });
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => globalThis.__SW_PRODUCTION_SLICE_READY__ === true
    && globalThis.__SW_MODERN_SHELL_READY__ === true
    && globalThis.__SEVERE_WEATHER__?.architecture === 'modern-shell-v1'
    && document.querySelector('#webgl') instanceof HTMLCanvasElement, null, { timeout: 20000 });
  await page.locator('#btnStartMenu').click();
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(250);
  await page.keyboard.up('KeyW');
  const runtime = await page.evaluate(async () => {
    const frames = await new Promise(resolve => requestAnimationFrame(first => requestAnimationFrame(second => resolve([first, second]))));
    const canvas = document.querySelector('#webgl');
    const lifecycle = globalThis.__SEVERE_WEATHER__?.app?.getStatus?.() || null;
    return {
      architecture: globalThis.__SEVERE_WEATHER__?.architecture || null,
      lifecycle,
      canvas: { width: canvas?.width || 0, height: canvas?.height || 0 },
      keydownSeen: globalThis.__SW_PROTOTYPE_KEYDOWN_SEEN__ === true,
      renderFramesAdvanced: Array.isArray(frames) && frames[1] > frames[0],
      menuHidden: document.querySelector('#mainMenu')?.style?.display === 'none',
    };
  });
  await page.screenshot({ path: path.join(outputDir, 'mobile-screenshot.png'), fullPage: false });
  const checks = {
    prototypeOnly: true,
    modernShell: runtime.architecture === 'modern-shell-v1',
    booted: ['ready', 'running', 'paused'].includes(runtime.lifecycle?.state),
    canvasRendered: runtime.canvas.width > 0 && runtime.canvas.height > 0 && runtime.renderFramesAdvanced,
    basicControlInputDelivered: runtime.keydownSeen,
    runStarted: runtime.menuHidden || runtime.lifecycle?.state === 'running',
    noPageErrors: pageErrors.length === 0,
    noConsoleErrors: consoleErrors.length === 0,
  };
  const report = {
    version: 'SEVERE_WEATHER_PROTOTYPE_SMOKE_V1',
    authority: 'PROTOTYPE ONLY - NOT PRODUCTION QA',
    productionAuthority: false,
    qaPagesDispatched: false,
    sourceCommit,
    sourceRef,
    prototypeTaskId,
    screenshotProfile: profileName,
    screenshot: 'mobile-screenshot.png',
    runtime,
    checks,
    pageErrors,
    consoleErrors,
    passed: Object.values(checks).every(Boolean),
  };
  await writeFile(path.join(outputDir, 'prototype-evidence-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`${report.passed ? 'PASS' : 'FAIL'} PROTOTYPE ONLY - NOT PRODUCTION QA :: ${JSON.stringify(checks)}`);
  if (!report.passed) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
