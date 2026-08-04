import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

const requiredFiles = [
  'Docs/PHASE5_PRESENTATION_SOURCE_MAP.md',
  'Docs/PHASE5_VISUAL_BASELINE.md',
  'src/presentation/renderer/renderer-contracts.ts',
  'src/presentation/renderer/renderer-system.ts',
  'src/presentation/scene/scene-contracts.ts',
  'src/presentation/scene/scene-system.ts',
  'src/presentation/camera/camera-contracts.ts',
  'src/presentation/camera/camera-system.ts',
  'src/presentation/atmosphere/atmosphere-contracts.ts',
  'src/presentation/atmosphere/atmosphere-system.ts',
  'src/presentation/tornado/tornado-presentation-contracts.ts',
  'src/presentation/tornado/tornado-presentation-system.ts',
  'src/world/world-contracts.ts',
  'src/world/world-system.ts',
  'src/world/setpieces/destructible-setpiece-contracts.ts',
  'src/world/setpieces/destructible-setpiece-system.ts',
  'src/world/setpieces/hart-farm-definition.ts',
  'src/world/setpieces/second-structure-definition.ts',
  'runtime/modernization-phase5-presentation-world.js',
  'scripts/apply-modernization-phase5-presentation-world.mjs',
  'scripts/qa-modernization-phase5-presentation-world.mjs',
  'scripts/compare-phase5-visual-baseline.mjs',
];

for (const file of requiredFiles) {
  try {
    await access(path.join(projectRoot, file));
    check(`file ${file}`, true);
  } catch (error) {
    check(`file ${file}`, false, error.message);
  }
}

const read = async (...segments) => readFile(path.join(projectRoot, ...segments), 'utf8');
const html = await readFile(sourcePath, 'utf8');
const bridge = await read('runtime', 'modernization-phase5-presentation-world.js');
const apply = await read('scripts', 'apply-modernization-phase5-presentation-world.mjs');
const renderer = await read('src', 'presentation', 'renderer', 'renderer-system.ts');
const scene = await read('src', 'presentation', 'scene', 'scene-system.ts');
const camera = await read('src', 'presentation', 'camera', 'camera-system.ts');
const atmosphere = await read('src', 'presentation', 'atmosphere', 'atmosphere-system.ts');
const tornado = await read('src', 'presentation', 'tornado', 'tornado-presentation-system.ts');
const world = await read('src', 'world', 'world-system.ts');
const setpieceSystem = await read('src', 'world', 'setpieces', 'destructible-setpiece-system.ts');
const hartFarm = await read('src', 'world', 'setpieces', 'hart-farm-definition.ts');
const secondStructure = await read('src', 'world', 'setpieces', 'second-structure-definition.ts');
const adapter = await read('src', 'legacy', 'legacy-runtime-adapter.ts');
const app = await read('src', 'app', 'game-app.ts');
const packageJson = JSON.parse(await read('package.json'));

for (const marker of [
  'MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2',
  '[SW:ARCH:PHASE5_PRESENTATION_WORLD_BRIDGE]',
  '[SW:SOURCE:modernization-phase5-presentation-world.js]',
  'phase5ReadLegacySnapshot',
  'syncFromLegacy()',
  'runContractProbe()',
]) {
  check(`HTML marker ${marker}`, html.includes(marker));
}
check('obsolete Phase 5 V1 marker absent', !html.includes('MODERNIZATION_PHASE5_PRESENTATION_WORLD_V1'));
check('Phase 5 bridge inserted exactly once', html.split('[SW:SOURCE:modernization-phase5-presentation-world.js]').length === 2);

for (const prohibited of [
  'new THREE.WebGLRenderer',
  'new THREE.Scene',
  'new THREE.PerspectiveCamera',
  'requestAnimationFrame(',
]) {
  check(`bridge does not create ${prohibited}`, !bridge.includes(prohibited));
  check(`apply script rejects ${prohibited}`, apply.includes(prohibited));
}

for (const liveSymbol of [
  'renderer.getSize',
  'renderer.info.memory.geometries',
  'renderer.info.render.calls',
  'scene.traverse',
  'camera.getWorldDirection',
  'ambientLight.intensity',
  'skyLight.intensity',
  'dirLight.intensity',
  'productionTornadoRoot',
  'productionVaporRibbons',
  'productionSuctionRings',
  'productionDebrisMeta',
  'productionDressingStats',
  'productionBarn.health',
  'productionBarn.stage',
  'landmarks[0]',
  'animals.find((animal) => animal.id === 17)',
]) {
  check(`bridge reads live ${liveSymbol}`, bridge.includes(liveSymbol));
}

for (const [label, source] of [
  ['renderer', renderer],
  ['scene', scene],
  ['camera', camera],
  ['atmosphere', atmosphere],
  ['tornado', tornado],
  ['world', world],
  ['setpiece', setpieceSystem],
]) {
  check(`${label} is passive synchronized mirror`, source.includes('synchronize(snapshot'));
  check(`${label} rejects unsynchronized reads`, source.includes('has not synchronized'));
}
check('setpiece system has no damage executor', !setpieceSystem.includes('applyDamage('));
check('renderer system has no invented viewport writer', !renderer.includes('updateViewport('));
check('camera system has no invented shake writer', !camera.includes('addShake('));
check('atmosphere system has no invented storm progression', !atmosphere.includes('setStormProgress('));
check('world system has no minimum-clamping writer', !world.includes('updateCounts('));

const exactHartTokens = [
  "legacyStage: 0",
  "legacyStage: 1",
  "legacyStage: 2",
  "legacyStage: 3",
  "legacyStage: 4",
  "remainingHealthAtOrBelow: 0.78",
  "remainingHealthAtOrBelow: 0.52",
  "remainingHealthAtOrBelow: 0.25",
  "scorePoints: 140",
  "scorePoints: 210",
  "scorePoints: 280",
  "scorePoints: 720",
  "audioEventName: 'collapse'",
];
for (const token of exactHartTokens) check(`Hart Farm exact ${token}`, hartFarm.includes(token));
for (const invented of [
  'damageThresholdRatio',
  'scorePoints: 100',
  'scorePoints: 250',
  'scorePoints: 400',
  'scorePoints: 750',
  'wood_creak',
  'roof_peel_flight_plan',
  'timber_crack',
]) check(`Hart Farm invented rule absent ${invented}`, !hartFarm.includes(invented));

check('second structure uses generic live landmark ID', secondStructure.includes("id: 'primary-campaign-landmark'"));
check('second structure has intact state', secondStructure.includes("stageId: 'intact'"));
check('second structure has destroyed state', secondStructure.includes("stageId: 'destroyed'"));
check('second structure preserves 500 point landmark award', secondStructure.includes('scorePoints: 500'));
check('invented Lincoln silo ID absent', !secondStructure.includes('lincoln-grain-silo'));
check('invented silo cap-pop absent', !secondStructure.includes('cap_pop'));
check('invented silo five-stage wording absent', !secondStructure.includes('Structural Wall Fracture'));

check('legacy adapter requires Phase 5 V2', adapter.includes('MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2'));
check('legacy adapter synchronizes after scenario setup', adapter.includes('__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__?.syncFromLegacy()'));
check('legacy adapter exposes Phase 5 contract probe', adapter.includes('runPresentationWorldContractProbe()'));
check('application attaches Phase 5 mirrors', app.includes('attachPresentationWorld('));

check('package exposes patch:phase5', packageJson.scripts?.['patch:phase5'] === 'node scripts/apply-modernization-phase5-presentation-world.mjs');
check('package exposes verify:phase5', packageJson.scripts?.['verify:phase5'] === 'node scripts/verify-modernization-phase5-presentation-world.mjs');
check('package exposes qa:phase5', packageJson.scripts?.['qa:phase5'] === 'node scripts/qa-modernization-phase5-presentation-world.mjs');
check('package exposes Phase 5 visual comparison', packageJson.scripts?.['qa:phase5:visual'] === 'node scripts/compare-phase5-visual-baseline.mjs');

const failures = checks.filter((item) => !item.passed);
console.log(`\nPhase 5 live presentation/world verification: ${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length > 0) {
  console.error(`Failed checks: ${failures.map((item) => item.name).join(', ')}`);
  process.exitCode = 1;
}
