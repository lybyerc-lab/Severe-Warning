import { execSync, execFileSync } from 'node:child_process';
import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const historicalSourceGitPath = 'MechanicsLab/SevereWeather_3D_Lab.html';
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, historicalSourceGitPath);

const phase5BaseSha = process.env.SEVERE_WEATHER_PHASE5_BASE_SHA || '182f916807f3195dfe0546775a1fff7dc8c64aaa';
const html = await readFile(sourcePath, 'utf8');
const checks = [];

function check(name, condition, detail = '') {
  const passed = Boolean(condition);
  checks.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

async function read(...segments) {
  return readFile(path.join(projectRoot, ...segments), 'utf8');
}

const bridge = await read('runtime', 'modernization-phase6-performance.js');
const apply = await read('scripts', 'apply-modernization-phase6-performance.mjs');
const qualityContracts = await read('src', 'platform', 'quality', 'adaptive-quality-contracts.ts');
const qualityController = await read('src', 'platform', 'quality', 'adaptive-quality-controller.ts');
const debrisContracts = await read('src', 'world', 'debris', 'debris-pool-contracts.ts');
const debrisPool = await read('src', 'world', 'debris', 'debris-pool-manager.ts');
const touchGuard = await read('src', 'input', 'touch-lifecycle-guard.ts');
const perfContracts = await read('src', 'qa', 'performance', 'phase6-performance-contracts.ts');
const perfCollector = await read('src', 'qa', 'performance', 'phase6-performance-collector.ts');
const packageJson = JSON.parse(await read('package.json'));

let generatedHtml = html;
if (!generatedHtml.includes('MODERNIZATION_PHASE6_PERFORMANCE_V1')) {
  const patchScriptPaths = [
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
  const tempPath = path.join(projectRoot, 'node_modules', '.phase6-temp-verify.html');
  await writeFile(tempPath, html, 'utf8');
  try {
    for (const scriptPath of patchScriptPaths) {
      execSync(`"${process.execPath}" ${scriptPath}`, {
        cwd: projectRoot,
        env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: tempPath },
        stdio: 'pipe',
      });
    }
    generatedHtml = await readFile(tempPath, 'utf8');
  } finally {
    await rm(tempPath, { force: true });
  }
}

for (const marker of [
  'MODERNIZATION_PHASE6_PERFORMANCE_V1',
  '[SW:ARCH:PHASE6_PERFORMANCE_BRIDGE]',
  '[SW:SOURCE:modernization-phase6-performance.js]',
  'phase6DebrisPool',
  'phase6QualityController',
  'getPhase6PerformanceSnapshot()',
]) {
  check(`generated HTML marker ${marker}`, generatedHtml.includes(marker));
}

check('Phase 6 bridge inserted exactly once', generatedHtml.split('[SW:SOURCE:modernization-phase6-performance.js]').length === 2);

function readCommittedSource(repoPath, revision = 'HEAD') {
  return execFileSync('git', ['-C', repoPath, 'show', `${revision}:${historicalSourceGitPath}`], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
}

try {
  const committedSource = readCommittedSource(projectRoot);
  let baseSource;
  try {
    baseSource = readCommittedSource(projectRoot, phase5BaseSha);
  } catch {
    baseSource = readCommittedSource(projectRoot, 'cd89b5ececa6e95848961d625f84eaa7bc7f72c7');
  }
  const clean = committedSource === baseSource;
  check(
    'committed historical source MechanicsLab/SevereWeather_3D_Lab.html remains clean',
    clean,
    clean ? 'matches accepted base source' : 'historical source diff detected'
  );
} catch (error) {
  check(
    'committed historical source MechanicsLab/SevereWeather_3D_Lab.html remains clean',
    false,
    `unable to compare committed source: ${error.message}`
  );
}

// Check package.json scripts
check('package exposes patch:phase6', packageJson.scripts['patch:phase6'] === 'node scripts/apply-modernization-phase6-performance.mjs');
check('package exposes verify:phase6', packageJson.scripts['verify:phase6'] === 'node scripts/verify-modernization-phase6-performance.mjs');
check('package exposes qa:phase6', packageJson.scripts['qa:phase6'] === 'node scripts/qa-modernization-phase6-performance.mjs');
check('package exposes perf:phase6', packageJson.scripts['perf:phase6'] === 'node scripts/measure-phase6-performance.mjs');

// Quality & pool contracts assertions
check('quality contracts define ULTRA, HIGH, BALANCED, PERFORMANCE, ECO', qualityContracts.includes("QualityTier = 'ULTRA' | 'HIGH' | 'BALANCED' | 'PERFORMANCE' | 'ECO'"));
check('debris pool contracts define capacity & high water mark', debrisContracts.includes('highWaterMark: number'));
check('touch guard handles window blur and visibility change', touchGuard.includes("window.addEventListener('blur'") && touchGuard.includes('visibilitychange'));
check('performance contracts define frame time median & p95', perfContracts.includes('frameTimeMedianMs: number') && perfContracts.includes('frameTimeP95Ms: number'));

const failedCount = checks.filter((c) => !c.passed).length;
console.log(`\nPhase 6 Android performance verification: ${checks.length - failedCount}/${checks.length} checks passed.`);
if (failedCount > 0) {
  process.exit(1);
}
