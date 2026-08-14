import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = await readFile(path.join(root, 'runtime', 'sw-quality-001-owner-playtest-rescue.js'), 'utf8');
const apply = await readFile(path.join(root, 'scripts', 'apply-sw-quality-001-owner-playtest-rescue.mjs'), 'utf8');

const required = [
  'SW_QUALITY_001_OWNER_PLAYTEST_RESCUE_V1',
  'swQuality001EnhanceTornadoMotion',
  "name.startsWith('SWVisualSlice6CondensationStreak')",
  'step * direction * (0.62',
  'swQuality001BaseQuitToMainMenu',
  'runActive = false',
  "stopAllStormAudio === 'function'",
  '#pauseOverlay',
  '.pause-card',
  '.newspaper-front-page .storm-card p { display: none; }',
  'font-size: 10.5px',
  'getSwQuality001State',
];

for (const token of required) {
  if (!runtime.includes(token)) throw new Error(`SW-QUALITY-001 runtime missing required contract: ${token}`);
}
for (const forbidden of [
  'score =',
  'currentStage =',
  'stormSiteSelection =',
  'mooLevelProgress =',
  'cooldowns.primary =',
  'cooldowns.secondary =',
]) {
  if (runtime.includes(forbidden)) throw new Error(`SW-QUALITY-001 crossed protected authority: ${forbidden}`);
}
for (const token of [
  'SW_UI_002_LANDSCAPE_UNLEASH_V1',
  'THREEJS_VISUAL_HERO_SLICE6_V1',
  'SW_LEVEL_001_STORM_SITE_FRAMEWORK_V1',
  '[SW:SOURCE:sw-quality-001-owner-playtest-rescue.js]'
]) {
  if (!apply.includes(token)) throw new Error(`SW-QUALITY-001 apply script missing dependency/source contract: ${token}`);
}

console.log('SW-QUALITY-001 static verifier PASS');
