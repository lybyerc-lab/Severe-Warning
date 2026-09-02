// [SW:ARCH:INTEGRITY_SYSTEM] tests
// Run with `npm test` (node:test + type stripping, no extra dependencies).
//
// These lock the three fairness rules as much as the numbers. Each of them is a
// refusal of a harsher design, and a regression that quietly removed one would
// not show up as a crash -- it would show up as a game that feels unfair, which
// is the hardest kind of bug to trace back to a diff.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  INTEGRITY_DRAIN_PER_SECOND,
  INTEGRITY_GAIN_PER_EVENT,
  INTEGRITY_GRACE_SECONDS,
  INTEGRITY_MAX,
  INTEGRITY_WARNING,
  hasRopedOut,
  isCritical,
  newIntegrityState,
  secondsToRopeOut,
  stepIntegrity,
} from './integrity-system.ts';

/** Drive the system the way the game does: one step per frame at 60fps. */
function run(seconds: number, options: { stage?: number; hitEvery?: number; drainScale?: number } = {}) {
  const stage = options.stage ?? 1;
  const frames = Math.round(seconds * 60);
  let state = newIntegrityState();
  for (let frame = 0; frame < frames; frame++) {
    const damageEvents = options.hitEvery && frame % Math.round(options.hitEvery * 60) === 0 ? 1 : 0;
    state = options.drainScale === undefined
      ? stepIntegrity(state, { dt: 1 / 60, stage, damageEvents })
      : stepIntegrity(state, { dt: 1 / 60, stage, damageEvents, drainScale: options.drainScale });
  }
  return state;
}

describe('funnel integrity', () => {
  test('nothing drains before the storm has destroyed anything', () => {
    // Rule 1. The opening cinematic runs on the same clock as the round, and a
    // player still finding the first street should not be punished for it.
    const state = run(30);
    assert.equal(state.value, INTEGRITY_MAX);
    assert.equal(state.armed, false);
    assert.equal(hasRopedOut(state), false);
    assert.equal(secondsToRopeOut(state, 3), Number.POSITIVE_INFINITY);
  });

  test('the grace window covers ordinary travel between blocks', () => {
    // Rule 2. Armed by one hit, then idle for slightly less than the grace.
    let state = stepIntegrity(newIntegrityState(), { dt: 1 / 60, stage: 1, damageEvents: 1 });
    const frames = Math.floor((INTEGRITY_GRACE_SECONDS - 0.05) * 60);
    for (let i = 0; i < frames; i++) {
      state = stepIntegrity(state, { dt: 1 / 60, stage: 1, damageEvents: 0 });
    }
    assert.equal(state.value, INTEGRITY_MAX, 'still full inside the grace window');
    assert.ok(state.idleSeconds > 0);
  });

  test('a player who keeps hitting things never sees the meter move', () => {
    // Rule 3, and the most important property here: the counter-play to a
    // falling meter is the thing the game is already about.
    const state = run(120, { stage: 3, hitEvery: 1.5 });
    assert.equal(state.value, INTEGRITY_MAX);
    assert.equal(isCritical(state), false);
  });

  test('idling after the grace window starves the funnel and ropes it out', () => {
    // Control first: with no hits at all the system never arms, so the drain
    // below cannot be an artifact of time simply passing.
    const neverArmed = run(40, { stage: 1 });
    assert.equal(neverArmed.armed, false);
    assert.equal(neverArmed.value, INTEGRITY_MAX);

    let armed = stepIntegrity(newIntegrityState(), { dt: 1 / 60, stage: 1, damageEvents: 1 });
    for (let i = 0; i < 60 * 40; i++) {
      armed = stepIntegrity(armed, { dt: 1 / 60, stage: 1, damageEvents: 0 });
    }
    assert.equal(armed.value, 0);
    assert.equal(hasRopedOut(armed), true);
  });

  test('the districts set the pressure, and the finale is the tightest', () => {
    const idleAfterOneHit = (stage: number, seconds: number) => {
      let state = stepIntegrity(newIntegrityState(), { dt: 1 / 60, stage, damageEvents: 1 });
      for (let i = 0; i < seconds * 60; i++) {
        state = stepIntegrity(state, { dt: 1 / 60, stage, damageEvents: 0 });
      }
      return state.value;
    };
    const [d1, d2, d3] = [idleAfterOneHit(1, 6), idleAfterOneHit(2, 6), idleAfterOneHit(3, 6)];
    assert.ok(d1 > d2 && d2 > d3, `drain should rise with the district, got ${d1} ${d2} ${d3}`);
    assert.ok(INTEGRITY_DRAIN_PER_SECOND[3]! > INTEGRITY_DRAIN_PER_SECOND[1]!);
  });

  test('an upgrade can ease the drain without stopping it', () => {
    const idle = (drainScale: number) => {
      let state = stepIntegrity(newIntegrityState(), { dt: 1 / 60, stage: 3, damageEvents: 1 });
      for (let i = 0; i < 60 * 6; i++) {
        state = stepIntegrity(state, { dt: 1 / 60, stage: 3, damageEvents: 0, drainScale });
      }
      return state.value;
    };
    assert.ok(idle(0.65) > idle(1), 'a gentler scale must leave more integrity');
    assert.ok(idle(0.65) < INTEGRITY_MAX, 'but it is still draining');
  });

  test('integrity is clamped at both ends', () => {
    let state = newIntegrityState();
    for (let i = 0; i < 50; i++) state = stepIntegrity(state, { dt: 1 / 60, stage: 1, damageEvents: 5 });
    assert.equal(state.value, INTEGRITY_MAX, 'refill cannot exceed full');

    let starved = stepIntegrity(newIntegrityState(), { dt: 1 / 60, stage: 3, damageEvents: 1 });
    for (let i = 0; i < 60 * 60; i++) {
      starved = stepIntegrity(starved, { dt: 1 / 60, stage: 3, damageEvents: 0 });
    }
    assert.equal(starved.value, 0, 'drain cannot go negative');
  });

  test('a frame with damage refills and clears the idle clock in one step', () => {
    let state = stepIntegrity(newIntegrityState(), { dt: 1 / 60, stage: 3, damageEvents: 1 });
    for (let i = 0; i < 60 * 5; i++) state = stepIntegrity(state, { dt: 1 / 60, stage: 3, damageEvents: 0 });
    const starved = state.value;
    assert.ok(starved < INTEGRITY_MAX);
    state = stepIntegrity(state, { dt: 1 / 60, stage: 3, damageEvents: 2 });
    assert.equal(state.idleSeconds, 0);
    assert.equal(state.value, Math.min(INTEGRITY_MAX, starved + INTEGRITY_GAIN_PER_EVENT * 2));
  });

  test('critical reads below the warning line, and never before arming', () => {
    assert.equal(isCritical(newIntegrityState()), false);
    const unarmedLow = { value: 1, idleSeconds: 99, armed: false };
    assert.equal(isCritical(unarmedLow), false, 'an unarmed run is not in danger');
    assert.equal(isCritical({ value: INTEGRITY_WARNING - 1, idleSeconds: 9, armed: true }), true);
    assert.equal(isCritical({ value: INTEGRITY_WARNING, idleSeconds: 9, armed: true }), false);
  });

  test('the countdown a HUD would show accounts for the grace window', () => {
    const fresh = { value: INTEGRITY_MAX, idleSeconds: 0, armed: true };
    const expected = INTEGRITY_GRACE_SECONDS + INTEGRITY_MAX / INTEGRITY_DRAIN_PER_SECOND[3]!;
    assert.ok(Math.abs(secondsToRopeOut(fresh, 3) - expected) < 1e-9);
    assert.ok(secondsToRopeOut(fresh, 1) > secondsToRopeOut(fresh, 3), 'district 1 gives more room');
  });

  test('nonsense input degrades instead of throwing', () => {
    const state = newIntegrityState();
    assert.equal(stepIntegrity(state, { dt: Number.NaN, stage: 1, damageEvents: 0 }).value, INTEGRITY_MAX);
    assert.equal(stepIntegrity(state, { dt: 1 / 60, stage: 99, damageEvents: 0 }).value, INTEGRITY_MAX);
    assert.equal(stepIntegrity(state, { dt: 1 / 60, stage: 1, damageEvents: -3 }).value, INTEGRITY_MAX);
    // A frame delta of a whole second (a stalled tab) is clamped, not applied.
    let armed = stepIntegrity(newIntegrityState(), { dt: 1 / 60, stage: 3, damageEvents: 1 });
    armed = { ...armed, idleSeconds: 99 };
    const afterStall = stepIntegrity(armed, { dt: 30, stage: 3, damageEvents: 0 });
    assert.ok(afterStall.value > 0, 'one stalled frame must not end the run');
  });
});
