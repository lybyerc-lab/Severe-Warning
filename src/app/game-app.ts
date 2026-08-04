// ============================================================================
// [SW:ARCH:GAME_APP]
// Owns bootstrap and mirrors lifecycle from the authoritative run clock.
// ============================================================================

import type { RunClockState } from '../core/clocks';
import type { GameLifecycleState, LifecycleStatus } from '../core/lifecycle';
import type { GameContext } from './game-context';

export class GameApp {
  readonly #context: GameContext;
  #state: GameLifecycleState = 'created';
  #initializedAt: string | null = null;
  #failure: string | null = null;

  constructor(context: GameContext) {
    this.#context = context;
  }

  get context(): GameContext {
    return this.#context;
  }

  getStatus(): LifecycleStatus {
    return Object.freeze({
      state: this.#state,
      initializedAt: this.#initializedAt,
      failure: this.#failure,
    });
  }

  async initialize(): Promise<void> {
    this.transition('initializing');
    try {
      await this.#context.legacy.waitUntilReady();
      this.#context.clocks.setRunStateListener((state) => this.syncRunState(state));
      this.#context.legacy.attachClocks(this.#context.clocks);
      this.#context.legacy.attachInputAbilities(this.#context.input, this.#context.abilities);
      this.#context.legacy.attachScoringCampaign(
        this.#context.scoring,
        this.#context.district,
        this.#context.campaign,
        this.#context.persistence
      );
      this.#initializedAt = new Date().toISOString();
      this.transition('ready');
    } catch (error) {
      this.#failure = error instanceof Error ? error.message : String(error);
      this.transition('failed');
      throw error;
    }
  }

  reset(): void {
    this.requireState('ready', 'running', 'paused');
    this.#context.legacy.reset();
    const legacy = this.#context.legacy.getRunState();
    this.#context.clocks.resetRun(Math.max(0, legacy.remainingSeconds) * 1000, performance.now());
    this.#context.scoring.reset();
    this.#context.district.reset();
    this.transition('ready');
  }

  dispose(): void {
    if (this.#state === 'disposed') return;
    this.#context.clocks.setRunStateListener(() => {});
    this.#context.input.reset();
    this.#context.scoring.reset();
    this.#context.district.reset();
    this.transition('disposed');
  }

  private syncRunState(runState: RunClockState): void {
    if (this.#state === 'initializing' || this.#state === 'failed' || this.#state === 'disposed') return;
    if (runState === 'running') this.transition('running');
    else if (runState === 'paused') this.transition('paused');
    else this.transition('ready');
  }

  private requireState(...allowed: GameLifecycleState[]): void {
    if (!allowed.includes(this.#state)) {
      throw new Error(`GameApp cannot perform this operation while ${this.#state}.`);
    }
  }

  private transition(next: GameLifecycleState): void {
    this.#state = next;
  }
}
