import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const runtimePath = path.join(projectRoot, 'runtime', 'threejs-opening-cinematic-foundation.js');
const qaPath = path.join(projectRoot, 'scripts', 'qa-threejs-opening-cinematic-foundation.mjs');
const docPath = path.join(projectRoot, 'Docs', 'OPENING_CINEMATIC_FOUNDATION.md');
const [runtime, qa, documentation] = await Promise.all([readFile(runtimePath, 'utf8'), readFile(qaPath, 'utf8'), readFile(docPath, 'utf8')]);
const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

let syntaxError = null;
try { new vm.Script(runtime, { filename: path.basename(runtimePath) }); } catch (error) { syntaxError = String(error?.message || error); }

check('runtime syntax', syntaxError === null, syntaxError || 'ok');
check('foundation version and bridge', runtime.includes('SW_CIN_002_ACTING_POLISH_V1') && runtime.includes('__SW_OPENING_CINEMATIC_FOUNDATION__'));
check('uses existing scene contract', runtime.includes('mount requires an existing Three.js scene') && runtime.includes('scene.add(root)'));
check('no renderer authority', !runtime.includes('new THREE.WebGLRenderer'));
check('no scene authority', !runtime.includes('new THREE.Scene'));
check('no gameplay authority references', !/\b(score|combo|remainingSeconds|currentStage|selectedCampaignIndex|triggerAbility|usePull|useGust|useZap)\b/.test(runtime));
check('Cow 17 bipedal pose controls', ['cow17-left-shoulder', 'cow17-right-shoulder', 'cow17-left-leg', 'cow17-right-leg', 'cow17-head', 'cow17-ear-tag'].every((token) => runtime.includes(token)));
check('fence lean and cup hold controls', ['cow17-left-resting-hoof', 'MooBrewCup', 'moo-brew-logo', 'logo-camera-ready'].every((token) => runtime.includes(token)));
check('Cow 17 readable pattern and physical contact cues', ['cow17-face-patch', 'cow17-torso-front-patch-large', 'cow17-hips-front-patch', 'cow17-left-fence-contact-pad', 'cow17-right-cup-thumb'].every((token) => runtime.includes(token)));
check('two conversational chicken rigs', runtime.includes('ChickenCinematicRig-${id}') && runtime.includes('geometry, palette, 1, -1') && runtime.includes('geometry, palette, 2, 1') && runtime.includes('idle-peck') && runtime.includes('scatter-transition'));
check('authored fence composition', ['MooBrewFenceConversationComposition', 'cinematic-fence-post-', 'cinematic-fence-rail-'].every((token) => runtime.includes(token)));
check('deterministic required frames', ['fence-conversation', 'double-take', 'last-sip-setup'].every((token) => runtime.includes(token)));
check('timeline includes performance beats', ['first-chicken-noticing', 'cow-delayed-turn', 'escape-transition'].every((token) => runtime.includes(token)));
check('telemetry includes mobile budget', runtime.includes('budget: counts') && runtime.includes('meshes') && runtime.includes('materials'));
check('browser QA uses local Three r128 in an explicit QA-only harness', qa.includes('threeMatch') && qa.includes('QA-only renderer') && qa.includes("rendererRevision === '128'") && qa.includes('SW-CIN-002 mobile guard'));
check('documentation records deferred integration', documentation.includes('Deferred integration') && documentation.includes('warning clock'));

const failedChecks = checks.filter((entry) => !entry.passed);
const report = { version: 'SW_CIN_001_STATIC_V1', passed: failedChecks.length === 0, checks, failedChecks };
const outputDir = path.join(projectRoot, 'qa-artifacts', 'opening-cinematic');
await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, 'sw-cin-001-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`SW-CIN-001 static verification: ${checks.length - failedChecks.length}/${checks.length} checks passed.`);
if (failedChecks.length) process.exit(1);
