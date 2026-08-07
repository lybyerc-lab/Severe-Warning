// ============================================================================
// [SW:PLAYCANVAS:AUTHORITY_CLIENT]
// Same-origin client for the accepted legacy gameplay executor. PlayCanvas
// renders the visible world but does not own movement, abilities, scoring,
// combo, timing, or destruction authority.
// ============================================================================

export type AuthorityAbilitySlot = 'primary' | 'secondary' | 'tertiary';
export type AuthorityAbilitySource = 'keyboard' | 'touch' | 'qa';

export interface AuthoritySnapshot {
  readonly version: 'PLAYCANVAS_AUTHORITY_V1';
  readonly ready: boolean;
  readonly run: Readonly<{
    runActive: boolean;
    paused: boolean;
    remainingSeconds: number;
    stage: number;
  }>;
  readonly storm: Readonly<{
    x: number;
    y: number;
    z: number;
    radius: number;
    efMultiplier: number;
  }>;
  readonly score: Readonly<{
    destructionScore: number;
    baseScore: number;
    comboMultiplier: number;
    maxComboReached: number;
    mirror: unknown;
  }>;
  readonly inputAbilities: unknown;
  readonly cooldowns: Readonly<Record<AuthorityAbilitySlot, number>>;
  readonly barn: Readonly<{
    x: number;
    z: number;
    health: number;
    maxHealth: number;
    stage: number;
    destroyed: boolean;
    roofDetached: boolean;
  }> | null;
  readonly cow17: Readonly<{
    x: number;
    z: number;
    airborne: boolean;
    safe: true;
  }> | null;
  readonly electrical: Readonly<{
    x: number;
    z: number;
    health: number;
    maxHealth: number;
    destroyed: boolean;
    distance: number;
  }> | null;
}

export interface AuthorityAbilityResult {
  readonly accepted: boolean;
  readonly reason: string;
  readonly slot?: AuthorityAbilitySlot;
  readonly source?: AuthorityAbilitySource;
}

interface AuthorityBridge {
  readonly version: 'PLAYCANVAS_AUTHORITY_V1';
  isReady(): boolean;
  preparePlayable(): AuthoritySnapshot;
  setKeyboard(code: string, key: string, pressed: boolean): boolean;
  setJoystick(x: number, z: number, active: boolean): boolean;
  requestAbility(slot: AuthorityAbilitySlot, source?: AuthorityAbilitySource): AuthorityAbilityResult;
  reset(): AuthoritySnapshot;
  getSnapshot(): AuthoritySnapshot;
}

interface AuthorityWindow extends Window {
  __SW_PLAYCANVAS_AUTHORITY__?: AuthorityBridge;
  __SW_MODERN_SHELL_READY__?: boolean;
}

export class PlayCanvasAuthorityClient {
  readonly #frame: HTMLIFrameElement;
  #bridge: AuthorityBridge | null = null;

  constructor() {
    this.#frame = document.createElement('iframe');
    this.#frame.id = 'playcanvas-authority-frame';
    this.#frame.title = 'Severe Weather accepted gameplay authority';
    this.#frame.tabIndex = -1;
    this.#frame.setAttribute('aria-hidden', 'true');
    this.#frame.src = new URL('authority/index.html?playcanvasAuthority=1', document.baseURI).href;
    document.body.append(this.#frame);
  }

  async connect(timeoutMs = 20_000): Promise<AuthoritySnapshot> {
    const startedAt = performance.now();
    while (performance.now() - startedAt < timeoutMs) {
      const authorityWindow = this.#frame.contentWindow as AuthorityWindow | null;
      const bridge = authorityWindow?.__SW_PLAYCANVAS_AUTHORITY__;
      if (
        bridge?.version === 'PLAYCANVAS_AUTHORITY_V1'
        && authorityWindow?.__SW_MODERN_SHELL_READY__ === true
        && bridge.isReady()
      ) {
        this.#bridge = bridge;
        return bridge.preparePlayable();
      }
      await new Promise<void>((resolve) => window.setTimeout(resolve, 50));
    }
    throw new Error(`Accepted gameplay authority did not become ready within ${timeoutMs}ms.`);
  }

  get connected(): boolean {
    return this.#bridge !== null;
  }

  snapshot(): AuthoritySnapshot {
    return this.requireBridge().getSnapshot();
  }

  setKeyboard(code: string, key: string, pressed: boolean): boolean {
    return this.requireBridge().setKeyboard(code, key, pressed);
  }

  setJoystick(x: number, z: number, active: boolean): boolean {
    return this.requireBridge().setJoystick(x, z, active);
  }

  requestAbility(slot: AuthorityAbilitySlot, source: AuthorityAbilitySource): AuthorityAbilityResult {
    return this.requireBridge().requestAbility(slot, source);
  }

  reset(): AuthoritySnapshot {
    return this.requireBridge().reset();
  }

  dispose(): void {
    this.#bridge = null;
    this.#frame.remove();
  }

  private requireBridge(): AuthorityBridge {
    if (!this.#bridge) throw new Error('PlayCanvas gameplay authority is not connected.');
    return this.#bridge;
  }
}
