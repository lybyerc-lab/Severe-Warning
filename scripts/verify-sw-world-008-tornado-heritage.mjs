import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-world-008-tornado-heritage.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-world-008-tornado-heritage.mjs'), 'utf8');

const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });

check('marker', runtime.includes('SW_WORLD_008_TORNADO_HERITAGE_V1'));
check('historical-core-authoritative', runtime.includes('funnelMesh.visible = true') && runtime.includes('funnelMat, 0.66') && runtime.includes('funnelMat.depthWrite = true'));
check('historical-sheath-restored', runtime.includes('outerFunnelMesh.visible = true') && runtime.includes('outerFunnelMat, 0.12'));
check('historical-debris-restored', runtime.includes('particleSystem.visible = true') && runtime.includes("particleMat.color?.set?.('#806e5b')"));
check('historical-dust-softened', runtime.includes('dustBowlGroup.visible = true') && runtime.includes('dustBowlGroup.scale.set(0.58, 0.36, 0.58)') && runtime.includes('dustMat, 0.12'));
check('canopy-subordinate', runtime.includes('mesoCloudGroup.scale.set(0.62, 0.45, 0.62)') && runtime.includes('mesoCloudMat, 0.25'));
check('ribbon-replacement-removed-from-silhouette', runtime.includes("SWVisualSlice6CondensationStreak") && runtime.includes('object.visible = false') && runtime.includes('object.material, 0.03'));
check('edge-wisps-subordinate', runtime.includes('object.material, 0.045') && runtime.includes('object.material, 0.06'));
check('secondary-exclusivity-preserved', runtime.includes('swWorld008SuppressForSecondary') && runtime.includes("activeStorm === 'tornado'"));
check('final-visual-bridge-wrapper', runtime.includes('swWorld008VisualBridgeBase') && runtime.includes('update: swWorld008VisualUpdate'));
check('presentation-state-export', runtime.includes('getSwWorld008TornadoHeritageState') && runtime.includes('presentationOnly: true'));
check('ribbon-visibility-telemetry', runtime.includes('visibleStreaks'));
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

const report = {
  version: 'SW_WORLD_008_STATIC_V2',
  passed: checks.every((entry) => entry.pass),
  checks,
  failedChecks: checks.filter((entry) => !entry.pass),
  evidence: {
    protectedMutations,
    historicalReference: [
      '667888bb3e15d912c71873951e58d456597219e9',
      '326e60895c2f861e02532021b32fd63181cd8fb3'
    ],
    base: 'de2e62835e79567b4bbfc079a372ce2af4ee0879',
  },
};

await writeFile(path.join(root, 'sw-world-008-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(`WORLD-008 static verification passed ${checks.length}/${checks.length}.`);
