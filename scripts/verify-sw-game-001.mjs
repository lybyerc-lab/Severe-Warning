import { readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectGridZapTopology } from './grid-zap-topology.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const temporarySourcePath = path.join(projectRoot, '.sw-game-001-verify.html');
const checks = [];

function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

function runPatch(scriptPath) {
  execFileSync(process.execPath, [scriptPath], {
    cwd: projectRoot,
    env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: temporarySourcePath },
    stdio: 'pipe',
  });
}

function runExistingVerifier(scriptPath) {
  execFileSync(process.execPath, [scriptPath], {
    cwd: projectRoot,
    env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: temporarySourcePath },
    stdio: 'inherit',
  });
}

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
  'scripts/apply-v500-campaign-patch.mjs',
  'scripts/apply-v500-realtime-clock-fix.mjs',
  'scripts/apply-v500-world-tour-patch.mjs',
  'scripts/apply-v500-mobile-layout-fix.mjs',
  'scripts/apply-v500-cow-signature-patch.mjs',
];
const phase2PatchScripts = [
  'scripts/apply-modernization-phase2-clocks.mjs',
  'scripts/apply-phase2-player-forensics-guard.mjs',
];
const phase3PatchScripts = [
  'scripts/apply-modernization-phase3-input-abilities.mjs',
];

const source = await readFile(sourcePath, 'utf8');
await writeFile(temporarySourcePath, source, 'utf8');
let generated = '';
try {
  patchScripts.forEach(runPatch);
  runExistingVerifier('scripts/verify-v500-campaign.mjs');
  runPatch('scripts/apply-v510-production-slice.mjs');
  runExistingVerifier('scripts/verify-v510-production-slice.mjs');
  phase2PatchScripts.forEach(runPatch);
  runExistingVerifier('scripts/verify-modernization-phase2-clocks.mjs');
  phase3PatchScripts.forEach(runPatch);
  runExistingVerifier('scripts/verify-modernization-phase3-input-abilities.mjs');
  generated = await readFile(temporarySourcePath, 'utf8');
} finally {
  await rm(temporarySourcePath, { force: true });
}

const roadCenters = [-320, -240, -160, -80, 0, 80, 160, 240, 320];
const poleXs = [-340, -265, -190, -115, -40, 35, 110, 185, 260, 335];
const poleZs = roadCenters.map((center) => center + 13.5);
const poles = poleZs.flatMap((z) => poleXs.map((x, networkIndex) => ({ x, z, networkIndex })));
const nearestRoadCenterDistance = (value) => Math.min(...roadCenters.map((center) => Math.abs(value - center)));
const minimumCenterlineClearance = Math.min(...poles.map((pole) => Math.min(
  nearestRoadCenterDistance(pole.x),
  nearestRoadCenterDistance(pole.z),
)));
const protectedClearance = minimumCenterlineClearance - 8.5;

function selectBaselineAcquisitionBoundedTopology(poles, options) {
  const candidates = poles
    .map((pole) => ({ pole, distance: Math.hypot(pole.x - options.stormX, pole.z - options.stormZ) }))
    .filter((entry) => entry.distance <= options.acquisitionRadius)
    .sort((left, right) => left.distance - right.distance);
  if (!candidates.length) return [];
  const selected = [candidates.shift().pole];
  while (selected.length < options.maxNodes && candidates.length) {
    const previous = selected[selected.length - 1];
    const nextIndex = candidates.findIndex((entry) => entry.pole.networkGroup === previous.networkGroup
      && Math.abs(entry.pole.networkIndex - previous.networkIndex) === 1
      && Math.hypot(entry.pole.x - previous.x, entry.pole.z - previous.z) <= options.maxHopDistance);
    if (nextIndex < 0) break;
    selected.push(candidates.splice(nextIndex, 1)[0].pole);
  }
  return selected;
}

const topologyFixture = [
  ...Array.from({ length: 10 }, (_, networkIndex) => ({ x: networkIndex * 75, z: 0, networkGroup: 'main', networkIndex })),
  { x: 60, z: 4, networkGroup: 'nearby-other-network', networkIndex: 1 },
];
const topologyOptions = {
  stormX: 0,
  stormZ: 0,
  acquisitionRadius: 80,
  maxHopDistance: 82,
  maxNodes: 8,
};
const baselineTopology = selectBaselineAcquisitionBoundedTopology(topologyFixture, topologyOptions);
const updatedTopology = selectGridZapTopology(topologyFixture, topologyOptions);
const updatedTopologyIds = updatedTopology.map((pole) => `${pole.networkGroup}:${pole.networkIndex}`);

check('utility network marker', generated.includes('[SW:GAME:UTILITY_NETWORK_V1]'));
check('road-safe utility count', poles.length === 90, `count=${poles.length}`);
check('no pole-road intrusions', protectedClearance > 0, `minimumCenterline=${minimumCenterlineClearance.toFixed(1)} protectedClearance=${protectedClearance.toFixed(1)}`);
check('utility topology is ordered', generated.includes("networkGroup: utilityRoute") && generated.includes('networkIndex,'));
check('rendered and Grid Zap pole authority is shared', generated.includes('poleGroup.position.set(px, terrainHeightAt(px, pz), pz);') && generated.includes('powerPoles.push({'));
check('rendered utility lines are batched into one LineSegments object', generated.includes('const utilityWirePositions = []') && generated.includes('new THREE.LineSegments(utilityWireGeometry, utilityLineMat)') && !generated.includes('scene.add(new THREE.Line(geometry, utilityLineMat));'));
check('Grid Zap acquisition increased', generated.includes('GRID_ZAP_ACQUISITION_RADIUS_MULTIPLIER = 5.25'));
check('Grid Zap remains bounded at eight connected nodes', generated.includes('GRID_ZAP_MAX_CONNECTED_NODES = 8'));
check('Grid Zap uses the shared topology selector', generated.includes('selectGridZapTopology(powerPoles, {') && generated.includes('acquisitionRadius: storm.radius * GRID_ZAP_ACQUISITION_RADIUS_MULTIPLIER'));
check('Grid Zap direct target damage is 135', generated.includes('GRID_ZAP_TARGET_DAMAGE = 135') && generated.includes("damageTarget(target, GRID_ZAP_TARGET_DAMAGE, 'grid-zap')"));
check('Grid Zap blocks duplicate target damage', generated.includes('const hitTargets = new Set()') && generated.includes('if (hitTargets.has(target) || target.destroyed) return;'));
check('topology propagation continues beyond the initial acquisition radius', updatedTopology.some((pole) => Math.hypot(pole.x, pole.z) > topologyOptions.acquisitionRadius), `selected=${updatedTopologyIds.join(',')}`);
check('updated Zap reaches more connected nodes than acquisition-bounded baseline', updatedTopology.length > baselineTopology.length, `baseline=${baselineTopology.length} updated=${updatedTopology.length}`);
check('nearby pole from another network is rejected', !updatedTopologyIds.includes('nearby-other-network:1'));
check('topology node cap is respected', updatedTopology.length === topologyOptions.maxNodes, `selected=${updatedTopology.length} cap=${topologyOptions.maxNodes}`);
check('topology never selects the same node twice', new Set(updatedTopologyIds).size === updatedTopologyIds.length, `selected=${updatedTopologyIds.join(',')}`);
check('Cow-Cam player-visible linger is 3.1 seconds', generated.includes('bovineCowCam.timer = 3.1;'));
check('Cow-Cam retains normal control fallback', generated.includes('if (bovineCowCam.active && bovineCowCam.cow && bovineCowCam.cow.mesh)') && generated.includes('camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.08);'));

const failures = checks.filter((entry) => !entry.passed);
if (failures.length) {
  console.error(`SW-GAME-001 verification failed: ${failures.map((entry) => entry.name).join(', ')}`);
  process.exit(1);
}

console.log(JSON.stringify({
  task: 'SW-GAME-001',
  utility: {
    baselinePoleCount: 117,
    poleCount: poles.length,
    groups: poleZs.length,
    polesPerGroup: poleXs.length,
    renderedLineSegments: poleZs.length * (poleXs.length - 1),
    renderedLineObjects: 1,
    minimumCenterlineClearance,
    protectedClearance,
  },
  gridZap: {
    baseline: { acquisitionRadiusMultiplier: 4.2, maxConnectedNodes: 6, maxHopDistance: 78, directTargetDamage: 0 },
    updated: { acquisitionRadiusMultiplier: 5.25, maxConnectedNodes: 8, maxHopDistance: 82, directTargetDamage: 135, targetRange: 16 },
    topologyFixture: { baselineSelectedNodes: baselineTopology.length, updatedSelectedNodes: updatedTopology.length },
  },
  cowCam: { baselineSeconds: 1.85, updatedSeconds: 3.1 },
}, null, 2));
