import test from 'node:test';
import assert from 'node:assert/strict';
import { TrafficSystem } from './traffic-system.ts';
import { AudioSystem } from '../../audio/audio-system.ts';

test('TrafficSystem: spawns all 4 vehicle types with First Law protection', () => {
  const traffic = new TrafficSystem();
  const waypoints = [
    { x: -160, z: -240, dx: 0, dz: 1 },
    { x: -80, z: -240, dx: 0, dz: 1 },
    { x: 0, z: -240, dx: 0, dz: 1 },
    { x: 80, z: -240, dx: 0, dz: 1 }
  ];

  traffic.spawnFleet(12, waypoints);
  const snapshot = traffic.getSnapshot();

  assert.equal(snapshot.totalVehicles, 12);
  assert.equal(snapshot.modelDistribution['town-car'] > 0, true);
  assert.equal(snapshot.modelDistribution['pickup-truck'] > 0, true);
  assert.equal(snapshot.modelDistribution['news-van'] > 0, true);
  assert.equal(snapshot.modelDistribution['storm-chaser-vehicle'] > 0, true);

  for (const v of snapshot.vehicles) {
    assert.equal(v.isProtected, true); // First Law invariant
  }
});

test('TrafficSystem: accelerates vehicles when vortex is within panic radius', () => {
  const traffic = new TrafficSystem();
  traffic.spawnFleet(1, [{ x: 0, z: 0, dx: 0, dz: 1 }]);

  // Initial state far from storm
  traffic.update(0.1, 200, 200);
  assert.equal(traffic.getSnapshot().fleeingCount, 0);

  // Storm moves directly next to the vehicle at (0, 0)
  traffic.update(0.1, 10, 10);
  assert.equal(traffic.getSnapshot().fleeingCount, 1);
  assert.equal(traffic.getSnapshot().vehicles[0]?.isFleeing, true);
});

test('AudioSystem: handles sound cue triggers and volume mix', () => {
  const audio = new AudioSystem();
  audio.initialize();

  const voiceId = audio.playCue('thunder_clap');
  assert.notEqual(voiceId, null);

  audio.setMasterVolume(0.5);
  assert.equal(audio.getSnapshot().mix.masterVolume, 0.5);

  audio.setMuted(true);
  const mutedVoice = audio.playCue('zap_arc');
  assert.equal(mutedVoice, null);
});
