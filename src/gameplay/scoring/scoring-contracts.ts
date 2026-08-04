// ============================================================================
// [SW:ARCH:PHASE4_SCORING_CONTRACTS]
// Exact contracts for the accepted legacy scoring law. Phase 4 mirrors the
// proven runtime before taking deeper execution ownership.
// ============================================================================

export interface LegacyScoreState {
  readonly destructionScore: number;
  readonly baseScore: number;
  readonly comboMultiplier: number;
  readonly maxComboReached: number;
  readonly comboDecayTimerSeconds: number;
  readonly scoreDoublerTimerSeconds: number;
  readonly campaignScoreMultiplier: number;
  readonly currentStage: 1 | 2 | 3;
}

export interface ScoreEvent {
  readonly basePoints: number;
  readonly awardedPoints: number;
  readonly comboMultiplier: number;
  readonly campaignMultiplier: number;
  readonly doubled: boolean;
  readonly label: string;
  readonly timestampMs: number;
}

export interface ScoreSnapshot extends LegacyScoreState {
  readonly eventsRecorded: number;
  readonly lastEvent: ScoreEvent | null;
}

export interface ScoringRules {
  readonly maxComboMultiplier: number;
  readonly comboStep: number;
  readonly comboDecaySeconds: number;
}

export interface ScoringContractProbe {
  readonly passed: boolean;
  readonly checks: Readonly<Record<string, boolean>>;
  readonly samples: Readonly<{
    firstAward: number;
    secondAward: number;
    campaignAward: number;
    doubledAward: number;
    cappedMultiplier: number;
  }>;
}

export const DEFAULT_SCORING_RULES: ScoringRules = Object.freeze({
  maxComboMultiplier: 3.5,
  comboStep: 0.05,
  comboDecaySeconds: 4.5,
});

export const DEFAULT_LEGACY_SCORE_STATE: LegacyScoreState = Object.freeze({
  destructionScore: 0,
  baseScore: 0,
  comboMultiplier: 1,
  maxComboReached: 1,
  comboDecayTimerSeconds: 0,
  scoreDoublerTimerSeconds: 0,
  campaignScoreMultiplier: 1,
  currentStage: 1,
});
