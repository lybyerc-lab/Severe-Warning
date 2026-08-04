// ============================================================================
// [SW:ARCH:PHASE4_SCORING_CONTRACTS]
// Typed contracts for score accumulation, combo multiplier tracking, and score events.
// ============================================================================

export interface ScoreEvent {
  readonly points: number;
  readonly basePoints: number;
  readonly comboMultiplier: number;
  readonly label: string;
  readonly timestampMs: number;
  readonly targetPosition?: { readonly x: number; readonly y: number; readonly z: number } | undefined;
}

export interface ComboSnapshot {
  readonly count: number;
  readonly multiplier: number;
  readonly active: boolean;
  readonly timeRemainingMs: number;
  readonly timeoutMs: number;
}

export interface ScoreSnapshot {
  readonly score: number;
  readonly baseScore: number;
  readonly combo: ComboSnapshot;
  readonly peakScore: number;
  readonly peakComboCount: number;
  readonly peakComboMultiplier: number;
  readonly eventsRecorded: number;
  readonly lastEvent: ScoreEvent | null;
}

export interface ScoringRules {
  readonly maxComboMultiplier: number;
  readonly comboTimeoutMs: number;
  readonly comboStep: number;
}

export const DEFAULT_SCORING_RULES: ScoringRules = Object.freeze({
  maxComboMultiplier: 4.0,
  comboTimeoutMs: 3000,
  comboStep: 0.1
});
