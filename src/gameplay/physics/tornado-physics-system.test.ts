import test from 'node:test';
import assert from 'node:assert/strict';
import { TornadoPhysicsSystem } from './tornado-physics-system.ts';
import { CollisionDetectionSystem } from './collision-detection-system.ts';
import { ParticleSystem } from '../../presentation/vfx/particle-system.ts';
import { GameLoopController } from '../loop/game-loop-controller.ts';

test('TornadoPhysicsSystem: calculates Rankine vortex tangential and inward wind forces', () => {
  const physics = new TornadoPhysicsSystem({ coreRadius: 8.0, maxWindSpeed: 60.0 });
  const stormCenter = { x: 0, y: 0, z: 0 };

  // Sample wind at core radius (r = 8)
  const coreSample = physics.sampleWindAt({ x: 8, y: 0, z: 0 }, stormCenter);
  assert.equal(Math.round(coreSample.totalWindSpeed), 60);
  assert.equal(coreSample.inwardSuctionForce.x < 0, true); // Pulling inward towards x = 0

  // Sample wind outside core (r = 16)
  const outerSample = physics.sampleWindAt({ x: 16, y: 0, z: 0 }, stormCenter);
  assert.equal(Math.round(outerSample.totalWindSpeed), 30); // 1/r decay: 60 * (8/16) = 30
});

test('TornadoPhysicsSystem: manages debris particle spawning and simulation', () => {
  const physics = new TornadoPhysicsSystem();
  physics.spawnDebris({ x: 0, y: 1, z: 0 }, 10, '#ffffff');

  const initialSnapshot = physics.getSnapshot();
  assert.equal(initialSnapshot.activeDebrisCount, 10);

  physics.updateDebris(0.1, { x: 0, y: 0, z: 0 });
  assert.equal(physics.getSnapshot().activeDebrisCount, 10);

  physics.reset();
  assert.equal(physics.getSnapshot().activeDebrisCount, 0);
});

test('CollisionDetectionSystem: enforces First Law and multi-stage building degradation', () => {
  const collisions = new CollisionDetectionSystem();

  // Register protected vehicle (First Law invariant)
  collisions.registerEntity({
    id: 'town-car-1',
    position: { x: 0, y: 0, z: 0 },
    radius: 3.0,
    health: 100,
    maxHealth: 100,
    stage: 1,
    maxStages: 1,
    isProtected: true // Protected driver
  });

  // Attempting to damage a protected actor yields null (First Law holds)
  const protectedHit = collisions.damageTarget('town-car-1', 50, 0, 0, 10);
  assert.equal(protectedHit, null);

  // Register multi-stage barn
  collisions.registerEntity({
    id: 'hart-barn',
    position: { x: 5, y: 0, z: 5 },
    radius: 5.0,
    health: 100,
    maxHealth: 100,
    stage: 4,
    maxStages: 4,
    isProtected: false
  });

  // Inflict 50% damage: should reduce to stage 2
  const hit1 = collisions.damageTarget('hart-barn', 50, 5, 5, 8);
  assert.notEqual(hit1, null);
  assert.equal(hit1?.remainingHealth, 50);
  assert.equal(hit1?.currentStage, 2);
  assert.equal(hit1?.isDestroyed, false);

  // Inflict remaining 50% damage: should destroy
  const hit2 = collisions.damageTarget('hart-barn', 50, 5, 5, 8);
  assert.notEqual(hit2, null);
  assert.equal(hit2?.remainingHealth, 0);
  assert.equal(hit2?.isDestroyed, true);
});

test('ParticleSystem & GameLoopController: manage particle updates and lifecycle ticks', () => {
  const particles = new ParticleSystem();
  particles.emitSparks(0, 5, 0, 10);
  assert.equal(particles.getSnapshot().activeParticleCount, 10);

  particles.update(0.1);
  assert.equal(particles.getSnapshot().activeParticleCount, 10);

  const loop = new GameLoopController();
  assert.equal(loop.getSnapshot().state, 'idle');

  loop.start();
  assert.equal(loop.getSnapshot().state, 'running');

  loop.tick({
    deltaSeconds: 0.016,
    nowMilliseconds: 1000,
    stormX: 0,
    stormZ: 0,
    stormRadius: 8,
    isMoving: true
  });
  assert.equal(loop.getSnapshot().frameCount, 1);
});
