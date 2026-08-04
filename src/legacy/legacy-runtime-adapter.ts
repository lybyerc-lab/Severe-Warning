// ============================================================================
// [SW:ARCH:LEGACY_ADAPTER]
// The only modern module allowed to know legacy global names.
// ============================================================================

import type { AbilitySnapshot, AbilitySystem } from '../abilities/ability-system';
import type { GameClocks, ClockSnapshot, LegacyClockSampleInput, LegacyClockSample } from '../core/clocks';
import type { InputSnapshot, InputSystem, MovementVector } from '../input/input-system';
import type {
  QaScenarioId,
  QaSnapshot,
  SevereWeatherQaBridge,
} from '../qa/bridge/severe-weather-qa-bridge';

interface LegacyRunState {
  readonly runActive: boolean;
  readonly paused: boolean;
  readonly remainingSeconds: number;
  readonly stage: number;
  readonly gameStarted: boolean;
}

interface LegacyClockBridgeSnapshot {
  readonly version: string;
  readonly attached: boolean;
  readonly latestSample: LegacyClockSample;
  readonly authority: ClockSnapshot | null;
  readonly legacy: LegacyRunState;
}

interface LegacyClockBridge {
  readonly version: string;
  attach(authority: GameClocks): boolean;
  sample(input: LegacyClockSampleInput): LegacyClockSample;
  reset(durationSeconds: number, nowMs?: number): void;
  resume(nowMs?: number): void;
  getLegacyRunState(): LegacyRunState;
  getSnapshot(): LegacyClockBridgeSnapshot;
}

export interface LegacyInputAbilityBridgeSnapshot {
  readonly version: string;
  readonly attached: boolean;
  readonly movement: MovementVector;
  readonly input: InputSnapshot | null;
  readonly abilities: AbilitySnapshot | null;
  readonly abilityRequests: number;
  readonly suppressedDuplicates: number;
  readonly legacy: Readonly<{
    joystickActive: boolean;
    joystickX: number;
    joystickZ: number;
  }>;
}

interface LegacyInputAbilityBridge {
  readonly version: string;
  attach(inputAuthority: InputSystem, abilityAuthority: AbilitySystem): boolean;
  getMovement(): MovementVector;
  getSnapshot(): LegacyInputAbilityBridgeSnapshot;
  reset(): void;
}

interface LegacyRuntimeGlobals {
  __SW_PRODUCTION_SLICE_READY__?: boolean;
  __SW_V510_UPDATE__?: (deltaSeconds: number, nowMs: number, isMoving: boolean) => void;
  __SW_V510_REBUILD__?: () => void;
  __SW_PHASE2_CLOCK_BRIDGE__?: LegacyClockBridge;
  __SW_PHASE3_INPUT_ABILITY_BRIDGE__?: LegacyInputAbilityBridge;
  triggerProductionSliceQa?: (mode?: string) => boolean;
  getProductionSliceQaState?: () => QaSnapshot;
}

export interface LegacyRuntimeStatus {
  readonly ready: boolean;
  readonly hasUpdate: boolean;
  readonly hasRebuild: boolean;
  readonly hasQaTrigger: boolean;
  readonly hasQaSnapshot: boolean;
  readonly hasClockBridge: boolean;
  readonly hasInputAbilityBridge: boolean;
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
      hasClockBridge: this.#globals.__SW_PHASE2_CLOCK_BRIDGE__?.version === 'MODERNIZATION_PHASE2_CLOCKS_V1',
      hasInputAbilityBridge: this.#globals.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.version === 'MODERNIZATION_PHASE3_INPUT_ABILITIES_V1',
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

  attachClocks(clocks: GameClocks): void {
    this.assertRequiredContracts();
    const attached = this.#globals.__SW_PHASE2_CLOCK_BRIDGE__?.attach(clocks);
    if (attached !== true) throw new Error('Legacy runtime rejected the Phase 2 clock authority.');
  }

  attachInputAbilities(input: InputSystem, abilities: AbilitySystem): void {
    this.assertRequiredContracts();
    const attached = this.#globals.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.attach(input, abilities);
    if (attached !== true) throw new Error('Legacy runtime rejected the Phase 3 input and ability authorities.');
  }

  getRunState(): LegacyRunState {
    this.assertRequiredContracts();
    const state = this.#globals.__SW_PHASE2_CLOCK_BRIDGE__?.getLegacyRunState();
    if (!state) throw new Error('Legacy runtime returned no run-state snapshot.');
    return Object.freeze({ ...state });
  }

  getClockBridgeSnapshot(): LegacyClockBridgeSnapshot {
    this.assertRequiredContracts();
    const snapshot = this.#globals.__SW_PHASE2_CLOCK_BRIDGE__?.getSnapshot();
    if (!snapshot) throw new Error('Legacy runtime returned no clock-bridge snapshot.');
    return snapshot;
  }

  getInputAbilityBridgeSnapshot(): LegacyInputAbilityBridgeSnapshot {
    this.assertRequiredContracts();
    const snapshot = this.#globals.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.getSnapshot();
    if (!snapshot) throw new Error('Legacy runtime returned no input and ability bridge snapshot.');
    return snapshot;
  }

  async prepareScenario(id: QaScenarioId): Promise<void> {
    this.assertRequiredContracts();
    if (id !== 'production-hero') throw new Error(`Unsupported QA scenario: ${id}`);
    const prepared = this.#globals.triggerProductionSliceQa?.('hero');
    if (prepared !== true) throw new Error('Legacy production hero scenario did not initialize.');
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
    if (!snapshot) throw new Error('Legacy runtime returned no QA snapshot.');
    return Object.freeze({ ...snapshot });
  }

  reset(): void {
    this.assertRequiredContracts();
    this.#globals.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.reset();
    this.#globals.__SW_V510_REBUILD__?.();
  }

  private assertRequiredContracts(): void {
    const status = this.getStatus();
    const missing = Object.entries(status)
      .filter(([, present]) => present !== true)
      .map(([name]) => name);
    if (missing.length > 0) throw new Error(`Legacy runtime contract is incomplete: ${missing.join(', ')}`);
  }
}
