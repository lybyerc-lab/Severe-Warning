import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const bridgePath = path.join(projectRoot, 'runtime', 'modernization-phase3-input-abilities.js');

let html = await readFile(sourcePath, 'utf8');
const bridgeSource = (await readFile(bridgePath, 'utf8')).trim();
const marker = 'MODERNIZATION_PHASE3_INPUT_ABILITIES_V1';

if (html.includes(marker)) {
  console.log(`Phase 3 input and ability bridge already present in ${sourcePath}`);
  process.exit(0);
}

for (const prerequisite of [
  'MODERNIZATION_PHASE2_CLOCKS_V1',
  'V510_THREEJS_PRODUCTION_SLICE_V1',
  'function triggerAbility(slot)',
  'let joystickActive = false',
  "if (keys['KeyA'] || keys['a'] || keys['ArrowLeft']) moveX -= 1;"
]) {
  if (!html.includes(prerequisite)) {
    throw new Error(`Phase 3 requires the accepted Phase 2 runtime: missing ${prerequisite}`);
  }
}

function replaceRegex(pattern, replacement, label) {
  const matches = [...html.matchAll(pattern)];
  if (matches.length !== 1) {
    throw new Error(`${label}: expected exactly one source match, found ${matches.length}`);
  }
  html = html.replace(pattern, replacement);
}

const movementPattern = /      if \(keys\['KeyA'\] \|\| keys\['a'\] \|\| keys\['ArrowLeft'\]\) moveX -= 1;\n      if \(keys\['KeyD'\] \|\| keys\['d'\] \|\| keys\['ArrowRight'\]\) moveX \+= 1;\n      if \(keys\['KeyW'\] \|\| keys\['w'\] \|\| keys\['ArrowUp'\]\) moveZ -= 1;\n      if \(keys\['KeyS'\] \|\| keys\['s'\] \|\| keys\['ArrowDown'\]\) moveZ \+= 1;\n\n      if \(joystickActive\) \{\n        moveX = joystickDir\.x;\n        moveZ = joystickDir\.z;\n      \}/g;

replaceRegex(
  movementPattern,
  `      const phase3Movement = globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.getMovement();\n      if (phase3Movement) {\n        moveX = phase3Movement.x;\n        moveZ = phase3Movement.z;\n      } else {\n        if (keys['KeyA'] || keys['a'] || keys['ArrowLeft']) moveX -= 1;\n        if (keys['KeyD'] || keys['d'] || keys['ArrowRight']) moveX += 1;\n        if (keys['KeyW'] || keys['w'] || keys['ArrowUp']) moveZ -= 1;\n        if (keys['KeyS'] || keys['s'] || keys['ArrowDown']) moveZ += 1;\n        if (joystickActive) {\n          moveX = joystickDir.x;\n          moveZ = joystickDir.z;\n        }\n      }`,
  'authoritative player movement read'
);

const mainScriptCloseIndex = html.lastIndexOf('</script>');
const bodyCloseIndex = html.lastIndexOf('</body>');
if (mainScriptCloseIndex < 0 || bodyCloseIndex < 0 || mainScriptCloseIndex > bodyCloseIndex) {
  throw new Error('Phase 3 bridge could not locate the final game script boundary.');
}
if (bridgeSource.includes('</script>')) {
  throw new Error('Phase 3 bridge contains a closing script tag.');
}

const bundledBridge = `\n\n// [SW:SOURCE:modernization-phase3-input-abilities.js]\n${bridgeSource}\n`;
html = html.slice(0, mainScriptCloseIndex) + bundledBridge + html.slice(mainScriptCloseIndex);

for (const required of [
  marker,
  '[SW:ARCH:PHASE3_INPUT_ABILITY_BRIDGE]',
  '__SW_PHASE3_INPUT_ABILITY_BRIDGE__',
  'const phase3Movement = globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.getMovement()',
  'triggerAbility = function phase3RoutedAbility(slot)',
  'phase3OriginalTriggerAbility(slot)',
  'suppressedDuplicates'
]) {
  if (!html.includes(required)) throw new Error(`Phase 3 verification failed: missing ${required}`);
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied Phase 3 input and ability authority bridge to ${sourcePath}`);
