import type {
  GameLifecycleState,
  GameLoopTickContext,
  GameLoopSnapshot,
  GameLoopContract
} from './game-loop-contracts.ts';

export class GameLoopController implements GameLoopContract {
  private state: GameLifecycleState = 'idle';
  private frameCount = 0;
  private runTimeSeconds = 0;
  private lastFpsSampleTime = 0;
  private framesSinceLastFps = 0;
  private averageFps = 60;

  public start(): void {
    this.state = 'running';
    this.runTimeSeconds = 0;
    this.frameCount = 0;
  }

  public pause(): void {
    if (this.state === 'running') {
      this.state = 'paused';
    }
  }

  public resume(): void {
    if (this.state === 'paused') {
      this.state = 'running';
    }
  }

  public tick(context: GameLoopTickContext): void {
    if (this.state !== 'running') return;

    this.frameCount += 1;
    this.framesSinceLastFps += 1;
    this.runTimeSeconds += context.deltaSeconds;

    if (context.nowMilliseconds - this.lastFpsSampleTime >= 1000) {
      this.averageFps = Math.round((this.framesSinceLastFps * 1000) / Math.max(1, context.nowMilliseconds - this.lastFpsSampleTime));
      this.lastFpsSampleTime = context.nowMilliseconds;
      this.framesSinceLastFps = 0;
    }
  }

  public getSnapshot(): GameLoopSnapshot {
    return {
      state: this.state,
      frameCount: this.frameCount,
      averageFps: this.averageFps,
      runTimeSeconds: Number(this.runTimeSeconds.toFixed(2))
    };
  }

  public reset(): void {
    this.state = 'idle';
    this.frameCount = 0;
    this.runTimeSeconds = 0;
    this.framesSinceLastFps = 0;
  }
}
