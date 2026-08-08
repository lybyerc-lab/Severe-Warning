import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'threejs-asset-pipeline');
const qaUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const report = {
  version: 'THREEJS_ASSET_PIPELINE_QA_V1',
  generatedAt: new Date().toISOString(),
  passed: false,
  success: null,
  fallback: null,
  failures: [],
};

function requireCondition(condition, message) {
  if (!condition) report.failures.push(message);
}

async function makePage() {
  const page = await browser.newPage({ viewport: { width: 932, height: 430 } });
  page.setDefaultTimeout(30000);
  const errors = [];
  const logs = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    logs.push(`[${message.type()}] ${message.text()}`);
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return { page, errors, logs };
}

async function dismissIntroAndStart(page) {
  await page.waitForFunction(() => typeof globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__?.getSnapshot === 'function');
  await page.evaluate(() => globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__.hideIntro());
  await page.waitForTimeout(50);
  const menuVisible = await page.evaluate(() => {
    const menu = document.getElementById('mainMenu');
    if (!menu) return false;
    const style = getComputedStyle(menu);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0;
  });
  if (menuVisible) await page.click('#btnStartMenu');
  await page.waitForTimeout(700);
}

async function snapshot(page) {
  return page.evaluate(() => ({
    revision: globalThis.THREE?.REVISION || null,
    pipeline: globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getSnapshot?.() || null,
    applied: globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [],
    city: globalThis.__SW_CITY_FABRIC_BRIDGE__?.getSnapshot?.() || null,
  }));
}

const successPage = await makePage();
try {
  await successPage.page.goto(`${qaUrl}?qa=1&intro=0&identity=1&assetPipeline=1`, { waitUntil: 'domcontentloaded' });
  await successPage.page.waitForFunction(() => typeof globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getSnapshot === 'function');
  await successPage.page.waitForFunction(() => globalThis.__SW_THREEJS_ASSET_PIPELINE__.getSnapshot().appliedCount >= 1);
  await dismissIntroAndStart(successPage.page);
  report.success = await snapshot(successPage.page);
  await successPage.page.screenshot({ path: path.join(outputDir, 'threejs-asset-pipeline-authored-storefront.png'), fullPage: true });

  requireCondition(report.success.revision === '128', `Three.js revision changed: ${report.success.revision}.`);
  requireCondition(report.success.pipeline?.version === 'THREEJS_ASSET_PIPELINE_V1', 'Asset pipeline bridge version mismatch.');
  requireCondition(report.success.pipeline?.loadFailures === 0, `Successful asset path recorded ${report.success.pipeline?.loadFailures} load failures.`);
  requireCondition(report.success.pipeline?.appliedCount === 1, `Expected exactly one authored presentation; got ${report.success.pipeline?.appliedCount}.`);
  requireCondition(report.success.applied.length === 1, `Expected one applied target; got ${report.success.applied.length}.`);
  const applied = report.success.applied[0] || {};
  requireCondition(applied.assetId === 'structure.storefront.v1', `Unexpected asset id ${applied.assetId}.`);
  requireCondition(applied.kind === 'shop', `Authored asset attached to unexpected target kind ${applied.kind}.`);
  requireCondition(applied.health === applied.maxHealth, `Authored target health changed: ${applied.health}/${applied.maxHealth}.`);
  requireCondition(applied.health === 165, `Shop health changed from accepted value 165: ${applied.health}.`);
  requireCondition(applied.points === 110, `Shop points changed from accepted value 110: ${applied.points}.`);
  requireCondition(applied.damageStage === 0 && applied.destroyed === false, 'Authored target was not intact after presentation swap.');
  requireCondition(applied.damagePartCount >= 10, `Authored storefront has only ${applied.damagePartCount} damage parts.`);
  requireCondition(report.success.city?.uniqueArchetypes >= 8, 'City fabric bridge did not remain active after authored presentation swap.');
  if (successPage.errors.length) report.failures.push(`Success-path browser errors: ${successPage.errors.join(' | ')}`);
} finally {
  await writeFile(path.join(outputDir, 'threejs-asset-pipeline-success-browser.log'), `${successPage.logs.join('\n')}\n`, 'utf8');
  await successPage.page.close();
}

const fallbackPage = await makePage();
try {
  await fallbackPage.page.route('**/assets/production/structures/storefront-v1.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ version: 'BROKEN_ASSET_FOR_QA', id: 'structure.storefront.v1', archetype: 'shop' }),
    });
  });
  await fallbackPage.page.goto(`${qaUrl}?qa=1&intro=0&identity=1&assetPipeline=1`, { waitUntil: 'domcontentloaded' });
  await fallbackPage.page.waitForFunction(() => typeof globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getSnapshot === 'function');
  await fallbackPage.page.waitForFunction(() => globalThis.__SW_THREEJS_ASSET_PIPELINE__.getSnapshot().loadFailures >= 1);
  await dismissIntroAndStart(fallbackPage.page);
  report.fallback = await snapshot(fallbackPage.page);
  await fallbackPage.page.screenshot({ path: path.join(outputDir, 'threejs-asset-pipeline-fallback.png'), fullPage: true });

  requireCondition(report.fallback.revision === '128', `Fallback page Three.js revision changed: ${report.fallback.revision}.`);
  requireCondition(report.fallback.pipeline?.appliedCount === 0, 'Invalid authored asset should not replace the accepted fallback mesh.');
  requireCondition(report.fallback.pipeline?.loadFailures >= 1, 'Invalid authored asset did not record a load failure.');
  requireCondition(report.fallback.applied.length === 0, 'Fallback path reports an authored target despite validation failure.');
  requireCondition(String(report.fallback.pipeline?.lastError || '').includes('Unexpected asset version'), `Fallback error was not the expected schema rejection: ${report.fallback.pipeline?.lastError}.`);
  requireCondition(report.fallback.city?.targetCount > 0, 'City fabric disappeared when the authored asset failed.');
  if (fallbackPage.errors.length) report.failures.push(`Fallback-path browser errors: ${fallbackPage.errors.join(' | ')}`);
} finally {
  await writeFile(path.join(outputDir, 'threejs-asset-pipeline-fallback-browser.log'), `${fallbackPage.logs.join('\n')}\n`, 'utf8');
  await fallbackPage.page.close();
}

await browser.close();
report.passed = report.failures.length === 0;
await writeFile(path.join(outputDir, 'threejs-asset-pipeline-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Three.js asset pipeline QA: ${report.passed ? 'PASS' : 'FAIL'}; applied=${report.success?.pipeline?.appliedCount ?? 0}; fallbackFailures=${report.fallback?.pipeline?.loadFailures ?? 0}.`);
if (!report.passed) {
  report.failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
