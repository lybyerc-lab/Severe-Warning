import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

const html = await readFile(sourcePath, 'utf8');
const checks = [];

function check(name, condition, detail = '') {
  const passed = Boolean(condition);
  checks.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

for (const [name, marker] of [
  ['v5 build identity', 'v5.0.0'],
  ['campaign foundation marker', 'V500_CAMPAIGN_FOUNDATION_V1'],
  ['campaign subsystem anchor', '[SW:CAMPAIGN:HEARTLAND]'],
  ['campaign save schema', 'severe_weather_campaign_v1'],
  ['campaign map', 'campaignMapGrid'],
  ['campaign result', 'campaignOutcome'],
  ['campaign selector', 'function selectCampaignLevel'],
  ['campaign completion', 'function completeCampaignRun'],
  ['campaign next stop', 'function startNextCampaignLevel'],
  ['campaign presentation', 'function applyCampaignPresentation'],
  ['campaign score modifier', 'campaignScoreMultiplier()'],
  ['real-time run clock', 'V500_REALTIME_RUN_CLOCK_V1'],
  ['run clock stable anchor', '[SW:GAMEPLAY:RUN_CLOCK]'],
  ['world tour marker', 'V500_WORLD_TOUR_V1'],
  ['campaign world anchor', '[SW:WORLD:CAMPAIGN_IDENTITY]'],
  ['world blueprints', 'HEARTLAND_WORLD_BLUEPRINTS'],
  ['campaign terrain profiles', 'function campaignTerrainProfile'],
  ['campaign terrain preparation', 'function prepareCampaignWorld'],
  ['campaign world application', 'function applyCampaignWorldIdentity'],
  ['campaign landmark factory', 'function createCampaignLandmarkMesh'],
  ['campaign world QA state', 'getCampaignWorldQaState'],
  ['offline empty favicon', 'rel="icon" href="data:,"'],
  ['grain belt animated turbine', 'campaignAnimatedMeshes.push({ mesh: roofTurbine'],
  ['persistent save', 'localStorage.setItem(CAMPAIGN_STORAGE_KEY'],
  ['persistent load', 'localStorage.getItem(CAMPAIGN_STORAGE_KEY'],
  ['locked-level guard', 'index > campaignProgress.unlockedLevel'],
  ['four-stop star total', "'/12 STARS'"],
  ['tour completion', 'HEARTLAND TOUR COMPLETE!']
]) {
  check(name, html.includes(marker), marker);
}

check('no stale v4.5 identity', !html.includes('v4.5.0'));
check('four campaign stops', (html.match(/id: '(?:lincoln-county|prairie-junction|grain-belt|state-fair-finale)'/g) || []).length === 4);
check('three-star contracts', (html.match(/scoreTarget: \d+/g) || []).length === 4);
check('distinct district contracts', (html.match(/districts: \[/g) || []).length === 4);
check('campaign applies after world reset', html.includes('init3DWorld();\n  applyCampaignPresentation();'));
check('campaign completion precedes results', html.includes('completeCampaignRun(grade, destructionScore, doneCount);'));
check('countdown uses real-time clock', html.includes('runTimeRemaining - runClockDelta'));
check('countdown pauses with gameplay', html.includes('if (runActive && !isPaused)'));
check('countdown rejects simulation delta', !html.includes('runTimeRemaining - dt'));
check('world prepared before target spawn', html.includes('prepareCampaignWorld();\n  init3DWorld();\n  applyCampaignPresentation();'));
check('four authored world contracts', (html.match(/'(?:lincoln-county|prairie-junction|grain-belt|state-fair-finale)': \{/g) || []).length === 4);
check('eight signature landmark contracts', (html.match(/kind: '(?:water-tower|courthouse|grain-elevator|windmill|silo-bank|foundry|ferris-wheel|grandstand)'/g) || []).length === 8);
check('four distinct terrain profiles', (html.match(/profile: [0-3], biome:/g) || []).length === 4);
check('campaign scenery is lazy initialized', html.includes('let campaignSceneryGroup = null;') && html.includes('function ensureCampaignSceneryGroup'));
check('campaign scenery animates', html.includes('updateCampaignScenery(dt);'));
check('campaign challenges replace generic pool', html.includes('campaignChallengeFor(stage, pool[index])'));

const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1])
  .filter(source => source.trim().length > 0);

check('inline scripts found', inlineScripts.length >= 2, `${inlineScripts.length} scripts`);
for (let index = 0; index < inlineScripts.length; index++) {
  try {
    new Function(inlineScripts[index]);
    check(`inline script ${index + 1} syntax`, true);
  } catch (error) {
    check(`inline script ${index + 1} syntax`, false, error.message);
  }
}

const failures = checks.filter(result => !result.passed);
console.log(`\nv5 campaign verification: ${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length > 0) {
  console.error(`Failed checks: ${failures.map(result => result.name).join(', ')}`);
  process.exitCode = 1;
}
