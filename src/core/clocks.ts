// ============================================================================
// [SW:ARCH:CLOCKS]
// Phase 2 authority for render, simulation, and warning-run time.
// ============================================================================

export type RunClockState = 'idle' | 'running' | 'paused' | 'finished';

export interface LegacyClockSampleInput {
  readonly nowMs: number;
  readonly runActive: boolean;
  readonly paused: boolean;
  readonly remainingSeconds: number;
}

export interface LegacyClockSample {
  readonly renderDeltaMs: number;
  readonly simulationDeltaMs: number;
  readonly runDeltaMs: number;
  readonly runState: RunClockState;
}

export interface ClockSnapshot {
  readonly renderTimeMs: number;
  readonly renderDeltaMs: number;
  readonly simulationTimeMs: number;
  readonly simulationDeltaMs: number;
  readonly runClockTimeMs: number;
  readonly runDeltaMs: number;
  readonly remainingMs: number;
  readonly runState: RunClockState;
  readonly sampleCount: number;
  readonly suspensionCount: number;
}

export interface ClockContractProbe {
  readonly passed: boolean;
  readonly checks: Readonly<Record<string, boolean>>;
  readonly samples: readonly LegacyClockSample[];
}

export type RunStateListener = (state: RunClockState) => void;

const MAX_SIMULATION_DELTA_MS = 100;
const SUSPENSION_THRESHOLD_MS = 1000;

function finiteNonNegative(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a non-negative finite number, received ${value}.`);
  }
  return value;
}

export class GameClocks {
  #lastRenderAtMs: number | null = null;
  #lastRunAtMs: number | null = null;
  #renderTimeMs = 0;
  #renderDeltaMs = 0;
  #simulationTimeMs = 0;
  #simulationDeltaMs = 0;
  #runClockTimeMs = 0;
  #runDeltaMs = 0;
  #remainingMs = 0;
  #runState: RunClockState = 'idle';
  #sampleCount = 0;
  #suspensionCount = 0;
  #listener: RunStateListener | null = null;

  setRunStateListener(listener: RunStateListener): void {
    this.#listener = listener;
  }

  resetRun(durationMs: number, nowMs: number): void {
    finiteNonNegative(durationMs, 'Run duration');
    finiteNonNegative(nowMs, 'Clock timestamp');
    this.#lastRenderAtMs = nowMs;
    this.#lastRunAtMs = nowMs;
    this.#renderTimeMs = nowMs;
    this.#renderDeltaMs = 0;
    this.#simulationTimeMs = 0;
    this.#simulationDeltaMs = 0;
    this.#runClockTimeMs = 0;
    this.#runDeltaMs = 0;
    this.#remainingMs = durationMs;
    this.#sampleCount = 0;
    this.#suspensionCount = 0;
    this.setRunState('idle');
  }

  resumeAfterSuspension(nowMs: number): void {
    finiteNonNegative(nowMs, 'Clock timestamp');
    this.#lastRenderAtMs = nowMs;
    this.#lastRunAtMs = nowMs;
    this.#renderDeltaMs = 0;
    this.#simulationDeltaMs = 0;
    this.#runDeltaMs = 0;
  }

  sample(input: LegacyClockSampleInput): LegacyClockSample {
    const nowMs = finiteNonNegative(input.nowMs, 'Clock timestamp');
    const remainingMs = finiteNonNegative(input.remainingSeconds, 'Legacy remaining seconds') * 1000;
    const previousRunState = this.#runState;
    const nextRunState = this.resolveRunState(input.runActive, input.paused, remainingMs);

    const rawRenderDeltaMs = this.#lastRenderAtMs === null
      ? 0
      : Math.max(0, nowMs - this.#lastRenderAtMs);
    const rawRunDeltaMs = this.#lastRunAtMs === null
      ? 0
      : Math.max(0, nowMs - this.#lastRunAtMs);

    this.#renderTimeMs = nowMs;
    this.#renderDeltaMs = Math.min(MAX_SIMULATION_DELTA_MS, rawRenderDeltaMs);
    this.#simulationDeltaMs = this.#renderDeltaMs;
    this.#simulationTimeMs += this.#simulationDeltaMs;

    const stateChanged = nextRunState !== previousRunState;
    const suspended = rawRunDeltaMs > SUSPENSION_THRESHOLD_MS;
    this.#runDeltaMs = nextRunState === 'running' && !stateChanged && !suspended
      ? rawRunDeltaMs
      : 0;
    if (suspended) this.#suspensionCount += 1;

    this.#runClockTimeMs += this.#runDeltaMs;
    this.#remainingMs = Math.max(0, remainingMs - this.#runDeltaMs);
    this.#lastRenderAtMs = nowMs;
    this.#lastRunAtMs = nowMs;
    this.#sampleCount += 1;
    this.setRunState(nextRunState);

    return Object.freeze({
      renderDeltaMs: this.#renderDeltaMs,
      simulationDeltaMs: this.#simulationDeltaMs,
      runDeltaMs: this.#runDeltaMs,
      runState: this.#runState,
    });
  }

  getSnapshot(): ClockSnapshot {
    return Object.freeze({
      renderTimeMs: this.#renderTimeMs,
      renderDeltaMs: this.#renderDeltaMs,
      simulationTimeMs: this.#simulationTimeMs,
      simulationDeltaMs: this.#simulationDeltaMs,
      runClockTimeMs: this.#runClockTimeMs,
      runDeltaMs: this.#runDeltaMs,
      remainingMs: this.#remainingMs,
      runState: this.#runState,
      sampleCount: this.#sampleCount,
      suspensionCount: this.#suspensionCount,
    });
  }

  runContractProbe(): ClockContractProbe {
    const probe = new GameClocks();
    probe.resetRun(180_000, 1_000);
    const samples = [
      probe.sample({ nowMs: 1_000, runActive: false, paused: false, remainingSeconds: 180 }),
      probe.sample({ nowMs: 1_100, runActive: true, paused: false, remainingSeconds: 180 }),
      probe.sample({ nowMs: 1_600, runActive: true, paused: false, remainingSeconds: 180 }),
      probe.sample({ nowMs: 2_100, runActive: true, paused: true, remainingSeconds: 179.5 }),
      probe.sample({ nowMs: 3_100, runActive: true, paused: true, remainingSeconds: 179.5 }),
      probe.sample({ nowMs: 3_200, runActive: true, paused: false, remainingSeconds: 179.5 }),
      probe.sample({ nowMs: 3_700, runActive: true, paused: false, remainingSeconds: 179.5 }),
      probe.sample({ nowMs: 6_000, runActive: true, paused: false, remainingSeconds: 179 }),
      probe.sample({ nowMs: 6_500, runActive: true, paused: false, remainingSeconds: 179 }),
    ];
    const checks = Object.freeze({
      startTransitionChargesZero: samples[1]?.runDeltaMs === 0,
      runningUsesWallTime: samples[2]?.runDeltaMs === 500,
      pauseChargesZero: samples[3]?.runDeltaMs === 0 && samples[4]?.runDeltaMs === 0,
      resumeTransitionChargesZero: samples[5]?.runDeltaMs === 0,
      resumedRunUsesWallTime: samples[6]?.runDeltaMs === 500,
      suspensionChargesZero: samples[7]?.runDeltaMs === 0,
      simulationDeltaIsCapped: samples[8]?.simulationDeltaMs === MAX_SIMULATION_DELTA_MS,
      runDeltaRemainsUncappedBelowSuspension: samples[8]?.runDeltaMs === 500,
    });
    return Object.freeze({
      passed: Object.values(checks).every(Boolean),
      checks,
      samples: Object.freeze(samples),
    });
  }

  private resolveRunState(runActive: boolean, paused: boolean, remainingMs: number): RunClockState {
    if (remainingMs <= 0) return 'finished';
    if (!runActive) return 'idle';
    return paused ? 'paused' : 'running';
  }

  private setRunState(next: RunClockState): void {
    if (next === this.#runState) return;
    this.#runState = next;
    this.#listener?.(next);
  }
}
