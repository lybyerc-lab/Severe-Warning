// ============================================================================
// [SW:ARCH:PHASE3_INPUT_ABILITY_BRIDGE]
// Lexical bridge from accepted legacy handlers to typed input and ability
// authorities. Fallback behavior preserves the existing runtime before attach.
// ============================================================================
const PHASE3_INPUT_ABILITY_BRIDGE_VERSION = 'MODERNIZATION_PHASE3_INPUT_ABILITIES_V1';
const phase3OriginalTriggerAbility = triggerAbility;
let phase3InputAuthority = null;
let phase3AbilityAuthority = null;
let phase3LastEventSource = 'keyboard';
let phase3LastTouchAbility = { slot: null, atMs: -Infinity };
let phase3SuppressedDuplicates = 0;
let phase3AbilityRequests = 0;

function phase3ResolveMovementFallback() {
  if (joystickActive) {
    return Object.freeze({
      x: Number(joystickDir.x) || 0,
      z: Number(joystickDir.z) || 0,
      active: Boolean(joystickDir.x || joystickDir.z),
      source: 'touch'
    });
  }
  let x = 0;
  let z = 0;
  if (keys.KeyA || keys.a || keys.ArrowLeft) x -= 1;
  if (keys.KeyD || keys.d || keys.ArrowRight) x += 1;
  if (keys.KeyW || keys.w || keys.ArrowUp) z -= 1;
  if (keys.KeyS || keys.s || keys.ArrowDown) z += 1;
  return Object.freeze({ x, z, active: x !== 0 || z !== 0, source: x !== 0 || z !== 0 ? 'keyboard' : 'none' });
}

function phase3ExecuteLegacyAbility(slot) {
  const cooldown = cooldowns[slot];
  const before = cooldown ? Number(cooldown.current) : NaN;
  const eligible = Boolean(runActive && cooldown && before <= 0);
  phase3OriginalTriggerAbility(slot);
  const after = cooldown ? Number(cooldown.current) : NaN;
  return eligible && after > before;
}

function phase3ResolveAbilitySource(explicitSource) {
  if (explicitSource) return explicitSource;
  if (isBotMode) return 'bot';
  return phase3LastEventSource === 'touch' ? 'touch' : 'keyboard';
}

function phase3ShouldSuppressDuplicate(slot, source, nowMs) {
  const followsTouch = phase3LastTouchAbility.slot === slot
    && nowMs - phase3LastTouchAbility.atMs <= 450;
  if (followsTouch) {
    phase3SuppressedDuplicates += 1;
    return true;
  }
  if (source === 'touch') phase3LastTouchAbility = { slot, atMs: nowMs };
  return false;
}

const phase3InputAbilityBridge = {
  version: PHASE3_INPUT_ABILITY_BRIDGE_VERSION,

  attach(inputAuthority, abilityAuthority) {
    if (!inputAuthority || typeof inputAuthority.getMovement !== 'function') {
      throw new Error('Phase 3 input authority is missing required methods.');
    }
    if (!abilityAuthority || typeof abilityAuthority.attachExecutor !== 'function') {
      throw new Error('Phase 3 ability authority is missing required methods.');
    }
    phase3InputAuthority = inputAuthority;
    phase3AbilityAuthority = abilityAuthority;
    abilityAuthority.attachExecutor(phase3ExecuteLegacyAbility);
    inputAuthority.setJoystick(Number(joystickDir.x) || 0, Number(joystickDir.z) || 0, Boolean(joystickActive));
    return true;
  },

  setKeyboard(code, key, pressed) {
    if (phase3InputAuthority && typeof phase3InputAuthority.setKeyboard === 'function') {
      phase3InputAuthority.setKeyboard(String(code || ''), String(key || ''), Boolean(pressed));
    }
  },

  setJoystick(x, z, active) {
    if (phase3InputAuthority && typeof phase3InputAuthority.setJoystick === 'function') {
      phase3InputAuthority.setJoystick(Number(x) || 0, Number(z) || 0, Boolean(active));
    }
  },

  getMovement() {
    if (!phase3InputAuthority) return phase3ResolveMovementFallback();
    this.setJoystick(joystickDir.x, joystickDir.z, joystickActive);
    return phase3InputAuthority.getMovement();
  },

  requestAbility(slot, explicitSource) {
    const nowMs = performance.now();
    const source = phase3ResolveAbilitySource(explicitSource);
    phase3AbilityRequests += 1;
    if (phase3ShouldSuppressDuplicate(slot, source, nowMs)) {
      return Object.freeze({ accepted: false, reason: 'duplicate-suppressed', slot, source });
    }
    if (phase3AbilityAuthority) return phase3AbilityAuthority.request(slot, source, nowMs);
    const accepted = phase3ExecuteLegacyAbility(slot);
    return Object.freeze({ accepted, reason: accepted ? 'executed' : 'legacy-rejected', slot, source });
  },

  reset() {
    if (phase3InputAuthority && typeof phase3InputAuthority.reset === 'function') phase3InputAuthority.reset();
    if (phase3AbilityAuthority && typeof phase3AbilityAuthority.resetTelemetry === 'function') phase3AbilityAuthority.resetTelemetry();
    phase3LastTouchAbility = { slot: null, atMs: -Infinity };
    phase3SuppressedDuplicates = 0;
    phase3AbilityRequests = 0;
  },

  getSnapshot() {
    return Object.freeze({
      version: PHASE3_INPUT_ABILITY_BRIDGE_VERSION,
      attached: Boolean(phase3InputAuthority && phase3AbilityAuthority),
      movement: this.getMovement(),
      input: phase3InputAuthority && typeof phase3InputAuthority.getSnapshot === 'function'
        ? phase3InputAuthority.getSnapshot()
        : null,
      abilities: phase3AbilityAuthority && typeof phase3AbilityAuthority.getSnapshot === 'function'
        ? phase3AbilityAuthority.getSnapshot()
        : null,
      abilityRequests: phase3AbilityRequests,
      suppressedDuplicates: phase3SuppressedDuplicates,
      legacy: Object.freeze({
        joystickActive: Boolean(joystickActive),
        joystickX: Number(joystickDir.x) || 0,
        joystickZ: Number(joystickDir.z) || 0
      })
    });
  }
};

document.addEventListener('touchstart', () => { phase3LastEventSource = 'touch'; }, true);
document.addEventListener('pointerdown', event => {
  phase3LastEventSource = event.pointerType === 'touch' ? 'touch' : 'keyboard';
}, true);
document.addEventListener('keydown', event => {
  phase3LastEventSource = 'keyboard';
  phase3InputAbilityBridge.setKeyboard(event.code || '', event.key || '', true);
}, true);
document.addEventListener('keyup', event => {
  phase3InputAbilityBridge.setKeyboard(event.code || '', event.key || '', false);
}, true);
window.addEventListener('blur', () => {
  if (phase3InputAuthority && typeof phase3InputAuthority.reset === 'function') phase3InputAuthority.reset();
});

triggerAbility = function phase3RoutedAbility(slot) {
  return phase3InputAbilityBridge.requestAbility(slot);
};

globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__ = phase3InputAbilityBridge;
// [SW:ARCH:PHASE3_INPUT_ABILITY_BRIDGE:END]
