import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(root, 'runtime', 'sw-quality-002-visual-rescue.js');
const marker = 'SW_QUALITY_002_VISUAL_RESCUE_V1';
const sourceMarker = '[SW:SOURCE:sw-quality-002-visual-rescue.js]';

let html = await readFile(sourcePath, 'utf8');
if (html.includes(marker)) {
  if (!html.includes(sourceMarker)) throw new Error('SW-QUALITY-002 marker exists without maintained source marker.');
  console.log(`SW-QUALITY-002 already applied to ${sourcePath}`);
  process.exit(0);
}

for (const requirement of [
  'SW_QUALITY_001_OWNER_PLAYTEST_RESCUE_V1',
  'SW_LEVEL_001_STORM_SITE_FRAMEWORK_V1',
  'SW_CIN_003_PLAYABLE_OPENING_V1',
  'THREEJS_VISUAL_HERO_SLICE6_V1',
  'function startStormSiteFromMenu',
  'function quitToMainMenu()',
]) {
  if (!html.includes(requirement)) throw new Error(`SW-QUALITY-002 requires accepted Stage 2B + QUALITY-001 source: missing ${requirement}`);
}

const runtime = await readFile(runtimePath, 'utf8');
if (runtime.includes('</script>')) throw new Error('SW-QUALITY-002 runtime contains a closing script tag.');
for (const forbidden of [
  'target.health =', 'target.maxHealth =', 'target.damageStage =', 'target.destroyed =',
  'score =', 'combo =', 'currentStage =', 'selectedCampaignIndex =',
  'storm.speed =', 'storm.radius =', 'storm.pos.set(', 'storm.pos.copy(',
  'triggerAbility =', 'neonFunnelUnlocked =', 'animals.push(', 'animals.splice(',
]) {
  if (runtime.includes(forbidden)) throw new Error(`SW-QUALITY-002 contains prohibited gameplay authority write: ${forbidden}`);
}

const index = html.lastIndexOf('</script>');
if (index < 0) throw new Error('Could not locate accepted game script boundary.');
html = `${html.slice(0, index)}\n// ${sourceMarker}\n${runtime.trim()}\n${html.slice(index)}`;
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  sourceMarker,
  'SWQuality002StormVolume',
  'county-fair-after-dark',
  'gullwind-storm-coast',
  'storm-site-direct',
  'swQuality002PolishCinematicFrame',
  'getSwQuality002State',
]) {
  if (!html.includes(required)) throw new Error(`SW-QUALITY-002 apply verification failed: missing ${required}`);
}
console.log(`Applied SW-QUALITY-002 visual rescue to ${sourcePath}`);
