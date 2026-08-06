import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(projectRoot, 'runtime', 'city-fabric-destruction.js');

let html = await readFile(sourcePath, 'utf8');
const runtime = (await readFile(runtimePath, 'utf8')).trim();
const marker = 'CITY_FABRIC_DESTRUCTION_V1';
const insertionMarker = '// --- MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION ---';

function requireMarker(value) {
  if (!html.includes(value)) throw new Error(`City fabric verification failed: missing ${value}`);
}

if (html.includes(marker)) {
  [
    '[SW:WORLD:CITY_FABRIC_PASS]',
    '__SW_CITY_FABRIC_BRIDGE__',
    'buildCityFabricCounty',
    'cityFabricCreateTreeMesh',
  ].forEach(requireMarker);
  console.log(`City fabric destruction pass already applied to ${sourcePath}`);
  process.exit(0);
}

for (const prerequisite of [
  'MODERNIZATION_PHASE6_PERFORMANCE_V2',
  'function buildLivingCounty()',
  'function createTreeMesh(variant = 0)',
  insertionMarker,
]) {
  if (!html.includes(prerequisite)) {
    throw new Error(`City fabric pass requires the accepted Phase 6 runtime: missing ${prerequisite}`);
  }
}
if (runtime.includes('</script>')) throw new Error('City fabric runtime contains a closing script tag.');

const newline = html.includes('\r\n') ? '\r\n' : '\n';
const bundled = `${newline}// [SW:SOURCE:city-fabric-destruction.js]${newline}${runtime}${newline}${newline}`;
html = html.replace(insertionMarker, `${bundled}${insertionMarker}`);
html = html.replace('</head>', `<!-- ${marker} -->${newline}<!-- [SW:WORLD:CITY_FABRIC_PASS] -->${newline}</head>`);
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  '[SW:WORLD:CITY_FABRIC_PASS]',
  '[SW:SOURCE:city-fabric-destruction.js]',
  '__SW_CITY_FABRIC_BRIDGE__',
  'buildCityFabricCounty',
  'cityFabricCreateTreeMesh',
]) requireMarker(required);

const bridgeIndex = html.indexOf('[SW:SOURCE:city-fabric-destruction.js]');
const loopIndex = html.indexOf(insertionMarker);
if (bridgeIndex < 0 || loopIndex < 0 || bridgeIndex > loopIndex) {
  throw new Error('City fabric runtime must be installed before the first world initialization.');
}
console.log(`Applied campaign-specific city fabric destruction pass to ${sourcePath}`);
