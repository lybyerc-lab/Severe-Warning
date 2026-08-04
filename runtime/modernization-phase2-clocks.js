// ============================================================================
// [SW:ARCH:PHASE2_CLOCK_BRIDGE]
// Lexical bridge between the accepted legacy animation loop and GameClocks.
// Before the ES module attaches, fallback behavior exactly mirrors V5 timing.
// ============================================================================
const PHASE2_CLOCK_BRIDGE_VERSION = 'MODERNIZATION_PHASE2_CLOCKS_V1';
let phase2ClockAuthority = null;
let phase2FallbackLastTimestamp = typeof runClockLastTimestamp === 'number'
  ? runClockLastTimestamp
  : performance.now();
let phase2LatestClockSample = {
  renderDeltaMs: 0,
  simulationDeltaMs: 0,
  runDeltaMs: 0,
  runState: 'idle'
};

function phase2ResolveRunState(active, paused, remainingSeconds) {
  if (remainingSeconds <= 0) return 'finished';
  if (!active) return 'idle';
  return paused ? 'paused' : 'running';
}

function phase2FallbackSample(input) {
  const rawRunDeltaMs = Math.max(0, input.nowMs - phase2FallbackLastTimestamp);
  const runState = phase2ResolveRunState(input.runActive, input.paused, input.remainingSeconds);
  const runDeltaMs = runState === 'running' && rawRunDeltaMs <= 1000 ? rawRunDeltaMs : 0;
  phase2FallbackLastTimestamp = input.nowMs;
  phase2LatestClockSample = {
    renderDeltaMs: Math.max(0, input.renderDeltaMs),
    simulationDeltaMs: Math.max(0, input.simulationDeltaMs),
    runDeltaMs,
    runState
  };
  return phase2LatestClockSample;
}

const phase2ClockBridge = {
  version: PHASE2_CLOCK_BRIDGE_VERSION,

  attach(authority) {
    if (!authority || typeof authority.sample !== 'function' || typeof authority.getSnapshot !== 'function') {
      throw new Error('Phase 2 clock authority is missing required methods.');
    }
    phase2ClockAuthority = authority;
    if (typeof authority.resetRun === 'function') {
      authority.resetRun(Math.max(0, runTimeRemaining) * 1000, performance.now());
    }
    return true;
  },

  sample(input) {
    if (phase2ClockAuthority) {
      phase2LatestClockSample = phase2ClockAuthority.sample(input);
      return phase2LatestClockSample;
    }
    return phase2FallbackSample(input);
  },

  reset(durationSeconds, nowMs = performance.now()) {
    phase2FallbackLastTimestamp = nowMs;
    if (phase2ClockAuthority && typeof phase2ClockAuthority.resetRun === 'function') {
      phase2ClockAuthority.resetRun(Math.max(0, durationSeconds) * 1000, nowMs);
    }
  },

  resume(nowMs = performance.now()) {
    phase2FallbackLastTimestamp = nowMs;
    if (phase2ClockAuthority && typeof phase2ClockAuthority.resumeAfterSuspension === 'function') {
      phase2ClockAuthority.resumeAfterSuspension(nowMs);
    }
  },

  getLegacyRunState() {
    return Object.freeze({
      runActive: Boolean(runActive),
      paused: Boolean(isPaused),
      remainingSeconds: Number(runTimeRemaining),
      stage: Number(currentStage),
      gameStarted: Boolean(gameStarted)
    });
  },

  getSnapshot() {
    const authoritySnapshot = phase2ClockAuthority
      ? phase2ClockAuthority.getSnapshot()
      : null;
    return Object.freeze({
      version: PHASE2_CLOCK_BRIDGE_VERSION,
      attached: Boolean(phase2ClockAuthority),
      latestSample: { ...phase2LatestClockSample },
      authority: authoritySnapshot,
      legacy: this.getLegacyRunState()
    });
  }
};

globalThis.__SW_PHASE2_CLOCK_BRIDGE__ = phase2ClockBridge;
// [SW:ARCH:PHASE2_CLOCK_BRIDGE:END]
