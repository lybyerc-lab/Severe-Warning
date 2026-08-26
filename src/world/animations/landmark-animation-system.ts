import type {
  LandmarkAnimationState,
  LandmarkAnimationSnapshot,
  LandmarkAnimationContract
} from './landmark-animation-contracts.ts';

export const FERRIS_WHEEL_SPEED_RAD_PER_SEC = 0.22;
export const CAROUSEL_SPEED_RAD_PER_SEC = 0.45;
export const FOUNDRY_SMOKE_MAX_CAPACITY = 60;

export interface SmokePlumeParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  scale: number;
}

export class LandmarkAnimationSystem implements LandmarkAnimationContract {
  private active = true;
  private elapsedSeconds = 0;
  private ferrisAngle = 0;
  private carouselAngle = 0;
  private smokeParticles: SmokePlumeParticle[] = [];
  private smokeSpawnAccumulator = 0;
  private crucibleGlow = 0.8;

  public update(deltaSeconds: number, windDirectionX = 1.0, windDirectionZ = 0.2): void {
    if (!this.active) return;
    const dt = Math.max(0, Math.min(2.0, deltaSeconds));
    this.elapsedSeconds += dt;

    // 1. County Fair Mechanical Ride Rotations
    this.ferrisAngle = (this.ferrisAngle + dt * FERRIS_WHEEL_SPEED_RAD_PER_SEC) % (Math.PI * 2);
    this.carouselAngle = (this.carouselAngle + dt * CAROUSEL_SPEED_RAD_PER_SEC) % (Math.PI * 2);

    // 2. Foundry Crucible Thermal Glow Pulsation
    this.crucibleGlow = 0.7 + Math.sin(this.elapsedSeconds * 2.8) * 0.3;

    // 3. 32m Twin Foundry Smokestack Thermal Particles
    this.smokeSpawnAccumulator += dt * 14; // ~14 particles/sec
    while (this.smokeSpawnAccumulator >= 1.0) {
      this.smokeSpawnAccumulator -= 1.0;
      if (this.smokeParticles.length < FOUNDRY_SMOKE_MAX_CAPACITY) {
        const stackOffset = Math.random() < 0.5 ? -2.5 : 2.5;
        this.smokeParticles.push({
          x: -140 + stackOffset + (Math.random() - 0.5) * 0.8,
          y: 32.0, // Top of 32m stack
          z: 90 + (Math.random() - 0.5) * 0.8,
          vx: windDirectionX * 3.5 + (Math.random() - 0.5) * 1.0,
          vy: 4.5 + Math.random() * 1.5, // Upward buoyancy
          vz: windDirectionZ * 3.5 + (Math.random() - 0.5) * 1.0,
          life: 0,
          maxLife: 4.0 + Math.random() * 1.5,
          scale: 1.0
        });
      }
    }

    // Update existing smoke particles
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      if (!p) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.smokeParticles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.scale += dt * 0.8; // Thermal expansion as smoke rises
      p.vy = Math.max(1.0, p.vy - dt * 0.5); // Air resistance slowing upward ascent
    }
  }

  public getSnapshot(): LandmarkAnimationSnapshot {
    const horseOffsets = [
      Math.sin(this.elapsedSeconds * 3.2 + 0) * 0.45,
      Math.sin(this.elapsedSeconds * 3.2 + (Math.PI * 2) / 3) * 0.45,
      Math.sin(this.elapsedSeconds * 3.2 + (Math.PI * 4) / 3) * 0.45
    ];

    const state: LandmarkAnimationState = {
      ferrisWheelAngle: Number(this.ferrisAngle.toFixed(3)),
      carouselAngle: Number(this.carouselAngle.toFixed(3)),
      horseGallopOffsets: horseOffsets.map(o => Number(o.toFixed(3))),
      foundrySmokeCount: this.smokeParticles.length,
      crucibleGlowIntensity: Number(this.crucibleGlow.toFixed(2)),
      isNightFairLit: true
    };

    return Object.freeze({
      active: this.active,
      state,
      totalElapsedSeconds: Number(this.elapsedSeconds.toFixed(2))
    });
  }

  public reset(): void {
    this.elapsedSeconds = 0;
    this.ferrisAngle = 0;
    this.carouselAngle = 0;
    this.smokeParticles.length = 0;
    this.smokeSpawnAccumulator = 0;
    this.crucibleGlow = 0.8;
  }
}
