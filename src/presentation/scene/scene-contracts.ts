// ============================================================================
// [SW:ARCH:PHASE5_SCENE_CONTRACTS]
// Read-only contracts captured from the live Three.js scene.
// ============================================================================

export interface FogStateSnapshot {
  readonly type: 'FogExp2' | 'none' | 'unknown';
  readonly color: string | null;
  readonly density: number | null;
}

export interface SceneLightSnapshot {
  readonly type: string;
  readonly color: string;
  readonly intensity: number;
  readonly groundColor?: string;
}

export interface SceneSnapshot {
  readonly sceneId: string;
  readonly childCount: number;
  readonly meshCount: number;
  readonly uniqueMaterialCount: number;
  readonly fog: FogStateSnapshot;
  readonly lights: readonly SceneLightSnapshot[];
  readonly backgroundColor: string | null;
}
