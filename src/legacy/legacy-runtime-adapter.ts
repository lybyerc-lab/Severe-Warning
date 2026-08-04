// ============================================================================
// [SW:ARCH:LEGACY_ADAPTER]
// The only Phase 1 module allowed to know legacy global names.
// ============================================================================

import type {
  QaScenarioId,
  QaSnapshot,
  SevereWeatherQaBridge,
} from '../qa/bridge/severe-weather-qa-bridge';

interface LegacyRuntimeGlobals {
  __SW_PRODUCTION_SLICE_READY__?: boolean;
  __SW_V510_UPDATE__?: (deltaSeconds: number, nowMs: number, isMoving: boolean) => void;
  __SW_V510_REBUILD__?: () => void;
  triggerProductionSliceQa?: (mode?: string) => boolean;
  getProductionSliceQaState?: () => QaSnapshot;
}

export interface LegacyRuntimeStatus {
  readonly ready: boolean;
  readonly hasUpdate: boolean;
  readonly hasRebuild: boolean;
  readonly hasQaTrigger: boolean;
  readonly hasQaSnapshot: boolean;
}

export class LegacyRuntimeAdapter implements SevereWeatherQaBridge {
  readonly #globals: LegacyRuntimeGlobals;

  constructor(globals: LegacyRuntimeGlobals = globalThis as LegacyRuntimeGlobals) {
    this.#globals = globals;
  }

  getStatus(): LegacyRuntimeStatus {
    return Object.freeze({
      ready: this.#globals.__SW_PRODUCTION_SLICE_READY__ === true,
      hasUpdate: typeof this.#globals.__SW_V510_UPDATE__ === 'function',
      hasRebuild: typeof this.#globals.__SW_V510_REBUILD__ === 'function',
      hasQaTrigger: typeof this.#globals.triggerProductionSliceQa === 'function',
      hasQaSnapshot: typeof this.#globals.getProductionSliceQaState === 'function',
    });
  }

  async waitUntilReady(timeoutMs = 15_000): Promise<void> {
    const startedAt = performance.now();
    while (!this.getStatus().ready) {
      if (performance.now() - startedAt >= timeoutMs) {
        throw new Error(`Legacy Three.js runtime did not become ready within ${timeoutMs}ms.`);
      }
      await new Promise<void>((resolve) => window.setTimeout(resolve, 25));
    }
    this.assertRequiredContracts();
  }

  async prepareScenario(id: QaScenarioId): Promise<void> {
    this.assertRequiredContracts();
    if (id !== 'production-hero') {
      throw new Error(`Unsupported QA scenario: ${id}`);
    }
    const prepared = this.#globals.triggerProductionSliceQa?.('hero');
    if (prepared !== true) {
      throw new Error('Legacy production hero scenario did not initialize.');
    }
  }

  advance(milliseconds: number): void {
    this.assertRequiredContracts();
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
      throw new Error(`QA advance requires a non-negative finite duration, received ${milliseconds}.`);
    }
    const now = performance.now();
    this.#globals.__SW_V510_UPDATE__?.(milliseconds / 1000, now, false);
  }

  getSnapshot(): QaSnapshot {
    this.assertRequiredContracts();
    const snapshot = this.#globals.getProductionSliceQaState?.();
    if (!snapshot) {
      throw new Error('Legacy runtime returned no QA snapshot.');
    }
    return Object.freeze({ ...snapshot });
  }

  reset(): void {
    this.assertRequiredContracts();
    this.#globals.__SW_V510_REBUILD__?.();
  }

  private assertRequiredContracts(): void {
    const status = this.getStatus();
    const missing = Object.entries(status)
      .filter(([, present]) => present !== true)
      .map(([name]) => name);
    if (missing.length > 0) {
      throw new Error(`Legacy runtime contract is incomplete: ${missing.join(', ')}`);
    }
  }
}
