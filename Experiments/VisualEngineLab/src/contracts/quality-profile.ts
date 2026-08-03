export const QUALITY_TIERS = ['low', 'balanced', 'high', 'showcase'] as const;
export type QualityTier = (typeof QUALITY_TIERS)[number];

export interface QualityProfile {
  readonly tier: QualityTier;
  readonly renderScale: number;
  readonly shadows: boolean;
  readonly shadowResolution: number;
  readonly shadowCasters: number;
  readonly particleBudget: number;
  readonly debrisBudget: number;
  readonly vegetationDensity: number;
  readonly animalLod: 0 | 1 | 2 | 3;
  readonly animationDistance: number;
  readonly highlightCoverage: 'none' | 'critical' | 'selective' | 'broad';
  readonly atmosphereLayers: number;
  readonly textureTier: 0 | 1 | 2 | 3;
  readonly postProcessing: boolean;
}
