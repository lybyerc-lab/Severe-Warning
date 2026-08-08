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
  version: 'THREEJS_HERO_SLICE5_QA_V1',
  generatedAt: new Date().toISOString(),
  passed: false,
  rainbow: null,
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
  await page.goto(`${qaUrl}?qa=1&intro=0&assetPipeline=1&visualFoundation=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot === 'function');
  await page.waitForFunction(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.().heroSlice5Version === 'THREEJS_VISUAL_HERO_SLICE5_V1');
  await page.waitForFunction(() => globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getSnapshot?.().appliedCount >= 1);
  return { page, errors };
}

async function snapshot(page) {
  return page.evaluate(() => ({
    visual: globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.() || null,
    applied: globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [],
    gameplayAnimalCount: typeof animals !== 'undefined' && Array.isArray(animals) ? animals.length : -1,
  }));
}

const rainbowPage = await createPage();
try {
  const prepared = await rainbowPage.page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('storm'));
  requireCondition(prepared === true, 'Rainbow-funnel QA view did not prepare.');
  await rainbowPage.page.waitForTimeout(220);
  report.rainbow = await snapshot(rainbowPage.page);
  const rainbowProbe = await rainbowPage.page.evaluate(() => {
    const root = scene?.getObjectByName?.('SWVisualHeroSlice5RainbowFunnel') || null;
    const shell = scene?.getObjectByName?.('SWVisualSlice5RainbowShell1') || null;
    const ribbons = root?.children?.filter?.((entry) => entry.name?.startsWith('SWVisualSlice5RainbowRibbon')) || [];
    return {
      rootPresent: Boolean(root?.parent),
      shellHasVertexColors: Boolean(shell?.geometry?.getAttribute?.('color')),
      ribbonCount: ribbons.length,
      ribbonUsesAdditiveBlending: ribbons.every((entry) => entry.material?.blending === THREE.AdditiveBlending),
    };
  });
  report.rainbow.probe = rainbowProbe;
  await rainbowPage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice5-rainbow-funnel.png'), fullPage: true });

  const visual = report.rainbow.visual;
  requireCondition(visual?.heroSlice4Version === 'THREEJS_VISUAL_HERO_SLICE4_V1', `Inherited Hero Slice 4 version mismatch: ${visual?.heroSlice4Version}.`);
  requireCondition(visual?.heroSlice5Version === 'THREEJS_VISUAL_HERO_SLICE5_V1', `Hero Slice 5 version mismatch: ${visual?.heroSlice5Version}.`);
  requireCondition(visual?.rainbowFunnel?.rootPresent === true, 'Rainbow funnel root is missing.');
  requireCondition(Number(visual?.rainbowFunnel?.shellCount) >= 2, `Only ${visual?.rainbowFunnel?.shellCount} rainbow shells are active.`);
  requireCondition(Number(visual?.rainbowFunnel?.ribbonCount) >= 7, `Only ${visual?.rainbowFunnel?.ribbonCount} neon rainbow ribbons are active.`);
  requireCondition(Number(visual?.rainbowFunnel?.lightCount) >= 1, 'Rainbow funnel glow light is missing.');
  requireCondition(visual?.rainbowFunnel?.legacyFunnelDimmed === true, 'Legacy gray funnel was not dimmed beneath the rainbow presentation.');
  requireCondition(visual?.rainbowFunnel?.presentationOnly === true, 'Rainbow funnel is not labeled presentation-only.');
  requireCondition(rainbowProbe?.shellHasVertexColors === true, 'Rainbow shell does not contain vertex-color bands.');
  requireCondition(rainbowProbe?.ribbonCount >= 7 && rainbowProbe?.ribbonUsesAdditiveBlending === true, 'Neon ribbon rendering probe failed.');
  requireCondition(!visual?.heroSlice5LastError, `Hero Slice 5 runtime error: ${visual?.heroSlice5LastError}.`);
  if (rainbowPage.errors.length) report.failures.push(`Rainbow browser errors: ${rainbowPage.errors.join(' | ')}`);
} finally {
  await rainbowPage.page.close();
}

const cowPage = await createPage();
try {
  const prepared = await cowPage.page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('farm'));
  requireCondition(prepared === true, 'Cow-level farm QA view did not prepare.');
  await cowPage.page.waitForTimeout(220);
  report.cowLevel = await snapshot(cowPage.page);
  const cowProbe = await cowPage.page.evaluate(() => {
    const root = scene?.getObjectByName?.('SWVisualHeroSlice5CowLevel') || null;
    const gameplayMeshes = new Set((typeof animals !== 'undefined' && Array.isArray(animals) ? animals : []).map((entry) => entry?.mesh).filter(Boolean));
    let visualMeshCount = 0;
    let gameplayOverlapCount = 0;
    root?.traverse?.((object) => {
      if (!object?.isMesh) return;
      visualMeshCount += 1;
      if (gameplayMeshes.has(object)) gameplayOverlapCount += 1;
    });
    return {
      rootPresent: Boolean(root?.parent),
      visualMeshCount,
      gameplayOverlapCount,
      championPresent: Boolean(scene?.getObjectByName?.('SWVisualSlice5CowChampion')),
      signPresent: Boolean(scene?.getObjectByName?.('SWVisualSlice5CowLevelSign')),
      ringPresent: Boolean(scene?.getObjectByName?.('SWVisualSlice5CowLevelRing')),
    };
  });
  report.cowLevel.probe = cowProbe;
  await cowPage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice5-cow-level.png'), fullPage: true });

  const visual = report.cowLevel.visual;
  requireCondition(visual?.cowLevel?.rootPresent === true, 'Hart Farm cow-level root is missing.');
  requireCondition(Number(visual?.cowLevel?.cowCount) >= 9, `Cow level has only ${visual?.cowLevel?.cowCount} presentation cows.`);
  requireCondition(visual?.cowLevel?.signPresent === true, 'MOO LEVEL sign is missing.');
  requireCondition(visual?.cowLevel?.ringPresent === true, 'Cow-level crop ring is missing.');
  requireCondition(visual?.cowLevel?.presentationOnly === true, 'Cow level is not labeled presentation-only.');
  requireCondition(cowProbe?.championPresent === true && cowProbe?.signPresent === true && cowProbe?.ringPresent === true, 'Cow-level scene probe is incomplete.');
  requireCondition(Number(cowProbe?.visualMeshCount) >= 45, `Cow level visual anatomy is unexpectedly sparse: ${cowProbe?.visualMeshCount} meshes.`);
  requireCondition(Number(cowProbe?.gameplayOverlapCount) === 0, 'Cow-level presentation meshes leaked into the authoritative gameplay animal array.');
  requireCondition(Number(report.cowLevel.gameplayAnimalCount) > 0, 'Authoritative gameplay animal array disappeared during cow-level QA.');
  requireCondition(!visual?.heroSlice5LastError, `Hero Slice 5 runtime error in farm view: ${visual?.heroSlice5LastError}.`);
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
