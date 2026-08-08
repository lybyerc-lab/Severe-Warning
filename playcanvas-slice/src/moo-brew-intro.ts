// ============================================================================
// [SW:PLAYCANVAS:MOO_BREW_INTRO]
// Canonical presentation-only opening for the PlayCanvas production slice.
// It never owns gameplay state and deliberately finishes before main.ts imports
// the accepted gameplay authority.
// ============================================================================

export const MOO_BREW_INTRO_PHASES = Object.freeze([
  'newspaper',
  'farm-reveal',
  'moo-brew-sip',
  'weather-warning',
  'cow-double-take',
  'chicken-scatter',
  'tornado-touchdown',
  'tactical-handoff',
] as const);

export type MooBrewIntroPhase = (typeof MOO_BREW_INTRO_PHASES)[number];

type IntroDecision = 'forced' | 'player' | 'qa-bypass' | 'explicit-bypass' | 'session-bypass';

export interface MooBrewIntroSnapshot {
  readonly version: 'PLAYCANVAS_MOO_BREW_INTRO_V1';
  readonly phases: readonly MooBrewIntroPhase[];
  readonly phase: MooBrewIntroPhase | 'complete' | 'bypassed';
  readonly decision: IntroDecision;
  readonly active: boolean;
  readonly completed: boolean;
  readonly deterministic: boolean;
  readonly gameplayLoaded: boolean;
  readonly gameplayError: boolean;
  readonly visibility: Readonly<{
    newspaper: boolean;
    cow: boolean;
    cup: boolean;
    chickens: boolean;
    tornado: boolean;
  }>;
}

export interface MooBrewIntroController {
  readonly version: 'PLAYCANVAS_MOO_BREW_INTRO_V1';
  readonly phases: readonly MooBrewIntroPhase[];
  start(): Promise<void>;
  setPhase(phase: MooBrewIntroPhase): boolean;
  finish(): void;
  skip(): void;
  markGameplayLoaded(): void;
  markGameplayError(): void;
  getSnapshot(): MooBrewIntroSnapshot;
  dispose(): void;
}

const VERSION = 'PLAYCANVAS_MOO_BREW_INTRO_V1' as const;
const SESSION_KEY = 'severe_weather_moo_brew_intro_seen';
const INTRO_ID = 'playcanvas-moo-brew-intro';
const CAPTION_ID = 'playcanvas-moo-brew-intro-caption';
const SCHEDULE: readonly Readonly<[number, MooBrewIntroPhase]>[] = Object.freeze([
  [900, 'farm-reveal'],
  [1750, 'moo-brew-sip'],
  [2700, 'weather-warning'],
  [3550, 'cow-double-take'],
  [4450, 'chicken-scatter'],
  [5350, 'tornado-touchdown'],
  [6600, 'tactical-handoff'],
]);
const FINISH_AT_MS = 7900;

function safeSessionSeen(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markSessionSeen(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // Session storage can be unavailable in locked-down browser contexts.
  }
}

function captionFor(phase: MooBrewIntroPhase): string {
  const captions: Readonly<Record<MooBrewIntroPhase, string>> = Object.freeze({
    newspaper: 'SPECIAL WEATHER EDITION: THE SKY HAS FILED A COMPLAINT.',
    'farm-reveal': 'HART FARM · 6:42 PM · CONDITIONS: SUSPICIOUSLY CINEMATIC',
    'moo-brew-sip': 'COW 17 ENJOYS A MOO BREW. FOR NOW.',
    'weather-warning': 'RADIO: TORNADO WARNING. MOO BREW: CUP LIDS RECOMMENDED.',
    'cow-double-take': 'COW 17 HAS REVIEWED THE FORECAST AND OBJECTS.',
    'chicken-scatter': 'LOCAL CHICKENS DECLINE FURTHER COMMENT.',
    'tornado-touchdown': 'BARN ROOF STATUS: SEEKING NEW OPPORTUNITIES.',
    'tactical-handoff': 'LIVE CONTROL INCOMING · THE STORM IS YOURS.',
  });
  return captions[phase];
}

function visible(element: Element | null): boolean {
  if (!(element instanceof HTMLElement)) return false;
  const style = getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.05;
}

function createMarkup(): HTMLElement {
  const existing = document.getElementById(INTRO_ID);
  if (existing) return existing;

  const overlay = document.createElement('section');
  overlay.id = INTRO_ID;
  overlay.className = 'pc-intro';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Moo Brew tornado warning opening');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="pc-intro__sky" aria-hidden="true"></div>
    <div class="pc-intro__clouds" aria-hidden="true"></div>
    <div class="pc-intro__ground" aria-hidden="true"></div>
    <div class="pc-intro__barn" aria-hidden="true"><span></span></div>
    <div class="pc-intro__radio" aria-hidden="true">WX</div>
    <div class="pc-intro__cow" data-intro-role="cow" aria-label="Cow 17 drinking Moo Brew">
      <span class="pc-intro__cow-body"></span>
      <span class="pc-intro__cow-head"><i></i><b>17</b></span>
      <span class="pc-intro__cow-leg l1"></span><span class="pc-intro__cow-leg l2"></span>
      <span class="pc-intro__cow-leg l3"></span><span class="pc-intro__cow-leg l4"></span>
    </div>
    <div class="pc-intro__cup" data-intro-role="cup" aria-label="Moo Brew cup"><strong>M</strong><small>MOO BREW</small></div>
    <span class="pc-intro__chicken c1" data-intro-role="chicken" aria-hidden="true"></span>
    <span class="pc-intro__chicken c2" data-intro-role="chicken" aria-hidden="true"></span>
    <span class="pc-intro__chicken c3" data-intro-role="chicken" aria-hidden="true"></span>
    <div class="pc-intro__tornado" data-intro-role="tornado" aria-hidden="true"><span></span></div>
    <article class="pc-intro__newspaper" data-intro-role="newspaper">
      <div>THE HEARTLAND HERALD · SPECIAL WEATHER EDITION</div>
      <h2>TORNADO WARNING</h2>
      <p>Officials advise residents to shelter. Moo Brew advises livestock to remain photogenic.</p>
    </article>
    <div class="pc-intro__brand">SEVERE WEATHER WARNING · MOO BREW WEATHER DESK</div>
    <div class="pc-intro__caption" id="${CAPTION_ID}">SPECIAL WEATHER EDITION</div>
    <button type="button" class="pc-intro__skip">SKIP BROADCAST</button>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

// [SW:PLAYCANVAS:INTRO_QA]
// Dedicated intro QA may select presentation phases, but this module intentionally
// exposes no movement, ability, damage, score, timer, or destruction mutations.
export function createMooBrewIntroController(): MooBrewIntroController {
  const params = new URLSearchParams(globalThis.location?.search ?? '');
  const qaMode = params.get('qa') === '1';
  const explicitIntro = params.get('intro');
  const forced = explicitIntro === '1';
  const explicitBypass = explicitIntro === '0';
  const sessionSeen = safeSessionSeen();
  const decision: IntroDecision = forced
    ? 'forced'
    : explicitBypass
      ? 'explicit-bypass'
      : qaMode
        ? 'qa-bypass'
        : sessionSeen
          ? 'session-bypass'
          : 'player';
  const shouldRun = decision === 'forced' || decision === 'player';
  const deterministic = qaMode && forced;

  let overlay: HTMLElement | null = null;
  let phase: MooBrewIntroSnapshot['phase'] = shouldRun ? 'newspaper' : 'bypassed';
  let active = false;
  let completed = !shouldRun;
  let gameplayLoaded = false;
  let gameplayError = false;
  let resolveStart: (() => void) | null = null;
  const timers: number[] = [];

  const clearTimers = (): void => {
    while (timers.length) window.clearTimeout(timers.pop());
  };

  const publish = (): void => {
    const data = document.documentElement.dataset;
    data.swPlaycanvasIntroVersion = VERSION;
    data.swPlaycanvasIntroPhase = phase;
    data.swPlaycanvasIntroDecision = decision;
    data.swPlaycanvasIntroActive = String(active);
    data.swPlaycanvasIntroCompleted = String(completed);
    data.swPlaycanvasIntroDeterministic = String(deterministic);
    data.swPlaycanvasIntroGameplayLoaded = String(gameplayLoaded);
    data.swPlaycanvasIntroGameplayError = String(gameplayError);
  };

  const setPhase = (next: MooBrewIntroPhase): boolean => {
    if (!MOO_BREW_INTRO_PHASES.includes(next)) return false;
    overlay ??= createMarkup();
    phase = next;
    overlay.dataset.phase = next;
    const caption = document.getElementById(CAPTION_ID);
    if (caption) caption.textContent = captionFor(next);
    publish();
    return true;
  };

  const finish = (): void => {
    if (completed && !active) return;
    clearTimers();
    active = false;
    completed = true;
    phase = 'complete';
    markSessionSeen();
    if (overlay) {
      overlay.classList.remove('active');
      overlay.setAttribute('aria-hidden', 'true');
      delete overlay.dataset.phase;
    }
    publish();
    const resolve = resolveStart;
    resolveStart = null;
    resolve?.();
  };

  const snapshot = (): MooBrewIntroSnapshot => {
    const currentOverlay = overlay ?? document.getElementById(INTRO_ID);
    return Object.freeze({
      version: VERSION,
      phases: MOO_BREW_INTRO_PHASES,
      phase,
      decision,
      active,
      completed,
      deterministic,
      gameplayLoaded,
      gameplayError,
      visibility: Object.freeze({
        newspaper: visible(currentOverlay?.querySelector('[data-intro-role="newspaper"]') ?? null),
        cow: visible(currentOverlay?.querySelector('[data-intro-role="cow"]') ?? null),
        cup: visible(currentOverlay?.querySelector('[data-intro-role="cup"]') ?? null),
        chickens: [...(currentOverlay?.querySelectorAll('[data-intro-role="chicken"]') ?? [])].some(visible),
        tornado: visible(currentOverlay?.querySelector('[data-intro-role="tornado"]') ?? null),
      }),
    });
  };

  const controller: MooBrewIntroController = Object.freeze({
    version: VERSION,
    phases: MOO_BREW_INTRO_PHASES,
    async start(): Promise<void> {
      publish();
      if (!shouldRun) return;

      overlay = createMarkup();
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
      active = true;
      completed = false;
      setPhase('newspaper');
      overlay.querySelector<HTMLButtonElement>('.pc-intro__skip')?.addEventListener('click', finish, { once: true });
      publish();

      if (!deterministic) {
        for (const [delay, scheduledPhase] of SCHEDULE) {
          timers.push(window.setTimeout(() => setPhase(scheduledPhase), delay));
        }
        timers.push(window.setTimeout(finish, FINISH_AT_MS));
      }

      await new Promise<void>((resolve) => {
        resolveStart = resolve;
      });
    },
    setPhase,
    finish,
    skip: finish,
    markGameplayLoaded(): void {
      gameplayLoaded = true;
      publish();
    },
    markGameplayError(): void {
      gameplayError = true;
      publish();
    },
    getSnapshot: snapshot,
    dispose(): void {
      clearTimers();
      resolveStart?.();
      resolveStart = null;
      overlay?.remove();
      overlay = null;
      active = false;
      publish();
    },
  });

  publish();
  return controller;
}
