import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) throw new Error(`Prototype candidate build step failed: ${command} ${args.join(' ')}`);
}

console.log('PROTOTYPE ONLY - NOT PRODUCTION QA :: building one exact Three.js candidate without baseline, full QA, performance, Android, or publisher packaging.');
run('node', ['scripts/vendor-threejs-hero-slice4-assets.mjs']);
run('pnpm', ['run', 'audio:generate']);
for (const script of [
  'patch:v431', 'patch:v440', 'patch:v441', 'patch:v442', 'patch:v450',
  'patch:v500', 'verify:v500', 'patch:v510', 'verify:v510',
  'patch:phase2', 'verify:phase2', 'patch:phase3', 'verify:phase3',
  'patch:phase4', 'verify:phase4', 'patch:phase5', 'verify:phase5',
  'patch:phase6', 'verify:phase6', 'patch:city-fabric', 'verify:city-fabric',
  'patch:presentation-identity', 'verify:presentation-identity',
  'patch:asset-pipeline', 'verify:asset-pipeline', 'patch:visual-foundation', 'verify:visual-foundation',
]) run('pnpm', ['run', script]);
for (const script of [
  'scripts/apply-threejs-hero-slice4.mjs', 'scripts/verify-threejs-hero-slice4.mjs',
  'scripts/apply-threejs-hero-slice5.mjs', 'scripts/verify-threejs-hero-slice5.mjs',
  'scripts/apply-threejs-hero-slice6.mjs', 'scripts/verify-threejs-hero-slice6.mjs',
]) run('node', [script]);
run('pnpm', ['run', 'modern:build']);
run('node', ['scripts/build-web.mjs']);
