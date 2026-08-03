import type { Engine, Scene } from '@babylonjs/core';
import type { VisualMetrics } from '../contracts/metrics-contract';
import type { QualityGovernor } from '../quality/quality-governor';
import type { VisualEventBus } from '../events/event-bus';
import type { BenchmarkReplay } from '../replay/benchmark-replay';

// [SW:LAB:DIAGNOSTICS]
// Measurements are evidence only and must stay clear of the mobile benchmark view.

export class DiagnosticsHud {
  private visible = true;
  private lastRender = 0;

  constructor(
    private readonly element: HTMLElement,
    private readonly engine: Engine,
    private readonly scene: Scene,
    private readonly quality: QualityGovernor,
    private readonly events: VisualEventBus,
    private readonly replay: BenchmarkReplay,
    private readonly dynamic: () => { activeDebris: number; activeAnimals: number; activeParticles: number }
  ) {}

  toggle(): boolean {
    this.visible = !this.visible;
    this.element.hidden = !this.visible;
    return this.visible;
  }

  update(nowMs: number): VisualMetrics {
    const dynamic = this.dynamic();
    const instrumentation = this.engine as unknown as { _drawCalls?: { current?: number } };
    const metrics: VisualMetrics = {
      fps: this.engine.getFps(),
      frameTimeMs: this.engine.getDeltaTime(),
      activeMeshes: this.scene.getActiveMeshes().length,
      totalVertices: this.scene.getTotalVertices(),
      totalIndices: this.scene.getActiveIndices(),
      drawCalls: instrumentation._drawCalls?.current ?? -1,
      activeMaterials: this.scene.materials.length,
      activeTextures: this.scene.textures.length,
      activeParticleSystems: dynamic.activeParticles,
      activeDebris: dynamic.activeDebris,
      activeAnimals: dynamic.activeAnimals,
      qualityTier: this.quality.current.tier,
      rendererPath: 'webgl2',
      deterministicSeed: 17017,
      replayTimeMs: this.replay.timeMs,
      eventCount: this.events.eventCount
    };
    if (this.visible && nowMs - this.lastRender > 240) {
      this.lastRender = nowMs;
      const triangles = Math.floor(metrics.totalIndices / 3);
      this.element.innerHTML = [
        `<strong>${metrics.qualityTier.toUpperCase()} · WEBGL 2</strong>`,
        `<span>FPS ${metrics.fps.toFixed(0)} · ${metrics.frameTimeMs.toFixed(1)}ms</span>`,
        `<span>MESH ${metrics.activeMeshes} · TRI ${triangles.toLocaleString()}</span>`,
        `<span>DRAW ${metrics.drawCalls < 0 ? 'N/A' : metrics.drawCalls} · MAT ${metrics.activeMaterials} · TEX ${metrics.activeTextures}</span>`,
        `<span>DUST ${metrics.activeParticleSystems} · DEBRIS ${metrics.activeDebris} · COW ${metrics.activeAnimals}</span>`,
        `<span>SEED ${metrics.deterministicSeed} · T ${(metrics.replayTimeMs / 1000).toFixed(1)} · EVT ${metrics.eventCount}</span>`
      ].join('');
    }
    return metrics;
  }
}
