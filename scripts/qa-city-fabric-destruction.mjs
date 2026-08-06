import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'city-fabric');
const qaUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });
const errors = [];
const logs = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  logs.push(`[${message.type()}] ${message.text()}`);
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

const levels = [];
try {
  await page.goto(`${qaUrl}?qa=1&cityfabric=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof globalThis.__SW_CITY_FABRIC_BRIDGE__?.getSnapshot === 'function', null, { timeout: 30000 });
  for (let index = 0; index < 4; index += 1) {
    await page.evaluate((campaignIndex) => {
      campaignProgress.unlockedLevel = 3;
      campaignProgress.selectedLevel = campaignIndex;
      selectedCampaignIndex = campaignIndex;
      resetWarningRun();
    }, index);
    await page.waitForTimeout(900);
    const snapshot = await page.evaluate(() => ({
      levelId: getActiveCampaignLevel().id,
      city: globalThis.__SW_CITY_FABRIC_BRIDGE__.getSnapshot(),
      phase6: globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__?.getSnapshot?.() || null,
      targetCount: targets.length,
      blockCount: townBlocks.length,
    }));
    await page.screenshot({ path: path.join(outputDir, `city-fabric-level-${index + 1}.png`), fullPage: true });
    levels.push(snapshot);
  }
} finally {
  await writeFile(path.join(outputDir, 'city-fabric-browser.log'), `${logs.join('\n')}\n`, 'utf8');
  await browser.close();
}

const failures = [];
const profiles = new Set(levels.map((entry) => entry.city?.profile));
const distributions = new Set(levels.map((entry) => JSON.stringify(entry.city?.archetypeCounts || {})));
if (levels.length !== 4) failures.push(`Expected four campaign stops, received ${levels.length}.`);
if (profiles.size !== 4) failures.push(`Expected four distinct city profiles, received ${profiles.size}.`);
if (distributions.size !== 4) failures.push(`Expected four distinct archetype distributions, received ${distributions.size}.`);
for (const entry of levels) {
  const city = entry.city;
  if (!city) { failures.push(`${entry.levelId}: missing city fabric snapshot.`); continue; }
  if (city.targetCount < 125 || city.targetCount > 190) failures.push(`${entry.levelId}: target count ${city.targetCount} outside 125..190.`);
  if (city.activeBlockCount < 30) failures.push(`${entry.levelId}: only ${city.activeBlockCount} active blocks.`);
  if (city.uniqueArchetypes < 7) failures.push(`${entry.levelId}: only ${city.uniqueArchetypes} archetypes.`);
  if (city.maxTargetsPerActiveBlock - city.minTargetsPerActiveBlock < 1) failures.push(`${entry.levelId}: block density remains uniform.`);
  if (!entry.phase6?.integration?.wrappersInstalled) failures.push(`${entry.levelId}: Phase 6 integration missing.`);
}
if (errors.length) failures.push(`Browser errors: ${errors.join(' | ')}`);

const report = {
  version: 'CITY_FABRIC_DESTRUCTION_QA_V1',
  generatedAt: new Date().toISOString(),
  passed: failures.length === 0,
  levels,
  profileCount: profiles.size,
  distributionCount: distributions.size,
  errors,
  failures,
};
await writeFile(path.join(outputDir, 'city-fabric-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`City fabric QA: ${report.passed ? 'PASS' : 'FAIL'} (${levels.length} levels, ${profiles.size} profiles).`);
if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
