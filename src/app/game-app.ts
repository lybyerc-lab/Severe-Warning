// ============================================================================
// [SW:ARCH:GAME_APP]
// Owns Phase 1 bootstrap and lifecycle state. Gameplay remains legacy-owned.
// ============================================================================

import type { GameContext } from './game-context';
import type { GameLifecycleState, LifecycleStatus } from '../core/lifecycle';

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
      this.#initializedAt = new Date().toISOString();
      this.transition('ready');
    } catch (error) {
      this.#failure = error instanceof Error ? error.message : String(error);
      this.transition('failed');
      throw error;
    }
  }

  startRun(): void {
    this.requireState('ready', 'paused');
    this.transition('running');
  }

  pause(): void {
    this.requireState('running');
    this.transition('paused');
  }

  reset(): void {
    this.requireState('ready', 'running', 'paused');
    this.#context.legacy.reset();
    this.transition('ready');
  }

  dispose(): void {
    if (this.#state === 'disposed') return;
    this.transition('disposed');
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
