// ============================================================================
// [SW:ARCH:PHASE5_TORNADO_PRESENTATION_SYSTEM]
// Passive mirror of the live production tornado presentation.
// ============================================================================

import type { TornadoPresentationSnapshot } from './tornado-presentation-contracts';

export class TornadoPresentationSystem {
  private snapshot: TornadoPresentationSnapshot | null = null;

  synchronize(snapshot: TornadoPresentationSnapshot): void {
    this.snapshot = Object.freeze({ ...snapshot });
  }

  reset(): void {
    // The accepted legacy tornado layer owns rebuild and cleanup.
  }

  getSnapshot(): TornadoPresentationSnapshot {
    if (!this.snapshot) throw new Error('TornadoPresentationSystem has not synchronized with the live tornado.');
    return this.snapshot;
  }
}
