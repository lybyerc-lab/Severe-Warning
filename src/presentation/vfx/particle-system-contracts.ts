/**
 * [SW:ARCH:PHASE8_VFX_CONTRACTS]
 * Type definitions for visual effects, spark emitters, and dust clouds.
 */

export interface ParticleEffectEmitterConfig {
  maxParticles: number;
  spawnRate: number;
  particleLifetimeSeconds: number;
  initialSpeed: number;
  color: string;
}

export interface ParticleSystemSnapshot {
  activeParticleCount: number;
  activeEmitters: number;
}

export interface ParticleSystemContract {
  emitSparks(x: number, y: number, z: number, count?: number, color?: string): void;
  emitDust(x: number, y: number, z: number, radius?: number): void;
  update(deltaSeconds: number): void;
  getSnapshot(): ParticleSystemSnapshot;
  reset(): void;
}
