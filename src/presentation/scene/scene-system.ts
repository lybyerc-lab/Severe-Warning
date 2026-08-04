// ============================================================================
// [SW:ARCH:PHASE5_SCENE_SYSTEM]
// Passive mirror of the live legacy Three.js scene.
// ============================================================================

import type { SceneSnapshot } from './scene-contracts';

export class SceneSystem {
  private snapshot: SceneSnapshot | null = null;

  synchronize(snapshot: SceneSnapshot): void {
    this.snapshot = Object.freeze({
      ...snapshot,
      fog: Object.freeze({ ...snapshot.fog }),
      lights: Object.freeze(snapshot.lights.map((light) => Object.freeze({ ...light }))),
    });
  }

  reset(): void {
    // The accepted legacy scene owns reset and disposal.
  }

  getSnapshot(): SceneSnapshot {
    if (!this.snapshot) throw new Error('SceneSystem has not synchronized with the live scene.');
    return this.snapshot;
  }
}
