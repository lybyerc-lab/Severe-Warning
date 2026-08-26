import type {
  Vector3D,
  RankineVortexConfig,
  VortexForceSample,
  DebrisParticleState,
  PhysicsSystemSnapshot,
  TornadoPhysicsContract
} from './tornado-physics-contracts.ts';

export class TornadoPhysicsSystem implements TornadoPhysicsContract {
  private config: RankineVortexConfig = {
    coreRadius: 8.0,
    maxWindSpeed: 65.0,
    inwardSuctionCoefficient: 1.8,
    updraftCoefficient: 2.2,
    centrifugalEjectionSpeed: 45.0
  };

  private debrisParticles: DebrisParticleState[] = [];
  private nextDebrisId = 1;

  constructor(configOverrides?: Partial<RankineVortexConfig>) {
    if (configOverrides) {
      this.config = { ...this.config, ...configOverrides };
    }
  }

  public sampleWindAt(point: Vector3D, stormCenter: Vector3D): VortexForceSample {
    const dx = point.x - stormCenter.x;
    const dz = point.z - stormCenter.z;
    const distSq = dx * dx + dz * dz;
    const dist = Math.sqrt(distSq);

    if (dist < 0.001) {
      return {
        tangentialVelocity: { x: 0, y: 0, z: 0 },
        inwardSuctionForce: { x: 0, y: 0, z: 0 },
        updraftForce: this.config.maxWindSpeed * this.config.updraftCoefficient,
        totalWindSpeed: this.config.maxWindSpeed
      };
    }

    // Rankine Vortex Profile
    let speed = 0;
    if (dist <= this.config.coreRadius) {
      // Solid-body rotation inside core: v proportional to r
      speed = this.config.maxWindSpeed * (dist / this.config.coreRadius);
    } else {
      // Irrotational free vortex outside core: v proportional to 1/r
      speed = this.config.maxWindSpeed * (this.config.coreRadius / dist);
    }

    // Unit vector pointing towards storm center
    const invDist = 1 / dist;
    const dirX = -dx * invDist;
    const dirZ = -dz * invDist;

    // Tangential unit vector (counter-clockwise cyclonic)
    const tangX = -dirZ;
    const tangZ = dirX;

    const tangentialVelocity: Vector3D = {
      x: tangX * speed,
      y: 0,
      z: tangZ * speed
    };

    // Inward suction force
    const suctionStrength = speed * this.config.inwardSuctionCoefficient * (1.0 / (1.0 + dist * 0.05));
    const inwardSuctionForce: Vector3D = {
      x: dirX * suctionStrength,
      y: 0,
      z: dirZ * suctionStrength
    };

    // Vertical updraft decaying with radial distance and height
    const updraftStrength = Math.max(0, (speed * this.config.updraftCoefficient) - (point.y * 0.4));

    return {
      tangentialVelocity,
      inwardSuctionForce,
      updraftForce: updraftStrength,
      totalWindSpeed: speed
    };
  }

  public spawnDebris(origin: Vector3D, count: number, color = '#e2e8f0'): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const initialSpeed = 5.0 + Math.random() * 15.0;
      this.debrisParticles.push({
        id: `debris-${this.nextDebrisId++}`,
        position: {
          x: origin.x + (Math.random() - 0.5) * 2.0,
          y: Math.max(0.5, origin.y + Math.random() * 1.5),
          z: origin.z + (Math.random() - 0.5) * 2.0
        },
        velocity: {
          x: Math.cos(angle) * initialSpeed,
          y: 4.0 + Math.random() * 8.0,
          z: Math.sin(angle) * initialSpeed
        },
        rotation: { x: Math.random() * Math.PI, y: Math.random() * Math.PI, z: Math.random() * Math.PI },
        angularVelocity: {
          x: (Math.random() - 0.5) * 10.0,
          y: (Math.random() - 0.5) * 12.0,
          z: (Math.random() - 0.5) * 10.0
        },
        scale: 0.3 + Math.random() * 0.5,
        color,
        lifeRemainingSeconds: 3.5 + Math.random() * 2.5,
        isAirborne: true
      });
    }

    // Keep debris count capped for performance
    if (this.debrisParticles.length > 250) {
      this.debrisParticles.splice(0, this.debrisParticles.length - 250);
    }
  }

  public updateDebris(deltaSeconds: number, stormCenter: Vector3D): void {
    const dt = Math.max(0, Math.min(0.1, deltaSeconds));
    const gravity = -9.81;

    for (let i = this.debrisParticles.length - 1; i >= 0; i--) {
      const p = this.debrisParticles[i];
      p.lifeRemainingSeconds -= dt;

      if (p.lifeRemainingSeconds <= 0) {
        this.debrisParticles.splice(i, 1);
        continue;
      }

      const wind = this.sampleWindAt(p.position, stormCenter);

      // Apply wind forces
      p.velocity.x += (wind.tangentialVelocity.x + wind.inwardSuctionForce.x) * dt * 2.5;
      p.velocity.z += (wind.tangentialVelocity.z + wind.inwardSuctionForce.z) * dt * 2.5;
      p.velocity.y += (wind.updraftForce + gravity) * dt;

      // Integrate position
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.position.z += p.velocity.z * dt;

      // Integrate rotation
      p.rotation.x += p.angularVelocity.x * dt;
      p.rotation.y += p.angularVelocity.y * dt;
      p.rotation.z += p.angularVelocity.z * dt;

      // Ground collision bounce
      if (p.position.y <= 0) {
        p.position.y = 0;
        p.velocity.y = -p.velocity.y * 0.3; // Damped ground bounce
        p.velocity.x *= 0.7;
        p.velocity.z *= 0.7;
        if (Math.abs(p.velocity.y) < 0.5) p.isAirborne = false;
      } else {
        p.isAirborne = true;
      }
    }
  }

  public getSnapshot(): PhysicsSystemSnapshot {
    return {
      activeDebrisCount: this.debrisParticles.length,
      vortexRadius: this.config.coreRadius,
      maxWindSpeed: this.config.maxWindSpeed,
      updraftStrength: this.config.updraftCoefficient
    };
  }

  public reset(): void {
    this.debrisParticles.length = 0;
    this.nextDebrisId = 1;
  }
}
