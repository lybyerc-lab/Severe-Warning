// ============================================================================
// [SW:ARCH:PHASE5_TORNADO_PRESENTATION_SYSTEM]
// Tornado presentation authority: observes funnel volumes, rings, and debris.
// ============================================================================

import type { TornadoPresentationSnapshot } from './tornado-presentation-contracts';

export class TornadoPresentationSystem {
  private funnels = 4;
  private rings = 3;
  private debris = 14;
  private groundDust = true;

  updateVisuals(funnelLayers: number = 4, suctionRings: number = 3, debrisCount: number = 14, dust: boolean = true): void {
    this.funnels = Math.max(1, Math.round(Number(funnelLayers) || 4));
    this.rings = Math.max(0, Math.round(Number(suctionRings) || 3));
    this.debris = Math.max(0, Math.round(Number(debrisCount) || 14));
    this.groundDust = Boolean(dust);
  }

  reset(): void {
    this.funnels = 4;
    this.rings = 3;
    this.debris = 0;
    this.groundDust = true;
  }

  getSnapshot(): TornadoPresentationSnapshot {
    return Object.freeze({
      funnelLayerCount: this.funnels,
      suctionRingCount: this.rings,
      activeDebrisCount: this.debris,
      groundDustActive: this.groundDust,
      isMultiVolumeHero: this.funnels >= 3 && this.rings >= 3
    });
  }
}
