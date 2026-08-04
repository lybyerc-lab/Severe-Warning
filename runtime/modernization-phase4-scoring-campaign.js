// ============================================================================
// [SW:ARCH:PHASE4_SCORING_CAMPAIGN_BRIDGE]
// The accepted legacy functions remain the execution authority in Phase 4.
// Typed systems mirror their exact inputs, outputs, transitions, and save data.
// ============================================================================
const PHASE4_SCORING_CAMPAIGN_BRIDGE_VERSION = 'MODERNIZATION_PHASE4_SCORING_CAMPAIGN_V2';

const phase4OriginalAddScore = typeof addScore === 'function' ? addScore : null;
const phase4OriginalShowDistrictTransition = typeof showDistrictTransition === 'function' ? showDistrictTransition : null;
const phase4OriginalCompleteCampaignRun = typeof completeCampaignRun === 'function' ? completeCampaignRun : null;
const phase4OriginalSelectCampaignLevel = typeof selectCampaignLevel === 'function' ? selectCampaignLevel : null;
const phase4OriginalStartNextCampaignLevel = typeof startNextCampaignLevel === 'function' ? startNextCampaignLevel : null;
const phase4OriginalSaveCampaignProgress = typeof saveCampaignProgress === 'function' ? saveCampaignProgress : null;
const phase4OriginalLoadCampaignProgress = typeof loadCampaignProgress === 'function' ? loadCampaignProgress : null;
const phase4OriginalResetWarningRun = typeof resetWarningRun === 'function' ? resetWarningRun : null;

let phase4ScoringAuthority = null;
let phase4DistrictAuthority = null;
let phase4CampaignAuthority = null;
let phase4PersistenceAuthority = null;

function phase4LegacyScoreState() {
  return Object.freeze({
    destructionScore: Number(typeof destructionScore === 'undefined' ? 0 : destructionScore) || 0,
    baseScore: Number(typeof baseScore === 'undefined' ? 0 : baseScore) || 0,
    comboMultiplier: Number(typeof comboMultiplier === 'undefined' ? 1 : comboMultiplier) || 1,
    maxComboReached: Number(typeof maxComboReached === 'undefined' ? 1 : maxComboReached) || 1,
    comboDecayTimerSeconds: Number(typeof comboDecayTimer === 'undefined' ? 0 : comboDecayTimer) || 0,
    scoreDoublerTimerSeconds: Number(typeof scoreDoublerTimer === 'undefined' ? 0 : scoreDoublerTimer) || 0,
    campaignScoreMultiplier: typeof campaignScoreMultiplier === 'function'
      ? Number(campaignScoreMultiplier()) || 1
      : 1,
    currentStage: Math.max(1, Math.min(3, Number(typeof currentStage === 'undefined' ? 1 : currentStage) || 1))
  });
}

function phase4LegacyDistrictState() {
  const stage = Math.max(1, Math.min(3, Number(typeof currentStage === 'undefined' ? 1 : currentStage) || 1));
  const definition = typeof DISTRICTS === 'undefined' ? null : DISTRICTS[stage];
  return Object.freeze({
    stage,
    destructionScore: Number(typeof destructionScore === 'undefined' ? 0 : destructionScore) || 0,
    title: definition && definition.name ? String(definition.name) : `DISTRICT ${stage}`,
    subtitle: definition && definition.subtitle ? String(definition.subtitle) : ''
  });
}

function phase4LegacyCampaignState() {
  return typeof campaignProgress === 'undefined'
    ? Object.freeze({ schema: 1, unlockedLevel: 0, selectedLevel: 0, levels: Object.freeze({}) })
    : campaignProgress;
}

function phase4SynchronizeAll() {
  const scoreState = phase4LegacyScoreState();
  const districtState = phase4LegacyDistrictState();
  const campaignState = phase4LegacyCampaignState();
  if (phase4ScoringAuthority) phase4ScoringAuthority.synchronize(scoreState);
  if (phase4DistrictAuthority) {
    phase4DistrictAuthority.observeLegacyState(
      districtState.stage,
      districtState.destructionScore,
      districtState.title,
      districtState.subtitle,
      performance.now()
    );
  }
  if (phase4PersistenceAuthority) phase4PersistenceAuthority.synchronize(campaignState);
  if (phase4CampaignAuthority) phase4CampaignAuthority.synchronize(campaignState);
  return Object.freeze({ scoreState, districtState, campaignState });
}

const phase4ScoringCampaignBridge = {
  version: PHASE4_SCORING_CAMPAIGN_BRIDGE_VERSION,

  attach(scoringAuthority, districtAuthority, campaignAuthority, persistenceAuthority) {
    if (!scoringAuthority || typeof scoringAuthority.synchronize !== 'function' || typeof scoringAuthority.recordLegacyAward !== 'function') {
      throw new Error('Phase 4 scoring mirror is missing required methods.');
    }
    if (!districtAuthority || typeof districtAuthority.observeLegacyState !== 'function') {
      throw new Error('Phase 4 district mirror is missing required methods.');
    }
    if (!campaignAuthority || typeof campaignAuthority.synchronize !== 'function') {
      throw new Error('Phase 4 campaign mirror is missing required methods.');
    }
    if (!persistenceAuthority || typeof persistenceAuthority.synchronize !== 'function') {
      throw new Error('Phase 4 persistence mirror is missing required methods.');
    }
    phase4ScoringAuthority = scoringAuthority;
    phase4DistrictAuthority = districtAuthority;
    phase4CampaignAuthority = campaignAuthority;
    phase4PersistenceAuthority = persistenceAuthority;
    phase4SynchronizeAll();
    return true;
  },

  syncFromLegacy() {
    return phase4SynchronizeAll();
  },

  reset() {
    const districtState = phase4LegacyDistrictState();
    if (phase4ScoringAuthority) phase4ScoringAuthority.reset(phase4LegacyScoreState());
    if (phase4DistrictAuthority) phase4DistrictAuthority.reset(districtState.title, districtState.subtitle);
    phase4SynchronizeAll();
  },

  runContractProbe() {
    return Object.freeze({
      scoring: phase4ScoringAuthority ? phase4ScoringAuthority.runContractProbe() : null,
      districts: phase4DistrictAuthority ? phase4DistrictAuthority.runContractProbe() : null,
      campaign: phase4CampaignAuthority ? phase4CampaignAuthority.runContractProbe() : null,
      persistence: phase4PersistenceAuthority ? phase4PersistenceAuthority.runContractProbe() : null
    });
  },

  getSnapshot() {
    const legacy = phase4SynchronizeAll();
    return Object.freeze({
      version: PHASE4_SCORING_CAMPAIGN_BRIDGE_VERSION,
      attached: Boolean(phase4ScoringAuthority && phase4DistrictAuthority && phase4CampaignAuthority && phase4PersistenceAuthority),
      score: Object.freeze({
        authority: phase4ScoringAuthority ? phase4ScoringAuthority.getSnapshot() : null,
        legacy: legacy.scoreState
      }),
      district: Object.freeze({
        authority: phase4DistrictAuthority ? phase4DistrictAuthority.getSnapshot() : null,
        legacy: legacy.districtState
      }),
      campaign: Object.freeze({
        activeStop: phase4CampaignAuthority ? phase4CampaignAuthority.activeStopId : null,
        furthestUnlocked: phase4CampaignAuthority ? phase4CampaignAuthority.furthestUnlockedStopId : null,
        progress: phase4CampaignAuthority ? phase4CampaignAuthority.getProgressMap() : null,
        save: phase4CampaignAuthority ? phase4CampaignAuthority.getSnapshot() : null,
        legacy: legacy.campaignState
      }),
      persistence: phase4PersistenceAuthority ? phase4PersistenceAuthority.getSnapshot() : null
    });
  }
};

if (phase4OriginalAddScore) {
  addScore = function phase4ObservedAddScore(points, label) {
    const before = phase4LegacyScoreState();
    const result = phase4OriginalAddScore.apply(this, arguments);
    const after = phase4LegacyScoreState();
    if (phase4ScoringAuthority) {
      const awarded = Number.isFinite(Number(result))
        ? Number(result)
        : after.destructionScore - before.destructionScore;
      phase4ScoringAuthority.recordLegacyAward(points, awarded, label || 'points', after, performance.now());
    }
    return result;
  };
}

if (phase4OriginalShowDistrictTransition) {
  showDistrictTransition = function phase4ObservedDistrictTransition(stage) {
    const result = phase4OriginalShowDistrictTransition.apply(this, arguments);
    const districtState = phase4LegacyDistrictState();
    if (phase4DistrictAuthority) {
      phase4DistrictAuthority.observeLegacyState(
        stage,
        districtState.destructionScore,
        districtState.title,
        districtState.subtitle,
        performance.now()
      );
    }
    return result;
  };
}

if (phase4OriginalCompleteCampaignRun) {
  completeCampaignRun = function phase4ObservedCampaignCompletion() {
    const result = phase4OriginalCompleteCampaignRun.apply(this, arguments);
    phase4SynchronizeAll();
    return result;
  };
}

if (phase4OriginalSelectCampaignLevel) {
  selectCampaignLevel = function phase4ObservedCampaignSelection() {
    const result = phase4OriginalSelectCampaignLevel.apply(this, arguments);
    phase4SynchronizeAll();
    return result;
  };
}

if (phase4OriginalStartNextCampaignLevel) {
  startNextCampaignLevel = function phase4ObservedNextCampaignLevel() {
    const result = phase4OriginalStartNextCampaignLevel.apply(this, arguments);
    phase4SynchronizeAll();
    return result;
  };
}

if (phase4OriginalSaveCampaignProgress) {
  saveCampaignProgress = function phase4ObservedCampaignSave() {
    const result = phase4OriginalSaveCampaignProgress.apply(this, arguments);
    phase4SynchronizeAll();
    return result;
  };
}

if (phase4OriginalLoadCampaignProgress) {
  loadCampaignProgress = function phase4ObservedCampaignLoad() {
    const result = phase4OriginalLoadCampaignProgress.apply(this, arguments);
    phase4SynchronizeAll();
    return result;
  };
}

if (phase4OriginalResetWarningRun) {
  resetWarningRun = function phase4ObservedWarningReset() {
    const result = phase4OriginalResetWarningRun.apply(this, arguments);
    const districtState = phase4LegacyDistrictState();
    if (phase4ScoringAuthority) phase4ScoringAuthority.reset(phase4LegacyScoreState());
    if (phase4DistrictAuthority) phase4DistrictAuthority.reset(districtState.title, districtState.subtitle);
    phase4SynchronizeAll();
    return result;
  };
}

globalThis.__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__ = phase4ScoringCampaignBridge;
// [SW:ARCH:PHASE4_SCORING_CAMPAIGN_BRIDGE:END]
