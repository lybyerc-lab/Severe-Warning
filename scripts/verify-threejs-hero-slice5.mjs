import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const files = {
  runtime: await readFile(path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice5.js'), 'utf8'),
  guard: await readFile(path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice5-animation-guard.js'), 'utf8'),
  patch: await readFile(path.join(projectRoot, 'scripts', 'apply-threejs-hero-slice5.mjs'), 'utf8'),
  qa: await readFile(path.join(projectRoot, 'scripts', 'qa-threejs-hero-slice5.mjs'), 'utf8'),
  milestone: await readFile(path.join(projectRoot, 'Docs', 'HERO_SLICE5_RAINBOW_COW_EASTER_EGG.md'), 'utf8'),
  workflow: await readFile(path.join(projectRoot, '.github', 'workflows', 'threejs-hero-slice5.yml'), 'utf8'),
};
const runtimeText = `${files.runtime}\n${files.guard}`;

const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
}

let runtimeSyntaxError = null;
let guardSyntaxError = null;
try { new vm.Script(files.runtime, { filename: 'threejs-visual-hero-slice5.js' }); } catch (error) { runtimeSyntaxError = String(error?.message || error); }
try { new vm.Script(files.guard, { filename: 'threejs-visual-hero-slice5-animation-guard.js' }); } catch (error) { guardSyntaxError = String(error?.message || error); }

check('slice5-version', files.runtime.includes('THREEJS_VISUAL_HERO_SLICE5_V1'));
check('slice5-anchor', files.runtime.includes('[SW:VISUAL:HERO_SLICE5]'));
check('slice5-syntax', runtimeSyntaxError === null, runtimeSyntaxError || 'ok');
check('slice5-guard-syntax', guardSyntaxError === null, guardSyntaxError || 'ok');
check('slice5-animation-guard', files.guard.includes('[SW:VISUAL:HERO_SLICE5:ANIMATION_GUARD]') && files.guard.includes('swVisualHeroSlice5UpdateCowLevelGuarded'));
check('slice5-guard-bovine-filter', files.guard.includes("/^SWVisualSlice5Cow(?:\\d+|Champion)$/"));
check('slice5-bridge', files.runtime.includes('__SW_THREEJS_VISUAL_FOUNDATION__') && files.runtime.includes('heroSlice5Version'));
check('slice4-prerequisite', files.patch.includes('THREEJS_VISUAL_HERO_SLICE4_V1') && files.patch.includes('[SW:SOURCE:threejs-visual-hero-slice4.js]'));
check('ordered-after-slice4', files.patch.includes('slice4Index > slice5Index') && files.patch.includes('slice5Index > guardIndex') && files.patch.includes('guardIndex > loopIndex'));
check('rainbow-root', files.runtime.includes('SWVisualHeroSlice5RainbowFunnel'));
check('rainbow-vertex-colors', files.runtime.includes("setAttribute('color'") && files.runtime.includes('vertexColors: true'));
check('rainbow-additive-shell', files.runtime.includes('THREE.AdditiveBlending') && files.runtime.includes('SWVisualSlice5RainbowShell'));
check('rainbow-spinning-ribbons', files.runtime.includes('SWVisualSlice5RainbowRibbon') && files.runtime.includes('object.rotation.y = seconds'));
check('rainbow-cycle', files.runtime.includes('material.color.setHSL') && files.runtime.includes('funnelMat.color.setHSL'));
check('legacy-funnel-dimmed', files.runtime.includes('funnelMat.opacity = 0.18') && files.runtime.includes('outerFunnelMat.opacity = 0.10'));
check('cow-level-root', files.runtime.includes('SWVisualHeroSlice5CowLevel'));
check('cow-level-sign', files.runtime.includes('MOO LEVEL') && files.runtime.includes('AUTHORIZED BOVINES ONLY'));
check('cow-level-ring', files.runtime.includes('SWVisualSlice5CowLevelRing'));
check('cow-level-champion', files.runtime.includes('SWVisualSlice5CowChampion'));
check('cow-level-presentation-only', files.runtime.includes('presentationOnly: true') && files.runtime.includes('swPresentationOnly'));
check('no-runtime-http-assets', !/https?:\/\//.test(runtimeText));
check('qa-rainbow-evidence', files.qa.includes('threejs-hero-slice5-rainbow-funnel.png'));
check('qa-cow-level-evidence', files.qa.includes('threejs-hero-slice5-cow-level.png'));
check('qa-checks-animal-isolation', files.qa.includes('gameplayOverlapCount') && files.qa.includes('gameplayAnimalCount'));
check('qa-requires-inherited-slice4', files.qa.includes("heroSlice4Version === 'THREEJS_VISUAL_HERO_SLICE4_V1'"));
check('workflow-stacked-base', files.workflow.includes('agent/threejs-hero-slice4-world-cohesion-storm-volume'));
check('workflow-exact-slice4-reference', files.workflow.includes('0c90db63b74523811f67379a6cc14896227073d5'));
check('workflow-runs-slice4-patch', files.workflow.includes('apply-threejs-hero-slice4.mjs'));
check('workflow-runs-slice5-patch', files.workflow.includes('apply-threejs-hero-slice5.mjs'));
check('workflow-runs-slice5-verify', files.workflow.includes('verify-threejs-hero-slice5.mjs'));
check('workflow-runs-slice5-qa', files.workflow.includes('qa-threejs-hero-slice5.mjs'));
check('workflow-keeps-inherited-slice4-qa', files.workflow.includes('qa-threejs-hero-slice4.mjs'));
check('workflow-keeps-performance-gate', files.workflow.includes('perf:phase6'));
check('workflow-packages-android', files.workflow.includes('assembleDebug'));
check('milestone-is-not-acceptance', files.milestone.includes('NOT ACCEPTED') && files.milestone.includes('owner visual review'));
check('milestone-cow-is-not-gameplay-level', files.milestone.includes('not a new campaign level') && files.milestone.includes('presentation-only'));

const protectedTargetAssignments = [...runtimeText.matchAll(/target\.(health|maxHealth|points|damageStage|destroyed|x|z|kind|materialFamily|hasGlass)\s*(?:\+\+|--|[+\-*/]?=(?!=))/g)].map((match) => match[0]);
const protectedGlobalAssignments = [...runtimeText.matchAll(/\b(score|combo|remainingSeconds|currentStage|selectedCampaignIndex)\s*(?:\+\+|--|[+\-*/]?=(?!=))/g)].map((match) => match[0]);
const protectedAbilityWrites = [...runtimeText.matchAll(/\b(triggerAbility|usePull|useGust|useZap|triggerPull|triggerGust|triggerZap)\s*=/g)].map((match) => match[0]);
const stormAuthorityWrites = [...runtimeText.matchAll(/\bstorm\.pos\.(?:set|copy|add|sub)\s*\(/g)].map((match) => match[0]);
const animalArrayWrites = [...runtimeText.matchAll(/\banimals\.(?:push|splice|pop|shift|unshift)\s*\(/g)].map((match) => match[0]);
const animalAuthorityWrites = [...runtimeText.matchAll(/\banimal\.(?:x|z|groundY|airborne|altitude|orbitAngle)\s*(?:\+\+|--|[+\-*/]?=(?!=))/g)].map((match) => match[0]);
const privateProductionBarnRefs = [...runtimeText.matchAll(/\bproductionBarn\b/g)].map((match) => match[0]);

check('no-gameplay-target-mutations', protectedTargetAssignments.length === 0, protectedTargetAssignments.join(', '));
check('no-score-clock-campaign-mutations', protectedGlobalAssignments.length === 0, protectedGlobalAssignments.join(', '));
check('no-ability-rewrites', protectedAbilityWrites.length === 0, protectedAbilityWrites.join(', '));
check('no-storm-position-writes', stormAuthorityWrites.length === 0, stormAuthorityWrites.join(', '));
check('no-animal-array-writes', animalArrayWrites.length === 0, animalArrayWrites.join(', '));
check('no-animal-authority-writes', animalAuthorityWrites.length === 0, animalAuthorityWrites.join(', '));
check('no-private-production-barn-access', privateProductionBarnRefs.length === 0, privateProductionBarnRefs.join(', '));
check('no-new-renderer', !runtimeText.includes('new THREE.WebGLRenderer'));
check('no-new-scene-authority', !runtimeText.includes('new THREE.Scene'));

const failedChecks = checks.filter((entry) => !entry.passed);
const report = {
  version: 'THREEJS_HERO_SLICE5_STATIC_V1',
  passed: failedChecks.length === 0,
  checks,
  failedChecks,
  evidence: {
    protectedTargetAssignments,
    protectedGlobalAssignments,
    protectedAbilityWrites,
    stormAuthorityWrites,
    animalArrayWrites,
    animalAuthorityWrites,
    privateProductionBarnRefs,
  },
};

await writeFile(path.join(projectRoot, 'threejs-hero-slice5-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(`Three.js Hero Slice 5 static verification passed ${checks.length}/${checks.length}; gameplay authority writes=0; animal authority writes=0.`);
