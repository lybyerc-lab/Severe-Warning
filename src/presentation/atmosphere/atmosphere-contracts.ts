// ============================================================================
// [SW:ARCH:PHASE5_ATMOSPHERE_CONTRACTS]
// Typed contracts for storm lighting transitions and weather atmosphere.
// ============================================================================

export interface AtmosphereSnapshot {
  readonly stormProgress: number; // 0.0 to 1.0
  readonly sunIntensity: number;
  readonly fogDensity: number;
  readonly fogColorHex: string;
  readonly isStormDarkened: boolean;
}
