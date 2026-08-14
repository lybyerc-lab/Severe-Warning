import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const runtimePath = path.join(projectRoot, 'runtime', 'sw-polish-001-quality-rescue.js');

let html = await readFile(sourcePath, 'utf8');
const runtime = (await readFile(runtimePath, 'utf8')).trim();
const marker = 'SW_POLISH_001_QUALITY_RESCUE_V1';
const sourceMarker = '[SW:SOURCE:sw-polish-001-quality-rescue.js]';

for (const prerequisite of [
  'THREEJS_VISUAL_HERO_SLICE6_V1',
  'SW_CIN_003_PLAYABLE_OPENING_V1',
  'SW_GAME_002_MOO_LEVEL_V1',
  'SW_UI_001_NEWSPAPER_PRESENTATION_V1',
  'SW_LEVEL_001_STORM_SITE_FRAMEWORK_V1',
  'SW_UI_002_LANDSCAPE_UNLEASH_V1',
  '__SW_OPENING_CINEMATIC_PLAYABLE__',
  '__SW_STORM_SITE_QA__',
]) {
  if (!html.includes(prerequisite)) throw new Error(`SW-POLISH-001 prerequisite missing: ${prerequisite}`);
}

if (html.includes(marker)) {
  if (!html.includes(sourceMarker) || !html.includes('getSwPolish001QaState')) {
    throw new Error('SW-POLISH-001 marker exists but the correction bundle is incomplete.');
  }
  console.log(`SW-POLISH-001 already applied to ${sourcePath}`);
  process.exit(0);
}

if (runtime.includes('</script>')) throw new Error('SW-POLISH-001 runtime may not contain a closing script tag.');
for (const forbidden of [
  'runActive =',
  'gameStarted =',
  'storm.radius =',
  'storm.speed =',
  'storm.pos.set(',
  'storm.pos.copy(',
  'target.health =',
  'target.maxHealth =',
  'target.destroyed =',
  'campaignProgress =',
  'mooLevelProgress =',
]) {
  if (runtime.includes(forbidden)) throw new Error(`SW-POLISH-001 contains prohibited gameplay authority write: ${forbidden}`);
}

const closeIndex = html.lastIndexOf('</script>');
if (closeIndex < 0) throw new Error('SW-POLISH-001 could not find the main classic-script close tag.');
const newline = html.includes('\r\n') ? '\r\n' : '\n';
const bundle = `${newline}// ${sourceMarker}${newline}${runtime}${newline}`;
html = `${html.slice(0, closeIndex)}${bundle}${html.slice(closeIndex)}`;
await writeFile(sourcePath, html, 'utf8');

for (const required of [
  marker,
  sourceMarker,
  '[SW:POLISH:001_QUALITY_RESCUE]',
  'swPolish001WholeBodyStormMotion',
  'SWPolish001CountyFairIdentity',
  'SWPolish001CoastalIdentity',
  'swPolish001CinematicOverlay',
  'getSwPolish001QaState',
]) {
  if (!html.includes(required)) throw new Error(`SW-POLISH-001 apply verification failed: missing ${required}`);
}

console.log(`Applied Stage 2B quality rescue to ${sourcePath}`);
