// ============================================================================
// [SW:PLAYCANVAS:PRODUCTION_SLICE_ENTRY]
// Playable Prairie Junction migration slice. The accepted legacy runtime runs
// in a hidden same-origin authority frame; PlayCanvas owns visible presentation.
// ============================================================================

import './styles.css';
import {
  PLAYCANVAS_VERSION,
  ROAD_CLEARANCE,
  TORNADO_GROUND_CLEARANCE,
} from './constants';
import {
  PlayCanvasAuthorityClient,
  type AuthorityAbilitySlot,
  type AuthoritySnapshot,
} from './authority-client';
import { OneStickChaseCamera } from './chase-camera';
import type { PcEntity, PlayCanvasModule } from './engine-types';
import type { OffsetEntity } from './geometry';
import { populatePrairieJunctionScene, type SceneResult } from './scene';

interface SliceTelemetry {
  readonly renderer: 'PlayCanvas';
  readonly engineVersion: string;
  readonly engineRevision: string;
  readonly gameplayAuthority: 'PLAYCANVAS_AUTHORITY_V1';
  readonly roadClearance: number;
  readonly tornadoGroundClearance: number;
  readonly entityCount: number;
  readonly qaMode: boolean;
}

interface SliceHandle {
  readonly telemetry: SliceTelemetry;
  getAuthoritySnapshot(): AuthoritySnapshot | null;
  requestAbility(slot: AuthorityAbilitySlot, source?: 'keyboard' | 'touch' | 'qa'): boolean;
  reset(): AuthoritySnapshot;
  dispose(): void;
}

interface WorldTransform {
  map(x: number, z: number): Readonly<{ x: number; z: number }>;
  unmapDirection(x: number, z: number): Readonly<{ x: number; z: number }>;
}

interface ControlHandle {
  refresh(): void;
  dispose(): void;
}

declare global {
  var __SW_PLAYCANVAS_SLICE__: SliceHandle | undefined;
}

const MOVEMENT_CODES = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']);
const ABILITY_CODES: Readonly<Record<string, AuthorityAbilitySlot>> = Object.freeze({
  Digit1: 'primary',
  Digit2: 'secondary',
  Digit3: 'tertiary',
  Numpad1: 'primary',
  Numpad2: 'secondary',
  Numpad3: 'tertiary',
});
const ABILITY_LABELS: Readonly<Record<AuthorityAbilitySlot, string>> = Object.freeze({
  primary: 'PULL',
  secondary: 'GUST',
  tertiary: 'ZAP',
});

// [SW:PLAYCANVAS:ONE_STICK_CHASE_CAMERA]
// The stick controls storm movement in screen space. Camera heading is a
// separate, slower state that eases behind sustained travel direction.
const INITIAL_CAMERA_OFFSET_X = 30;
const INITIAL_CAMERA_OFFSET_Z = 36;
const CHASE_CAMERA_DISTANCE = Math.hypot(INITIAL_CAMERA_OFFSET_X, INITIAL_CAMERA_OFFSET_Z);
const CHASE_CAMERA_HEIGHT = 28;
const CHASE_CAMERA_LOOK_Y = 3.6;
const CHASE_CAMERA_TURN_RATE_RADIANS = 1.35;
const CHASE_CAMERA_HEADING_DEAD_ZONE_RADIANS = Math.PI * 10 / 180;
const CHASE_CAMERA_MOVEMENT_THRESHOLD = 0.28;

function byId<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function setStatus(message: string, state: 'loading' | 'ready' | 'error'): void {
  const status = byId<HTMLElement>('slice-status');
  if (!status) return;
  status.textContent = message;
  status.dataset.ready = state === 'ready' ? 'true' : 'false';
  status.dataset.error = state === 'error' ? 'true' : 'false';
}

async function loadPlayCanvasEngine(): Promise<PlayCanvasModule> {
  const engineUrl = new URL(`vendor/playcanvas-${PLAYCANVAS_VERSION}.min.mjs`, document.baseURI).href;
  return (await import(/* @vite-ignore */ engineUrl)) as unknown as PlayCanvasModule;
}

function assertLoadedEngineIdentity(pc: PlayCanvasModule): void {
  if (pc.version !== PLAYCANVAS_VERSION) {
    throw new Error(`PlayCanvas engine version mismatch. Expected ${PLAYCANVAS_VERSION}, loaded ${pc.version}.`);
  }
  if (typeof pc.revision !== 'string' || pc.revision.trim().length < 7 || pc.revision.includes('$_CURRENT_')) {
    throw new Error(`PlayCanvas engine revision is missing or unresolved: ${String(pc.revision)}.`);
  }
}

function clearTelemetry(): void {
  for (const key of [
    'swPlaycanvasSliceReady',
    'swPlaycanvasEngineVersion',
    'swPlaycanvasEngineRevision',
    'swPlaycanvasGameplayAuthority',
    'swRoadClearance',
    'swTornadoGroundClearance',
    'swRenderer',
  ] as const) {
    delete document.documentElement.dataset[key];
  }
}

function createWorldTransform(snapshot: AuthoritySnapshot, scene: SceneResult): WorldTransform {
  const sourceStorm = snapshot.storm;
  const sourceBarn = snapshot.barn;
  const targetStorm = scene.anchors.tornado;
  const targetBarn = scene.anchors.barnProxy;
  if (!sourceBarn) {
    return Object.freeze({
      map(x: number, z: number) {
        return Object.freeze({
          x: targetStorm.x + (x - sourceStorm.x) * 0.5,
          z: targetStorm.z + (z - sourceStorm.z) * 0.5,
        });
      },
      unmapDirection(x: number, z: number) {
        return Object.freeze({ x, z });
      },
    });
  }

  const sx = sourceBarn.x - sourceStorm.x;
  const sz = sourceBarn.z - sourceStorm.z;
  const tx = targetBarn.x - targetStorm.x;
  const tz = targetBarn.z - targetStorm.z;
  const sourceLength = Math.max(0.001, Math.hypot(sx, sz));
  const targetLength = Math.max(0.001, Math.hypot(tx, tz));
  const scale = targetLength / sourceLength;
  const rotation = Math.atan2(tz, tx) - Math.atan2(sz, sx);
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);

  return Object.freeze({
    map(x: number, z: number) {
      const dx = x - sourceStorm.x;
      const dz = z - sourceStorm.z;
      const rx = dx * cosine - dz * sine;
      const rz = dx * sine + dz * cosine;
      return Object.freeze({
        x: targetStorm.x + rx * scale,
        z: targetStorm.z + rz * scale,
      });
    },
    unmapDirection(x: number, z: number) {
      return Object.freeze({
        x: x * cosine + z * sine,
        z: -x * sine + z * cosine,
      });
    },
  });
}

function chaseCameraAuthorityInput(
  screenX: number,
  screenY: number,
  transform: WorldTransform,
  chaseCamera: OneStickChaseCamera,
): Readonly<{ x: number; z: number }> {
  const target = chaseCamera.screenToWorldDirection(screenX, screenY);
  const source = transform.unmapDirection(target.x, target.z);
  const magnitude = Math.hypot(source.x, source.z);
  if (magnitude <= 1) return source;
  return Object.freeze({ x: source.x / magnitude, z: source.z / magnitude });
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safe / 60);
  return `${minutes}:${String(safe % 60).padStart(2, '0')}`;
}

function setOffsetParts(parts: readonly OffsetEntity[], centerX: number, centerZ: number): void {
  for (const part of parts) {
    part.entity.setPosition(
      centerX + part.offset[0],
      part.offset[1],
      centerZ + part.offset[2],
    );
  }
}

function applyBarnVisual(scene: SceneResult, snapshot: AuthoritySnapshot): void {
  const barn = snapshot.barn;
  if (!barn) return;
  const ratio = barn.maxHealth > 0 ? Math.max(0, Math.min(1, barn.health / barn.maxHealth)) : 0;
  const { walls, roof, center } = scene.mooBrew;
  walls.setPosition(center.x, Math.max(1.8, center.height * (0.33 + ratio * 0.17)), center.z);
  walls.setLocalScale(10, Math.max(3.6, 6 * (0.6 + ratio * 0.4)), 8);

  if (barn.destroyed) {
    roof.setPosition(center.x - 5.4, 1.1, center.z + 5.2);
    roof.setEulerAngles(18, 34, 71);
  } else if (barn.roofDetached || barn.stage >= 3) {
    roof.setPosition(center.x - 2.7, center.height + 2.1, center.z + 2.5);
    roof.setEulerAngles(13, 20, 48);
  } else if (barn.stage >= 2) {
    roof.setPosition(center.x - 0.8, center.height + 1.15, center.z + 0.7);
    roof.setEulerAngles(7, 8, 24);
  } else if (barn.stage >= 1) {
    roof.setPosition(center.x, center.height + 0.55, center.z);
    roof.setEulerAngles(0, 0, 8);
  } else {
    roof.setPosition(center.x, center.height + 0.45, center.z);
    roof.setEulerAngles(0, 0, 0);
  }
}

function updateHud(snapshot: AuthoritySnapshot): void {
  const time = byId<HTMLElement>('hud-time');
  const score = byId<HTMLElement>('hud-score');
  const combo = byId<HTMLElement>('hud-combo');
  const target = byId<HTMLElement>('hud-target');
  if (time) time.textContent = formatTime(snapshot.run.remainingSeconds);
  if (score) score.textContent = Math.round(snapshot.score.destructionScore).toLocaleString();
  if (combo) combo.textContent = `${snapshot.score.comboMultiplier.toFixed(2)}x`;
  if (target) {
    const barnRatio = snapshot.barn && snapshot.barn.maxHealth > 0
      ? Math.round(snapshot.barn.health / snapshot.barn.maxHealth * 100)
      : null;
    target.textContent = `Live authority • target ${barnRatio === null ? '—' : `${barnRatio}%`} • Cow 17 SAFE`;
  }
  for (const slot of ['primary', 'secondary', 'tertiary'] as const) {
    const cooldown = byId<HTMLElement>(`cooldown-${slot}`);
    if (!cooldown) continue;
    const remaining = snapshot.cooldowns[slot];
    cooldown.textContent = remaining > 0.05 ? `${remaining.toFixed(1)}s` : 'READY';
  }
}

function installControls(
  authority: PlayCanvasAuthorityClient,
  mapScreenInput: (screenX: number, screenY: number) => Readonly<{ x: number; z: number }>,
  onAbility: (slot: AuthorityAbilitySlot, source: 'keyboard' | 'touch' | 'qa') => boolean,
  onReset: () => void,
): ControlHandle {
  const pressed = new Set<string>();
  let touchVector: Readonly<{ x: number; y: number }> | null = null;

  const keyboardVector = (): Readonly<{ x: number; y: number }> => {
    let x = 0;
    let y = 0;
    if (pressed.has('KeyD') || pressed.has('ArrowRight')) x += 1;
    if (pressed.has('KeyA') || pressed.has('ArrowLeft')) x -= 1;
    if (pressed.has('KeyS') || pressed.has('ArrowDown')) y += 1;
    if (pressed.has('KeyW') || pressed.has('ArrowUp')) y -= 1;
    const magnitude = Math.hypot(x, y);
    if (magnitude > 1) return Object.freeze({ x: x / magnitude, y: y / magnitude });
    return Object.freeze({ x, y });
  };

  const applyDirectionalInput = (): void => {
    const screen = touchVector ?? keyboardVector();
    const active = Math.hypot(screen.x, screen.y) > 0.01;
    const authorityVector = active ? mapScreenInput(screen.x, screen.y) : Object.freeze({ x: 0, z: 0 });
    authority.setJoystick(authorityVector.x, authorityVector.z, active);
    document.documentElement.dataset.swPlaycanvasScreenInputX = screen.x.toFixed(3);
    document.documentElement.dataset.swPlaycanvasScreenInputY = screen.y.toFixed(3);
    document.documentElement.dataset.swPlaycanvasAuthorityInputX = authorityVector.x.toFixed(3);
    document.documentElement.dataset.swPlaycanvasAuthorityInputZ = authorityVector.z.toFixed(3);
  };

  const keyDown = (event: KeyboardEvent): void => {
    if (MOVEMENT_CODES.has(event.code)) {
      event.preventDefault();
      pressed.add(event.code);
      if (!touchVector) applyDirectionalInput();
      return;
    }
    const slot = ABILITY_CODES[event.code];
    if (slot && !event.repeat) {
      event.preventDefault();
      onAbility(slot, 'keyboard');
    }
  };
  const keyUp = (event: KeyboardEvent): void => {
    if (!MOVEMENT_CODES.has(event.code)) return;
    event.preventDefault();
    pressed.delete(event.code);
    if (!touchVector) applyDirectionalInput();
  };
  const blur = (): void => {
    pressed.clear();
    touchVector = null;
    authority.setJoystick(0, 0, false);
  };
  window.addEventListener('keydown', keyDown, { passive: false });
  window.addEventListener('keyup', keyUp, { passive: false });
  window.addEventListener('blur', blur);

  const abilityListeners: Array<{ element: HTMLElement; listener: (event: PointerEvent) => void }> = [];
  document.querySelectorAll<HTMLElement>('[data-ability]').forEach((element) => {
    const listener = (event: PointerEvent): void => {
      event.preventDefault();
      const slot = element.dataset.ability as AuthorityAbilitySlot | undefined;
      if (!slot) return;
      onAbility(slot, event.pointerType === 'touch' ? 'touch' : 'keyboard');
    };
    element.addEventListener('pointerdown', listener);
    abilityListeners.push({ element, listener });
  });

  const reset = byId<HTMLButtonElement>('reset-run');
  reset?.addEventListener('click', onReset);

  const joystick = byId<HTMLElement>('joystick');
  const knob = byId<HTMLElement>('joystick-knob');
  let joystickPointer: number | null = null;
  const updateJoystick = (event: PointerEvent): void => {
    if (!joystick || !knob) return;
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const maxRadius = rect.width * 0.31;
    const distance = Math.hypot(dx, dy);
    const factor = distance > maxRadius ? maxRadius / Math.max(distance, 0.001) : 1;
    const visualX = dx * factor;
    const visualY = dy * factor;
    knob.style.transform = `translate(${visualX}px, ${visualY}px)`;
    touchVector = Object.freeze({ x: visualX / maxRadius, y: visualY / maxRadius });
    applyDirectionalInput();
  };
  const joystickDown = (event: PointerEvent): void => {
    if (!joystick) return;
    event.preventDefault();
    joystickPointer = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    updateJoystick(event);
  };
  const joystickMove = (event: PointerEvent): void => {
    if (joystickPointer !== event.pointerId) return;
    event.preventDefault();
    updateJoystick(event);
  };
  const joystickEnd = (event: PointerEvent): void => {
    if (joystickPointer !== event.pointerId) return;
    event.preventDefault();
    joystickPointer = null;
    touchVector = null;
    if (knob) knob.style.transform = 'translate(0, 0)';
    applyDirectionalInput();
  };
  joystick?.addEventListener('pointerdown', joystickDown);
  joystick?.addEventListener('pointermove', joystickMove);
  joystick?.addEventListener('pointerup', joystickEnd);
  joystick?.addEventListener('pointercancel', joystickEnd);

  return Object.freeze({
    refresh(): void {
      if (touchVector || pressed.size > 0) applyDirectionalInput();
    },
    dispose(): void {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', blur);
      for (const { element, listener } of abilityListeners) element.removeEventListener('pointerdown', listener);
      reset?.removeEventListener('click', onReset);
      joystick?.removeEventListener('pointerdown', joystickDown);
      joystick?.removeEventListener('pointermove', joystickMove);
      joystick?.removeEventListener('pointerup', joystickEnd);
      joystick?.removeEventListener('pointercancel', joystickEnd);
      blur();
    },
  });
}

function flashAbility(slot: AuthorityAbilitySlot, accepted: boolean): void {
  const button = document.querySelector<HTMLElement>(`[data-ability="${slot}"]`);
  if (!button) return;
  button.dataset.fired = accepted ? 'true' : 'false';
  window.setTimeout(() => { delete button.dataset.fired; }, 180);
}

function rotateTornado(parts: readonly PcEntity[], deltaSeconds: number): void {
  parts.forEach((part, index) => {
    const direction = index % 2 === 0 ? 1 : -1;
    part.rotate(0, direction * deltaSeconds * (30 + index * 8), 0);
  });
}

async function bootstrapSlice(): Promise<SliceHandle> {
  setStatus('Loading PlayCanvas renderer…', 'loading');
  const pc = await loadPlayCanvasEngine();
  assertLoadedEngineIdentity(pc);
  const qaMode = new URLSearchParams(window.location.search).get('qa') === '1';
  const mount = document.querySelector<HTMLElement>('#app');
  if (!mount) throw new Error('PlayCanvas slice mount is missing.');

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', 'Playable PlayCanvas Prairie Junction tornado view');
  mount.prepend(canvas);

  const app = new pc.Application(canvas, {
    graphicsDeviceOptions: {
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    },
  });
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);

  const resize = (): void => app.resizeCanvas();
  window.addEventListener('resize', resize);
  const scene = populatePrairieJunctionScene(pc, app);
  app.start();
  resize();

  setStatus('Connecting accepted gameplay…', 'loading');
  const authority = new PlayCanvasAuthorityClient();
  let latestSnapshot = await authority.connect();
  const transform = createWorldTransform(latestSnapshot, scene);
  let targetTornado = transform.map(latestSnapshot.storm.x, latestSnapshot.storm.z);
  let renderTornado = { ...targetTornado };
  let lastAuthorityPoll = -Infinity;
  let acceptedAbilities = 0;
  const chaseCamera = new OneStickChaseCamera(Object.freeze({
    distance: CHASE_CAMERA_DISTANCE,
    turnRateRadiansPerSecond: CHASE_CAMERA_TURN_RATE_RADIANS,
    headingDeadZoneRadians: CHASE_CAMERA_HEADING_DEAD_ZONE_RADIANS,
    movementThreshold: CHASE_CAMERA_MOVEMENT_THRESHOLD,
    initialForwardX: -INITIAL_CAMERA_OFFSET_X / CHASE_CAMERA_DISTANCE,
    initialForwardZ: -INITIAL_CAMERA_OFFSET_Z / CHASE_CAMERA_DISTANCE,
  }), renderTornado.x, renderTornado.z);

  const syncSnapshot = (snapshot: AuthoritySnapshot): void => {
    latestSnapshot = snapshot;
    targetTornado = transform.map(snapshot.storm.x, snapshot.storm.z);
    updateHud(snapshot);
    applyBarnVisual(scene, snapshot);
    if (snapshot.cow17) {
      const cow = transform.map(snapshot.cow17.x, snapshot.cow17.z);
      setOffsetParts(scene.cow17Parts, cow.x, cow.z);
    }
    if (snapshot.electrical) {
      const electrical = transform.map(snapshot.electrical.x, snapshot.electrical.z);
      setOffsetParts(scene.electricalParts, electrical.x, electrical.z);
    }
    document.documentElement.dataset.swPlaycanvasScore = String(Math.round(snapshot.score.destructionScore));
    document.documentElement.dataset.swPlaycanvasCombo = snapshot.score.comboMultiplier.toFixed(2);
    document.documentElement.dataset.swPlaycanvasRemaining = snapshot.run.remainingSeconds.toFixed(2);
    document.documentElement.dataset.swPlaycanvasStormX = snapshot.storm.x.toFixed(3);
    document.documentElement.dataset.swPlaycanvasStormZ = snapshot.storm.z.toFixed(3);
    document.documentElement.dataset.swPlaycanvasBarnHealth = snapshot.barn ? snapshot.barn.health.toFixed(2) : 'none';
  };

  const requestAbility = (slot: AuthorityAbilitySlot, source: 'keyboard' | 'touch' | 'qa' = 'keyboard'): boolean => {
    const result = authority.requestAbility(slot, source);
    flashAbility(slot, result.accepted);
    if (result.accepted) acceptedAbilities += 1;
    document.documentElement.dataset.swPlaycanvasLastAbility = slot;
    document.documentElement.dataset.swPlaycanvasLastAbilityAccepted = String(result.accepted);
    document.documentElement.dataset.swPlaycanvasAbilityAcceptedCount = String(acceptedAbilities);
    const target = byId<HTMLElement>('hud-target');
    if (target) target.textContent = `${ABILITY_LABELS[slot]} ${result.accepted ? 'FIRED' : String(result.reason).toUpperCase()}`;
    syncSnapshot(authority.snapshot());
    return result.accepted;
  };

  const reset = (): AuthoritySnapshot => {
    acceptedAbilities = 0;
    const snapshot = authority.reset();
    document.documentElement.dataset.swPlaycanvasAbilityAcceptedCount = '0';
    delete document.documentElement.dataset.swPlaycanvasLastAbility;
    delete document.documentElement.dataset.swPlaycanvasLastAbilityAccepted;
    syncSnapshot(snapshot);
    renderTornado = { ...targetTornado };
    chaseCamera.reset(renderTornado.x, renderTornado.z);
    return snapshot;
  };

  const mapScreenInput = (screenX: number, screenY: number): Readonly<{ x: number; z: number }> => (
    chaseCameraAuthorityInput(screenX, screenY, transform, chaseCamera)
  );
  const controls = installControls(authority, mapScreenInput, requestAbility, reset);
  syncSnapshot(latestSnapshot);

  app.on('update', (deltaSeconds) => {
    if (!qaMode) rotateTornado(scene.tornadoParts, deltaSeconds);
    const blend = Math.min(1, Math.max(0, deltaSeconds * 12));
    renderTornado.x += (targetTornado.x - renderTornado.x) * blend;
    renderTornado.z += (targetTornado.z - renderTornado.z) * blend;
    scene.tornadoParts.forEach((part, index) => {
      part.setPosition(renderTornado.x, scene.tornadoPartY[index] ?? scene.tornadoPartY[0] ?? 1, renderTornado.z);
    });

    const cameraPose = chaseCamera.update(renderTornado.x, renderTornado.z, deltaSeconds);
    scene.camera.setPosition(cameraPose.cameraX, CHASE_CAMERA_HEIGHT, cameraPose.cameraZ);
    scene.camera.lookAt(renderTornado.x, CHASE_CAMERA_LOOK_Y, renderTornado.z);
    controls.refresh();

    document.documentElement.dataset.swPlaycanvasVisualStormX = renderTornado.x.toFixed(3);
    document.documentElement.dataset.swPlaycanvasVisualStormZ = renderTornado.z.toFixed(3);
    document.documentElement.dataset.swPlaycanvasCameraX = cameraPose.cameraX.toFixed(3);
    document.documentElement.dataset.swPlaycanvasCameraZ = cameraPose.cameraZ.toFixed(3);
    document.documentElement.dataset.swPlaycanvasCameraForwardX = cameraPose.forwardX.toFixed(4);
    document.documentElement.dataset.swPlaycanvasCameraForwardZ = cameraPose.forwardZ.toFixed(4);
    document.documentElement.dataset.swPlaycanvasCameraHeading = cameraPose.headingRadians.toFixed(4);
    document.documentElement.dataset.swPlaycanvasCameraDesiredHeading = cameraPose.desiredHeadingRadians.toFixed(4);
    document.documentElement.dataset.swPlaycanvasCameraHeadingError = cameraPose.headingErrorRadians.toFixed(4);
    document.documentElement.dataset.swPlaycanvasCameraTravelSpeed = cameraPose.travelSpeed.toFixed(3);
    document.documentElement.dataset.swPlaycanvasCameraTurning = String(cameraPose.turning);

    const now = performance.now();
    if (now - lastAuthorityPoll >= 50) {
      lastAuthorityPoll = now;
      syncSnapshot(authority.snapshot());
    }
  });

  const telemetry: SliceTelemetry = Object.freeze({
    renderer: 'PlayCanvas',
    engineVersion: pc.version,
    engineRevision: pc.revision,
    gameplayAuthority: 'PLAYCANVAS_AUTHORITY_V1',
    roadClearance: ROAD_CLEARANCE,
    tornadoGroundClearance: TORNADO_GROUND_CLEARANCE,
    entityCount: scene.entities.length,
    qaMode,
  });

  document.documentElement.dataset.swPlaycanvasSliceReady = 'true';
  document.documentElement.dataset.swPlaycanvasEngineVersion = pc.version;
  document.documentElement.dataset.swPlaycanvasEngineRevision = pc.revision;
  document.documentElement.dataset.swPlaycanvasGameplayAuthority = 'PLAYCANVAS_AUTHORITY_V1';
  document.documentElement.dataset.swRoadClearance = ROAD_CLEARANCE.toFixed(2);
  document.documentElement.dataset.swTornadoGroundClearance = TORNADO_GROUND_CLEARANCE.toFixed(2);
  document.documentElement.dataset.swRenderer = 'PlayCanvas';
  document.documentElement.dataset.swPlaycanvasAbilityAcceptedCount = '0';
  setStatus('PLAYABLE • one-stick chase camera', 'ready');

  return Object.freeze({
    telemetry,
    getAuthoritySnapshot(): AuthoritySnapshot | null {
      return authority.connected ? authority.snapshot() : null;
    },
    requestAbility,
    reset,
    dispose(): void {
      controls.dispose();
      window.removeEventListener('resize', resize);
      authority.dispose();
      app.destroy();
      canvas.remove();
      clearTelemetry();
      delete document.documentElement.dataset.swPlaycanvasScore;
      delete document.documentElement.dataset.swPlaycanvasCombo;
      delete document.documentElement.dataset.swPlaycanvasRemaining;
      delete document.documentElement.dataset.swPlaycanvasStormX;
      delete document.documentElement.dataset.swPlaycanvasStormZ;
      delete document.documentElement.dataset.swPlaycanvasBarnHealth;
      delete document.documentElement.dataset.swPlaycanvasLastAbility;
      delete document.documentElement.dataset.swPlaycanvasLastAbilityAccepted;
      delete document.documentElement.dataset.swPlaycanvasAbilityAcceptedCount;
      delete document.documentElement.dataset.swPlaycanvasScreenInputX;
      delete document.documentElement.dataset.swPlaycanvasScreenInputY;
      delete document.documentElement.dataset.swPlaycanvasAuthorityInputX;
      delete document.documentElement.dataset.swPlaycanvasAuthorityInputZ;
      delete document.documentElement.dataset.swPlaycanvasVisualStormX;
      delete document.documentElement.dataset.swPlaycanvasVisualStormZ;
      delete document.documentElement.dataset.swPlaycanvasCameraX;
      delete document.documentElement.dataset.swPlaycanvasCameraZ;
      delete document.documentElement.dataset.swPlaycanvasCameraForwardX;
      delete document.documentElement.dataset.swPlaycanvasCameraForwardZ;
      delete document.documentElement.dataset.swPlaycanvasCameraHeading;
      delete document.documentElement.dataset.swPlaycanvasCameraDesiredHeading;
      delete document.documentElement.dataset.swPlaycanvasCameraHeadingError;
      delete document.documentElement.dataset.swPlaycanvasCameraTravelSpeed;
      delete document.documentElement.dataset.swPlaycanvasCameraTurning;
      globalThis.__SW_PLAYCANVAS_SLICE__ = undefined;
    },
  });
}

try {
  globalThis.__SW_PLAYCANVAS_SLICE__ = await bootstrapSlice();
} catch (error) {
  document.documentElement.dataset.swPlaycanvasSliceReady = 'false';
  document.documentElement.dataset.swPlaycanvasSliceError = 'true';
  setStatus('PlayCanvas playable slice failed', 'error');
  console.error('[Severe Weather Warning] PlayCanvas playable production slice failed.', error);
  throw error;
}
