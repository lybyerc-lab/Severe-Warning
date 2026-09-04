import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_Warning.html');

const html = await readFile(sourcePath, 'utf8');

// The build identity is whatever package.json declares, not a literal. A literal
// here goes stale the moment the patch chain advances, and then reports a healthy
// build as broken.
const { version: expectedVersion } = JSON.parse(
  await readFile(path.join(projectRoot, 'package.json'), 'utf8')
);
if (!/^\d+\.\d+\.\d+$/.test(expectedVersion)) {
  throw new Error(`package.json version must be semantic x.y.z, received: ${expectedVersion}`);
}
const checks = [];

function check(name, condition, detail = '') {
  const passed = Boolean(condition);
  checks.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

for (const [name, marker] of [
  ['build identity', `v${expectedVersion}`],
  ['campaign foundation marker', 'V500_CAMPAIGN_FOUNDATION_V1'],
  ['campaign subsystem anchor', '[SW:CAMPAIGN:HEARTLAND]'],
  ['campaign save schema', 'severe_weather_campaign_v1'],
  ['campaign map', 'campaignMapGrid'],
  ['campaign result', 'campaignOutcome'],
  ['campaign selector', 'function selectCampaignLevel'],
  ['campaign completion', 'function completeCampaignRun'],
  ['campaign next stop', 'function startNextCampaignLevel'],
  ['campaign presentation', 'function applyCampaignPresentation'],
  ['campaign score modifier', 'function campaignScoreMultiplier'],
  ['real-time run clock', 'V500_REALTIME_RUN_CLOCK_V1'],
  ['run clock stable anchor', '[SW:GAMEPLAY:RUN_CLOCK]'],
  ['world tour marker', 'V500_WORLD_TOUR_V1'],
  ['mobile layout fix marker', 'V500_MOBILE_LAYOUT_FIX_V2'],
  ['bovine signature marker', 'V500_BOVINE_SIGNATURE_V1'],
  ['bovine stable anchor', '[SW:WORLD:BOVINE_SIGNATURE]'],
  ['safe animal invariant', '[SW:LAW:SAFE-ANIMALS]'],
  ['bovine save schema', 'severe_weather_bovine_v1'],
  ['Cow 17 QA state', 'getBovineQaState'],
  ['Cow-Cam QA trigger', 'triggerCowCamQa'],
  ['bovine results report', 'BOVINE SITUATION REPORT'],
  ['Moo Brew liability line', 'Moo Brew accepts no responsibility for atmospheric cattle'],
  ['scaled landscape breakpoint', '(max-height: 720px), (orientation: landscape) and (pointer: coarse)'],
  ['results use border-box sizing', '.results-card { box-sizing: border-box; }'],
  ['results respect dynamic viewport', 'max-height: calc(100dvh'],
  ['QA tools are player-hidden', 'html:not(.qa-tools-enabled) #visualLabToggle'],
  ['QA tools have explicit override', 'globalThis.setQaToolsVisible'],
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
  // [SW:CAMPAIGN:REGION_PROGRESSION] Was the literal
  // `index > campaignProgress.unlockedLevel`, which only ever described
  // Heartland. The guard is now one region-aware predicate used by the map, the
  // selector and NEXT STOP alike.
  ['locked-level guard', 'function campaignLevelLocked'],
  ['locked-level guard is applied when selecting', 'if (campaignLevelLocked(selectedCampaignRegion, index)) {'],
  ['per-region unlock accessors', 'function setCampaignUnlockedIndex'],
  ['region table', 'const CAMPAIGN_REGIONS = ['],
  // Assert the CALL SITE, not the definition: a marker that matches
  // `function campaignTotalStarCapacity()` passes even when nothing calls it,
  // which is exactly how this check first slipped through its own control.
  ['star total is derived, not hardcoded', "getCampaignTotalStars() + '/' + campaignTotalStarCapacity()"],
  ['region completion names its own region', "region.label + ' COMPLETE!'"]
]) {
  check(name, html.includes(marker), marker);
}

check('no stale v4.5 identity', !html.includes('v4.5.0'));
check('four campaign stops', (html.match(/id: '(?:lincoln-county|prairie-junction|grain-belt|state-fair-finale)'/g) || []).length === 4);
// Every county in all three regions, not just Heartland's four. Coastal and
// Metro used to declare `targetPoints`, a key nothing in the gameplay path read:
// the score objective threw on their counties, and two and three stars were
// unreachable there because both thresholds tested against undefined.
check('every county declares a score target', (html.match(/scoreTarget: \d+/g) || []).length === 10);
check('no county still declares targetPoints', !html.includes('targetPoints'));
check('all ten counties exist', (html.match(/id: '(?:lincoln-county|prairie-junction|grain-belt|state-fair-finale|bayou-bend|pelican-key|port-delta|downtown-core|rail-terminal|broadcast-heights)'/g) || []).length === 10);
check('distinct district contracts', (html.match(/districts: \[/g) || []).length === 4);
check('campaign applies after world reset', html.includes('init3DWorld();\n  applyCampaignPresentation();'));
check('campaign completion precedes results', html.includes('completeCampaignRun(grade, destructionScore, doneCount);'));
check('countdown uses real-time clock', html.includes('runTimeRemaining - runClockDelta'));
check('countdown pauses with gameplay', html.includes('if (runActive && !isPaused)'));
check('countdown rejects simulation delta', !html.includes('runTimeRemaining - dt'));
check('world prepared before target spawn', html.includes('prepareCampaignWorld();\n  init3DWorld();\n  applyCampaignPresentation();'));
check('four authored world contracts', (html.match(/'(?:lincoln-county|prairie-junction|grain-belt|state-fair-finale)': \{/g) || []).length === 4);
// Counted kinds, not occurrences. This asserted exactly eight matches, which
// was the same thing back when the campaign was one region placing each
// signature landmark once. The three-region expansion reuses them across
// worlds - eighteen occurrences at the time of writing - and the check started
// failing for growth rather than for breakage. What it is actually guarding is
// that none of the eight signature kinds has gone missing, so count the set.
const signatureLandmarkKinds = ['water-tower', 'courthouse', 'grain-elevator', 'windmill', 'silo-bank', 'foundry', 'ferris-wheel', 'grandstand'];
const presentLandmarkKinds = signatureLandmarkKinds.filter(kind => html.includes(`kind: '${kind}'`));
check(
  `eight signature landmark kinds present (${presentLandmarkKinds.length}/8)`,
  presentLandmarkKinds.length === signatureLandmarkKinds.length
);
check('four distinct terrain profiles', (html.match(/profile: [0-3], biome:/g) || []).length === 4);
check('campaign scenery is lazy initialized', html.includes('let campaignSceneryGroup = null;') && html.includes('function ensureCampaignSceneryGroup'));
check('campaign scenery animates', html.includes('updateCampaignScenery(dt);'));
check('campaign challenges replace generic pool', html.includes('campaignChallengeFor(stage, pool[index])'));
check('Cow 17 is density-safe first spawn', html.includes('const id = index === 0 ? 17'));
check('cow motion uses frame delta', html.includes('cow.orbitAngle += 5.4 * dt * cowMotionScale'));
check('bovine vocal audio enabled', html.includes('moo_1') && !html.includes('disabled-synthetic-source'));
check('bovine result finalizes before campaign result', html.includes('finalizeBovineRun();\n  updateHighScore'));

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
