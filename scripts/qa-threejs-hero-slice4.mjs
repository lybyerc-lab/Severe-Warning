import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'threejs-hero-slice4');
const qaUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const report = {
  version: 'THREEJS_HERO_SLICE4_QA_V1',
  generatedAt: new Date().toISOString(),
  passed: false,
  pristine: null,
  storm: null,
  damage: null,
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
  await page.waitForFunction(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.().heroSlice4Version === 'THREEJS_VISUAL_HERO_SLICE4_V1');
  await page.waitForFunction(() => globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getSnapshot?.().appliedCount >= 1);
  await page.waitForFunction(() => {
    const snapshot = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.();
    const status = snapshot?.stormVolume?.textureStatus || {};
    return status.dirt !== 'pending' && status.smoke !== 'pending' && status.trace !== 'pending';
  });
  return { page, errors };
}

async function snapshot(page) {
  return page.evaluate(() => ({
    visual: globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.getSnapshot?.() || null,
    applied: globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [],
  }));
}

const pristinePage = await createPage();
try {
  const prepared = await pristinePage.page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('storefront'));
  requireCondition(prepared === true, 'Pristine storefront QA view did not prepare.');
  await pristinePage.page.waitForTimeout(160);
  report.pristine = await snapshot(pristinePage.page);
  await pristinePage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice4-pristine-street.png'), fullPage: true });

  const visual = report.pristine.visual;
  requireCondition(visual?.heroSlice4Version === 'THREEJS_VISUAL_HERO_SLICE4_V1', `Hero Slice 4 version mismatch: ${visual?.heroSlice4Version}.`);
  requireCondition(visual?.cohesion?.worldRootPresent === true, 'Hero Slice 4 world-cohesion root is missing.');
  requireCondition(Number(visual?.cohesion?.facadeKitCount) >= 6, `Only ${visual?.cohesion?.facadeKitCount} nearby facade kits were installed.`);
  requireCondition(Number(visual?.cohesion?.transitionStripCount) >= 4, `Only ${visual?.cohesion?.transitionStripCount} ground transition strips were installed.`);
  requireCondition(visual?.stormVolume?.legacyFunnelTuned === true, 'Legacy tornado presentation material was not tuned.');
  requireCondition(visual?.stormVolume?.textureStatus?.dirt === 'local', `Dirt texture status is ${visual?.stormVolume?.textureStatus?.dirt}.`);
  requireCondition(visual?.stormVolume?.textureStatus?.smoke === 'local', `Smoke texture status is ${visual?.stormVolume?.textureStatus?.smoke}.`);
  requireCondition(visual?.stormVolume?.textureStatus?.trace === 'local', `Trace texture status is ${visual?.stormVolume?.textureStatus?.trace}.`);
  requireCondition(!visual?.heroSlice4LastError, `Hero Slice 4 runtime error: ${visual?.heroSlice4LastError}.`);

  const storefront = report.pristine.applied.find((entry) => entry.assetId === 'structure.storefront.v1') || {};
  requireCondition(storefront.health === storefront.maxHealth && storefront.damageStage === 0 && storefront.destroyed === false, 'Pristine view changed authored storefront gameplay truth.');
  if (pristinePage.errors.length) report.failures.push(`Pristine browser errors: ${pristinePage.errors.join(' | ')}`);
} finally {
  await pristinePage.page.close();
}

const stormPage = await createPage();
try {
  const prepared = await stormPage.page.evaluate(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.prepareQaView('storm'));
  requireCondition(prepared === true, 'Storm-volume QA view did not prepare.');
  await stormPage.page.waitForTimeout(180);
  report.storm = await snapshot(stormPage.page);
  await stormPage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice4-storm-volume.png'), fullPage: true });

  const stormVisual = report.storm.visual?.stormVolume;
  requireCondition(stormVisual?.rootPresent === true, 'Hero Slice 4 storm-volume root is missing.');
  requireCondition(Number(stormVisual?.shellCount) >= 4, `Only ${stormVisual?.shellCount} tornado volume shells are active.`);
  requireCondition(Number(stormVisual?.wispCount) >= 12, `Only ${stormVisual?.wispCount} tornado vapor wisps are active.`);
  requireCondition(Number(stormVisual?.groundSkirtCount) >= 12, `Only ${stormVisual?.groundSkirtCount} tornado ground-skirt cards are active.`);
  requireCondition(Number(stormVisual?.rainCardCount) >= 8, `Only ${stormVisual?.rainCardCount} rain trace cards are active.`);
  requireCondition(stormVisual?.textureStatus?.dirt === 'local' && stormVisual?.textureStatus?.smoke === 'local' && stormVisual?.textureStatus?.trace === 'local', 'Storm-volume QA is not using the packaged local VFX candidates.');
  if (stormPage.errors.length) report.failures.push(`Storm browser errors: ${stormPage.errors.join(' | ')}`);
} finally {
  await stormPage.page.close();
}

const damagePage = await createPage();
try {
  const damageResult = await damagePage.page.evaluate(() => {
    const target = typeof targets !== 'undefined' && Array.isArray(targets)
      ? targets.find((candidate) => candidate?.__swAuthoredAssetId === 'structure.storefront.v1')
      : null;
    if (!target || typeof damageTarget !== 'function') return null;
    const before = {
      health: target.health,
      maxHealth: target.maxHealth,
      damageStage: target.damageStage,
      destroyed: target.destroyed,
      damagePartCount: target.meshData?.damageParts?.length || 0,
    };
    damageTarget(target, target.maxHealth * 0.68, 'qa-visual');
    globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView?.('storefront');
    const after = {
      health: target.health,
      maxHealth: target.maxHealth,
      damageStage: target.damageStage,
      destroyed: target.destroyed,
      damagePartCount: target.meshData?.damageParts?.length || 0,
    };
    return { before, after };
  });
  requireCondition(Boolean(damageResult), 'Authoritative storefront damage probe could not run.');
  await damagePage.page.waitForTimeout(180);
  report.damage = { damageResult, ...(await snapshot(damagePage.page)) };
  await damagePage.page.screenshot({ path: path.join(outputDir, 'threejs-hero-slice4-damaged-storefront.png'), fullPage: true });

  requireCondition(damageResult?.before?.damageStage === 0 && damageResult?.before?.destroyed === false, 'Damage probe did not begin from pristine authored storefront state.');
  requireCondition(damageResult?.after?.damageStage === 2, `Authoritative damage probe reached stage ${damageResult?.after?.damageStage}, expected 2.`);
  requireCondition(damageResult?.after?.destroyed === false, 'Damage evidence destroyed the storefront instead of stopping at staged damage.');
  requireCondition(Number(damageResult?.after?.health) > 0 && Number(damageResult?.after?.health) < Number(damageResult?.before?.health), 'Damage evidence did not reduce storefront health through damageTarget.');
  requireCondition(Number(damageResult?.after?.damagePartCount) < Number(damageResult?.before?.damagePartCount), 'Damage stage did not expose/remove authored structure anatomy in the evidence state.');
  if (damagePage.errors.length) report.failures.push(`Damage browser errors: ${damagePage.errors.join(' | ')}`);
} finally {
  await damagePage.page.close();
}

await browser.close();
report.passed = report.failures.length === 0;
await writeFile(path.join(outputDir, 'threejs-hero-slice4-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Three.js Hero Slice 4 QA: ${report.passed ? 'PASS' : 'FAIL'}; failures=${report.failures.length}.`);
if (!report.passed) {
  report.failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
