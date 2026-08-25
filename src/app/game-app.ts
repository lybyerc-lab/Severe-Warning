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
        this.#context.persistence,
      );
      this.#context.legacy.attachPresentationWorld(
        this.#context.renderer,
        this.#context.scene,
        this.#context.camera,
        this.#context.atmosphere,
        this.#context.tornado,
        this.#context.world,
        this.#context.hartFarm,
        this.#context.silo,
      );
      this.#context.legacy.attachUi(this.#context.ui);
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
    // The legacy adapter owns the authoritative rebuild and synchronizes every
    // passive mirror afterward. Direct mirror resets here would erase accepted
    // scoring, district, world, or presentation state a second time.
    this.#context.legacy.reset();
    const legacy = this.#context.legacy.getRunState();
    this.#context.clocks.resetRun(Math.max(0, legacy.remainingSeconds) * 1000, performance.now());
    this.transition('ready');
  }

  dispose(): void {
    if (this.#state === 'disposed') return;
    this.#context.clocks.setRunStateListener(() => {});
    this.#context.input.reset();
    // Phase 4 and Phase 5 systems are passive mirrors. They own no legacy
    // renderer, scene, world, scoring, district, or destruction resources.
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
