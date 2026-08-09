import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'threejs-hero-slice6');
const qaUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const report = {
  version: 'THREEJS_HERO_SLICE6_QA_V1',
  generatedAt: new Date().toISOString(),
  passed: false,
  defaultStorm: null,
  mainStreet: null,
  farmEdge: null,
  failures: [],
};

function requireCondition(condition, message) {
  if (!condition) report.failures.push(message);
}

async function createPage() {
  const page = await browser.newPage({ viewport: { width: 932, height: 430 } });
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  await page.addInitScript(() => {
    try { localStorage.removeItem('severe_weather_cosmetics_v1'); } catch (_) {}
  });
  await page.goto(`${qaUrl}?qa=1&intro=0&assetPipeline=1&visualFoundation=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot === 'function');
  await page.waitForFunction(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.().heroSlice5Version === 'THREEJS_VISUAL_HERO_SLICE5_V1');
  await page.waitForFunction(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.().heroSlice6Version === 'THREEJS_VISUAL_HERO_SLICE6_V1');
  await page.waitForFunction(() => globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getSnapshot?.().appliedCount >= 1);
  await page.waitForFunction(() => {
    const visual = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.();
    return visual?.worldIdentity?.rootPresent === true && visual?.stormSilhouette?.rootPresent === true;
  });
  return { page, errors };
}

async function snapshot(page) {
  return page.evaluate(() => ({
    visual: globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.() || null,
    gameplayAnimalCount: typeof animals !== 'undefined' && Array.isArray(animals) ? animals.length : -1,
    neonSelected: typeof neonFunnelUnlocked !== 'undefined' ? neonFunnelUnlocked === true : null,
  }));
}

async function slice6Probe(page) {
  return page.evaluate(() => {
    const stormRoot = scene?.getObjectByName?.('SWVisualHeroSlice6StormSilhouette') || null;
    const worldRoot = scene?.getObjectByName?.('SWVisualHeroSlice6WorldIdentity') || null;
    const shells = stormRoot?.children?.filter?.((entry) => entry.name?.startsWith('SWVisualSlice6StormShell')) || [];
    let warpedShellCount = 0;
    let lateralCenterOffset = 0;
    shells.forEach((shell, shellIndex) => {
      if (shell.geometry?.userData?.swSlice6Warped === true) warpedShellCount += 1;
      if (shellIndex !== 0) return;
      const position = shell.geometry?.getAttribute?.('position');
      if (!position || !position.count) return;
      let minY = Infinity;
      let maxY = -Infinity;
      for (let index = 0; index < position.count; index += 1) {
        minY = Math.min(minY, position.getY(index));
        maxY = Math.max(maxY, position.getY(index));
      }
      const span = Math.max(0.001, maxY - minY);
      const accum = { topX: 0, topZ: 0, topN: 0, lowX: 0, lowZ: 0, lowN: 0 };
      for (let index = 0; index < position.count; index += 1) {
        const mix = (position.getY(index) - minY) / span;
        if (mix >= 0.78) {
          accum.topX += position.getX(index);
          accum.topZ += position.getZ(index);
          accum.topN += 1;
        } else if (mix <= 0.22) {
          accum.lowX += position.getX(index);
          accum.lowZ += position.getZ(index);
          accum.lowN += 1;
        }
      }
      if (accum.topN && accum.lowN) {
        const topX = accum.topX / accum.topN;
        const topZ = accum.topZ / accum.topN;
        const lowX = accum.lowX / accum.lowN;
        const lowZ = accum.lowZ / accum.lowN;
        lateralCenterOffset = Math.hypot(topX - lowX, topZ - lowZ);
      }
    });

    let slice6PresentationObjectCount = 0;
    let buildingIdentityGroups = 0;
    scene?.traverse?.((object) => {
      if (!String(object?.name || '').startsWith('SWVisualSlice6')) return;
      slice6PresentationObjectCount += 1;
      if (String(object.name).startsWith('SWVisualSlice6BuildingIdentity')) buildingIdentityGroups += 1;
    });

    const inheritedShellOpacities = [];
    scene?.getObjectByName?.('SWVisualHeroSlice4StormVolume')?.children?.forEach?.((object) => {
      if (object.name?.startsWith('SWVisualSlice4VolumeShell') && Number.isFinite(object.material?.opacity)) {
        inheritedShellOpacities.push(Number(object.material.opacity));
      }
    });

    return {
      stormRootPresent: Boolean(stormRoot?.parent),
      worldRootPresent: Boolean(worldRoot?.parent),
      warpedShellCount,
      lateralCenterOffset,
      edgeWispCount: stormRoot?.children?.filter?.((entry) => entry.name?.startsWith('SWVisualSlice6EdgeWisp')).length || 0,
      groundBurstCount: stormRoot?.children?.filter?.((entry) => entry.name?.startsWith('SWVisualSlice6GroundBurst')).length || 0,
      buildingIdentityGroups,
      serviceAlleyPresent: Boolean(scene?.getObjectByName?.('SWVisualSlice6ServiceAlley')),
      farmFencePresent: Boolean(scene?.getObjectByName?.('SWVisualSlice6FarmFencePosts')),
      farmDitchPresent: Boolean(scene?.getObjectByName?.('SWVisualSlice6FarmDitch')),
      roadsideClumpsPresent: Boolean(scene?.getObjectByName?.('SWVisualSlice6RoadsideClumps')),
      inheritedShellMaxOpacity: inheritedShellOpacities.length ? Math.max(...inheritedShellOpacities) : null,
      defaultFunnelOpacity: typeof funnelMat !== 'undefined' ? Number(funnelMat.opacity) : null,
      slice6PresentationObjectCount,
      rainbowRootPresent: Boolean(scene?.getObjectByName?.('SWVisualHeroSlice5RainbowFunnel')?.parent),
    };
  });
}

const stormPage = await createPage();
try {
  const prepared = await stormPage.page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('slice6-storm'));
  requireCondition(prepared === true, 'Slice 6 storm QA view did not prepare.');
  await stormPage.page.waitForTimeout(260);
  report.defaultStorm = await snapshot(stormPage.page);
  report.defaultStorm.probe = await slice6Probe(stormPage.page);
  await stormPage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice6-default-storm.png'), fullPage: true });

  const visual = report.defaultStorm.visual;
  const probe = report.defaultStorm.probe;
  requireCondition(report.defaultStorm.neonSelected === false, 'Neon must remain OFF for the default Slice 6 storm evidence.');
  requireCondition(visual?.rainbowFunnel?.enabled === false && probe?.rainbowRootPresent === false, 'Slice 6 default storm unexpectedly forced the Neon rainbow cosmetic.');
  requireCondition(visual?.heroSlice5Version === 'THREEJS_VISUAL_HERO_SLICE5_V1', `Inherited Hero Slice 5 version mismatch: ${visual?.heroSlice5Version}.`);
  requireCondition(visual?.heroSlice6Version === 'THREEJS_VISUAL_HERO_SLICE6_V1', `Hero Slice 6 version mismatch: ${visual?.heroSlice6Version}.`);
  requireCondition(visual?.stormSilhouette?.profile === 'asymmetric-storm-v1', `Unexpected Slice 6 storm profile ${visual?.stormSilhouette?.profile}.`);
  requireCondition(probe?.stormRootPresent === true, 'Slice 6 storm silhouette root is missing.');
  requireCondition(Number(probe?.warpedShellCount) >= 3, `Only ${probe?.warpedShellCount} warped storm shells are active.`);
  requireCondition(Number(probe?.lateralCenterOffset) >= 0.25, `Storm shell centerline is still too geometrically straight: ${probe?.lateralCenterOffset}.`);
  requireCondition(Number(probe?.edgeWispCount) >= 14, `Only ${probe?.edgeWispCount} edge wisps are active.`);
  requireCondition(Number(probe?.groundBurstCount) >= 9, `Only ${probe?.groundBurstCount} irregular ground bursts are active.`);
  requireCondition(Number(probe?.inheritedShellMaxOpacity) <= 0.09, `Inherited Slice 4 cone shells remain too dominant: ${probe?.inheritedShellMaxOpacity}.`);
  requireCondition(Number(probe?.defaultFunnelOpacity) <= 0.22, `Legacy funnel remains too opaque in default mode: ${probe?.defaultFunnelOpacity}.`);
  requireCondition(Number(probe?.slice6PresentationObjectCount) <= 140, `Slice 6 presentation object budget exceeded: ${probe?.slice6PresentationObjectCount}.`);
  requireCondition(!visual?.heroSlice6LastError, `Slice 6 runtime error: ${visual?.heroSlice6LastError}.`);
  if (stormPage.errors.length) report.failures.push(`Storm browser errors: ${stormPage.errors.join(' | ')}`);
} finally {
  await stormPage.page.close();
}

const streetPage = await createPage();
try {
  const prepared = await streetPage.page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('slice6-street'));
  requireCondition(prepared === true, 'Slice 6 main-street QA view did not prepare.');
  await streetPage.page.waitForTimeout(220);
  report.mainStreet = await snapshot(streetPage.page);
  report.mainStreet.probe = await slice6Probe(streetPage.page);
  await streetPage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice6-main-street.png'), fullPage: true });

  const visual = report.mainStreet.visual;
  const probe = report.mainStreet.probe;
  requireCondition(visual?.worldIdentity?.profile === 'authored-main-street-v1', `Unexpected world identity profile ${visual?.worldIdentity?.profile}.`);
  requireCondition(probe?.worldRootPresent === true, 'Slice 6 world identity root is missing.');
  requireCondition(Number(probe?.buildingIdentityGroups) >= 4, `Only ${probe?.buildingIdentityGroups} nearby buildings received authored identity kits.`);
  requireCondition(visual?.worldIdentity?.transitionCount >= 6, `Only ${visual?.worldIdentity?.transitionCount} terrain/road transition elements are active.`);
  requireCondition(probe?.serviceAlleyPresent === true, 'Main Street service alley treatment is missing.');
  requireCondition(probe?.roadsideClumpsPresent === true, 'Roadside vegetation pocket is missing.');
  requireCondition(Number(visual?.worldGrade?.exposure) <= 0.93, `World exposure was not restrained: ${visual?.worldGrade?.exposure}.`);
  requireCondition(Number(probe?.slice6PresentationObjectCount) <= 140, `Slice 6 presentation object budget exceeded in street view: ${probe?.slice6PresentationObjectCount}.`);
  requireCondition(Number(report.mainStreet.gameplayAnimalCount) > 0, 'Authoritative gameplay animal array disappeared during Slice 6 street QA.');
  requireCondition(!visual?.heroSlice6LastError, `Slice 6 runtime error in street view: ${visual?.heroSlice6LastError}.`);
  if (streetPage.errors.length) report.failures.push(`Main-street browser errors: ${streetPage.errors.join(' | ')}`);
} finally {
  await streetPage.page.close();
}

const farmPage = await createPage();
try {
  const prepared = await farmPage.page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('slice6-farm-edge'));
  requireCondition(prepared === true, 'Slice 6 farm-edge QA view did not prepare.');
  await farmPage.page.waitForTimeout(220);
  report.farmEdge = await snapshot(farmPage.page);
  report.farmEdge.probe = await slice6Probe(farmPage.page);
  await farmPage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice6-farm-edge.png'), fullPage: true });

  const visual = report.farmEdge.visual;
  const probe = report.farmEdge.probe;
  requireCondition(probe?.farmFencePresent === true, 'Farm-edge fence presentation is missing.');
  requireCondition(probe?.farmDitchPresent === true, 'Farm-edge ditch transition is missing.');
  requireCondition(Number(visual?.worldIdentity?.fenceInstanceCount) >= 13, `Only ${visual?.worldIdentity?.fenceInstanceCount} fence-post instances are active.`);
  requireCondition(Number(probe?.slice6PresentationObjectCount) <= 140, `Slice 6 presentation object budget exceeded in farm view: ${probe?.slice6PresentationObjectCount}.`);
  requireCondition(report.farmEdge.neonSelected === false, 'Farm-edge QA unexpectedly enabled Neon.');
  requireCondition(!visual?.heroSlice6LastError, `Slice 6 runtime error in farm view: ${visual?.heroSlice6LastError}.`);
  if (farmPage.errors.length) report.failures.push(`Farm-edge browser errors: ${farmPage.errors.join(' | ')}`);
} finally {
  await farmPage.page.close();
}

await browser.close();
report.passed = report.failures.length === 0;
await writeFile(path.join(outputDir, 'threejs-hero-slice6-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Three.js Hero Slice 6 QA: ${report.passed ? 'PASS' : 'FAIL'}; failures=${report.failures.length}.`);
if (!report.passed) {
  report.failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
