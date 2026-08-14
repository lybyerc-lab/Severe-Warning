import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.wav', 'audio/wav'],
  ['.woff2', 'font/woff2'],
]);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root)) throw new Error('outside root');
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not file');
    const body = await readFile(file);
    response.writeHead(200, { 'content-type': mime.get(path.extname(file)) || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('not found');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 844, height: 390 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const pageErrors = [];
const consoleErrors = [];
const httpErrors = [];
page.on('pageerror', error => pageErrors.push(String(error.message || error)));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) httpErrors.push(`${response.status()} ${response.url()}`); });

const checks = [];
function check(name, pass, detail = '') {
  checks.push({ name, pass: Boolean(pass), detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

try {
  await page.goto(`${origin}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#mainMenu .menu-card.newspaper-front-page', { timeout: 20000 });
  await page.waitForFunction(() => typeof globalThis.getSwQuality001State === 'function', null, { timeout: 20000 });

  const newspaper = await page.evaluate(() => {
    const card = document.querySelector('#mainMenu .menu-card.newspaper-front-page');
    const lead = document.querySelector('.newspaper-lead');
    const heading = document.querySelector('#mainMenu .newspaper-front-page .storm-card h3');
    const body = document.querySelector('#mainMenu .newspaper-front-page .storm-card p');
    const launch = document.getElementById('btnStartMenu');
    card.scrollTop = card.scrollHeight;
    const rect = launch.getBoundingClientRect();
    return {
      cardClientHeight: card.clientHeight,
      cardScrollHeight: card.scrollHeight,
      overflowY: getComputedStyle(card).overflowY,
      leadPx: Number.parseFloat(getComputedStyle(lead).fontSize),
      headingPx: Number.parseFloat(getComputedStyle(heading).fontSize),
      bodyDisplay: getComputedStyle(body).display,
      visualHeight: globalThis.visualViewport?.height || innerHeight,
      launchTop: rect.top,
      launchBottom: rect.bottom,
    };
  });
  check('newspaperReadableLead', newspaper.leadPx >= 10, `${newspaper.leadPx}px`);
  check('newspaperReadableHeadings', newspaper.headingPx >= 14, `${newspaper.headingPx}px`);
  check('newspaperRemovesLowValueBodyDensity', newspaper.bodyDisplay === 'none', newspaper.bodyDisplay);
  check('newspaperScrollableWhenNeeded', ['auto', 'scroll'].includes(newspaper.overflowY), newspaper.overflowY);
  check('newspaperFitsVisualViewport', newspaper.cardClientHeight <= newspaper.visualHeight, `${newspaper.cardClientHeight}/${newspaper.visualHeight}`);
  check('unleashReachableAfterOrdinaryScroll', newspaper.launchTop >= 0 && newspaper.launchBottom <= newspaper.visualHeight + 1, `${newspaper.launchTop.toFixed(1)}..${newspaper.launchBottom.toFixed(1)}`);

  const pause = await page.evaluate(() => {
    const overlay = document.getElementById('pauseOverlay');
    overlay.classList.add('active');
    const card = overlay.querySelector('.pause-card');
    const lastButton = [...card.querySelectorAll('.pause-btn')].at(-1);
    card.scrollTop = card.scrollHeight;
    lastButton?.scrollIntoView({ block: 'end' });
    const rect = lastButton?.getBoundingClientRect();
    return {
      clientHeight: card.clientHeight,
      scrollHeight: card.scrollHeight,
      overflowY: getComputedStyle(card).overflowY,
      visualHeight: globalThis.visualViewport?.height || innerHeight,
      lastTop: rect?.top ?? -1,
      lastBottom: rect?.bottom ?? -1,
    };
  });
  check('pauseCardContained', pause.clientHeight <= pause.visualHeight, `${pause.clientHeight}/${pause.visualHeight}`);
  check('pauseCardHasScrollEscape', ['auto', 'scroll'].includes(pause.overflowY), pause.overflowY);
  check('pauseMainMenuReachable', pause.lastTop >= 0 && pause.lastBottom <= pause.visualHeight + 1, `${pause.lastTop.toFixed(1)}..${pause.lastBottom.toFixed(1)}`);
  await page.evaluate(() => document.getElementById('pauseOverlay')?.classList.remove('active'));

  await page.waitForFunction(() => {
    const state = globalThis.getSwQuality001State?.();
    return Boolean(state?.tornadoSample?.visibleChildren?.length >= 4);
  }, null, { timeout: 20000 });
  const motion = await page.evaluate(() => {
    const before = globalThis.getSwQuality001State().tornadoSample;
    for (let index = 0; index < 12; index += 1) {
      globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.update?.(0.1, 1000 + index * 100);
    }
    const after = globalThis.getSwQuality001State().tornadoSample;
    const beforeByName = new Map(before.visibleChildren.map(item => [item.name, item]));
    const changed = after.visibleChildren
      .map(item => {
        const prior = beforeByName.get(item.name);
        return prior ? { name: item.name, delta: Math.abs(item.y - prior.y) + Math.abs(item.x - prior.x) + Math.abs(item.z - prior.z) } : null;
      })
      .filter(Boolean)
      .filter(item => item.delta >= 0.12);
    return { before, after, changed };
  });
  const columnMotion = motion.changed.filter(item => item.name.startsWith('SWVisualSlice6CondensationStreak'));
  const groundMotion = motion.changed.filter(item => item.name.startsWith('SWVisualSlice6Ground'));
  check('wholeColumnVisibleMotion', columnMotion.length >= 4, columnMotion.map(item => `${item.name}:${item.delta.toFixed(2)}`).join(', '));
  check('lowerCirculationVisibleMotion', groundMotion.length >= 1, groundMotion.map(item => `${item.name}:${item.delta.toFixed(2)}`).join(', '));

  await page.evaluate(() => {
    document.getElementById('resultsOverlay')?.classList.add('active');
    document.getElementById('pauseOverlay')?.classList.add('active');
    quitToMainMenu();
  });
  const quit = await page.evaluate(() => ({
    state: globalThis.getSwQuality001State(),
    resultsActive: document.getElementById('resultsOverlay')?.classList.contains('active'),
    pauseActive: document.getElementById('pauseOverlay')?.classList.contains('active'),
    menuHidden: document.getElementById('mainMenu')?.classList.contains('hidden'),
  }));
  check('quitEndsRunState', quit.state.runActive === false && quit.state.gameStarted === false, JSON.stringify({ runActive: quit.state.runActive, gameStarted: quit.state.gameStarted }));
  check('quitClearsRunOverlays', quit.resultsActive === false && quit.pauseActive === false, JSON.stringify({ resultsActive: quit.resultsActive, pauseActive: quit.pauseActive }));
  check('quitReturnsMenu', quit.menuHidden === false, `menuHidden=${quit.menuHidden}`);

  check('noPageErrors', pageErrors.length === 0, pageErrors.join(' | '));
  check('noRuntimeConsoleErrors', consoleErrors.length === 0, consoleErrors.join(' | '));
  check('noHttpErrors', httpErrors.length === 0, httpErrors.join(' | '));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

const failed = checks.filter(item => !item.pass);
console.log(`SW-QUALITY-001 browser QA ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
