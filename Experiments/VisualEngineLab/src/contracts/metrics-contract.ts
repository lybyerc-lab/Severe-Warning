import type { QualityTier } from './quality-profile';

export interface VisualMetrics {
  fps: number;
  frameTimeMs: number;
  activeMeshes: number;
  totalVertices: number;
  totalIndices: number;
  drawCalls: number;
  activeMaterials: number;
  activeTextures: number;
  activeParticleSystems: number;
  activeDebris: number;
  activeAnimals: number;
  qualityTier: QualityTier;
  rendererPath: 'webgl2' | 'webgpu';
  deterministicSeed: number;
  replayTimeMs: number;
  eventCount: number;
}

export interface BenchmarkResult {
  readonly schemaVersion: string;
  readonly completed: boolean;
  readonly accelerated: boolean;
  readonly eventCount: number;
  readonly stateTransitions: readonly string[];
  readonly peakDebris: number;
  readonly peakParticles: number;
  readonly peakActiveMeshes: number;
  readonly peakMaterialCount: number;
  readonly consoleErrors: readonly string[];
  readonly unhandledRejections: readonly string[];
  readonly barnState: string;
  readonly cowState: string;
  readonly resetPassed: boolean;
}
