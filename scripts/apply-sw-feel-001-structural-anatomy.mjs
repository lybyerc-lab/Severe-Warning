import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(root, 'runtime', 'sw-feel-001-structural-anatomy.js');
const marker = 'SW_FEEL_001_STRUCTURAL_ANATOMY_V1';
const sourceMarker = '[SW:SOURCE:sw-feel-001-structural-anatomy.js]';

let html = await readFile(sourcePath, 'utf8');
if (html.includes(marker)) {
  if (!html.includes(sourceMarker)) throw new Error('SW-FEEL-001 anatomy marker exists without maintained source marker.');
  console.log(`SW-FEEL-001 structural anatomy already applied to ${sourcePath}`);
  process.exit(0);
}

for (const requirement of [
  'SW_FEEL_001_DESTRUCTION_CONSEQUENCE_V1',
  'SW_QUALITY_002_VISUAL_RESCUE_V1',
  'function swFeel001PresentDestruction',
  'function swFeel001SpawnDebrisFragment',
]) {
  if (!html.includes(requirement)) throw new Error(`SW-FEEL-001 structural anatomy requires accepted FEEL/QUALITY source: missing ${requirement}`);
}

const runtime = await readFile(runtimePath, 'utf8');
if (runtime.includes('</script>')) throw new Error('SW-FEEL-001 structural anatomy runtime contains a closing script tag.');
for (const forbidden of [
  'target.health =', 'target.maxHealth =', 'target.damageStage =', 'target.destroyed =',
  'score =', 'combo =', 'currentStage =', 'selectedCampaignIndex =',
  'storm.speed =', 'storm.radius =', 'storm.pos.set(', 'storm.pos.copy(',
  'triggerAbility =', 'neonFunnelUnlocked =', 'animals.push(', 'animals.splice(',
]) {
  if (runtime.includes(forbidden)) throw new Error(`SW-FEEL-001 structural anatomy contains prohibited gameplay authority write: ${forbidden}`);
}

const index = html.lastIndexOf('</script>');
if (index < 0) throw new Error('Could not locate accepted game script boundary.');
html = `${html.slice(0, index)}\n// ${sourceMarker}\n${runtime.trim()}\n${html.slice(index)}`;
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  sourceMarker,
  'swFeel001PresentStructuralAnatomy',
  'getSwFeel001StructuralAnatomyState',
]) {
  if (!html.includes(required)) throw new Error(`SW-FEEL-001 structural anatomy apply verification failed: missing ${required}`);
}
console.log(`Applied SW-FEEL-001 structural anatomy to ${sourcePath}`);
