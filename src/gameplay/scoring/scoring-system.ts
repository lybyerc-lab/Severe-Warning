// ============================================================================
// [SW:ARCH:PHASE4_SCORING_SYSTEM]
// Scoring authority: accumulates score, manages combo state, preserves score continuity.
// ============================================================================

import {
  DEFAULT_SCORING_RULES,
  type ComboSnapshot,
  type ScoreEvent,
  type ScoreSnapshot,
  type ScoringRules
} from './scoring-contracts';

export class ScoringSystem {
  private currentScore = 0;
  private currentBaseScore = 0;
  private comboCount = 0;
  private comboMultiplier = 1.0;
  private comboTimeRemainingMs = 0;
  private peakScoreValue = 0;
  private peakComboCountValue = 0;
  private peakComboMultiplierValue = 1.0;
  private readonly events: ScoreEvent[] = [];

  constructor(private readonly rules: ScoringRules = DEFAULT_SCORING_RULES) {}

  get score(): number {
    return this.currentScore;
  }

  get multiplier(): number {
    return this.comboMultiplier;
  }

  get combo(): ComboSnapshot {
    return Object.freeze({
      count: this.comboCount,
      multiplier: this.comboMultiplier,
      active: this.comboTimeRemainingMs > 0,
      timeRemainingMs: Math.max(0, this.comboTimeRemainingMs),
      timeoutMs: this.rules.comboTimeoutMs
    });
  }

  addScore(basePoints: number, label: string, nowMs: number = performance.now(), position?: { x: number; y: number; z: number }): ScoreEvent {
    const validBase = Math.max(0, Math.round(Number(basePoints) || 0));
    this.registerComboHit(nowMs);

    const points = Math.round(validBase * this.comboMultiplier);
    this.currentScore += points;
    this.currentBaseScore += validBase;
    this.peakScoreValue = Math.max(this.peakScoreValue, this.currentScore);

    const event: ScoreEvent = Object.freeze({
      points,
      basePoints: validBase,
      comboMultiplier: this.comboMultiplier,
      label: String(label || 'points'),
      timestampMs: nowMs,
      ...(position ? { targetPosition: Object.freeze({ ...position }) } : {})
    });

    this.events.push(event);
    return event;
  }

  registerComboHit(_nowMs: number = performance.now()): ComboSnapshot {
    this.comboCount += 1;
    this.comboMultiplier = Math.min(
      this.rules.maxComboMultiplier,
      Number((1.0 + (this.comboCount - 1) * this.rules.comboStep).toFixed(1))
    );
    this.comboTimeRemainingMs = this.rules.comboTimeoutMs;

    this.peakComboCountValue = Math.max(this.peakComboCountValue, this.comboCount);
    this.peakComboMultiplierValue = Math.max(this.peakComboMultiplierValue, this.comboMultiplier);

    return this.combo;
  }

  update(deltaMs: number): void {
    if (this.comboTimeRemainingMs > 0) {
      this.comboTimeRemainingMs -= Math.max(0, deltaMs);
      if (this.comboTimeRemainingMs <= 0) {
        this.resetCombo();
      }
    }
  }

  resetCombo(): void {
    this.comboCount = 0;
    this.comboMultiplier = 1.0;
    this.comboTimeRemainingMs = 0;
  }

  reset(): void {
    this.currentScore = 0;
    this.currentBaseScore = 0;
    this.resetCombo();
    this.peakScoreValue = 0;
    this.peakComboCountValue = 0;
    this.peakComboMultiplierValue = 1.0;
    this.events.length = 0;
  }

  getSnapshot(): ScoreSnapshot {
    return Object.freeze({
      score: this.currentScore,
      baseScore: this.currentBaseScore,
      combo: this.combo,
      peakScore: this.peakScoreValue,
      peakComboCount: this.peakComboCountValue,
      peakComboMultiplier: this.peakComboMultiplierValue,
      eventsRecorded: this.events.length,
      lastEvent: this.events.length > 0 ? this.events[this.events.length - 1] ?? null : null
    });
  }
}
