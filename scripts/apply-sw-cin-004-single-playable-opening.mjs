import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(root, 'runtime', 'sw-cin-004-single-playable-opening.js');
const marker = 'SW_CIN_004_SINGLE_PLAYABLE_OPENING_V1';
const sourceMarker = '[SW:SOURCE:sw-cin-004-single-playable-opening.js]';

let html = await readFile(sourcePath, 'utf8');
if (html.includes(marker)) {
  if (!html.includes(sourceMarker)) throw new Error('CIN-004 marker exists without maintained source marker.');
  console.log(`CIN-004 single playable opening already applied to ${sourcePath}`);
  process.exit(0);
}

for (const requirement of [
  'PRESENTATION_IDENTITY_MOO_BREW_V1',
  'SW_CIN_003_PLAYABLE_OPENING_V1',
  '__SW_PRESENTATION_IDENTITY_BRIDGE__',
  '__SW_OPENING_CINEMATIC_PLAYABLE__',
  'identityShouldInterceptStart',
  'identityCreateIntroMarkup',
]) {
  if (!html.includes(requirement)) throw new Error(`CIN-004 requires the accepted opening stack: missing ${requirement}`);
}

const runtime = (await readFile(runtimePath, 'utf8')).trim();
if (runtime.includes('</script>')) throw new Error('CIN-004 runtime contains a closing script tag.');
for (const forbidden of [
  'score =', 'combo =', 'remainingSeconds =', 'currentStage =',
  'storm.speed =', 'storm.radius =', 'storm.pos.set(',
  'target.health =', 'target.destroyed =', 'target.points =',
  'triggerAbility =', 'camera.position.set(', 'camera.lookAt(',
]) {
  if (runtime.includes(forbidden)) throw new Error(`CIN-004 contains prohibited authority write: ${forbidden}`);
}

const boundary = html.lastIndexOf('</script>');
if (boundary < 0) throw new Error('CIN-004 could not locate game script boundary.');
html = `${html.slice(0, boundary)}\n// ${sourceMarker}\n${runtime}\n${html.slice(boundary)}`;
await writeFile(sourcePath, html, 'utf8');

for (const required of [marker, sourceMarker, 'swCin004RetireFlatOpening', 'getSwCin004State', 'normalOpeningPathCount']) {
  if (!html.includes(required)) throw new Error(`CIN-004 post-apply verification missing ${required}`);
}
console.log(`Applied CIN-004 single playable opening to ${sourcePath}`);
