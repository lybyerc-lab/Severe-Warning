// ============================================================================
// [SW:ARCH:PHASE3_INPUT_SYSTEM]
// Typed authority for keyboard and touch movement. Legacy fields remain mirrors
// until the historical runtime is retired, but gameplay reads this snapshot.
// ============================================================================

export interface MovementVector {
  readonly x: number;
  readonly z: number;
  readonly active: boolean;
  readonly source: 'keyboard' | 'touch' | 'none';
}

export interface InputSnapshot {
  readonly movement: MovementVector;
  readonly pressedKeys: readonly string[];
  readonly joystick: Readonly<{ x: number; z: number; active: boolean }>;
  readonly revision: number;
}

export interface InputContractProbe {
  readonly passed: boolean;
  readonly checks: Readonly<Record<string, boolean>>;
  readonly samples: readonly MovementVector[];
}

const LEFT_KEYS = ['KeyA', 'a', 'ArrowLeft'] as const;
const RIGHT_KEYS = ['KeyD', 'd', 'ArrowRight'] as const;
const UP_KEYS = ['KeyW', 'w', 'ArrowUp'] as const;
const DOWN_KEYS = ['KeyS', 's', 'ArrowDown'] as const;

function finite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite, received ${value}.`);
  return value;
}

function clampUnit(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function freezeMovement(x: number, z: number, source: MovementVector['source']): MovementVector {
  return Object.freeze({
    x,
    z,
    active: x !== 0 || z !== 0,
    source,
  });
}

export class InputSystem {
  readonly #pressedKeys = new Set<string>();
  #joystickX = 0;
  #joystickZ = 0;
  #joystickActive = false;
  #revision = 0;

  setKeyboard(code: string, key: string, pressed: boolean): void {
    const normalizedCode = code.trim();
    const normalizedKey = key.trim().toLowerCase();
    let changed = false;
    for (const token of [normalizedCode, normalizedKey]) {
      if (!token) continue;
      if (pressed && !this.#pressedKeys.has(token)) {
        this.#pressedKeys.add(token);
        changed = true;
      } else if (!pressed && this.#pressedKeys.delete(token)) {
        changed = true;
      }
    }
    if (changed) this.#revision += 1;
  }

  setJoystick(x: number, z: number, active: boolean): void {
    const nextX = active ? clampUnit(finite(x, 'Joystick X')) : 0;
    const nextZ = active ? clampUnit(finite(z, 'Joystick Z')) : 0;
    if (
      this.#joystickX === nextX
      && this.#joystickZ === nextZ
      && this.#joystickActive === active
    ) return;
    this.#joystickX = nextX;
    this.#joystickZ = nextZ;
    this.#joystickActive = active;
    this.#revision += 1;
  }

  getMovement(): MovementVector {
    if (this.#joystickActive) {
      return freezeMovement(this.#joystickX, this.#joystickZ, 'touch');
    }

    let x = 0;
    let z = 0;
    if (LEFT_KEYS.some((key) => this.#pressedKeys.has(key))) x -= 1;
    if (RIGHT_KEYS.some((key) => this.#pressedKeys.has(key))) x += 1;
    if (UP_KEYS.some((key) => this.#pressedKeys.has(key))) z -= 1;
    if (DOWN_KEYS.some((key) => this.#pressedKeys.has(key))) z += 1;
    return freezeMovement(x, z, x !== 0 || z !== 0 ? 'keyboard' : 'none');
  }

  getSnapshot(): InputSnapshot {
    return Object.freeze({
      movement: this.getMovement(),
      pressedKeys: Object.freeze([...this.#pressedKeys].sort()),
      joystick: Object.freeze({
        x: this.#joystickX,
        z: this.#joystickZ,
        active: this.#joystickActive,
      }),
      revision: this.#revision,
    });
  }

  reset(): void {
    if (this.#pressedKeys.size > 0 || this.#joystickActive || this.#joystickX !== 0 || this.#joystickZ !== 0) {
      this.#revision += 1;
    }
    this.#pressedKeys.clear();
    this.#joystickX = 0;
    this.#joystickZ = 0;
    this.#joystickActive = false;
  }

  runContractProbe(): InputContractProbe {
    const probe = new InputSystem();
    const samples: MovementVector[] = [];

    probe.setKeyboard('KeyW', 'w', true);
    samples.push(probe.getMovement());
    probe.setKeyboard('KeyD', 'd', true);
    samples.push(probe.getMovement());
    probe.setJoystick(0.45, -0.8, true);
    samples.push(probe.getMovement());
    probe.setJoystick(0, 0, false);
    samples.push(probe.getMovement());
    probe.setKeyboard('KeyW', 'w', false);
    probe.setKeyboard('KeyD', 'd', false);
    samples.push(probe.getMovement());

    const checks = Object.freeze({
      keyboardForward: samples[0]?.x === 0 && samples[0]?.z === -1 && samples[0]?.source === 'keyboard',
      keyboardDiagonalPreserved: samples[1]?.x === 1 && samples[1]?.z === -1,
      touchOverridesKeyboard: samples[2]?.x === 0.45 && samples[2]?.z === -0.8 && samples[2]?.source === 'touch',
      touchReleaseRestoresKeyboard: samples[3]?.x === 1 && samples[3]?.z === -1,
      releaseClearsMovement: samples[4]?.active === false && samples[4]?.source === 'none',
    });

    return Object.freeze({
      passed: Object.values(checks).every(Boolean),
      checks,
      samples: Object.freeze(samples),
    });
  }
}
