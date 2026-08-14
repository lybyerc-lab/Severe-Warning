import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(root, 'runtime', 'sw-level-001-storm-site-framework.js');
const marker = 'SW_LEVEL_001_STORM_SITE_FRAMEWORK_V1';
let html = await readFile(sourcePath, 'utf8');
if (html.includes(marker)) {
  if (!html.includes('[SW:SOURCE:sw-level-001-storm-site-framework.js]')) throw new Error('Storm Site marker exists without maintained runtime source marker.');
  console.log(`SW-LEVEL-001 already applied to ${sourcePath}`);
  process.exit(0);
}
if (!html.includes('SW_GAME_002_MOO_LEVEL_V1') || !html.includes('globalThis.__SW_V510_UPDATE__')) {
  throw new Error('SW-LEVEL-001 requires the accepted Moo Level and V5.1 executor seams before bundling.');
}
const runtime = await readFile(runtimePath, 'utf8');
if (runtime.includes('</script>')) throw new Error('Storm Site runtime contains a closing script tag.');
const index = html.lastIndexOf('</script>');
if (index < 0) throw new Error('Could not locate accepted game script boundary.');
html = `${html.slice(0, index)}\n// [SW:SOURCE:sw-level-001-storm-site-framework.js]\n${runtime.trim()}\n${html.slice(index)}`;
await writeFile(sourcePath, html, 'utf8');
console.log(`Applied SW-LEVEL-001 Storm Site runtime to ${sourcePath}`);
