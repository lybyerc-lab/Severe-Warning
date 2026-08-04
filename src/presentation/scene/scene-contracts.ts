// ============================================================================
// [SW:ARCH:PHASE5_SCENE_CONTRACTS]
// Typed contracts for Three.js Scene hierarchy, fog, lights, and background.
// ============================================================================

export interface LightStateSnapshot {
  readonly directionalColor: string;
  readonly directionalIntensity: number;
  readonly ambientColor: string;
  readonly ambientIntensity: number;
  readonly rimColor: string;
  readonly rimIntensity: number;
}

export interface FogStateSnapshot {
  readonly color: string;
  readonly density: number;
}

export interface SceneSnapshot {
  readonly sceneId: string;
  readonly childCount: number;
  readonly fog: FogStateSnapshot;
  readonly lights: LightStateSnapshot;
  readonly backgroundColor: string;
}

export const DEFAULT_FOG_SNAPSHOT: FogStateSnapshot = Object.freeze({
  color: '#1a2634',
  density: 0.0075
});

export const DEFAULT_LIGHTS_SNAPSHOT: LightStateSnapshot = Object.freeze({
  directionalColor: '#ffea9f',
  directionalIntensity: 1.75,
  ambientColor: '#2a3b4c',
  ambientIntensity: 0.6,
  rimColor: '#8ab4f8',
  rimIntensity: 0.4
});
