// ============================================================================
// [SW:VISUAL:HERO_SLICE5:NEON_GATE]
// THREEJS_VISUAL_HERO_SLICE5_NEON_GATE_V1
//
// Player-choice gate for the Hero Slice 5 rainbow funnel. The existing game
// menu owns the choice through neonFunnelUnlocked / toggleNeonCosmetic().
// This layer reads that state only. It never equips, unlocks, or persists Neon.
// ============================================================================
const THREEJS_VISUAL_HERO_SLICE5_NEON_GATE_VERSION = 'THREEJS_VISUAL_HERO_SLICE5_NEON_GATE_V1';

const swVisualHeroSlice5NeonGateState = {
  gateSource: 'neonFunnelUnlocked',
  lastSelected: null,
  activationCount: 0,
  restoreCount: 0,
};

function swVisualHeroSlice5IsNeonSelected() {
  return typeof neonFunnelUnlocked !== 'undefined' && neonFunnelUnlocked === true;
}

function swVisualHeroSlice5RestoreSlice4Funnel() {
  let restored = false;
  if (typeof swVisualHeroSlice4TuneLegacyFunnel === 'function') {
    restored = swVisualHeroSlice4TuneLegacyFunnel() !== false;
  } else {
    if (typeof funnelMat !== 'undefined' && funnelMat) {
      funnelMat.color?.set?.('#34434d');
      funnelMat.opacity = 0.46;
      funnelMat.roughness = 0.68;
      funnelMat.metalness = 0;
      funnelMat.transparent = true;
      funnelMat.depthWrite = false;
      funnelMat.needsUpdate = true;
      restored = true;
    }
    if (typeof outerFunnelMat !== 'undefined' && outerFunnelMat) {
      outerFunnelMat.color?.set?.('#6d7b80');
      outerFunnelMat.opacity = 0.24;
      outerFunnelMat.transparent = true;
      outerFunnelMat.depthWrite = false;
      outerFunnelMat.needsUpdate = true;
      restored = true;
    }
  }
  swVisualHeroSlice5State.legacyFunnelDimmed = false;
  return restored;
}

const swVisualHeroSlice5BuildRainbowFunnelUngated = swVisualHeroSlice5BuildRainbowFunnel;
swVisualHeroSlice5BuildRainbowFunnel = function swVisualHeroSlice5BuildRainbowFunnelWhenNeonSelected(...args) {
  const selected = swVisualHeroSlice5IsNeonSelected();
  swVisualHeroSlice5NeonGateState.lastSelected = selected;
  if (!selected) {
    const hadRainbow = Boolean(swVisualHeroSlice5RainbowRoot?.parent);
    swVisualHeroSlice5DisposeRainbow();
    if (swVisualHeroSlice5State.legacyFunnelDimmed || hadRainbow) {
      swVisualHeroSlice5RestoreSlice4Funnel();
      swVisualHeroSlice5NeonGateState.restoreCount += 1;
    } else {
      swVisualHeroSlice5RestoreSlice4Funnel();
    }
    return false;
  }
  const hadRainbow = Boolean(swVisualHeroSlice5RainbowRoot?.parent);
  const result = swVisualHeroSlice5BuildRainbowFunnelUngated.apply(this, args);
  if (!hadRainbow && result !== false) swVisualHeroSlice5NeonGateState.activationCount += 1;
  return result;
};

function swVisualHeroSlice5SyncRainbowSelection() {
  const selected = swVisualHeroSlice5IsNeonSelected();
  const rootPresent = Boolean(swVisualHeroSlice5RainbowRoot?.parent);
  swVisualHeroSlice5NeonGateState.lastSelected = selected;

  if (selected && !rootPresent) {
    swVisualHeroSlice5BuildRainbowFunnel();
  } else if (!selected && (rootPresent || swVisualHeroSlice5State.legacyFunnelDimmed)) {
    swVisualHeroSlice5DisposeRainbow();
    swVisualHeroSlice5RestoreSlice4Funnel();
    swVisualHeroSlice5NeonGateState.restoreCount += 1;
  }
  return selected;
}

const swVisualHeroSlice5UpdateRainbowUngated = swVisualHeroSlice5UpdateRainbow;
swVisualHeroSlice5UpdateRainbow = function swVisualHeroSlice5UpdateRainbowWhenNeonSelected(dt, now) {
  if (!swVisualHeroSlice5SyncRainbowSelection()) return false;
  return swVisualHeroSlice5UpdateRainbowUngated.call(this, dt, now);
};

const swVisualHeroSlice5RefreshWorldUngated = swVisualHeroSlice5RefreshWorld;
swVisualHeroSlice5RefreshWorld = function swVisualHeroSlice5RefreshWorldWithNeonGate(...args) {
  const result = swVisualHeroSlice5RefreshWorldUngated.apply(this, args);
  swVisualHeroSlice5SyncRainbowSelection();
  return result;
};

const swVisualHeroSlice5SnapshotWithNeonGateBase = swVisualSnapshot;
swVisualSnapshot = function swVisualSnapshotWithHeroSlice5NeonGate() {
  const base = swVisualHeroSlice5SnapshotWithNeonGateBase();
  const selected = swVisualHeroSlice5IsNeonSelected();
  const rootPresent = Boolean(swVisualHeroSlice5RainbowRoot?.parent);
  return Object.freeze({
    ...base,
    rainbowFunnel: Object.freeze({
      ...(base.rainbowFunnel || {}),
      neonSelected: selected,
      enabled: selected && rootPresent,
      gateSource: swVisualHeroSlice5NeonGateState.gateSource,
    }),
    neonGate: Object.freeze({
      version: THREEJS_VISUAL_HERO_SLICE5_NEON_GATE_VERSION,
      source: swVisualHeroSlice5NeonGateState.gateSource,
      selected,
      activationCount: swVisualHeroSlice5NeonGateState.activationCount,
      restoreCount: swVisualHeroSlice5NeonGateState.restoreCount,
    }),
  });
};

const swVisualHeroSlice5NeonGateBridgeBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__;
globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
  ...swVisualHeroSlice5NeonGateBridgeBase,
  getSnapshot: swVisualSnapshot,
  refreshHeroSlice5: swVisualHeroSlice5RefreshWorld,
  heroSlice5NeonGateVersion: THREEJS_VISUAL_HERO_SLICE5_NEON_GATE_VERSION,
});

Promise.resolve().then(() => swVisualHeroSlice5SyncRainbowSelection());
// [SW:VISUAL:HERO_SLICE5:NEON_GATE:END]
