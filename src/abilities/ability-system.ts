// ============================================================================
// [SW:ARCH:PHASE3_ABILITY_SYSTEM]
// Normalizes ability requests while preserving the accepted legacy executor.
// ============================================================================

export type AbilitySlot = 'primary' | 'secondary' | 'tertiary';
export type AbilitySource = 'keyboard' | 'touch' | 'qa' | 'bot';

export interface AbilityRequest {
  readonly slot: AbilitySlot;
  readonly source: AbilitySource;
  readonly requestedAtMs: number;
}

export interface AbilityResult {
  readonly accepted: boolean;
  readonly request: AbilityRequest;
  readonly reason: 'executed' | 'legacy-rejected' | 'bridge-unavailable';
}

export interface AbilitySnapshot {
  readonly requestCount: number;
  readonly acceptedCount: number;
  readonly rejectedCount: number;
  readonly lastRequest: AbilityRequest | null;
  readonly lastResult: AbilityResult | null;
}

export interface AbilityContractProbe {
  readonly passed: boolean;
  readonly checks: Readonly<Record<string, boolean>>;
}

export type LegacyAbilityExecutor = (slot: AbilitySlot) => boolean;

function finiteTimestamp(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Ability request timestamp must be non-negative and finite, received ${value}.`);
  }
  return value;
}

export class AbilitySystem {
  #executor: LegacyAbilityExecutor | null = null;
  #requestCount = 0;
  #acceptedCount = 0;
  #rejectedCount = 0;
  #lastRequest: AbilityRequest | null = null;
  #lastResult: AbilityResult | null = null;

  attachExecutor(executor: LegacyAbilityExecutor): void {
    this.#executor = executor;
  }

  request(slot: AbilitySlot, source: AbilitySource, requestedAtMs = performance.now()): AbilityResult {
    const request = Object.freeze({
      slot,
      source,
      requestedAtMs: finiteTimestamp(requestedAtMs),
    });
    this.#requestCount += 1;
    this.#lastRequest = request;

    let result: AbilityResult;
    if (!this.#executor) {
      result = Object.freeze({ accepted: false, request, reason: 'bridge-unavailable' });
    } else {
      const accepted = this.#executor(slot) === true;
      result = Object.freeze({
        accepted,
        request,
        reason: accepted ? 'executed' : 'legacy-rejected',
      });
    }

    if (result.accepted) this.#acceptedCount += 1;
    else this.#rejectedCount += 1;
    this.#lastResult = result;
    return result;
  }

  getSnapshot(): AbilitySnapshot {
    return Object.freeze({
      requestCount: this.#requestCount,
      acceptedCount: this.#acceptedCount,
      rejectedCount: this.#rejectedCount,
      lastRequest: this.#lastRequest,
      lastResult: this.#lastResult,
    });
  }

  resetTelemetry(): void {
    this.#requestCount = 0;
    this.#acceptedCount = 0;
    this.#rejectedCount = 0;
    this.#lastRequest = null;
    this.#lastResult = null;
  }

  runContractProbe(): AbilityContractProbe {
    const probe = new AbilitySystem();
    const unavailable = probe.request('primary', 'qa', 100);
    probe.attachExecutor((slot) => slot !== 'tertiary');
    const accepted = probe.request('secondary', 'keyboard', 200);
    const rejected = probe.request('tertiary', 'touch', 300);
    const snapshot = probe.getSnapshot();
    const checks = Object.freeze({
      unavailableRejected: unavailable.accepted === false && unavailable.reason === 'bridge-unavailable',
      acceptedDelegates: accepted.accepted === true && accepted.reason === 'executed',
      legacyRejectionPreserved: rejected.accepted === false && rejected.reason === 'legacy-rejected',
      telemetryCounts: snapshot.requestCount === 3
        && snapshot.acceptedCount === 1
        && snapshot.rejectedCount === 2,
      sourceAndSlotPreserved: snapshot.lastRequest?.source === 'touch'
        && snapshot.lastRequest.slot === 'tertiary',
    });
    return Object.freeze({
      passed: Object.values(checks).every(Boolean),
      checks,
    });
  }
}
