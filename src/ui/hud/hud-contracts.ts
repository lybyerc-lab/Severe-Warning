/**
 * [SW:ARCH:PHASE6_HUD_CONTRACTS]
 * Type definitions for HUD state, telemetry, ability badges, and objective tracking.
 */

export interface HudTimerState {
  remainingSeconds: number;
  formattedTime: string;
  isWarningPeriod: boolean;
}

export interface HudScoreState {
  score: number;
  comboMultiplier: number;
  comboDecayProgress: number; // 0.0 to 1.0
  efRating: 'EF-0' | 'EF-1' | 'EF-2' | 'EF-3' | 'EF-4' | 'EF-5';
  efColor: string;
}

export interface HudAbilityBadgeState {
  slot: 0 | 1 | 2;
  name: 'Pull' | 'Gust' | 'Zap';
  key: string;
  ready: boolean;
  cooldownRemainingSeconds: number;
  cooldownTotalSeconds: number;
}

export interface HudObjectiveProgress {
  id: string;
  label: string;
  description: string;
  currentValue: number;
  targetValue: number;
  isComplete: boolean;
  isOptional: boolean;
}

export interface HudStateSnapshot {
  timer: HudTimerState;
  score: HudScoreState;
  abilities: HudAbilityBadgeState[];
  objectives: HudObjectiveProgress[];
  districtName: string;
  fps: number;
  isPaused: boolean;
}

export interface HudSystemContract {
  updateTimer(remainingSeconds: number): void;
  updateScore(score: number, combo: number, decayProgress: number, efRating: string): void;
  updateAbilityCooldown(slot: 0 | 1 | 2, remainingSec: number, totalSec: number): void;
  updateObjectives(objectives: HudObjectiveProgress[]): void;
  updateTelemetry(districtName: string, fps: number): void;
  setPaused(isPaused: boolean): void;
  getSnapshot(): HudStateSnapshot;
}
