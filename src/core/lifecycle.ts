// ============================================================================
// [SW:ARCH:LIFECYCLE]
// Phase 1 establishes explicit ownership without changing legacy gameplay.
// ============================================================================

export type GameLifecycleState =
  | 'created'
  | 'initializing'
  | 'ready'
  | 'running'
  | 'paused'
  | 'failed'
  | 'disposed';

export interface GameFrame {
  readonly renderTimeMs: number;
  readonly renderDeltaMs: number;
  readonly simulationTimeMs: number;
  readonly simulationDeltaMs: number;
  readonly runClockTimeMs: number;
}

export interface GameSystem<TContext> {
  initialize(context: TContext): Promise<void> | void;
  startRun(): void;
  update(frame: GameFrame): void;
  reset(): void;
  dispose(): void;
}

export interface LifecycleStatus {
  readonly state: GameLifecycleState;
  readonly initializedAt: string | null;
  readonly failure: string | null;
}
