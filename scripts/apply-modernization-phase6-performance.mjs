import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const bridgePath = path.join(projectRoot, 'runtime', 'modernization-phase6-performance.js');

let html = await readFile(sourcePath, 'utf8');
const bridgeSource = (await readFile(bridgePath, 'utf8')).trim();
const marker = 'MODERNIZATION_PHASE6_PERFORMANCE_V2';

function requireMarker(value) {
  if (!html.includes(value)) throw new Error(`Phase 6 performance verification failed: missing ${value}`);
}

if (html.includes(marker)) {
  [
    '[SW:ARCH:PHASE6_PERFORMANCE_BRIDGE]',
    '__SW_PHASE6_PERFORMANCE_BRIDGE__',
    'phase6PooledProductionDustBurst',
    'phase6MeasuredProductionUpdate',
    'phase6BoundedProductionClear',
    'phase6AwareDisposeProductionObject',
  ].forEach(requireMarker);
  console.log(`Phase 6 performance contracts already applied to ${sourcePath}`);
  process.exit(0);
}

if (html.includes('MODERNIZATION_PHASE6_PERFORMANCE_V1')) {
  throw new Error('Stale Phase 6 V1 generated output detected. Rebuild from the clean historical source.');
}

for (const prerequisite of [
  'MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2',
  '[SW:SOURCE:v510-foundation.js]',
  '[SW:SOURCE:v510-world.js]',
  '[SW:SOURCE:v510-runtime.js]',
  'function spawnProductionDustBurst(',
  'function updateProductionSlice(dt, now, isMoving)',
  'function clearProductionSlice()',
  'function disposeProductionObject(root)',
]) {
  if (!html.includes(prerequisite)) {
    throw new Error(`Phase 6 requires the accepted Phase 5 runtime: missing ${prerequisite}`);
  }
}

const mainScriptCloseIndex = html.lastIndexOf('</script>');
const bodyCloseIndex = html.lastIndexOf('</body>');
if (mainScriptCloseIndex < 0 || bodyCloseIndex < 0 || mainScriptCloseIndex > bodyCloseIndex) {
  throw new Error('Phase 6 bridge could not locate the final game script boundary.');
}
if (bridgeSource.includes('</script>')) {
  throw new Error('Phase 6 bridge contains a closing script tag.');
}

const newline = html.includes('\r\n') ? '\r\n' : '\n';
const bundledBridge = `${newline}${newline}// [SW:SOURCE:modernization-phase6-performance.js]${newline}${bridgeSource}${newline}`;
html = html.slice(0, mainScriptCloseIndex) + bundledBridge + html.slice(mainScriptCloseIndex);

const headTag = '</head>';
const headerMarker = '<!-- MODERNIZATION_PHASE6_PERFORMANCE_V2 -->\n<!-- [SW:ARCH:PHASE6_PERFORMANCE_BRIDGE] -->';
html = html.replace(headTag, `${headerMarker.replaceAll('\n', newline)}${newline}${headTag}`);

await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  '[SW:ARCH:PHASE6_PERFORMANCE_BRIDGE]',
  '[SW:SOURCE:modernization-phase6-performance.js]',
  '__SW_PHASE6_PERFORMANCE_BRIDGE__',
  'phase6PooledProductionDustBurst',
  'phase6MeasuredProductionUpdate',
  'phase6BoundedProductionClear',
  'phase6AwareDisposeProductionObject',
  'phase6ResetLiveInput',
]) {
  requireMarker(required);
}

console.log(`Applied wrapper-integrated Phase 6 Android performance contracts to ${sourcePath}`);
