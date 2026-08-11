import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH) : path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(root, 'runtime', 'sw-score-001-persistent-scorekeeper.js');
const marker = 'SW_SCORE_001_PERSISTENT_SCOREKEEPER_V1';
let html = await readFile(sourcePath, 'utf8');
if (html.includes(marker)) {
  if (!html.includes('[SW:SOURCE:sw-score-001-persistent-scorekeeper.js]')) throw new Error('SW-SCORE-001 marker exists without maintained source marker.');
  console.log(`SW-SCORE-001 already applied to ${sourcePath}`); process.exit(0);
}
for (const requirement of ['SW_GAME_002_MOO_LEVEL_V1', 'SW_UI_001_NEWSPAPER_PRESENTATION_V1', 'getMooLevelQaState', 'getNewspaperPresentationQaState']) {
  if (!html.includes(requirement)) throw new Error(`SW-SCORE-001 requires the accepted GAME-002 and UI-001 executor chain: missing ${requirement}`);
}
const runtime = await readFile(runtimePath, 'utf8');
if (runtime.includes('</script>')) throw new Error('SW-SCORE-001 runtime contains a closing script tag.');
const index = html.lastIndexOf('</script>');
if (index < 0) throw new Error('Could not locate the accepted game script boundary.');
html = `${html.slice(0, index)}\n// [SW:SOURCE:sw-score-001-persistent-scorekeeper.js]\n${runtime.trim()}\n${html.slice(index)}`;
await writeFile(sourcePath, html, 'utf8');
console.log(`Applied SW-SCORE-001 persistent scorekeeper to ${sourcePath}`);
