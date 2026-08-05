// ============================================================================
// [SW:ARCH:PHASE6_ADAPTIVE_QUALITY_CONTRACTS]
// Contracts for small, typed adaptive quality controller with explicit tiers and hysteresis.
// ============================================================================

export type QualityTier = 'ULTRA' | 'HIGH' | 'BALANCED' | 'PERFORMANCE' | 'ECO';

export interface QualitySettings {
  tier: QualityTier;
  pixelRatioScale: number;
  shadowsEnabled: boolean;
  shadowMapSize: number;
  maxActiveDebris: number;
  particleDensityRatio: number;
  cosmeticUpdateIntervalMs: number;
  description: string;
}

export interface QualityTelemetryEvent {
  timestamp: number;
  frameIndex: number;
  fromTier: QualityTier;
  toTier: QualityTier;
  fps: number;
  avgFrameTimeMs: number;
  reason: string;
}

export const TIER_PRESETS: Record<QualityTier, QualitySettings> = {
  ULTRA: {
    tier: 'ULTRA',
    pixelRatioScale: 1.5,
    shadowsEnabled: true,
    shadowMapSize: 2048,
    maxActiveDebris: 48,
    particleDensityRatio: 1.0,
    cosmeticUpdateIntervalMs: 0,
    description: 'Full resolution, 2K shadows, 100% particles & debris',
  },
  HIGH: {
    tier: 'HIGH',
    pixelRatioScale: 1.25,
    shadowsEnabled: true,
    shadowMapSize: 1024,
    maxActiveDebris: 36,
    particleDensityRatio: 0.85,
    cosmeticUpdateIntervalMs: 0,
    description: '1.25x scaling, 1K shadows, 85% particles',
  },
  BALANCED: {
    tier: 'BALANCED',
    pixelRatioScale: 1.0,
    shadowsEnabled: true,
    shadowMapSize: 512,
    maxActiveDebris: 24,
    particleDensityRatio: 0.70,
    cosmeticUpdateIntervalMs: 16,
    description: 'Native 1.0x resolution, 512px shadows, 70% particles',
  },
  PERFORMANCE: {
    tier: 'PERFORMANCE',
    pixelRatioScale: 0.9,
    shadowsEnabled: false,
    shadowMapSize: 256,
    maxActiveDebris: 16,
    particleDensityRatio: 0.50,
    cosmeticUpdateIntervalMs: 33,
    description: '0.9x scaling, disabled shadows, 50% particles',
  },
  ECO: {
    tier: 'ECO',
    pixelRatioScale: 0.75,
    shadowsEnabled: false,
    shadowMapSize: 256,
    maxActiveDebris: 10,
    particleDensityRatio: 0.35,
    cosmeticUpdateIntervalMs: 50,
    description: '0.75x scaling, disabled shadows, 35% particles for thermal protection',
  },
};
