import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const bridgePath = path.join(projectRoot, 'runtime', 'modernization-phase4-scoring-campaign.js');

let html = await readFile(sourcePath, 'utf8');
const bridgeSource = (await readFile(bridgePath, 'utf8')).trim();
const marker = 'MODERNIZATION_PHASE4_SCORING_CAMPAIGN_V1';

if (html.includes(marker)) {
  console.log(`Phase 4 scoring and campaign bridge already present in ${sourcePath}`);
  process.exit(0);
}

for (const prerequisite of [
  'MODERNIZATION_PHASE3_INPUT_ABILITIES_V1',
  'MODERNIZATION_PHASE2_CLOCKS_V1',
  'V510_THREEJS_PRODUCTION_SLICE_V1',
  'function addScore(',
  'function saveCampaignProgress('
]) {
  if (!html.includes(prerequisite)) {
    throw new Error(`Phase 4 requires the accepted Phase 3 runtime: missing ${prerequisite}`);
  }
}

const mainScriptCloseIndex = html.lastIndexOf('</script>');
const bodyCloseIndex = html.lastIndexOf('</body>');
if (mainScriptCloseIndex < 0 || bodyCloseIndex < 0 || mainScriptCloseIndex > bodyCloseIndex) {
  throw new Error('Phase 4 bridge could not locate the final game script boundary.');
}
if (bridgeSource.includes('</script>')) {
  throw new Error('Phase 4 bridge contains a closing script tag.');
}

const bundledBridge = `\n\n// [SW:SOURCE:modernization-phase4-scoring-campaign.js]\n${bridgeSource}\n`;
html = html.slice(0, mainScriptCloseIndex) + bundledBridge + html.slice(mainScriptCloseIndex);

for (const required of [
  marker,
  '[SW:ARCH:PHASE4_SCORING_CAMPAIGN_BRIDGE]',
  '__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__',
  'addScore = function phase4RoutedAddScore'
]) {
  if (!html.includes(required)) throw new Error(`Phase 4 verification failed: missing ${required}`);
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied Phase 4 scoring, district, campaign, and persistence bridge to ${sourcePath}`);
