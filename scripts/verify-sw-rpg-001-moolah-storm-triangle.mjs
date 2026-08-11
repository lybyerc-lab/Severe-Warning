import { readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const temporary = path.join(root, '.sw-rpg-001-verify.html');
const patches = [
  'apply-v431-source-patch.mjs','apply-v440-source-patch.mjs','apply-v441-source-patch.mjs','apply-v442-source-patch.mjs',
  'fix-v450-parser.mjs','apply-v450-source-patch.mjs','apply-v450-rampage-music-patch.mjs','apply-qa-corrections-patch.mjs',
  'apply-audio-mix-followup-patch.mjs','apply-ui-polish-followup-patch.mjs','apply-score-continuity-fix.mjs','apply-qa4-deterministic-lab-patch.mjs',
  'apply-qa4-mobile-input-fix.mjs','apply-qa4-run-lock-fix.mjs','apply-qa4-pause-forensics.mjs','apply-pause-overlay-hit-test-fix.mjs',
  'apply-pause-overlay-hard-hide.mjs','apply-qa4-popup-assertion-fix.mjs','apply-v500-campaign-patch.mjs','apply-v500-realtime-clock-fix.mjs',
  'apply-v500-world-tour-patch.mjs','apply-v500-mobile-layout-fix.mjs','apply-v500-cow-signature-patch.mjs','apply-v510-production-slice.mjs',
  'apply-sw-game-002-moo-level.mjs','apply-sw-ui-001-newspaper-presentation.mjs','apply-sw-score-001-persistent-scorekeeper.mjs','apply-sw-rpg-001-moolah-storm-triangle.mjs'
];
const checks = [];
const check = (name, passed, detail = '') => { checks.push({ name, passed: Boolean(passed), detail }); console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`); };
const apply = script => execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: temporary }, stdio: 'pipe' });

await writeFile(temporary, await readFile(source, 'utf8'), 'utf8');
let generated = '';
try { patches.forEach(apply); generated = await readFile(temporary, 'utf8'); }
finally { await rm(temporary, { force: true }); }

const runtime = await readFile(path.join(root, 'runtime', 'sw-rpg-001-moolah-storm-triangle.js'), 'utf8');
const scorekeeper = await readFile(path.join(root, 'runtime', 'sw-score-001-persistent-scorekeeper.js'), 'utf8');
const executionRuntime = runtime.split('globalThis.__SW_RPG_001_QA__')[0];
const forbiddenScope = /twin tornado|waterspout|slingshot|satellite|leaderboard|account|cloud|storm\.speed|moveX\s*=|moveZ\s*=|addScore\s*=/i.test(executionRuntime);

check('bundles after the completed GAME-002, UI-001, and SCORE-001 executor chain', generated.indexOf('[SW:SOURCE:sw-game-002-moo-level.js]') < generated.indexOf('[SW:SOURCE:sw-ui-001-newspaper-presentation.js]') && generated.indexOf('[SW:SOURCE:sw-ui-001-newspaper-presentation.js]') < generated.indexOf('[SW:SOURCE:sw-score-001-persistent-scorekeeper.js]') && generated.indexOf('[SW:SOURCE:sw-score-001-persistent-scorekeeper.js]') < generated.indexOf('[SW:SOURCE:sw-rpg-001-moolah-storm-triangle.js]'));
check('local MOO-LAH schema persists a fixed three-slot Storm Triangle', runtime.includes("SW_RPG_STORAGE_KEY = 'severe_weather_moolah_v1'") && runtime.includes('SW_RPG_SCHEMA_VERSION = 1') && runtime.includes("['pull', 'gust', 'gridZap']") && runtime.includes('slots.length === 3'));
check('rewards are derived only from the accepted scorekeeper result', runtime.includes('swRpgAwardForAcceptedResult(scorekeeperLastResult)') && runtime.includes("source: 'accepted-scorekeeper-result'") && runtime.includes('Math.floor(score / 100)') && runtime.includes('acceptedCompletion = runActive === true'));
check('exact bounded upgrade values are declared', runtime.includes("base: 2.5, upgraded: 3.25") && runtime.includes("base: 90, upgraded: 115") && runtime.includes("base: 8, upgraded: 10") && runtime.includes('GRID_ZAP_TARGET_DAMAGE (135)'));
check('Grid Zap keeps shared utility authority while extending only the node cap', runtime.includes('const swRpgBaseSelectGridZapTopology = selectGridZapTopology;') && runtime.includes('maxNodes: Math.max') && runtime.includes('selectGridZapTopology = function swRpgSelectGridZapTopology'));
check('newspaper reward and purchase rail is additive and legible', ['MOO-LAH DESK','FILE A FINAL SCORE TO EARN MOO-LAH','swRpgPurchase-${key}','STORM TRIANGLE'].every(token => runtime.includes(token)));
check('scorekeeper reads active Storm Triangle and upgrade build metadata without becoming economy authority', scorekeeper.includes('scorekeeperActiveBuildMetadata') && scorekeeper.includes('globalThis.getSwRpgBuildMetadata?.()') && scorekeeper.includes('futureMetadata: scorekeeperActiveBuildMetadata()'));
check('RPG execution does not expand into protected movement, score, cloud, or held-back feature scope', !forbiddenScope);
check('deterministic browser hook is present without a second scoring executor', runtime.includes('getSwRpgQaState') && runtime.includes('__SW_RPG_001_QA__') && !runtime.includes('scorekeeperRecordRunForQa'));

const failed = checks.filter(entry => !entry.passed);
console.log(JSON.stringify({ task: 'SW-RPG-001', checks, passed: failed.length === 0 }, null, 2));
if (failed.length) process.exit(1);
