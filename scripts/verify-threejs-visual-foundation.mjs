import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const files = {
  runtime: await readFile(path.join(projectRoot, 'runtime', 'threejs-visual-foundation.js'), 'utf8'),
  patch: await readFile(path.join(projectRoot, 'scripts', 'apply-threejs-visual-foundation.mjs'), 'utf8'),
  styleBible: await readFile(path.join(projectRoot, 'Docs', 'THREEJS_VISUAL_STYLE_BIBLE.md'), 'utf8'),
  intake: await readFile(path.join(projectRoot, 'Docs', 'ASSET_INTAKE_AND_PROVENANCE.md'), 'utf8'),
  provenance: await readFile(path.join(projectRoot, 'assets', 'production', 'asset-provenance.json'), 'utf8'),
  packageJson: await readFile(path.join(projectRoot, 'package.json'), 'utf8'),
};

const provenance = JSON.parse(files.provenance);
const pkg = JSON.parse(files.packageJson);
const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
}

check('runtime-version', files.runtime.includes('THREEJS_VISUAL_FOUNDATION_V1'));
check('runtime-anchor', files.runtime.includes('[SW:VISUAL:THREEJS_FOUNDATION]'));
check('bridge-exported', files.runtime.includes('__SW_THREEJS_VISUAL_FOUNDATION__'));
check('stage1-required', files.patch.includes('THREEJS_ASSET_PIPELINE_V1') && files.patch.includes('[SW:SOURCE:threejs-asset-pipeline.js]'));
check('visual-after-asset-pipeline', files.patch.includes('assetIndex > visualIndex'));
check('frame-hook-after-v510', files.patch.includes('__SW_V510_UPDATE__') && files.patch.includes('__SW_THREEJS_VISUAL_FOUNDATION__?.update'));
check('sky-dome', files.runtime.includes('SWVisualSkyDome') && files.runtime.includes('THREE.ShaderMaterial'));
check('storm-rim-light', files.runtime.includes('SWVisualStormRimLight') && files.runtime.includes('THREE.DirectionalLight'));
check('cloud-cards', files.runtime.includes('THREE.SpriteMaterial') && files.runtime.includes('SWVisualCloudCard'));
check('dust-cards', files.runtime.includes('SWVisualStormDust') && files.runtime.includes("swVisualMakeSoftTexture('dust')"));
check('storefront-ground-language', files.runtime.includes('SWVisualStorefrontAsphalt') && files.runtime.includes('SWVisualStorefrontSidewalk'));
check('hart-farm-ground-language', files.runtime.includes('SWVisualHartFarmDirtApron'));
check('hart-farm-public-presentation-anchor', files.runtime.includes("getObjectByName?.('HartFarmSignatureBarn')") && files.runtime.includes('swVisualGetHartFarmPresentationAnchor'));
check('hero-practical-lights', files.runtime.includes('THREE.PointLight') && files.runtime.includes('swVisualAddLamp'));
check('aces-tonemapping', files.runtime.includes('THREE.ACESFilmicToneMapping'));
check('srgb-output', files.runtime.includes('THREE.sRGBEncoding'));
check('soft-shadows', files.runtime.includes('THREE.PCFSoftShadowMap'));
check('qa-views', files.runtime.includes("swVisualPrepareQaView(mode = 'storefront')") && files.runtime.includes("mode === 'farm'") && files.runtime.includes("mode === 'storm'"));
check('style-law-present', files.styleBible.includes('Storm-charged stylized Americana') && files.styleBible.includes('beautiful at a glance, readable at speed, cinematic up close'));
check('asset-intake-law-present', files.intake.includes('Every shipped external asset must have a known source'));
check('provenance-version', provenance.version === 'SW_ASSET_PROVENANCE_V1', provenance.version);
check('runtime-network-assets-disabled', provenance.policy?.runtimeNetworkAssetsAllowed === false);
check('kenney-particle-candidate-pinned', provenance.candidates?.some((entry) => entry.id === 'kenney.particle-pack' && entry.upstreamCommit === 'ab7086639ee73be31abd87feb21bf1402d4e8144' && entry.assetLicense === 'CC0-1.0'));
check('production-imports-explicit', Array.isArray(provenance.productionImports));
check('package-patch-command', pkg.scripts?.['patch:visual-foundation'] === 'node scripts/apply-threejs-visual-foundation.mjs', pkg.scripts?.['patch:visual-foundation'] || 'missing');
check('package-verify-command', pkg.scripts?.['verify:visual-foundation'] === 'node scripts/verify-threejs-visual-foundation.mjs', pkg.scripts?.['verify:visual-foundation'] || 'missing');
check('package-qa-command', pkg.scripts?.['qa:visual-foundation'] === 'node scripts/qa-threejs-visual-foundation.mjs', pkg.scripts?.['qa:visual-foundation'] || 'missing');

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
check('no-runtime-http-assets', !/https?:\/\//.test(files.runtime));
check('no-new-renderer', !files.runtime.includes('new THREE.WebGLRenderer'));
check('no-new-scene-authority', !files.runtime.includes('new THREE.Scene'));

const failedChecks = checks.filter((entry) => !entry.passed);
const report = {
  version: 'THREEJS_VISUAL_FOUNDATION_STATIC_V1',
  passed: failedChecks.length === 0,
  checks,
  failedChecks,
  evidence: {
    protectedTargetAssignments,
    protectedGlobalAssignments,
    protectedAbilityWrites,
    stormAuthorityWrites,
    privateProductionBarnRefs,
    candidateCount: provenance.candidates?.length || 0,
    productionImportCount: provenance.productionImports?.length || 0,
  },
};

await writeFile(path.join(projectRoot, 'threejs-visual-foundation-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(`Three.js visual foundation static verification passed ${checks.length}/${checks.length}; external candidates=${report.evidence.candidateCount}, production imports=${report.evidence.productionImportCount}.`);
