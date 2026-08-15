// ============================================================================
// [SW:UI:006_MOBILE_ORIENTATION_TOUCH]
// Owner-playtest mobile presentation correction. Presentation only:
// - landscape is the supported gameplay orientation on touch devices;
// - portrait gameplay is covered by a rotate-device interstitial;
// - touch ability buttons hide keyboard-only binding hints;
// - short landscape viewports keep footer telemetry and controls in bounds.
// No input, camera, ability, score, campaign, destruction, or storm authority.
// ============================================================================
const SW_UI_006_MARKER = 'SW_UI_006_MOBILE_ORIENTATION_TOUCH_V1';

const swUi006State = {
  marker: SW_UI_006_MARKER,
  applyCount: 0,
  touchMode: false,
  portraitGameplay: false,
  rotateGateVisible: false,
  hiddenKeyboardHints: 0,
  suppressedPortraitNodes: 0,
  lastViewport: '',
  lastGameplayActive: false,
};

const swUi006InlineRestore = new WeakMap();
const swUi006PortraitSelectors = ['canvas', '.footer', '.telemetry', '.touch-controls', '#joystickZone'];

function swUi006IsTouchMode() {
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const touchPoints = Number(globalThis.navigator?.maxTouchPoints || 0) > 0;
  return Boolean(coarse || touchPoints);
}

function swUi006GameplayActive() {
  return typeof gameStarted !== 'undefined' ? Boolean(gameStarted) : false;
}

function swUi006EnsureStyles() {
  if (document.getElementById('swUi006Styles')) return;
  const style = document.createElement('style');
  style.id = 'swUi006Styles';
  style.textContent = String.raw`
    #swUi006RotateGate {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 2147483646;
      box-sizing: border-box;
      background:
        radial-gradient(circle at 50% 28%, rgba(68, 91, 111, 0.52), transparent 38%),
        linear-gradient(165deg, #111c28 0%, #07111d 58%, #030812 100%);
      color: #f8fafc;
      align-items: center;
      justify-content: center;
      padding: max(24px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left));
      text-align: center;
      pointer-events: auto;
      touch-action: none;
    }

    body.sw-ui-006-portrait-gameplay #swUi006RotateGate {
      display: flex;
      visibility: visible !important;
      opacity: 1 !important;
    }

    body.sw-ui-006-portrait-gameplay > *:not(#swUi006RotateGate):not(script):not(style),
    body.sw-ui-006-portrait-gameplay canvas,
    body.sw-ui-006-portrait-gameplay .footer,
    body.sw-ui-006-portrait-gameplay .telemetry,
    body.sw-ui-006-portrait-gameplay .touch-controls,
    body.sw-ui-006-portrait-gameplay #joystickZone {
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    #swUi006RotateGate .sw-ui-006-card {
      width: min(330px, 88vw);
      display: grid;
      justify-items: center;
      gap: 14px;
    }

    #swUi006RotateGate .sw-ui-006-phone {
      width: 76px;
      height: 118px;
      border: 5px solid #f4c95d;
      border-radius: 18px;
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.38), inset 0 0 0 2px rgba(255,255,255,0.10);
      transform: rotate(90deg);
      position: relative;
    }

    #swUi006RotateGate .sw-ui-006-phone::after {
      content: '';
      position: absolute;
      width: 18px;
      height: 4px;
      border-radius: 999px;
      background: rgba(248, 250, 252, 0.78);
      left: 50%;
      bottom: 7px;
      transform: translateX(-50%);
    }

    #swUi006RotateGate .sw-ui-006-kicker {
      color: #f4c95d;
      font: 900 12px/1.1 Inter, sans-serif;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    #swUi006RotateGate .sw-ui-006-title {
      margin: 0;
      font: 950 clamp(25px, 8vw, 38px)/0.96 Inter, sans-serif;
      letter-spacing: -0.035em;
      text-transform: uppercase;
    }

    #swUi006RotateGate .sw-ui-006-copy {
      margin: 0;
      max-width: 28ch;
      color: #cbd5e1;
      font: 750 14px/1.45 Inter, sans-serif;
    }

    body.sw-ui-006-touch .touch-controls .sw-ui-006-keyboard-hint {
      display: none !important;
    }

    @media (orientation: landscape) and (max-height: 480px) {
      body.sw-ui-006-touch .panel.key-guide {
        display: none !important;
      }

      body.sw-ui-006-touch .footer {
        gap: 8px !important;
        min-width: 0 !important;
      }

      body.sw-ui-006-touch .telemetry {
        min-width: 0 !important;
        max-width: calc(100vw - 220px) !important;
        gap: 6px !important;
        padding: 4px 7px !important;
        font-size: 9px !important;
        line-height: 1.15 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
      }

      body.sw-ui-006-touch .touch-controls {
        flex: 0 0 auto !important;
        gap: 6px !important;
      }

      body.sw-ui-006-touch .action-btn {
        width: 50px !important;
        height: 50px !important;
        min-width: 50px !important;
        min-height: 50px !important;
        font-size: 9px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function swUi006EnsureRotateGate() {
  let gate = document.getElementById('swUi006RotateGate');
  if (gate) return gate;
  gate = document.createElement('div');
  gate.id = 'swUi006RotateGate';
  gate.setAttribute('role', 'status');
  gate.setAttribute('aria-live', 'polite');
  gate.setAttribute('aria-hidden', 'true');
  gate.innerHTML = `
    <div class="sw-ui-006-card">
      <div class="sw-ui-006-phone" aria-hidden="true"></div>
      <div class="sw-ui-006-kicker">Severe Weather Warning</div>
      <h1 class="sw-ui-006-title">Rotate to Play</h1>
      <p class="sw-ui-006-copy">Turn your phone sideways for the full storm, town, and touch controls.</p>
    </div>
  `;
  document.body.appendChild(gate);
  return gate;
}

function swUi006MarkKeyboardHints() {
  let count = 0;
  ['btnAbility1', 'btnAbility2', 'btnAbility3'].forEach((id) => {
    const button = document.getElementById(id);
    if (!button) return;
    const directSpans = Array.from(button.children).filter((node) => node.tagName === 'SPAN');
    const hint = directSpans[1] || null;
    if (!hint) return;
    hint.classList.add('sw-ui-006-keyboard-hint');
    hint.dataset.swUi006KeyboardHint = '1';
    count += 1;
  });
  swUi006State.hiddenKeyboardHints = count;
}

function swUi006RememberInlineStyle(element) {
  if (swUi006InlineRestore.has(element)) return;
  const snapshot = {};
  ['visibility', 'opacity', 'pointer-events'].forEach((property) => {
    snapshot[property] = {
      value: element.style.getPropertyValue(property),
      priority: element.style.getPropertyPriority(property),
    };
  });
  swUi006InlineRestore.set(element, snapshot);
}

function swUi006RestoreInlineStyle(element) {
  const snapshot = swUi006InlineRestore.get(element);
  if (!snapshot) return;
  for (const [property, entry] of Object.entries(snapshot)) {
    if (entry.value) element.style.setProperty(property, entry.value, entry.priority || '');
    else element.style.removeProperty(property);
  }
  swUi006InlineRestore.delete(element);
}

function swUi006SetPortraitSuppression(gate, active) {
  const nodes = new Set();
  for (const selector of swUi006PortraitSelectors) {
    document.querySelectorAll(selector).forEach((element) => nodes.add(element));
  }

  if (active) {
    gate.style.setProperty('display', 'flex', 'important');
    gate.style.setProperty('visibility', 'visible', 'important');
    gate.style.setProperty('opacity', '1', 'important');
    gate.style.setProperty('pointer-events', 'auto', 'important');
    nodes.forEach((element) => {
      swUi006RememberInlineStyle(element);
      element.style.setProperty('visibility', 'hidden', 'important');
      element.style.setProperty('opacity', '0', 'important');
      element.style.setProperty('pointer-events', 'none', 'important');
    });
  } else {
    gate.style.removeProperty('display');
    gate.style.removeProperty('visibility');
    gate.style.removeProperty('opacity');
    gate.style.removeProperty('pointer-events');
    nodes.forEach(swUi006RestoreInlineStyle);
  }
  swUi006State.suppressedPortraitNodes = active ? nodes.size : 0;
}

function swUi006Apply() {
  if (typeof document === 'undefined' || !document.body) return false;
  swUi006EnsureStyles();
  const gate = swUi006EnsureRotateGate();
  swUi006MarkKeyboardHints();

  const touchMode = swUi006IsTouchMode();
  const gameplayActive = swUi006GameplayActive();
  const portrait = innerHeight > innerWidth;
  const portraitGameplay = touchMode && gameplayActive && portrait;

  document.body.classList.toggle('sw-ui-006-touch', touchMode);
  document.body.classList.toggle('sw-ui-006-portrait-gameplay', portraitGameplay);
  gate.setAttribute('aria-hidden', portraitGameplay ? 'false' : 'true');
  swUi006SetPortraitSuppression(gate, portraitGameplay);

  swUi006State.touchMode = touchMode;
  swUi006State.portraitGameplay = portraitGameplay;
  swUi006State.rotateGateVisible = portraitGameplay;
  swUi006State.lastViewport = `${innerWidth}x${innerHeight}`;
  swUi006State.lastGameplayActive = gameplayActive;
  swUi006State.applyCount += 1;
  return true;
}

swUi006Apply();
window.addEventListener('resize', swUi006Apply, { passive: true });
window.addEventListener('orientationchange', swUi006Apply, { passive: true });

if (!globalThis.__SW_UI_006_INTERVAL__) {
  globalThis.__SW_UI_006_INTERVAL__ = setInterval(swUi006Apply, 250);
}

globalThis.__SW_UI_006_APPLY__ = swUi006Apply;
globalThis.getSwUi006State = function getSwUi006State() {
  const gate = document.getElementById('swUi006RotateGate');
  const hints = ['btnAbility1', 'btnAbility2', 'btnAbility3'].map((id) => {
    const button = document.getElementById(id);
    const directSpans = button ? Array.from(button.children).filter((node) => node.tagName === 'SPAN') : [];
    const hint = directSpans[1] || null;
    return hint ? {
      id,
      text: hint.textContent || '',
      display: getComputedStyle(hint).display,
      marked: hint.dataset.swUi006KeyboardHint === '1',
    } : { id, text: '', display: null, marked: false };
  });
  return Object.freeze({
    ...swUi006State,
    gateFound: Boolean(gate),
    gateDisplay: gate ? getComputedStyle(gate).display : null,
    bodyTouchClass: document.body.classList.contains('sw-ui-006-touch'),
    bodyPortraitClass: document.body.classList.contains('sw-ui-006-portrait-gameplay'),
    hints,
    presentationOnly: true,
  });
};
// [SW:UI:006_MOBILE_ORIENTATION_TOUCH:END]
