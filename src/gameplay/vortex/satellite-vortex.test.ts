import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SatelliteVortexSystem } from './satellite-vortex-system.ts';

describe('SatelliteVortexSystem', () => {
  test('initializes locked and inactive by default', () => {
    const system = new SatelliteVortexSystem();
    const state = system.getState();
    assert.equal(state.unlocked, false);
    assert.equal(state.active, false);
  });

  test('unlocking activates satellite vortex', () => {
    const system = new SatelliteVortexSystem();
    system.unlock();
    const state = system.getState();
    assert.equal(state.unlocked, true);
    assert.equal(state.active, true);
  });

  test('orbits around primary coordinates when active', () => {
    const system = new SatelliteVortexSystem({ orbitRadius: 20.0, orbitSpeed: 1.0 });
    system.unlock();

    system.update(100, 200, 0);
    let state = system.getState();
    assert.equal(state.worldX, 120); // 100 + 20 * cos(0)
    assert.equal(state.worldZ, 200); // 200 + 20 * sin(0)

    // Advance angle by 90 deg (PI/2 rad)
    for (let i = 0; i < 16; i++) {
      system.update(100, 200, (Math.PI / 2) / 16);
    }
    state = system.getState();
    assert.ok(Math.abs(state.worldX - 100) < 0.2);
    assert.ok(Math.abs(state.worldZ - 220) < 0.2);
  });

  test('calculates inward radial suction vector within suction radius', () => {
    const system = new SatelliteVortexSystem({ suctionRadius: 15.0 });
    system.unlock();
    system.update(0, 0, 0); // worldX = 22, worldZ = 0

    // Target at x = 12, z = 0 (10m away from satellite at 22, 0)
    const suction = system.calculateSuctionVector(12, 0);
    assert.ok(suction !== null);
    assert.ok(suction.fx > 0); // Pulls toward x=22 (positive X)
    assert.equal(suction.distance, 10);

    // Target outside radius (e.g. 50m away)
    const outSuction = system.calculateSuctionVector(-30, 0);
    assert.equal(outSuction, null);
  });

  test('records hits and tracks combo count', () => {
    const system = new SatelliteVortexSystem();
    system.unlock();
    system.recordHit({
      targetId: 'house-12',
      targetName: 'Craftsman House',
      damage: 150,
      destroyed: true,
      points: 250
    });
    assert.equal(system.getState().comboCount, 1);
  });
});
