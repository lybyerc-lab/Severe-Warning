import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(process.env.SEVERE_WEATHER_WWW_DIR || 'www');
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
  await page.waitForFunction(() => typeof globalThis.getSwQuality002State === 'function', null, { timeout: 20000 });
  await page.waitForSelector('#mainMenu .menu-card.newspaper-front-page', { timeout: 20000 });

  const newspaper = await page.evaluate(() => {
    renderer.render(scene, camera);
    const card = document.querySelector('#mainMenu .menu-card.newspaper-front-page');
    const grid = card.querySelector('.storm-select-grid');
    const heading = grid.querySelector('.storm-card h3');
    const launch = document.getElementById('btnStartMenu');
    const siteCard = document.getElementById('stormSiteCard-county-fair');
    const siteHeading = siteCard?.querySelector('h3');
    const launchRect = launch.getBoundingClientRect();
    const visiblePrototype = [...document.querySelectorAll('body *')].some(element => {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      const text = String(element.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase();
      return element.children.length === 0 && (text.includes('THREE.JS PRODUCTION SLICE') || text.startsWith('VISUALS:'));
    });
    return {
      columns: getComputedStyle(grid).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
      headingPx: Number.parseFloat(getComputedStyle(heading).fontSize),
      cardClientHeight: card.clientHeight,
      cardScrollHeight: card.scrollHeight,
      visualHeight: visualViewport?.height || innerHeight,
      launchTop: launchRect.top,
      launchBottom: launchRect.bottom,
      siteBackground: siteCard ? getComputedStyle(siteCard).backgroundColor : '',
      siteHeadingColor: siteHeading ? getComputedStyle(siteHeading).color : '',
      visiblePrototype,
    };
  });
  check('phoneNewspaperUsesThreeColumns', newspaper.columns === 3, `${newspaper.columns} columns`);
  check('phoneNewspaperHeadingReadable', newspaper.headingPx >= 11, `${newspaper.headingPx}px`);
  check('phoneNewspaperFitsWithoutScroll', newspaper.cardScrollHeight <= newspaper.cardClientHeight + 3, `${newspaper.cardScrollHeight}/${newspaper.cardClientHeight}`);
  check('phoneNewspaperLaunchVisibleImmediately', newspaper.launchTop >= 0 && newspaper.launchBottom <= newspaper.visualHeight + 1, `${newspaper.launchTop.toFixed(1)}..${newspaper.launchBottom.toFixed(1)}`);
  check('stormSiteCardsRecoverPaperReadability', !newspaper.siteBackground.includes('12, 74, 110') && Boolean(newspaper.siteHeadingColor), `${newspaper.siteBackground} / ${newspaper.siteHeadingColor}`);
  check('prototypeChromeHiddenFromPlayer', newspaper.visiblePrototype === false);

  const fair = await page.evaluate(() => {
    globalThis.__SW_STORM_SITE_QA__.launch('county-fair');
    renderer.render(scene, camera);
    const state = globalThis.getSwQuality002State();
    const site = globalThis.getStormSiteQaState();
    return {
      profile: state.siteProfile,
      openingActive: globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.().active,
      bypasses: state.stormSiteOpeningBypasses,
      fairGround: Boolean(scene.getObjectByName('SWQuality002FairGround')),
      fairBulbs: scene.getObjectByName('SWQuality002SiteIdentity:county-fair')?.children?.filter(item => item.name.startsWith('SWQuality002FairBulb')).length || 0,
      selectedSiteId: site.selectedSiteId,
      background: scene.background?.getHexString?.() || '',
    };
  });
  check('countyFairLaunchesDirectWithoutHeartlandOpening', fair.selectedSiteId === 'county-fair' && fair.openingActive === false && fair.bypasses >= 1, JSON.stringify(fair));
  check('countyFairHasDistinctWorldIdentity', fair.profile === 'county-fair-after-dark' && fair.fairGround && fair.fairBulbs >= 12, JSON.stringify(fair));

  await page.evaluate(() => quitToMainMenu());
  const coast = await page.evaluate(() => {
    globalThis.__SW_STORM_SITE_QA__.launch('coastal-boardwalk');
    renderer.render(scene, camera);
    const state = globalThis.getSwQuality002State();
    return {
      profile: state.siteProfile,
      openingActive: globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.().active,
      ocean: Boolean(scene.getObjectByName('SWQuality002CoastalOcean')),
      lighthouse: Boolean(scene.getObjectByName('SWQuality002LighthouseTower')),
      foam: scene.getObjectByName('SWQuality002SiteIdentity:coastal-boardwalk')?.children?.filter(item => item.name.startsWith('SWQuality002CoastalFoam')).length || 0,
      selectedSiteId: globalThis.getStormSiteQaState().selectedSiteId,
      background: scene.background?.getHexString?.() || '',
    };
  });
  check('coastalLaunchesDirectWithoutHeartlandOpening', coast.selectedSiteId === 'coastal-boardwalk' && coast.openingActive === false, JSON.stringify(coast));
  check('coastalHasDistinctWorldIdentity', coast.profile === 'gullwind-storm-coast' && coast.ocean && coast.lighthouse && coast.foam >= 8, JSON.stringify(coast));
  check('siteAtmospheresAreMateriallyDifferent', fair.background && coast.background && fair.background !== coast.background, `${fair.background} vs ${coast.background}`);

  await page.evaluate(() => quitToMainMenu());
  await page.click('#btnStartMenu');
  await page.waitForFunction(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.().active === true, null, { timeout: 15000 });
  const cinematic = await page.evaluate(() => {
    globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.debugSeek(6.35);
    renderer.render(scene, camera);
    const state = globalThis.getSwQuality002State();
    const foreleg = scene.getObjectByName('cow17-right-upper-foreleg');
    const paper = scene.getObjectByName('SWCinematicNewspaper');
    const visiblePrototype = [...document.querySelectorAll('body *')].some(element => {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
      const text = String(element.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase();
      return element.children.length === 0 && text.includes('THREE.JS PRODUCTION SLICE');
    });
    return {
      torso: state.cowTorsoGeometry,
      foreleg: foreleg?.geometry?.type || null,
      fov: camera.fov,
      paperVisible: Boolean(paper?.visible),
      prototypeVisible: visiblePrototype,
      polishedSessions: state.cinematicPolishedSessions,
      barnTrim: Boolean(scene.getObjectByName('SWQuality002CinematicBarnTrim')),
    };
  });
  check('openingUsesRoundedActorMasses', cinematic.torso === 'SphereGeometry' && cinematic.foreleg === 'CylinderGeometry', JSON.stringify(cinematic));
  check('openingDropsGhostNewspaperAfterColdOpen', cinematic.paperVisible === false, JSON.stringify(cinematic));
  check('openingUsesTighterCinematicFraming', cinematic.fov <= 29 && cinematic.polishedSessions >= 1, JSON.stringify(cinematic));
  check('openingAddsPresentationDetailAndRemovesPrototypeBadge', cinematic.barnTrim && cinematic.prototypeVisible === false, JSON.stringify(cinematic));
  await page.evaluate(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__.finish('quality-002-qa'));

  const storm = await page.evaluate(() => {
    globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView?.('slice6-storm');
    for (let index = 0; index < 3; index += 1) globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.update?.(0.1, 1000 + index * 100);
    const before = globalThis.getSwQuality002State().stormVolume;
    for (let index = 0; index < 10; index += 1) globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.update?.(0.1, 1500 + index * 100);
    renderer.render(scene, camera);
    const after = globalThis.getSwQuality002State().stormVolume;
    const prior = new Map(before.sample.map(item => [item.name, item.y]));
    const moving = after.sample.filter(item => Math.abs(item.y - (prior.get(item.name) || 0)) >= 0.3).length;
    return { before, after, moving };
  });
  check('tornadoHasDirtyWholeColumnVolume', storm.after?.puffCount >= 18 && storm.after?.groundDustCount >= 9, JSON.stringify(storm.after));
  check('tornadoVolumeCirculatesVisibly', storm.moving >= 5, `moving=${storm.moving}`);

  check('noPageErrors', pageErrors.length === 0, pageErrors.join(' | '));
  check('noRuntimeConsoleErrors', consoleErrors.length === 0, consoleErrors.join(' | '));
  check('noHttpErrors', httpErrors.length === 0, httpErrors.join(' | '));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

const failed = checks.filter(item => !item.pass);
console.log(`SW-QUALITY-002 browser QA ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exit(1);
