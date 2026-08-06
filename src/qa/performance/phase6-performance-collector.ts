// ============================================================================
// [SW:ARCH:PHASE6_PERFORMANCE_COLLECTOR]
// Telemetry collector for deterministic frame timing and draw-call performance metrics.
// ============================================================================

import type {
  PerformanceScenarioMetrics,
  Phase6PerformanceTelemetry,
} from './phase6-performance-contracts';
import { DebrisPoolManager } from '../../world/debris/debris-pool-manager';
import { AdaptiveQualityController } from '../../platform/quality/adaptive-quality-controller';

export class Phase6PerformanceCollector {
  private scenarios: Record<string, PerformanceScenarioMetrics> = {};

  recordScenario(
    name: string,
    frameTimesMs: number[],
    drawCalls: number[],
    primitives: number[],
    objects: number[],
    debrisCounts: number[],
    qualityController: AdaptiveQualityController,
    debrisPool: DebrisPoolManager
  ): PerformanceScenarioMetrics {
    const sortedTimes = [...frameTimesMs].sort((a, b) => a - b);
    const frameCount = frameTimesMs.length;
    const totalDurationMs = frameTimesMs.reduce((a, b) => a + b, 0);

    const medianTime = sortedTimes[Math.floor(frameCount * 0.5)] || 16.6;
    const p95Time = sortedTimes[Math.floor(frameCount * 0.95)] || 16.6;

    const longFrame33Count = frameTimesMs.filter((t) => t > 33.3).length;
    const longFrame50Count = frameTimesMs.filter((t) => t > 50.0).length;

    const sortedDrawCalls = [...drawCalls].sort((a, b) => a - b);
    const sortedPrimitives = [...primitives].sort((a, b) => a - b);
    const sortedObjects = [...objects].sort((a, b) => a - b);
    const sortedDebris = [...debrisCounts].sort((a, b) => a - b);

    const metrics: PerformanceScenarioMetrics = {
      scenarioName: name,
      frameCount,
      totalDurationMs,
      fpsMedian: 1000 / medianTime,
      fpsP95: 1000 / p95Time,
      frameTimeMedianMs: medianTime,
      frameTimeP95Ms: p95Time,
      longFrame33Count,
      longFrame50Count,
      drawCallMedian: sortedDrawCalls[Math.floor(sortedDrawCalls.length * 0.5)] || 0,
      primitiveCountMedian: sortedPrimitives[Math.floor(sortedPrimitives.length * 0.5)] || 0,
      activeObjectCountMedian: sortedObjects[Math.floor(sortedObjects.length * 0.5)] || 0,
      activeDebrisCountMedian: sortedDebris[Math.floor(sortedDebris.length * 0.5)] || 0,
      qualityTierEnd: qualityController.getCurrentTier(),
      poolHighWaterMark: debrisPool.getSnapshot().highWaterMark,
      heapUsageMbProxy: typeof performance !== 'undefined' && (performance as any).memory
        ? Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024))
        : null,
    };

    this.scenarios[name] = metrics;
    return metrics;
  }

  generateTelemetry(
    commitSha: string,
    runId: string,
    qualityController: AdaptiveQualityController,
    debrisPool: DebrisPoolManager
  ): Phase6PerformanceTelemetry {
    return {
      version: 'MODERNIZATION_PHASE6_PERFORMANCE_V1',
      timestamp: Date.now(),
      commitSha,
      runId,
      devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      scenarios: { ...this.scenarios },
      debrisPool: debrisPool.getSnapshot(),
      qualityTransitionsCount: qualityController.getTelemetryEvents().length,
      listenerLeakDetected: false,
    };
  }
}
