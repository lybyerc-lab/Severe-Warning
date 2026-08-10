import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const files = {
  foundation: path.join(projectRoot, 'runtime', 'threejs-opening-cinematic-foundation.js'),
  integration: path.join(projectRoot, 'runtime', 'threejs-opening-cinematic-integration.js'),
  apply: path.join(projectRoot, 'scripts', 'apply-threejs-opening-cinematic.mjs'),
  docs: path.join(projectRoot, 'Docs', 'OPENING_CINEMATIC_FOUNDATION.md'),
};
const [foundation, integration, apply, docs] = await Promise.all(Object.values(files).map((file) => readFile(file, 'utf8')));
const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

for (const [label, source] of [['foundation runtime', foundation], ['integration runtime', integration]]) {
  let error = null;
  try { new vm.Script(source, { filename: label }); } catch (caught) { error = String(caught?.message || caught); }
  check(`${label} syntax`, error === null, error || 'ok');
}

check('retained CIN-002 acting foundation is exact-versioned', foundation.includes('SW_CIN_002_ACTING_POLISH_V1') && foundation.includes('__SW_OPENING_CINEMATIC_FOUNDATION__'));
check('playable CIN-003 bridge is versioned', integration.includes('SW_CIN_003_PLAYABLE_OPENING_V1') && integration.includes('__SW_OPENING_CINEMATIC_PLAYABLE__'));
check('uses existing scene and renderer only', !foundation.includes('new THREE.WebGLRenderer') && !foundation.includes('new THREE.Scene') && !integration.includes('new THREE.WebGLRenderer') && !integration.includes('new THREE.Scene'));
check('game clock is gated by runActive rather than rewritten', integration.includes('runActive = false;') && integration.includes('runActive = true;') && !/runTimeRemaining\s*=/.test(integration));
check('no storm gameplay position or tuning authority writes', !/storm\.pos\.(?:set|copy|add|sub)\(/.test(integration) && !/storm\.(?:speed|radius)\s*=/.test(integration));
check('no target damage/destruction/scoring authority writes', !/(?:target\.(?:health|maxHealth|damageStage|destroyed|points)|destructionScore|comboMultiplier)\s*=/.test(integration));
check('utility and ability authority are untouched', !/(?:powerPoles\.(?:push|splice)|triggerAbility\s*=|cooldowns\s*=)/.test(integration));
check('Neon persistence remains read-only', !/neonFunnelUnlocked\s*=/.test(integration));
check('camera ownership is temporary and build-hooked', apply.includes('swOpeningCinematicOwnsFrame') && apply.includes('cinematicCameraGate') && integration.includes('cameraPose('));
check('menu launch wraps existing start path', integration.includes('baseStartRunFromMenu') && integration.includes('startRunFromMenuWithPlayableOpening'));
check('HUD hides only for cinematic and restores at handoff', integration.includes("const hudIds = ['hud', 'easBanner', 'joystickZone']") && integration.includes('setHudVisible(false)') && integration.includes('setHudVisible(true)'));
check('farm anchor is the authored Hart Farm presentation anchor', integration.includes('swVisualGetHartFarmPresentationAnchor') && integration.includes('farmFound'));
check('canonical comedy beats are represented', ['SWCinematicNewspaper', 'ChickenCinematicRig-1', 'ChickenCinematicRig-2', 'MooBrewCup', 'SWCinematicBarnRoofPeel', 'SWCinematicTouchdownProductionStorm'].every((token) => integration.includes(token)));
check('touchdown reuses the WORLD-002 production storm silhouette', integration.includes("getObjectByName?.('SWVisualHeroSlice6StormSilhouette')") && integration.includes('productionStorm.clone(true)') && integration.includes("profile: 'world-slice6-asymmetric-storm-v2'"));
check('touchdown does not recreate the rejected saucer primitives', !integration.includes('new THREE.CylinderGeometry') && !integration.includes('new THREE.SphereGeometry') && !integration.includes('new THREE.RingGeometry'));
check('first viewing state and later skip are deterministic', integration.includes('severe_weather_opening_seen_v1') && integration.includes('state.canSkip = hasSeen()') && integration.includes("event.code === 'Escape'"));
check('visibility pauses cinematic time naturally through bounded frame delta', integration.includes('Math.min(0.1, Number(dt)') && !integration.includes('Date.now() -'));
check('cleanup disposes owned presentation roots and removes the shared WORLD storm clone', integration.includes('state.session?.dispose?.()') && integration.includes('disposeCustomRoot(state.customRoot)') && integration.includes('removePresentationRoot(state.stormReveal.group)'));
check('apply order requires sealed Slice 6 before cinematic', apply.includes('THREEJS_VISUAL_HERO_SLICE6_V1') && apply.includes('[SW:SOURCE:threejs-visual-hero-slice6-town-polish.js]') && apply.includes('integrationIndex > loopIndex'));
check('foundation documentation records deferred integration origin', docs.includes('Deferred integration') && docs.includes('warning clock'));

const failures = checks.filter((entry) => !entry.passed);
const report = { version: 'SW_CIN_003_STATIC_V1', passed: failures.length === 0, checks, failures };
const outputDir = path.join(projectRoot, 'qa-artifacts', 'opening-cinematic');
await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, 'sw-cin-003-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`SW-CIN-003 static verification: ${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length) process.exit(1);
