// ============================================================================
// [SW:ARCH:PHASE5_RENDERER_SYSTEM]
// Renderer authority: observes legacy WebGLRenderer settings and viewport bounds.
// ============================================================================

import { DEFAULT_RENDERER_CONFIG, type RendererConfig, type RendererSnapshot } from './renderer-contracts';

export class RendererSystem {
  private renderCalls = 0;
  private width = 1365;
  private height = 768;
  private currentPixelRatio = 1.0;

  constructor(private readonly config: RendererConfig = DEFAULT_RENDERER_CONFIG) {}

  updateViewport(width: number, height: number, pixelRatio: number = 1.0): void {
    this.width = Math.max(1, Math.round(Number(width) || 1365));
    this.height = Math.max(1, Math.round(Number(height) || 768));
    this.currentPixelRatio = Math.min(this.config.maxPixelRatio, Math.max(1.0, Number(pixelRatio) || 1.0));
  }

  recordRenderCall(): void {
    this.renderCalls += 1;
  }

  reset(): void {
    this.renderCalls = 0;
  }

  getSnapshot(): RendererSnapshot {
    return Object.freeze({
      rendererName: 'Three.js WebGLRenderer',
      version: 'r128',
      antialias: this.config.antialias,
      shadowMapEnabled: this.config.shadowMapEnabled,
      shadowMapType: 'PCFSoftShadowMap',
      toneMapping: 'ACESFilmicToneMapping',
      exposure: 1.0,
      pixelRatio: this.currentPixelRatio,
      viewportWidth: this.width,
      viewportHeight: this.height,
      renderCallsCount: this.renderCalls
    });
  }
}
