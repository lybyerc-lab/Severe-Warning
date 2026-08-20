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

const packageJson = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'));
const gradle = await readFile(path.join(projectRoot, 'android', 'app', 'build.gradle'), 'utf8');
const html = await readFile(sourcePath, 'utf8');
const runtimeFiles = [
  'v510-foundation.js',
  'v510-tornado.js',
  'v510-world.js',
  'v510-runtime.js'
];
const runtimeText = {};
for (const file of runtimeFiles) {
  const filePath = path.join(projectRoot, 'runtime', file);
  try {
    await access(filePath);
    runtimeText[file] = await readFile(filePath, 'utf8');
    check(`runtime file ${file}`, runtimeText[file].length > 100, `${runtimeText[file].length} chars`);
  } catch (error) {
    check(`runtime file ${file}`, false, error.message);
  }
}
const runtime = Object.values(runtimeText).join('\n');

check('package version', packageJson.version === '5.1.0', packageJson.version);
check('package build label', packageJson.buildLabel === 'Three.js Production Slice', packageJson.buildLabel);
// The build-time patch chain was flattened into the gameplay source, so there is
// no patch command to verify. The markers below now assert directly against the
// committed file rather than against a script that regenerates it.
check('verify command', packageJson.scripts?.['verify:v510'] === 'node scripts/verify-v510-production-slice.mjs');
check('QA command', packageJson.scripts?.['qa:v510'] === 'node scripts/qa-v510-production-slice.mjs');
check('Android version code', gradle.includes("'510'"));
check('Android version name', gradle.includes("'5.1.0'"));

for (const marker of [
  'V510_THREEJS_PRODUCTION_SLICE_V1',
  'v510ProductionSliceStyles',
  'btnProductionQuality',
  '[SW:VISUAL:PRODUCTION_SLICE_BUNDLE]',
  '[SW:SOURCE:v510-foundation.js]',
  '[SW:SOURCE:v510-tornado.js]',
  '[SW:SOURCE:v510-world.js]',
  '[SW:SOURCE:v510-runtime.js]',
  '__SW_V510_UPDATE__',
  '__SW_V510_REBUILD__',
  'getProductionSliceQaState',
  'triggerProductionSliceQa'
]) {
  check(`HTML marker ${marker}`, html.includes(marker));
}
check('runtime is lexically bundled', !html.includes('<script src="runtime/v510-'));
check('single v5.1.0 identity', html.includes('v5.1.0') && !html.includes('v5.0.0'));
check('accepted district law preserved', html.includes('[SW:LAW:DISTRICTS-FORWARD-ONLY]'));
check('accepted Cow 17 law preserved', html.includes('[SW:LAW:SAFE-ANIMALS]'));
check('accepted QA4 preserved', html.includes('QA4_DETERMINISTIC_V1'));
check('accepted score continuity preserved', html.includes('SCORE_CONTINUITY_V1'));

for (const [file, source] of Object.entries(runtimeText)) {
  check(`bundled source ${file}`, html.includes(source.trim()), `${source.length} chars`);
}

for (const marker of [
  '[SW:VISUAL:PRODUCTION_SLICE]',
  '[SW:VISUAL:TORNADO_LAYERS]',
  '[SW:WORLD:PRODUCTION_DRESSING]',
  '[SW:WORLD:SIGNATURE_BARN]',
  '[SW:QA:PRODUCTION_SLICE]',
  'PRODUCTION_QUALITY_LEVELS',
  'ProductionMiddleVortex',
  'ProductionDarkCore',
  'HART FARM ROOF FILES A FLIGHT PLAN',
  'getProductionSliceQaState',
  'triggerProductionSliceQa',
  'productionMeasuredFps',
  'return null;'
]) {
  check(`runtime marker ${marker}`, runtime.includes(marker));
}

check('quality tiers complete', ['LOW', 'BALANCED', 'HIGH', 'SHOWCASE'].every(level => runtime.includes(level)));
check('five barn states', [0, 1, 2, 3, 4].every(stage => runtime.includes(`stage === ${stage}`) || stage === 0));
check('Cow 17 readable scale', runtime.includes('cow.mesh.scale.setScalar(1.32)'));
check('no synthetic FPS fallback', !/productionMeasuredFps\(\)\s*\|\|\s*60/.test(runtime) && !/\?\?\s*60/.test(runtime));
check('Three.js remains renderer', runtime.includes("renderer: 'Three.js r128'"));

const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
check('inline scripts found', inlineScripts.length >= 1, `${inlineScripts.length} scripts`);
inlineScripts.forEach((source, index) => {
  try {
    new Function(source);
    check(`inline script ${index + 1} syntax`, true);
  } catch (error) {
    check(`inline script ${index + 1} syntax`, false, error.message);
  }
});

const failures = checks.filter(item => !item.passed);
console.log(`\nv5.1.0 production slice verification: ${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length) {
  console.error(`Failed checks: ${failures.map(item => item.name).join(', ')}`);
  process.exitCode = 1;
}
