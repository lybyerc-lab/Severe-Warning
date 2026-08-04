import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

for (const file of [
  'src/gameplay/scoring/scoring-contracts.ts',
  'src/gameplay/scoring/scoring-system.ts',
  'src/gameplay/districts/district-contracts.ts',
  'src/gameplay/districts/district-system.ts',
  'src/gameplay/campaign/campaign-contracts.ts',
  'src/gameplay/campaign/heartland-definitions.ts',
  'src/gameplay/campaign/campaign-system.ts',
  'src/platform/persistence/campaign-save-schema.ts',
  'src/platform/persistence/campaign-store.ts',
  'runtime/modernization-phase4-scoring-campaign.js',
  'scripts/apply-modernization-phase4-scoring-campaign.mjs',
]) {
  try {
    await access(path.join(projectRoot, file));
    check(`file ${file}`, true);
  } catch (error) {
    check(`file ${file}`, false, error.message);
  }
}

const html = await readFile(sourcePath, 'utf8');
const scoring = await readFile(path.join(projectRoot, 'src', 'gameplay', 'scoring', 'scoring-system.ts'), 'utf8');
const district = await readFile(path.join(projectRoot, 'src', 'gameplay', 'districts', 'district-system.ts'), 'utf8');
const campaign = await readFile(path.join(projectRoot, 'src', 'gameplay', 'campaign', 'campaign-system.ts'), 'utf8');
const persistence = await readFile(path.join(projectRoot, 'src', 'platform', 'persistence', 'campaign-store.ts'), 'utf8');
const adapter = await readFile(path.join(projectRoot, 'src', 'legacy', 'legacy-runtime-adapter.ts'), 'utf8');
const app = await readFile(path.join(projectRoot, 'src', 'app', 'game-app.ts'), 'utf8');

for (const marker of [
  'MODERNIZATION_PHASE4_SCORING_CAMPAIGN_V1',
  '[SW:ARCH:PHASE4_SCORING_CAMPAIGN_BRIDGE]',
  '[SW:SOURCE:modernization-phase4-scoring-campaign.js]',
  'addScore = function phase4RoutedAddScore',
  'registerComboHit = function phase4RoutedRegisterComboHit',
  'advanceDistrict = function phase4RoutedAdvanceDistrict',
]) check(`HTML marker ${marker}`, html.includes(marker));

check('typed scoring authority', scoring.includes('export class ScoringSystem'));
check('score continuity contract', scoring.includes('resetCombo'));
check('typed district authority', district.includes('export class DistrictSystem'));
check('forward-only district contract', district.includes('isFinalDistrict'));
check('typed campaign authority', campaign.includes('export class CampaignSystem'));
check('heartland unlock dependencies', campaign.includes('isStopUnlocked'));
check('typed persistence authority', persistence.includes('export class CampaignStore'));
check('storage key preserved', persistence.includes('CAMPAIGN_STORAGE_KEY') || persistence.includes('severe_weather_campaign_v1'));
check('legacy adapter attaches Phase 4', adapter.includes('attachScoringCampaign('));
check('app attaches Phase 4', app.includes('attachScoringCampaign('));

const failures = checks.filter((item) => !item.passed);
console.log(`\nPhase 4 scoring, district, campaign, and persistence verification: ${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length > 0) {
  console.error(`Failed checks: ${failures.map((item) => item.name).join(', ')}`);
  process.exitCode = 1;
}
