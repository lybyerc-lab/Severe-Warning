import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'threejs-hero-slice5');
const qaUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const report = {
  version: 'THREEJS_HERO_SLICE5_QA_V3',
  generatedAt: new Date().toISOString(),
  passed: false,
  defaultStorm: null,
  rainbow: null,
  postToggleOff: null,
  cowLevel: null,
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
  await page.waitForFunction(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.heroSlice5NeonGateVersion === 'THREEJS_VISUAL_HERO_SLICE5_NEON_GATE_V1');
  await page.waitForFunction(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.heroSlice5PolishVersion === 'THREEJS_VISUAL_HERO_SLICE5_POLISH_V1');
  await page.waitForFunction(() => globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getSnapshot?.().appliedCount >= 1);
  return { page, errors };
}

async function snapshot(page) {
  return page.evaluate(() => ({
    visual: globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.() || null,
    applied: globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [],
    gameplayAnimalCount: typeof animals !== 'undefined' && Array.isArray(animals) ? animals.length : -1,
    neonSelected: typeof neonFunnelUnlocked !== 'undefined' ? neonFunnelUnlocked === true : null,
    neonToggleAvailable: typeof toggleNeonCosmetic === 'function',
  }));
}

const rainbowPage = await createPage();
try {
  const prepared = await rainbowPage.page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('storm'));
  requireCondition(prepared === true, 'Default storm QA view did not prepare.');
  await rainbowPage.page.waitForTimeout(220);

  report.defaultStorm = await snapshot(rainbowPage.page);
  await rainbowPage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice5-default-storm.png'), fullPage: true });

  const defaultVisual = report.defaultStorm.visual;
  requireCondition(report.defaultStorm.neonToggleAvailable === true, 'Canonical toggleNeonCosmetic menu executor is unavailable.');
  requireCondition(report.defaultStorm.neonSelected === false, 'Fresh QA context did not start with Neon Funnel OFF.');
  requireCondition(defaultVisual?.heroSlice4Version === 'THREEJS_VISUAL_HERO_SLICE4_V1', `Inherited Hero Slice 4 version mismatch: ${defaultVisual?.heroSlice4Version}.`);
  requireCondition(defaultVisual?.heroSlice5Version === 'THREEJS_VISUAL_HERO_SLICE5_V1', `Hero Slice 5 version mismatch: ${defaultVisual?.heroSlice5Version}.`);
  requireCondition(defaultVisual?.neonGate?.version === 'THREEJS_VISUAL_HERO_SLICE5_NEON_GATE_V1', `Neon gate version mismatch: ${defaultVisual?.neonGate?.version}.`);
  requireCondition(defaultVisual?.heroSlice5PolishVersion === 'THREEJS_VISUAL_HERO_SLICE5_POLISH_V1', `Polish version mismatch: ${defaultVisual?.heroSlice5PolishVersion}.`);
  requireCondition(defaultVisual?.rainbowFunnel?.neonSelected === false, 'Snapshot says Neon is selected before the player selects it.');
  requireCondition(defaultVisual?.rainbowFunnel?.enabled === false, 'Rainbow funnel is enabled while Neon is OFF.');
  requireCondition(defaultVisual?.rainbowFunnel?.rootPresent === false, 'Rainbow funnel root exists while Neon is OFF.');
  requireCondition(Number(defaultVisual?.rainbowFunnel?.shellCount) === 0, 'Rainbow shells exist while Neon is OFF.');
  requireCondition(Number(defaultVisual?.rainbowFunnel?.ribbonCount) === 0, 'Rainbow ribbons exist while Neon is OFF.');
  requireCondition(Number(defaultVisual?.rainbowFunnel?.lightCount) === 0, 'Rainbow glow exists while Neon is OFF.');
  requireCondition(defaultVisual?.rainbowFunnel?.legacyFunnelDimmed === false, 'Hero Slice 4 funnel remained dimmed while Neon is OFF.');
  requireCondition(defaultVisual?.stormVolume?.rootPresent === true, 'Hero Slice 4 storm volume disappeared in default non-Neon mode.');

  const toggleOn = await rainbowPage.page.evaluate(() => {
    if (typeof toggleNeonCosmetic !== 'function') return null;
    const before = typeof neonFunnelUnlocked !== 'undefined' ? neonFunnelUnlocked === true : null;
    toggleNeonCosmetic();
    const after = typeof neonFunnelUnlocked !== 'undefined' ? neonFunnelUnlocked === true : null;
    return { before, after };
  });
  requireCondition(toggleOn?.before === false && toggleOn?.after === true, `Canonical Neon menu toggle did not change OFF -> ON: ${JSON.stringify(toggleOn)}.`);
  await rainbowPage.page.waitForFunction(() => {
    const visual = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.();
    return visual?.rainbowFunnel?.neonSelected === true
      && visual?.rainbowFunnel?.enabled === true
      && visual?.rainbowFunnel?.rootPresent === true;
  });
  await rainbowPage.page.waitForTimeout(180);

  report.rainbow = await snapshot(rainbowPage.page);
  const rainbowProbe = await rainbowPage.page.evaluate(() => {
    const root = scene?.getObjectByName?.('SWVisualHeroSlice5RainbowFunnel') || null;
    const shells = root?.children?.filter?.((entry) => entry.name?.startsWith('SWVisualSlice5RainbowShell')) || [];
    const ribbons = root?.children?.filter?.((entry) => entry.name?.startsWith('SWVisualSlice5RainbowRibbon')) || [];
    const glow = root?.getObjectByName?.('SWVisualSlice5RainbowGlow') || null;
    return {
      rootPresent: Boolean(root?.parent),
      shellHasVertexColors: shells.every((entry) => Boolean(entry.geometry?.getAttribute?.('color'))),
      shellCount: shells.length,
      shellUsesNormalBlending: shells.every((entry) => entry.material?.blending === THREE.NormalBlending),
      maxShellOpacity: shells.reduce((value, entry) => Math.max(value, Number(entry.material?.opacity || 0)), 0),
      ribbonCount: ribbons.length,
      ribbonUsesAdditiveBlending: ribbons.every((entry) => entry.material?.blending === THREE.AdditiveBlending),
      maxRibbonOpacity: ribbons.reduce((value, entry) => Math.max(value, Number(entry.material?.opacity || 0)), 0),
      glowIntensity: Number(glow?.intensity || 0),
    };
  });
  report.rainbow.probe = rainbowProbe;
  await rainbowPage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice5-rainbow-funnel.png'), fullPage: true });

  const visual = report.rainbow.visual;
  requireCondition(report.rainbow.neonSelected === true, 'Canonical menu state is not ON in the Neon evidence frame.');
  requireCondition(visual?.rainbowFunnel?.gateSource === 'neonFunnelUnlocked', `Unexpected Neon gate source ${visual?.rainbowFunnel?.gateSource}.`);
  requireCondition(visual?.rainbowFunnel?.polishProfile === 'balanced-neon-v1', `Unexpected Neon polish profile ${visual?.rainbowFunnel?.polishProfile}.`);
  requireCondition(visual?.rainbowFunnel?.neonSelected === true && visual?.rainbowFunnel?.enabled === true, 'Rainbow funnel did not follow the selected Neon menu state.');
  requireCondition(visual?.rainbowFunnel?.rootPresent === true, 'Rainbow funnel root is missing after selecting Neon.');
  requireCondition(Number(visual?.rainbowFunnel?.shellCount) >= 2, `Only ${visual?.rainbowFunnel?.shellCount} rainbow shells are active.`);
  requireCondition(Number(visual?.rainbowFunnel?.ribbonCount) >= 7, `Only ${visual?.rainbowFunnel?.ribbonCount} neon rainbow ribbons are active.`);
  requireCondition(Number(visual?.rainbowFunnel?.lightCount) >= 1, 'Rainbow funnel glow light is missing.');
  requireCondition(visual?.rainbowFunnel?.legacyFunnelDimmed === true, 'Legacy gray funnel was not dimmed beneath the selected Neon presentation.');
  requireCondition(visual?.rainbowFunnel?.presentationOnly === true, 'Rainbow funnel is not labeled presentation-only.');
  requireCondition(rainbowProbe?.shellHasVertexColors === true, 'Rainbow shells do not contain vertex-color bands.');
  requireCondition(rainbowProbe?.shellUsesNormalBlending === true, 'Balanced Neon shells still use additive blending and may white out.');
  requireCondition(rainbowProbe?.ribbonCount >= 7 && rainbowProbe?.ribbonUsesAdditiveBlending === true, 'Neon ribbon rendering probe failed.');
  requireCondition(Number(rainbowProbe?.maxShellOpacity) <= 0.15, `Neon shell opacity is too high: ${rainbowProbe?.maxShellOpacity}.`);
  requireCondition(Number(rainbowProbe?.maxRibbonOpacity) <= 0.30, `Neon ribbon opacity is too high: ${rainbowProbe?.maxRibbonOpacity}.`);
  requireCondition(Number(rainbowProbe?.glowIntensity) <= 0.16, `Neon glow light is too intense: ${rainbowProbe?.glowIntensity}.`);
  requireCondition(!visual?.heroSlice5LastError, `Hero Slice 5 runtime error: ${visual?.heroSlice5LastError}.`);

  const toggleOff = await rainbowPage.page.evaluate(() => {
    if (typeof toggleNeonCosmetic !== 'function') return null;
    const before = typeof neonFunnelUnlocked !== 'undefined' ? neonFunnelUnlocked === true : null;
    toggleNeonCosmetic();
    const after = typeof neonFunnelUnlocked !== 'undefined' ? neonFunnelUnlocked === true : null;
    return { before, after };
  });
  requireCondition(toggleOff?.before === true && toggleOff?.after === false, `Canonical Neon menu toggle did not change ON -> OFF: ${JSON.stringify(toggleOff)}.`);
  await rainbowPage.page.waitForFunction(() => {
    const visual = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.();
    return visual?.rainbowFunnel?.neonSelected === false
      && visual?.rainbowFunnel?.enabled === false
      && visual?.rainbowFunnel?.rootPresent === false;
  });
  await rainbowPage.page.waitForTimeout(120);
  report.postToggleOff = await snapshot(rainbowPage.page);
  requireCondition(report.postToggleOff.neonSelected === false, 'Canonical menu state did not remain OFF after the second toggle.');
  requireCondition(report.postToggleOff.visual?.rainbowFunnel?.legacyFunnelDimmed === false, 'Hero Slice 4 funnel was not restored after Neon was deselected.');
  requireCondition(report.postToggleOff.visual?.stormVolume?.rootPresent === true, 'Hero Slice 4 storm volume was not preserved after Neon was deselected.');
  requireCondition(Number(report.postToggleOff.visual?.rainbowFunnel?.shellCount) === 0 && Number(report.postToggleOff.visual?.rainbowFunnel?.ribbonCount) === 0, 'Rainbow geometry remained after Neon was deselected.');

  if (rainbowPage.errors.length) report.failures.push(`Rainbow browser errors: ${rainbowPage.errors.join(' | ')}`);
} finally {
  await rainbowPage.page.close();
}

const cowPage = await createPage();
try {
  const prepared = await cowPage.page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('cow-level'));
  requireCondition(prepared === true, 'Dedicated cow-level QA view did not prepare.');
  await cowPage.page.waitForTimeout(220);
  report.cowLevel = await snapshot(cowPage.page);
  const cowProbe = await cowPage.page.evaluate(() => {
    const root = scene?.getObjectByName?.('SWVisualHeroSlice5CowLevel') || null;
    const gameplayMeshes = new Set((typeof animals !== 'undefined' && Array.isArray(animals) ? animals : []).map((entry) => entry?.mesh).filter(Boolean));
    let visualMeshCount = 0;
    let instancedMeshCount = 0;
    let totalInstances = 0;
    let gameplayOverlapCount = 0;
    root?.traverse?.((object) => {
      if (!object?.isMesh) return;
      visualMeshCount += 1;
      if (object.isInstancedMesh) {
        instancedMeshCount += 1;
        totalInstances += Number(object.count || 0);
      }
      if (gameplayMeshes.has(object)) gameplayOverlapCount += 1;
    });
    const center = new THREE.Vector3();
    root?.getWorldPosition?.(center);
    return {
      rootPresent: Boolean(root?.parent),
      rootVisible: Boolean(root?.visible),
      visualMeshCount,
      instancedMeshCount,
      totalInstances,
      gameplayOverlapCount,
      cameraDistance: root ? Number(camera.position.distanceTo(center)) : Infinity,
      championPresent: Boolean(scene?.getObjectByName?.('SWVisualSlice5CowChampion')),
      signPresent: Boolean(scene?.getObjectByName?.('SWVisualSlice5CowLevelSign')),
      ringPresent: Boolean(scene?.getObjectByName?.('SWVisualSlice5CowLevelRing')),
      rainbowRootPresent: Boolean(scene?.getObjectByName?.('SWVisualHeroSlice5RainbowFunnel')?.parent),
    };
  });
  report.cowLevel.probe = cowProbe;
  await cowPage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice5-cow-level.png'), fullPage: true });

  const visual = report.cowLevel.visual;
  requireCondition(report.cowLevel.neonSelected === false, 'Fresh cow-level QA page unexpectedly started with Neon selected.');
  requireCondition(visual?.rainbowFunnel?.enabled === false && cowProbe?.rainbowRootPresent === false, 'Cow-level Easter egg incorrectly forces the Neon rainbow funnel.');
  requireCondition(visual?.cowLevel?.rootPresent === true, 'Hart Farm cow-level root is missing.');
  requireCondition(visual?.cowLevel?.visible === true && cowProbe?.rootVisible === true, 'Dedicated cow-level QA framing left the secret hidden.');
  requireCondition(Number(visual?.cowLevel?.cowCount) >= 9, `Cow level has only ${visual?.cowLevel?.cowCount} presentation cows.`);
  requireCondition(Number(visual?.cowLevel?.meshBudget) === 55, `Unexpected cow mesh budget ${visual?.cowLevel?.meshBudget}.`);
  requireCondition(visual?.cowLevel?.signPresent === true, 'MOO LEVEL sign is missing.');
  requireCondition(visual?.cowLevel?.ringPresent === true, 'Cow-level crop ring is missing.');
  requireCondition(visual?.cowLevel?.presentationOnly === true, 'Cow level is not labeled presentation-only.');
  requireCondition(cowProbe?.championPresent === true && cowProbe?.signPresent === true && cowProbe?.ringPresent === true, 'Cow-level scene probe is incomplete.');
  requireCondition(Number(cowProbe?.visualMeshCount) >= 45, `Cow level visual anatomy is unexpectedly sparse: ${cowProbe?.visualMeshCount} meshes.`);
  requireCondition(Number(cowProbe?.visualMeshCount) <= 55, `Cow level exceeded the 55-mesh presentation budget: ${cowProbe?.visualMeshCount}.`);
  requireCondition(Number(cowProbe?.instancedMeshCount) >= 20 && Number(cowProbe?.totalInstances) >= 60, `Cow-level instancing did not consolidate repeated detail parts: instancedMeshes=${cowProbe?.instancedMeshCount}, instances=${cowProbe?.totalInstances}.`);
  requireCondition(Number(cowProbe?.cameraDistance) <= 60, `Cow-level QA camera is too far from the secret: ${cowProbe?.cameraDistance}.`);
  requireCondition(Number(cowProbe?.gameplayOverlapCount) === 0, 'Cow-level presentation meshes leaked into the authoritative gameplay animal array.');
  requireCondition(Number(report.cowLevel.gameplayAnimalCount) > 0, 'Authoritative gameplay animal array disappeared during cow-level QA.');
  requireCondition(!visual?.heroSlice5LastError, `Hero Slice 5 runtime error in cow-level view: ${visual?.heroSlice5LastError}.`);
  if (cowPage.errors.length) report.failures.push(`Cow-level browser errors: ${cowPage.errors.join(' | ')}`);
} finally {
  await cowPage.page.close();
}

await browser.close();
report.passed = report.failures.length === 0;
await writeFile(path.join(outputDir, 'threejs-hero-slice5-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Three.js Hero Slice 5 QA: ${report.passed ? 'PASS' : 'FAIL'}; failures=${report.failures.length}.`);
if (!report.passed) {
  report.failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
