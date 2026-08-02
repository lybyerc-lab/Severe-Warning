import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

let html = await readFile(sourcePath, 'utf8');

function replaceExact(before, after, label) {
  const count = html.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  html = html.replace(before, after);
}

replaceExact(
  `function qa4ExercisePopup() {
  const beforeCount = getCachedEl('rampageFeedbackLayer')?.childElementCount || 0;
  spawnScorePopup(storm.pos.x, terrainHeightAt(storm.pos.x, storm.pos.z) + 8, storm.pos.z, '+321', '#fbbf24');
  const afterCount = getCachedEl('rampageFeedbackLayer')?.childElementCount || 0;
  qa4SetCheck('popup', afterCount > beforeCount, 'children=' + beforeCount + '->' + afterCount);
}`,
  `function qa4ExercisePopup() {
  // QA4_POPUP_ASSERTION_V2: score popups are THREE.Sprite objects, not DOM children.
  const beforeCount = activeScorePopups.length;
  spawnScorePopup(storm.pos.x, terrainHeightAt(storm.pos.x, storm.pos.z) + 8, storm.pos.z, '+321', '#fbbf24');
  const afterCount = activeScorePopups.length;
  const latestPopup = activeScorePopups[afterCount - 1] || null;
  const sceneAttached = Boolean(latestPopup?.sprite && latestPopup.sprite.parent === scene);
  const alive = Boolean(latestPopup && latestPopup.life > 0);
  qa4SetCheck(
    'popup',
    afterCount > beforeCount && sceneAttached && alive,
    'activeScorePopups=' + beforeCount + '->' + afterCount + ' sceneAttached=' + sceneAttached + ' alive=' + alive
  );
}`,
  'QA4 popup assertion'
);

for (const marker of [
  'QA4_POPUP_ASSERTION_V2',
  'const beforeCount = activeScorePopups.length',
  'latestPopup.sprite.parent === scene',
  "'activeScorePopups=' + beforeCount + '->' + afterCount"
]) {
  if (!html.includes(marker)) throw new Error(`QA4 popup assertion verification failed: missing ${marker}`);
}

if (html.includes("getCachedEl('rampageFeedbackLayer')?.childElementCount")) {
  throw new Error('QA4 popup assertion verification failed: stale DOM-child assertion remains');
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied QA4 3D popup assertion fix to ${sourcePath}`);
