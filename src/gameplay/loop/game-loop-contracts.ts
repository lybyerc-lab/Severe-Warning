/**
 * [SW:ARCH:PHASE8_LOOP_CONTRACTS]
 * Type definitions for the master game loop, frame ticks, and lifecycle state.
 */

export type GameLifecycleState = 'idle' | 'running' | 'paused' | 'results';

export interface GameLoopTickContext {
  deltaSeconds: number;
  nowMilliseconds: number;
  stormX: number;
  stormZ: number;
  stormRadius: number;
  isMoving: boolean;
}

export interface GameLoopSnapshot {
  state: GameLifecycleState;
  frameCount: number;
  averageFps: number;
  runTimeSeconds: number;
}

export interface GameLoopContract {
  start(): void;
  pause(): void;
  resume(): void;
  tick(context: GameLoopTickContext): void;
  getSnapshot(): GameLoopSnapshot;
  reset(): void;
}
