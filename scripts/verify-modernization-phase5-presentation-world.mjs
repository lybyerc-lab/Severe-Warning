import { access, readFile, writeFile, rm } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { joinRegions, readInlinedRegions } from './lib/inlined-regions.mjs';

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
// Read from the gameplay source itself; see scripts/lib/inlined-regions.mjs.
const bridge = joinRegions(await readInlinedRegions(sourcePath), ['modernization-phase5-presentation-world.js']);
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

let generatedHtml = html;
if (!generatedHtml.includes('MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2')) {
  const patchScriptPaths = [
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
    'scripts/apply-phase2-player-forensics-guard.mjs',
  ];
  const tempPath = path.join(projectRoot, 'node_modules', '.phase5-temp-verify.html');
  await writeFile(tempPath, html, 'utf8');
  try {
    for (const scriptPath of patchScriptPaths) {
      execSync(`"${process.execPath}" ${scriptPath}`, {
        cwd: projectRoot,
        env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: tempPath },
        stdio: 'pipe',
      });
    }
    generatedHtml = await readFile(tempPath, 'utf8');
  } finally {
    await rm(tempPath, { force: true });
  }
}

for (const marker of [
  'MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2',
  '[SW:ARCH:PHASE5_PRESENTATION_WORLD_BRIDGE]',
  '[SW:SOURCE:modernization-phase5-presentation-world.js]',
  'phase5ReadLegacySnapshot',
  'syncFromLegacy()',
  'runContractProbe()',
]) {
  check(`generated HTML marker ${marker}`, generatedHtml.includes(marker));
}
check('obsolete Phase 5 V1 marker absent', !generatedHtml.includes('MODERNIZATION_PHASE5_PRESENTATION_WORLD_V1'));
check('Phase 5 bridge inserted exactly once', generatedHtml.split('[SW:SOURCE:modernization-phase5-presentation-world.js]').length === 2);

const normGeneratedHtml = generatedHtml.replaceAll('\r\n', '\n');
// The camera block has to stay guarded by BOTH the QA park flag and the Phase 5
// presentation latch. This used to pin one frozen expression, which broke the
// moment the QA flag was fixed to read its lexical binding rather than a
// globalThis property it never had. Assert the two conditions and the single
// guard instead, so a refactor of the same intent does not read as a regression.
const cameraGuardMarker = 'if (!qaCameraParked && !presentationLatched) {';
const unguardedCameraAnchor = [
  '  if (bovineCowCam.active && bovineCowCam.cow && bovineCowCam.cow.mesh) {',
  '    const cow = bovineCowCam.cow;',
  '    const cinematicX = cow.x + 23;',
  '    const cinematicY = cow.groundY + cow.altitude + 17;',
  '    const cinematicZ = cow.z + 27;',
  '    camera.position.x = THREE.MathUtils.lerp(camera.position.x, cinematicX, 0.11);',
  '    camera.position.y = THREE.MathUtils.lerp(camera.position.y, cinematicY, 0.11);',
  '    camera.position.z = THREE.MathUtils.lerp(camera.position.z, cinematicZ, 0.11);',
  '    camera.lookAt(cow.x, cow.groundY + cow.altitude, cow.z);',
  '  } else {',
  '    camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.08);',
  '    camera.position.y = THREE.MathUtils.lerp(camera.position.y, storm.pos.y + currentCamY, 0.08);',
  '    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.08);',
  '    camera.lookAt(storm.pos.x + (moveX * 8), storm.pos.y + 1.5, storm.pos.z + (moveZ * 8));',
  '  }',
].join('\n');

check('generated output contains camera latch guard exactly once', normGeneratedHtml.split(cameraGuardMarker).length === 2);
check(
  'camera latch guard still consults the Phase 5 presentation latch',
  normGeneratedHtml.includes("const presentationLatched = typeof globalThis.isPhase5PresentationLatched === 'function'"),
);
check('unguarded camera block is absent from generated output', !normGeneratedHtml.includes(unguardedCameraAnchor));

// The frozen-base check that used to live here asserted the committed gameplay
// source stayed byte-identical to cd89b5e, the "accepted Phase 4 source". That
// belonged to the patch-chain era, when this file was a frozen base that build
// scripts rewrote on every build. The chain has been flattened: the gameplay
// source IS the game and is edited directly, so a check demanding it never
// change would block all future work. The markers verified above are what
// actually guard the Phase 5 bridge now.

for (const prohibited of [
  'new THREE.WebGLRenderer',
  'new THREE.Scene',
  'new THREE.PerspectiveCamera',
  'requestAnimationFrame(',
]) {
  check(`bridge does not create ${prohibited}`, !bridge.includes(prohibited));
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

check('package exposes verify:phase5', packageJson.scripts?.['verify:phase5'] === 'node scripts/verify-modernization-phase5-presentation-world.mjs');
check('package exposes qa:phase5', packageJson.scripts?.['qa:phase5'] === 'node scripts/qa-modernization-phase5-presentation-world.mjs');
check('package exposes Phase 5 visual comparison', packageJson.scripts?.['qa:phase5:visual'] === 'node scripts/compare-phase5-visual-baseline.mjs');

const failures = checks.filter((item) => !item.passed);
console.log(`\nPhase 5 live presentation/world verification: ${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length > 0) {
  console.error(`Failed checks: ${failures.map((item) => item.name).join(', ')}`);
  process.exitCode = 1;
}
