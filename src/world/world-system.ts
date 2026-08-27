// ============================================================================
// [SW:ARCH:PHASE5_WORLD_SYSTEM]
// Passive mirror of live world population and production dressing.
// ============================================================================

import type { WorldPopulationSnapshot } from './world-contracts.ts';

export class WorldSystem {
  private snapshot: WorldPopulationSnapshot | null = null;

  synchronize(snapshot: WorldPopulationSnapshot): void {
    this.snapshot = Object.freeze({
      ...snapshot,
      cow17: Object.freeze({ ...snapshot.cow17 }),
    });
  }

  reset(): void {
    // The accepted legacy world owns rebuild and cleanup.
  }

  getSnapshot(): WorldPopulationSnapshot {
    if (!this.snapshot) throw new Error('WorldSystem has not synchronized with the live world.');
    return this.snapshot;
  }
}
