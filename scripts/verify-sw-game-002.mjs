import { readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const temporary = path.join(root, '.sw-game-002-verify.html');
const checks = [];
const patchScripts = [
  'apply-v431-source-patch.mjs', 'apply-v440-source-patch.mjs', 'apply-v441-source-patch.mjs', 'apply-v442-source-patch.mjs',
  'fix-v450-parser.mjs', 'apply-v450-source-patch.mjs', 'apply-v450-rampage-music-patch.mjs', 'apply-qa-corrections-patch.mjs',
  'apply-audio-mix-followup-patch.mjs', 'apply-ui-polish-followup-patch.mjs', 'apply-score-continuity-fix.mjs', 'apply-qa4-deterministic-lab-patch.mjs',
  'apply-qa4-mobile-input-fix.mjs', 'apply-qa4-run-lock-fix.mjs', 'apply-qa4-pause-forensics.mjs', 'apply-pause-overlay-hit-test-fix.mjs',
  'apply-pause-overlay-hard-hide.mjs', 'apply-qa4-popup-assertion-fix.mjs', 'apply-v500-campaign-patch.mjs', 'apply-v500-realtime-clock-fix.mjs',
  'apply-v500-world-tour-patch.mjs', 'apply-v500-mobile-layout-fix.mjs', 'apply-v500-cow-signature-patch.mjs',
  'apply-v510-production-slice.mjs', 'apply-sw-game-002-moo-level.mjs'
];
function check(name, passed, detail = '') { checks.push({ name, passed: Boolean(passed), detail }); console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`); }
function apply(script) { execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: temporary }, stdio: 'pipe' }); }

await writeFile(temporary, await readFile(source, 'utf8'), 'utf8');
let generated = '';
try {
  patchScripts.forEach(apply);
  generated = await readFile(temporary, 'utf8');
} finally { await rm(temporary, { force: true }); }

check('Moo Level runtime is bundled into the accepted executor', generated.includes('[SW:SOURCE:sw-game-002-moo-level.js]') && generated.includes('SW_GAME_002_MOO_LEVEL_V1'));
check('Hart Farm encounter has exact bounded contract', generated.includes('duration: 25') && generated.includes('relocated: 6') && generated.includes('airtime: 10'));
check('unlock persists local-first mooLevelUnlocked state', generated.includes("MOO_LEVEL_STORAGE_KEY = 'severe_weather_moo_level_v1'") && generated.includes('mooLevelUnlocked: true') && generated.includes('saveMooLevelProgress()'));
check('Moo Level node is locked then available from the menu', generated.includes('menuCardMooLevel') && generated.includes('MOO LEVEL: LOCKED') && generated.includes('startMooLevelFromMenu'));
check('dedicated fair score attack has the specified objective counts', generated.includes('relocated: 20') && generated.includes('airtime: 45') && generated.includes('props: 10') && generated.includes('duration: 90'));
check('dedicated run has bounded high cow population and sponsor props', generated.includes('index < 28') && generated.includes("mooSponsorProps.slice(0, 10)"));
check('Cow safety is explicit and no cow damage target is registered', generated.includes('mooLevelSafeAnimal = true') && generated.includes('allMooCowsSafe') && !generated.includes('targets.push(cow)'));
check('real production executor invokes Moo runtime telemetry', generated.includes('globalThis.__SW_V510_UPDATE__ = function mooExecutorUpdate') && generated.includes('mooRuntimeTicks++'));
check('normal campaign paths preserve base functions behind guarded wrappers', generated.includes("mooLevelMode !== 'moo' || !mooRun") && generated.includes('mooBaseFinishRun.apply') && generated.includes('mooBaseAddScore'));
check('protected abilities are not retuned by Moo runtime', !/cooldowns\.[a-z]+\.max\s*=|storm\.speed\s*=|GRID_ZAP|activePullVortex\s*=/.test((await readFile(path.join(root, 'runtime', 'sw-game-002-moo-level.js'), 'utf8'))));

const failed = checks.filter((entry) => !entry.passed);
console.log(JSON.stringify({ task: 'SW-GAME-002', checks, passed: failed.length === 0 }, null, 2));
if (failed.length) process.exit(1);
