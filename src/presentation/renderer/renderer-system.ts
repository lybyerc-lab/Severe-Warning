// ============================================================================
// [SW:ARCH:PHASE5_RENDERER_SYSTEM]
// Passive mirror of the live legacy WebGLRenderer. It never creates or drives
// a renderer and owns no presentation behavior.
// ============================================================================

import type { RendererSnapshot } from './renderer-contracts.ts';

export class RendererSystem {
  private snapshot: RendererSnapshot | null = null;

  synchronize(snapshot: RendererSnapshot): void {
    this.snapshot = Object.freeze({
      ...snapshot,
      memory: Object.freeze({ ...snapshot.memory }),
      frame: Object.freeze({ ...snapshot.frame }),
    });
  }

  reset(): void {
    // The accepted legacy renderer owns reset and disposal. The bridge will
    // synchronize this mirror after the legacy rebuild completes.
  }

  getSnapshot(): RendererSnapshot {
    if (!this.snapshot) throw new Error('RendererSystem has not synchronized with the live renderer.');
    return this.snapshot;
  }
}
