import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice6.js');
const guardPath = path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice6-stability-guard.js');
const roadLawPath = path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice6-road-law.js');
const townPolishPath = path.join(projectRoot, 'runtime', 'threejs-visual-hero-slice6-town-polish.js');
const cinematicApplyPath = path.join(projectRoot, 'scripts', 'apply-threejs-opening-cinematic.mjs');

let html = await readFile(sourcePath, 'utf8');
const runtime = (await readFile(runtimePath, 'utf8')).trim();
const guard = (await readFile(guardPath, 'utf8')).trim();
const roadLaw = (await readFile(roadLawPath, 'utf8')).trim();
const townPolish = (await readFile(townPolishPath, 'utf8')).trim();
const marker = 'THREEJS_VISUAL_HERO_SLICE6_V1';
const roadLawMarker = 'THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_V1';
const townPolishMarker = 'THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_V1';
const cinematicMarker = 'SW_CIN_003_PLAYABLE_OPENING_V1';
const sourceMarker = '[SW:SOURCE:threejs-visual-hero-slice6.js]';
const guardSourceMarker = '[SW:SOURCE:threejs-visual-hero-slice6-stability-guard.js]';
const roadLawSourceMarker = '[SW:SOURCE:threejs-visual-hero-slice6-road-law.js]';
const townPolishSourceMarker = '[SW:SOURCE:threejs-visual-hero-slice6-town-polish.js]';
const insertionMarker = '// --- MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION ---';

function requireMarker(value) {
  if (!html.includes(value)) throw new Error(`Hero Slice 6 patch verification failed: missing ${value}`);
}

async function applyOptionalPlayableOpening() {
  try {
    await access(cinematicApplyPath);
  } catch (_) {
    return false;
  }
  const current = await readFile(sourcePath, 'utf8');
  if (current.includes(cinematicMarker)) return true;
  await import('./apply-threejs-opening-cinematic.mjs');
  const updated = await readFile(sourcePath, 'utf8');
  if (!updated.includes(cinematicMarker)) throw new Error('Playable opening integration script ran but the CIN-003 marker is missing.');
  return true;
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
    roadLawSourceMarker,
    townPolishSourceMarker,
    '[SW:VISUAL:HERO_SLICE6]',
    '[SW:VISUAL:HERO_SLICE6:STABILITY_GUARD]',
    '[SW:VISUAL:HERO_SLICE6:ROAD_LAW]',
    '[SW:VISUAL:HERO_SLICE6:TOWN_POLISH]',
    roadLawMarker,
    townPolishMarker,
    'buildLivingCountyWithHeroSlice6IdentityReset',
    'swVisualHeroSlice6UpdateStorm',
    'swVisualHeroSlice6BuildRoadFirstWorldIdentity',
    'swVisualHeroSlice6TuneInheritedStormStable',
    'swVisualHeroSlice6RoadLawBuildStreetBoundaries',
    'swVisualHeroSlice6RoadLawApplyParcelCompliance',
    'swVisualHeroSlice6TownPolishStyleMainStreet',
    'swVisualHeroSlice6TownPolishStyleWaterTower',
    'SWVisualHeroSlice6StormSilhouette',
    'SWVisualHeroSlice6WorldIdentity',
    'SWVisualSlice6WaterTowerStandpipe',
    'SWVisualSlice6MainStreetGable',
  ].forEach(requireMarker);
  const cinematicApplied = await applyOptionalPlayableOpening();
  console.log(`Hero Slice 6 already applied to ${sourcePath}${cinematicApplied ? '; playable opening present' : ''}`);
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

verifyRuntimeSafety(`${runtime}\n${guard}\n${roadLaw}\n${townPolish}`);
const newline = html.includes('\r\n') ? '\r\n' : '\n';
const bundle = [
  '',
  `// ${sourceMarker}`,
  runtime,
  '',
  `// ${guardSourceMarker}`,
  guard,
  '',
  `// ${roadLawSourceMarker}`,
  roadLaw,
  '',
  `// ${townPolishSourceMarker}`,
  townPolish,
  '',
].join(newline);
html = html.replace(insertionMarker, `${bundle}${newline}${insertionMarker}`);
html = html.replace(
  '</head>',
  `<!-- ${marker} -->${newline}<!-- [SW:VISUAL:HERO_SLICE6] -->${newline}<!-- [SW:VISUAL:HERO_SLICE6:STABILITY_GUARD] -->${newline}<!-- ${roadLawMarker} -->${newline}<!-- [SW:VISUAL:HERO_SLICE6:ROAD_LAW] -->${newline}<!-- ${townPolishMarker} -->${newline}<!-- [SW:VISUAL:HERO_SLICE6:TOWN_POLISH] -->${newline}</head>`,
);
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  roadLawMarker,
  townPolishMarker,
  '[SW:VISUAL:HERO_SLICE6]',
  '[SW:VISUAL:HERO_SLICE6:STABILITY_GUARD]',
  '[SW:VISUAL:HERO_SLICE6:ROAD_LAW]',
  '[SW:VISUAL:HERO_SLICE6:TOWN_POLISH]',
  sourceMarker,
  guardSourceMarker,
  roadLawSourceMarker,
  townPolishSourceMarker,
  'buildLivingCountyWithHeroSlice6IdentityReset',
  'swVisualHeroSlice6UpdateStorm',
  'swVisualHeroSlice6PrepareQaViewRoadLaw',
  'swVisualHeroSlice6TuneInheritedStormStable',
  'swVisualHeroSlice6RoadLawBuildStreetBoundaries',
  'swVisualHeroSlice6RoadLawApplyParcelCompliance',
  'swVisualHeroSlice6BuildRoadSafeFarmEdge',
  'swVisualHeroSlice6TownPolishStyleMainStreet',
  'swVisualHeroSlice6TownPolishStyleWaterTower',
  'SWVisualSlice6RoadLawSidewalkBatch',
  'SWVisualSlice6RoadLawCurbBatch',
  'SWVisualSlice6WaterTowerStandpipe',
  'SWVisualSlice6MainStreetGable',
  'SWVisualHeroSlice6StormSilhouette',
  'SWVisualHeroSlice6WorldIdentity',
]) requireMarker(required);

const slice5PolishIndex = html.indexOf('[SW:SOURCE:threejs-visual-hero-slice5-polish.js]');
const slice6Index = html.indexOf(sourceMarker);
const guardIndex = html.indexOf(guardSourceMarker);
const roadLawIndex = html.indexOf(roadLawSourceMarker);
const townPolishIndex = html.indexOf(townPolishSourceMarker);
const loopIndex = html.indexOf(insertionMarker);
if (
  slice5PolishIndex < 0 || slice6Index < 0 || guardIndex < 0 || roadLawIndex < 0 || townPolishIndex < 0 || loopIndex < 0
  || slice5PolishIndex > slice6Index
  || slice6Index > guardIndex
  || guardIndex > roadLawIndex
  || roadLawIndex > loopIndex
  || roadLawIndex > townPolishIndex
  || townPolishIndex > loopIndex
) {
  throw new Error('Hero Slice 6 must remain ordered after Hero Slice 5 polish, then stability guard, road law, town polish, and the main animation loop.');
}

const cinematicApplied = await applyOptionalPlayableOpening();
console.log(`Applied Three.js Hero Slice 6 road-first world identity + town massing polish + storm silhouette to ${sourcePath}${cinematicApplied ? ' + playable Cow 17 opening' : ''}`);
