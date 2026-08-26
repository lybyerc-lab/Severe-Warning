import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { NewsChopperSystem } from './news-chopper-system.ts';

describe('NewsChopperSystem', () => {
  test('initializes with default broadcast callsign and altitude', () => {
    const chopper = new NewsChopperSystem();
    const state = chopper.getState();
    assert.equal(state.callsign, 'ACTION CHOPPER 8');
    assert.equal(state.y, 52.0);
    assert.equal(state.active, true);
    assert.equal(state.liveFeedActive, false);
  });

  test('orbits around storm center and rotates rotors', () => {
    const chopper = new NewsChopperSystem({ orbitRadius: 40.0, orbitSpeed: 1.0 });
    chopper.update(100, 100, 0.5);

    const state = chopper.getState();
    assert.ok(state.mainRotorAngle > 0);
    assert.ok(state.tailRotorAngle > 0);
    assert.ok(state.x !== 0);
    assert.ok(state.z !== 0);
  });

  test('triggering aerial scoop activates live feed timer and increments scoops', () => {
    const chopper = new NewsChopperSystem({ liveFeedDuration: 3.0, scoopScoreReward: 350 });
    const scoop = chopper.triggerAerialScoop('Cow 17', 24.5);

    assert.equal(scoop.subjectName, 'Cow 17');
    assert.equal(scoop.points, 350);

    const state = chopper.getState();
    assert.equal(state.liveFeedActive, true);
    assert.equal(state.liveFeedTimer, 3.0);
    assert.equal(state.totalScoopsAwarded, 1);

    // After 3.5 seconds (35 frames of 0.1s), feed auto-closes
    for (let i = 0; i < 35; i++) {
      chopper.update(0, 0, 0.1);
    }
    assert.equal(chopper.getState().liveFeedActive, false);
  });
});
