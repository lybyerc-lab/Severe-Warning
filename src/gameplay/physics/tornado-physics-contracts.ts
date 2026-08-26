/**
 * [SW:ARCH:PHASE8_PHYSICS_CONTRACTS]
 * Type definitions for tornado vortex force fields, debris kinematics, and collisions.
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface RankineVortexConfig {
  coreRadius: number;
  maxWindSpeed: number;
  inwardSuctionCoefficient: number;
  updraftCoefficient: number;
  centrifugalEjectionSpeed: number;
}

export interface VortexForceSample {
  tangentialVelocity: Vector3D;
  inwardSuctionForce: Vector3D;
  updraftForce: number;
  totalWindSpeed: number;
}

export interface DebrisParticleState {
  id: string;
  position: Vector3D;
  velocity: Vector3D;
  rotation: Vector3D;
  angularVelocity: Vector3D;
  scale: number;
  color: string;
  lifeRemainingSeconds: number;
  isAirborne: boolean;
}

export interface DamageableEntity {
  id: string;
  position: Vector3D;
  radius: number;
  health: number;
  maxHealth: number;
  stage: number;
  maxStages: number;
  isProtected: boolean; // First Law: Nothing that moves is ever harmed.
}

export interface CollisionEvent {
  targetId: string;
  damageInflicted: number;
  remainingHealth: number;
  currentStage: number;
  isDestroyed: boolean;
  scoreAwarded: number;
}

export interface PhysicsSystemSnapshot {
  activeDebrisCount: number;
  vortexRadius: number;
  maxWindSpeed: number;
  updraftStrength: number;
}

export interface TornadoPhysicsContract {
  sampleWindAt(point: Vector3D, stormCenter: Vector3D): VortexForceSample;
  updateDebris(deltaSeconds: number, stormCenter: Vector3D): void;
  spawnDebris(origin: Vector3D, count: number, color?: string): void;
  getSnapshot(): PhysicsSystemSnapshot;
  reset(): void;
}
