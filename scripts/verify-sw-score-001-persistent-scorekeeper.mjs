import { readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const temporary = path.join(root, '.sw-score-001-verify.html');
const checks = [];
const patches = [
  'apply-v431-source-patch.mjs','apply-v440-source-patch.mjs','apply-v441-source-patch.mjs','apply-v442-source-patch.mjs',
  'fix-v450-parser.mjs','apply-v450-source-patch.mjs','apply-v450-rampage-music-patch.mjs','apply-qa-corrections-patch.mjs',
  'apply-audio-mix-followup-patch.mjs','apply-ui-polish-followup-patch.mjs','apply-score-continuity-fix.mjs','apply-qa4-deterministic-lab-patch.mjs',
  'apply-qa4-mobile-input-fix.mjs','apply-qa4-run-lock-fix.mjs','apply-qa4-pause-forensics.mjs','apply-pause-overlay-hit-test-fix.mjs',
  'apply-pause-overlay-hard-hide.mjs','apply-qa4-popup-assertion-fix.mjs','apply-v500-campaign-patch.mjs','apply-v500-realtime-clock-fix.mjs',
  'apply-v500-world-tour-patch.mjs','apply-v500-mobile-layout-fix.mjs','apply-v500-cow-signature-patch.mjs','apply-v510-production-slice.mjs',
  'apply-sw-game-002-moo-level.mjs','apply-sw-ui-001-newspaper-presentation.mjs','apply-sw-score-001-persistent-scorekeeper.mjs'
];
const check = (name, passed, detail = '') => { checks.push({ name, passed: Boolean(passed), detail }); console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`); };
const apply = (script) => execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: temporary }, stdio: 'pipe' });

await writeFile(temporary, await readFile(source, 'utf8'), 'utf8');
let generated = '';
try { patches.forEach(apply); generated = await readFile(temporary, 'utf8'); } finally { await rm(temporary, { force: true }); }
const runtime = await readFile(path.join(root, 'runtime', 'sw-score-001-persistent-scorekeeper.js'), 'utf8');
const executionRuntime = runtime.split('// Deterministic browser fixtures')[0];
const protectedObserverWrites = ['addScore =', 'startRunFromMenu =', 'resetWarningRun =', 'selectCampaignLevel =', 'storm.speed =']
  .filter(token => executionRuntime.includes(token));
const protectedStateWrites = [...executionRuntime.matchAll(/(?:^|\n)\s*(?:destructionScore|currentStorm)\s*=/gm)].map(match => match[0].trim());

check('scorekeeper bundles after the real Moo and newspaper executor chain', generated.indexOf('[SW:SOURCE:sw-game-002-moo-level.js]') < generated.indexOf('[SW:SOURCE:sw-ui-001-newspaper-presentation.js]') && generated.indexOf('[SW:SOURCE:sw-ui-001-newspaper-presentation.js]') < generated.indexOf('[SW:SOURCE:sw-score-001-persistent-scorekeeper.js]'));
check('local-first store is schema and scoring-version partitioned', runtime.includes("SCOREKEEPER_STORAGE_KEY = 'severe_weather_scorekeeper_v1'") && runtime.includes('SCOREKEEPER_SCHEMA_VERSION = 1') && runtime.includes("SCOREKEEPER_SCORING_VERSION = 'legacy-score-rules-v5.1.0'") && runtime.includes('bucketEntry.versions'));
check('records retain site mode variant rank medal and absurd-stat seams', ['siteId','variant','bestRank','bestMedal','grid','chains','cows','airtime','sponsors'].every(token => runtime.includes(token)));
check('future Storm Triangle and upgrade metadata is reserved without authority', runtime.includes('stormTriangleVersion') && runtime.includes('upgradeLoadoutVersion') && runtime.includes("authority: 'reserved-not-active'"));
check('finalized real result executor is observed after upstream finishRun', runtime.includes('const scorekeeperBaseFinishRun = finishRun;') && runtime.includes('finishRun = function scorekeeperObservedFinishRun') && runtime.includes('scorekeeperBaseFinishRun.apply') && runtime.includes('scorekeeperRecordRun(scorekeeperLiveRun())'));
check('newspaper gets PB previous margin milestone records version and replay context', ['NEW PERSONAL BEST','PREVIOUS / MARGIN','NEXT MILESTONE','NOTABLE RECORDS','SCORE RULES','REPLAY NOW'].every(token => runtime.includes(token)));
check('scorekeeper production observer does not retune protected game authority', protectedObserverWrites.length === 0 && protectedStateWrites.length === 0, [...protectedObserverWrites, ...protectedStateWrites].join(', '));
check('forbidden progression and cloud scope is absent', !/MOO-LAH|purchase|waterspout|leaderboard|account|cloud/i.test(executionRuntime));
check('scorekeeper QA fixture exercises the final executor instead of a marker-only result write', runtime.includes('__SW_SCOREKEEPER_QA__') && runtime.includes('finishRun();') && !runtime.includes('setUI(\'resScore\'') && !runtime.includes('scorekeeperRecordRunForQa'));

const failed = checks.filter(entry => !entry.passed);
console.log(JSON.stringify({ task: 'SW-SCORE-001', checks, passed: failed.length === 0 }, null, 2));
if (failed.length) process.exit(1);
