// [SW:ARCH:INTEGRITY_SYSTEM]
// Funnel integrity: the run's first way to go wrong.
//
// Until this existed there was exactly one in-game path that ended a run --
// `runTimeRemaining <= 0`. A three-minute round could be scored but never lost,
// which capped how much any other tuning could matter: no threat, no decision
// under pressure, and a finale that was guaranteed rather than earned.
//
// The fiction does the design work. A real tornado is not a thing that lasts; it
// needs inflow, and it ropes out when it stops getting it. So the storm is fed by
// destruction: hit something and the funnel holds, coast and it starves.
//
// Three rules keep it fair, and each is a deliberate refusal of a harsher option:
//
//   1. IT ARMS ON THE FIRST HIT. Nothing drains until the storm has destroyed
//      something, so the opening cinematic, the drive to the first street, and a
//      player still reading the HUD cost nothing. (The cinematic runs on the same
//      clock as the round -- gating on it explicitly would have been a second
//      thing to keep in sync.)
//   2. A GRACE WINDOW. Drain only starts after INTEGRITY_GRACE_SECONDS of doing
//      no damage, so ordinary travel between blocks is free.
//   3. DAMAGE ALWAYS PAYS. Every scoring event refills, so the counter-play to a
//      falling meter is the thing the game is already about. It is never a timer
//      you can only watch.
//
// Pure: no THREE, no DOM, no globals. The game calls step() once a frame and does
// what the result says.

/** Full integrity, and the value a run starts at. */
export const INTEGRITY_MAX = 100;

/** Seconds of doing no damage before the funnel starts to starve. */
export const INTEGRITY_GRACE_SECONDS = 2.5;

/** Refill per scoring event. Roughly three hits undoes a second of drain. */
export const INTEGRITY_GAIN_PER_EVENT = 7;

/**
 * Drain per second, indexed by district. Index 0 is unused so the district
 * number reads directly.
 *
 * From full, ignoring the grace window, that is 16.7 s of idling in district 1,
 * 11.1 s in district 2 and 7.7 s in the finale -- so the pressure arrives with
 * the blackout finale rather than sitting on the whole round.
 */
export const INTEGRITY_DRAIN_PER_SECOND = Object.freeze([0, 6, 9, 13]);

/** Below this the meter reads as critical and the HUD says so. */
export const INTEGRITY_WARNING = 35;

export interface IntegrityState {
  /** Current integrity, 0..INTEGRITY_MAX. */
  readonly value: number;
  /** Seconds since the last scoring event. */
  readonly idleSeconds: number;
  /** False until the storm's first destruction; nothing drains before it. */
  readonly armed: boolean;
}

export interface IntegrityStep {
  /** Frame delta in seconds. */
  readonly dt: number;
  /** Which district the run is in (1..3). */
  readonly stage: number;
  /** Scoring events since the last step. */
  readonly damageEvents: number;
  /**
   * Multiplier on the drain rate, for upgrades that ease it. 1 is unmodified;
   * below 1 is gentler.
   */
  readonly drainScale?: number;
}

export function newIntegrityState(): IntegrityState {
  return { value: INTEGRITY_MAX, idleSeconds: 0, armed: false };
}

function drainFor(stage: number): number {
  const index = Number.isFinite(stage) ? Math.max(1, Math.min(3, Math.round(stage))) : 1;
  return INTEGRITY_DRAIN_PER_SECOND[index] ?? INTEGRITY_DRAIN_PER_SECOND[1]!;
}

/**
 * Advance integrity by one frame.
 *
 * Returns a new state; the caller holds it. A frame with damage refills and
 * resets the idle clock in the same step, so a player who is landing hits never
 * sees the meter move.
 */
export function stepIntegrity(state: IntegrityState, step: IntegrityStep): IntegrityState {
  const dt = Number.isFinite(step.dt) ? Math.max(0, Math.min(0.25, step.dt)) : 0;
  const events = Number.isFinite(step.damageEvents) ? Math.max(0, step.damageEvents) : 0;
  const previous = Number.isFinite(state.value) ? state.value : INTEGRITY_MAX;
  const armed = state.armed || events > 0;

  if (events > 0) {
    const refilled = Math.min(INTEGRITY_MAX, previous + INTEGRITY_GAIN_PER_EVENT * events);
    return { value: refilled, idleSeconds: 0, armed };
  }

  const idleSeconds = state.idleSeconds + dt;
  if (!armed || idleSeconds < INTEGRITY_GRACE_SECONDS) {
    return { value: previous, idleSeconds, armed };
  }

  const scale = Number.isFinite(step.drainScale) ? Math.max(0, step.drainScale as number) : 1;
  const value = Math.max(0, previous - drainFor(step.stage) * scale * dt);
  return { value, idleSeconds, armed };
}

/** True once the funnel has starved and the run should rope out. */
export function hasRopedOut(state: IntegrityState): boolean {
  return state.armed && state.value <= 0;
}

/** True while the meter should read as critical. */
export function isCritical(state: IntegrityState): boolean {
  return state.armed && state.value < INTEGRITY_WARNING;
}

/**
 * Seconds of idling left before rope-out, for a HUD that wants to warn early.
 * Infinity while unarmed or inside the grace window.
 */
export function secondsToRopeOut(state: IntegrityState, stage: number, drainScale = 1): number {
  if (!state.armed) return Number.POSITIVE_INFINITY;
  const scale = Number.isFinite(drainScale) ? Math.max(0, drainScale) : 1;
  const rate = drainFor(stage) * scale;
  if (rate <= 0) return Number.POSITIVE_INFINITY;
  const grace = Math.max(0, INTEGRITY_GRACE_SECONDS - state.idleSeconds);
  return grace + state.value / rate;
}
