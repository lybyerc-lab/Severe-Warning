import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const files = {
  runtime: await readFile(path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice4.js'), 'utf8'),
  patch: await readFile(path.join(projectRoot, 'scripts', 'apply-threejs-hero-slice4.mjs'), 'utf8'),
  vendor: await readFile(path.join(projectRoot, 'scripts', 'vendor-threejs-hero-slice4-assets.mjs'), 'utf8'),
  qa: await readFile(path.join(projectRoot, 'scripts', 'qa-threejs-hero-slice4.mjs'), 'utf8'),
  provenance: await readFile(path.join(projectRoot, 'assets', 'production', 'asset-provenance.json'), 'utf8'),
  milestone: await readFile(path.join(projectRoot, 'Docs', 'HERO_SLICE4_WORLD_COHESION_STORM_VOLUME.md'), 'utf8'),
  workflow: await readFile(path.join(projectRoot, '.github', 'workflows', 'threejs-hero-slice4.yml'), 'utf8'),
};

const provenance = JSON.parse(files.provenance);
const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
}

let syntaxError = null;
try { new vm.Script(files.runtime, { filename: 'threejs-visual-hero-slice4.js' }); } catch (error) { syntaxError = String(error?.message || error); }

check('slice4-version', files.runtime.includes('THREEJS_VISUAL_HERO_SLICE4_V1'));
check('slice4-anchor', files.runtime.includes('[SW:VISUAL:HERO_SLICE4]'));
check('slice4-syntax', syntaxError === null, syntaxError || 'ok');
check('slice4-bridge', files.runtime.includes('__SW_THREEJS_VISUAL_FOUNDATION__') && files.runtime.includes('heroSlice4Version'));
check('run5-prerequisite', files.patch.includes('THREEJS_VISUAL_HERO_SLICE3_V1') && files.patch.includes('[SW:SOURCE:threejs-visual-hero-slice3.js]'));
check('ordered-after-slice3', files.patch.includes('slice3Index > slice4Index') && files.patch.includes('slice4Index > loopIndex'));
check('world-cohesion-root', files.runtime.includes('SWVisualHeroSlice4WorldCohesion'));
check('facade-depth', files.runtime.includes('SWVisualSlice4FacadeKit') && files.runtime.includes('swVisualHeroSlice4BuildFacadeKits'));
check('ground-transition-language', files.runtime.includes('SWVisualSlice4StorefrontRoadShoulderBlend') && files.runtime.includes('SWVisualSlice4FarmTrackWestEdge'));
check('storm-volume-root', files.runtime.includes('SWVisualHeroSlice4StormVolume'));
check('storm-layer-counts', files.runtime.includes('SWVisualSlice4VolumeShell') && files.runtime.includes('SWVisualSlice4VolumeWisp') && files.runtime.includes('SWVisualSlice4GroundSkirt') && files.runtime.includes('SWVisualSlice4RainTrace'));
check('legacy-funnel-presentation-only-tune', files.runtime.includes('swVisualHeroSlice4TuneLegacyFunnel') && files.runtime.includes('funnelMat.opacity = 0.46') && files.runtime.includes('outerFunnelMat.opacity = 0.24'));
check('local-vfx-paths', [
  './assets/production/vfx/kenney/dirt_01.png',
  './assets/production/vfx/kenney/smoke_03.png',
  './assets/production/vfx/kenney/trace_03.png',
].every((value) => files.runtime.includes(value)));
check('no-runtime-http-assets', !/https?:\/\//.test(files.runtime));
check('vendor-upstream-pinned', files.vendor.includes('ab7086639ee73be31abd87feb21bf1402d4e8144') && files.vendor.includes('Calinou/kenney-particle-pack'));
check('vendor-dirt-pinned', files.vendor.includes('3bf82433236c8a0e5452563dccafd0ca4ec82a31'));
check('vendor-smoke-pinned', files.vendor.includes('34cad39231026b6617f25e03e99c0b860258d010'));
check('vendor-trace-pinned', files.vendor.includes('dcd8c6c39b522e207ee972bff30d064c60f20c07'));
check('vendor-git-blob-verification', files.vendor.includes("createHash('sha1')") && files.vendor.includes('upstream blob mismatch'));
check('vendor-local-sha256-evidence', files.vendor.includes('checksums.json') && files.vendor.includes("createHash('sha256')"));
check('qa-authoritative-damage-path', files.qa.includes('damageTarget(target') && !files.qa.includes('target.health ='));
check('qa-pristine-evidence', files.qa.includes('threejs-hero-slice4-pristine-street.png'));
check('qa-storm-evidence', files.qa.includes('threejs-hero-slice4-storm-volume.png'));
check('qa-damage-evidence', files.qa.includes('threejs-hero-slice4-damaged-storefront.png'));
check('qa-stage2-damage', files.qa.includes('damageStage === 2'));
check('workflow-stacked-base', files.workflow.includes('agent/threejs-visual-production-foundation'));
check('workflow-exact-run5-reference', files.workflow.includes('9515a3a5cc0ff04e1e4f95ff55b4a319aaa3602c'));
check('workflow-vendors-assets', files.workflow.includes('vendor-threejs-hero-slice4-assets.mjs'));
check('workflow-runs-slice4-patch', files.workflow.includes('apply-threejs-hero-slice4.mjs'));
check('workflow-runs-slice4-verify', files.workflow.includes('verify-threejs-hero-slice4.mjs'));
check('workflow-runs-slice4-qa', files.workflow.includes('qa-threejs-hero-slice4.mjs'));
check('workflow-keeps-performance-gate', files.workflow.includes('perf:phase6'));
check('workflow-packages-android', files.workflow.includes('assembleDebug'));
check('milestone-is-not-acceptance', files.milestone.includes('NOT ACCEPTED') && files.milestone.includes('owner visual review'));

const kenney = provenance.candidates?.find((entry) => entry.id === 'kenney.particle-pack') || null;
check('provenance-policy-remains-offline', provenance.policy?.runtimeNetworkAssetsAllowed === false);
check('kenney-remains-pinned-cc0', kenney?.upstreamCommit === 'ab7086639ee73be31abd87feb21bf1402d4e8144' && kenney?.assetLicense === 'CC0-1.0');
check('candidate-not-falsely-production-approved', Array.isArray(provenance.productionImports) && provenance.productionImports.length === 0, String(provenance.productionImports?.length || 0));

const protectedTargetAssignments = [...files.runtime.matchAll(/target\.(health|maxHealth|points|damageStage|destroyed|x|z|kind|materialFamily|hasGlass)\s*(?:\+\+|--|[+\-*/]?=(?!=))/g)].map((match) => match[0]);
const protectedGlobalAssignments = [...files.runtime.matchAll(/\b(score|combo|remainingSeconds|currentStage|selectedCampaignIndex)\s*(?:\+\+|--|[+\-*/]?=(?!=))/g)].map((match) => match[0]);
const protectedAbilityWrites = [...files.runtime.matchAll(/\b(triggerAbility|usePull|useGust|useZap|triggerPull|triggerGust|triggerZap)\s*=/g)].map((match) => match[0]);
const stormAuthorityWrites = [...files.runtime.matchAll(/\bstorm\.pos\.(?:set|copy|add|sub)\s*\(/g)].map((match) => match[0]);
const privateProductionBarnRefs = [...files.runtime.matchAll(/\bproductionBarn\b/g)].map((match) => match[0]);

check('no-gameplay-target-mutations', protectedTargetAssignments.length === 0, protectedTargetAssignments.join(', '));
check('no-score-clock-campaign-mutations', protectedGlobalAssignments.length === 0, protectedGlobalAssignments.join(', '));
check('no-ability-rewrites', protectedAbilityWrites.length === 0, protectedAbilityWrites.join(', '));
check('no-storm-position-writes', stormAuthorityWrites.length === 0, stormAuthorityWrites.join(', '));
check('no-private-production-barn-access', privateProductionBarnRefs.length === 0, privateProductionBarnRefs.join(', '));
check('no-new-renderer', !files.runtime.includes('new THREE.WebGLRenderer'));
check('no-new-scene-authority', !files.runtime.includes('new THREE.Scene'));

const failedChecks = checks.filter((entry) => !entry.passed);
const report = {
  version: 'THREEJS_HERO_SLICE4_STATIC_V1',
  passed: failedChecks.length === 0,
  checks,
  failedChecks,
  evidence: {
    protectedTargetAssignments,
    protectedGlobalAssignments,
    protectedAbilityWrites,
    stormAuthorityWrites,
    privateProductionBarnRefs,
    productionImportCount: provenance.productionImports?.length || 0,
  },
};

await writeFile(path.join(projectRoot, 'threejs-hero-slice4-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(`Three.js Hero Slice 4 static verification passed ${checks.length}/${checks.length}; gameplay authority writes=0; production approvals remain unchanged.`);
