import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(root, 'runtime', 'sw-feel-001-structural-priority.js');
const marker = 'SW_FEEL_001_STRUCTURAL_PRIORITY_V1';
const sourceMarker = '[SW:SOURCE:sw-feel-001-structural-priority.js]';

let html = await readFile(sourcePath, 'utf8');
if (html.includes(marker)) {
  if (!html.includes(sourceMarker)) throw new Error('FEEL-001 structural-priority marker exists without maintained source marker.');
  process.exit(0);
}
for (const requirement of ['SW_FEEL_001_DESTRUCTION_CONSEQUENCE_V1', 'SW_FEEL_001_STRUCTURAL_ANATOMY_V1']) {
  if (!html.includes(requirement)) throw new Error(`FEEL-001 structural priority missing required source marker: ${requirement}`);
}
const runtime = await readFile(runtimePath, 'utf8');
for (const forbidden of ['target.health =','target.destroyed =','score =','combo =','storm.speed =','storm.radius =','triggerAbility =']) {
  if (runtime.includes(forbidden)) throw new Error(`FEEL-001 structural priority contains prohibited authority write: ${forbidden}`);
}
const index = html.lastIndexOf('</script>');
if (index < 0) throw new Error('Could not locate game script boundary.');
html = `${html.slice(0, index)}\n// ${sourceMarker}\n${runtime.trim()}\n${html.slice(index)}`;
await writeFile(sourcePath, html, 'utf8');
console.log(`Applied FEEL-001 structural priority to ${sourcePath}`);
