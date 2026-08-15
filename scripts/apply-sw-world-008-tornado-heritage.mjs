import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(root, 'runtime', 'sw-world-008-tornado-heritage.js');
const marker = 'SW_WORLD_008_TORNADO_HERITAGE_V1';
const sourceMarker = '[SW:SOURCE:sw-world-008-tornado-heritage.js]';

let html = await readFile(sourcePath, 'utf8');
if (html.includes(marker)) {
  if (!html.includes(sourceMarker)) throw new Error('WORLD-008 marker exists without maintained source marker.');
  console.log(`WORLD-008 Tornado heritage already applied to ${sourcePath}`);
  process.exit(0);
}

for (const requirement of [
  'THREEJS_VISUAL_HERO_SLICE6_V1',
  'SW_WORLD_007_SECONDARY_EXCLUSIVE_V1',
  'SW_FEEL_001_STRUCTURAL_PRIORITY_V1',
  'SW_UI_005_FIELD_CONTROLS_V1',
  '__SW_THREEJS_VISUAL_FOUNDATION__',
  'const funnelMesh = new THREE.Mesh',
  'const outerFunnelMesh = new THREE.Mesh',
  'const dustBowlGroup = new THREE.Group',
  'const particleSystem = new THREE.Points',
]) {
  if (!html.includes(requirement)) throw new Error(`WORLD-008 requires accepted canonical presentation stack: missing ${requirement}`);
}

const runtime = (await readFile(runtimePath, 'utf8')).trim();
if (runtime.includes('</script>')) throw new Error('WORLD-008 runtime contains a closing script tag.');
for (const forbidden of [
  'target.health =', 'target.destroyed =', 'target.points =',
  'score =', 'combo =', 'remainingSeconds =', 'currentStage =',
  'storm.speed =', 'storm.radius =', 'storm.pos.set(', 'storm.pos.copy(',
  'triggerAbility =', 'camera.position.set(', 'camera.lookAt(',
]) {
  if (runtime.includes(forbidden)) throw new Error(`WORLD-008 contains prohibited authority write: ${forbidden}`);
}

const scriptBoundary = html.lastIndexOf('</script>');
if (scriptBoundary < 0) throw new Error('WORLD-008 could not locate game script boundary.');
html = `${html.slice(0, scriptBoundary)}\n// ${sourceMarker}\n${runtime}\n${html.slice(scriptBoundary)}`;
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  sourceMarker,
  'swWorld008SyncTornadoHeritage',
  'getSwWorld008TornadoHeritageState',
  'tornadoHeritageVersion',
]) {
  if (!html.includes(required)) throw new Error(`WORLD-008 post-apply verification missing ${required}`);
}

console.log(`Applied WORLD-008 Tornado heritage presentation to ${sourcePath}`);
