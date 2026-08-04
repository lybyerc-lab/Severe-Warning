// ============================================================================
// [SW:QA:FORMAL_BRIDGE]
// Stable QA surface. Legacy globals are contained in one adapter boundary.
// ============================================================================

export type QaScenarioId = 'production-hero';

export interface QaSnapshot {
  readonly marker: string;
  readonly renderer: string;
  readonly quality: string;
  readonly frameSampleCount: number;
  readonly productionMeasuredFps: number | null;
  readonly campaignId: string;
  readonly [key: string]: unknown;
}

export interface SevereWeatherQaBridge {
  prepareScenario(id: QaScenarioId): Promise<void>;
  advance(milliseconds: number): void;
  getSnapshot(): QaSnapshot;
  reset(): void;
}
