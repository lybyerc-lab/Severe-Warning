// ============================================================================
// [SW:ARCH:PHASE4_SCORING_SYSTEM]
// Typed mirror and verifier for the accepted legacy scoring executor.
// ============================================================================

import {
  DEFAULT_LEGACY_SCORE_STATE,
  DEFAULT_SCORING_RULES,
  type LegacyScoreState,
  type ScoreEvent,
  type ScoreSnapshot,
  type ScoringContractProbe,
  type ScoringRules,
} from './scoring-contracts';

function finiteNonNegative(value: number, fallback = 0): number {
  return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function normalizeStage(value: number): 1 | 2 | 3 {
  if (value >= 3) return 3;
  if (value >= 2) return 2;
  return 1;
}

export class ScoringSystem {
  private state: LegacyScoreState = DEFAULT_LEGACY_SCORE_STATE;
  private readonly events: ScoreEvent[] = [];

  constructor(private readonly rules: ScoringRules = DEFAULT_SCORING_RULES) {}

  get score(): number {
    return this.state.destructionScore;
  }

  get baseScore(): number {
    return this.state.baseScore;
  }

  get comboMultiplier(): number {
    return this.state.comboMultiplier;
  }

  synchronize(legacy: LegacyScoreState): ScoreSnapshot {
    this.state = Object.freeze({
      destructionScore: Math.round(finiteNonNegative(legacy.destructionScore)),
      baseScore: Math.round(finiteNonNegative(legacy.baseScore)),
      comboMultiplier: finiteNonNegative(legacy.comboMultiplier, 1),
      maxComboReached: finiteNonNegative(legacy.maxComboReached, 1),
      comboDecayTimerSeconds: finiteNonNegative(legacy.comboDecayTimerSeconds),
      scoreDoublerTimerSeconds: finiteNonNegative(legacy.scoreDoublerTimerSeconds),
      campaignScoreMultiplier: finiteNonNegative(legacy.campaignScoreMultiplier, 1),
      currentStage: normalizeStage(legacy.currentStage),
    });
    return this.getSnapshot();
  }

  predictAward(basePoints: number, legacy: LegacyScoreState = this.state): Readonly<{
    nextComboMultiplier: number;
    awardedPoints: number;
  }> {
    const validBase = Math.max(0, Math.round(Number(basePoints) || 0));
    const nextComboMultiplier = Math.min(
      this.rules.maxComboMultiplier,
      Number((finiteNonNegative(legacy.comboMultiplier, 1) + this.rules.comboStep).toFixed(2)),
    );
    let awardedPoints = Math.round(
      validBase * nextComboMultiplier * finiteNonNegative(legacy.campaignScoreMultiplier, 1),
    );
    if (legacy.scoreDoublerTimerSeconds > 0) awardedPoints *= 2;
    return Object.freeze({ nextComboMultiplier, awardedPoints });
  }

  recordLegacyAward(
    basePoints: number,
    awardedPoints: number,
    label: string,
    legacyAfter: LegacyScoreState,
    nowMs = performance.now(),
  ): ScoreEvent {
    const beforeDoubler = this.state.scoreDoublerTimerSeconds > 0;
    this.synchronize(legacyAfter);
    const event: ScoreEvent = Object.freeze({
      basePoints: Math.max(0, Math.round(Number(basePoints) || 0)),
      awardedPoints: Math.max(0, Math.round(Number(awardedPoints) || 0)),
      comboMultiplier: this.state.comboMultiplier,
      campaignMultiplier: this.state.campaignScoreMultiplier,
      doubled: beforeDoubler || this.state.scoreDoublerTimerSeconds > 0,
      label: String(label || 'points'),
      timestampMs: finiteNonNegative(nowMs),
    });
    this.events.push(event);
    return event;
  }

  reset(legacy: LegacyScoreState = DEFAULT_LEGACY_SCORE_STATE): void {
    this.events.length = 0;
    this.synchronize(legacy);
  }

  getSnapshot(): ScoreSnapshot {
    return Object.freeze({
      ...this.state,
      eventsRecorded: this.events.length,
      lastEvent: this.events.length > 0 ? this.events[this.events.length - 1] ?? null : null,
    });
  }

  runContractProbe(): ScoringContractProbe {
    const firstState: LegacyScoreState = { ...DEFAULT_LEGACY_SCORE_STATE };
    const first = this.predictAward(500, firstState);
    const secondState: LegacyScoreState = {
      ...firstState,
      destructionScore: first.awardedPoints,
      baseScore: 500,
      comboMultiplier: first.nextComboMultiplier,
      maxComboReached: first.nextComboMultiplier,
      comboDecayTimerSeconds: this.rules.comboDecaySeconds,
    };
    const second = this.predictAward(500, secondState);
    const campaign = this.predictAward(1000, {
      ...DEFAULT_LEGACY_SCORE_STATE,
      campaignScoreMultiplier: 1.25,
    });
    const doubled = this.predictAward(1000, {
      ...DEFAULT_LEGACY_SCORE_STATE,
      scoreDoublerTimerSeconds: 1,
    });
    const capped = this.predictAward(100, {
      ...DEFAULT_LEGACY_SCORE_STATE,
      comboMultiplier: 3.49,
      maxComboReached: 3.49,
    });

    const checks = Object.freeze({
      maxComboIsThreePointFive: this.rules.maxComboMultiplier === 3.5,
      comboStepIsPointZeroFive: this.rules.comboStep === 0.05,
      decayIsFourPointFiveSeconds: this.rules.comboDecaySeconds === 4.5,
      firstAwardUsesOnePointZeroFive: first.nextComboMultiplier === 1.05 && first.awardedPoints === 525,
      secondAwardUsesOnePointOne: second.nextComboMultiplier === 1.1 && second.awardedPoints === 550,
      continuousTotalIsOneZeroSevenFive: first.awardedPoints + second.awardedPoints === 1075,
      campaignMultiplierApplied: campaign.awardedPoints === 1313,
      scoreDoublerApplied: doubled.awardedPoints === 2100,
      comboCapPreserved: capped.nextComboMultiplier === 3.5,
    });

    return Object.freeze({
      passed: Object.values(checks).every(Boolean),
      checks,
      samples: Object.freeze({
        firstAward: first.awardedPoints,
        secondAward: second.awardedPoints,
        campaignAward: campaign.awardedPoints,
        doubledAward: doubled.awardedPoints,
        cappedMultiplier: capped.nextComboMultiplier,
      }),
    });
  }
}
