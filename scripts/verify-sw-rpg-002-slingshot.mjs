import { readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const temporary = path.join(root, '.sw-rpg-002-verify.html');
const patches = [
  'apply-v431-source-patch.mjs','apply-v440-source-patch.mjs','apply-v441-source-patch.mjs','apply-v442-source-patch.mjs','fix-v450-parser.mjs','apply-v450-source-patch.mjs','apply-v450-rampage-music-patch.mjs','apply-qa-corrections-patch.mjs','apply-audio-mix-followup-patch.mjs','apply-ui-polish-followup-patch.mjs','apply-score-continuity-fix.mjs','apply-qa4-deterministic-lab-patch.mjs','apply-qa4-mobile-input-fix.mjs','apply-qa4-run-lock-fix.mjs','apply-qa4-pause-forensics.mjs','apply-pause-overlay-hit-test-fix.mjs','apply-pause-overlay-hard-hide.mjs','apply-qa4-popup-assertion-fix.mjs','apply-v500-campaign-patch.mjs','apply-v500-realtime-clock-fix.mjs','apply-v500-world-tour-patch.mjs','apply-v500-mobile-layout-fix.mjs','apply-v500-cow-signature-patch.mjs','apply-v510-production-slice.mjs','apply-sw-game-002-moo-level.mjs','apply-sw-ui-001-newspaper-presentation.mjs','apply-sw-score-001-persistent-scorekeeper.mjs','apply-sw-rpg-001-moolah-storm-triangle.mjs','apply-sw-rpg-002-slingshot.mjs'
];
const checks = [];
const check = (name, passed, detail = '') => { checks.push({ name, passed: Boolean(passed), detail }); console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`); };
const apply = script => execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: temporary }, stdio: 'pipe' });
await writeFile(temporary, await readFile(source, 'utf8'), 'utf8');
let generated = '';
try { patches.forEach(apply); generated = await readFile(temporary, 'utf8'); } finally { await rm(temporary, { force: true }); }
const runtime = await readFile(path.join(root, 'runtime', 'sw-rpg-002-slingshot.js'), 'utf8');
const executionRuntime = runtime.split('globalThis.__SW_RPG_002_QA__')[0];
const forbidden = /twin tornado|waterspout|satellite|account|online|leaderboard|storm\.speed\s*=|moveX\s*=|moveZ\s*=|cooldowns\.[a-z]+\.max\s*=|function addScore|addScore\s*=/i.test(executionRuntime);
check('bundles after accepted RPG-001 and scorekeeper executor chain', generated.indexOf('[SW:SOURCE:sw-rpg-001-moolah-storm-triangle.js]') < generated.indexOf('[SW:SOURCE:sw-rpg-002-slingshot.js]'));
check('Pull capture observes a real accepted target instead of a marker body', /targets\s*\.filter\(swSlingshotEligible\)/.test(runtime) && runtime.includes('activePullVortex') && runtime.includes('SW_SLINGSHOT_HOLD_RADIUS'));
check('Gust launch is cooldown-gated and uses player/storm physical aim', runtime.includes("Number(cooldowns?.secondary?.current) <= 0") && runtime.includes('swSlingshotAim') && runtime.includes("source: 'player-storm-aim-and-state'"));
check('launch and impact use bounded physical debris bodies', runtime.includes('SW_SLINGSHOT_MAX_BODIES') && runtime.includes('body.vy -= 26 * dt') && runtime.includes('swSlingshotImpact(body, hit)'));
check('light and heavy material stay differentiated by mass', runtime.includes('150 / Math.sqrt(mass)') && runtime.includes('impactValue = Math.round(body.mass * Math.hypot(body.vx, body.vz))'));
check('telemetry flows through existing scorekeeper build metadata seam only', runtime.includes('getSwRpgBuildMetadata') && runtime.includes("version: 'slingshot-v1'") && !executionRuntime.includes('scorekeeperRecordRunForQa'));
check('protected movement scoring abilities UI and held-back scope are untouched', !forbidden);
check('deterministic browser hook exposes observation/reset only', runtime.includes('getSwSlingshotQaState') && runtime.includes('__SW_RPG_002_QA__') && !runtime.includes('runScenario'));
const failed = checks.filter(entry => !entry.passed);
console.log(JSON.stringify({ task: 'SW-RPG-002', checks, passed: failed.length === 0 }, null, 2));
if (failed.length) process.exit(1);
