import { chromium } from 'playwright';

const url = process.env.SEVERE_WEATHER_QA_URL || 'http://127.0.0.1:4173/';
const label = process.env.SOURCE_LABEL || 'UNKNOWN';
const sha = process.env.SOURCE_SHA || 'UNKNOWN';

const pageErrors = [];
const consoleErrors = [];
const httpErrors = [];

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required']
});

let bootstrapSuccess = false;
let legacyContractError = null;

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  page.on('pageerror', (err) => {
    const msg = err.message || String(err);
    pageErrors.push(msg);
    if (msg.includes('Legacy runtime contract is incomplete')) {
      legacyContractError = msg;
    }
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      consoleErrors.push(text);
      if (text.includes('Legacy runtime contract is incomplete')) {
        legacyContractError = text;
      }
    }
  });

  page.on('response', (res) => {
    if (res.status() >= 400) {
      httpErrors.push({ status: res.status(), url: res.url() });
    }
  });

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);

  const bridgeStatus = await page.evaluate(() => {
    return {
      hasClockBridge: typeof globalThis.__SW_PHASE2_CLOCK_BRIDGE__ !== 'undefined' && globalThis.__SW_PHASE2_CLOCK_BRIDGE__ !== null,
      hasInputAbilityBridge: typeof globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__ !== 'undefined' && globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__ !== null,
      hasScoringCampaignBridge: typeof globalThis.__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__ !== 'undefined' && globalThis.__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__ !== null,
      hasPresentationWorldBridge: typeof globalThis.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__ !== 'undefined' && globalThis.__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__ !== null,
      modernShellActive: typeof globalThis.__SW_MODERN_SHELL__ !== 'undefined',
      visualFoundationActive: typeof globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ !== 'undefined'
    };
  });

  bootstrapSuccess = pageErrors.length === 0 && legacyContractError === null;

  const result = {
    label,
    sha,
    bootstrapSuccess,
    noPageErrors: pageErrors.length === 0,
    noRuntimeConsoleErrors: consoleErrors.length === 0,
    legacyContractError,
    bridgeFlags: {
      hasClockBridge: bridgeStatus.hasClockBridge,
      hasInputAbilityBridge: bridgeStatus.hasInputAbilityBridge,
      hasScoringCampaignBridge: bridgeStatus.hasScoringCampaignBridge,
      hasPresentationWorldBridge: bridgeStatus.hasPresentationWorldBridge
    },
    pageErrors,
    consoleErrors,
    httpErrors
  };

  console.log(`=== CAUSAL INSPECTION RESULT FOR [${label}] (${sha}) ===`);
  console.log(JSON.stringify(result, null, 2));

} catch (err) {
  console.error(`Error executing modern shell causal test for [${label}]:`, err.message);
  console.log(JSON.stringify({
    label,
    sha,
    bootstrapSuccess: false,
    noPageErrors: false,
    noRuntimeConsoleErrors: false,
    legacyContractError: err.message,
    bridgeFlags: {
      hasClockBridge: false,
      hasInputAbilityBridge: false,
      hasScoringCampaignBridge: false,
      hasPresentationWorldBridge: false
    },
    pageErrors: [err.message],
    consoleErrors,
    httpErrors
  }, null, 2));
} finally {
  await browser.close();
}
