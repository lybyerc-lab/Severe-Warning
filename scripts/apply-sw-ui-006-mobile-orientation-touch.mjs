import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(root, 'runtime', 'sw-ui-006-mobile-orientation-touch.js');
const marker = 'SW_UI_006_MOBILE_ORIENTATION_TOUCH_V1';
const sourceMarker = '[SW:SOURCE:sw-ui-006-mobile-orientation-touch.js]';

let html = await readFile(sourcePath, 'utf8');
if (html.includes(marker)) {
  if (!html.includes(sourceMarker)) throw new Error('SW-UI-006 marker exists without maintained source marker.');
  console.log(`SW-UI-006 already applied to ${sourcePath}`);
  process.exit(0);
}

for (const requirement of [
  'SW_UI_003_RUN_SHELL_IDENTITY_V1',
  'SW_UI_004_GAMEPLAY_PRODUCT_IDENTITY_V1',
  'SW_UI_005_FIELD_CONTROLS_V1',
  'SW_WORLD_007_SECONDARY_EXCLUSIVE_V1',
  'SW_FEEL_001_STRUCTURAL_PRIORITY_V1',
  'id="btnAbility1"',
  'id="btnAbility2"',
  'id="btnAbility3"',
  'class="touch-controls"',
  'class="panel telemetry"',
]) {
  if (!html.includes(requirement)) throw new Error(`SW-UI-006 requires accepted canonical presentation source: missing ${requirement}`);
}

const runtime = await readFile(runtimePath, 'utf8');
if (runtime.includes('</script>')) throw new Error('SW-UI-006 runtime contains a closing script tag.');
for (const forbidden of [
  'target.health =', 'target.damageStage =', 'target.destroyed =',
  'score =', 'combo =', 'remainingSeconds =', 'currentStage =', 'selectedCampaignIndex =',
  'storm.speed =', 'storm.radius =', 'storm.pos.set(', 'storm.pos.copy(',
  'camera.position', 'camera.rotation', 'camera.lookAt(',
  'triggerAbility =', 'triggerAbility(', 'usePull(', 'useGust(', 'useZap(',
  'gameStarted =', 'isPaused =', 'neonFunnelUnlocked =',
  'animals.push(', 'animals.splice(',
  'keydown', 'keyup', 'touchstart', 'touchmove', 'pointerdown',
]) {
  if (runtime.includes(forbidden)) throw new Error(`SW-UI-006 contains prohibited gameplay/input authority seam: ${forbidden}`);
}

const index = html.lastIndexOf('</script>');
if (index < 0) throw new Error('Could not locate accepted game script boundary.');
html = `${html.slice(0, index)}\n// ${sourceMarker}\n${runtime.trim()}\n${html.slice(index)}`;
await writeFile(sourcePath, html, 'utf8');

for (const required of [marker, sourceMarker, 'Rotate to Play', 'sw-ui-006-keyboard-hint', 'getSwUi006State']) {
  if (!html.includes(required)) throw new Error(`SW-UI-006 apply verification failed: missing ${required}`);
}
console.log(`Applied SW-UI-006 mobile orientation/touch correction to ${sourcePath}`);
