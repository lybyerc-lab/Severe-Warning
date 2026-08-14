import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(root, 'runtime', 'sw-quality-002-storm-frame-bridge.js');
const marker = 'SW_QUALITY_002_STORM_FRAME_BRIDGE_V1';
const sourceMarker = '[SW:SOURCE:sw-quality-002-storm-frame-bridge.js]';

let html = await readFile(sourcePath, 'utf8');
if (html.includes(marker)) {
  if (!html.includes(sourceMarker)) throw new Error('QUALITY-002 storm frame bridge marker exists without source marker.');
  console.log(`QUALITY-002 storm frame bridge already applied to ${sourcePath}`);
  process.exit(0);
}
for (const requirement of ['SW_QUALITY_002_VISUAL_RESCUE_V1', 'swQuality002UpdateStormVolume', 'renderer.render']) {
  if (!html.includes(requirement)) throw new Error(`QUALITY-002 storm frame bridge requires ${requirement}`);
}
const runtime = await readFile(runtimePath, 'utf8');
if (runtime.includes('</script>')) throw new Error('Storm frame bridge contains closing script tag.');
for (const forbidden of ['target.health =', 'score =', 'combo =', 'storm.pos.set(', 'triggerAbility =']) {
  if (runtime.includes(forbidden)) throw new Error(`Storm frame bridge contains prohibited authority write: ${forbidden}`);
}
const index = html.lastIndexOf('</script>');
if (index < 0) throw new Error('Could not locate accepted game script boundary.');
html = `${html.slice(0, index)}\n// ${sourceMarker}\n${runtime.trim()}\n${html.slice(index)}`;
await writeFile(sourcePath, html, 'utf8');
if (!html.includes(marker) || !html.includes(sourceMarker)) throw new Error('Storm frame bridge append verification failed.');
console.log(`Applied QUALITY-002 storm frame bridge to ${sourcePath}`);
