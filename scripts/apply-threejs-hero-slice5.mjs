import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice5.js');
const guardPath = path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice5-animation-guard.js');

let html = await readFile(sourcePath, 'utf8');
const runtime = (await readFile(runtimePath, 'utf8')).trim();
const guard = (await readFile(guardPath, 'utf8')).trim();
const marker = 'THREEJS_VISUAL_HERO_SLICE5_V1';
const sourceMarker = '[SW:SOURCE:threejs-visual-hero-slice5.js]';
const guardSourceMarker = '[SW:SOURCE:threejs-visual-hero-slice5-animation-guard.js]';
const insertionMarker = '// --- MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION ---';

function requireMarker(value) {
  if (!html.includes(value)) throw new Error(`Hero Slice 5 patch verification failed: missing ${value}`);
}

function verifyRuntimeSafety(value) {
  if (value.includes('</script>')) throw new Error('Hero Slice 5 runtime contains a closing script tag.');
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
    'animals.push(',
    'animals.splice(',
    'animals.pop(',
    'animals.shift(',
    'animals.unshift(',
    'storm.pos.set(',
    'storm.pos.copy(',
    'storm.pos.add(',
    'storm.pos.sub(',
  ]) {
    if (value.includes(prohibited)) throw new Error(`Hero Slice 5 contains prohibited gameplay authority access: ${prohibited}`);
  }
}

if (html.includes(marker)) {
  [
    sourceMarker,
    guardSourceMarker,
    '[SW:VISUAL:HERO_SLICE5]',
    '[SW:VISUAL:HERO_SLICE5:ANIMATION_GUARD]',
    'buildLivingCountyWithHeroSlice5FunReset',
    'swVisualHeroSlice5UpdateRainbow',
    'swVisualHeroSlice5UpdateCowLevelGuarded',
    'SWVisualHeroSlice5CowLevel',
  ].forEach(requireMarker);
  console.log(`Hero Slice 5 already applied to ${sourcePath}`);
  process.exit(0);
}

for (const prerequisite of [
  'THREEJS_VISUAL_FOUNDATION_V1',
  'THREEJS_VISUAL_HERO_SLICE4_V1',
  '[SW:SOURCE:threejs-visual-hero-slice4.js]',
  '__SW_THREEJS_VISUAL_FOUNDATION__',
  insertionMarker,
]) {
  if (!html.includes(prerequisite)) throw new Error(`Hero Slice 5 requires the sealed Hero Slice 4 output: missing ${prerequisite}`);
}

verifyRuntimeSafety(`${runtime}\n${guard}`);
const newline = html.includes('\r\n') ? '\r\n' : '\n';
const bundle = [
  '',
  `// ${sourceMarker}`,
  runtime,
  '',
  `// ${guardSourceMarker}`,
  guard,
  '',
].join(newline);
html = html.replace(insertionMarker, `${bundle}${newline}${insertionMarker}`);
html = html.replace(
  '</head>',
  `<!-- ${marker} -->${newline}<!-- [SW:VISUAL:HERO_SLICE5] -->${newline}</head>`,
);
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  '[SW:VISUAL:HERO_SLICE5]',
  '[SW:VISUAL:HERO_SLICE5:ANIMATION_GUARD]',
  sourceMarker,
  guardSourceMarker,
  'buildLivingCountyWithHeroSlice5FunReset',
  'swVisualHeroSlice5UpdateRainbow',
  'swVisualHeroSlice5UpdateCowLevelGuarded',
  'SWVisualHeroSlice5RainbowFunnel',
  'SWVisualHeroSlice5CowLevel',
  'MOO LEVEL',
]) requireMarker(required);

const slice4Index = html.indexOf('[SW:SOURCE:threejs-visual-hero-slice4.js]');
const slice5Index = html.indexOf(sourceMarker);
const guardIndex = html.indexOf(guardSourceMarker);
const loopIndex = html.indexOf(insertionMarker);
if (slice4Index < 0 || slice5Index < 0 || guardIndex < 0 || loopIndex < 0 || slice4Index > slice5Index || slice5Index > guardIndex || guardIndex > loopIndex) {
  throw new Error('Hero Slice 5 must remain ordered after Hero Slice 4, then its animation guard, then the main animation loop.');
}

console.log(`Applied Three.js Hero Slice 5 rainbow funnel + cow level to ${sourcePath}`);
