// ============================================================================
// [SW:ARCH:PHASE6_DEBRIS_POOL_CONTRACTS]
// Contracts for pre-allocated, bounded debris and transient VFX pooling.
// ============================================================================

export interface PooledDebrisItem {
  id: number;
  active: boolean;
  colorHex: string;
  size: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotX: number;
  rotY: number;
  life: number;
  bounced: boolean;
}

export interface DebrisPoolSnapshot {
  poolCapacity: number;
  activeCount: number;
  recycledCount: number;
  highWaterMark: number;
  activeColorDistribution: Record<string, number>;
}
