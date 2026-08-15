import http from 'node:http';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
const artifactDir = path.resolve('artifacts/sw-ui-006');
await mkdir(artifactDir, { recursive: true });
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
    response.writeHead(200, { 'content-type': mime.get(path.extname(file)) || 'application/octet-stream', 'cache-control': 'no-store' });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end('not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const checks = [];
const errors = [];
const check = (name, pass, detail = '') => {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
};

async function enterGameplay(page) {
  await page.evaluate(() => {
    const menu = document.getElementById('mainMenu');
    if (menu) {
      menu.classList.add('hidden');
      menu.style.display = 'none';
      menu.style.pointerEvents = 'none';
      menu.style.opacity = '0';
      menu.style.visibility = 'hidden';
    }
    gameStarted = true;
    isPaused = false;
    if (typeof resetWarningRun === 'function') resetWarningRun();
    globalThis.__SW_UI_006_APPLY__?.();
  });
  await page.waitForTimeout(360);
}

async function snapshotState(page) {
  return page.evaluate(() => {
    const effectiveHidden = (element) => {
      let node = element;
      while (node && node.nodeType === Node.ELEMENT_NODE) {
        const style = getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || 1) === 0) return true;
        node = node.parentElement;
      }
      return false;
    };
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const r = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return {
        left: r.left, top: r.top, right: r.right, bottom: r.bottom,
        width: r.width, height: r.height,
        display: style.display, visibility: style.visibility, opacity: Number(style.opacity || 0),
        effectivelyHidden: effectiveHidden(element),
      };
    };
    return {
      viewport: { width: innerWidth, height: innerHeight },
      ui006: globalThis.getSwUi006State?.(),
      gate: rect('#swUi006RotateGate'),
      canvas: rect('canvas'),
      footer: rect('.footer'),
      telemetry: rect('.telemetry'),
      controls: rect('.touch-controls'),
      joystick: rect('#joystickZone'),
      labels: ['btnAbility1', 'btnAbility2', 'btnAbility3'].map((id) => {
        const button = document.getElementById(id);
        const spans = button ? Array.from(button.children).filter((node) => node.tagName === 'SPAN') : [];
        return {
          id,
          action: spans[0]?.textContent?.trim() || '',
          hint: spans[1]?.textContent?.trim() || '',
          hintDisplay: spans[1] ? getComputedStyle(spans[1]).display : null,
        };
      }),
    };
  });
}

function hiddenUnderGate(entry) {
  return entry && entry.effectivelyHidden === true;
}

async function createMobileContext(browser, width, height) {
  return browser.newContext({
    viewport: { width, height },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
  });
}

let browser;
try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--enable-webgl', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

  const landscapeContext = await createMobileContext(browser, 844, 390);
  const landscapePage = await landscapeContext.newPage();
  landscapePage.on('pageerror', error => errors.push(String(error.message || error)));
  landscapePage.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await landscapePage.goto(`${origin}/index.html?intro=0`, { waitUntil: 'domcontentloaded' });
  await landscapePage.waitForFunction(() => typeof globalThis.getSwUi006State === 'function' && typeof globalThis.__SW_UI_006_APPLY__ === 'function', null, { timeout: 25000 });
  await enterGameplay(landscapePage);

  const landscape = await snapshotState(landscapePage);
  check('landscapeTouchDetected', landscape.ui006?.touchMode === true, JSON.stringify(landscape.ui006));
  check('landscapeRotateGateHidden', landscape.ui006?.portraitGameplay === false && landscape.gate?.display === 'none', JSON.stringify(landscape.gate));
  check('touchKeyboardHintsHidden', landscape.labels.every((entry) => entry.hintDisplay === 'none'), JSON.stringify(landscape.labels));
  check('touchActionsRemainReadable', landscape.labels.map((entry) => entry.action).join('|') === 'PULL|GUST|ZAP', JSON.stringify(landscape.labels));
  check('landscapeControlsInsideViewport', Boolean(landscape.controls) && landscape.controls.left >= -0.5 && landscape.controls.right <= landscape.viewport.width + 0.5 && landscape.controls.bottom <= landscape.viewport.height + 0.5, JSON.stringify(landscape.controls));
  check('landscapeTelemetryInsideViewport', Boolean(landscape.telemetry) && landscape.telemetry.left >= -0.5 && landscape.telemetry.right <= landscape.viewport.width + 0.5 && landscape.telemetry.bottom <= landscape.viewport.height + 0.5, JSON.stringify(landscape.telemetry));
  check('landscapeFooterNoControlOverlap', Boolean(landscape.telemetry && landscape.controls) && landscape.telemetry.right <= landscape.controls.left + 0.5, JSON.stringify({ telemetry: landscape.telemetry, controls: landscape.controls }));
  await landscapePage.screenshot({ path: path.join(artifactDir, '01_landscape_touch_844x390.png'), fullPage: false });
  await landscapeContext.close();

  const portraitContext = await createMobileContext(browser, 390, 844);
  const portraitPage = await portraitContext.newPage();
  portraitPage.on('pageerror', error => errors.push(String(error.message || error)));
  portraitPage.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await portraitPage.goto(`${origin}/index.html?intro=0`, { waitUntil: 'domcontentloaded' });
  await portraitPage.waitForFunction(() => typeof globalThis.getSwUi006State === 'function' && typeof globalThis.__SW_UI_006_APPLY__ === 'function', null, { timeout: 25000 });
  await enterGameplay(portraitPage);
  const portrait = await snapshotState(portraitPage);
  check('portraitViewportIsNative', portrait.viewport.width === 390 && portrait.viewport.height === 844, JSON.stringify(portrait.viewport));
  check('portraitRotateGateActive', portrait.ui006?.portraitGameplay === true && portrait.gate?.display === 'flex' && portrait.gate?.visibility === 'visible' && portrait.gate?.opacity === 1 && portrait.gate?.effectivelyHidden === false, JSON.stringify(portrait.ui006));
  check('portraitGateCoversViewport', Boolean(portrait.gate) && portrait.gate.left <= 0.5 && portrait.gate.top <= 0.5 && portrait.gate.right >= portrait.viewport.width - 0.5 && portrait.gate.bottom >= portrait.viewport.height - 0.5, JSON.stringify(portrait.gate));
  check('portraitGameplayUnderlayHidden', hiddenUnderGate(portrait.canvas) && hiddenUnderGate(portrait.footer) && hiddenUnderGate(portrait.controls) && hiddenUnderGate(portrait.telemetry) && hiddenUnderGate(portrait.joystick), JSON.stringify({ canvas: portrait.canvas, footer: portrait.footer, controls: portrait.controls, telemetry: portrait.telemetry, joystick: portrait.joystick }));
  check('portraitSuppressionApplied', (portrait.ui006?.suppressedPortraitNodes || 0) >= 4, JSON.stringify(portrait.ui006));
  await portraitPage.screenshot({ path: path.join(artifactDir, '02_portrait_rotate_gate_390x844.png'), fullPage: false });
  await portraitContext.close();

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: false, isMobile: false, serviceWorkers: 'block' });
  const desktopPage = await desktop.newPage();
  desktopPage.on('pageerror', error => errors.push(String(error.message || error)));
  desktopPage.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await desktopPage.goto(`${origin}/index.html?intro=0`, { waitUntil: 'domcontentloaded' });
  await desktopPage.waitForFunction(() => typeof globalThis.getSwUi006State === 'function', null, { timeout: 25000 });
  await enterGameplay(desktopPage);
  const desktopState = await snapshotState(desktopPage);
  check('desktopTouchModeOff', desktopState.ui006?.touchMode === false, JSON.stringify(desktopState.ui006));
  check('desktopKeyboardHintsRemainVisible', desktopState.labels.every((entry) => entry.hintDisplay !== 'none') && desktopState.labels.map((entry) => entry.hint).join('|') === 'SPACE|Q|E', JSON.stringify(desktopState.labels));
  check('desktopRotateGateHidden', desktopState.gate?.display === 'none', JSON.stringify(desktopState.gate));
  await desktopPage.screenshot({ path: path.join(artifactDir, '03_desktop_keyboard_truth_1440x900.png'), fullPage: false });
  await desktop.close();

  check('noRuntimeErrors', errors.length === 0, errors.join(' | '));
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
}

const failed = checks.filter((entry) => !entry.pass);
const report = {
  version: 'SW_UI_006_BROWSER_V3',
  passed: failed.length === 0,
  checks,
  errors,
  evidence: {
    base: 'de2e62835e79567b4bbfc079a372ce2af4ee0879',
    screenshots: [
      'artifacts/sw-ui-006/01_landscape_touch_844x390.png',
      'artifacts/sw-ui-006/02_portrait_rotate_gate_390x844.png',
      'artifacts/sw-ui-006/03_desktop_keyboard_truth_1440x900.png',
    ],
    visualReviewNote: 'Portrait artifact from prior V2 proof was visually clean; V3 measures effective ancestor suppression instead of child computed visibility alone.'
  },
};
await writeFile(path.join(artifactDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`SW-UI-006 browser gate ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
