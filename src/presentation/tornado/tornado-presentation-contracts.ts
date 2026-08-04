// ============================================================================
// [SW:ARCH:PHASE5_TORNADO_PRESENTATION_CONTRACTS]
// Typed contracts for multi-volume funnel cylinders, suction rings, and debris.
// ============================================================================

export interface TornadoPresentationSnapshot {
  readonly funnelLayerCount: number;
  readonly suctionRingCount: number;
  readonly activeDebrisCount: number;
  readonly groundDustActive: boolean;
  readonly isMultiVolumeHero: boolean;
}
