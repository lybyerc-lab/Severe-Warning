export interface Vector2D {
  x: number;
  z: number;
}

export class PlayerInputManager {
  private keys: Record<string, boolean> = {};
  private joystickActive = false;
  private joystickVector: Vector2D = { x: 0, z: 0 };
  private touchOrigin: { x: number; y: number } | null = null;

  pullRequested = false;
  gustRequested = false;
  zapRequested = false;
  pauseRequested = false;
  restartRequested = false;

  private cleanupCallbacks: Array<() => void> = [];

  constructor(private readonly joystickArea: HTMLElement) {
    this.bindKeyboard();
    this.bindTouch();
  }

  getMoveVector(): Vector2D {
    let x = 0;
    let z = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) z += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) z -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;

    if (x !== 0 && z !== 0) {
      const len = Math.hypot(x, z);
      x /= len;
      z /= len;
    }

    if (this.joystickActive) {
      x = this.joystickVector.x;
      z = this.joystickVector.z;
    }

    return { x, z };
  }

  consumePull(): boolean {
    const val = Boolean(this.pullRequested || this.keys['Space'] || this.keys['KeyJ']);
    this.pullRequested = false;
    return val;
  }

  consumeGust(): boolean {
    const val = Boolean(this.gustRequested || this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['KeyK']);
    this.gustRequested = false;
    return val;
  }

  consumeZap(): boolean {
    const val = Boolean(this.zapRequested || this.keys['KeyE'] || this.keys['KeyL']);
    this.zapRequested = false;
    return val;
  }

  dispose(): void {
    for (const cleanup of this.cleanupCallbacks) cleanup();
    this.cleanupCallbacks.length = 0;
  }

  private bindKeyboard(): void {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'SELECT') {
          e.preventDefault();
        }
      }
      this.keys[e.code] = true;
      if (e.code === 'KeyP') this.pauseRequested = true;
      if (e.code === 'KeyR') this.restartRequested = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      this.keys[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    this.cleanupCallbacks.push(
      () => window.removeEventListener('keydown', onKeyDown),
      () => window.removeEventListener('keyup', onKeyUp)
    );
  }

  private bindTouch(): void {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.target instanceof HTMLButtonElement) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      this.touchOrigin = { x: touch.clientX, y: touch.clientY };
      this.joystickActive = true;
      this.updateJoystick(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!this.joystickActive || !this.touchOrigin) return;
      const touch = e.touches[0];
      if (touch) this.updateJoystick(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      this.joystickActive = false;
      this.touchOrigin = null;
      this.joystickVector = { x: 0, z: 0 };
    };

    this.joystickArea.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    this.cleanupCallbacks.push(
      () => this.joystickArea.removeEventListener('touchstart', handleTouchStart),
      () => window.removeEventListener('touchmove', handleTouchMove),
      () => window.removeEventListener('touchend', handleTouchEnd),
      () => window.removeEventListener('touchcancel', handleTouchEnd)
    );
  }

  private updateJoystick(clientX: number, clientY: number): void {
    if (!this.touchOrigin) return;
    const maxRadius = 45;
    const dx = clientX - this.touchOrigin.x;
    const dy = clientY - this.touchOrigin.y;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const normX = Math.cos(angle) * (clampedDist / maxRadius);
    const normY = Math.sin(angle) * (clampedDist / maxRadius);

    this.joystickVector = {
      x: normX,
      z: -normY
    };
  }
}
