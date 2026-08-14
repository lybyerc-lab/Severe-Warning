import { readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const temporary = path.join(root, '.sw-level-001-verify.html');
const checks = [];
const patchScripts = [
  'apply-v431-source-patch.mjs', 'apply-v440-source-patch.mjs', 'apply-v441-source-patch.mjs', 'apply-v442-source-patch.mjs',
  'fix-v450-parser.mjs', 'apply-v450-source-patch.mjs', 'apply-v450-rampage-music-patch.mjs', 'apply-qa-corrections-patch.mjs',
  'apply-audio-mix-followup-patch.mjs', 'apply-ui-polish-followup-patch.mjs', 'apply-score-continuity-fix.mjs', 'apply-qa4-deterministic-lab-patch.mjs',
  'apply-qa4-mobile-input-fix.mjs', 'apply-qa4-run-lock-fix.mjs', 'apply-qa4-pause-forensics.mjs', 'apply-pause-overlay-hit-test-fix.mjs',
  'apply-pause-overlay-hard-hide.mjs', 'apply-qa4-popup-assertion-fix.mjs', 'apply-v500-campaign-patch.mjs', 'apply-v500-realtime-clock-fix.mjs',
  'apply-v500-world-tour-patch.mjs', 'apply-v500-mobile-layout-fix.mjs', 'apply-v500-cow-signature-patch.mjs',
];
function check(name, passed, detail = '') { checks.push({ name, passed: Boolean(passed), detail }); console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`); }
function apply(script) { execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: temporary }, stdio: 'pipe' }); }
function verify(script) { execFileSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env: { ...process.env, SEVERE_WEATHER_SOURCE_PATH: temporary }, stdio: 'inherit' }); }

await writeFile(temporary, await readFile(source, 'utf8'), 'utf8');
let generated = '';
try {
  patchScripts.forEach(apply);
  verify('verify-v500-campaign.mjs');
  apply('apply-v510-production-slice.mjs');
  verify('verify-v510-production-slice.mjs');
  apply('apply-sw-game-002-moo-level.mjs');
  apply('apply-sw-level-001-storm-site-framework.mjs');
  generated = await readFile(temporary, 'utf8');
} finally { await rm(temporary, { force: true }); }

const runtime = await readFile(path.join(root, 'runtime', 'sw-level-001-storm-site-framework.js'), 'utf8');
check('Storm Site runtime is bundled into the accepted executor', generated.includes('[SW:SOURCE:sw-level-001-storm-site-framework.js]') && generated.includes('SW_LEVEL_001_STORM_SITE_FRAMEWORK_V1'));
check('registry keeps campaign home and both proof sites in one definition path', ['heartland-home', 'county-fair', 'coastal-boardwalk'].every(id => runtime.includes(`'${id}'`)) && runtime.includes('STORM_SITE_REGISTRY'));
check('proof sites share the same start contract', runtime.includes("return stormSiteBaseStartRunFromMenu()") && runtime.includes("mode: 'storm-site'"));
check('fairground and boardwalk have materially distinct authored modules', runtime.includes("moduleSet: ['midway'") && runtime.includes("moduleSet: ['boardwalk'"));
check('each proof site declares bounded authored replay variants', runtime.includes("replayVariants: ['harvest-night', 'sponsor-swap']") && runtime.includes("replayVariants: ['neon-tide', 'storm-surge-sponsors']"));
check('boat feat remains a signal with no Waterspout progression authority', runtime.includes("signal: 'boat-launch'") && runtime.includes("rule: 'boat-launch-signal-only'") && !/waterspout.*unlock|unlock.*waterspout/i.test(runtime));
check('real production executor calls Storm Site telemetry', runtime.includes('globalThis.__SW_V510_UPDATE__ = function stormSiteExecutorUpdate') && runtime.includes('stormSiteRuntimeTicks++'));
check('home launch disposes Storm Site state after the accepted campaign world rebuild', runtime.includes('function restoreAcceptedCampaignWorld()') && runtime.includes('disposeStormSiteWorld();\n  restoreAcceptedWorldVisibility();') && runtime.includes("if (site.id === STORM_SITE_HOME_ID) { restoreAcceptedCampaignWorld(); return; }"));
check('Storm Site launch bypasses only an active Heartland opening overlay', runtime.includes('function dismissHeartlandOpeningForStormSite()') && runtime.includes('dismissHeartlandOpeningForStormSite();') && runtime.includes("sessionStorage.removeItem('severe_weather_moo_brew_intro_seen')"));
check('Coastal QA names the real boat-launch signal instead of first-created signature', runtime.includes("destroySignature(signature)") && runtime.includes("'boat-launch-signal'") && runtime.includes("entry.stormSiteSignature ==="));
check('Storm Site runtime does not retune protected movement, abilities, scoring, Grid Zap, Moo, or tornado renderer', !/storm\.speed\s*=|storm\.radius\s*=|cooldowns\.|triggerGridZap|mooLevelProgress\s*=|createProductionTornadoLayers|destructionScore\s*=|runTimeRemaining\s*=/.test(runtime));
check('historical gameplay source remains unmodified by verification', !(await readFile(source, 'utf8')).includes('SW_LEVEL_001_STORM_SITE_FRAMEWORK_V1'));

const failed = checks.filter(entry => !entry.passed);
console.log(JSON.stringify({ task: 'SW-LEVEL-001', checks, passed: failed.length === 0 }, null, 2));
if (failed.length) process.exit(1);
