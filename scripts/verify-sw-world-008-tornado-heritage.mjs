import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-world-008-tornado-heritage.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-world-008-tornado-heritage.mjs'), 'utf8');

const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });

check('marker', runtime.includes('SW_WORLD_008_TORNADO_HERITAGE_V1'));
check('visual-target-recorded', runtime.includes("SW_WORLD_008_VISUAL_TARGET = 'tornado-visual-dev-reference-v1'"));
check('core-dense-but-atmospheric', runtime.includes("funnelMat.color?.set?.('#18252c')") && runtime.includes('funnelMat.roughness = 0.86') && runtime.includes('funnelMat, 0.72') && runtime.includes('funnelMat.depthWrite = true'));
check('core-radial-breakup', runtime.includes('swWorld008BreakUpCore') && runtime.includes('angularBreakup') && runtime.includes('verticalPulse') && runtime.includes('computeVertexNormals'));
check('outer-cylinder-suppressed', runtime.includes('outerFunnelMesh.visible = false'));
check('faceted-canopy-suppressed', runtime.includes('mesoCloudGroup.visible = false'));
check('faceted-dust-suppressed', runtime.includes('dustBowlGroup.visible = false'));
check('historical-debris-preserved', runtime.includes('particleSystem.visible = true') && runtime.includes('particleMat.vertexColors = true') && runtime.includes('particleMat, 0.68'));
check('soft-mist-texture', runtime.includes('new THREE.CanvasTexture') && runtime.includes('createRadialGradient'));
check('bounded-point-fields', runtime.includes('SWWorld008MistFine') && runtime.includes('SWWorld008MistBroad') && runtime.includes('SWWorld008CanopyMist') && runtime.includes('SWWorld008GroundDust'));
check('points-not-second-gameplay-solver', runtime.includes('new THREE.PointsMaterial') && runtime.includes('new THREE.Points') && !runtime.includes('requestAnimationFrame('));
check('soft-funnel-motion', runtime.includes('swWorld008UpdateFunnelMist') && runtime.includes('swWorld008Centerline'));
check('soft-canopy-motion', runtime.includes('swWorld008UpdateCanopy'));
check('soft-ground-contact', runtime.includes('swWorld008UpdateGroundDust'));
check('neon-cosmetic-preserved', runtime.includes("neon ? '#69dbea'") && runtime.includes("neon ? '#9cebf2'"));
check('slice6-geometry-fully-suppressed', runtime.includes("SWVisualSlice6CondensationStreak") && runtime.includes("SWVisualSlice6EdgeWisp") && runtime.includes("SWVisualSlice6GroundPull") && runtime.includes('object.visible = false'));
check('secondary-exclusivity-preserved', runtime.includes('swWorld008SuppressForSecondary') && runtime.includes("activeStorm === 'tornado'") && runtime.includes('swWorld008AtmosphereRoot.visible = false'));
check('final-visual-bridge-wrapper', runtime.includes('swWorld008VisualBridgeBase') && runtime.includes('update: swWorld008VisualUpdate'));
check('presentation-state-export', runtime.includes('getSwWorld008TornadoHeritageState') && runtime.includes('presentationOnly: true'));
check('atmosphere-telemetry', runtime.includes('drawFields:') && runtime.includes('finePoints:') && runtime.includes('dustPoints:'));
check('apply-requires-world007', apply.includes('SW_WORLD_007_SECONDARY_EXCLUSIVE_V1'));
check('apply-requires-feel', apply.includes('SW_FEEL_001_STRUCTURAL_PRIORITY_V1'));
check('apply-requires-ui005', apply.includes('SW_UI_005_FIELD_CONTROLS_V1'));

const mutationOperator = String.raw`(?:\+\+|--|\+=|-=|\*=|\/=|%=|=(?!=))`;
const protectedMutationPattern = new RegExp(
  String.raw`\b(?:score|combo|remainingSeconds|currentStage|funnelScale)\s*${mutationOperator}|\bstorm\.(?:speed|radius|pos)\s*${mutationOperator}|\btarget\.(?:health|maxHealth|points|damageStage|destroyed|x|z)\s*${mutationOperator}`,
  'g',
);
const protectedMutations = [...runtime.matchAll(protectedMutationPattern)].map((match) => match[0]);
check('no-protected-gameplay-mutations', protectedMutations.length === 0, protectedMutations.join(', '));
check('no-gameplay-camera-write', !/\bcamera\.(?:position|rotation)|\bcamera\.lookAt\s*\(/.test(runtime));
check('no-ability-write', !/\b(?:triggerAbility|usePull|useGust|useZap)\s*=/.test(runtime));

const expectedPointBudgets = [
  "mobile ? 120 : 170",
  "mobile ? 70 : 100",
  "mobile ? 85 : 125",
  "mobile ? 65 : 95",
];
const oversizedPointBudgets = [...runtime.matchAll(/mobile\s*\?\s*(\d+)\s*:\s*(\d+)/g)]
  .map((match) => ({ mobile: Number(match[1]), desktop: Number(match[2]), source: match[0] }))
  .filter((entry) => entry.mobile > 200 || entry.desktop > 220);
check(
  'bounded-atmosphere-fields',
  expectedPointBudgets.every((snippet) => runtime.includes(snippet)) && oversizedPointBudgets.length === 0,
  oversizedPointBudgets.map((entry) => entry.source).join(', '),
);

const report = {
  version: 'SW_WORLD_008_STATIC_V5',
  passed: checks.every((entry) => entry.pass),
  checks,
  failedChecks: checks.filter((entry) => !entry.pass),
  evidence: {
    protectedMutations,
    expectedPointBudgets,
    oversizedPointBudgets,
    historicalReference: [
      '667888bb3e15d912c71873951e58d456597219e9',
      '326e60895c2f861e02532021b32fd63181cd8fb3'
    ],
    visualTarget: 'tornado-visual-dev-reference-v1',
    base: 'de2e62835e79567b4bbfc079a372ce2af4ee0879',
  },
};

await writeFile(path.join(root, 'sw-world-008-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(`WORLD-008 static verification passed ${checks.length}/${checks.length}.`);
