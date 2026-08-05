// ============================================================================
// [SW:ARCH:PHASE5_CAMERA_CONTRACTS]
// Read-only contracts captured from the live tactical camera.
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
  readonly aspect: number;
  readonly position: Vector3Snapshot;
  readonly forward: Vector3Snapshot;
  readonly shakeAmount: number;
}
