import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice6.js');
const guardPath = path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice6-stability-guard.js');

let html = await readFile(sourcePath, 'utf8');
const runtime = (await readFile(runtimePath, 'utf8')).trim();
const guard = (await readFile(guardPath, 'utf8')).trim();
const marker = 'THREEJS_VISUAL_HERO_SLICE6_V1';
const sourceMarker = '[SW:SOURCE:threejs-visual-hero-slice6.js]';
const guardSourceMarker = '[SW:SOURCE:threejs-visual-hero-slice6-stability-guard.js]';
const insertionMarker = '// --- MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION ---';

function requireMarker(value) {
  if (!html.includes(value)) throw new Error(`Hero Slice 6 patch verification failed: missing ${value}`);
}

function verifyRuntimeSafety(value) {
  if (value.includes('</script>')) throw new Error('Hero Slice 6 runtime contains a closing script tag.');
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
    'currentStage =',
    'selectedCampaignIndex =',
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
    if (value.includes(prohibited)) throw new Error(`Hero Slice 6 contains prohibited gameplay authority access: ${prohibited}`);
  }
  const neonSelectionWrite = /\bneonFunnelUnlocked\s*(?:\+\+|--|[+\-*/]?=(?!=))/;
  if (neonSelectionWrite.test(value)) {
    throw new Error('Hero Slice 6 may read the existing Neon menu state but may not assign neonFunnelUnlocked.');
  }
}

if (html.includes(marker)) {
  [
    sourceMarker,
    guardSourceMarker,
    '[SW:VISUAL:HERO_SLICE6]',
    '[SW:VISUAL:HERO_SLICE6:STABILITY_GUARD]',
    'buildLivingCountyWithHeroSlice6IdentityReset',
    'swVisualHeroSlice6UpdateStorm',
    'swVisualHeroSlice6BuildWorldIdentity',
    'swVisualHeroSlice6TuneInheritedStormStable',
    'SWVisualHeroSlice6StormSilhouette',
    'SWVisualHeroSlice6WorldIdentity',
  ].forEach(requireMarker);
  console.log(`Hero Slice 6 already applied to ${sourcePath}`);
  process.exit(0);
}

for (const prerequisite of [
  'THREEJS_VISUAL_FOUNDATION_V1',
  'THREEJS_VISUAL_HERO_SLICE4_V1',
  'THREEJS_VISUAL_HERO_SLICE5_V1',
  'THREEJS_VISUAL_HERO_SLICE5_NEON_GATE_V1',
  'THREEJS_VISUAL_HERO_SLICE5_POLISH_V1',
  '[SW:SOURCE:threejs-visual-hero-slice5-polish.js]',
  '__SW_THREEJS_VISUAL_FOUNDATION__',
  insertionMarker,
]) {
  if (!html.includes(prerequisite)) throw new Error(`Hero Slice 6 requires the sealed Hero Slice 5 output: missing ${prerequisite}`);
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
  `<!-- ${marker} -->${newline}<!-- [SW:VISUAL:HERO_SLICE6] -->${newline}<!-- [SW:VISUAL:HERO_SLICE6:STABILITY_GUARD] -->${newline}</head>`,
);
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  '[SW:VISUAL:HERO_SLICE6]',
  '[SW:VISUAL:HERO_SLICE6:STABILITY_GUARD]',
  sourceMarker,
  guardSourceMarker,
  'buildLivingCountyWithHeroSlice6IdentityReset',
  'swVisualHeroSlice6UpdateStorm',
  'swVisualHeroSlice6BuildWorldIdentity',
  'swVisualHeroSlice6PrepareQaView',
  'swVisualHeroSlice6TuneInheritedStormStable',
  'SWVisualHeroSlice6StormSilhouette',
  'SWVisualHeroSlice6WorldIdentity',
]) requireMarker(required);

const slice5PolishIndex = html.indexOf('[SW:SOURCE:threejs-visual-hero-slice5-polish.js]');
const slice6Index = html.indexOf(sourceMarker);
const guardIndex = html.indexOf(guardSourceMarker);
const loopIndex = html.indexOf(insertionMarker);
if (
  slice5PolishIndex < 0 || slice6Index < 0 || guardIndex < 0 || loopIndex < 0
  || slice5PolishIndex > slice6Index || slice6Index > guardIndex || guardIndex > loopIndex
) {
  throw new Error('Hero Slice 6 must remain ordered after Hero Slice 5 polish, then its stability guard, then the main animation loop.');
}

console.log(`Applied Three.js Hero Slice 6 world identity + storm silhouette to ${sourcePath}`);
