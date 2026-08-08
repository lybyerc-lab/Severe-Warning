import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice4.js');

let html = await readFile(sourcePath, 'utf8');
const runtime = (await readFile(runtimePath, 'utf8')).trim();
const marker = 'THREEJS_VISUAL_HERO_SLICE4_V1';
const sourceMarker = '[SW:SOURCE:threejs-visual-hero-slice4.js]';
const insertionMarker = '// --- MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION ---';

function requireMarker(value) {
  if (!html.includes(value)) throw new Error(`Hero Slice 4 patch verification failed: missing ${value}`);
}

function verifyRuntimeSafety(value) {
  if (value.includes('</script>')) throw new Error('Hero Slice 4 runtime contains a closing script tag.');
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
    'storm.pos.set(',
    'storm.pos.copy(',
    'storm.pos.add(',
    'storm.pos.sub(',
  ]) {
    if (value.includes(prohibited)) throw new Error(`Hero Slice 4 contains prohibited gameplay authority access: ${prohibited}`);
  }
}

if (html.includes(marker)) {
  [
    sourceMarker,
    '[SW:VISUAL:HERO_SLICE4]',
    'buildLivingCountyWithHeroSlice4CohesionReset',
    'swVisualHeroSlice4UpdateStormVolume',
  ].forEach(requireMarker);
  console.log(`Hero Slice 4 already applied to ${sourcePath}`);
  process.exit(0);
}

for (const prerequisite of [
  'THREEJS_VISUAL_FOUNDATION_V1',
  'THREEJS_VISUAL_HERO_SLICE2_V1',
  'THREEJS_VISUAL_HERO_SLICE3_V1',
  '[SW:SOURCE:threejs-visual-hero-slice3.js]',
  '__SW_THREEJS_VISUAL_FOUNDATION__',
  insertionMarker,
]) {
  if (!html.includes(prerequisite)) throw new Error(`Hero Slice 4 requires the sealed Run #5 visual output: missing ${prerequisite}`);
}

verifyRuntimeSafety(runtime);
const newline = html.includes('\r\n') ? '\r\n' : '\n';
const bundle = `${newline}// ${sourceMarker}${newline}${runtime}${newline}`;
html = html.replace(insertionMarker, `${bundle}${newline}${insertionMarker}`);
html = html.replace(
  '</head>',
  `<!-- ${marker} -->${newline}<!-- [SW:VISUAL:HERO_SLICE4] -->${newline}</head>`,
);
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  '[SW:VISUAL:HERO_SLICE4]',
  sourceMarker,
  'buildLivingCountyWithHeroSlice4CohesionReset',
  'swVisualHeroSlice4UpdateStormVolume',
  'SWVisualHeroSlice4StormVolume',
  './assets/production/vfx/kenney/dirt_01.png',
  './assets/production/vfx/kenney/smoke_03.png',
  './assets/production/vfx/kenney/trace_03.png',
]) requireMarker(required);

const slice3Index = html.indexOf('[SW:SOURCE:threejs-visual-hero-slice3.js]');
const slice4Index = html.indexOf(sourceMarker);
const loopIndex = html.indexOf(insertionMarker);
if (slice3Index < 0 || slice4Index < 0 || loopIndex < 0 || slice3Index > slice4Index || slice4Index > loopIndex) {
  throw new Error('Hero Slice 4 must remain ordered after Hero Slice 3 and before the main animation loop.');
}

console.log(`Applied Three.js Hero Slice 4 world cohesion + storm volume to ${sourcePath}`);
