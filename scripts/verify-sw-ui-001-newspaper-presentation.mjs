import { readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const temporary = path.join(root, '.sw-ui-001-verify.html');
const checks = [];
const patches = ['apply-v431-source-patch.mjs','apply-v440-source-patch.mjs','apply-v441-source-patch.mjs','apply-v442-source-patch.mjs','fix-v450-parser.mjs','apply-v450-source-patch.mjs','apply-v450-rampage-music-patch.mjs','apply-qa-corrections-patch.mjs','apply-audio-mix-followup-patch.mjs','apply-ui-polish-followup-patch.mjs','apply-score-continuity-fix.mjs','apply-qa4-deterministic-lab-patch.mjs','apply-qa4-mobile-input-fix.mjs','apply-qa4-run-lock-fix.mjs','apply-qa4-pause-forensics.mjs','apply-pause-overlay-hit-test-fix.mjs','apply-pause-overlay-hard-hide.mjs','apply-qa4-popup-assertion-fix.mjs','apply-v500-campaign-patch.mjs','apply-v500-realtime-clock-fix.mjs','apply-v500-world-tour-patch.mjs','apply-v500-mobile-layout-fix.mjs','apply-v500-cow-signature-patch.mjs','apply-v510-production-slice.mjs','apply-sw-game-002-moo-level.mjs','apply-sw-ui-001-newspaper-presentation.mjs'];
const check = (name, passed, detail = '') => { checks.push({ name, passed: Boolean(passed), detail }); console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`); };
const apply = (script) => execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: temporary }, stdio: 'pipe' });
await writeFile(temporary, await readFile(source, 'utf8'), 'utf8');
let generated = '';
try { patches.forEach(apply); generated = await readFile(temporary, 'utf8'); } finally { await rm(temporary, { force: true }); }
const runtime = await readFile(path.join(root, 'runtime', 'sw-ui-001-newspaper-presentation.js'), 'utf8');
check('newspaper runtime is bundled after accepted Moo executor', generated.indexOf('[SW:SOURCE:sw-game-002-moo-level.js]') < generated.indexOf('[SW:SOURCE:sw-ui-001-newspaper-presentation.js]') && generated.includes('SW_UI_001_NEWSPAPER_PRESENTATION_V1'));
check('player-facing masthead uses canonical full product name', generated.includes("setNewspaperText(title, 'SEVERE WEATHER WARNING')") && generated.includes('SEVERE WEATHER WARNING · EVENING EDITION'));
check('selector keeps source storm cards and their existing handlers', generated.includes("node.setAttribute('role', 'button')") && generated.includes("selectMenuStorm('tornado')") && generated.includes("startRunFromMenu()"));
check('Unleash Storm is a newspaper-native callout', generated.includes('EXTRA! EXTRA! ISSUE THE WARNING!') && generated.includes('UNLEASH STORM'));
check('results story reads existing score and stat UI truth', generated.includes("newspaperText('resScore'") && generated.includes("newspaperText('resSubstations'") && generated.includes("newspaperText('resCosmetic'"));
check('Moo Level card is decorated without changing its unlock implementation', generated.includes("node.id === 'menuCardMooLevel'") && generated.includes('mooLevelUnlocked') && !runtime.includes('MOO_LEVEL_STORAGE_KEY') && !runtime.includes('startMooLevelFromMenu ='));
check('presentation runtime does not retune protected gameplay authority', !/addScore\s*=|finishRun\s*=|startRunFromMenu\s*=|selectMenuStorm\s*=|storm\.speed\s*=|cooldowns\./.test(runtime));
check('opening treatment is conditional and leaves cinematic lifecycle untouched', runtime.includes('decorateOpeningNewspaperWhenPresent') && !runtime.includes('identityLaunchIntro =') && !runtime.includes('identityFinishIntro ='));
const failed = checks.filter(entry => !entry.passed);
console.log(JSON.stringify({ task: 'SW-UI-001', checks, passed: failed.length === 0 }, null, 2));
if (failed.length) process.exit(1);
