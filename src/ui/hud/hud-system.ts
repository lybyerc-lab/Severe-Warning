import type {
  HudStateSnapshot,
  HudSystemContract,
  HudObjectiveProgress
} from './hud-contracts.ts';

export type EfRating = 'EF-0' | 'EF-1' | 'EF-2' | 'EF-3' | 'EF-4' | 'EF-5';

const EF_COLORS: Record<EfRating, string> = {
  'EF-0': '#22c55e',
  'EF-1': '#38bdf8',
  'EF-2': '#eab308',
  'EF-3': '#f97316',
  'EF-4': '#ef4444',
  'EF-5': '#a855f7'
};

function isEfRating(val: string): val is EfRating {
  return Object.prototype.hasOwnProperty.call(EF_COLORS, val);
}

export class HudSystem implements HudSystemContract {
  private snapshot: HudStateSnapshot;

  constructor() {
    this.snapshot = {
      timer: {
        remainingSeconds: 180,
        formattedTime: '03:00',
        isWarningPeriod: false
      },
      score: {
        score: 0,
        comboMultiplier: 1.0,
        comboDecayProgress: 0.0,
        efRating: 'EF-0',
        efColor: EF_COLORS['EF-0'] ?? '#22c55e'
      },
      abilities: [
        { slot: 0, name: 'Pull', key: 'SPACE', ready: true, cooldownRemainingSeconds: 0, cooldownTotalSeconds: 4 },
        { slot: 1, name: 'Gust', key: 'Q', ready: true, cooldownRemainingSeconds: 0, cooldownTotalSeconds: 6 },
        { slot: 2, name: 'Zap', key: 'E', ready: true, cooldownRemainingSeconds: 0, cooldownTotalSeconds: 8 }
      ],
      objectives: [],
      districtName: 'PINE RIDGE',
      fps: 60,
      isPaused: false
    };
  }

  public updateTimer(remainingSeconds: number): void {
    const clamped = Math.max(0, Math.floor(remainingSeconds));
    const mins = Math.floor(clamped / 60);
    const secs = clamped % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    this.snapshot.timer = {
      remainingSeconds: clamped,
      formattedTime: formatted,
      isWarningPeriod: clamped <= 30
    };
  }

  public updateScore(score: number, combo: number, decayProgress: number, efRating: string): void {
    const validEf: EfRating = isEfRating(efRating) ? efRating : 'EF-0';
    this.snapshot.score = {
      score: Math.max(0, Math.floor(score)),
      comboMultiplier: Math.max(1.0, Number(combo.toFixed(2))),
      comboDecayProgress: Math.max(0, Math.min(1, decayProgress)),
      efRating: validEf,
      efColor: EF_COLORS[validEf] ?? '#22c55e'
    };
  }

  public updateAbilityCooldown(slot: 0 | 1 | 2, remainingSec: number, totalSec: number): void {
    const badge = this.snapshot.abilities[slot];
    if (!badge) return;
    badge.cooldownRemainingSeconds = Math.max(0, remainingSec);
    badge.cooldownTotalSeconds = Math.max(1, totalSec);
    badge.ready = remainingSec <= 0;
  }

  public updateObjectives(objectives: HudObjectiveProgress[]): void {
    this.snapshot.objectives = [...objectives];
  }

  public updateTelemetry(districtName: string, fps: number): void {
    this.snapshot.districtName = districtName;
    this.snapshot.fps = Math.max(0, Math.round(fps));
  }

  public setPaused(isPaused: boolean): void {
    this.snapshot.isPaused = isPaused;
  }

  public getSnapshot(): HudStateSnapshot {
    return {
      ...this.snapshot,
      timer: { ...this.snapshot.timer },
      score: { ...this.snapshot.score },
      abilities: this.snapshot.abilities.map(a => ({ ...a })),
      objectives: this.snapshot.objectives.map(o => ({ ...o }))
    };
  }
}
