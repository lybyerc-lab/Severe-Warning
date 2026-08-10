import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const files = {
  runtime: await readFile(path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice6.js'), 'utf8'),
  guard: await readFile(path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice6-stability-guard.js'), 'utf8'),
  roadLaw: await readFile(path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice6-road-law.js'), 'utf8'),
  townPolish: await readFile(path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice6-town-polish.js'), 'utf8'),
  patch: await readFile(path.join(projectRoot, 'scripts', 'apply-threejs-hero-slice6.mjs'), 'utf8'),
  qa: await readFile(path.join(projectRoot, 'scripts', 'qa-threejs-hero-slice6.mjs'), 'utf8'),
  milestone: await readFile(path.join(projectRoot, 'Docs', 'HERO_SLICE6_WORLD_IDENTITY_STORM_SILHOUETTE.md'), 'utf8'),
  workflow: await readFile(path.join(projectRoot, '.github', 'workflows', 'threejs-hero-slice6.yml'), 'utf8'),
};

const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
}

function syntaxCheck(source, filename) {
  try {
    new vm.Script(source, { filename });
    return null;
  } catch (error) {
    return String(error?.message || error);
  }
}

const runtimeSyntaxError = syntaxCheck(files.runtime, 'threejs-visual-hero-slice6.js');
const guardSyntaxError = syntaxCheck(files.guard, 'threejs-visual-hero-slice6-stability-guard.js');
const roadLawSyntaxError = syntaxCheck(files.roadLaw, 'threejs-visual-hero-slice6-road-law.js');
const townPolishSyntaxError = syntaxCheck(files.townPolish, 'threejs-visual-hero-slice6-town-polish.js');
const runtimeBundle = `${files.runtime}\n${files.guard}\n${files.roadLaw}\n${files.townPolish}`;

check('slice6-version', files.runtime.includes('THREEJS_VISUAL_HERO_SLICE6_V1'));
check('slice6-anchor', files.runtime.includes('[SW:VISUAL:HERO_SLICE6]'));
check('slice6-syntax', runtimeSyntaxError === null, runtimeSyntaxError || 'ok');
check('slice6-stability-guard-syntax', guardSyntaxError === null, guardSyntaxError || 'ok');
check('slice6-road-law-version', files.roadLaw.includes('THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_V1'));
check('slice6-road-law-anchor', files.roadLaw.includes('[SW:VISUAL:HERO_SLICE6:ROAD_LAW]'));
check('slice6-road-law-syntax', roadLawSyntaxError === null, roadLawSyntaxError || 'ok');
check('slice6-town-polish-version', files.townPolish.includes('THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_V1'));
check('slice6-town-polish-anchor', files.townPolish.includes('[SW:VISUAL:HERO_SLICE6:TOWN_POLISH]'));
check('slice6-town-polish-syntax', townPolishSyntaxError === null, townPolishSyntaxError || 'ok');
check('slice6-bridge', files.runtime.includes('__SW_THREEJS_VISUAL_FOUNDATION__') && files.runtime.includes('heroSlice6Version'));
check('slice6-road-law-bridge', files.roadLaw.includes('heroSlice6RoadLawVersion') && files.roadLaw.includes('prepareQaView: swVisualHeroSlice6PrepareQaViewRoadLaw'));
check('slice6-town-polish-bridge', files.townPolish.includes('heroSlice6TownPolishVersion') && files.townPolish.includes('refreshHeroSlice6: swVisualHeroSlice6RefreshWorld'));
check('slice5-prerequisite', files.patch.includes('THREEJS_VISUAL_HERO_SLICE5_V1') && files.patch.includes('THREEJS_VISUAL_HERO_SLICE5_POLISH_V1'));
check('ordered-after-slice5-polish', files.patch.includes('slice5PolishIndex > slice6Index') && files.patch.includes('slice6Index > guardIndex') && files.patch.includes('guardIndex > roadLawIndex') && files.patch.includes('roadLawIndex > loopIndex') && files.patch.includes('roadLawIndex > townPolishIndex') && files.patch.includes('townPolishIndex > loopIndex'));
check('road-law-injected', files.patch.includes('[SW:SOURCE:threejs-visual-hero-slice6-road-law.js]') && files.patch.includes('roadLawPath'));
check('town-polish-injected', files.patch.includes('[SW:SOURCE:threejs-visual-hero-slice6-town-polish.js]') && files.patch.includes('townPolishPath'));
check('storm-root', files.runtime.includes('SWVisualHeroSlice6StormSilhouette'));
check('storm-warped-geometry', files.runtime.includes('swVisualHeroSlice6WarpedFunnelGeometry') && files.runtime.includes('swSlice6Warped'));
check('storm-asymmetric-corrugation', files.runtime.includes('corrugation') && files.runtime.includes('bendStrength') && files.runtime.includes('bendX') && files.runtime.includes('bendZ'));
check('storm-legacy-cone-restrained', files.runtime.includes('ProductionMiddleVortex') && files.runtime.includes('ProductionDarkCore') && files.runtime.includes('legacyStormRingCount'));
check('storm-ground-rings-restrained', files.runtime.includes("geometryType !== 'RingGeometry'") && files.runtime.includes("geometryType !== 'TorusGeometry'") && files.runtime.includes('stormRingCount'));
check('storm-edge-wisps', files.runtime.includes('SWVisualSlice6EdgeWisp') && files.runtime.includes('stormEdgeWispCount'));
check('storm-irregular-ground-bursts', files.runtime.includes('SWVisualSlice6GroundBurst') && files.runtime.includes('stormGroundBurstCount'));
check('storm-default-not-neon-forced', files.runtime.includes('swVisualHeroSlice5IsNeonSelected') && !/\bneonFunnelUnlocked\s*(?:\+\+|--|[+\-*/]?=(?!=))/.test(runtimeBundle));
check('world-root', files.runtime.includes('SWVisualHeroSlice6WorldIdentity'));
check('road-grid-is-canonical-80', files.roadLaw.includes('gridStep: 80'));
check('road-protected-shoulder', files.roadLaw.includes('shoulderHalf: 8.5') && files.roadLaw.includes('lotSetbackFromRoad: 12.35'));
check('road-boundary-batches', files.roadLaw.includes('SWVisualSlice6RoadLawSidewalkBatch') && files.roadLaw.includes('SWVisualSlice6RoadLawCurbBatch') && files.roadLaw.includes('SWVisualSlice6RoadLawVergeBatch'));
check('legacy-square-pads-suppressed', files.roadLaw.includes('isLegacyParcelPad') && files.roadLaw.includes('swHiddenBySlice6RoadLaw'));
check('inherited-rectangles-suppressed', files.roadLaw.includes("name.startsWith('SWVisualSlice4Storefront')") && files.roadLaw.includes("name.startsWith('SWVisualSlice4Farm')"));
check('parcel-compliance-scaling', files.roadLaw.includes('swSlice6ParcelScale') && files.roadLaw.includes('swVisualHeroSlice6RoadLawApplyParcelCompliance'));
check('parcel-compliance-does-not-move-targets', !/target\.(x|z)\s*(?:\+\+|--|[+\-*/]?=(?!=))/.test(files.roadLaw));
check('road-intrusion-telemetry', files.roadLaw.includes('targetRoadIntrusionCount') && files.roadLaw.includes('swVisualHeroSlice6RoadLawBoxCrossesGrid'));
check('stacked-box-kits-disabled', files.roadLaw.includes('swVisualHeroSlice6State.buildingIdentityCount = 0') && !files.roadLaw.includes('swVisualHeroSlice6AddBuildingIdentity('));
check('farm-fence-road-gaps', files.roadLaw.includes('fenceGapHalf: 12.6') && files.roadLaw.includes('swVisualHeroSlice6RoadLawFenceCrossings'));
check('farm-fence-segmented-rails', files.roadLaw.includes('SWVisualSlice6FarmFenceRails') && files.roadLaw.includes('farmFenceRailCount'));
check('farm-ditch-segmented', files.roadLaw.includes('SWVisualSlice6FarmDitchSegments') && files.roadLaw.includes('SWVisualSlice6FarmShoulderSegments'));
check('town-polish-water-tower-standpipe', files.townPolish.includes('SWVisualSlice6WaterTowerStandpipe') && files.townPolish.includes("color: '#949b92'"));
check('town-polish-pitched-rooflines', files.townPolish.includes('swVisualHeroSlice6TownPolishGableGeometry') && files.townPolish.includes('SWVisualSlice6MainStreetGable'));
check('town-polish-false-fronts-and-awnings', files.townPolish.includes('SWVisualSlice6MainStreetFalseFront') && files.townPolish.includes('SWVisualSlice6MainStreetAwning'));
check('town-polish-blocktown-break-version', files.townPolish.includes('THREEJS_VISUAL_HERO_SLICE6_BLOCKTOWN_BREAK_V1'));
check('town-polish-bounded-commercial-archetypes', files.townPolish.includes("['shop', 'office', 'civic', 'apartment']") && files.townPolish.includes('.slice(0, 12)'));
check('town-polish-authored-signage', files.townPolish.includes('swVisualHeroSlice6TownPolishSignMaterial') && files.townPolish.includes("'MOO BREW'"));
check('town-polish-parapets-and-sidewalk-props', files.townPolish.includes('TownPolishParapet') && files.townPolish.includes('TownPolishPlanter'));
check('town-polish-lowers-tall-massing', files.townPolish.includes('swSlice6TownHeightScale') && files.townPolish.includes('height >= 24 ? 0.50'));
check('town-polish-keeps-roofs-inside-footprint', files.townPolish.includes('width * 0.90') && files.townPolish.includes('depth * 0.90') && files.townPolish.includes('roof.rotation.y = ordinal % 3'));
check('town-polish-broken-storm-debris-column', files.townPolish.includes('SWVisualSlice6StormDebrisColumn') && files.townPolish.includes('stormDebrisClusterCount'));
check('world-grade', files.runtime.includes('toneMappingExposure') && files.runtime.includes('fogColor'));
check('no-runtime-http-assets', !/https?:\/\//.test(runtimeBundle));
check('qa-default-storm-evidence', files.qa.includes('threejs-hero-slice6-default-storm.png'));
check('qa-main-street-evidence', files.qa.includes('threejs-hero-slice6-main-street.png'));
check('qa-street-corner-evidence', files.qa.includes('threejs-hero-slice6-street-corner.png'));
check('qa-farm-edge-evidence', files.qa.includes('threejs-hero-slice6-farm-edge.png'));
check('qa-neon-off-default', files.qa.includes('Neon must remain OFF') && files.qa.includes('rainbowFunnel?.enabled === false'));
check('qa-asymmetry-probe', files.qa.includes('warpedShellCount') && files.qa.includes('lateralCenterOffset'));
check('qa-road-law-version', files.qa.includes('THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_V1'));
check('qa-street-boundaries', files.qa.includes('sidewalkSegmentCount') && files.qa.includes('curbSegmentCount'));
check('qa-hidden-square-overlays', files.qa.includes('hiddenLegacyParcelMeshes'));
check('qa-zero-target-road-intrusions', files.qa.includes('independentTargetRoadIntrusions') && files.qa.includes('targetRoadIntrusionCount'));
check('qa-fence-road-gap', files.qa.includes('farmFenceGapCount') && files.qa.includes('independentFenceRoadIntrusions'));
check('qa-zero-stacked-kits', files.qa.includes('stackedSlice6BuildingKits'));
check('qa-world-budget', files.qa.includes('slice6PresentationObjectCount') && files.qa.includes('<= 110'));
check('qa-blocktown-authorship', files.qa.includes('storefrontArchetypeCount') && files.qa.includes('targetCoordinateMutations'));
check('qa-broken-storm-body', files.qa.includes('stormDebrisClusterCount'));
check('qa-requires-slice5', files.qa.includes("heroSlice5Version === 'THREEJS_VISUAL_HERO_SLICE5_V1'"));
check('workflow-stacked-base', files.workflow.includes('agent/threejs-hero-slice5-rainbow-cow-level'));
check('workflow-exact-slice5-reference', files.workflow.includes('f42f12b3e4e6b38d49f6bcc0b129b4e335f13ecf'));
check('workflow-runs-slice5-patch', files.workflow.includes('apply-threejs-hero-slice5.mjs'));
check('workflow-runs-slice6-patch', files.workflow.includes('apply-threejs-hero-slice6.mjs'));
check('workflow-runs-slice6-verify', files.workflow.includes('verify-threejs-hero-slice6.mjs'));
check('workflow-runs-slice6-qa', files.workflow.includes('qa-threejs-hero-slice6.mjs'));
check('workflow-keeps-slice5-qa', files.workflow.includes('qa-threejs-hero-slice5.mjs'));
check('workflow-keeps-performance-gate', files.workflow.includes('perf:phase6'));
check('workflow-packages-android', files.workflow.includes('assembleDebug'));
check('milestone-stage2a', files.milestone.includes('Stage 2A') && files.milestone.includes('World Identity + Storm Silhouette'));
check('milestone-road-first-correction', files.milestone.includes('road-first') && files.milestone.includes('fence') && files.milestone.includes('square'));
check('milestone-is-not-acceptance', files.milestone.includes('NOT ACCEPTED') && files.milestone.includes('owner visual review'));
check('milestone-no-stage2b', files.milestone.includes('does not open Stage 2B'));

const protectedTargetAssignments = [...runtimeBundle.matchAll(/target\.(health|maxHealth|points|damageStage|destroyed|x|z|kind|materialFamily|hasGlass)\s*(?:\+\+|--|[+\-*/]?=(?!=))/g)].map((match) => match[0]);
const protectedGlobalAssignments = [...runtimeBundle.matchAll(/\b(score|combo|remainingSeconds|currentStage|selectedCampaignIndex)\s*(?:\+\+|--|[+\-*/]?=(?!=))/g)].map((match) => match[0]);
const protectedAbilityWrites = [...runtimeBundle.matchAll(/\b(triggerAbility|usePull|useGust|useZap|triggerPull|triggerGust|triggerZap)\s*=/g)].map((match) => match[0]);
const stormAuthorityWrites = [...runtimeBundle.matchAll(/\bstorm\.pos\.(?:set|copy|add|sub)\s*\(/g)].map((match) => match[0]);
const animalArrayWrites = [...runtimeBundle.matchAll(/\banimals\.(?:push|splice|pop|shift|unshift)\s*\(/g)].map((match) => match[0]);
const animalAuthorityWrites = [...runtimeBundle.matchAll(/\banimal\.(?:x|z|groundY|airborne|altitude|orbitAngle)\s*(?:\+\+|--|[+\-*/]?=(?!=))/g)].map((match) => match[0]);
const neonSelectionWrites = [...runtimeBundle.matchAll(/\bneonFunnelUnlocked\s*(?:\+\+|--|[+\-*/]?=(?!=))/g)].map((match) => match[0]);
const privateProductionBarnRefs = [...runtimeBundle.matchAll(/\bproductionBarn\b/g)].map((match) => match[0]);

check('no-gameplay-target-mutations', protectedTargetAssignments.length === 0, protectedTargetAssignments.join(', '));
check('no-score-clock-campaign-mutations', protectedGlobalAssignments.length === 0, protectedGlobalAssignments.join(', '));
check('no-ability-rewrites', protectedAbilityWrites.length === 0, protectedAbilityWrites.join(', '));
check('no-storm-position-writes', stormAuthorityWrites.length === 0, stormAuthorityWrites.join(', '));
check('no-animal-array-writes', animalArrayWrites.length === 0, animalArrayWrites.join(', '));
check('no-animal-authority-writes', animalAuthorityWrites.length === 0, animalAuthorityWrites.join(', '));
check('no-neon-selection-writes', neonSelectionWrites.length === 0, neonSelectionWrites.join(', '));
check('no-private-production-barn-access', privateProductionBarnRefs.length === 0, privateProductionBarnRefs.join(', '));
check('no-new-renderer', !runtimeBundle.includes('new THREE.WebGLRenderer'));
check('no-new-scene-authority', !runtimeBundle.includes('new THREE.Scene'));

const failedChecks = checks.filter((entry) => !entry.passed);
const report = {
  version: 'THREEJS_HERO_SLICE6_STATIC_V3',
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
    neonSelectionWrites,
    privateProductionBarnRefs,
  },
};

await writeFile(path.join(projectRoot, 'threejs-hero-slice6-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (!report.passed) {
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
console.log(`Three.js Hero Slice 6 static verification passed ${checks.length}/${checks.length}; road-first parcel law + town polish active; gameplay authority writes=0; Neon selection writes=0.`);
