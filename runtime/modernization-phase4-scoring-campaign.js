// ============================================================================
// [SW:ARCH:PHASE4_SCORING_CAMPAIGN_BRIDGE]
// Lexical bridge attaching legacy score, combo, district, campaign, and
// persistence functions to typed authorities.
// ============================================================================
const PHASE4_SCORING_CAMPAIGN_BRIDGE_VERSION = 'MODERNIZATION_PHASE4_SCORING_CAMPAIGN_V1';

const phase4OriginalAddScore = typeof addScore === 'function' ? addScore : null;
const phase4OriginalRegisterComboHit = typeof registerComboHit === 'function' ? registerComboHit : null;
const phase4OriginalAdvanceDistrict = typeof advanceDistrict === 'function' ? advanceDistrict : null;
const phase4OriginalSaveCampaignData = typeof saveCampaignData === 'function' ? saveCampaignData : null;
const phase4OriginalLoadCampaignData = typeof loadCampaignData === 'function' ? loadCampaignData : null;

let phase4ScoringAuthority = null;
let phase4DistrictAuthority = null;
let phase4CampaignAuthority = null;
let phase4PersistenceAuthority = null;

const phase4ScoringCampaignBridge = {
  version: PHASE4_SCORING_CAMPAIGN_BRIDGE_VERSION,

  attach(scoringAuthority, districtAuthority, campaignAuthority, persistenceAuthority) {
    if (!scoringAuthority || typeof scoringAuthority.addScore !== 'function') {
      throw new Error('Phase 4 scoring authority is missing required methods.');
    }
    if (!districtAuthority || typeof districtAuthority.advance !== 'function') {
      throw new Error('Phase 4 district authority is missing required methods.');
    }
    if (!campaignAuthority || typeof campaignAuthority.recordRunResult !== 'function') {
      throw new Error('Phase 4 campaign authority is missing required methods.');
    }
    if (!persistenceAuthority || typeof persistenceAuthority.save !== 'function') {
      throw new Error('Phase 4 persistence authority is missing required methods.');
    }

    phase4ScoringAuthority = scoringAuthority;
    phase4DistrictAuthority = districtAuthority;
    phase4CampaignAuthority = campaignAuthority;
    phase4PersistenceAuthority = persistenceAuthority;
    return true;
  },

  addScore(points, label, position) {
    if (phase4ScoringAuthority) {
      const event = phase4ScoringAuthority.addScore(points, label, performance.now(), position);
      score = phase4ScoringAuthority.score;
      comboCount = phase4ScoringAuthority.combo.count;
      comboMultiplier = phase4ScoringAuthority.combo.multiplier;
      return event;
    }
    if (phase4OriginalAddScore) {
      return phase4OriginalAddScore(points, label, position);
    }
    score = (score || 0) + (points || 0);
    return { points, label };
  },

  registerComboHit() {
    if (phase4ScoringAuthority) {
      const combo = phase4ScoringAuthority.registerComboHit(performance.now());
      comboCount = combo.count;
      comboMultiplier = combo.multiplier;
      return combo;
    }
    if (phase4OriginalRegisterComboHit) {
      return phase4OriginalRegisterComboHit();
    }
    comboCount = (comboCount || 0) + 1;
    comboMultiplier = Math.min(4.0, 1.0 + comboCount * 0.1);
    return { count: comboCount, multiplier: comboMultiplier };
  },

  advanceDistrict() {
    if (phase4DistrictAuthority) {
      const event = phase4DistrictAuthority.advance(score, performance.now());
      if (event) {
        currentDistrict = phase4DistrictAuthority.currentDistrictIndex;
      }
      return event;
    }
    if (phase4OriginalAdvanceDistrict) {
      return phase4OriginalAdvanceDistrict();
    }
    currentDistrict = (currentDistrict || 1) + 1;
    return { currentDistrict };
  },

  saveCampaignData(data) {
    if (phase4PersistenceAuthority) {
      return phase4PersistenceAuthority.save(data || (phase4CampaignAuthority ? phase4CampaignAuthority.store.getSnapshot() : {}));
    }
    if (phase4OriginalSaveCampaignData) {
      return phase4OriginalSaveCampaignData(data);
    }
    return true;
  },

  loadCampaignData() {
    if (phase4PersistenceAuthority) {
      return phase4PersistenceAuthority.load();
    }
    if (phase4OriginalLoadCampaignData) {
      return phase4OriginalLoadCampaignData();
    }
    return {};
  },

  reset() {
    if (phase4ScoringAuthority) phase4ScoringAuthority.reset();
    if (phase4DistrictAuthority) phase4DistrictAuthority.reset();
    score = 0;
    comboCount = 0;
    comboMultiplier = 1.0;
    currentDistrict = 1;
  },

  getSnapshot() {
    return Object.freeze({
      version: PHASE4_SCORING_CAMPAIGN_BRIDGE_VERSION,
      attached: Boolean(phase4ScoringAuthority && phase4DistrictAuthority && phase4CampaignAuthority && phase4PersistenceAuthority),
      score: phase4ScoringAuthority ? phase4ScoringAuthority.getSnapshot() : { score: Number(score) || 0 },
      district: phase4DistrictAuthority ? phase4DistrictAuthority.getSnapshot() : { currentDistrictIndex: Number(currentDistrict) || 1 },
      campaign: phase4CampaignAuthority ? {
        activeStop: phase4CampaignAuthority.activeStopId,
        furthestUnlocked: phase4CampaignAuthority.furthestUnlockedStopId,
        progress: phase4CampaignAuthority.getProgressMap()
      } : null,
      persistence: phase4PersistenceAuthority ? phase4PersistenceAuthority.getSnapshot() : null
    });
  }
};

if (typeof addScore === 'function') {
  addScore = function phase4RoutedAddScore(points, label, pos) {
    return phase4ScoringCampaignBridge.addScore(points, label, pos);
  };
}

if (typeof registerComboHit === 'function') {
  registerComboHit = function phase4RoutedRegisterComboHit() {
    return phase4ScoringCampaignBridge.registerComboHit();
  };
}

if (typeof advanceDistrict === 'function') {
  advanceDistrict = function phase4RoutedAdvanceDistrict() {
    return phase4ScoringCampaignBridge.advanceDistrict();
  };
}

if (typeof saveCampaignData === 'function') {
  saveCampaignData = function phase4RoutedSaveCampaignData(data) {
    return phase4ScoringCampaignBridge.saveCampaignData(data);
  };
}

if (typeof loadCampaignData === 'function') {
  loadCampaignData = function phase4RoutedLoadCampaignData() {
    return phase4ScoringCampaignBridge.loadCampaignData();
  };
}

globalThis.__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__ = phase4ScoringCampaignBridge;
// [SW:ARCH:PHASE4_SCORING_CAMPAIGN_BRIDGE:END]
