import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const bridgePath = path.join(projectRoot, 'runtime', 'modernization-phase5-presentation-world.js');

let html = await readFile(sourcePath, 'utf8');
const bridgeSource = (await readFile(bridgePath, 'utf8')).trim();
const marker = 'MODERNIZATION_PHASE5_PRESENTATION_WORLD_V1';

if (html.includes(marker)) {
  console.log(`Phase 5 presentation and world bridge already present in ${sourcePath}`);
  process.exit(0);
}

for (const prerequisite of [
  'MODERNIZATION_PHASE4_SCORING_CAMPAIGN_V2',
  'MODERNIZATION_PHASE3_INPUT_ABILITIES_V1',
  'MODERNIZATION_PHASE2_CLOCKS_V1',
  'V510_THREEJS_PRODUCTION_SLICE_V1'
]) {
  if (!html.includes(prerequisite)) {
    throw new Error(`Phase 5 requires the accepted Phase 4 runtime: missing ${prerequisite}`);
  }
}

const mainScriptCloseIndex = html.lastIndexOf('</script>');
const bodyCloseIndex = html.lastIndexOf('</body>');
if (mainScriptCloseIndex < 0 || bodyCloseIndex < 0 || mainScriptCloseIndex > bodyCloseIndex) {
  throw new Error('Phase 5 bridge could not locate the final game script boundary.');
}
if (bridgeSource.includes('</script>')) {
  throw new Error('Phase 5 bridge contains a closing script tag.');
}

const bundledBridge = `\n\n// [SW:SOURCE:modernization-phase5-presentation-world.js]\n${bridgeSource}\n`;
html = html.slice(0, mainScriptCloseIndex) + bundledBridge + html.slice(mainScriptCloseIndex);

for (const required of [
  marker,
  '[SW:ARCH:PHASE5_PRESENTATION_WORLD_BRIDGE]',
  '__SW_PHASE5_PRESENTATION_WORLD_BRIDGE__'
]) {
  if (!html.includes(required)) throw new Error(`Phase 5 verification failed: missing ${required}`);
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied Phase 5 rendering, world, and setpiece destruction bridge to ${sourcePath}`);
