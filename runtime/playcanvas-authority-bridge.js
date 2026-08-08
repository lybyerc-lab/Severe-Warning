// ============================================================================
// [SW:PLAYCANVAS:AUTHORITY_BRIDGE]
// Read/control seam used only by the PlayCanvas migration candidate. The
// accepted legacy runtime remains the gameplay executor; this bridge exposes
// its live state to a same-origin PlayCanvas presentation.
// ============================================================================
const PLAYCANVAS_AUTHORITY_VERSION = 'PLAYCANVAS_AUTHORITY_V1';

const PLAYCANVAS_STRUCTURE_SPECS = Object.freeze([
  Object.freeze({ id: 'storefront', district: 0, isCommercial: true, label: 'Main Street Storefront' }),
  Object.freeze({ id: 'house', district: 1, isCommercial: false, label: 'Prairie House' }),
  Object.freeze({ id: 'industrial', district: 2, isCommercial: true, label: 'Foundry Workshop' }),
  Object.freeze({ id: 'barn', district: 3, isCommercial: false, label: 'Fair Barn' }),
]);

// [SW:PLAYCANVAS:LOCAL_AUTHORITY_ALIGNMENT]
// The accepted production slice historically places its signature barn near the
// county edge. The bounded PlayCanvas world instead represents the central
// Living County fabric. Translate the accepted barn + storm start together so
// their exact relative vector (-24,+15) is preserved while real Living County
// targets remain reachable inside the 190x190 PlayCanvas slice. This changes
// neither damage laws nor scoring and exists only inside the PlayCanvas authority
// iframe created for the migration candidate.
const PLAYCANVAS_LOCAL_BARN_X = -24;
const PLAYCANVAS_LOCAL_BARN_Z = 15;
let playcanvasStructureBindings = Object.freeze([]);

function playcanvasAuthorityRunState() {
  const bridge = globalThis.__SW_PHASE2_CLOCK_BRIDGE__;
  if (bridge && typeof bridge.getLegacyRunState === 'function') {
    return bridge.getLegacyRunState();
  }
  return Object.freeze({
    runActive: Boolean(runActive),
    paused: false,
    remainingSeconds: Number(runTimeRemaining) || 0,
    stage: Number(currentStage) || 1,
    gameStarted: true,
  });
}

function playcanvasAuthorityNearestElectrical() {
  if (!Array.isArray(substations) || substations.length === 0) return null;
  let nearest = null;
  let nearestDistance = Infinity;
  for (const target of substations) {
    const x = Number(target?.x ?? target?.mesh?.position?.x);
    const z = Number(target?.z ?? target?.mesh?.position?.z);
    if (!Number.isFinite(x) || !Number.isFinite(z)) continue;
    const distance = Math.hypot(x - storm.pos.x, z - storm.pos.z);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = target;
    }
  }
  if (!nearest) return null;
  return Object.freeze({
    x: Number(nearest.x ?? nearest.mesh?.position?.x) || 0,
    z: Number(nearest.z ?? nearest.mesh?.position?.z) || 0,
    health: Number(nearest.health ?? 0),
    maxHealth: Number(nearest.maxHealth ?? nearest.health ?? 0),
    destroyed: Boolean(nearest.destroyed),
    distance: Number(nearestDistance.toFixed(2)),
  });
}

function playcanvasSelectStructureBindings() {
  if (typeof targets === 'undefined' || !Array.isArray(targets)) return Object.freeze([]);
  const bindings = [];

  for (const spec of PLAYCANVAS_STRUCTURE_SPECS) {
    let selected = null;
    let selectedDistance = Infinity;
    for (const target of targets) {
      if (!target || target.isTree) continue;
      if (Number(target.district) !== spec.district) continue;
      if (Boolean(target.isCommercial) !== spec.isCommercial) continue;
      const x = Number(target.x);
      const z = Number(target.z);
      if (!Number.isFinite(x) || !Number.isFinite(z)) continue;
      const distance = Math.hypot(x, z);
      if (distance < selectedDistance) {
        selectedDistance = distance;
        selected = target;
      }
    }

    if (!selected) continue;
    bindings.push(Object.freeze({
      spec,
      target: selected,
      targetKey: `${String(selected.blockId || spec.id)}:${Number(selected.x).toFixed(2)}:${Number(selected.z).toFixed(2)}`,
    }));
  }

  return Object.freeze(bindings);
}

function playcanvasPrepareLocalAuthorityScene() {
  if (typeof productionBarn === 'undefined' || !productionBarn || !productionBarn.group) return false;

  productionBarn.x = PLAYCANVAS_LOCAL_BARN_X;
  productionBarn.z = PLAYCANVAS_LOCAL_BARN_Z;
  productionBarn.group.position.set(
    productionBarn.x,
    terrainHeightAt(productionBarn.x, productionBarn.z),
    productionBarn.z,
  );

  storm.pos.set(0, terrainHeightAt(0, 0), 0);
  tornadoGroup.position.copy(storm.pos);
  supercellGroup.position.copy(storm.pos);
  derechoGroup.position.copy(storm.pos);

  const cow17 = Array.isArray(animals) ? animals.find((animal) => animal.id === 17) : null;
  if (cow17 && !cow17.airborne) {
    cow17.x = productionBarn.x + 14;
    cow17.z = productionBarn.z + 10;
    cow17.groundY = terrainHeightAt(cow17.x, cow17.z);
    cow17.mesh.position.set(cow17.x, cow17.groundY + cow17.altitude, cow17.z);
  }

  playcanvasStructureBindings = playcanvasSelectStructureBindings();
  return true;
}

// [SW:PLAYCANVAS:MULTI_STRUCTURE_AUTHORITY]
// The renderer mirrors four deterministic Living County targets. The target
// references are selected once per reset and then frozen so Pull movement can
// never cause an identity swap while a structure is taking damage.
function playcanvasAuthorityStructures() {
  const result = [];
  for (const binding of playcanvasStructureBindings) {
    const { spec, target: selected, targetKey } = binding;
    const x = Number(selected.x) || 0;
    const z = Number(selected.z) || 0;
    result.push(Object.freeze({
      id: spec.id,
      label: spec.label,
      targetKey,
      x,
      z,
      health: Number(selected.health) || 0,
      maxHealth: Number(selected.maxHealth ?? selected.health) || 0,
      damageStage: Number(selected.damageStage) || 0,
      destroyed: Boolean(selected.destroyed),
      points: Number(selected.points ?? selected.meshData?.points) || 0,
      blockId: String(selected.blockId || ''),
      blockName: String(selected.blockName || ''),
      district: Number(selected.district) || 0,
      isCommercial: Boolean(selected.isCommercial),
      footprint: Number(selected.meshData?.footprint) || 5,
      kind: String(selected.kind || selected.meshData?.label || ''),
    }));
  }

  return Object.freeze(result);
}

function playcanvasAuthoritySnapshot() {
  const run = playcanvasAuthorityRunState();
  const scoringBridge = globalThis.__SW_PHASE4_SCORING_CAMPAIGN_BRIDGE__;
  const scoreSnapshot = scoringBridge && typeof scoringBridge.getSnapshot === 'function'
    ? scoringBridge.getSnapshot()
    : null;
  const inputAbilityBridge = globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__;
  const inputAbilities = inputAbilityBridge && typeof inputAbilityBridge.getSnapshot === 'function'
    ? inputAbilityBridge.getSnapshot()
    : null;
  const cow17 = Array.isArray(animals) ? animals.find((animal) => animal.id === 17) : null;
  const barn = typeof productionBarn !== 'undefined' ? productionBarn : null;
  const electrical = playcanvasAuthorityNearestElectrical();
  const structures = playcanvasAuthorityStructures();

  return Object.freeze({
    version: PLAYCANVAS_AUTHORITY_VERSION,
    ready: Boolean(globalThis.__SW_MODERN_SHELL_READY__ === true && storm && storm.pos),
    run: Object.freeze({
      runActive: Boolean(run.runActive),
      paused: Boolean(run.paused),
      remainingSeconds: Number(run.remainingSeconds) || 0,
      stage: Number(run.stage ?? currentStage) || 1,
    }),
    storm: Object.freeze({
      x: Number(storm.pos.x),
      y: Number(storm.pos.y),
      z: Number(storm.pos.z),
      radius: Number(storm.radius) || 0,
      efMultiplier: Number(efMultiplier) || 1,
    }),
    score: Object.freeze({
      destructionScore: Number(destructionScore) || 0,
      baseScore: Number(baseScore) || 0,
      comboMultiplier: Number(comboMultiplier) || 1,
      maxComboReached: Number(maxComboReached) || 1,
      mirror: scoreSnapshot?.score ?? null,
    }),
    inputAbilities,
    cooldowns: Object.freeze({
      primary: Number(cooldowns?.primary?.current) || 0,
      secondary: Number(cooldowns?.secondary?.current) || 0,
      tertiary: Number(cooldowns?.tertiary?.current) || 0,
    }),
    barn: barn ? Object.freeze({
      x: Number(barn.x),
      z: Number(barn.z),
      health: Number(barn.health),
      maxHealth: Number(barn.maxHealth),
      stage: Number(barn.stage),
      destroyed: Boolean(barn.destroyed),
      roofDetached: Boolean(barn.roofLeft && barn.group && barn.roofLeft.parent !== barn.group),
    }) : null,
    structures,
    cow17: cow17 ? Object.freeze({
      x: Number(cow17.x),
      z: Number(cow17.z),
      airborne: Boolean(cow17.airborne),
      safe: true,
    }) : null,
    electrical,
  });
}

const playcanvasAuthorityBridge = Object.freeze({
  version: PLAYCANVAS_AUTHORITY_VERSION,

  isReady() {
    try {
      return playcanvasAuthoritySnapshot().ready;
    } catch (_) {
      return false;
    }
  },

  preparePlayable() {
    if (typeof resetWarningRun === 'function') resetWarningRun();
    if (typeof globalThis.triggerProductionSliceQa === 'function') {
      globalThis.triggerProductionSliceQa('playable');
    }
    playcanvasPrepareLocalAuthorityScene();
    runActive = true;
    const mainMenu = typeof getCachedEl === 'function' ? getCachedEl('mainMenu') : null;
    if (mainMenu) mainMenu.classList.add('hidden');
    const results = typeof getCachedEl === 'function' ? getCachedEl('resultsOverlay') : null;
    if (results) results.classList.remove('active');
    return playcanvasAuthoritySnapshot();
  },

  setKeyboard(code, key, pressed) {
    const bridge = globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__;
    if (!bridge || typeof bridge.setKeyboard !== 'function') return false;
    bridge.setKeyboard(String(code || ''), String(key || ''), Boolean(pressed));
    return true;
  },

  setJoystick(x, z, active) {
    const bridge = globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__;
    if (!bridge || typeof bridge.setJoystick !== 'function') return false;
    bridge.setJoystick(Number(x) || 0, Number(z) || 0, Boolean(active));
    return true;
  },

  requestAbility(slot, source = 'keyboard') {
    const bridge = globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__;
    if (!bridge || typeof bridge.requestAbility !== 'function') {
      return Object.freeze({ accepted: false, reason: 'bridge-unavailable', slot, source });
    }
    return bridge.requestAbility(slot, source);
  },

  reset() {
    const bridge = globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__;
    if (bridge && typeof bridge.reset === 'function') bridge.reset();
    return this.preparePlayable();
  },

  getSnapshot() {
    return playcanvasAuthoritySnapshot();
  },
});

globalThis.__SW_PLAYCANVAS_AUTHORITY__ = playcanvasAuthorityBridge;
// [SW:PLAYCANVAS:AUTHORITY_BRIDGE:END]
