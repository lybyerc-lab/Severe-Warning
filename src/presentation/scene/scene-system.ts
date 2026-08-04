// ============================================================================
// [SW:ARCH:PHASE5_SCENE_SYSTEM]
// Scene authority: observes Three.js scene hierarchy, fog, and light state.
// ============================================================================

import {
  DEFAULT_FOG_SNAPSHOT,
  DEFAULT_LIGHTS_SNAPSHOT,
  type FogStateSnapshot,
  type LightStateSnapshot,
  type SceneSnapshot
} from './scene-contracts';

export class SceneSystem {
  private childCount = 35;
  private fogState: FogStateSnapshot = DEFAULT_FOG_SNAPSHOT;
  private lightsState: LightStateSnapshot = DEFAULT_LIGHTS_SNAPSHOT;
  private backgroundHex = '#0c1520';

  updateSceneState(children: number, fog?: FogStateSnapshot, lights?: LightStateSnapshot, bgHex?: string): void {
    this.childCount = Math.max(0, Math.round(Number(children) || 0));
    if (fog) this.fogState = Object.freeze({ ...fog });
    if (lights) this.lightsState = Object.freeze({ ...lights });
    if (bgHex) this.backgroundHex = String(bgHex);
  }

  reset(): void {
    this.fogState = DEFAULT_FOG_SNAPSHOT;
    this.lightsState = DEFAULT_LIGHTS_SNAPSHOT;
    this.backgroundHex = '#0c1520';
  }

  getSnapshot(): SceneSnapshot {
    return Object.freeze({
      sceneId: 'production-scene-r128',
      childCount: this.childCount,
      fog: this.fogState,
      lights: this.lightsState,
      backgroundColor: this.backgroundHex
    });
  }
}
