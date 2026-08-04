// ============================================================================
// [SW:ARCH:PHASE5_RENDERER_CONTRACTS]
// Typed contracts for WebGL renderer options, canvas bounds, and pixel ratio.
// ============================================================================

export interface RendererSnapshot {
  readonly rendererName: 'Three.js WebGLRenderer';
  readonly version: 'r128';
  readonly antialias: boolean;
  readonly shadowMapEnabled: boolean;
  readonly shadowMapType: 'PCFSoftShadowMap';
  readonly toneMapping: 'ACESFilmicToneMapping';
  readonly exposure: number;
  readonly pixelRatio: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly renderCallsCount: number;
}

export interface RendererConfig {
  readonly antialias: boolean;
  readonly alpha: boolean;
  readonly shadowMapEnabled: boolean;
  readonly maxPixelRatio: number;
}

export const DEFAULT_RENDERER_CONFIG: RendererConfig = Object.freeze({
  antialias: true,
  alpha: false,
  shadowMapEnabled: true,
  maxPixelRatio: 2.0
});
