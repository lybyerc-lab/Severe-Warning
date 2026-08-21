import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { joinRegions, readInlinedRegions } from './lib/inlined-regions.mjs';

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

const requiredFiles = [
  'src/gameplay/scoring/scoring-contracts.ts',
  'src/gameplay/scoring/scoring-system.ts',
  'src/gameplay/districts/district-contracts.ts',
  'src/gameplay/districts/district-system.ts',
  'src/gameplay/campaign/campaign-contracts.ts',
  'src/gameplay/campaign/heartland-definitions.ts',
  'src/gameplay/campaign/campaign-system.ts',
  'src/platform/persistence/campaign-save-schema.ts',
  'src/platform/persistence/campaign-store.ts',
  'scripts/qa-modernization-phase4-scoring-campaign.mjs',
];
for (const file of requiredFiles) {
  try {
    await access(path.join(projectRoot, file));
    check(`file ${file}`, true);
  } catch (error) {
    check(`file ${file}`, false, error.message);
  }
}

const html = await readFile(sourcePath, 'utf8');
const scoringContracts = await readFile(path.join(projectRoot, 'src/gameplay/scoring/scoring-contracts.ts'), 'utf8');
const scoring = await readFile(path.join(projectRoot, 'src/gameplay/scoring/scoring-system.ts'), 'utf8');
const districtContracts = await readFile(path.join(projectRoot, 'src/gameplay/districts/district-contracts.ts'), 'utf8');
const district = await readFile(path.join(projectRoot, 'src/gameplay/districts/district-system.ts'), 'utf8');
const campaignContracts = await readFile(path.join(projectRoot, 'src/gameplay/campaign/campaign-contracts.ts'), 'utf8');
const definitions = await readFile(path.join(projectRoot, 'src/gameplay/campaign/heartland-definitions.ts'), 'utf8');
const campaign = await readFile(path.join(projectRoot, 'src/gameplay/campaign/campaign-system.ts'), 'utf8');
const schema = await readFile(path.join(projectRoot, 'src/platform/persistence/campaign-save-schema.ts'), 'utf8');
const persistence = await readFile(path.join(projectRoot, 'src/platform/persistence/campaign-store.ts'), 'utf8');
// The bridge is read out of the gameplay source it actually runs in, not from
// a mirrored copy that only matched while someone remembered to update both.
const runtime = joinRegions(await readInlinedRegions(sourcePath), ['modernization-phase4-scoring-campaign.js']);
const adapter = await readFile(path.join(projectRoot, 'src/legacy/legacy-runtime-adapter.ts'), 'utf8');
const app = await readFile(path.join(projectRoot, 'src/app/game-app.ts'), 'utf8');

for (const marker of [
  'MODERNIZATION_PHASE4_SCORING_CAMPAIGN_V2',
  '[SW:ARCH:PHASE4_SCORING_CAMPAIGN_BRIDGE]',
  '[SW:SOURCE:modernization-phase4-scoring-campaign.js]',
  'addScore = function phase4ObservedAddScore',
  'showDistrictTransition = function phase4ObservedDistrictTransition',
  'completeCampaignRun = function phase4ObservedCampaignCompletion',
  'saveCampaignProgress = function phase4ObservedCampaignSave',
  'loadCampaignProgress = function phase4ObservedCampaignLoad',
  'resetWarningRun = function phase4ObservedWarningReset',
]) check(`HTML marker ${marker}`, html.includes(marker));

check('typed scoring mirror', scoring.includes('export class ScoringSystem'));
check('exact max combo 3.5', scoringContracts.includes('maxComboMultiplier: 3.5'));
check('exact combo step 0.05', scoringContracts.includes('comboStep: 0.05'));
check('exact combo decay 4.5', scoringContracts.includes('comboDecaySeconds: 4.5'));
check('campaign multiplier represented', scoring.includes('campaignScoreMultiplier'));
check('score doubler represented', scoring.includes('scoreDoublerTimerSeconds'));
check('legacy destruction score represented', scoringContracts.includes('destructionScore'));
check('legacy base score represented', scoringContracts.includes('baseScore'));
check('no invented four-x cap', !scoring.includes('maxComboMultiplier: 4') && !runtime.includes('Math.min(4.0'));
check('legacy addScore remains executor', runtime.includes('phase4OriginalAddScore.apply(this, arguments)'));
check('runtime does not replace legacy score fields', !runtime.includes('score = phase4ScoringAuthority.score'));

check('typed district mirror', district.includes('export class DistrictSystem'));
check('district stages use currentStage law', districtContracts.includes("export type DistrictStage = 1 | 2 | 3"));
check('stage two begins at 120 seconds', districtContracts.includes('beginsWhenRemainingAtOrBelowSeconds: 120'));
check('stage three begins at 60 seconds', districtContracts.includes('beginsWhenRemainingAtOrBelowSeconds: 60'));
check('district score is observed not thresholded', !districtContracts.includes('scoreThreshold'));
check('forward regression rejection', district.includes('next < this.currentStageValue'));
check('legacy district transition remains executor', runtime.includes('phase4OriginalShowDistrictTransition.apply(this, arguments)'));
check('no invented currentDistrict global', !runtime.includes('currentDistrict ='));

check('typed campaign mirror', campaign.includes('export class CampaignSystem'));
check('exact State Fair ID', campaignContracts.includes("'state-fair-finale'"));
check('no invented State Fair ID', !campaignContracts.includes("'state-fair' |") && !definitions.includes("id: 'state-fair',"));
check('exact campaign score targets', ['scoreTarget: 8000', 'scoreTarget: 12000', 'scoreTarget: 18000', 'scoreTarget: 26000'].every((text) => definitions.includes(text)));
check('exact campaign multipliers', ['scoreMultiplier: 1,', 'scoreMultiplier: 1.1', 'scoreMultiplier: 1.15', 'scoreMultiplier: 1.25'].every((text) => definitions.includes(text)));
check('three stars require target and objectives', campaign.includes('validScore >= stop.scoreTarget * 1.5 && validObjectives === 3'));
check('two stars require target', campaign.includes('validScore >= stop.scoreTarget'));
check('one star preserves objective alternative', campaign.includes('validScore >= stop.scoreTarget * 0.6 || validObjectives >= 2'));
check('positive stars unlock next', campaign.includes('const cleared = starsEarned > 0'));
check('runs field preserved', campaign.includes('runs: previous.runs + 1'));
check('bestGrade semantics preserved', campaign.includes('bestStars > previous.stars'));
check('legacy campaign completion remains executor', runtime.includes('phase4OriginalCompleteCampaignRun.apply(this, arguments)'));

check('storage key preserved', schema.includes("'severe_weather_campaign_v1'"));
check('legacy schema field preserved', campaignContracts.includes('readonly schema: 1') && schema.includes('CAMPAIGN_SCHEMA_VERSION = 1 as const'));
check('legacy unlockedLevel preserved', schema.includes('unlockedLevel'));
check('legacy selectedLevel preserved', schema.includes('selectedLevel'));
check('legacy levels map preserved', schema.includes('levels'));
check('unknown top-level fields preserved', schema.includes('...source'));
check('unknown level fields preserved', schema.includes('normalizeCampaignLevelProgress'));
check('no invented selectedStop field', !schema.includes('selectedStop'));
check('no invented furthestUnlockedStop field', !schema.includes('furthestUnlockedStop'));
check('no invented runsCompleted field', !schema.includes('runsCompleted'));
check('malformed save recovery exists', persistence.includes('catch'));
check('QA storage isolation exists', persistence.includes('isolateQa'));
check('persistence contract probe exists', persistence.includes('runContractProbe'));

check('legacy adapter attaches Phase 4', adapter.includes('attachScoringCampaign('));
check('adapter requires V2 bridge', adapter.includes('MODERNIZATION_PHASE4_SCORING_CAMPAIGN_V2'));
check('app attaches Phase 4', app.includes('attachScoringCampaign('));
check('GameApp avoids duplicate scoring reset', !app.includes('this.#context.scoring.reset();'));
check('runtime exposes one deliberate bridge', runtime.includes('globalThis.__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__'));
check('runtime contains no fallback scoring mutation', !runtime.includes('score = (score || 0)'));
check('runtime synchronizes exact legacy save', runtime.includes('phase4LegacyCampaignState'));

const failures = checks.filter((item) => !item.passed);
console.log(`\nPhase 4 scoring, district, campaign, and persistence verification: ${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length > 0) {
  console.error(`Failed checks: ${failures.map((item) => item.name).join(', ')}`);
  process.exitCode = 1;
}
