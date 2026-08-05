import { execFileSync } from 'node:child_process';
import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const historicalSourceGitPath = 'MechanicsLab/SevereWeather_3D_Lab.html';
const checks = [];

function check(name, condition, detail = '') {
  const passed = Boolean(condition);
  checks.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

async function read(...segments) {
  return readFile(path.join(projectRoot, ...segments), 'utf8');
}

const packageJson = JSON.parse(await read('package.json'));
const runtime = await read('runtime', 'modernization-phase6-performance.js');
const apply = await read('scripts', 'apply-modernization-phase6-performance.mjs');
const qa = await read('scripts', 'qa-modernization-phase6-performance.mjs');
const measure = await read('scripts', 'measure-phase6-performance.mjs');
const workflow = await read('.github', 'workflows', 'modernization-phase-6.yml');
const committedSource = execFileSync(
  'git',
  ['-C', projectRoot, 'show', `HEAD:${historicalSourceGitPath}`],
  { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
);

const patchScripts = [
  'scripts/apply-v431-source-patch.mjs',
  'scripts/apply-v440-source-patch.mjs',
  'scripts/apply-v441-source-patch.mjs',
  'scripts/apply-v442-source-patch.mjs',
  'scripts/fix-v450-parser.mjs',
  'scripts/apply-v450-source-patch.mjs',
  'scripts/apply-v450-rampage-music-patch.mjs',
  'scripts/apply-qa-corrections-patch.mjs',
  'scripts/apply-audio-mix-followup-patch.mjs',
  'scripts/apply-ui-polish-followup-patch.mjs',
  'scripts/apply-score-continuity-fix.mjs',
  'scripts/apply-qa4-deterministic-lab-patch.mjs',
  'scripts/apply-qa4-mobile-input-fix.mjs',
  'scripts/apply-qa4-run-lock-fix.mjs',
  'scripts/apply-qa4-pause-forensics.mjs',
  'scripts/apply-pause-overlay-hit-test-fix.mjs',
  'scripts/apply-pause-overlay-hard-hide.mjs',
  'scripts/apply-qa4-popup-assertion-fix.mjs',
  'scripts/apply-qa4-rampage-popup-fix.mjs',
  'scripts/apply-v500-campaign-patch.mjs',
  'scripts/apply-v500-realtime-clock-fix.mjs',
  'scripts/apply-v500-world-tour-patch.mjs',
  'scripts/apply-v500-mobile-layout-fix.mjs',
  'scripts/apply-v500-cow-signature-patch.mjs',
  'scripts/apply-v510-production-slice.mjs',
  'scripts/apply-modernization-phase2-clocks.mjs',
  'scripts/apply-phase2-player-forensics-guard.mjs',
  'scripts/apply-modernization-phase3-input-abilities.mjs',
  'scripts/apply-modernization-phase4-scoring-campaign.mjs',
  'scripts/apply-modernization-phase5-presentation-world.mjs',
  'scripts/apply-modernization-phase6-performance.mjs',
];

const tempPath = path.join(projectRoot, 'node_modules', '.phase6-integrated-verify.html');
await writeFile(tempPath, committedSource, 'utf8');
let generatedHtml = '';
try {
  for (const scriptPath of patchScripts) {
    execFileSync(process.execPath, [scriptPath], {
      cwd: projectRoot,
      env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: tempPath },
      stdio: 'pipe',
      maxBuffer: 32 * 1024 * 1024,
    });
  }
  generatedHtml = await readFile(tempPath, 'utf8');
} finally {
  await rm(tempPath, { force: true });
}

for (const marker of [
  'MODERNIZATION_PHASE6_PERFORMANCE_V2',
  '[SW:ARCH:PHASE6_PERFORMANCE_BRIDGE]',
  '[SW:SOURCE:modernization-phase6-performance.js]',
  '__SW_PHASE6_PERFORMANCE_BRIDGE__',
  'recordFrame(effectiveDt, effectiveNow)',
  "resetTransientState('clear-production-slice')",
  'phase6Pooled',
]) {
  check(`generated HTML includes ${marker}`, generatedHtml.includes(marker));
}

check('Phase 6 bridge is inserted exactly once', generatedHtml.split('[SW:SOURCE:modernization-phase6-performance.js]').length === 2);
const productionDustExecutorMatch = generatedHtml.match(
  /function spawnProductionDustBurst\([\s\S]*?\n}\n\nfunction detachProductionBarnPart/,
);
const productionDustExecutor = productionDustExecutorMatch?.[0] || '';
check('real production dust executor is uniquely locatable', Boolean(productionDustExecutorMatch));
check('real production dust executor delegates to Phase 6', productionDustExecutor.includes('__SW_PHASE6_PERFORMANCE_BRIDGE__') && productionDustExecutor.includes('spawnDustBurst'));
check('legacy production dust function no longer allocates geometry per burst', !productionDustExecutor.includes('new THREE.DodecahedronGeometry'));
check('pooled effects are released instead of disposing shared geometry', generatedHtml.includes('effect.phase6Pooled === true') && generatedHtml.includes('releaseDustEffect(effect)'));
check('accepted production update loop feeds Phase 6 telemetry', generatedHtml.includes('globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__?.recordFrame(effectiveDt, effectiveNow)'));
check('accepted production reset feeds Phase 6 cleanup', generatedHtml.includes("globalThis.__SW_PHASE6_PERFORMANCE_BRIDGE__?.resetTransientState('clear-production-slice')"));
check('input interruption resets Phase 3 authority', runtime.includes('__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.reset'));
check('no ineffective global movement writes remain', !runtime.includes('globalThis.moveX') && !runtime.includes('globalThis.moveZ'));
check('package exposes verify:process', packageJson.scripts['verify:process'] === 'node scripts/verify-implementation-truth.mjs');
check('package exposes Phase 6 commands', packageJson.scripts['patch:phase6'] && packageJson.scripts['verify:phase6'] && packageJson.scripts['qa:phase6'] && packageJson.scripts['perf:phase6']);
check('Phase 6 QA uses real hero destruction path', qa.includes("triggerProductionSliceQa('hero')"));
check('performance script compares base and candidate', measure.includes('baseline-report.json') && measure.includes('candidate-report.json') && measure.includes('comparison-report.json'));
check('workflow is single-trigger', !/^\s{2}push:/m.test(workflow));
check('workflow artifact is fail-fast', workflow.includes('if-no-files-found: error'));
check('committed historical source remains ungenerated', !committedSource.includes('MODERNIZATION_PHASE6_PERFORMANCE_V2'));
check('runtime bridge source declares V2', runtime.includes('MODERNIZATION_PHASE6_PERFORMANCE_V2'));
check('apply source declares exact executor integration', apply.includes('production dust executor integration'));

const failed = checks.filter((entry) => !entry.passed);
console.log(`\nPhase 6 integrated performance verification: ${checks.length - failed.length}/${checks.length} checks passed.`);
if (failed.length) process.exit(1);
