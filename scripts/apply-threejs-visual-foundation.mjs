import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(projectRoot, 'runtime', 'threejs-visual-foundation.js');

let html = await readFile(sourcePath, 'utf8');
const runtime = (await readFile(runtimePath, 'utf8')).trim();
const marker = 'THREEJS_VISUAL_FOUNDATION_V1';
const sourceMarker = '[SW:SOURCE:threejs-visual-foundation.js]';
const insertionMarker = '// --- MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION ---';
const v510FrameHook = '  if (globalThis.__SW_V510_UPDATE__) globalThis.__SW_V510_UPDATE__(dt, now, isMoving);';
const visualFrameHook = "  if (globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.update) globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.update(dt, now);";

function requireMarker(value) {
  if (!html.includes(value)) throw new Error(`Three.js visual-foundation verification failed: missing ${value}`);
}

if (html.includes(marker)) {
  [
    '[SW:VISUAL:THREEJS_FOUNDATION]',
    sourceMarker,
    '__SW_THREEJS_VISUAL_FOUNDATION__',
    'buildLivingCountyWithVisualProductionFoundation',
    visualFrameHook,
  ].forEach(requireMarker);
  console.log(`Three.js visual foundation already applied to ${sourcePath}`);
  process.exit(0);
}

for (const prerequisite of [
  'THREEJS_ASSET_PIPELINE_V1',
  'PRESENTATION_IDENTITY_MOO_BREW_V1',
  'CITY_FABRIC_DESTRUCTION_V1',
  '[SW:SOURCE:threejs-asset-pipeline.js]',
  '__SW_THREEJS_ASSET_PIPELINE__',
  v510FrameHook,
  insertionMarker,
]) {
  if (!html.includes(prerequisite)) {
    throw new Error(`Three.js visual foundation requires sealed Stage 1 output: missing ${prerequisite}`);
  }
}

if (runtime.includes('</script>')) throw new Error('Three.js visual foundation runtime contains a closing script tag.');
for (const prohibited of [
  'target.health =',
  'target.maxHealth =',
  'target.damageStage =',
  'target.destroyed =',
  'target.points =',
  'score =',
  'combo =',
  'remainingSeconds =',
  'triggerAbility =',
]) {
  if (runtime.includes(prohibited)) throw new Error(`Visual foundation contains prohibited gameplay mutation: ${prohibited}`);
}

const newline = html.includes('\r\n') ? '\r\n' : '\n';
const bundled = `${newline}// ${sourceMarker}${newline}${runtime}${newline}${newline}`;
html = html.replace(insertionMarker, `${bundled}${insertionMarker}`);

const frameHookCount = html.split(v510FrameHook).length - 1;
if (frameHookCount !== 1) throw new Error(`Expected exactly one V510 frame hook, found ${frameHookCount}.`);
html = html.replace(v510FrameHook, `${v510FrameHook}${newline}${visualFrameHook}`);

html = html.replace('</head>', `<!-- ${marker} -->${newline}<!-- [SW:VISUAL:THREEJS_FOUNDATION] -->${newline}</head>`);
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  '[SW:VISUAL:THREEJS_FOUNDATION]',
  sourceMarker,
  '__SW_THREEJS_VISUAL_FOUNDATION__',
  'buildLivingCountyWithVisualProductionFoundation',
  'SWVisualSkyDome',
  'SWVisualStormRimLight',
  'SWVisualHartFarmDirtApron',
  'SWVisualStorefrontAsphalt',
  visualFrameHook,
]) requireMarker(required);

const assetIndex = html.indexOf('[SW:SOURCE:threejs-asset-pipeline.js]');
const visualIndex = html.indexOf(sourceMarker);
const loopIndex = html.indexOf(insertionMarker);
if (assetIndex < 0 || visualIndex < 0 || loopIndex < 0 || assetIndex > visualIndex || visualIndex > loopIndex) {
  throw new Error('Three.js visual foundation must be installed after Stage 1 asset pipeline and before first world initialization.');
}

console.log(`Applied Three.js visual production foundation to ${sourcePath}`);
