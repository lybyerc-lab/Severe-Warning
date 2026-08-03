import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const wwwDir = process.env.SEVERE_WEATHER_WWW_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_WWW_DIR)
  : path.join(projectRoot, 'www');
const indexPath = path.join(wwwDir, 'index.html');

const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed: Boolean(passed), detail });
  const symbol = passed ? 'PASS' : 'FAIL';
  console.log(`${symbol} ${name}${detail ? ` :: ${detail}` : ''}`);
}

async function requireFile(relativePath) {
  const fullPath = path.join(wwwDir, relativePath);
  try {
    await access(fullPath);
    const info = await stat(fullPath);
    record(`file ${relativePath}`, info.isFile() && info.size > 0, `${info.size} bytes`);
  } catch (error) {
    record(`file ${relativePath}`, false, error.message);
  }
}

for (const relativePath of [
  'index.html',
  '404.html',
  'qa-build.json',
  'audio/storm-feel-sprite.wav',
  'audio/storm-feel-manifest.json'
]) {
  await requireFile(relativePath);
}

let html = '';
try {
  html = await readFile(indexPath, 'utf8');
} catch (error) {
  record('read www/index.html', false, error.message);
}

const requiredMarkers = [
  ['v5 campaign identity', 'v5.0.0'],
  ['v5 campaign foundation', 'V500_CAMPAIGN_FOUNDATION_V1'],
  ['Heartland campaign anchor', '[SW:CAMPAIGN:HEARTLAND]'],
  ['Heartland level contracts', 'HEARTLAND_CAMPAIGN'],
  ['persistent campaign save', 'severe_weather_campaign_v1'],
  ['bovine signature system', 'V500_BOVINE_SIGNATURE_V1'],
  ['bovine persistent save', 'severe_weather_bovine_v1'],
  ['safe animal law', '[SW:LAW:SAFE-ANIMALS]'],
  ['Cow 17 continuity QA', 'getBovineQaState'],
  ['Cow-Cam deterministic QA', 'triggerCowCamQa'],
  ['bovine end report', 'BOVINE SITUATION REPORT'],
  ['Moo Brew sponsor disclaimer', 'Moo Brew accepts no responsibility for atmospheric cattle'],
  ['campaign weather map', 'campaignMapGrid'],
  ['campaign unlock guard', 'index > campaignProgress.unlockedLevel'],
  ['campaign completion', 'function completeCampaignRun'],
  ['QA build stamp', 'QA_BUILD_STAMP'],
  ['rampage feedback layer', 'rampageFeedbackLayer'],
  ['dynamic music low', 'music_drive_low'],
  ['dynamic music high', 'music_drive_high'],
  ['audio lab', 'audioLabPanel'],
  ['audio event log', '[SW:AUDIO:EVENT_LOG]'],
  ['decoded clip energy', 'decodedClipEnergy'],
  ['glass throttle', 'glass-throttled'],
  ['audio bus gains', 'AUDIO_BUS_BASE_GAINS'],
  ['audio mix target', 'effects: 0.68, music: 1.00'],
  ['synthetic source disabled', 'disabled-synthetic-source'],
  ['effect ducking', 'effectActivity >= 5 ? 0.54'],
  ['chain reaction feedback', 'CHAIN REACTION x'],
  ['combo threshold', 'comboMultiplier >= 3.5'],
  ['district forward-only law', '[SW:LAW:DISTRICTS-FORWARD-ONLY]'],
  ['monotonic district stage', 'const nextStage = Math.max(currentStage, timeStage)'],
  ['stage three timing', 'stage3ElapsedSeconds'],
  ['top-band UI polish', 'UI_POLISH_TOP_BAND_V1'],
  ['district ribbon UI', 'UI_POLISH_DISTRICT_RIBBON_V1'],
  ['district dwell', 'isBotMode ? 450 : 1250'],
  ['score continuity', 'SCORE_CONTINUITY_V1'],
  ['score accumulation', 'destructionScore += added'],
  ['QA4 Visual Lab', '[SW:UI:QA4_VISUAL_LAB]'],
  ['QA4 deterministic runtime', '[SW:QA:DETERMINISTIC_TEST]'],
  ['QA4 report version', 'QA4_DETERMINISTIC_V1'],
  ['QA4 report global', '__SEVERE_WEATHER_QA4_REPORT__'],
  ['3999 boundary exercise', 'qa4ExerciseScoreBoundary(3999)'],
  ['7999 boundary exercise', 'qa4ExerciseScoreBoundary(7999)'],
  ['input isolation UI', '[SW:UI:QA4_INPUT_ISOLATION_V1]'],
  ['input isolation runtime', '[SW:QA:INPUT_ISOLATION]'],
  ['input shield', 'window.__SW_QA_INPUT_SHIELD_UNTIL__'],
  ['input isolation check', "qa4SetCheck('inputIsolation'"],
  ['QA4 run lock', 'QA4_RUN_LOCK_V1'],
  ['QA4 test lock activation', 'window.__SW_QA_TEST_LOCK__ = true'],
  ['blocked pause counter', 'blockedPauseAttempts'],
  ['pause forensics UI', '[SW:UI:QA4_PAUSE_FORENSICS_V1]'],
  ['pause forensics runtime', '[SW:QA:PAUSE_FORENSICS]'],
  ['pause forensics version', 'QA4_PAUSE_FORENSICS_V1'],
  ['pause trace global', '__SW_QA_PAUSE_TRACE__'],
  ['forensic query mode', "qa4Mode === 'forensic'"],
  ['pause hit-test fix', 'PAUSE_OVERLAY_HIT_TEST_V1'],
  ['inactive pause descendants blocked', '#pauseOverlay:not(.active) .pause-btn'],
  ['pause overlay hidden markup', '<div id="pauseOverlay" hidden inert aria-hidden="true">'],
  ['central pause state helper', 'function setPauseOverlayActive(active)'],
  ['pause inert ownership', 'overlay.inert = !enabled'],
  ['pause hard hide', 'PAUSE_OVERLAY_HARD_HIDE_V2'],
  ['hidden pause selector', '#pauseOverlay[hidden]'],
  ['pause hidden state', 'overlay.hidden = !enabled'],
  ['pause display ownership', "overlay.style.display = enabled ? 'flex' : 'none'"],
  ['forensic build identity', 'buildIdentity:'],
  ['rampage layer fallback', 'QA4_RAMPAGE_LAYER_LOOKUP_V1'],
  ['rampage resolver', 'function getRampageFeedbackLayer()'],
  ['direct rampage DOM fallback', "document.getElementById('rampageFeedbackLayer')"],
  ['QA4 popup assertion V4', 'QA4_POPUP_ASSERTION_V4'],
  ['popup queue inspection', 'const queuedHits = pendingRampageHits.length'],
  ['popup batch flush', 'flushRampageHudPopups();'],
  ['popup DOM inspection', "querySelectorAll('.rampage-popup')"],
  ['popup expected label', "text.includes('DEMOLISHED!')"]
];

for (const [name, marker] of requiredMarkers) {
  record(name, html.includes(marker), marker);
}

const forbiddenMarkers = [
  ['stale v4.5 identity', 'v4.5.0'],
  ['direct unisolated QA click binding', "getCachedEl('visualLabRun')?.addEventListener('click', runQa4DeterministicTest)"],
  ['2999 score hard cap', 'Math.min(2999, targetScore)'],
  ['3999 score hard cap', 'Math.min(3999, targetScore)'],
  ['7999 score hard cap', 'Math.min(7999, targetScore)'],
  ['legacy strict score caps', 'STRICT STAGE SCORE HARD CAPS'],
  ['legacy centered rampage banner', 'left: 50%; top: 33%; width: max-content; max-width: 88vw'],
  ['duplicate synthetic click/glass trigger', "playSound('click');\n  playSound('glass');"],
  ['unconditional pause button hit testing', '.pause-btn { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 10px 20px; border-radius: 10px; font-weight: 800; font-size: 13px; cursor: pointer; pointer-events: auto !important;'],
  ['stale popup assertion V2', 'QA4_POPUP_ASSERTION_V2'],
  ['stale popup assertion V3', 'QA4_POPUP_ASSERTION_V3']
];

for (const [name, marker] of forbiddenMarkers) {
  record(`absent ${name}`, !html.includes(marker), marker);
}

try {
  const manifest = JSON.parse(await readFile(path.join(wwwDir, 'audio/storm-feel-manifest.json'), 'utf8'));
  const clips = Object.keys(manifest.clips || {});
  record('audio clip count', clips.length === 44, `found ${clips.length}`);
  for (const name of ['music_drive_low', 'music_drive_high', 'music_rampage_stinger']) {
    record(`audio clip ${name}`, clips.includes(name));
  }
} catch (error) {
  record('audio manifest parse', false, error.message);
}

const failures = results.filter(result => !result.passed);
console.log(`\nQA package verification: ${results.length - failures.length}/${results.length} checks passed.`);
if (failures.length > 0) {
  console.error(`Failed checks: ${failures.map(result => result.name).join(', ')}`);
  process.exitCode = 1;
}
