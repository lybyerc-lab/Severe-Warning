import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

for (const file of [
  'src/input/input-system.ts',
  'src/abilities/ability-system.ts',
]) {
  try {
    await access(path.join(projectRoot, file));
    check(`file ${file}`, true);
  } catch (error) {
    check(`file ${file}`, false, error.message);
  }
}

const html = await readFile(sourcePath, 'utf8');
const input = await readFile(path.join(projectRoot, 'src', 'input', 'input-system.ts'), 'utf8');
const abilities = await readFile(path.join(projectRoot, 'src', 'abilities', 'ability-system.ts'), 'utf8');
const adapter = await readFile(path.join(projectRoot, 'src', 'legacy', 'legacy-runtime-adapter.ts'), 'utf8');
const app = await readFile(path.join(projectRoot, 'src', 'app', 'game-app.ts'), 'utf8');

for (const marker of [
  'MODERNIZATION_PHASE3_INPUT_ABILITIES_V1',
  '[SW:ARCH:PHASE3_INPUT_ABILITY_BRIDGE]',
  '[SW:SOURCE:modernization-phase3-input-abilities.js]',
  'const phase3Movement = globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.getMovement()',
  'triggerAbility = function phase3RoutedAbility(slot)',
  'phase3OriginalTriggerAbility(slot)',
]) check(`HTML marker ${marker}`, html.includes(marker));

check('typed input authority', input.includes('export class InputSystem'));
check('touch override contract', input.includes('touchOverridesKeyboard'));
check('keyboard diagonal preserved', input.includes('keyboardDiagonalPreserved'));
check('typed ability authority', abilities.includes('export class AbilitySystem'));
check('legacy rejection preserved', abilities.includes('legacyRejectionPreserved'));
check('duplicate suppression telemetry', html.includes('suppressedDuplicates'));
check('legacy adapter attaches Phase 3', adapter.includes('attachInputAbilities(input: InputSystem, abilities: AbilitySystem)'));
check('app attaches Phase 3', app.includes('attachInputAbilities(this.#context.input, this.#context.abilities)'));
check('bot movement path preserved', html.includes('if (isBotMode) { // AUTOMATED BOT DRIVER MODE'));
check('legacy ability executor retained', html.includes('function triggerAbility(slot)'));

const failures = checks.filter((item) => !item.passed);
console.log(`\nPhase 3 input and ability verification: ${checks.length - failures.length}/${checks.length} checks passed.`);
if (failures.length > 0) {
  console.error(`Failed checks: ${failures.map((item) => item.name).join(', ')}`);
  process.exitCode = 1;
}
