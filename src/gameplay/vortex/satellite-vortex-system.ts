import type {
  SatelliteVortexConfig,
  SatelliteVortexState,
  SatelliteVortexHitEvent
} from './satellite-vortex-contracts.ts';

export const DEFAULT_SATELLITE_CONFIG: SatelliteVortexConfig = {
  orbitRadius: 22.0,
  orbitSpeed: 1.75,
  suctionRadius: 16.0,
  damageRadius: 10.5,
  damageRate: 150.0,
  funnelHeight: 24.0,
  scale: 0.52
};

export class SatelliteVortexSystem {
  private config: SatelliteVortexConfig;
  private state: SatelliteVortexState;
  private hitHistory: SatelliteVortexHitEvent[] = [];

  constructor(config: Partial<SatelliteVortexConfig> = {}) {
    this.config = { ...DEFAULT_SATELLITE_CONFIG, ...config };
    this.state = {
      unlocked: false,
      active: false,
      angle: 0,
      worldX: 0,
      worldZ: 0,
      orbitRadius: this.config.orbitRadius,
      orbitSpeed: this.config.orbitSpeed,
      suctionRadius: this.config.suctionRadius,
      damageRadius: this.config.damageRadius,
      comboCount: 0,
      lastDamageTimestamp: 0
    };
  }

  public unlock(): void {
    this.state.unlocked = true;
    this.state.active = true;
  }

  public setActive(active: boolean): void {
    if (!this.state.unlocked && active) {
      this.state.unlocked = true;
    }
    this.state.active = active;
  }

  public update(primaryX: number, primaryZ: number, dt: number, efRatingNumber: number = 0): void {
    if (!this.state.unlocked && efRatingNumber >= 3) {
      this.state.active = true;
    }

    if (!this.state.active) return;

    const clampedDt = Math.max(0, Math.min(0.1, dt));
    this.state.angle = (this.state.angle + this.state.orbitSpeed * clampedDt) % (Math.PI * 2);

    this.state.worldX = primaryX + Math.cos(this.state.angle) * this.state.orbitRadius;
    this.state.worldZ = primaryZ + Math.sin(this.state.angle) * this.state.orbitRadius;
  }

  public calculateSuctionVector(targetX: number, targetZ: number): { fx: number; fz: number; distance: number } | null {
    if (!this.state.active) return null;

    const dx = this.state.worldX - targetX;
    const dz = this.state.worldZ - targetZ;
    const distSq = dx * dx + dz * dz;
    const dist = Math.sqrt(distSq);

    if (dist > this.state.suctionRadius || dist < 0.1) {
      return null;
    }

    const forceMagnitude = (1.0 - dist / this.state.suctionRadius) * 28.0;
    return {
      fx: (dx / dist) * forceMagnitude,
      fz: (dz / dist) * forceMagnitude,
      distance: dist
    };
  }

  public recordHit(event: SatelliteVortexHitEvent): void {
    this.hitHistory.push(event);
    this.state.comboCount += 1;
    this.state.lastDamageTimestamp = Date.now();
  }

  public getState(): Readonly<SatelliteVortexState> {
    return { ...this.state };
  }

  public getConfig(): Readonly<SatelliteVortexConfig> {
    return { ...this.config };
  }

  public reset(): void {
    this.state.angle = 0;
    this.state.comboCount = 0;
    this.hitHistory.length = 0;
  }
}
