import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const files = {
  runtime: await readFile(path.join(projectRoot, 'runtime', 'threejs-visual-foundation.js'), 'utf8'),
  heroSlice2Runtime: await readFile(path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice2.js'), 'utf8'),
  heroSlice3Runtime: await readFile(path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice3.js'), 'utf8'),
  patch: await readFile(path.join(projectRoot, 'scripts', 'apply-threejs-visual-foundation.mjs'), 'utf8'),
  styleBible: await readFile(path.join(projectRoot, 'Docs', 'THREEJS_VISUAL_STYLE_BIBLE.md'), 'utf8'),
  intake: await readFile(path.join(projectRoot, 'Docs', 'ASSET_INTAKE_AND_PROVENANCE.md'), 'utf8'),
  provenance: await readFile(path.join(projectRoot, 'assets', 'production', 'asset-provenance.json'), 'utf8'),
  packageJson: await readFile(path.join(projectRoot, 'package.json'), 'utf8'),
};

const provenance = JSON.parse(files.provenance);
const pkg = JSON.parse(files.packageJson);
const combinedRuntime = `${files.runtime}\n${files.heroSlice2Runtime}\n${files.heroSlice3Runtime}`;
const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
}

const kenneyParticle = provenance.candidates?.find((entry) => entry.id === 'kenney.particle-pack') || null;
const curatedKenneyFiles = Array.isArray(kenneyParticle?.curatedFiles) ? kenneyParticle.curatedFiles : [];
let heroSlice2SyntaxError = null;
let heroSlice3SyntaxError = null;
try { new vm.Script(files.heroSlice2Runtime, { filename: 'threejs-visual-hero-slice2.js' }); } catch (error) { heroSlice2SyntaxError = String(error?.message || error); }
try { new vm.Script(files.heroSlice3Runtime, { filename: 'threejs-visual-hero-slice3.js' }); } catch (error) { heroSlice3SyntaxError = String(error?.message || error); }

check('runtime-version', files.runtime.includes('THREEJS_VISUAL_FOUNDATION_V1'));
check('runtime-anchor', files.runtime.includes('[SW:VISUAL:THREEJS_FOUNDATION]'));
check('hero-slice2-version', files.heroSlice2Runtime.includes('THREEJS_VISUAL_HERO_SLICE2_V1'));
check('hero-slice2-anchor', files.heroSlice2Runtime.includes('[SW:VISUAL:HERO_SLICE2]'));
check('hero-slice2-syntax', heroSlice2SyntaxError === null, heroSlice2SyntaxError || 'ok');
check('hero-slice3-version', files.heroSlice3Runtime.includes('THREEJS_VISUAL_HERO_SLICE3_V1'));
check('hero-slice3-anchor', files.heroSlice3Runtime.includes('[SW:VISUAL:HERO_SLICE3]'));
check('hero-slice3-syntax', heroSlice3SyntaxError === null, heroSlice3SyntaxError || 'ok');
check('bridge-exported', files.runtime.includes('__SW_THREEJS_VISUAL_FOUNDATION__') && files.heroSlice2Runtime.includes('__SW_THREEJS_VISUAL_FOUNDATION__') && files.heroSlice3Runtime.includes('__SW_THREEJS_VISUAL_FOUNDATION__'));
check('stage1-required', files.patch.includes('THREEJS_ASSET_PIPELINE_V1') && files.patch.includes('[SW:SOURCE:threejs-asset-pipeline.js]'));
check('hero-slice2-bundled-after-foundation', files.patch.includes('[SW:SOURCE:threejs-visual-hero-slice2.js]') && files.patch.includes('visualIndex > heroSlice2Index'));
check('hero-slice3-bundled-after-slice2', files.patch.includes('[SW:SOURCE:threejs-visual-hero-slice3.js]') && files.patch.includes('heroSlice2Index > heroSlice3Index'));
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
check('facade-camera-helper', files.heroSlice2Runtime.includes('swVisualHeroSlice2PlaceFacadeCamera') && files.heroSlice2Runtime.includes('new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion)'));
check('storefront-front-qa-camera', files.heroSlice2Runtime.includes('swVisualHeroSlice2PlaceFacadeCamera(storefrontNode, 38, 29, 17, 4.9)'));
check('farm-front-qa-camera', files.heroSlice2Runtime.includes('swVisualHeroSlice2PlaceFacadeCamera(hartFarm.node, 45, 34, 22, 7.2)'));
check('storefront-curated-materials', files.heroSlice2Runtime.includes('swVisualHeroSlice2StyleStorefront') && files.heroSlice2Runtime.includes('PRAIRIE SUPPLY') && files.heroSlice2Runtime.includes("swVisualHeroSlice2SurfaceTexture('brick')"));
check('hart-farm-curated-materials', files.heroSlice2Runtime.includes('swVisualHeroSlice2StyleHartFarm') && files.heroSlice2Runtime.includes("swVisualHeroSlice2SurfaceTexture('barn-red')") && files.heroSlice2Runtime.includes("swVisualHeroSlice2SurfaceTexture('galvanized')"));
check('hart-farm-roof-material-excludes-foundation', files.heroSlice2Runtime.includes('localY >= 12 && height <= 1.0 && depth >= 18'));
check('surface-style-lifecycle-reset', files.heroSlice2Runtime.includes('swVisualHeroSlice2Styled.storefront = false') && files.heroSlice2Runtime.includes('swVisualHeroSlice2Styled.hartFarm = false') && files.heroSlice2Runtime.includes('swVisualHeroSlice2SurfaceTextures.clear()'));
check('storm-light-contrast-pass', files.heroSlice2Runtime.includes('ambientTarget') && files.heroSlice2Runtime.includes('directionalTarget') && files.heroSlice2Runtime.includes('targetExposure'));
check('hero-slice3-secondary-target-style', files.heroSlice3Runtime.includes('swVisualHeroSlice3StyleSecondaryTargets') && files.heroSlice3Runtime.includes('target.meshData'));
check('hero-slice3-read-only-target-access', files.heroSlice3Runtime.includes("typeof targets !== 'undefined'") && files.heroSlice3Runtime.includes('Boolean(target.destroyed)'));
check('hero-slice3-world-surface-style', files.heroSlice3Runtime.includes('swVisualHeroSlice3StyleWorldSurface') && files.heroSlice3Runtime.includes('terrainMat') && files.heroSlice3Runtime.includes('roadMat') && files.heroSlice3Runtime.includes('shoulderMat') && files.heroSlice3Runtime.includes('laneMat'));
check('hero-slice3-town-ground-style', files.heroSlice3Runtime.includes('swVisualHeroSlice3StyleTownGround') && files.heroSlice3Runtime.includes('townDressGroup'));
check('hero-slice3-material-families', files.heroSlice3Runtime.includes("family === 'wood'") && files.heroSlice3Runtime.includes("family === 'masonry'") && files.heroSlice3Runtime.includes("family === 'metal'") && files.heroSlice3Runtime.includes("family === 'silo'"));
check('hero-slice3-glass-restraint', files.heroSlice3Runtime.includes("emissiveIntensity: 0.08") && files.heroSlice3Runtime.includes('palette.glass'));
check('hero-slice3-tree-restraint', files.heroSlice3Runtime.includes('swVisualHeroSlice3StyleTreeTarget') && files.heroSlice3Runtime.includes('palette.foliage'));
check('hero-slice3-four-campaign-palettes', files.heroSlice3Runtime.includes('SW_VISUAL_HERO_SLICE3_PALETTES') && (files.heroSlice3Runtime.match(/Object\.freeze\(\{\n    terrain:/g) || []).length === 4);
check('style-law-present', files.styleBible.includes('Storm-charged stylized Americana') && files.styleBible.includes('beautiful at a glance, readable at speed, cinematic up close'));
check('asset-intake-law-present', files.intake.includes('Every shipped external asset must have a known source'));
check('provenance-version', provenance.version === 'SW_ASSET_PROVENANCE_V1', provenance.version);
check('runtime-network-assets-disabled', provenance.policy?.runtimeNetworkAssetsAllowed === false);
check('kenney-particle-candidate-pinned', kenneyParticle?.upstreamCommit === 'ab7086639ee73be31abd87feb21bf1402d4e8144' && kenneyParticle?.assetLicense === 'CC0-1.0');
check('kenney-curated-sprite-paths-pinned', [
  ['addons/kenney_particle_pack/dirt_01.png', '3bf82433236c8a0e5452563dccafd0ca4ec82a31'],
  ['addons/kenney_particle_pack/smoke_03.png', '34cad39231026b6617f25e03e99c0b860258d010'],
  ['addons/kenney_particle_pack/trace_03.png', 'dcd8c6c39b522e207ee972bff30d064c60f20c07'],
  ['addons/kenney_particle_pack/light_02.png', '30fbdb4c7ad1a9399e1a6ed88e3e6be426b71dc0'],
].every(([pathName, blobSha]) => curatedKenneyFiles.some((entry) => entry.path === pathName && entry.blobSha === blobSha && entry.productionImported === false)), JSON.stringify(curatedKenneyFiles));
check('production-imports-explicit', Array.isArray(provenance.productionImports));
check('production-imports-still-empty', provenance.productionImports?.length === 0, String(provenance.productionImports?.length || 0));
check('package-patch-command', pkg.scripts?.['patch:visual-foundation'] === 'node scripts/apply-threejs-visual-foundation.mjs', pkg.scripts?.['patch:visual-foundation'] || 'missing');
check('package-verify-command', pkg.scripts?.['verify:visual-foundation'] === 'node scripts/verify-threejs-visual-foundation.mjs', pkg.scripts?.['verify:visual-foundation'] || 'missing');
check('package-qa-command', pkg.scripts?.['qa:visual-foundation'] === 'node scripts/qa-threejs-visual-foundation.mjs', pkg.scripts?.['qa:visual-foundation'] || 'missing');

const protectedTargetAssignments = [...combinedRuntime.matchAll(/target\.(health|maxHealth|points|damageStage|destroyed|x|z|kind|materialFamily|hasGlass)\s*(?:\+\+|--|[+\-*/]?=(?!=))/g)].map((match) => match[0]);
const protectedGlobalAssignments = [...combinedRuntime.matchAll(/\b(score|combo|remainingSeconds|currentStage|selectedCampaignIndex)\s*(?:\+\+|--|[+\-*/]?=(?!=))/g)].map((match) => match[0]);
const protectedAbilityWrites = [...combinedRuntime.matchAll(/\b(triggerAbility|usePull|useGust|useZap|triggerPull|triggerGust|triggerZap)\s*=/g)].map((match) => match[0]);
const stormAuthorityWrites = [...combinedRuntime.matchAll(/\bstorm\.pos\.(?:set|copy|add|sub)\s*\(/g)].map((match) => match[0]);
const privateProductionBarnRefs = [...combinedRuntime.matchAll(/\bproductionBarn\b/g)].map((match) => match[0]);

check('no-gameplay-target-mutations', protectedTargetAssignments.length === 0, protectedTargetAssignments.join(', '));
check('no-score-clock-campaign-mutations', protectedGlobalAssignments.length === 0, protectedGlobalAssignments.join(', '));
check('no-ability-rewrites', protectedAbilityWrites.length === 0, protectedAbilityWrites.join(', '));
check('no-storm-position-writes', stormAuthorityWrites.length === 0, stormAuthorityWrites.join(', '));
check('no-private-production-barn-access', privateProductionBarnRefs.length === 0, privateProductionBarnRefs.join(', '));
check('no-runtime-http-assets', !/https?:\/\//.test(combinedRuntime));
check('no-new-renderer', !combinedRuntime.includes('new THREE.WebGLRenderer'));
check('no-new-scene-authority', !combinedRuntime.includes('new THREE.Scene'));

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
    curatedKenneyFileCount: curatedKenneyFiles.length,
    productionImportCount: provenance.productionImports?.length || 0,
  },
};

await writeFile(path.join(projectRoot, 'threejs-visual-foundation-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(`Three.js visual foundation static verification passed ${checks.length}/${checks.length}; external candidates=${report.evidence.candidateCount}, curated Kenney sprites=${report.evidence.curatedKenneyFileCount}, production imports=${report.evidence.productionImportCount}.`);
