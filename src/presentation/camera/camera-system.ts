// ============================================================================
// [SW:ARCH:PHASE5_CAMERA_SYSTEM]
// Passive mirror of the live tactical camera.
// ============================================================================

import type { CameraSnapshot } from './camera-contracts.ts';

export class CameraSystem {
  private snapshot: CameraSnapshot | null = null;

  synchronize(snapshot: CameraSnapshot): void {
    this.snapshot = Object.freeze({
      ...snapshot,
      position: Object.freeze({ ...snapshot.position }),
      forward: Object.freeze({ ...snapshot.forward }),
    });
  }

  reset(): void {
    // The accepted legacy camera owns movement, framing, and shake.
  }

  getSnapshot(): CameraSnapshot {
    if (!this.snapshot) throw new Error('CameraSystem has not synchronized with the live camera.');
    return this.snapshot;
  }
}
