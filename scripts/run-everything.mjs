import { spawnSync } from 'node:child_process';
import path from 'node:path';

const SUITES = [
  'tools/asset-pipeline/model-validator.mjs',
  'scripts/verify-v500-campaign.mjs',
  'scripts/verify-v510-production-slice.mjs',
  'scripts/verify-modernization-phase2-clocks.mjs',
  'scripts/verify-modernization-phase3-input-abilities.mjs',
  'scripts/verify-modernization-phase4-scoring-campaign.mjs',
  'scripts/verify-modernization-phase5-presentation-world.mjs',
  'scripts/verify-modernization-phase6-ui.mjs',
  'scripts/verify-modernization-phase7-audio-traffic.mjs',
  'scripts/verify-modernization-phase8-engine.mjs',
  'scripts/verify-newspaper-opening.mjs',
  'scripts/verify-landmark-animations.mjs',
  'scripts/verify-shop-system.mjs',
  'scripts/verify-moolah-economy.mjs',
  'scripts/verify-master-audit.mjs',
  'scripts/verify-full-diligence-audit.mjs'
];

console.log('======================================================================');
console.log('  SEVERE WEATHER WARNING — RUNNING ALL 16 VERIFICATION SUITES');
console.log('======================================================================\n');

let passed = 0;
let failed = 0;
const failures = [];

for (const suite of SUITES) {
  const name = path.basename(suite);
  process.stdout.write(`Running ${name}... `);
  const start = Date.now();
  const res = spawnSync('agy-node', [suite], { encoding: 'utf8', shell: true });
  const duration = ((Date.now() - start) / 1000).toFixed(2);
  if (res.status === 0) {
    passed++;
    console.log(`[PASS] (${duration}s)`);
  } else {
    failed++;
    console.log(`[FAIL] (${duration}s)`);
    failures.push({ suite, output: res.stdout + '\n' + res.stderr });
  }
}

console.log('\n======================================================================');
console.log(`  FINAL RESULT: ${passed}/${SUITES.length} SUITES PASSED (${failed} FAILED)`);
console.log('======================================================================\n');

if (failed > 0) {
  for (const f of failures) {
    console.error(`\n--- FAILURE in ${f.suite} ---`);
    console.error(f.output);
  }
  process.exit(1);
} else {
  console.log('✓ 100% COMPLETE: ALL 16 VALIDATION SUITES ARE 100% GREEN.');
}
