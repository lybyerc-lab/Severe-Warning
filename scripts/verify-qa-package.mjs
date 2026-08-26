import { access, readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractInlinedRegions,
  joinRegions,
  MODERNIZATION_BRIDGE_REGIONS,
  PRODUCTION_SLICE_REGIONS,
} from './lib/inlined-regions.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const wwwDir = process.env.SEVERE_WEATHER_WWW_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_WWW_DIR)
  : path.join(projectRoot, 'www');
const indexPath = path.join(wwwDir, 'index.html');
const packageJson = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'));
const expectedVersion = `v${packageJson.version}`;
const results = [];

function record(name, passed, detail = '') {
  results.push({ name, passed: Boolean(passed), detail });
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`);
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

// [SW:BUILD:MODELS] Every model the build says it packaged must actually be in
// the package. build-web.mjs discovers models from assets/models rather than
// from a list here, so this asserts against what that build recorded instead of
// a second hardcoded roster that could drift from it. Zero models is valid --
// the loader falls back to procedural geometry -- so an empty manifest passes.
try {
  const buildInfo = JSON.parse(await readFile(path.join(wwwDir, 'build-info.json'), 'utf8'));
  const models = Array.isArray(buildInfo.models) ? buildInfo.models : [];
  record('models manifest present', Array.isArray(buildInfo.models), `${models.length} model(s)`);
  for (const model of models) {
    await requireFile(model.file);
    try {
      const bytes = await readFile(path.join(wwwDir, model.file));
      const magicOk = bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'glTF';
      const digest = createHash('sha256').update(bytes).digest('hex');
      record(`model ${model.file} is binary glTF`, magicOk);
      record(`model ${model.file} matches manifest sha256`, digest === model.sha256,
        digest === model.sha256 ? `${model.bytes} bytes` : `expected ${model.sha256}, packaged ${digest}`);
    } catch (error) {
      record(`model ${model.file} readable`, false, error.message);
    }
  }
} catch (error) {
  record('read www/build-info.json', false, error.message);
}

let html = '';
try {
  html = await readFile(indexPath, 'utf8');
} catch (error) {
  record('read www/index.html', false, error.message);
}

const requiredMarkers = [
  ['package build identity', expectedVersion],
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
  // The pointless 'const added = multiplied' alias was dropped when addScore was
  // restructured to gate the combo on points actually landing. The assertion that
  // matters is that the accumulation is unclamped, which this still checks.
  ['score accumulation', 'destructionScore += multiplied'],
  ['QA4 Visual Lab', '[SW:UI:QA4_VISUAL_LAB]'],
  ['QA4 deterministic runtime', '[SW:QA:DETERMINISTIC_TEST]'],
  ['QA4 report version', 'QA4_DETERMINISTIC_V1'],
  ['QA4 report global', '__SEVERE_WEATHER_QA4_REPORT__'],
  ['3999 boundary exercise', 'qa4ExerciseScoreBoundary(3999)'],
  ['7999 boundary exercise', 'qa4ExerciseScoreBoundary(7999)'],
  ['input isolation UI', '[SW:UI:QA4_INPUT_ISOLATION_V1]'],
  ['input isolation runtime', '[SW:QA:INPUT_ISOLATION]'],
  ['input shield', 'window.__SW_QA_INPUT_SHIELD_UNTIL__'],
  ['QA4 run lock', 'QA4_RUN_LOCK_V1'],
  ['pause forensics runtime', '[SW:QA:PAUSE_FORENSICS]'],
  ['pause overlay hidden markup', '<div id="pauseOverlay" hidden inert aria-hidden="true">'],
  ['central pause state helper', 'function setPauseOverlayActive(active)'],
  ['pause hard hide', 'PAUSE_OVERLAY_HARD_HIDE_V2'],
  ['rampage resolver', 'function getRampageFeedbackLayer()'],
  ['QA4 popup assertion V4', 'QA4_POPUP_ASSERTION_V4'],
  ['popup batch flush', 'flushRampageHudPopups();'],
  ['v5.1 production slice', 'V510_THREEJS_PRODUCTION_SLICE_V1'],
  ['v5.1 production styling', 'v510ProductionSliceStyles'],
  ['v5.1 production quality control', 'btnProductionQuality'],
  ['v5.1 lexical bundle', '[SW:VISUAL:PRODUCTION_SLICE_BUNDLE]'],
  ['v5.1 update hook', '__SW_V510_UPDATE__'],
  ['v5.1 rebuild hook', '__SW_V510_REBUILD__'],
  // The modern TypeScript shell refuses to boot unless all four lexical bridges
  // are present in the SAME script scope as the gameplay code. They shipped
  // missing for months: modern-shell.js threw "Legacy runtime contract is
  // incomplete" on every page load, the error was caught, and the whole modern
  // layer sat inert while every gate stayed green. These checks exist so that
  // cannot happen silently again.
  ['modern bridge: clocks', 'MODERNIZATION_PHASE2_CLOCKS_V1'],
  ['modern bridge: input and abilities', 'MODERNIZATION_PHASE3_INPUT_ABILITIES_V1'],
  ['modern bridge: scoring and campaign', 'MODERNIZATION_PHASE4_SCORING_CAMPAIGN_V2'],
  ['modern bridge: presentation and world', 'MODERNIZATION_PHASE5_PRESENTATION_WORLD_V2'],
  ['modern bridge: UI', 'MODERNIZATION_PHASE6_UI_V1'],
  ['modern bridge: audio and traffic', 'MODERNIZATION_PHASE7_AUDIO_TRAFFIC_V1'],
  ['modern bridge: engine', 'MODERNIZATION_PHASE8_ENGINE_V1'],
  ['MOO-LAH economy system', 'SW_RPG_001_MOOLAH_STORM_TRIANGLE_V1'],
  ['newspaper presentation system', 'SW_UI_001_NEWSPAPER_PRESENTATION_V1'],
  ['playable opening cinematic', 'SW_CIN_003_PLAYABLE_OPENING_V1'],
  ['landmark animations system', 'SW_ANIM_001_LANDMARK_ANIMATIONS_V1'],
  ['shop storefront modal', 'SW_UI_002_SHOP_MODAL_V1'],
  ['modern bridge: clock sample is authoritative', 'modernClockSample.runDeltaMs / 1000'],
  // [SW:ARCH:ECONOMY_PRELUDE] The extracted, unit-tested economy has to be inlined
  // AND actually called. The gameplay keeps literal fallbacks so a missing prelude
  // degrades instead of throwing mid-run, which means its absence would otherwise
  // be invisible - the game would just quietly run on the old inline numbers again.
  ['economy prelude bundled', '[SW:SOURCE:sw-economy-prelude.js]'],
  ['economy prelude identity', 'SW_ECONOMY_V1'],
  ['economy drives the EF rating', 'economy.resolveEfRating(currentStage, destructionScore'],
  ['economy drives the grade', 'gradeEconomy.resolveGrade({']
];

for (const [name, marker] of requiredMarkers) record(name, html.includes(marker), marker);
for (const region of PRODUCTION_SLICE_REGIONS) {
  const sourceMarker = `[SW:SOURCE:${region}]`;
  record(`bundled source marker ${region}`, html.includes(sourceMarker), sourceMarker);
}
record('runtime avoids isolated script scope', !html.includes('<script src="runtime/v510-'));
record('no stale runtime copy shipped', !html.includes('<script src="runtime/'));

const forbiddenMarkers = [
  ['stale v4.5 identity', 'v4.5.0'],
  ['stale v5.0 identity', 'v5.0.0'],
  ['direct unisolated QA click binding', "getCachedEl('visualLabRun')?.addEventListener('click', runQa4DeterministicTest)"],
  ['2999 score hard cap', 'Math.min(2999, targetScore)'],
  ['3999 score hard cap', 'Math.min(3999, targetScore)'],
  ['7999 score hard cap', 'Math.min(7999, targetScore)'],
  ['legacy strict score caps', 'STRICT STAGE SCORE HARD CAPS'],
  ['stale popup assertion V2', 'QA4_POPUP_ASSERTION_V2'],
  ['stale popup assertion V3', 'QA4_POPUP_ASSERTION_V3']
];
for (const [name, marker] of forbiddenMarkers) record(`absent ${name}`, !html.includes(marker), marker);

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

try {
  // Read the slice out of the PACKAGED page. This used to read mirrored
  // runtime/*.js copies that build-web.mjs shipped alongside the bundle purely
  // so this check had something to read - dead weight in the APK, and a second
  // file to keep in step by hand.
  const packagedRegions = extractInlinedRegions(html);
  const runtime = joinRegions(packagedRegions, PRODUCTION_SLICE_REGIONS);
  for (const marker of [
    '[SW:VISUAL:PRODUCTION_SLICE]',
    '[SW:VISUAL:TORNADO_LAYERS]',
    '[SW:WORLD:PRODUCTION_DRESSING]',
    '[SW:WORLD:SIGNATURE_BARN]',
    '[SW:QA:PRODUCTION_SLICE]',
    'getProductionSliceQaState',
    'triggerProductionSliceQa',
    'productionMeasuredFps'
  ]) record(`runtime marker ${marker}`, runtime.includes(marker), marker);

  // The check that actually earns its keep: what shipped is what was authored.
  // Comparing the packaged page against the gameplay source catches a stale or
  // half-built bundle, which comparing it against a third copy never could.
  const authoredRegions = extractInlinedRegions(
    await readFile(path.join(projectRoot, 'MechanicsLab', 'SevereWeather_Warning.html'), 'utf8'),
  );
  for (const region of [...PRODUCTION_SLICE_REGIONS, ...MODERNIZATION_BRIDGE_REGIONS]) {
    const packaged = packagedRegions.get(region);
    const authored = authoredRegions.get(region);
    record(
      `packaged region matches source ${region}`,
      Boolean(packaged) && packaged === authored,
      `${packaged?.length ?? 0} vs ${authored?.length ?? 0} chars`,
    );
  }
  record('runtime has no synthetic FPS fallback', !/productionMeasuredFps\(\)\s*(?:\|\||\?\?)\s*60/.test(runtime));
} catch (error) {
  record('runtime parse inputs', false, error.message);
}

const inlineScripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
record('inline scripts found', inlineScripts.length >= 1, `${inlineScripts.length} scripts`);
inlineScripts.forEach((source, index) => {
  try {
    new Function(source);
    record(`inline script ${index + 1} syntax`, true);
  } catch (error) {
    record(`inline script ${index + 1} syntax`, false, error.message);
  }
});

const failures = results.filter(result => !result.passed);
console.log(`\nQA package verification: ${results.length - failures.length}/${results.length} checks passed.`);
if (failures.length > 0) {
  console.error(`Failed checks: ${failures.map(result => result.name).join(', ')}`);
  process.exitCode = 1;
}
