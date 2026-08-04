// ============================================================================
// [SW:ARCH:PHASE5_ATMOSPHERE_CONTRACTS]
// Read-only contracts captured from live fog, exposure, and storm lighting.
// ============================================================================

export interface AtmosphereSnapshot {
  readonly fogColorHex: string | null;
  readonly fogDensity: number | null;
  readonly exposure: number;
  readonly ambientIntensity: number;
  readonly hemisphereIntensity: number;
  readonly directionalIntensity: number;
  readonly stormLightPresent: boolean;
  readonly stormLightIntensity: number;
  readonly flashTimer: number;
}
