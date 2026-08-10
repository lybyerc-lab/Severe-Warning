import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const foundationPath = path.join(projectRoot, 'runtime', 'threejs-opening-cinematic-foundation.js');
const integrationPath = path.join(projectRoot, 'runtime', 'threejs-opening-cinematic-integration.js');

let html = await readFile(sourcePath, 'utf8');
const foundation = (await readFile(foundationPath, 'utf8')).trim();
const integration = (await readFile(integrationPath, 'utf8')).trim();
const marker = 'SW_CIN_003_PLAYABLE_OPENING_V1';
const foundationMarker = 'SW_CIN_002_ACTING_POLISH_V1';
const foundationSourceMarker = '[SW:SOURCE:threejs-opening-cinematic-foundation.js]';
const integrationSourceMarker = '[SW:SOURCE:threejs-opening-cinematic-integration.js]';
const insertionMarker = '// --- MAIN ANIMATION LOOP WITH 3-STAGE ESCALATION ---';
const dtAnchor = '  const dt = realDelta;';
const frameHook = "  const swOpeningCinematicOwnsFrame = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.frame?.(now, dt) === true;";
const cinematicCameraGate = 'if (!swOpeningCinematicOwnsFrame &&';
// Slice 6 owns a Cow-cam-or-gameplay camera branch around the ordinary camera
// writes. Gate that whole branch, rather than assuming the older bare writes
// still exist after the protected GAME integration.
const cameraOwnershipGuard = '  if (!globalThis.productionQaPrepared && !(typeof globalThis.isPhase5PresentationLatched === \'function\' && globalThis.isPhase5PresentationLatched())) {';
const cameraOwnershipReplacement = '  if (!swOpeningCinematicOwnsFrame && !globalThis.productionQaPrepared && !(typeof globalThis.isPhase5PresentationLatched === \'function\' && globalThis.isPhase5PresentationLatched())) {';

function requireMarker(value) {
  if (!html.includes(value)) throw new Error(`SW-CIN-003 apply verification failed: missing ${value}`);
}

function verifyRuntimeSafety(value, label) {
  if (value.includes('</script>')) throw new Error(`${label} contains a closing script tag.`);
  if (value.includes('new THREE.WebGLRenderer')) throw new Error(`${label} may not create a renderer.`);
  if (value.includes('new THREE.Scene')) throw new Error(`${label} may not create a scene.`);
  for (const forbidden of [
    'target.health =',
    'target.maxHealth =',
    'target.damageStage =',
    'target.destroyed =',
    'target.points =',
    'neonFunnelUnlocked =',
    'triggerAbility =',
    'storm.speed =',
    'storm.radius =',
    'storm.pos.set(',
    'storm.pos.copy(',
    'powerPoles.push(',
    'powerPoles.splice(',
  ]) {
    if (value.includes(forbidden)) throw new Error(`${label} contains prohibited gameplay authority write: ${forbidden}`);
  }
}

if (html.includes(marker) && html.includes(frameHook) && html.includes(cinematicCameraGate)) {
  [foundationSourceMarker, integrationSourceMarker, foundationMarker, marker, '__SW_OPENING_CINEMATIC_PLAYABLE__'].forEach(requireMarker);
  console.log(`SW-CIN-003 already applied to ${sourcePath}`);
  process.exit(0);
}

for (const prerequisite of [
  'THREEJS_VISUAL_HERO_SLICE6_V1',
  'THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_V1',
  'THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_V1',
  '[SW:SOURCE:threejs-visual-hero-slice6-town-polish.js]',
  insertionMarker,
  dtAnchor,
  cameraOwnershipGuard,
  'function startRunFromMenu()',
  'function resetWarningRun()',
]) {
  if (!html.includes(prerequisite)) throw new Error(`SW-CIN-003 requires the sealed Slice 6 output: missing ${prerequisite}`);
}

verifyRuntimeSafety(foundation, 'Cinematic foundation');
verifyRuntimeSafety(integration, 'Playable cinematic integration');
const newline = html.includes('\r\n') ? '\r\n' : '\n';
const bundle = [
  '',
  `// ${foundationSourceMarker}`,
  foundation,
  '',
  `// ${integrationSourceMarker}`,
  integration,
  '',
].join(newline);
html = html.replace(insertionMarker, `${bundle}${newline}${insertionMarker}`);
html = html.replace(dtAnchor, `${dtAnchor}${newline}${frameHook}`);
html = html.replace(cameraOwnershipGuard, cameraOwnershipReplacement);
html = html.replace(
  '</head>',
  `<!-- ${foundationMarker} -->${newline}<!-- ${marker} -->${newline}<!-- [SW:CINEMATIC:PLAYABLE_OPENING] -->${newline}</head>`,
);
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  foundationMarker,
  marker,
  '[SW:CINEMATIC:PLAYABLE_OPENING]',
  foundationSourceMarker,
  integrationSourceMarker,
  '__SW_OPENING_CINEMATIC_FOUNDATION__',
  '__SW_OPENING_CINEMATIC_PLAYABLE__',
  'startRunFromMenuWithPlayableOpening',
  'timerFrozenDuringCinematic',
  'SWCinematicNewspaper',
  'SWCinematicBarnRoofPeel',
  'SWCinematicTouchdownProductionStorm',
  frameHook,
  cinematicCameraGate,
]) requireMarker(required);

const slice6Index = html.indexOf('[SW:SOURCE:threejs-visual-hero-slice6-town-polish.js]');
const foundationIndex = html.indexOf(foundationSourceMarker);
const integrationIndex = html.indexOf(integrationSourceMarker);
const loopIndex = html.indexOf(insertionMarker);
if (slice6Index < 0 || foundationIndex < 0 || integrationIndex < 0 || loopIndex < 0
  || slice6Index > foundationIndex || foundationIndex > integrationIndex || integrationIndex > loopIndex) {
  throw new Error('SW-CIN-003 must remain ordered after Slice 6 town polish and before the main animation loop.');
}

console.log(`Applied playable Cow 17 opening cinematic integration to ${sourcePath}`);
