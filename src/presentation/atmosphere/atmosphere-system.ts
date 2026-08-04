// ============================================================================
// [SW:ARCH:PHASE5_ATMOSPHERE_SYSTEM]
// Atmosphere authority: observes storm lighting transitions and fog density.
// ============================================================================

import type { AtmosphereSnapshot } from './atmosphere-contracts';

export class AtmosphereSystem {
  private progress = 0.0;

  setStormProgress(progressRatio: number): void {
    this.progress = Math.min(1.0, Math.max(0.0, Number(progressRatio) || 0.0));
  }

  reset(): void {
    this.progress = 0.0;
  }

  getSnapshot(): AtmosphereSnapshot {
    const sunIntensity = 1.75 - this.progress * 1.15; // 1.75 down to 0.60
    const fogDensity = 0.0075 + this.progress * 0.0085; // 0.0075 up to 0.0160
    const isDarkened = this.progress > 0.3;

    return Object.freeze({
      stormProgress: this.progress,
      sunIntensity: Number(sunIntensity.toFixed(2)),
      fogDensity: Number(fogDensity.toFixed(4)),
      fogColorHex: isDarkened ? '#243342' : '#1a2634',
      isStormDarkened: isDarkened
    });
  }
}
