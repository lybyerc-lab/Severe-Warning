import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

let html = await readFile(sourcePath, 'utf8');

function countMatches(needle) {
  return html.split(needle).length - 1;
}

function replaceExact(before, after, label) {
  const count = countMatches(before);
  if (count !== 1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  html = html.replace(before, after);
}

function replaceAllExact(before, after, expectedCount, label) {
  const count = countMatches(before);
  if (count !== expectedCount) throw new Error(`${label}: expected ${expectedCount} source matches, found ${count}`);
  html = html.split(before).join(after);
}

replaceExact(
  `function spawnRampageBanner(tier) {`,
  `// QA4_RAMPAGE_LAYER_LOOKUP_V1: patched IDs may not exist in the static element cache.\nfunction getRampageFeedbackLayer() {\n  const cached = typeof getCachedEl === 'function' ? getCachedEl('rampageFeedbackLayer') : null;\n  return cached || document.getElementById('rampageFeedbackLayer');\n}\n\nfunction spawnRampageBanner(tier) {`,
  'rampage layer resolver'
);

replaceAllExact(
  `  const layer = getCachedEl('rampageFeedbackLayer');`,
  `  const layer = getRampageFeedbackLayer();`,
  3,
  'rampage layer call sites'
);

replaceExact(
  `function qa4ExercisePopup() {\n  // QA4_POPUP_ASSERTION_V2: score popups are THREE.Sprite objects, not DOM children.\n  const beforeCount = activeScorePopups.length;\n  spawnScorePopup(storm.pos.x, terrainHeightAt(storm.pos.x, storm.pos.z) + 8, storm.pos.z, '+321', '#fbbf24');\n  const afterCount = activeScorePopups.length;\n  const latestPopup = activeScorePopups[afterCount - 1] || null;\n  const sceneAttached = Boolean(latestPopup?.sprite && latestPopup.sprite.parent === scene);\n  const alive = Boolean(latestPopup && latestPopup.life > 0);\n  qa4SetCheck(\n    'popup',\n    afterCount > beforeCount && sceneAttached && alive,\n    'activeScorePopups=' + beforeCount + '->' + afterCount + ' sceneAttached=' + sceneAttached + ' alive=' + alive\n  );\n}`,
  `function qa4ExercisePopup() {\n  // QA4_POPUP_ASSERTION_V4: exercise the real 90 ms batching queue, then inspect its DOM output.\n  const layer = getRampageFeedbackLayer();\n  clearRampageFeedback();\n  const beforeCount = layer ? layer.querySelectorAll('.rampage-popup').length : 0;\n  spawnScorePopup(storm.pos.x, terrainHeightAt(storm.pos.x, storm.pos.z) + 8, storm.pos.z, '+321', '#fbbf24');\n  const queuedHits = pendingRampageHits.length;\n  if (rampagePopupFlushTimer) {\n    window.clearTimeout(rampagePopupFlushTimer);\n    rampagePopupFlushTimer = 0;\n  }\n  flushRampageHudPopups();\n  const popups = layer ? Array.from(layer.querySelectorAll('.rampage-popup')) : [];\n  const afterCount = popups.length;\n  const latestPopup = popups[afterCount - 1] || null;\n  const connected = Boolean(latestPopup?.isConnected && latestPopup.parentElement === layer);\n  const text = latestPopup?.textContent || '';\n  const correctContent = text.includes('DEMOLISHED!') && text.includes('+321');\n  qa4SetCheck(\n    'popup',\n    Boolean(layer) && queuedHits === 1 && afterCount > beforeCount && connected && correctContent,\n    'layerFound=' + Boolean(layer) + ' queuedHits=' + queuedHits + ' rampagePopups=' + beforeCount + '->' + afterCount + ' connected=' + connected + ' text=' + JSON.stringify(text)\n  );\n}`,
  'QA4 batched DOM popup assertion'
);

for (const marker of [
  'QA4_RAMPAGE_LAYER_LOOKUP_V1',
  'function getRampageFeedbackLayer()',
  "document.getElementById('rampageFeedbackLayer')",
  'QA4_POPUP_ASSERTION_V4',
  'const queuedHits = pendingRampageHits.length',
  'flushRampageHudPopups();',
  "querySelectorAll('.rampage-popup')",
  "text.includes('DEMOLISHED!')"
]) {
  if (!html.includes(marker)) throw new Error(`QA4 rampage popup verification failed: missing ${marker}`);
}

for (const staleMarker of ['QA4_POPUP_ASSERTION_V2', 'QA4_POPUP_ASSERTION_V3']) {
  if (html.includes(staleMarker)) throw new Error(`QA4 rampage popup verification failed: stale marker remains: ${staleMarker}`);
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied QA4 rampage popup lookup and batched assertion fix to ${sourcePath}`);
