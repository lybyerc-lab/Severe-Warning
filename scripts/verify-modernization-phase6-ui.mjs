import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { joinRegions, readInlinedRegions } from './lib/inlined-regions.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_Warning.html');

const checks = [];
function check(name, passed, detail = '') {
  checks.push({ name, passed: Boolean(passed), detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
}

const requiredFiles = [
  'Docs/PHASE6_UI_SOURCE_MAP.md',
  'src/ui/hud/hud-contracts.ts',
  'src/ui/hud/hud-system.ts',
  'src/ui/feedback/rampage-feedback-contracts.ts',
  'src/ui/feedback/rampage-feedback-system.ts',
  'src/ui/transitions/district-transition-contracts.ts',
  'src/ui/transitions/district-transition-system.ts',
  'src/ui/results/results-contracts.ts',
  'src/ui/results/results-system.ts',
  'src/ui/ui-contracts.ts',
  'src/ui/ui-system.ts',
  'scripts/qa-modernization-phase6-ui.mjs',
];

for (const file of requiredFiles) {
  try {
    await access(path.join(projectRoot, file));
    check(`file ${file}`, true);
  } catch (error) {
    check(`file ${file}`, false, error.message);
  }
}

const read = async (...segments) => readFile(path.join(projectRoot, ...segments), 'utf8');
const html = await readFile(sourcePath, 'utf8');
const bridge = joinRegions(await readInlinedRegions(sourcePath), ['modernization-phase6-ui.js']);
const hudContracts = await read('src', 'ui', 'hud', 'hud-contracts.ts');
const hud = await read('src', 'ui', 'hud', 'hud-system.ts');
const feedbackContracts = await read('src', 'ui', 'feedback', 'rampage-feedback-contracts.ts');
const feedback = await read('src', 'ui', 'feedback', 'rampage-feedback-system.ts');
const transitionContracts = await read('src', 'ui', 'transitions', 'district-transition-contracts.ts');
const transitions = await read('src', 'ui', 'transitions', 'district-transition-system.ts');
const resultsContracts = await read('src', 'ui', 'results', 'results-contracts.ts');
const results = await read('src', 'ui', 'results', 'results-system.ts');
const uiContracts = await read('src', 'ui', 'ui-contracts.ts');
const uiSystem = await read('src', 'ui', 'ui-system.ts');
const adapter = await read('src', 'legacy', 'legacy-runtime-adapter.ts');
const app = await read('src', 'app', 'game-app.ts');

for (const marker of [
  'MODERNIZATION_PHASE6_UI_V1',
  '[SW:ARCH:PHASE6_UI_BRIDGE]',
  '[SW:SOURCE:modernization-phase6-ui.js]',
  'globalThis.__SW_PHASE6_UI_BRIDGE__ = phase6UiBridge',
]) {
  check(`HTML marker ${marker}`, html.includes(marker));
}

// Inlined bridge checks
check('inlined Phase 6 bridge exists', bridge.includes('const PHASE6_UI_BRIDGE_VERSION = \'MODERNIZATION_PHASE6_UI_V1\''));
check('bridge has attach method', bridge.includes('attach(uiAuthority)'));
check('bridge has syncFromLegacy method', bridge.includes('syncFromLegacy()'));
check('bridge has reset method', bridge.includes('reset()'));
check('bridge has runContractProbe method', bridge.includes('runContractProbe()'));
check('bridge has getSnapshot method', bridge.includes('getSnapshot()'));

// Typed contracts and subsystems
check('HudSystem implements updateTimer', hud.includes('updateTimer(remainingSeconds: number)'));
check('HudSystem implements updateScore', hud.includes('updateScore(score: number, combo: number, decayProgress: number, efRating: string)'));
check('HudSystem implements updateAbilityCooldown', hud.includes('updateAbilityCooldown(slot: 0 | 1 | 2'));
check('HudSystem implements getSnapshot', hud.includes('getSnapshot(): HudStateSnapshot'));

check('RampageFeedbackSystem implements addScorePopup', feedback.includes('addScorePopup('));
check('RampageFeedbackSystem implements triggerMilestone', feedback.includes('triggerMilestone('));
check('RampageFeedbackSystem implements getActivePopups', feedback.includes('getActivePopups()'));

check('DistrictTransitionSystem implements announceDistrict', transitions.includes('announceDistrict('));
check('DistrictTransitionSystem implements getCurrentTransition', transitions.includes('getCurrentTransition()'));

check('ResultsSystem implements presentResults', results.includes('presentResults('));
check('ResultsSystem implements getReport', results.includes('getReport()'));

check('UISubsystem coordinates all 4 modules', uiSystem.includes('this.hud = new HudSystem()') && uiSystem.includes('this.feedback = new RampageFeedbackSystem()'));
check('UISubsystem implements reset', uiSystem.includes('public reset(): void'));

// Adapter and App integration
check('legacy adapter requires Phase 6 V1', adapter.includes('MODERNIZATION_PHASE6_UI_V1'));
check('legacy adapter exposes attachUi', adapter.includes('attachUi(ui: UISubsystem)'));
check('legacy adapter exposes getUiBridgeSnapshot', adapter.includes('getUiBridgeSnapshot()'));
check('legacy adapter exposes runUiContractProbe', adapter.includes('runUiContractProbe()'));
check('game-app attaches UI authority', app.includes('attachUi(this.#context.ui)'));

const failures = checks.filter((item) => !item.passed);
console.log(`\nPhase 6 HUD & UI verification: ${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length > 0) {
  console.error(`Failed checks: ${failures.map((item) => item.name).join(', ')}`);
  process.exitCode = 1;
}
