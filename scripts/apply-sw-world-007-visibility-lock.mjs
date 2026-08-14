import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(root, 'runtime', 'sw-world-007-visibility-lock.js');
const marker = 'SW_WORLD_007_VISIBILITY_LOCK_V1';
const sourceMarker = '[SW:SOURCE:sw-world-007-visibility-lock.js]';

let html = await readFile(sourcePath, 'utf8');
if (html.includes(marker)) {
  if (!html.includes(sourceMarker)) throw new Error('WORLD-007 visibility marker exists without maintained source marker.');
  console.log(`WORLD-007 visibility lock already applied to ${sourcePath}`);
  process.exit(0);
}
for (const requirement of [
  'SW_WORLD_007_SECONDARY_STORM_FORMS_V1',
  'SW_WORLD_007_ATMOSPHERIC_CORRECTION_V1',
  'SW_QUALITY_002_VISUAL_RESCUE_V1',
]) {
  if (!html.includes(requirement)) throw new Error(`WORLD-007 visibility lock missing required source marker: ${requirement}`);
}
const runtime = await readFile(runtimePath, 'utf8');
if (runtime.includes('</script>')) throw new Error('WORLD-007 visibility runtime contains closing script tag.');
for (const forbidden of [
  'target.health =', 'target.destroyed =', 'score =', 'combo =',
  'storm.speed =', 'storm.radius =', 'storm.pos.set(', 'triggerAbility =',
]) {
  if (runtime.includes(forbidden)) throw new Error(`WORLD-007 visibility lock contains prohibited authority write: ${forbidden}`);
}
const index = html.lastIndexOf('</script>');
if (index < 0) throw new Error('Could not locate game script boundary.');
html = `${html.slice(0, index)}\n// ${sourceMarker}\n${runtime.trim()}\n${html.slice(index)}`;
await writeFile(sourcePath, html, 'utf8');
for (const required of [marker, sourceMarker, 'getSwWorld007VisibilityLockState']) {
  if (!html.includes(required)) throw new Error(`WORLD-007 visibility apply verification failed: missing ${required}`);
}
console.log(`Applied WORLD-007 visibility lock to ${sourcePath}`);
