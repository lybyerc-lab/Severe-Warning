import http from 'node:http';
import { mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
const out = path.resolve(process.env.SW_QUALITY_001_VISUAL_DIR || 'artifacts/sw-quality-001-visual');
await mkdir(out, { recursive: true });

const mime = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.wav', 'audio/wav'], ['.woff2', 'font/woff2'],
]);
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://127.0.0.1');
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, relative);
    if (!file.startsWith(root)) throw new Error('outside root');
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not file');
    response.writeHead(200, { 'content-type': mime.get(path.extname(file)) || 'application/octet-stream' });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });

async function freshPage() {
  const page = await context.newPage();
  await page.goto(`${origin}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.getSwQuality001State === 'function', null, { timeout: 20000 });
  return page;
}

try {
  {
    const page = await freshPage();
    await page.screenshot({ path: path.join(out, '01-newspaper-top.png') });
    await page.evaluate(() => {
      const card = document.querySelector('#mainMenu .menu-card.newspaper-front-page');
      if (card) card.scrollTop = card.scrollHeight;
    });
    await page.screenshot({ path: path.join(out, '02-newspaper-bottom.png') });
    await page.close();
  }

  {
    const page = await freshPage();
    await page.click('#btnStartMenu');
    await page.waitForFunction(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.().active === true, null, { timeout: 15000 });
    for (const [label, seconds] of [['03-opening-fence', 0.8], ['04-opening-double-take', 6.35], ['05-opening-last-sip', 8.65], ['06-opening-touchdown', 11.45]]) {
      await page.evaluate(seconds => {
        globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.debugSeek(seconds);
        renderer.render(scene, camera);
      }, seconds);
      await page.screenshot({ path: path.join(out, `${label}.png`) });
    }
    await page.close();
  }

  {
    const page = await freshPage();
    await page.evaluate(() => {
      document.getElementById('mainMenu')?.classList.add('hidden');
      globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.refreshHeroSlice6?.();
      camera.position.set(105, 52, 118);
      camera.lookAt(0, 10, 0);
      renderer.render(scene, camera);
    });
    await page.screenshot({ path: path.join(out, '07-heartland-world.png') });
    await page.close();
  }

  for (const [siteId, fileName] of [['county-fair', '08-county-fair.png'], ['coastal-boardwalk', '09-coastal-boardwalk.png']]) {
    const page = await freshPage();
    await page.evaluate(siteId => {
      globalThis.__SW_STORM_SITE_QA__?.launch?.(siteId);
      globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__?.hideIntro?.();
      camera.position.set(155, 82, 165);
      camera.lookAt(0, 6, 0);
      renderer.render(scene, camera);
    }, siteId);
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(out, fileName) });
    await page.close();
  }

  {
    const page = await freshPage();
    await page.evaluate(() => {
      document.getElementById('mainMenu')?.classList.add('hidden');
      globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView?.('slice6-storm');
      renderer.render(scene, camera);
    });
    await page.screenshot({ path: path.join(out, '10-tornado-motion-a.png') });
    await page.evaluate(() => {
      for (let index = 0; index < 14; index += 1) globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.update?.(0.1, 1000 + index * 100);
      renderer.render(scene, camera);
    });
    await page.screenshot({ path: path.join(out, '11-tornado-motion-b.png') });
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

console.log(`SW-QUALITY-001 visual review captures written to ${out}`);
