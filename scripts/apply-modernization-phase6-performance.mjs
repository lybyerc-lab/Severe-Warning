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
const marker = 'MODERNIZATION_PHASE6_PERFORMANCE_V1';

function requireMarker(m) {
  if (!html.includes(m)) throw new Error(`Phase 6 performance verification failed: missing ${m}`);
}

const finalMarkers = [
  'MODERNIZATION_PHASE6_PERFORMANCE_V1',
  '[SW:ARCH:PHASE6_PERFORMANCE_BRIDGE]',
  '[SW:SOURCE:modernization-phase6-performance.js]',
  'phase6DebrisPool',
  'phase6QualityController',
  'getPhase6PerformanceSnapshot()',
];

if (html.includes(marker)) {
  finalMarkers.forEach(requireMarker);
  console.log(`Phase 6 performance contracts already applied to ${sourcePath}`);
  process.exit(0);
}

if (!html.includes('MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2')) {
  throw new Error('Phase 6 performance patch requires Phase 5 baseline markers before application.');
}

const mainScriptCloseIndex = html.lastIndexOf('</script>');
const bodyCloseIndex = html.lastIndexOf('</body>');
if (mainScriptCloseIndex < 0 || bodyCloseIndex < 0 || mainScriptCloseIndex > bodyCloseIndex) {
  throw new Error('Phase 6 bridge could not locate the final game script boundary.');
}

const isCrlf = html.includes('\r\n');
const newline = isCrlf ? '\r\n' : '\n';
const bundledBridge = `${newline}${newline}// [SW:SOURCE:modernization-phase6-performance.js]${newline}${bridgeSource}${newline}`;
html = html.slice(0, mainScriptCloseIndex) + bundledBridge + html.slice(mainScriptCloseIndex);

const headTag = '</head>';
const phase6HeaderMarker = '<!-- MODERNIZATION_PHASE6_PERFORMANCE_V1 -->\n<!-- [SW:ARCH:PHASE6_PERFORMANCE_BRIDGE] -->';

if (isCrlf) {
  html = html.replace(headTag, `${phase6HeaderMarker.replaceAll('\n', '\r\n')}\r\n${headTag}`);
} else {
  html = html.replace(headTag, `${phase6HeaderMarker}\n${headTag}`);
}

await writeFile(sourcePath, html, 'utf8');
finalMarkers.forEach(requireMarker);
console.log(`Applied passive Phase 6 Android performance contracts to ${sourcePath}`);
