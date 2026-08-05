// ============================================================================
// [SW:ARCH:PHASE5_TORNADO_PRESENTATION_CONTRACTS]
// Read-only contracts captured from the live production tornado layer.
// ============================================================================

export interface TornadoPresentationSnapshot {
  readonly quality: string;
  readonly rootPresent: boolean;
  readonly funnelLayerCount: number;
  readonly vaporRibbonCount: number;
  readonly suctionRingCount: number;
  readonly activeDebrisCount: number;
  readonly dustPuffCount: number;
  readonly detachedFragmentCount: number;
  readonly stormLightPresent: boolean;
  readonly isMultiVolumeHero: boolean;
}
