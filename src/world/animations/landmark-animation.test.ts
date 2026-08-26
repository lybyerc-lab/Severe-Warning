import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LandmarkAnimationSystem,
  FERRIS_WHEEL_SPEED_RAD_PER_SEC,
  CAROUSEL_SPEED_RAD_PER_SEC
} from './landmark-animation-system.ts';

test('LandmarkAnimationSystem: advances Ferris wheel and Carousel mechanical angles', () => {
  const system = new LandmarkAnimationSystem();
  assert.equal(system.getSnapshot().state.ferrisWheelAngle, 0);
  assert.equal(system.getSnapshot().state.carouselAngle, 0);

  system.update(1.0);
  const snapshot = system.getSnapshot();
  assert.equal(Math.abs(snapshot.state.ferrisWheelAngle - FERRIS_WHEEL_SPEED_RAD_PER_SEC) < 0.01, true);
  assert.equal(Math.abs(snapshot.state.carouselAngle - CAROUSEL_SPEED_RAD_PER_SEC) < 0.01, true);
  assert.equal(snapshot.state.horseGallopOffsets.length, 3);
  assert.equal(snapshot.state.isNightFairLit, true);
});

test('LandmarkAnimationSystem: generates and simulates rising Foundry smoke plumes', () => {
  const system = new LandmarkAnimationSystem();
  assert.equal(system.getSnapshot().state.foundrySmokeCount, 0);

  // Update over 2 seconds
  for (let i = 0; i < 20; i++) {
    system.update(0.1, 1.0, 0.0);
  }

  const snapshot = system.getSnapshot();
  assert.equal(snapshot.state.foundrySmokeCount > 5, true);
  assert.equal(snapshot.state.crucibleGlowIntensity > 0, true);

  system.reset();
  assert.equal(system.getSnapshot().state.foundrySmokeCount, 0);
  assert.equal(system.getSnapshot().totalElapsedSeconds, 0);
});
