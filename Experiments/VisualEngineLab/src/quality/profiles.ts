import type { QualityProfile, QualityTier } from '../contracts/quality-profile';

export const QUALITY_PROFILES: Readonly<Record<QualityTier, QualityProfile>> = {
  low: {
    tier: 'low', renderScale: 0.72, shadows: false, shadowResolution: 512, shadowCasters: 0,
    particleBudget: 32, debrisBudget: 8, vegetationDensity: 0.45, animalLod: 0,
    animationDistance: 80, highlightCoverage: 'none', atmosphereLayers: 1, textureTier: 0,
    postProcessing: false
  },
  balanced: {
    tier: 'balanced', renderScale: 0.88, shadows: true, shadowResolution: 1024, shadowCasters: 10,
    particleBudget: 72, debrisBudget: 14, vegetationDensity: 0.7, animalLod: 1,
    animationDistance: 120, highlightCoverage: 'critical', atmosphereLayers: 2, textureTier: 1,
    postProcessing: false
  },
  high: {
    tier: 'high', renderScale: 1, shadows: true, shadowResolution: 2048, shadowCasters: 20,
    particleBudget: 120, debrisBudget: 22, vegetationDensity: 1, animalLod: 2,
    animationDistance: 170, highlightCoverage: 'selective', atmosphereLayers: 3, textureTier: 2,
    postProcessing: true
  },
  showcase: {
    tier: 'showcase', renderScale: 1.15, shadows: true, shadowResolution: 2048, shadowCasters: 32,
    particleBudget: 180, debrisBudget: 30, vegetationDensity: 1.2, animalLod: 3,
    animationDistance: 220, highlightCoverage: 'broad', atmosphereLayers: 4, textureTier: 3,
    postProcessing: true
  }
};
