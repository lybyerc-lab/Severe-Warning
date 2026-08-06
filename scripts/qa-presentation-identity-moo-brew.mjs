import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = process.env.SEVERE_WEATHER_QA_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_QA_DIR)
  : path.join(projectRoot, 'qa-artifacts', 'presentation-identity');
const qaUrl = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1365, height: 630 } });
page.setDefaultTimeout(30000);
const errors = [];
const logs = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  logs.push(`[${message.type()}] ${message.text()}`);
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

const report = {
  version: 'PRESENTATION_IDENTITY_MOO_BREW_QA_V1',
  generatedAt: new Date().toISOString(),
  passed: false,
  intro: {},
  world: null,
  resultsLayouts: [],
  errors,
  failures: [],
};

function requireCondition(condition, message) {
  if (!condition) report.failures.push(message);
}

async function bridgeSnapshot() {
  return page.evaluate(() => globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__.getSnapshot());
}

async function setIntroPhase(phase, screenshotName) {
  await page.evaluate((requestedPhase) => {
    const bridge = globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__;
    if (!bridge.getSnapshot().intro.active) {
      bridge.showIntro({ startAfter: false, deterministic: true, phase: requestedPhase });
    } else {
      bridge.setIntroPhase(requestedPhase);
    }
  }, phase);
  await page.waitForTimeout(220);
  const snapshot = await bridgeSnapshot();
  report.intro[phase] = snapshot.intro;
  await page.screenshot({ path: path.join(outputDir, screenshotName), fullPage: true });
  return snapshot.intro;
}

async function captureResultsLayout(width, height, name) {
  await page.setViewportSize({ width, height });
  await page.evaluate(() => globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__.showResultsForQa());
  await page.waitForTimeout(180);
  const snapshot = await bridgeSnapshot();
  report.resultsLayouts.push({ width, height, bounds: snapshot.results });
  await page.screenshot({ path: path.join(outputDir, name), fullPage: true });
  requireCondition(snapshot.results?.withinViewport, `${width}x${height}: results card escapes the viewport.`);
  requireCondition(snapshot.results?.titleVisible, `${width}x${height}: results title is clipped.`);
  requireCondition(snapshot.results?.actionsVisible, `${width}x${height}: results actions are clipped.`);
  requireCondition(snapshot.results?.scrollRegionCount === 1, `${width}x${height}: expected one bounded results scroll region.`);
  await page.evaluate(() => globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__.hideResultsForQa());
}

try {
  await page.goto(`${qaUrl}?qa=1&intro=0&identity=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => typeof globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__?.getSnapshot === 'function');
  await page.waitForFunction(() => typeof globalThis.__SW_CITY_FABRIC_BRIDGE__?.getSnapshot === 'function');

  const sip = await setIntroPhase('moo-brew-sip', 'presentation-identity-intro-moo-brew-sip.png');
  requireCondition(sip.active && sip.phase === 'moo-brew-sip', 'Moo Brew sip phase did not become active.');
  requireCondition(sip.cowVisible && sip.cupVisible, 'Moo Brew sip phase must show both Cow 17 and the cup.');

  const doubleTake = await setIntroPhase('cow-double-take', 'presentation-identity-intro-cow-double-take.png');
  requireCondition(doubleTake.active && doubleTake.phase === 'cow-double-take', 'Cow double-take phase did not become active.');

  const touchdown = await setIntroPhase('tornado-touchdown', 'presentation-identity-intro-tornado-touchdown.png');
  requireCondition(touchdown.active && touchdown.tornadoVisible, 'Tornado touchdown phase must show the tornado.');

  await page.evaluate(() => globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__.hideIntro());
  await page.waitForTimeout(80);

  const menuVisible = await page.evaluate(() => {
    const menu = document.getElementById('mainMenu');
    if (!menu) return false;
    const style = getComputedStyle(menu);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0;
  });
  if (menuVisible) await page.click('#btnStartMenu');
  await page.waitForTimeout(900);

  report.world = await bridgeSnapshot();
  requireCondition(report.world.version === 'PRESENTATION_IDENTITY_MOO_BREW_V1', 'Presentation identity bridge version mismatch.');
  requireCondition(report.world.cows.enhancedCount === report.world.cows.totalAnimals && report.world.cows.totalAnimals > 0, 'Every live cow must use the enhanced readable rig.');
  requireCondition(report.world.cows.cow17Present, 'Cow 17 is missing.');
  requireCondition(report.world.cows.cow17HasHead, 'Cow 17 has no readable head.');
  requireCondition(report.world.cows.cow17HasFourLegs, 'Cow 17 must have four visible legs.');
  requireCondition(report.world.cows.cow17HasTag, 'Cow 17 identity tag is missing.');
  requireCondition(report.world.cows.cow17Parts >= 20, `Cow 17 part count ${report.world.cows.cow17Parts} is below the readable silhouette contract.`);
  requireCondition(report.world.world.mooBrewPropCount >= 2, 'Moo Brew environmental dressing is missing.');
  requireCondition(report.world.state.resultsConfigured, 'Results containment shell is not configured.');
  requireCondition(report.world.state.startInterceptInstalled, 'Startup scene interception is not installed.');
  await page.screenshot({ path: path.join(outputDir, 'presentation-identity-live-world.png'), fullPage: true });

  await captureResultsLayout(1365, 630, 'presentation-identity-results-1365x630.png');
  await captureResultsLayout(932, 430, 'presentation-identity-results-932x430.png');
  await captureResultsLayout(760, 360, 'presentation-identity-results-760x360.png');
} finally {
  await writeFile(path.join(outputDir, 'presentation-identity-browser.log'), `${logs.join('\n')}\n`, 'utf8');
  await browser.close();
}

if (errors.length) report.failures.push(`Browser errors: ${errors.join(' | ')}`);
report.passed = report.failures.length === 0;
await writeFile(path.join(outputDir, 'presentation-identity-report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log(`Presentation identity QA: ${report.passed ? 'PASS' : 'FAIL'} (${report.resultsLayouts.length} compact layouts).`);
if (!report.passed) {
  report.failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
