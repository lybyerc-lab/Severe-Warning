// ============================================================================
// [SW:ARCH:PHASE5_CAMERA_SYSTEM]
// Camera authority: observes elevated tactical camera transform and camera shake.
// ============================================================================

import {
  DEFAULT_CAMERA_POSITION,
  DEFAULT_CAMERA_TARGET,
  type CameraSnapshot,
  type Vector3Snapshot
} from './camera-contracts';

export class CameraSystem {
  private positionState: Vector3Snapshot = DEFAULT_CAMERA_POSITION;
  private targetState: Vector3Snapshot = DEFAULT_CAMERA_TARGET;
  private currentShake = 0;
  private fovValue = 45;
  private aspectValue = 1.777;

  updateTransform(pos: Vector3Snapshot, target: Vector3Snapshot, shake: number = 0, aspect: number = 1.777): void {
    this.positionState = Object.freeze({ ...pos });
    this.targetState = Object.freeze({ ...target });
    this.currentShake = Math.max(0, Number(shake) || 0);
    this.aspectValue = Math.max(0.1, Number(aspect) || 1.777);
  }

  addShake(amount: number): void {
    this.currentShake = Math.min(2.0, this.currentShake + Math.max(0, Number(amount) || 0));
  }

  reset(): void {
    this.positionState = DEFAULT_CAMERA_POSITION;
    this.targetState = DEFAULT_CAMERA_TARGET;
    this.currentShake = 0;
  }

  getSnapshot(): CameraSnapshot {
    return Object.freeze({
      fov: this.fovValue,
      near: 0.1,
      far: 1000,
      position: this.positionState,
      target: this.targetState,
      shakeAmount: this.currentShake,
      aspect: this.aspectValue
    });
  }
}
