import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(root, 'runtime', 'sw-world-007-secondary-storm-forms.js');
const marker = 'SW_WORLD_007_SECONDARY_STORM_FORMS_V1';
const sourceMarker = '[SW:SOURCE:sw-world-007-secondary-storm-forms.js]';

let html = await readFile(sourcePath, 'utf8');
if (html.includes(marker)) {
  if (!html.includes(sourceMarker)) throw new Error('SW-WORLD-007 marker exists without maintained source marker.');
  console.log(`SW-WORLD-007 already applied to ${sourcePath}`);
  process.exit(0);
}

for (const requirement of [
  'SW_QUALITY_002_VISUAL_RESCUE_V1',
  'SW_QUALITY_001_OWNER_PLAYTEST_RESCUE_V1',
  'SW_LEVEL_001_STORM_SITE_FRAMEWORK_V1',
  'THREEJS_VISUAL_HERO_SLICE6_V1',
  'function selectStormClass',
]) {
  if (!html.includes(requirement)) throw new Error(`SW-WORLD-007 requires accepted Stage 2B + QUALITY-002 source: missing ${requirement}`);
}

const runtime = await readFile(runtimePath, 'utf8');
if (runtime.includes('</script>')) throw new Error('SW-WORLD-007 runtime contains a closing script tag.');
for (const forbidden of [
  'target.health =', 'target.maxHealth =', 'target.damageStage =', 'target.destroyed =',
  'score =', 'combo =', 'currentStage =', 'selectedCampaignIndex =',
  'storm.speed =', 'storm.radius =', 'storm.pos.set(', 'storm.pos.copy(',
  'triggerAbility =', 'neonFunnelUnlocked =', 'animals.push(', 'animals.splice(',
  'funnelMesh.geometry =', 'outerFunnelMesh.geometry =',
]) {
  if (runtime.includes(forbidden)) throw new Error(`SW-WORLD-007 contains prohibited gameplay authority write: ${forbidden}`);
}

const index = html.lastIndexOf('</script>');
if (index < 0) throw new Error('Could not locate accepted game script boundary.');
html = `${html.slice(0, index)}\n// ${sourceMarker}\n${runtime.trim()}\n${html.slice(index)}`;
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  sourceMarker,
  'SWWorld007SupercellPresentationRoot',
  'SWWorld007DerechoPresentationRoot',
  'SWWorld007SupercellAnvilGroup',
  'SWWorld007SupercellMammatus',
  'SWWorld007DerechoShelfArcGroup',
  'SWWorld007DerechoMicroburstStreaks',
  'getSwWorld007State',
]) {
  if (!html.includes(required)) throw new Error(`SW-WORLD-007 apply verification failed: missing ${required}`);
}
console.log(`Applied SW-WORLD-007 secondary storm forms to ${sourcePath}`);
