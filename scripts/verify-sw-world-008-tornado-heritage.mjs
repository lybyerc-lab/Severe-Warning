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
check('irregular-ring-budget', runtime.includes('SW_WORLD_008_RING_LEVELS = 27') && runtime.includes('SW_WORLD_008_RING_SEGMENTS = 40'));
check('irregular-buffer-geometry', runtime.includes('swWorld008CreateRingGeometry') && runtime.includes("geometry.setAttribute('position'") && runtime.includes('geometry.setIndex(indices)'));
check('nonlinear-width-profile', runtime.includes('swWorld008ProfileRadius') && runtime.includes('lowerBulge') && runtime.includes('midPinch') && runtime.includes('upperShoulder') && runtime.includes('verticalBreath'));
check('asymmetric-centerline', runtime.includes('swWorld008Centerline') && runtime.includes('middle * 2.25') && runtime.includes('middle * 1.95'));
check('ring-asymmetry', runtime.includes('const asymmetry = 1') && runtime.includes('angle * 3.0') && runtime.includes('angle * 5.0') && runtime.includes('yRipple'));
check('patchy-alpha-maps', runtime.includes('swWorld008CreateCondensationAlphaTexture') && runtime.includes('alphaMap: swWorld008CondensationAlpha') && runtime.includes('alphaMap: swWorld008SheathAlpha') && runtime.includes('alphaTest: 0.075'));
check('core-material-bounded', runtime.includes("color: '#34474e'") && runtime.includes('opacity: 0.78') && runtime.includes('roughness: 0.94') && runtime.includes('depthWrite: true'));
check('sheath-subordinate', runtime.includes("color: '#86969a'") && runtime.includes('opacity: 0.16') && runtime.includes('swWorld008CondensationSheath.scale.set(1.10, 1.015, 1.10)'));
check('legacy-visible-surfaces-suppressed', runtime.includes('funnelMesh.visible = false') && runtime.includes('outerFunnelMesh.visible = false') && runtime.includes('mesoCloudGroup.visible = false') && runtime.includes('dustBowlGroup.visible = false'));
check('historical-debris-demoted', runtime.includes('particleSystem.visible = true') && runtime.includes('particleMat.map = swWorld008DustMistTexture') && runtime.includes('particleMat, 0.30'));
check('soft-atmosphere-bounded', runtime.includes("mobile ? 90 : 130") && runtime.includes("mobile ? 42 : 62") && runtime.includes("mobile ? 46 : 68") && runtime.includes("mobile ? 56 : 82"));
check('soft-ground-contact', runtime.includes('swWorld008UpdateGroundDust'));
check('compact-parent-cloud', runtime.includes('swWorld008UpdateCanopy') && runtime.includes('4.5 + seed.a * 11.5'));
check('slice6-visible-geometry-suppressed', runtime.includes("SWVisualSlice6StormShell") && runtime.includes("SWVisualSlice6CondensationStreak") && runtime.includes("SWVisualSlice6EdgeWisp") && runtime.includes("SWVisualSlice6GroundPull") && runtime.includes('object.visible = false'));
check('secondary-exclusivity-preserved', runtime.includes('swWorld008SuppressForSecondary') && runtime.includes("activeStorm === 'tornado'") && runtime.includes('swWorld008PresentationRoot.visible = false'));
check('neon-remains-cosmetic', runtime.includes("neon ? '#256a75'") && runtime.includes("neon ? '#7ce2ee'"));
check('final-visual-bridge-wrapper', runtime.includes('swWorld008VisualBridgeBase') && runtime.includes('update: swWorld008VisualUpdate'));
check('presentation-state-export', runtime.includes('getSwWorld008TornadoHeritageState') && runtime.includes('presentationOnly: true') && runtime.includes('condensation: Object.freeze'));
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
check('no-second-animation-loop', !runtime.includes('requestAnimationFrame('));

const pointBudgets = [...runtime.matchAll(/mobile\s*\?\s*(\d+)\s*:\s*(\d+)/g)]
  .map((match) => ({ mobile: Number(match[1]), desktop: Number(match[2]), source: match[0] }));
const oversizedPointBudgets = pointBudgets.filter((entry) => entry.mobile > 150 || entry.desktop > 180);
check('no-oversized-atmosphere-fields', oversizedPointBudgets.length === 0, oversizedPointBudgets.map((entry) => entry.source).join(', '));

const report = {
  version: 'SW_WORLD_008_STATIC_V6',
  passed: checks.every((entry) => entry.pass),
  checks,
  failedChecks: checks.filter((entry) => !entry.pass),
  evidence: {
    protectedMutations,
    pointBudgets,
    oversizedPointBudgets,
    expectedCondensationVertices: 1080,
    expectedCondensationTriangles: 2080,
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
