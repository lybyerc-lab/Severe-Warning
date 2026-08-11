import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(root, 'runtime', 'sw-game-002-moo-level.js');
const marker = 'SW_GAME_002_MOO_LEVEL_V1';
let html = await readFile(sourcePath, 'utf8');
if (html.includes(marker)) {
  if (!html.includes('[SW:SOURCE:sw-game-002-moo-level.js]')) throw new Error('Moo Level marker exists without maintained runtime source marker.');
  console.log(`SW-GAME-002 already applied to ${sourcePath}`);
  process.exit(0);
}
if (!html.includes('V510_THREEJS_PRODUCTION_SLICE_V1') || !html.includes('__SW_V510_UPDATE__')) {
  throw new Error('SW-GAME-002 requires the accepted V5.1 production runtime before bundling.');
}
const runtime = await readFile(runtimePath, 'utf8');
if (runtime.includes('</script>')) throw new Error('Moo Level runtime contains a closing script tag.');
const index = html.lastIndexOf('</script>');
if (index < 0) throw new Error('Could not locate accepted game script boundary.');
html = `${html.slice(0, index)}\n// [SW:SOURCE:sw-game-002-moo-level.js]\n${runtime.trim()}\n${html.slice(index)}`;
await writeFile(sourcePath, html, 'utf8');
console.log(`Applied SW-GAME-002 Moo Level runtime to ${sourcePath}`);
