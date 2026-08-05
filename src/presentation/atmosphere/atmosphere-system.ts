// ============================================================================
// [SW:ARCH:PHASE5_ATMOSPHERE_SYSTEM]
// Passive mirror of live fog, exposure, and storm-light state.
// ============================================================================

import type { AtmosphereSnapshot } from './atmosphere-contracts';

export class AtmosphereSystem {
  private snapshot: AtmosphereSnapshot | null = null;

  synchronize(snapshot: AtmosphereSnapshot): void {
    this.snapshot = Object.freeze({ ...snapshot });
  }

  reset(): void {
    // The accepted legacy atmosphere owns all transitions and effects.
  }

  getSnapshot(): AtmosphereSnapshot {
    if (!this.snapshot) throw new Error('AtmosphereSystem has not synchronized with the live atmosphere.');
    return this.snapshot;
  }
}
