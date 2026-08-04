// ============================================================================
// [SW:ARCH:PHASE5_RENDERER_CONTRACTS]
// Read-only contracts captured from the live Three.js r128 renderer.
// ============================================================================

export interface RendererMemorySnapshot {
  readonly geometries: number;
  readonly textures: number;
}

export interface RendererFrameSnapshot {
  readonly calls: number;
  readonly triangles: number;
  readonly points: number;
  readonly lines: number;
}

export interface RendererSnapshot {
  readonly rendererName: 'Three.js WebGLRenderer';
  readonly version: 'r128';
  readonly antialias: boolean | null;
  readonly shadowMapEnabled: boolean;
  readonly shadowMapType: 'PCFSoftShadowMap' | 'unknown';
  readonly toneMapping: 'ACESFilmicToneMapping' | 'unknown';
  readonly exposure: number;
  readonly outputEncoding: 'sRGBEncoding' | 'unknown';
  readonly pixelRatio: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly memory: RendererMemorySnapshot;
  readonly frame: RendererFrameSnapshot;
}
