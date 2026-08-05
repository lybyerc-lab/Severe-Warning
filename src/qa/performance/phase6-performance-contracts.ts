// ============================================================================
// [SW:ARCH:PHASE6_PERFORMANCE_CONTRACTS]
// Machine-readable contracts and interfaces for Phase 6 Android performance telemetry.
// ============================================================================

import { QualityTier } from '../../platform/quality/adaptive-quality-contracts';
import { DebrisPoolSnapshot } from '../../world/debris/debris-pool-contracts';

export interface PerformanceScenarioMetrics {
  scenarioName: string;
  frameCount: number;
  totalDurationMs: number;
  fpsMedian: number;
  fpsP95: number;
  frameTimeMedianMs: number;
  frameTimeP95Ms: number;
  longFrame33Count: number; // Frames > 33.3ms (<30 FPS)
  longFrame50Count: number; // Frames > 50.0ms (<20 FPS)
  drawCallMedian: number;
  primitiveCountMedian: number;
  activeObjectCountMedian: number;
  activeDebrisCountMedian: number;
  qualityTierEnd: QualityTier;
  poolHighWaterMark: number;
  heapUsageMbProxy: number | null;
}

export interface Phase6PerformanceTelemetry {
  version: string;
  timestamp: number;
  commitSha: string;
  runId: string;
  devicePixelRatio: number;
  scenarios: Record<string, PerformanceScenarioMetrics>;
  debrisPool: DebrisPoolSnapshot;
  qualityTransitionsCount: number;
  listenerLeakDetected: boolean;
}
