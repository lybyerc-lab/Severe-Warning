import { execFileSync } from 'node:child_process';
import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourceGitPath = 'MechanicsLab/SevereWeather_3D_Lab.html';
const checks = [];

function check(name, condition, detail = '') {
  const passed = Boolean(condition);
  checks.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}
async function read(relativePath) {
  return readFile(path.join(projectRoot, relativePath), 'utf8');
}

const packageJson = JSON.parse(await read('package.json'));
const runtime = await read('runtime/city-fabric-destruction.js');
const apply = await read('scripts/apply-city-fabric-destruction.mjs');
const qa = await read('scripts/qa-city-fabric-destruction.mjs');
const workflow = await read('.github/workflows/city-fabric-destruction.yml');
const committedSource = execFileSync('git', ['-C', projectRoot, 'show', `HEAD:${sourceGitPath}`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });

const patchScripts = [
  'scripts/apply-v431-source-patch.mjs',
  'scripts/apply-v440-source-patch.mjs',
  'scripts/apply-v441-source-patch.mjs',
  'scripts/apply-v442-source-patch.mjs',
  'scripts/fix-v450-parser.mjs',
  'scripts/apply-v450-source-patch.mjs',
  'scripts/apply-v450-rampage-music-patch.mjs',
  'scripts/apply-qa-corrections-patch.mjs',
  'scripts/apply-audio-mix-followup-patch.mjs',
  'scripts/apply-ui-polish-followup-patch.mjs',
  'scripts/apply-score-continuity-fix.mjs',
  'scripts/apply-qa4-deterministic-lab-patch.mjs',
  'scripts/apply-qa4-mobile-input-fix.mjs',
  'scripts/apply-qa4-run-lock-fix.mjs',
  'scripts/apply-qa4-pause-forensics.mjs',
  'scripts/apply-pause-overlay-hit-test-fix.mjs',
  'scripts/apply-pause-overlay-hard-hide.mjs',
  'scripts/apply-qa4-popup-assertion-fix.mjs',
  'scripts/apply-qa4-rampage-popup-fix.mjs',
  'scripts/apply-v500-campaign-patch.mjs',
  'scripts/apply-v500-realtime-clock-fix.mjs',
  'scripts/apply-v500-world-tour-patch.mjs',
  'scripts/apply-v500-mobile-layout-fix.mjs',
  'scripts/apply-v500-cow-signature-patch.mjs',
  'scripts/apply-v510-production-slice.mjs',
  'scripts/apply-modernization-phase2-clocks.mjs',
  'scripts/apply-phase2-player-forensics-guard.mjs',
  'scripts/apply-modernization-phase3-input-abilities.mjs',
  'scripts/apply-modernization-phase4-scoring-campaign.mjs',
  'scripts/apply-modernization-phase5-presentation-world.mjs',
  'scripts/apply-modernization-phase6-performance.mjs',
  'scripts/apply-city-fabric-destruction.mjs',
];

const tempPath = path.join(projectRoot, 'node_modules', '.city-fabric-verify.html');
await writeFile(tempPath, committedSource, 'utf8');
let generated = '';
try {
  for (const scriptPath of patchScripts) {
    execFileSync(process.execPath, [scriptPath], {
      cwd: projectRoot,
      env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: tempPath },
      stdio: 'pipe',
      maxBuffer: 32 * 1024 * 1024,
    });
  }
  generated = await readFile(tempPath, 'utf8');
} finally {
  await rm(tempPath, { force: true });
}

for (const marker of [
  'CITY_FABRIC_DESTRUCTION_V1',
  '[SW:WORLD:CITY_FABRIC_PASS]',
  '[SW:SOURCE:city-fabric-destruction.js]',
  '__SW_CITY_FABRIC_BRIDGE__',
  'buildCityFabricCounty',
  'cityFabricCreateTreeMesh',
  'RURAL COUNTY SEAT',
  'RAIL JUNCTION TOWN',
  'INDUSTRIAL AGRO CITY',
  'STATE FAIR CITY',
]) check(`generated HTML includes ${marker}`, generated.includes(marker));

check('city fabric source is inserted exactly once', generated.split('[SW:SOURCE:city-fabric-destruction.js]').length === 2);
check('city fabric source installs before first world initialization', generated.indexOf('[SW:SOURCE:city-fabric-destruction.js]') < generated.indexOf('// --- MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION ---'));
check('runtime defines four distinct zone maps', (runtime.match(/zoneRows:/g) || []).length === 4);
check('runtime defines at least twelve destructible archetypes', Object.keys(cityFabricStatsForVerify(runtime)).length >= 12);
check('runtime tree generator exposes five species', runtime.includes('const species = variant % 5'));
check('runtime preserves accepted roads and replaces only block fabric', runtime.includes('const cityFabricOriginalBuildLivingCounty = buildLivingCounty') && !runtime.includes('createTerrainRoad('));
check('runtime publishes density and diversity telemetry', ['targetCount', 'averageTargetsPerActiveBlock', 'uniqueArchetypes', 'treeSpecies'].every((value) => runtime.includes(value)));
check('package exposes city fabric commands', packageJson.scripts['patch:city-fabric'] && packageJson.scripts['verify:city-fabric'] && packageJson.scripts['qa:city-fabric']);
check('QA traverses all four campaign stops', qa.includes('for (let index = 0; index < 4; index += 1)'));
check('QA starts the playable world before taking screenshots', qa.includes("page.click('#btnStartMenu')") && qa.includes('mainMenuHidden'));
check('QA rejects menu-obstructed screenshot evidence', qa.includes('screenshotsRequirePlayableWorld: true') && qa.includes('evidence screenshot is obstructed by the main menu'));
check('workflow is single-trigger', !/^\s{2}push:/m.test(workflow));
check('workflow targets Phase 6 branch only', workflow.includes('- agent/phase6-android-performance-antigravity'));
check('workflow builds Phase 6 baseline and city candidate', workflow.includes('city-base') && workflow.includes('patch:city-fabric'));
check('workflow packages Android APK and city evidence', workflow.includes('assembleDebug') && workflow.includes('city-fabric-report.json'));
check('historical source remains clean', !committedSource.includes('CITY_FABRIC_DESTRUCTION_V1'));
check('apply script requires Phase 6 baseline', apply.includes('MODERNIZATION_PHASE6_PERFORMANCE_V2'));

function cityFabricStatsForVerify(source) {
  const match = source.match(/const CITY_FABRIC_STATS = Object\.freeze\(\{([\s\S]*?)\n\}\);/);
  if (!match) return {};
  return Object.fromEntries([...match[1].matchAll(/^\s{2}([\w-]+):/gm)].map((entry) => [entry[1], true]));
}

const failed = checks.filter((entry) => !entry.passed);
console.log(`\nCity fabric destruction verification: ${checks.length - failed.length}/${checks.length} checks passed.`);
if (failed.length) process.exit(1);
