// ============================================================================
// [SW:ARCH:PHASE6_TOUCH_LIFECYCLE_GUARD]
// Touch and window lifecycle guard. Prevents stuck movement on blur or interruption,
// ensures pointer listeners are safely attached without duplicate multiplication,
// and guarantees clean reset across pause and resume events.
// ============================================================================

export interface TouchStateSnapshot {
  activeTouchesCount: number;
  isInterrupted: boolean;
  lastEventTimestamp: number;
  listenerCount: number;
}

export class TouchLifecycleGuard {
  private activeTouchesCount = 0;
  private isInterrupted = false;
  private lastEventTimestamp = Date.now();
  private attached = false;

  private onBlurHandler = () => this.handleInterruption('window_blur');
  private onVisibilityChangeHandler = () => {
    if (document.hidden) {
      this.handleInterruption('visibility_hidden');
    }
  };

  attach(): void {
    if (this.attached) return;
    window.addEventListener('blur', this.onBlurHandler);
    document.addEventListener('visibilitychange', this.onVisibilityChangeHandler);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;
    window.removeEventListener('blur', this.onBlurHandler);
    document.removeEventListener('visibilitychange', this.onVisibilityChangeHandler);
    this.attached = false;
    this.reset();
  }

  recordTouchStart(): void {
    this.activeTouchesCount += 1;
    this.isInterrupted = false;
    this.lastEventTimestamp = Date.now();
  }

  recordTouchEnd(): void {
    this.activeTouchesCount = Math.max(0, this.activeTouchesCount - 1);
    this.lastEventTimestamp = Date.now();
  }

  handleInterruption(reason = 'unknown'): void {
    this.activeTouchesCount = 0;
    this.isInterrupted = true;
    this.lastEventTimestamp = Date.now();
    console.log(`[SW:INPUT] Touch input reset on interruption: ${reason}`);
  }

  reset(): void {
    this.activeTouchesCount = 0;
    this.isInterrupted = false;
    this.lastEventTimestamp = Date.now();
  }

  getSnapshot(): TouchStateSnapshot {
    return {
      activeTouchesCount: this.activeTouchesCount,
      isInterrupted: this.isInterrupted,
      lastEventTimestamp: this.lastEventTimestamp,
      listenerCount: this.attached ? 2 : 0,
    };
  }
}
