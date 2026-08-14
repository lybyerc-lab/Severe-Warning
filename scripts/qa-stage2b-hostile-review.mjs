import { chromium } from 'playwright';
import { mkdir, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.SEVERE_WEATHER_REVIEW_URL || 'http://127.0.0.1:4173/';
const outputDir = path.resolve(process.env.SEVERE_WEATHER_REVIEW_DIR || 'qa-artifacts/stage2b-hostile-review');
const sourceRef = process.env.SEVERE_WEATHER_SOURCE_REF || '271e5d3d7b438727df8b217ad59b7974ff1374b6';
await mkdir(outputDir, { recursive: true });
await mkdir(path.join(outputDir, 'video'), { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: [
    '--no-sandbox',
    '--autoplay-policy=no-user-gesture-required',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--enable-webgl',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader'
  ]
});

const report = {
  version: 'SW_QA_009_HOSTILE_REVIEW_V1',
  sourceRef,
  generatedAt: new Date().toISOString(),
  premise: 'Observational hostile internal review. No product behavior is modified by this harness.',
  viewportReviews: {},
  cinematic: { frames: {}, snapshots: {} },
  campaign: { snapshots: [], stageFirstSeen: {}, tornadoMotion: [] },
  stormSites: {},
  errors: [],
  consoleErrors: [],
  httpErrors: [],
  harnessFailures: []
};

const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function wirePage(page, label) {
  page.on('pageerror', error => report.errors.push(`${label}: ${String(error?.stack || error)}`));
  page.on('console', message => {
    if (message.type() === 'error') report.consoleErrors.push(`${label}: ${message.text()}`);
  });
  page.on('response', response => {
    if (response.status() >= 400) report.httpErrors.push(`${label}: ${response.status()} ${response.url()}`);
  });
}

async function createReviewPage(label, viewport = { width: 915, height: 412 }, recordVideo = true) {
  const context = await browser.newContext({
    viewport,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    recordVideo: recordVideo ? { dir: path.join(outputDir, 'video'), size: viewport } : undefined
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  wirePage(page, label);
  return { context, page, label };
}

async function closeReviewPage(handle) {
  const video = handle.page.video();
  await handle.context.close();
  if (video) {
    try {
      const source = await video.path();
      const target = path.join(outputDir, 'video', `${slug(handle.label)}.webm`);
      if (source !== target) await rename(source, target);
    } catch (error) {
      report.harnessFailures.push(`${handle.label}: video finalize failed: ${String(error)}`);
    }
  }
}

async function shot(page, name) {
  const filename = `${name}.png`;
  await page.screenshot({ path: path.join(outputDir, filename), fullPage: false });
  return filename;
}

async function waitForProduct(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForSelector('canvas', { timeout: 60000 });
  await page.waitForFunction(() => typeof globalThis.getNewspaperPresentationQaState === 'function', null, { timeout: 30000 });
}

async function newspaperMetrics(page) {
  return page.evaluate(() => {
    const visible = element => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && rect.width > 0 && rect.height > 0;
    };
    const paper = document.querySelector('.newspaper-front-page');
    const launch = document.getElementById('btnStartMenu');
    const viewport = { width: visualViewport?.width || innerWidth, height: visualViewport?.height || innerHeight };
    const rect = paper?.getBoundingClientRect();
    const launchRect = launch?.getBoundingClientRect();
    const textElements = [...document.querySelectorAll('#mainMenu *')].filter(node => {
      const text = String(node.textContent || '').replace(/\s+/g, ' ').trim();
      return text && node.children.length === 0 && visible(node);
    });
    const fontSizes = textElements.map(node => Number.parseFloat(getComputedStyle(node).fontSize) || 0).filter(Boolean).sort((a, b) => a - b);
    const tiny = textElements.filter(node => (Number.parseFloat(getComputedStyle(node).fontSize) || 0) < 12).map(node => ({
      text: String(node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 90),
      fontSize: getComputedStyle(node).fontSize
    })).slice(0, 30);
    return {
      viewport,
      paper: paper ? {
        clientWidth: paper.clientWidth,
        clientHeight: paper.clientHeight,
        scrollWidth: paper.scrollWidth,
        scrollHeight: paper.scrollHeight,
        scrollTop: paper.scrollTop,
        rect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height, bottom: rect.bottom } : null,
        viewportHeightRatio: rect ? rect.height / Math.max(1, viewport.height) : null,
        contentHeightRatio: paper.scrollHeight / Math.max(1, viewport.height),
        overflowY: getComputedStyle(paper).overflowY
      } : null,
      launch: launch ? {
        visible: visible(launch),
        rect: launchRect ? { x: launchRect.x, y: launchRect.y, width: launchRect.width, height: launchRect.height, bottom: launchRect.bottom } : null,
        withinViewport: launchRect ? launchRect.top >= 0 && launchRect.bottom <= viewport.height : false,
        text: String(launch.textContent || '').replace(/\s+/g, ' ').trim()
      } : null,
      typography: {
        visibleLeafCount: textElements.length,
        minimumPx: fontSizes[0] || null,
        medianPx: fontSizes.length ? fontSizes[Math.floor(fontSizes.length / 2)] : null,
        under12pxCount: tiny.length,
        under12pxExamples: tiny
      },
      presentation: globalThis.getNewspaperPresentationQaState?.() || null
    };
  });
}

async function touchSwipePaper(page) {
  const paperBox = await page.locator('.newspaper-front-page').boundingBox();
  if (!paperBox) return false;
  const client = await page.context().newCDPSession(page);
  const x = Math.round(paperBox.x + paperBox.width * 0.72);
  const startY = Math.round(Math.min(paperBox.y + paperBox.height - 36, (await page.evaluate(() => innerHeight)) - 28));
  const endY = Math.max(Math.round(paperBox.y + 40), 32);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: startY, radiusX: 5, radiusY: 5, force: 1, id: 1 }] });
  for (let step = 1; step <= 8; step += 1) {
    const y = Math.round(startY + (endY - startY) * (step / 8));
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y, radiusX: 5, radiusY: 5, force: 1, id: 1 }] });
    await page.waitForTimeout(35);
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForTimeout(180);
  return true;
}

async function reviewNewspaperViewport(viewport, label) {
  const handle = await createReviewPage(`newspaper-${label}`, viewport, false);
  try {
    await waitForProduct(handle.page);
    const before = await newspaperMetrics(handle.page);
    const topScreenshot = await shot(handle.page, `newspaper-${label}-top`);
    let swipes = 0;
    while (swipes < 5) {
      const current = await newspaperMetrics(handle.page);
      if (current.launch?.withinViewport) break;
      await touchSwipePaper(handle.page);
      swipes += 1;
    }
    const after = await newspaperMetrics(handle.page);
    const launchScreenshot = await shot(handle.page, `newspaper-${label}-launch`);
    report.viewportReviews[label] = { viewport, before, after, swipesToLaunch: swipes, screenshots: [topScreenshot, launchScreenshot] };
  } finally {
    await closeReviewPage(handle);
  }
}

async function cinematicReview(page) {
  await page.waitForFunction(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.().active === true, null, { timeout: 30000 });
  const frames = [
    ['00-newspaper', 0.75],
    ['01-fence-conversation', 2.05],
    ['02-hold', 4.40],
    ['03-double-take', 6.55],
    ['04-last-sip', 8.85],
    ['05-panic-touchdown', 11.35]
  ];
  for (const [label, seconds] of frames) {
    const snapshot = await page.evaluate(value => {
      const bridge = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__;
      bridge.debugSeek(value);
      return bridge.getSnapshot();
    }, seconds);
    await page.waitForTimeout(100);
    const filename = await shot(page, `cinematic-${label}`);
    report.cinematic.frames[label] = filename;
    report.cinematic.snapshots[label] = snapshot;
  }
}

async function gameplayState(page) {
  return page.evaluate(() => {
    const direct = {};
    try {
      direct.runActive = typeof runActive !== 'undefined' ? runActive : null;
      direct.gameStarted = typeof gameStarted !== 'undefined' ? gameStarted : null;
      direct.currentStage = typeof currentStage !== 'undefined' ? currentStage : null;
      direct.time = typeof runTimeRemaining !== 'undefined' ? runTimeRemaining : null;
      direct.score = typeof destructionScore !== 'undefined' ? destructionScore : null;
      direct.combo = typeof comboMultiplier !== 'undefined' ? comboMultiplier : null;
      direct.storm = typeof storm !== 'undefined' && storm?.pos ? { x: storm.pos.x, y: storm.pos.y, z: storm.pos.z } : null;
      direct.camera = typeof camera !== 'undefined' ? { x: camera.position.x, y: camera.position.y, z: camera.position.z } : null;
      direct.fog = typeof scene !== 'undefined' && scene?.fog?.color ? `#${scene.fog.color.getHexString()}` : null;
      direct.background = typeof scene !== 'undefined' && scene?.background?.getHexString ? `#${scene.background.getHexString()}` : null;
    } catch (_) {}
    return direct;
  });
}

async function tornadoState(page) {
  return page.evaluate(() => {
    const found = [];
    try {
      if (typeof scene !== 'undefined' && scene?.traverse) {
        scene.traverse(object => {
          if (!object?.name) return;
          if (!object.name.startsWith('SWVisualSlice6StormShell') && !object.name.startsWith('SWVisualSlice6CondensationStreak')) return;
          found.push({
            name: object.name,
            rotationY: object.rotation?.y ?? null,
            x: object.position?.x ?? null,
            y: object.position?.y ?? null,
            z: object.position?.z ?? null,
            scaleX: object.scale?.x ?? null,
            spin: object.userData?.spin ?? null
          });
        });
      }
    } catch (_) {}
    return found;
  });
}

const movementPattern = [
  ['KeyW'], ['KeyW', 'KeyD'], ['KeyD'], ['KeyS', 'KeyD'],
  ['KeyS'], ['KeyS', 'KeyA'], ['KeyA'], ['KeyW', 'KeyA']
];

async function playVisualPass(page, label, durationMs, options = {}) {
  const active = new Set();
  const setKeys = async keys => {
    for (const key of [...active]) {
      if (!keys.includes(key)) { await page.keyboard.up(key); active.delete(key); }
    }
    for (const key of keys) {
      if (!active.has(key)) { await page.keyboard.down(key); active.add(key); }
    }
  };
  const start = Date.now();
  let moveIndex = 0;
  let nextMove = 0;
  let nextAbility = 0;
  let nextSnapshot = 0;
  let lastStage = null;
  let shotIndex = 0;
  while (Date.now() - start < durationMs) {
    const elapsed = Date.now() - start;
    if (elapsed >= nextMove) {
      await setKeys(movementPattern[moveIndex % movementPattern.length]);
      moveIndex += 1;
      nextMove += 5000;
    }
    if (elapsed >= nextAbility) {
      await page.evaluate(() => {
        if (typeof triggerAbility === 'function') {
          triggerAbility('primary');
          triggerAbility('secondary');
          triggerAbility('tertiary');
        }
      });
      nextAbility += 1050;
    }
    if (elapsed >= nextSnapshot) {
      const state = await gameplayState(page);
      const tornado = await tornadoState(page);
      const filename = await shot(page, `${label}-${String(shotIndex).padStart(2, '0')}-${Math.round(elapsed / 1000)}s-stage-${state.currentStage ?? 'x'}`);
      const entry = { elapsedSeconds: Math.round(elapsed / 1000), state, tornado, screenshot: filename };
      if (options.collectCampaign) {
        report.campaign.snapshots.push(entry);
        report.campaign.tornadoMotion.push({ elapsedSeconds: entry.elapsedSeconds, parts: tornado });
        if (state.currentStage != null && report.campaign.stageFirstSeen[String(state.currentStage)] == null) {
          report.campaign.stageFirstSeen[String(state.currentStage)] = filename;
        }
      } else if (options.siteBucket) {
        options.siteBucket.snapshots.push(entry);
      }
      lastStage = state.currentStage;
      shotIndex += 1;
      nextSnapshot += 12000;
      if (options.stopAfterStage3 && Number(lastStage) === 3 && elapsed > 35000) {
        const stage3Count = report.campaign.snapshots.filter(item => Number(item.state?.currentStage) === 3).length;
        if (stage3Count >= 2) break;
      }
    }
    const state = await gameplayState(page);
    if (state.runActive === false && elapsed > 5000) break;
    await page.waitForTimeout(250);
  }
  await setKeys([]);
}

async function reviewCampaign() {
  const handle = await createReviewPage('campaign-owner-like-915x412', { width: 915, height: 412 }, true);
  try {
    await waitForProduct(handle.page);
    for (let swipes = 0; swipes < 5; swipes += 1) {
      const metrics = await newspaperMetrics(handle.page);
      if (metrics.launch?.withinViewport) break;
      await touchSwipePaper(handle.page);
    }
    await handle.page.locator('#btnStartMenu').click();
    await cinematicReview(handle.page);
    await handle.page.evaluate(() => globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.finish?.('review-handoff'));
    await handle.page.waitForFunction(() => typeof runActive !== 'undefined' && runActive === true, null, { timeout: 30000 });
    await shot(handle.page, 'campaign-gameplay-handoff');
    await playVisualPass(handle.page, 'campaign', 205000, { collectCampaign: true, stopAfterStage3: true });
  } catch (error) {
    report.harnessFailures.push(`campaign: ${String(error?.stack || error)}`);
  } finally {
    await closeReviewPage(handle);
  }
}

async function reviewStormSite(siteId) {
  const label = `site-${siteId}-915x412`;
  const handle = await createReviewPage(label, { width: 915, height: 412 }, true);
  const bucket = { siteId, snapshots: [], launchSnapshot: null };
  report.stormSites[siteId] = bucket;
  try {
    await waitForProduct(handle.page);
    bucket.launchSnapshot = await handle.page.evaluate(id => globalThis.__SW_STORM_SITE_QA__?.launch?.(id), siteId);
    await handle.page.waitForFunction(() => typeof runActive !== 'undefined' && runActive === true, null, { timeout: 30000 });
    bucket.firstFrame = await shot(handle.page, `${slug(siteId)}-first-playable-frame`);
    await playVisualPass(handle.page, `site-${slug(siteId)}`, 70000, { siteBucket: bucket });
  } catch (error) {
    report.harnessFailures.push(`${siteId}: ${String(error?.stack || error)}`);
  } finally {
    await closeReviewPage(handle);
  }
}

try {
  await reviewNewspaperViewport({ width: 915, height: 412 }, 'large-phone-915x412');
  await reviewNewspaperViewport({ width: 844, height: 390 }, 'short-phone-844x390');
  await reviewCampaign();
  await reviewStormSite('county-fair');
  await reviewStormSite('coastal-boardwalk');
} finally {
  await browser.close();
}

report.completedAt = new Date().toISOString();
report.summary = {
  campaignStagesSeen: Object.keys(report.campaign.stageFirstSeen),
  campaignSnapshots: report.campaign.snapshots.length,
  countyFairSnapshots: report.stormSites['county-fair']?.snapshots?.length || 0,
  coastalBoardwalkSnapshots: report.stormSites['coastal-boardwalk']?.snapshots?.length || 0,
  cinematicFrames: Object.keys(report.cinematic.frames).length,
  pageErrors: report.errors.length,
  consoleErrors: report.consoleErrors.length,
  httpErrors: report.httpErrors.length,
  harnessFailures: report.harnessFailures.length
};
await writeFile(path.join(outputDir, 'hostile-review-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await writeFile(path.join(outputDir, 'README.txt'), [
  'SW-QA-009 hostile Stage 2B review evidence',
  `Exact product source: ${sourceRef}`,
  'This directory is observational evidence only. The harness does not edit product behavior.',
  'Review targets: newspaper scale/readability, opening cinematic composition, campaign environmental repetition, tornado motion readability, County Fair identity, Coastal Boardwalk identity.',
  `Campaign stages seen: ${report.summary.campaignStagesSeen.join(', ') || 'none'}`,
  `Harness failures: ${report.summary.harnessFailures}`,
  `Runtime/page/HTTP errors: ${report.summary.consoleErrors}/${report.summary.pageErrors}/${report.summary.httpErrors}`,
  ''
].join('\n'), 'utf8');

console.log(JSON.stringify(report.summary, null, 2));
if (report.harnessFailures.length) process.exitCode = 1;
