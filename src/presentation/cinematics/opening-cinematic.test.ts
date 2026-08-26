import test from 'node:test';
import assert from 'node:assert/strict';
import { MooBrewOpeningCinematic, OPENING_CINEMATIC_DURATION } from './moo-brew-opening-cinematic.ts';

test('MooBrewOpeningCinematic: advances beats and smoothly blends camera to player position', () => {
  const cinematic = new MooBrewOpeningCinematic();
  assert.equal(cinematic.getSnapshot().active, false);
  assert.equal(cinematic.getSnapshot().isCompleted, false);

  cinematic.start();
  assert.equal(cinematic.getSnapshot().active, true);
  assert.equal(cinematic.getSnapshot().currentBeat, 'morning-gazette-reveal');

  // Advance to fence conversation (t = 3.0s)
  cinematic.update(3.0);
  assert.equal(cinematic.getSnapshot().currentBeat, 'fence-conversation');
  assert.equal(cinematic.getSnapshot().canSkip, true);

  // Advance to double-take (t = 7.0s)
  cinematic.update(4.0);
  assert.equal(cinematic.getSnapshot().currentBeat, 'double-take');

  // Advance to final sip (t = 9.0s)
  cinematic.update(2.0);
  assert.equal(cinematic.getSnapshot().currentBeat, 'last-sip');

  // Advance to touchdown and camera blend (t = 11.5s)
  cinematic.update(2.5);
  assert.equal(cinematic.getSnapshot().currentBeat, 'touchdown-handoff');
  assert.equal(cinematic.getSnapshot().camera.fov > 30, true);

  // Complete timeline
  cinematic.update(2.0);
  assert.equal(cinematic.getSnapshot().active, false);
  assert.equal(cinematic.getSnapshot().isCompleted, true);
  assert.equal(cinematic.getSnapshot().elapsedSeconds, OPENING_CINEMATIC_DURATION);
});

test('MooBrewOpeningCinematic: instant skip immediately resolves to player handoff', () => {
  const cinematic = new MooBrewOpeningCinematic();
  cinematic.start();
  cinematic.update(1.0);
  assert.equal(cinematic.getSnapshot().active, true);

  cinematic.skip();
  assert.equal(cinematic.getSnapshot().active, false);
  assert.equal(cinematic.getSnapshot().isCompleted, true);
  assert.equal(cinematic.getSnapshot().elapsedSeconds, OPENING_CINEMATIC_DURATION);
});
