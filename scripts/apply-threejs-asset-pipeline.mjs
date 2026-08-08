import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(projectRoot, 'runtime', 'threejs-asset-pipeline.js');

let html = await readFile(sourcePath, 'utf8');
const runtime = (await readFile(runtimePath, 'utf8')).trim();
const marker = 'THREEJS_ASSET_PIPELINE_V1';
const insertionMarker = '// --- MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION ---';

function requireMarker(value) {
  if (!html.includes(value)) throw new Error(`Three.js asset-pipeline verification failed: missing ${value}`);
}

if (html.includes(marker)) {
  [
    '[SW:RENDER:THREEJS_ASSET_PIPELINE]',
    '__SW_THREEJS_ASSET_PIPELINE__',
    'buildLivingCountyWithAuthoredPresentation',
  ].forEach(requireMarker);
  console.log(`Three.js asset pipeline already applied to ${sourcePath}`);
  process.exit(0);
}

for (const prerequisite of [
  'PRESENTATION_IDENTITY_MOO_BREW_V1',
  'CITY_FABRIC_DESTRUCTION_V1',
  'function buildCityFabricCounty()',
  insertionMarker,
]) {
  if (!html.includes(prerequisite)) {
    throw new Error(`Three.js asset pipeline requires the accepted presentation-identity runtime: missing ${prerequisite}`);
  }
}

if (runtime.includes('</script>')) throw new Error('Three.js asset pipeline runtime contains a closing script tag.');

const newline = html.includes('\r\n') ? '\r\n' : '\n';
const bundled = `${newline}// [SW:SOURCE:threejs-asset-pipeline.js]${newline}${runtime}${newline}${newline}`;
html = html.replace(insertionMarker, `${bundled}${insertionMarker}`);
html = html.replace('</head>', `<!-- ${marker} -->${newline}<!-- [SW:RENDER:THREEJS_ASSET_PIPELINE] -->${newline}</head>`);
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  '[SW:RENDER:THREEJS_ASSET_PIPELINE]',
  '[SW:SOURCE:threejs-asset-pipeline.js]',
  '__SW_THREEJS_ASSET_PIPELINE__',
  'buildLivingCountyWithAuthoredPresentation',
]) requireMarker(required);

const pipelineIndex = html.indexOf('[SW:SOURCE:threejs-asset-pipeline.js]');
const loopIndex = html.indexOf(insertionMarker);
if (pipelineIndex < 0 || loopIndex < 0 || pipelineIndex > loopIndex) {
  throw new Error('Three.js asset pipeline must be installed before the first world initialization.');
}

console.log(`Applied guarded Three.js asset pipeline to ${sourcePath}`);
