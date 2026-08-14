import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(root, 'runtime', 'sw-quality-001-owner-playtest-rescue.js');
const marker = 'SW_QUALITY_001_OWNER_PLAYTEST_RESCUE_V1';

let html = await readFile(sourcePath, 'utf8');
if (html.includes(marker)) {
  if (!html.includes('[SW:SOURCE:sw-quality-001-owner-playtest-rescue.js]')) {
    throw new Error('SW-QUALITY-001 marker exists without maintained source marker.');
  }
  console.log(`SW-QUALITY-001 already applied to ${sourcePath}`);
  process.exit(0);
}

for (const requirement of [
  'SW_UI_002_LANDSCAPE_UNLEASH_V1',
  'THREEJS_VISUAL_HERO_SLICE6_V1',
  'function quitToMainMenu()',
  'SW_LEVEL_001_STORM_SITE_FRAMEWORK_V1'
]) {
  if (!html.includes(requirement)) throw new Error(`SW-QUALITY-001 requires canonical Stage 2B source: missing ${requirement}`);
}

const runtime = await readFile(runtimePath, 'utf8');
if (runtime.includes('</script>')) throw new Error('SW-QUALITY-001 runtime contains a closing script tag.');
const index = html.lastIndexOf('</script>');
if (index < 0) throw new Error('Could not locate accepted game script boundary.');
html = `${html.slice(0, index)}\n// [SW:SOURCE:sw-quality-001-owner-playtest-rescue.js]\n${runtime.trim()}\n${html.slice(index)}`;
await writeFile(sourcePath, html, 'utf8');
console.log(`Applied SW-QUALITY-001 owner playtest rescue to ${sourcePath}`);
