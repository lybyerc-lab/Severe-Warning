import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

const requiredFiles = [
  'src/core/clocks.ts',
  'runtime/modernization-phase2-clocks.js',
];
for (const file of requiredFiles) {
  try {
    await access(path.join(projectRoot, file));
    check(`file ${file}`, true);
  } catch (error) {
    check(`file ${file}`, false, error.message);
  }
}

const html = await readFile(sourcePath, 'utf8');
const clocks = await readFile(path.join(projectRoot, 'src', 'core', 'clocks.ts'), 'utf8');
const adapter = await readFile(path.join(projectRoot, 'src', 'legacy', 'legacy-runtime-adapter.ts'), 'utf8');
const app = await readFile(path.join(projectRoot, 'src', 'app', 'game-app.ts'), 'utf8');

for (const marker of [
  'MODERNIZATION_PHASE2_CLOCKS_V1',
  '[SW:ARCH:PHASE2_CLOCK_BRIDGE]',
  '[SW:SOURCE:modernization-phase2-clocks.js]',
  'modernClockSample.runDeltaMs / 1000',
  '__SW_PHASE2_CLOCK_BRIDGE__?.reset',
  '__SW_PHASE2_CLOCK_BRIDGE__?.resume',
  'PHASE2_PLAYER_FORENSICS_GUARD_V1',
  'function qa4ForensicUiEnabled()',
  "dataset.swQaForensics = qa4ForensicUiEnabled() ? 'visible' : 'silent'",
]) check(`HTML marker ${marker}`, html.includes(marker));

check('legacy raw clock removed', !html.includes('const rawRunClockDelta'));
check('accepted timer law preserved', html.includes('if (runActive && !isPaused)'));
check('simulation delta remains capped', html.includes('const realDelta = Math.min(0.1'));
check('clock authority class', clocks.includes('export class GameClocks'));
check('separate time domains', ['renderTimeMs', 'simulationTimeMs', 'runClockTimeMs'].every(marker => clocks.includes(marker)));
check('pause contract probe', clocks.includes('pauseChargesZero'));
check('resume contract probe', clocks.includes('resumeTransitionChargesZero'));
check('suspension contract probe', clocks.includes('suspensionChargesZero'));
check('legacy adapter attaches clocks', adapter.includes('attachClocks(clocks: GameClocks)'));
check('lifecycle follows run clock', app.includes('syncRunState(runState: RunClockState)'));
check('player trace capture remains silent', html.includes('if (qa4ForensicUiEnabled())') && html.includes('if (trace) trace.hidden = true'));
check('defensive render guard present', html.includes('if (!qa4ForensicUiEnabled())'));

const failures = checks.filter(item => !item.passed);
console.log(`\nPhase 2 clock verification: ${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length > 0) {
  console.error(`Failed checks: ${failures.map(item => item.name).join(', ')}`);
  process.exitCode = 1;
}
