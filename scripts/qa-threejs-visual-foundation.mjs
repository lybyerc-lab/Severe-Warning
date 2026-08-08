import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'threejs-visual-foundation');
const qaUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 932, height: 430 } });
page.setDefaultTimeout(30000);

const errors = [];
const logs = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  logs.push(`[${message.type()}] ${message.text()}`);
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

const report = {
  version: 'THREEJS_VISUAL_FOUNDATION_QA_V1',
  generatedAt: new Date().toISOString(),
  passed: false,
  storefront: null,
  farm: null,
  storm: null,
  gameplayTruth: null,
  errors,
  failures: [],
};

function requireCondition(condition, message) {
  if (!condition) report.failures.push(message);
}

async function getSnapshot() {
  return page.evaluate(() => ({
    visual: globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.() || null,
    assetPipeline: globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getSnapshot?.() || null,
    applied: globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [],
    production: globalThis.getProductionSliceQaState?.() || null,
    phase5: globalThis.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.getSnapshot?.() || null,
  }));
}

try {
  await page.goto(`${qaUrl}?qa=1&intro=0&assetPipeline=1&visualFoundation=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot === 'function');
  await page.waitForFunction(() => typeof globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getSnapshot === 'function');
  await page.waitForFunction(() => globalThis.__SW_THREEJS_ASSET_PIPELINE__.getSnapshot().appliedCount >= 1);
  await page.waitForFunction(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.getSnapshot().installed === true);
  await page.waitForTimeout(300);

  const before = await getSnapshot();
  const initialApplied = before.applied.find((entry) => entry.assetId === 'structure.storefront.v1') || null;
  requireCondition(Boolean(initialApplied), 'Authored storefront is missing before visual QA.');

  const storefrontPrepared = await page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('storefront'));
  requireCondition(storefrontPrepared === true, 'Storefront QA view did not prepare.');
  await page.waitForTimeout(120);
  report.storefront = await getSnapshot();
  await page.screenshot({ path: path.join(outputDir, 'threejs-visual-hero-storefront.png'), fullPage: true });

  const visual = report.storefront.visual;
  requireCondition(visual?.version === 'THREEJS_VISUAL_FOUNDATION_V1', `Visual foundation version mismatch: ${visual?.version}.`);
  requireCondition(visual?.heroSlice2Version === 'THREEJS_VISUAL_HERO_SLICE2_V1', `Hero Slice 2 version mismatch: ${visual?.heroSlice2Version}.`);
  requireCondition(visual?.renderer?.threeRevision === '128', `Three.js revision changed: ${visual?.renderer?.threeRevision}.`);
  requireCondition(visual?.renderer?.toneMapping === 'ACESFilmicToneMapping', `Tone mapping is ${visual?.renderer?.toneMapping}.`);
  requireCondition(visual?.renderer?.outputEncoding === 'sRGBEncoding', `Output encoding is ${visual?.renderer?.outputEncoding}.`);
  requireCondition(visual?.atmosphere?.skyDomePresent === true, 'Production sky dome is missing.');
  requireCondition(Number(visual?.atmosphere?.cloudCardCount) >= 5, `Only ${visual?.atmosphere?.cloudCardCount} cloud cards are active.`);
  requireCondition(Number(visual?.atmosphere?.dustCardCount) >= 9, `Only ${visual?.atmosphere?.dustCardCount} storm dust cards are active.`);
  requireCondition(visual?.atmosphere?.rimLightPresent === true, 'Storm rim light is missing.');
  requireCondition(visual?.hero?.rootPresent === true, 'Hero visual root is missing.');
  requireCondition(visual?.hero?.storefrontAsphaltPresent === true, 'Storefront asphalt language is missing.');
  requireCondition(visual?.hero?.storefrontSidewalkPresent === true, 'Storefront sidewalk language is missing.');
  requireCondition(Number(visual?.hero?.heroLightCount) >= 2, `Only ${visual?.hero?.heroLightCount} hero practical lights are active.`);
  requireCondition(visual?.hero?.authoredStorefrontCount === 1, `Expected one authored storefront, got ${visual?.hero?.authoredStorefrontCount}.`);
  requireCondition(visual?.hero?.storefrontSurfaceStyled === true, 'Storefront material pass is missing.');
  requireCondition(Number(visual?.hero?.curatedMaterialTextureCount) >= 5, `Only ${visual?.hero?.curatedMaterialTextureCount} curated material textures are active.`);
  requireCondition(!visual?.lastError, `Visual runtime recorded error: ${visual?.lastError}.`);

  const storefrontApplied = report.storefront.applied.find((entry) => entry.assetId === 'structure.storefront.v1') || {};
  requireCondition(storefrontApplied.health === 165 && storefrontApplied.maxHealth === 165, `Storefront health changed: ${storefrontApplied.health}/${storefrontApplied.maxHealth}.`);
  requireCondition(storefrontApplied.points === 110, `Storefront points changed: ${storefrontApplied.points}.`);
  requireCondition(storefrontApplied.damageStage === 0 && storefrontApplied.destroyed === false, 'Storefront gameplay state changed during visual preparation.');

  const storefrontCameraIsFront = await page.evaluate(() => {
    const node = scene?.getObjectByName?.('structure.storefront.v1') || null;
    if (!node) return false;
    const origin = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    node.getWorldPosition(origin);
    node.getWorldQuaternion(quaternion);
    const front = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion).setY(0).normalize();
    const toCamera = camera.position.clone().sub(origin).setY(0).normalize();
    return front.dot(toCamera) > 0.7;
  });
  requireCondition(storefrontCameraIsFront === true, 'Storefront evidence camera is not on the authored facade side.');

  const farmPrepared = await page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('farm'));
  requireCondition(farmPrepared === true, 'Farm QA view did not prepare.');
  await page.waitForTimeout(100);
  report.farm = await getSnapshot();
  await page.screenshot({ path: path.join(outputDir, 'threejs-visual-hero-farm.png'), fullPage: true });
  requireCondition(report.farm.visual?.hero?.hartFarmApronPresent === true, 'Hart Farm ground treatment is missing.');
  requireCondition(report.farm.visual?.hero?.hartFarmSurfaceStyled === true, 'Hart Farm material pass is missing.');
  requireCondition(report.farm.production?.barn?.health === report.farm.production?.barn?.maxHealth, `Farm QA changed barn health: ${report.farm.production?.barn?.health}/${report.farm.production?.barn?.maxHealth}.`);

  const farmSurfaceDetails = await page.evaluate(() => {
    const barn = scene?.getObjectByName?.('HartFarmSignatureBarn') || null;
    if (!barn) return null;
    let roofStyledCount = 0;
    let foundationStyled = false;
    barn.children.forEach((child) => {
      const p = child?.geometry?.parameters;
      if (!p || child.type !== 'Mesh') return;
      const width = Number(p.width || 0);
      const height = Number(p.height || 0);
      const depth = Number(p.depth || 0);
      const localY = Number(child.position?.y || 0);
      if (localY >= 12 && height <= 1.0 && depth >= 18 && child.userData?.swVisualHeroSlice2SurfaceStyled === true) roofStyledCount += 1;
      if (width >= 23 && height <= 0.8 && depth >= 17 && localY < 1 && child.userData?.swVisualHeroSlice2SurfaceStyled === true) foundationStyled = true;
    });
    return { roofStyledCount, foundationStyled };
  });
  requireCondition(Number(farmSurfaceDetails?.roofStyledCount) >= 2, `Only ${farmSurfaceDetails?.roofStyledCount} Hart Farm roof panels received the galvanized material.`);
  requireCondition(farmSurfaceDetails?.foundationStyled === false, 'Hart Farm foundation was incorrectly classified as metal roofing.');

  const farmCameraIsFront = await page.evaluate(() => {
    const barn = scene?.getObjectByName?.('HartFarmSignatureBarn') || null;
    if (!barn) return false;
    const origin = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    barn.getWorldPosition(origin);
    barn.getWorldQuaternion(quaternion);
    const front = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion).setY(0).normalize();
    const toCamera = camera.position.clone().sub(origin).setY(0).normalize();
    return front.dot(toCamera) > 0.7;
  });
  requireCondition(farmCameraIsFront === true, 'Farm evidence camera is not on the barn facade side.');

  const stormPrepared = await page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('storm'));
  requireCondition(stormPrepared === true, 'Storm QA view did not prepare.');
  await page.waitForTimeout(100);
  report.storm = await getSnapshot();
  await page.screenshot({ path: path.join(outputDir, 'threejs-visual-hero-storm.png'), fullPage: true });
  requireCondition(report.storm.visual?.atmosphere?.dustCardCount >= 9, 'Storm QA lost dust-card atmosphere.');

  await page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.clearQaView());
  const after = await getSnapshot();
  const finalApplied = after.applied.find((entry) => entry.assetId === 'structure.storefront.v1') || null;
  report.gameplayTruth = { before: initialApplied, after: finalApplied };
  requireCondition(JSON.stringify(initialApplied) === JSON.stringify(finalApplied), 'Visual QA changed authoritative storefront gameplay truth.');
  requireCondition(after.visual?.qaMode === null, 'Visual QA mode did not clear.');

  if (errors.length) report.failures.push(`Browser errors: ${errors.join(' | ')}`);
} finally {
  await writeFile(path.join(outputDir, 'threejs-visual-foundation-browser.log'), `${logs.join('\n')}\n`, 'utf8');
  await browser.close();
}

report.passed = report.failures.length === 0;
await writeFile(path.join(outputDir, 'threejs-visual-foundation-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Three.js visual foundation QA: ${report.passed ? 'PASS' : 'FAIL'}; errors=${errors.length}; failures=${report.failures.length}.`);
if (!report.passed) {
  report.failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
