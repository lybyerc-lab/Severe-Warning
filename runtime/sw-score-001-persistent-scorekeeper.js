// ============================================================================
// [SW:GAME:SCOREKEEPER_V1]
// Local-first score records. This observer runs after the accepted campaign,
// Moo Level, and newspaper executors; it never calculates or awards run score.
// ============================================================================
const SW_SCOREKEEPER_MARKER = 'SW_SCORE_001_PERSISTENT_SCOREKEEPER_V1';
const SCOREKEEPER_STORAGE_KEY = 'severe_weather_scorekeeper_v1';
const SCOREKEEPER_SCHEMA_VERSION = 1;
const SCOREKEEPER_GAME_BUILD = '5.1.0';
const SCOREKEEPER_SCORING_VERSION = 'legacy-score-rules-v5.1.0';
const SCOREKEEPER_FUTURE_METADATA = Object.freeze({
  stormTriangleVersion: null,
  upgradeLoadoutVersion: null,
  authority: 'reserved-not-active'
});

let scorekeeperStore = loadScorekeeperStore();
let scorekeeperLastResult = null;

function scorekeeperNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function scorekeeperUiText(id, fallback = '') {
  return document.getElementById(id)?.textContent?.trim() || fallback;
}

function scorekeeperEmptyStore() {
  return {
    schemaVersion: SCOREKEEPER_SCHEMA_VERSION,
    records: {},
    futureMetadata: { ...SCOREKEEPER_FUTURE_METADATA }
  };
}

function loadScorekeeperStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SCOREKEEPER_STORAGE_KEY) || '{}');
    if (!parsed || parsed.schemaVersion !== SCOREKEEPER_SCHEMA_VERSION || typeof parsed.records !== 'object') return scorekeeperEmptyStore();
    return {
      schemaVersion: SCOREKEEPER_SCHEMA_VERSION,
      records: parsed.records || {},
      futureMetadata: { ...SCOREKEEPER_FUTURE_METADATA, ...(parsed.futureMetadata || {}) }
    };
  } catch (_) {
    return scorekeeperEmptyStore();
  }
}

function saveScorekeeperStore() {
  try {
    localStorage.setItem(SCOREKEEPER_STORAGE_KEY, JSON.stringify(scorekeeperStore));
    return true;
  } catch (_) {
    return false;
  }
}

function scorekeeperRankValue(rank) {
  return ({ F: 0, C: 1, B: 2, A: 3, 'S+': 4, 'MOO PRACTICE': 0, 'HERD READY': 2, 'UDDER CHAOS': 4 })[String(rank || '').toUpperCase()] ?? 0;
}

function scorekeeperBucketForLiveRun() {
  const moo = typeof mooLevelMode !== 'undefined' && mooLevelMode === 'moo';
  const level = !moo && typeof getActiveCampaignLevel === 'function' ? getActiveCampaignLevel() : null;
  const mode = moo ? 'moo' : 'campaign';
  const siteId = moo ? 'moo-county-fair' : String(level?.id || 'lincoln-county');
  const siteName = moo ? 'MOO COUNTY FAIR' : String(level?.name || 'LINCOLN COUNTY');
  const variant = moo ? 'bovine-score-attack' : String(typeof currentStorm === 'undefined' ? 'tornado' : currentStorm);
  return { id: `${mode}|${siteId}|${variant}`, mode, siteId, siteName, variant };
}

function scorekeeperRunStats(moo) {
  const mooStats = moo && typeof mooRun !== 'undefined' && mooRun ? mooRun : null;
  return {
    destruction: Math.max(0, Math.round(scorekeeperNumber(typeof destructionScore === 'undefined' ? 0 : destructionScore))),
    grid: Math.max(0, Math.round(scorekeeperNumber(typeof destroyedSubstationsCount === 'undefined' ? 0 : destroyedSubstationsCount))),
    chains: Math.max(0, Math.round(scorekeeperNumber(typeof chainReactionsCount === 'undefined' ? 0 : chainReactionsCount))),
    blocks: Math.max(0, Math.round(scorekeeperNumber(typeof clearedBlocksCount === 'undefined' ? 0 : clearedBlocksCount))),
    media: Math.max(0, Math.round(scorekeeperNumber(typeof mediaMoments === 'undefined' ? 0 : mediaMoments))),
    cows: Math.max(0, mooStats?.relocated instanceof Set ? mooStats.relocated.size : 0),
    airtime: Math.max(0, Number(scorekeeperNumber(mooStats?.airtime).toFixed(1))),
    sponsors: Math.max(0, Math.round(scorekeeperNumber(mooStats?.propCount)))
  };
}

function scorekeeperActiveBuildMetadata() {
  const metadata = globalThis.getSwRpgBuildMetadata?.();
  if (!metadata || typeof metadata !== 'object') return { ...SCOREKEEPER_FUTURE_METADATA };
  return { ...SCOREKEEPER_FUTURE_METADATA, ...metadata };
}

function scorekeeperLiveRun() {
  const bucket = scorekeeperBucketForLiveRun();
  const moo = bucket.mode === 'moo';
  const score = Math.max(0, Math.round(scorekeeperNumber(scorekeeperUiText('resScore', String(typeof destructionScore === 'undefined' ? 0 : destructionScore)))));
  const rank = scorekeeperUiText('resGrade', 'F');
  return {
    bucket,
    score,
    rank,
    stats: scorekeeperRunStats(moo),
    build: {
      gameBuild: SCOREKEEPER_GAME_BUILD,
      scoringVersion: SCOREKEEPER_SCORING_VERSION,
      stormForm: moo ? 'moo-county-score-attack' : String(typeof currentStorm === 'undefined' ? 'tornado' : currentStorm),
      visualBuild: typeof productionQuality === 'undefined' ? 'unknown' : String(productionQuality),
      campaignMultiplier: moo || typeof campaignScoreMultiplier !== 'function' ? 1 : scorekeeperNumber(campaignScoreMultiplier(), 1),
      // SW-RPG-001 may activate this metadata seam after this observer is
      // installed. The scorekeeper remains a recorder: it reads the immutable
      // current build identity and never awards currency or changes a loadout.
      futureMetadata: scorekeeperActiveBuildMetadata()
    }
  };
}

function scorekeeperFreshRecord(run) {
  return {
    bucket: { ...run.bucket },
    scoringVersion: run.build.scoringVersion,
    gameBuild: run.build.gameBuild,
    bestScore: 0,
    bestRank: 'F',
    bestMedal: 'UNFILED',
    runs: 0,
    bestStats: { destruction: 0, grid: 0, chains: 0, blocks: 0, media: 0, cows: 0, airtime: 0, sponsors: 0 },
    bestBuild: null,
    futureMetadata: { ...SCOREKEEPER_FUTURE_METADATA }
  };
}

function scorekeeperMedalFor(rank) {
  const value = scorekeeperRankValue(rank);
  return value >= 4 ? 'FRONT PAGE GOLD' : (value >= 3 ? 'COUNTY BLUE' : (value >= 2 ? 'STORM BRONZE' : 'FIELD NOTE'));
}

function scorekeeperNextMilestone(run) {
  const normal = [
    { score: 500, rank: 'C' }, { score: 2000, rank: 'B' }, { score: 4500, rank: 'A' }, { score: 8000, rank: 'S+' }
  ];
  const moo = [
    { score: 1500, rank: 'HERD READY' }, { score: 3000, rank: 'UDDER CHAOS' }, { score: 4500, rank: 'COUNTY LEGEND' }
  ];
  const next = (run.bucket.mode === 'moo' ? moo : normal).find(entry => run.score < entry.score);
  if (!next) return run.bucket.mode === 'moo' ? 'MOO COUNTY LEGEND: HOLD THE LINE' : 'S+ FILED: DEFEND THE FRONT PAGE';
  const objectiveNote = run.bucket.mode === 'moo' ? '' : ' + OBJECTIVES';
  return `NEXT ${next.rank}: ${next.score.toLocaleString()}${objectiveNote}`;
}

function scorekeeperNotableLabels(changed) {
  const labels = { grid: 'GRID', chains: 'CHAIN', blocks: 'BLOCKS', media: 'MEDIA', cows: 'COWS', airtime: 'AIRTIME', sponsors: 'SPONSORS' };
  return changed.filter(key => key !== 'destruction').map(key => labels[key]).filter(Boolean);
}

function scorekeeperRecordRun(run) {
  const bucketEntry = scorekeeperStore.records[run.bucket.id] || { bucket: { ...run.bucket }, versions: {} };
  const prior = bucketEntry.versions?.[run.build.scoringVersion] || scorekeeperFreshRecord(run);
  const previousBest = prior.bestScore;
  const isPersonalBest = run.score > previousBest;
  const changedStats = [];
  const bestStats = { ...prior.bestStats };
  for (const [key, value] of Object.entries(run.stats)) {
    if (value > scorekeeperNumber(bestStats[key])) {
      bestStats[key] = value;
      changedStats.push(key);
    }
  }
  const rankImproved = scorekeeperRankValue(run.rank) > scorekeeperRankValue(prior.bestRank);
  const record = {
    ...prior,
    bucket: { ...run.bucket },
    scoringVersion: run.build.scoringVersion,
    gameBuild: run.build.gameBuild,
    bestScore: Math.max(previousBest, run.score),
    bestRank: rankImproved ? run.rank : prior.bestRank,
    bestMedal: scorekeeperMedalFor(rankImproved ? run.rank : prior.bestRank),
    runs: Math.max(0, Math.round(scorekeeperNumber(prior.runs))) + 1,
    bestStats,
    bestBuild: isPersonalBest ? { ...run.build } : prior.bestBuild,
    futureMetadata: { ...SCOREKEEPER_FUTURE_METADATA, ...(prior.futureMetadata || {}) }
  };
  bucketEntry.bucket = { ...run.bucket };
  bucketEntry.versions = { ...(bucketEntry.versions || {}), [run.build.scoringVersion]: record };
  scorekeeperStore.records[run.bucket.id] = bucketEntry;
  const saved = saveScorekeeperStore();
  scorekeeperLastResult = Object.freeze({
    bucket: { ...run.bucket },
    score: run.score,
    rank: run.rank,
    isPersonalBest,
    firstRecord: previousBest === 0,
    previousBest,
    margin: isPersonalBest && previousBest > 0 ? run.score - previousBest : 0,
    currentBest: record.bestScore,
    bestRank: record.bestRank,
    bestMedal: record.bestMedal,
    notableRecords: scorekeeperNotableLabels(changedStats),
    nextMilestone: scorekeeperNextMilestone(run),
    build: { ...run.build },
    persisted: saved,
    comparison: 'exact-scoring-version',
    record
  });
  return scorekeeperLastResult;
}

function installScorekeeperNewspaperStyle() {
  if (document.getElementById('scorekeeperNewspaperStyles')) return;
  const style = document.createElement('style');
  style.id = 'scorekeeperNewspaperStyles';
  style.textContent = '.newspaper-scorekeeper-rail{margin:6px 0;padding:5px 6px;border-top:2px solid #263849;border-bottom:1px solid rgba(24,34,51,.5);background:rgba(255,255,255,.32);color:#263849;font:800 8px/1.2 Inter,sans-serif;text-align:left}.newspaper-scorekeeper-flag{color:#af2723;font:1000 11px/1 Georgia,serif;letter-spacing:.02em}.newspaper-scorekeeper-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px;margin-top:4px}.newspaper-scorekeeper-grid span{display:block;color:#53606b;font-size:6.5px;letter-spacing:.07em}.newspaper-scorekeeper-grid b{display:block;margin-top:1px;color:#182233;font:900 8px/1.1 Inter,sans-serif}.newspaper-scorekeeper-replay{margin-top:4px;color:#234765;font:900 8px/1.2 Inter,sans-serif}@media (max-height:540px),(max-width:850px){.newspaper-scorekeeper-rail{margin:4px 0;padding:4px}.newspaper-scorekeeper-flag{font-size:9px}.newspaper-scorekeeper-grid b,.newspaper-scorekeeper-replay{font-size:7px}}';
  document.head.appendChild(style);
}

function decorateScorekeeperNewspaper() {
  installScorekeeperNewspaperStyle();
  const deck = document.getElementById('newspaperStoryDeck');
  if (!deck || document.getElementById('newspaperScorekeeperRail')) return;
  const rail = document.createElement('section');
  rail.id = 'newspaperScorekeeperRail';
  rail.className = 'newspaper-scorekeeper-rail';
  rail.innerHTML = '<div class="newspaper-scorekeeper-flag" id="scorekeeperPbFlag">RECORD DESK STANDING BY</div><div class="newspaper-scorekeeper-grid"><div><span>BEST ON FILE</span><b id="scorekeeperBest">—</b></div><div><span>PREVIOUS / MARGIN</span><b id="scorekeeperPrevious">—</b></div><div><span>NEXT MILESTONE</span><b id="scorekeeperNext">—</b></div><div><span>NOTABLE RECORDS</span><b id="scorekeeperNotable">—</b></div><div><span>BEST RANK</span><b id="scorekeeperRank">—</b></div><div><span>SCORE RULES</span><b id="scorekeeperVersion">—</b></div></div><div class="newspaper-scorekeeper-replay" id="scorekeeperReplay">FINISH A RUN TO FILE A LOCAL RECORD.</div>';
  deck.insertAdjacentElement('afterend', rail);
}

function scorekeeperSetText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function renderScorekeeperNewspaper() {
  decorateScorekeeperNewspaper();
  const result = scorekeeperLastResult;
  if (!result) return;
  const score = result.currentBest.toLocaleString();
  const flag = result.isPersonalBest
    ? (result.firstRecord ? 'NEW PERSONAL BEST — FIRST RECORD FILED' : 'NEW PERSONAL BEST — RECORD DESK CONFIRMED')
    : 'BEST STANDS — REPLAY THE COUNTY';
  scorekeeperSetText('scorekeeperPbFlag', flag);
  scorekeeperSetText('scorekeeperBest', `${score} · ${result.bucket.siteName}`);
  scorekeeperSetText('scorekeeperPrevious', result.isPersonalBest && !result.firstRecord ? `${result.previousBest.toLocaleString()} / +${result.margin.toLocaleString()}` : (result.firstRecord ? 'FIRST FILED RECORD' : `${result.currentBest.toLocaleString()} / HOLD`));
  scorekeeperSetText('scorekeeperNext', result.nextMilestone);
  scorekeeperSetText('scorekeeperNotable', result.notableRecords.length ? result.notableRecords.join(' · ') : 'SCORE DESK LOGGED');
  scorekeeperSetText('scorekeeperRank', `${result.bestRank} · ${result.bestMedal}`);
  scorekeeperSetText('scorekeeperVersion', `${result.build.gameBuild} · ${result.build.scoringVersion.replace('legacy-score-rules-', '')}`);
  scorekeeperSetText('scorekeeperReplay', result.isPersonalBest ? 'REPLAY NOW: DEFEND THE HEADLINE OR CHASE THE NEXT RANK.' : 'REPLAY NOW: THE PREVIOUS HEADLINE IS STILL BEATABLE.');
}

const scorekeeperBaseRefreshNewspaperResults = refreshNewspaperResults;
refreshNewspaperResults = function scorekeeperNewspaperRefresh(...args) {
  const result = scorekeeperBaseRefreshNewspaperResults.apply(this, args);
  renderScorekeeperNewspaper();
  return result;
};

const scorekeeperBaseFinishRun = finishRun;
finishRun = function scorekeeperObservedFinishRun(...args) {
  const result = scorekeeperBaseFinishRun.apply(this, args);
  // Moo's reset path can leave the inherited district card in front of a final
  // result. Dismiss only that presentation overlay after the upstream executor
  // has closed the run; no campaign, timer, or gameplay state is changed.
  getCachedEl('districtOverlay')?.classList.remove('active');
  scorekeeperRecordRun(scorekeeperLiveRun());
  refreshNewspaperResults();
  return result;
};

globalThis.getScorekeeperQaState = function getScorekeeperQaState() {
  const buckets = Object.values(scorekeeperStore.records).map(entry => ({
    id: entry.bucket?.id,
    versions: Object.keys(entry.versions || {}),
    records: Object.fromEntries(Object.entries(entry.versions || {}).map(([version, record]) => [version, {
      bestScore: record.bestScore, bestRank: record.bestRank, runs: record.runs, bestStats: { ...record.bestStats }
    }]))
  }));
  return Object.freeze({
    marker: SW_SCOREKEEPER_MARKER,
    storageKey: SCOREKEEPER_STORAGE_KEY,
    schemaVersion: SCOREKEEPER_SCHEMA_VERSION,
    scoringVersion: SCOREKEEPER_SCORING_VERSION,
    futureMetadata: { ...scorekeeperStore.futureMetadata },
    lastResult: scorekeeperLastResult ? { ...scorekeeperLastResult, record: undefined } : null,
    buckets
  });
};

// Deterministic browser fixtures invoke the real final finishRun observer after
// setting an isolated candidate's accepted run-state fields. They are not loaded
// into the source HTML and do not alter score, objective, campaign, or Moo rules.
globalThis.__SW_SCOREKEEPER_QA__ = {
  reset() {
    try { localStorage.removeItem(SCOREKEEPER_STORAGE_KEY); } catch (_) {}
    scorekeeperStore = scorekeeperEmptyStore(); scorekeeperLastResult = null;
  },
  completeNormal({ score = 0, storm = 'tornado', campaignIndex = 0, grid = 0, chains = 0, blocks = 0, media = 0, objectives = 0 } = {}) {
    mooLevelMode = 'normal';
    campaignProgress = { schema: 1, unlockedLevel: 3, selectedLevel: campaignIndex, levels: {} };
    selectedCampaignIndex = campaignIndex;
    currentStorm = storm;
    resetWarningRun();
    const menu = getCachedEl('mainMenu');
    if (menu) { menu.classList.add('hidden'); menu.style.display = 'none'; menu.style.pointerEvents = 'none'; }
    destructionScore = Math.max(0, Math.round(score)); maxComboReached = 1.8;
    destroyedSubstationsCount = Math.max(0, Math.round(grid)); chainReactionsCount = Math.max(0, Math.round(chains));
    clearedBlocksCount = Math.max(0, Math.round(blocks)); mediaMoments = Math.max(0, Math.round(media));
    (missionObjectives[currentStorm] || []).forEach((objective, index) => { objective.done = index < objectives; });
    runActive = true;
    finishRun();
    return scorekeeperLastResult;
  },
  completeMoo({ score = 0, cows = 0, airtime = 0, sponsors = 0 } = {}) {
    globalThis.__SW_MOO_LEVEL_QA__.beginMooLevel();
    destructionScore = Math.max(0, Math.round(score));
    if (mooRun) {
      mooRun.relocated = new Set(Array.from({ length: Math.max(0, Math.round(cows)) }, (_, index) => index));
      mooRun.airtime = Math.max(0, scorekeeperNumber(airtime)); mooRun.propCount = Math.max(0, Math.round(sponsors));
    }
    runActive = true;
    finishRun();
    return scorekeeperLastResult;
  }
};

renderScorekeeperNewspaper();
