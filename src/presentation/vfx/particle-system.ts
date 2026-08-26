import type {
  ParticleSystemSnapshot,
  ParticleSystemContract
} from './particle-system-contracts.ts';

interface LiveParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  color: string;
}

export class ParticleSystem implements ParticleSystemContract {
  private particles: LiveParticle[] = [];

  public emitSparks(x: number, y: number, z: number, count = 16, color = '#60a5fa'): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4.0 + Math.random() * 8.0;
      this.particles.push({
        x,
        y,
        z,
        vx: Math.cos(angle) * speed,
        vy: 3.0 + Math.random() * 6.0,
        vz: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.4,
        maxLife: 0.8,
        color
      });
    }

    this.trimCapacity();
  }

  public emitDust(x: number, y: number, z: number, radius = 6.0): void {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      this.particles.push({
        x: x + Math.cos(angle) * r,
        y: y + Math.random() * 1.5,
        z: z + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 2.0,
        vy: 1.0 + Math.random() * 2.0,
        vz: (Math.random() - 0.5) * 2.0,
        life: 1.0 + Math.random() * 1.5,
        maxLife: 2.5,
        color: '#94a3b8'
      });
    }

    this.trimCapacity();
  }

  public emitSmoke(x: number, y: number, z: number, count = 4, color = '#334155'): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 1.2,
        y: y + Math.random() * 0.8,
        z: z + (Math.random() - 0.5) * 1.2,
        vx: (Math.random() - 0.5) * 1.5 + 0.8, // Wind drift
        vy: 3.5 + Math.random() * 2.5,          // Thermal buoyancy
        vz: (Math.random() - 0.5) * 1.5,
        life: 2.0 + Math.random() * 1.5,
        maxLife: 3.5,
        color
      });
    }

    this.trimCapacity();
  }

  public emitMoltenEmber(x: number, y: number, z: number, count = 6): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 4.0;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 0.5,
        y: y + Math.random() * 0.5,
        z: z + (Math.random() - 0.5) * 0.5,
        vx: Math.cos(angle) * speed,
        vy: 2.5 + Math.random() * 4.0,
        vz: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.6,
        maxLife: 1.2,
        color: Math.random() > 0.5 ? '#f97316' : '#fbbf24'
      });
    }

    this.trimCapacity();
  }

  private trimCapacity(): void {
    if (this.particles.length > 500) {
      this.particles.splice(0, this.particles.length - 500);
    }
  }

  public update(deltaSeconds: number): void {
    const dt = Math.max(0, Math.min(0.1, deltaSeconds));
    const gravity = -9.81;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // If smoke, buoyancy counters gravity
      if (p.color === '#334155' || p.color === '#475569') {
        p.vy += (2.0) * dt; // Upward thermal draft
      } else {
        p.vy += gravity * dt;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      if (p.y < 0) {
        p.y = 0;
        p.vy = -p.vy * 0.2;
      }
    }
  }

  public getSnapshot(): ParticleSystemSnapshot {
    return {
      activeParticleCount: this.particles.length,
      activeEmitters: 1
    };
  }

  public reset(): void {
    this.particles.length = 0;
  }
}
