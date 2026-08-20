import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

let html = await readFile(sourcePath, 'utf8');

function countMatches(needle) {
  return html.split(needle).length - 1;
}

function replaceExact(before, after, label) {
  const count = countMatches(before);
  if (count !== 1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  html = html.replace(before, after);
}

function requireMarker(marker) {
  if (!html.includes(marker)) throw new Error(`v5.0.0 campaign verification failed: missing ${marker}`);
}

const finalMarkers = [
  'V500_CAMPAIGN_FOUNDATION_V1',
  '[SW:CAMPAIGN:HEARTLAND]',
  'severe_weather_campaign_v1',
  'HEARTLAND_CAMPAIGN',
  'function selectCampaignLevel',
  'function completeCampaignRun',
  'function startNextCampaignLevel',
  'campaignScoreMultiplier',
  'campaignMapGrid',
  'campaignOutcome'
];

if (html.includes('V500_CAMPAIGN_FOUNDATION_V1')) {
  finalMarkers.forEach(requireMarker);
  console.log(`v5.0.0 Heartland campaign patch already applied to ${sourcePath}`);
  process.exit(0);
}

const versionCount = countMatches('v4.5.0');
if (versionCount < 5) throw new Error(`build identity: expected at least five v4.5.0 markers, found ${versionCount}`);
html = html.split('v4.5.0').join('v5.0.0');
html = html.replace('Storm Feel Overhaul', 'Heartland Campaign Foundation');
html = html.split('STORM FEEL').join('HEARTLAND CAMPAIGN');

replaceExact(
  '  .start-btn:active { transform: scale(0.94); }',
  `  .start-btn:active { transform: scale(0.94); }

  /* V500_CAMPAIGN_FOUNDATION_V1: compact TV-weather-map campaign navigation. */
  .campaign-map { margin: 12px 0 8px; padding: 10px; border: 1px solid rgba(56,189,248,0.42); border-radius: 14px; background: linear-gradient(145deg, rgba(8,47,73,0.7), rgba(15,23,42,0.88)); text-align: left; }
  .campaign-map-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; color: #e0f2fe; }
  .campaign-map-head strong { font: 900 12px/1 Outfit, sans-serif; letter-spacing: 0.08em; }
  #campaignStarTotal { color: var(--gold); font: 900 11px/1 Inter, sans-serif; }
  .campaign-map-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; }
  .campaign-stop { min-height: 70px; border: 1px solid rgba(148,163,184,0.34); border-radius: 10px; padding: 7px; background: rgba(3,7,18,0.72); color: #e2e8f0; text-align: left; cursor: pointer; touch-action: manipulation; }
  .campaign-stop strong { display: block; color: inherit; font: 900 10px/1.1 Outfit, sans-serif; letter-spacing: 0.03em; }
  .campaign-stop small { display: block; margin-top: 4px; color: #94a3b8; font: 700 8px/1.2 Inter, sans-serif; }
  .campaign-stop .campaign-stars { margin-top: 5px; color: var(--gold); font-size: 9px; letter-spacing: 0.05em; }
  .campaign-stop.selected { border-color: var(--gold); background: rgba(120,53,15,0.62); box-shadow: 0 0 16px rgba(251,191,36,0.24); }
  .campaign-stop.locked { opacity: 0.42; filter: grayscale(0.75); cursor: not-allowed; }
  #campaignBrief { min-height: 28px; margin-top: 8px; color: #bae6fd; font: 700 9px/1.35 Inter, sans-serif; }
  .campaign-hud-chip { margin: 4px 0 0; color: #fde68a; font: 900 9px/1.2 Inter, sans-serif; letter-spacing: 0.07em; }
  .campaign-result { margin: 9px 0 0; padding: 8px 10px; border: 1px solid rgba(56,189,248,0.4); border-radius: 9px; background: rgba(8,47,73,0.35); color: #e0f2fe; font: 800 11px/1.35 Inter, sans-serif; }
  .results-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 10px; }
  .results-actions .retry-btn { margin: 0; }
  .campaign-next-btn { background: linear-gradient(135deg, #22c55e, #15803d) !important; }
  .campaign-next-btn[hidden] { display: none !important; }
  @media (max-width: 760px), (max-height: 540px) {
    .campaign-map { margin: 8px 0 5px; padding: 7px; }
    .campaign-map-grid { gap: 5px; }
    .campaign-stop { min-height: 55px; padding: 5px; }
    .campaign-stop strong { font-size: 8px; }
    .campaign-stop small { display: none; }
    .campaign-stop .campaign-stars { margin-top: 4px; font-size: 8px; }
  }`,
  'campaign presentation styles'
);

replaceExact(
  '    <div class="menu-sub">ARCADE DISASTER SIMULATOR v5.0.0 HEARTLAND CAMPAIGN</div>\n    \n    <div class="storm-select-grid">',
  `    <div class="menu-sub">ARCADE DISASTER SIMULATOR v5.0.0 HEARTLAND CAMPAIGN</div>

    <section class="campaign-map" aria-label="Heartland campaign map">
      <div class="campaign-map-head"><strong>LIVE WEATHER MAP: HEARTLAND TOUR</strong><span id="campaignStarTotal">0/12 STARS</span></div>
      <div class="campaign-map-grid" id="campaignMapGrid"></div>
      <div id="campaignBrief">Select a county broadcast to begin.</div>
    </section>

    <div class="storm-select-grid">`,
  'campaign map markup'
);

replaceExact(
  '        <p id="stormDesc">DISTRICT 1: PINE RIDGE - 03:00 REMAINING</p>',
  `        <p id="stormDesc">DISTRICT 1: PINE RIDGE - 03:00 REMAINING</p>
        <div class="campaign-hud-chip" id="campaignHud">HEARTLAND TOUR · LINCOLN COUNTY</div>`,
  'campaign HUD chip'
);

replaceExact(
  '    <button class="retry-btn" onclick="resetWarningRun()">RETRY RUN 🔄</button>',
  `    <div class="campaign-result" id="campaignOutcome">HEARTLAND TOUR RESULTS PENDING</div>
    <div class="results-actions">
      <button class="retry-btn" onclick="resetWarningRun()">RETRY COUNTY 🔄</button>
      <button class="retry-btn campaign-next-btn" id="btnNextCampaign" onclick="startNextCampaignLevel()" hidden>NEXT STOP ➜</button>
      <button class="retry-btn" onclick="quitToMainMenu()">WEATHER MAP</button>
    </div>`,
  'campaign results controls'
);

const campaignRuntime = String.raw`// ============================================================================
// [SW:CAMPAIGN:HEARTLAND]
// Purpose: Own reusable Heartland level contracts, unlocks, stars, and saves.
// Invariants:
// - Existing high scores and cosmetics remain compatible.
// - Campaign progress survives Android close and reopen through localStorage.
// - Locked stops cannot be launched through UI or direct function calls.
// ============================================================================
const CAMPAIGN_STORAGE_KEY = 'severe_weather_campaign_v1';
const HEARTLAND_CAMPAIGN = [
  {
    id: 'lincoln-county', name: 'LINCOLN COUNTY', shortName: 'LINCOLN', station: 'KSWX 8',
    brief: 'The original county run. Three districts, one very nervous insurance office.',
    scoreTarget: 8000, scoreMultiplier: 1.0, durationSeconds: 180,
    skyColor: '#0f172a', fogColor: '#0f172a', terrainTint: '#ffffff', sunColor: '#fef08a',
    spawn: { x: 0, z: 0 },
    districts: [
      ['PINE RIDGE', 'Neighborhood touchdown. Mind the lawn ornaments.'],
      ['MAIN STREET', 'Signs, shops and questionable insurance coverage.'],
      ['COUNTY FAIR', 'Blackout finale. The funnel cake stand had a good run.']
    ]
  },
  {
    id: 'prairie-junction', name: 'PRAIRIE JUNCTION', shortName: 'PRAIRIE', station: 'KPRJ 4',
    brief: 'Open-country crosswind. Longer sightlines and a 10% broadcast score bonus.',
    scoreTarget: 12000, scoreMultiplier: 1.10, durationSeconds: 180,
    skyColor: '#172554', fogColor: '#1e3a5f', terrainTint: '#dff7d2', sunColor: '#fde68a',
    spawn: { x: 120, z: -105 },
    districts: [
      ['WINDMILL ROW', 'The prairie has room to breathe. The sheds do not.'],
      ['PRAIRIE JUNCTION', 'A small rail town with a large debris forecast.'],
      ['RODEO GROUNDS', 'Live cameras, loose gates and one doomed scoreboard.']
    ]
  },
  {
    id: 'grain-belt', name: 'GRAIN BELT', shortName: 'GRAIN BELT', station: 'KGBN 11',
    brief: 'Industrial harvest corridor. Tougher targets pay a 15% chain-reaction bonus.',
    scoreTarget: 18000, scoreMultiplier: 1.15, durationSeconds: 180,
    skyColor: '#292524', fogColor: '#3f3a32', terrainTint: '#f0d79b', sunColor: '#fdba74',
    spawn: { x: -110, z: 80 },
    districts: [
      ['SILO COUNTY', 'Grain storage meets aggressive atmospheric redistribution.'],
      ['FOUNDRY ROW', 'Sheet metal, power lines and absolutely no indoor voice.'],
      ['HARVEST EXPO', 'The combines are parked. The grandstands are reconsidering.']
    ]
  },
  {
    id: 'state-fair-finale', name: 'STATE FAIR', shortName: 'STATE FAIR', station: 'LIVE NETWORK',
    brief: 'Heartland finale. Maximum cameras, maximum spectacle, 25% score bonus.',
    scoreTarget: 26000, scoreMultiplier: 1.25, durationSeconds: 180,
    skyColor: '#240b36', fogColor: '#33134a', terrainTint: '#ffd9a8', sunColor: '#f9a8d4',
    spawn: { x: 118, z: 118 },
    districts: [
      ['MIDWAY MILE', 'Every prize booth is now a wind-tunnel experiment.'],
      ['EXHIBITION ROW', 'Live television has requested a wider shot.'],
      ['STATE FAIR FINALE', 'Maximum mayhem beneath the championship lights.']
    ]
  }
];

let campaignProgress = { schema: 1, unlockedLevel: 0, selectedLevel: 0, levels: {} };
let selectedCampaignIndex = 0;

function normalizeCampaignProgress(value) {
  const safe = value && typeof value === 'object' ? value : {};
  const unlocked = Number.isInteger(safe.unlockedLevel) ? safe.unlockedLevel : 0;
  const selected = Number.isInteger(safe.selectedLevel) ? safe.selectedLevel : 0;
  return {
    schema: 1,
    unlockedLevel: Math.max(0, Math.min(HEARTLAND_CAMPAIGN.length - 1, unlocked)),
    selectedLevel: Math.max(0, Math.min(HEARTLAND_CAMPAIGN.length - 1, selected)),
    levels: safe.levels && typeof safe.levels === 'object' ? safe.levels : {}
  };
}

function loadCampaignProgress() {
  try {
    campaignProgress = normalizeCampaignProgress(JSON.parse(localStorage.getItem(CAMPAIGN_STORAGE_KEY) || '{}'));
  } catch (_) {
    campaignProgress = normalizeCampaignProgress({});
  }
  selectedCampaignIndex = Math.min(campaignProgress.selectedLevel, campaignProgress.unlockedLevel);
}

function saveCampaignProgress() {
  campaignProgress.selectedLevel = selectedCampaignIndex;
  try { localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaignProgress)); } catch (_) {}
}

function getActiveCampaignLevel() {
  return HEARTLAND_CAMPAIGN[selectedCampaignIndex] || HEARTLAND_CAMPAIGN[0];
}

function getCampaignStars(levelId) {
  const entry = campaignProgress.levels[levelId];
  return entry && Number.isFinite(entry.stars) ? Math.max(0, Math.min(3, entry.stars)) : 0;
}

function getCampaignTotalStars() {
  return HEARTLAND_CAMPAIGN.reduce((sum, level) => sum + getCampaignStars(level.id), 0);
}

function renderCampaignMap() {
  const grid = document.getElementById('campaignMapGrid');
  const brief = document.getElementById('campaignBrief');
  const total = document.getElementById('campaignStarTotal');
  if (!grid) return;
  grid.innerHTML = HEARTLAND_CAMPAIGN.map((level, index) => {
    const locked = index > campaignProgress.unlockedLevel;
    const selected = index === selectedCampaignIndex;
    const stars = getCampaignStars(level.id);
    return '<button type="button" class="campaign-stop' + (selected ? ' selected' : '') + (locked ? ' locked' : '') + '" ' +
      'onclick="selectCampaignLevel(' + index + ')" aria-disabled="' + locked + '">' +
      '<strong>' + (locked ? '🔒 ' : '') + level.name + '</strong>' +
      '<small>' + level.station + ' · TARGET ' + level.scoreTarget.toLocaleString() + '</small>' +
      '<span class="campaign-stars">' + '★'.repeat(stars) + '☆'.repeat(3 - stars) + '</span></button>';
  }).join('');
  const active = getActiveCampaignLevel();
  if (brief) brief.textContent = active.station + ': ' + active.brief;
  if (total) total.textContent = getCampaignTotalStars() + '/12 STARS';
}

function selectCampaignLevel(index) {
  if (!Number.isInteger(index) || index < 0 || index >= HEARTLAND_CAMPAIGN.length) return false;
  if (index > campaignProgress.unlockedLevel) {
    showGagToast('FORECAST LOCKED: CLEAR THE PREVIOUS COUNTY FIRST.');
    return false;
  }
  selectedCampaignIndex = index;
  saveCampaignProgress();
  renderCampaignMap();
  initAudio();
  playSound('click');
  return true;
}

function campaignScoreMultiplier() {
  return getActiveCampaignLevel().scoreMultiplier || 1;
}

function applyCampaignPresentation() {
  const level = getActiveCampaignLevel();
  level.districts.forEach((district, index) => {
    DISTRICTS[index + 1].name = district[0];
    DISTRICTS[index + 1].subtitle = district[1];
  });
  document.body.dataset.campaignLevel = level.id;
  scene.background.set(level.skyColor);
  scene.fog.color.set(level.fogColor);
  if (terrainMesh && terrainMesh.material) terrainMesh.material.color.set(level.terrainTint);
  if (countyApron && countyApron.material) countyApron.material.color.set(level.terrainTint);
  if (dirLight) dirLight.color.set(level.sunColor);
  storm.pos.set(level.spawn.x, terrainHeightAt(level.spawn.x, level.spawn.z), level.spawn.z);
  setUI('campaignHud', 'HEARTLAND TOUR · ' + level.name + ' · SCORE x' + level.scoreMultiplier.toFixed(2));
  setUI('districtTitle', level.districts[0][0]);
  setUI('districtSubtitle', level.districts[0][1]);
}

function completeCampaignRun(grade, score, objectivesDone) {
  const level = getActiveCampaignLevel();
  const previous = campaignProgress.levels[level.id] || { stars: 0, bestScore: 0, runs: 0, bestGrade: 'F' };
  let stars = 0;
  if (score >= level.scoreTarget * 1.5 && objectivesDone === 3) stars = 3;
  else if (score >= level.scoreTarget) stars = 2;
  else if (score >= level.scoreTarget * 0.6 || objectivesDone >= 2) stars = 1;
  const bestStars = Math.max(previous.stars || 0, stars);
  campaignProgress.levels[level.id] = {
    stars: bestStars,
    bestScore: Math.max(previous.bestScore || 0, Math.round(score)),
    runs: (previous.runs || 0) + 1,
    bestGrade: bestStars > (previous.stars || 0) ? grade : (previous.bestGrade || grade)
  };
  const cleared = stars > 0;
  const nextIndex = selectedCampaignIndex + 1;
  if (cleared && nextIndex < HEARTLAND_CAMPAIGN.length) {
    campaignProgress.unlockedLevel = Math.max(campaignProgress.unlockedLevel, nextIndex);
  }
  saveCampaignProgress();
  renderCampaignMap();
  const outcome = document.getElementById('campaignOutcome');
  const nextButton = document.getElementById('btnNextCampaign');
  if (outcome) {
    const unlockText = cleared && nextIndex < HEARTLAND_CAMPAIGN.length
      ? ' · NEXT: ' + HEARTLAND_CAMPAIGN[nextIndex].name + ' UNLOCKED'
      : (selectedCampaignIndex === HEARTLAND_CAMPAIGN.length - 1 && cleared ? ' · HEARTLAND TOUR COMPLETE!' : ' · HIT ' + Math.round(level.scoreTarget * 0.6).toLocaleString() + ' TO ADVANCE');
    outcome.textContent = level.name + ' · ' + '★'.repeat(stars) + '☆'.repeat(3 - stars) + ' · BEST ' + campaignProgress.levels[level.id].bestScore.toLocaleString() + unlockText;
  }
  if (nextButton) nextButton.hidden = !(cleared && nextIndex < HEARTLAND_CAMPAIGN.length);
}

function startNextCampaignLevel() {
  const nextIndex = selectedCampaignIndex + 1;
  if (nextIndex >= HEARTLAND_CAMPAIGN.length || nextIndex > campaignProgress.unlockedLevel) return false;
  selectedCampaignIndex = nextIndex;
  saveCampaignProgress();
  getCachedEl('resultsOverlay').classList.remove('active');
  resetWarningRun();
  return true;
}

loadCampaignProgress();
renderCampaignMap();
// [SW:CAMPAIGN:HEARTLAND:END]`;

replaceExact(
  'loadHighScores();\n\n\n// --- STORM TOWN ARCADE DISTRICTS, BONUS CHALLENGES & PERSISTENT COSMETIC ---',
  `loadHighScores();\n\n${campaignRuntime}\n\n// --- STORM TOWN ARCADE DISTRICTS, BONUS CHALLENGES & PERSISTENT COSMETIC ---`,
  'Heartland campaign runtime'
);

replaceExact(
  '  let multiplied = Math.round(pts * nextCombo);',
  '  let multiplied = Math.round(pts * nextCombo * campaignScoreMultiplier());',
  'campaign score modifier'
);

replaceExact(
  "  updateHighScore(currentStorm, destructionScore);\n  getCachedEl('resultsOverlay').classList.add('active');",
  "  updateHighScore(currentStorm, destructionScore);\n  completeCampaignRun(grade, destructionScore, doneCount);\n  getCachedEl('resultsOverlay').classList.add('active');",
  'campaign run completion'
);

replaceExact(
  'function resetWarningRun() {\n  resetStormAudioState();\n  runTimeRemaining = 180;',
  'function resetWarningRun() {\n  resetStormAudioState();\n  runTimeRemaining = getActiveCampaignLevel().durationSeconds;',
  'campaign run duration'
);

replaceExact(
  "  init3DWorld();\n  selectStormClass(currentStorm);",
  "  init3DWorld();\n  applyCampaignPresentation();\n  selectStormClass(currentStorm);",
  'campaign world presentation'
);

replaceExact(
  "  if (menu) {\n    menu.classList.remove('hidden');\n    menu.style.display = 'flex';\n    menu.style.pointerEvents = 'auto';\n    menu.style.opacity = '1';\n    menu.style.visibility = 'visible';\n  }\n}",
  "  if (menu) {\n    menu.classList.remove('hidden');\n    menu.style.display = 'flex';\n    menu.style.pointerEvents = 'auto';\n    menu.style.opacity = '1';\n    menu.style.visibility = 'visible';\n    renderCampaignMap();\n  }\n}",
  'return to campaign map'
);

replaceExact(
  "  setTimeout(() => scene.background.set('#030712'), 90);",
  "  setTimeout(() => scene.background.set(getActiveCampaignLevel().skyColor), 90);",
  'campaign sky restore'
);

finalMarkers.forEach(requireMarker);
if (html.includes('v4.5.0')) throw new Error('v5.0.0 build identity still contains v4.5.0');

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied v5.0.0 Heartland Campaign Foundation patch to ${sourcePath}`);
