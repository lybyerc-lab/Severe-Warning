// ============================================================================
// [SW:ARCH:PHASE6_ADAPTIVE_QUALITY_CONTROLLER]
// Typed adaptive quality controller with explicit hysteresis. It never alters
// gameplay laws, damage calculations, scoring, physics, or Cow 17 safety.
// ============================================================================

import type {
  QualitySettings,
  QualityTelemetryEvent,
  QualityTier,
} from './adaptive-quality-contracts';
import { TIER_PRESETS } from './adaptive-quality-contracts';

export class AdaptiveQualityController {
  private currentTier: QualityTier = 'HIGH';
  private frameTimes: number[] = [];
  private frameCount = 0;
  private lastTierChangeTime = 0;
  private telemetryEvents: QualityTelemetryEvent[] = [];

  // Hysteresis constants
  private readonly SAMPLE_WINDOW_SIZE = 180; // 3 seconds at 60 FPS
  private readonly MIN_TIER_HOLD_MS = 5000;   // 5 seconds hysteresis hold
  private readonly DOWNSCALE_AVG_TIME_MS = 33.3; // <30 FPS triggers drop
  private readonly UPSCALE_AVG_TIME_MS = 18.0;   // >55 FPS triggers increase

  constructor(initialTier: QualityTier = 'HIGH') {
    this.currentTier = initialTier;
    this.lastTierChangeTime = Date.now();
  }

  getCurrentSettings(): Readonly<QualitySettings> {
    return Object.freeze({ ...TIER_PRESETS[this.currentTier] });
  }

  getCurrentTier(): QualityTier {
    return this.currentTier;
  }

  getTelemetryEvents(): ReadonlyArray<QualityTelemetryEvent> {
    return Object.freeze([...this.telemetryEvents]);
  }

  recordFrame(frameTimeMs: number): void {
    this.frameCount += 1;
    this.frameTimes.push(frameTimeMs);
    if (this.frameTimes.length > this.SAMPLE_WINDOW_SIZE) {
      this.frameTimes.shift();
    }

    if (this.frameTimes.length >= 60) {
      this.evaluateQualityTiers();
    }
  }

  forceTier(newTier: QualityTier, reason = 'explicit override'): void {
    if (this.currentTier !== newTier) {
      this.transitionToTier(newTier, reason);
    }
  }

  reset(): void {
    this.frameTimes = [];
    this.frameCount = 0;
    this.lastTierChangeTime = Date.now();
    this.telemetryEvents = [];
    this.currentTier = 'HIGH';
  }

  private evaluateQualityTiers(): void {
    const now = Date.now();
    if (now - this.lastTierChangeTime < this.MIN_TIER_HOLD_MS) {
      return; // Hysteresis hold active
    }

    const totalMs = this.frameTimes.reduce((sum, val) => sum + val, 0);
    const avgFrameTime = totalMs / this.frameTimes.length;
    const currentFps = 1000 / (avgFrameTime || 16.6);

    const tiers: QualityTier[] = ['ECO', 'PERFORMANCE', 'BALANCED', 'HIGH', 'ULTRA'];
    const currentIndex = tiers.indexOf(this.currentTier);

    if (avgFrameTime > this.DOWNSCALE_AVG_TIME_MS && currentIndex > 0) {
      const nextTier = tiers[currentIndex - 1];
      if (nextTier) {
        this.transitionToTier(
          nextTier,
          `Performance pressure: avg frame time ${avgFrameTime.toFixed(1)}ms (${currentFps.toFixed(1)} FPS)`
        );
      }
    } else if (avgFrameTime < this.UPSCALE_AVG_TIME_MS && currentIndex < tiers.length - 1) {
      const nextTier = tiers[currentIndex + 1];
      if (nextTier) {
        this.transitionToTier(
          nextTier,
          `Performance headroom: avg frame time ${avgFrameTime.toFixed(1)}ms (${currentFps.toFixed(1)} FPS)`
        );
      }
    }
  }

  private transitionToTier(nextTier: QualityTier, reason: string): void {
    const fromTier = this.currentTier;
    this.currentTier = nextTier;
    this.lastTierChangeTime = Date.now();
    const totalMs = this.frameTimes.reduce((sum, val) => sum + val, 0);
    const avgFrameTime = this.frameTimes.length > 0 ? totalMs / this.frameTimes.length : 16.6;

    const event: QualityTelemetryEvent = {
      timestamp: Date.now(),
      frameIndex: this.frameCount,
      fromTier,
      toTier: nextTier,
      fps: 1000 / (avgFrameTime || 16.6),
      avgFrameTimeMs: avgFrameTime,
      reason,
    };
    this.telemetryEvents.push(event);
    console.log(`[SW:QUALITY] Tier transition: ${fromTier} -> ${nextTier} :: ${reason}`);
  }
}
