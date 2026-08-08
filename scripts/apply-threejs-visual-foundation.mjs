import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(projectRoot, 'runtime', 'threejs-visual-foundation.js');
const heroSlice2Path = path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice2.js');

let html = await readFile(sourcePath, 'utf8');
const runtime = (await readFile(runtimePath, 'utf8')).trim();
const heroSlice2Runtime = (await readFile(heroSlice2Path, 'utf8')).trim();
const marker = 'THREEJS_VISUAL_FOUNDATION_V1';
const heroSlice2Marker = 'THREEJS_VISUAL_HERO_SLICE2_V1';
const sourceMarker = '[SW:SOURCE:threejs-visual-foundation.js]';
const heroSlice2SourceMarker = '[SW:SOURCE:threejs-visual-hero-slice2.js]';
const insertionMarker = '// --- MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION ---';
const v510FrameHook = '  if (globalThis.__SW_V510_UPDATE__) globalThis.__SW_V510_UPDATE__(dt, now, isMoving);';
const visualFrameHook = "  if (globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.update) globalThis.__SW_THREEJS_VISUAL_FOUNDATION__.update(dt, now);";
const delayedHeroRefresh = "setTimeout(() => globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.refreshHeroSlice?.(), 1800);";

function requireMarker(value) {
  if (!html.includes(value)) throw new Error(`Three.js visual-foundation verification failed: missing ${value}`);
}

function verifyRuntimeSafety(label, value) {
  if (value.includes('</script>')) throw new Error(`${label} contains a closing script tag.`);
  for (const prohibited of [
    'productionBarn',
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
    if (value.includes(prohibited)) throw new Error(`${label} contains prohibited gameplay/private authority access: ${prohibited}`);
  }
}

if (html.includes(heroSlice2Marker)) {
  [
    marker,
    '[SW:VISUAL:THREEJS_FOUNDATION]',
    '[SW:VISUAL:HERO_SLICE2]',
    sourceMarker,
    heroSlice2SourceMarker,
    '__SW_THREEJS_VISUAL_FOUNDATION__',
    'buildLivingCountyWithVisualProductionFoundation',
    'buildLivingCountyWithHeroSlice2SurfaceReset',
    visualFrameHook,
    delayedHeroRefresh,
  ].forEach(requireMarker);
  console.log(`Three.js visual foundation and Hero Slice 2 already applied to ${sourcePath}`);
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

verifyRuntimeSafety('Three.js visual foundation runtime', runtime);
verifyRuntimeSafety('Three.js Hero Slice 2 runtime', heroSlice2Runtime);

const newline = html.includes('\r\n') ? '\r\n' : '\n';
const heroSlice2Bundle = `${newline}// ${heroSlice2SourceMarker}${newline}${heroSlice2Runtime}${newline}`;
if (html.includes(marker)) {
  [sourceMarker, visualFrameHook, delayedHeroRefresh].forEach(requireMarker);
  html = html.replace(insertionMarker, `${heroSlice2Bundle}${newline}${insertionMarker}`);
  html = html.replace('</head>', `<!-- ${heroSlice2Marker} -->${newline}<!-- [SW:VISUAL:HERO_SLICE2] -->${newline}</head>`);
} else {
  const bundled = `${newline}// ${sourceMarker}${newline}${runtime}${newline}${heroSlice2Bundle}${delayedHeroRefresh}${newline}${newline}`;
  html = html.replace(insertionMarker, `${bundled}${insertionMarker}`);

  const frameHookCount = html.split(v510FrameHook).length - 1;
  if (frameHookCount !== 1) throw new Error(`Expected exactly one V510 frame hook, found ${frameHookCount}.`);
  html = html.replace(v510FrameHook, `${v510FrameHook}${newline}${visualFrameHook}`);
  html = html.replace(
    '</head>',
    `<!-- ${marker} -->${newline}<!-- [SW:VISUAL:THREEJS_FOUNDATION] -->${newline}<!-- ${heroSlice2Marker} -->${newline}<!-- [SW:VISUAL:HERO_SLICE2] -->${newline}</head>`,
  );
}

await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  heroSlice2Marker,
  '[SW:VISUAL:THREEJS_FOUNDATION]',
  '[SW:VISUAL:HERO_SLICE2]',
  sourceMarker,
  heroSlice2SourceMarker,
  '__SW_THREEJS_VISUAL_FOUNDATION__',
  'buildLivingCountyWithVisualProductionFoundation',
  'buildLivingCountyWithHeroSlice2SurfaceReset',
  'SWVisualSkyDome',
  'SWVisualStormRimLight',
  'PRAIRIE SUPPLY',
  'swVisualHeroSlice2PlaceFacadeCamera',
  visualFrameHook,
  delayedHeroRefresh,
]) requireMarker(required);

const assetIndex = html.indexOf('[SW:SOURCE:threejs-asset-pipeline.js]');
const visualIndex = html.indexOf(sourceMarker);
const heroSlice2Index = html.indexOf(heroSlice2SourceMarker);
const loopIndex = html.indexOf(insertionMarker);
if (
  assetIndex < 0 || visualIndex < 0 || heroSlice2Index < 0 || loopIndex < 0 ||
  assetIndex > visualIndex || visualIndex > heroSlice2Index || heroSlice2Index > loopIndex
) {
  throw new Error('Three.js visual layers must stay ordered after Stage 1 asset pipeline and before first world initialization.');
}

console.log(`Applied Three.js visual production foundation plus Hero Slice 2 to ${sourcePath}`);
