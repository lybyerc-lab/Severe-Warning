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
  version: 'THREEJS_HERO_SLICE6_QA_V4',
  generatedAt: new Date().toISOString(),
  passed: false,
  defaultStorm: null,
  mainStreet: null,
  streetCorner: null,
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
  await page.waitForFunction(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.().heroSlice6RoadLawVersion === 'THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_V1');
  await page.waitForFunction(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.().heroSlice6BlocktownBreakVersion === 'THREEJS_VISUAL_HERO_SLICE6_BLOCKTOWN_BREAK_V1');
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
    const roadStep = 80;
    const roadHalf = 8.75;
    const nearestRoadDistance = (value) => Math.abs(Number(value || 0) - Math.round(Number(value || 0) / roadStep) * roadStep);
    const boxCrossesRoad = (box) => {
      if (!box || box.isEmpty?.()) return false;
      const minXLine = Math.floor((box.min.x - roadHalf) / roadStep) * roadStep;
      const maxXLine = Math.ceil((box.max.x + roadHalf) / roadStep) * roadStep;
      for (let line = minXLine; line <= maxXLine; line += roadStep) {
        if (box.max.x >= line - roadHalf && box.min.x <= line + roadHalf) return true;
      }
      const minZLine = Math.floor((box.min.z - roadHalf) / roadStep) * roadStep;
      const maxZLine = Math.ceil((box.max.z + roadHalf) / roadStep) * roadStep;
      for (let line = minZLine; line <= maxZLine; line += roadStep) {
        if (box.max.z >= line - roadHalf && box.min.z <= line + roadHalf) return true;
      }
      return false;
    };
    const legacyParcelMesh = (object) => {
      if (!object?.isMesh) return false;
      const parameters = object.geometry?.parameters || {};
      const width = Number(parameters.width);
      const height = Number(parameters.height);
      const approx = (a, b) => Number.isFinite(a) && Math.abs(a - b) <= 0.08;
      return (approx(width, 60) && approx(height, 60))
        || (approx(width, 54) && approx(height, 3.2))
        || (approx(width, 3.2) && approx(height, 54))
        || (approx(width, 4.2) && approx(height, 48));
    };

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
    let townPolishPresentationObjectCount = 0;
    let townPolishSignboardCount = 0;
    let buildingIdentityGroups = 0;
    scene?.traverse?.((object) => {
      const name = String(object?.name || '');
      if (name.startsWith('SWVisualSlice6')) {
        slice6PresentationObjectCount += 1;
        if (name.startsWith('SWVisualSlice6BuildingIdentity')) buildingIdentityGroups += 1;
      }
      if (object.userData?.swTownPolish === true) townPolishPresentationObjectCount += 1;
      if (name === 'TownPolishSignboard') townPolishSignboardCount += 1;
    });

    const inheritedShellOpacities = [];
    scene?.getObjectByName?.('SWVisualHeroSlice4StormVolume')?.children?.forEach?.((object) => {
      if (object.name?.startsWith('SWVisualSlice4VolumeShell') && Number.isFinite(object.material?.opacity)) {
        inheritedShellOpacities.push(Number(object.material.opacity));
      }
    });

    const independentTargetRoadIntrusions = [];
    const targetList = typeof targets !== 'undefined' && Array.isArray(targets) ? targets : [];
    targetList.forEach((target) => {
      const group = target?.meshData?.group;
      if (!group || Boolean(target.destroyed) || Boolean(target.isTree) || group.visible === false) return;
      group.updateMatrixWorld?.(true);
      const box = new THREE.Box3().setFromObject(group);
      if (!boxCrossesRoad(box)) return;
      independentTargetRoadIntrusions.push({
        kind: String(target.kind || target.meshData?.label || 'unknown'),
        x: Number(target.x),
        z: Number(target.z),
        group: String(group.name || ''),
      });
    });

    let legacyVisibleParcelMeshes = 0;
    if (typeof townDressGroup !== 'undefined' && townDressGroup?.children) {
      townDressGroup.children.forEach((object) => {
        if (object.visible !== false && legacyParcelMesh(object)) legacyVisibleParcelMeshes += 1;
      });
    }

    const sidewalkBatch = scene?.getObjectByName?.('SWVisualSlice6RoadLawSidewalkBatch') || null;
    const curbBatch = scene?.getObjectByName?.('SWVisualSlice6RoadLawCurbBatch') || null;
    const vergeBatch = scene?.getObjectByName?.('SWVisualSlice6RoadLawVergeBatch') || null;

    const independentFenceRoadIntrusions = [];
    const inspectInstancedFence = (object, axisLength = 0) => {
      if (!object?.isInstancedMesh) return;
      object.updateMatrixWorld?.(true);
      const local = new THREE.Matrix4();
      const world = new THREE.Matrix4();
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      for (let index = 0; index < object.count; index += 1) {
        object.getMatrixAt(index, local);
        world.multiplyMatrices(object.matrixWorld, local);
        world.decompose(position, quaternion, scale);
        const xDistance = nearestRoadDistance(position.x);
        const zDistance = nearestRoadDistance(position.z);
        const halfLength = axisLength > 0 ? axisLength * Math.abs(scale.z) * 0.5 : 0;
        if (xDistance <= roadHalf || zDistance <= roadHalf + halfLength) {
          independentFenceRoadIntrusions.push({ name: object.name, index, x: position.x, z: position.z, halfLength });
        }
      }
    };
    inspectInstancedFence(scene?.getObjectByName?.('SWVisualSlice6FarmFencePosts'), 0);
    inspectInstancedFence(scene?.getObjectByName?.('SWVisualSlice6FarmFenceRails1'), 5);
    inspectInstancedFence(scene?.getObjectByName?.('SWVisualSlice6FarmFenceRails2'), 5);

    const utilityPoleRoadIntrusions = [];
    const utilityPoleList = typeof powerPoles !== 'undefined' && Array.isArray(powerPoles) ? powerPoles : [];
    utilityPoleList.forEach((pole, index) => {
      const x = Number(pole?.x);
      const z = Number(pole?.z);
      if (Number.isFinite(x) && Number.isFinite(z) && nearestRoadDistance(x) > 8.5 && nearestRoadDistance(z) > 8.5) return;
      utilityPoleRoadIntrusions.push({
        index,
        x,
        z,
        networkGroup: String(pole?.networkGroup || ''),
        networkIndex: Number(pole?.networkIndex),
      });
    });
    const utilityLineSegmentObjects = [];
    scene?.traverse?.((object) => {
      const position = object?.geometry?.getAttribute?.('position');
      if (object?.isLineSegments && Number(position?.count) === 162) utilityLineSegmentObjects.push(object);
    });

    const visual = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.() || null;
    const targetCoordinatesBeforeRefresh = targetList.map((target, index) => ({ index, x: Number(target?.x), z: Number(target?.z) }));
    globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.refreshHeroSlice6?.();
    const targetCoordinateMutations = targetCoordinatesBeforeRefresh.filter((before) => {
      const after = targets?.[before.index];
      return Number(after?.x) !== before.x || Number(after?.z) !== before.z;
    });
    const refreshedStormRoot = scene?.getObjectByName?.('SWVisualHeroSlice6StormSilhouette') || null;
    const refreshedWorldRoot = scene?.getObjectByName?.('SWVisualHeroSlice6WorldIdentity') || null;
    const stormDebrisColumn = refreshedStormRoot?.getObjectByName?.('SWVisualSlice6StormDebrisColumn') || null;
    return {
      stormRootPresent: Boolean(refreshedStormRoot?.parent),
      worldRootPresent: Boolean(refreshedWorldRoot?.parent),
      warpedShellCount,
      lateralCenterOffset,
      edgeWispCount: stormRoot?.children?.filter?.((entry) => entry.name?.startsWith('SWVisualSlice6EdgeWisp')).length || 0,
      groundBurstCount: stormRoot?.children?.filter?.((entry) => entry.name?.startsWith('SWVisualSlice6GroundBurst')).length || 0,
      legacyStormRingCount: Number(visual?.stormSilhouette?.legacyStormRingCount || 0),
      buildingIdentityGroups,
      sidewalkBatchPresent: Boolean(sidewalkBatch?.parent),
      curbBatchPresent: Boolean(curbBatch?.parent),
      vergeBatchPresent: Boolean(vergeBatch?.parent),
      sidewalkBatchRectCount: Number(sidewalkBatch?.geometry?.userData?.swSlice6RoadLawRectCount || 0),
      curbBatchRectCount: Number(curbBatch?.geometry?.userData?.swSlice6RoadLawRectCount || 0),
      vergeBatchRectCount: Number(vergeBatch?.geometry?.userData?.swSlice6RoadLawRectCount || 0),
      farmFencePresent: Boolean(scene?.getObjectByName?.('SWVisualSlice6FarmFencePosts')),
      farmDitchPresent: Boolean(scene?.getObjectByName?.('SWVisualSlice6FarmDitchSegments')),
      farmShoulderPresent: Boolean(scene?.getObjectByName?.('SWVisualSlice6FarmShoulderSegments')),
      parcelClumpsPresent: Boolean(scene?.getObjectByName?.('SWVisualSlice6ParcelClumps')),
      inheritedShellMaxOpacity: inheritedShellOpacities.length ? Math.max(...inheritedShellOpacities) : null,
      defaultFunnelOpacity: typeof funnelMat !== 'undefined' ? Number(funnelMat.opacity) : null,
      slice6PresentationObjectCount,
      townPolishPresentationObjectCount,
      townPolishSignboardCount,
      stormDebrisClusterCount: stormDebrisColumn?.children?.length || 0,
      rainbowRootPresent: Boolean(scene?.getObjectByName?.('SWVisualHeroSlice5RainbowFunnel')?.parent),
      independentTargetRoadIntrusions,
      independentFenceRoadIntrusions,
      utilityPoleCount: utilityPoleList.length,
      utilityPoleRoadIntrusions,
      utilityLineSegmentObjects: utilityLineSegmentObjects.length,
      legacyVisibleParcelMeshes,
      targetCoordinateMutations,
      roadLaw: visual?.worldIdentity?.roadLaw || null,
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
  requireCondition(visual?.heroSlice6RoadLawVersion === 'THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_V1', `Hero Slice 6 road-law version mismatch: ${visual?.heroSlice6RoadLawVersion}.`);
  requireCondition(visual?.heroSlice6BlocktownBreakVersion === 'THREEJS_VISUAL_HERO_SLICE6_BLOCKTOWN_BREAK_V1', `Blocktown-break version mismatch: ${visual?.heroSlice6BlocktownBreakVersion}.`);
  requireCondition(visual?.stormSilhouette?.profile === 'asymmetric-storm-v2', `Unexpected Slice 6 storm profile ${visual?.stormSilhouette?.profile}.`);
  requireCondition(probe?.stormRootPresent === true, 'Slice 6 storm silhouette root is missing.');
  requireCondition(Number(probe?.warpedShellCount) >= 3, `Only ${probe?.warpedShellCount} warped storm shells are active.`);
  requireCondition(Number(probe?.lateralCenterOffset) >= 0.25, `Storm shell centerline is still too geometrically straight: ${probe?.lateralCenterOffset}.`);
  requireCondition(Number(probe?.edgeWispCount) >= 14, `Only ${probe?.edgeWispCount} edge wisps are active.`);
  requireCondition(Number(probe?.stormDebrisClusterCount) >= 6, `Only ${probe?.stormDebrisClusterCount} broken storm debris clusters are active.`);
  requireCondition(Number(probe?.groundBurstCount) >= 9, `Only ${probe?.groundBurstCount} irregular ground bursts are active.`);
  requireCondition(Number(probe?.legacyStormRingCount) >= 3, `Expected inherited storm ground rings to be restrained, found ${probe?.legacyStormRingCount}.`);
  requireCondition(Number(probe?.inheritedShellMaxOpacity) <= 0.09, `Inherited Slice 4 cone shells remain too dominant: ${probe?.inheritedShellMaxOpacity}.`);
  requireCondition(Number(probe?.defaultFunnelOpacity) <= 0.22, `Legacy funnel remains too opaque in default mode: ${probe?.defaultFunnelOpacity}.`);
  requireCondition(Number(probe?.slice6PresentationObjectCount) <= 110, `Slice 6 presentation object budget exceeded: ${probe?.slice6PresentationObjectCount}.`);
  requireCondition(!visual?.heroSlice6LastError, `Slice 6 runtime error: ${visual?.heroSlice6LastError}.`);
  if (stormPage.errors.length) report.failures.push(`Storm browser errors: ${stormPage.errors.join(' | ')}`);
} finally {
  await stormPage.page.close();
}

const streetPage = await createPage();
try {
  const prepared = await streetPage.page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('slice6-street'));
  requireCondition(prepared === true, 'Slice 6 main-street QA view did not prepare.');
  await streetPage.page.waitForTimeout(240);
  report.mainStreet = await snapshot(streetPage.page);
  report.mainStreet.probe = await slice6Probe(streetPage.page);
  await streetPage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice6-main-street.png'), fullPage: true });

  const visual = report.mainStreet.visual;
  const probe = report.mainStreet.probe;
  const roadLaw = visual?.worldIdentity?.roadLaw;
  requireCondition(visual?.worldIdentity?.profile === 'road-first-parcels-v2', `Unexpected world identity profile ${visual?.worldIdentity?.profile}.`);
  requireCondition(roadLaw?.version === 'THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_V1', `Road-law snapshot missing or stale: ${roadLaw?.version}.`);
  requireCondition(probe?.worldRootPresent === true, 'Slice 6 world identity root is missing.');
  requireCondition(Number(probe?.buildingIdentityGroups) === 0 && Number(roadLaw?.stackedSlice6BuildingKits) === 0, `Stacked Slice 6 box kits are still active: groups=${probe?.buildingIdentityGroups}, snapshot=${roadLaw?.stackedSlice6BuildingKits}.`);
  requireCondition(probe?.sidewalkBatchPresent === true && probe?.curbBatchPresent === true && probe?.vergeBatchPresent === true, 'Road-first sidewalk/curb/verge boundaries are incomplete.');
  requireCondition(Number(roadLaw?.sidewalkSegmentCount) >= 120 && Number(probe?.sidewalkBatchRectCount) >= 120, `Only ${roadLaw?.sidewalkSegmentCount} sidewalk boundary segments are active.`);
  requireCondition(Number(roadLaw?.curbSegmentCount) >= 120 && Number(probe?.curbBatchRectCount) >= 120, `Only ${roadLaw?.curbSegmentCount} curb boundary segments are active.`);
  requireCondition(Number.isFinite(Number(roadLaw?.hiddenLegacyParcelMeshes)), 'Legacy parcel suppression telemetry is missing.');
  requireCondition(Number(probe?.legacyVisibleParcelMeshes) === 0, `${probe?.legacyVisibleParcelMeshes} legacy square parcel overlays remain visible.`);
  requireCondition(Number(roadLaw?.parcelAdjustedTargetCount) > 0, 'Parcel compliance did not adjust any oversized building presentation.');
  requireCondition(Number(visual?.worldIdentity?.townPolish?.mainStreetRooflineCount) >= 3, 'Main Street roofline pass did not reach the required minimum coverage.');
  requireCondition(Number(visual?.worldIdentity?.townPolish?.falseFrontCount) >= 3 && Number(visual?.worldIdentity?.townPolish?.awningCount) >= 3, 'Main Street false-front and awning pass is incomplete.');
  requireCondition(Number(visual?.worldIdentity?.townPolish?.storefrontArchetypeCount) >= 10, 'Main Street did not reach the authored commercial archetype minimum.');
  requireCondition(Number(visual?.worldIdentity?.townPolish?.signageCount) >= 8 && Number(probe?.townPolishSignboardCount) >= 8, 'Main Street sign-band coverage is incomplete.');
  requireCondition(Number(visual?.worldIdentity?.townPolish?.streetPropCount) >= 8, 'Main Street sidewalk prop coverage is incomplete.');
  requireCondition(Number(probe?.townPolishPresentationObjectCount) <= 96, `Town-polish presentation budget exceeded: ${probe?.townPolishPresentationObjectCount}.`);
  requireCondition(Number(roadLaw?.targetRoadIntrusionCount) === 0, `Road-law telemetry still reports ${roadLaw?.targetRoadIntrusionCount} building road intrusions: ${JSON.stringify(roadLaw?.targetRoadIntrusions || [])}`);
  requireCondition(Array.isArray(probe?.independentTargetRoadIntrusions) && probe.independentTargetRoadIntrusions.length === 0, `Independent QA found building geometry inside protected roads: ${JSON.stringify(probe?.independentTargetRoadIntrusions || [])}`);
  requireCondition(Array.isArray(probe?.targetCoordinateMutations) && probe.targetCoordinateMutations.length === 0, `Presentation refresh changed protected target coordinates: ${JSON.stringify(probe?.targetCoordinateMutations || [])}`);
  requireCondition(Number(probe?.utilityPoleCount) === 90, `Expected 90 authoritative utility poles, found ${probe?.utilityPoleCount}.`);
  requireCondition(Array.isArray(probe?.utilityPoleRoadIntrusions) && probe.utilityPoleRoadIntrusions.length === 0, `Authoritative utility poles intrude into protected road/shoulder space: ${JSON.stringify(probe?.utilityPoleRoadIntrusions || [])}`);
  requireCondition(Number(probe?.utilityLineSegmentObjects) === 1, `Expected one batched utility LineSegments object with 81 segments, found ${probe?.utilityLineSegmentObjects}.`);
  requireCondition(Number(visual?.worldGrade?.exposure) <= 0.93, `World exposure was not restrained: ${visual?.worldGrade?.exposure}.`);
  requireCondition(Number(probe?.slice6PresentationObjectCount) <= 110, `Slice 6 presentation object budget exceeded in street view: ${probe?.slice6PresentationObjectCount}.`);
  requireCondition(Number(report.mainStreet.gameplayAnimalCount) > 0, 'Authoritative gameplay animal array disappeared during Slice 6 street QA.');
  requireCondition(!visual?.heroSlice6LastError, `Slice 6 runtime error in street view: ${visual?.heroSlice6LastError}.`);
  if (streetPage.errors.length) report.failures.push(`Main-street browser errors: ${streetPage.errors.join(' | ')}`);
} finally {
  await streetPage.page.close();
}

const cornerPage = await createPage();
try {
  const prepared = await cornerPage.page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('slice6-corner'));
  requireCondition(prepared === true, 'Slice 6 street-corner QA view did not prepare.');
  await cornerPage.page.waitForTimeout(240);
  report.streetCorner = await snapshot(cornerPage.page);
  report.streetCorner.probe = await slice6Probe(cornerPage.page);
  await cornerPage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice6-street-corner.png'), fullPage: true });

  const visual = report.streetCorner.visual;
  const probe = report.streetCorner.probe;
  requireCondition(visual?.heroSlice6BlocktownBreakVersion === 'THREEJS_VISUAL_HERO_SLICE6_BLOCKTOWN_BREAK_V1', 'Street-corner evidence did not retain the Blocktown-break presentation layer.');
  requireCondition(Number(visual?.worldIdentity?.townPolish?.storefrontArchetypeCount) >= 10, 'Street-corner evidence lacks the authored commercial archetypes.');
  requireCondition(Number(probe?.townPolishSignboardCount) >= 8, 'Street-corner evidence lacks readable storefront sign bands.');
  requireCondition(Array.isArray(probe?.independentTargetRoadIntrusions) && probe.independentTargetRoadIntrusions.length === 0, `Street-corner QA found building geometry inside protected roads: ${JSON.stringify(probe?.independentTargetRoadIntrusions || [])}`);
  requireCondition(Array.isArray(probe?.targetCoordinateMutations) && probe.targetCoordinateMutations.length === 0, `Street-corner refresh changed protected target coordinates: ${JSON.stringify(probe?.targetCoordinateMutations || [])}`);
  if (cornerPage.errors.length) report.failures.push(`Street-corner browser errors: ${cornerPage.errors.join(' | ')}`);
} finally {
  await cornerPage.page.close();
}

const farmPage = await createPage();
try {
  const prepared = await farmPage.page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('slice6-farm-edge'));
  requireCondition(prepared === true, 'Slice 6 farm-edge QA view did not prepare.');
  await farmPage.page.waitForTimeout(240);
  report.farmEdge = await snapshot(farmPage.page);
  report.farmEdge.probe = await slice6Probe(farmPage.page);
  await farmPage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice6-farm-edge.png'), fullPage: true });

  const visual = report.farmEdge.visual;
  const probe = report.farmEdge.probe;
  const roadLaw = visual?.worldIdentity?.roadLaw;
  requireCondition(probe?.farmFencePresent === true, 'Farm-edge fence presentation is missing.');
  requireCondition(probe?.farmDitchPresent === true && probe?.farmShoulderPresent === true, 'Farm-edge ditch/shoulder segmentation is missing.');
  requireCondition(Number(roadLaw?.farmFencePostCount) >= 4, `Only ${roadLaw?.farmFencePostCount} road-safe fence posts remain.`);
  requireCondition(Number(roadLaw?.farmFenceRailCount) >= 4, `Only ${roadLaw?.farmFenceRailCount} road-safe fence rails remain.`);
  requireCondition(Number(roadLaw?.farmFenceGapCount) >= 1, 'Farm fence did not open a road crossing gap.');
  requireCondition(Number(roadLaw?.farmFenceRoadIntrusionCount) === 0, `Farm fence telemetry reports ${roadLaw?.farmFenceRoadIntrusionCount} road intrusions.`);
  requireCondition(Array.isArray(probe?.independentFenceRoadIntrusions) && probe.independentFenceRoadIntrusions.length === 0, `Independent QA found fence geometry inside the road: ${JSON.stringify(probe?.independentFenceRoadIntrusions || [])}`);
  requireCondition(Number(roadLaw?.farmDitchSegmentCount) > 0 && Number(roadLaw?.farmShoulderSegmentCount) > 0, 'Farm ditch/shoulder lost all road-safe segments.');
  requireCondition(Number(probe?.slice6PresentationObjectCount) <= 110, `Slice 6 presentation object budget exceeded in farm view: ${probe?.slice6PresentationObjectCount}.`);
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
