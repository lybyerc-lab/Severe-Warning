// ============================================================================
// [SW:ARCH:PHASE5_CAMERA_CONTRACTS]
// Typed contracts for elevated tactical perspective camera and shake state.
// ============================================================================

export interface Vector3Snapshot {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface CameraSnapshot {
  readonly fov: number;
  readonly near: number;
  readonly far: number;
  readonly position: Vector3Snapshot;
  readonly target: Vector3Snapshot;
  readonly shakeAmount: number;
  readonly aspect: number;
}

export const DEFAULT_CAMERA_POSITION: Vector3Snapshot = Object.freeze({ x: 0, y: 48, z: 64 });
export const DEFAULT_CAMERA_TARGET: Vector3Snapshot = Object.freeze({ x: 0, y: 0, z: 0 });
