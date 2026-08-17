// ============================================================================
// [SW:CIN:004_SINGLE_PLAYABLE_OPENING]
// Retire the legacy flat broadcast from the normal launch path. The retained
// SW-CIN-003 opening stays inside the playable Three.js world and hands directly
// to the accepted run. Presentation/lifecycle routing only; no gameplay writes.
// ============================================================================
const SW_CIN_004_MARKER = 'SW_CIN_004_SINGLE_PLAYABLE_OPENING_V1';

const swCin004State = {
  marker: SW_CIN_004_MARKER,
  syncCount: 0,
  legacyOverlayRemovals: 0,
  openingFramesObserved: 0,
  cinematicFovCorrections: 0,
  skipClicks: 0,
  lastPlayableReason: 'idle',
};

function swCin004RetireFlatOpening() {
  try { identityClearIntroTimers?.(); } catch (_) {}
  if (typeof identityState !== 'undefined') {
    identityState.introActive = false;
    identityState.introPhase = 'retired-by-sw-cin-004';
    identityState.introStartAfter = false;
  }
  const legacy = document.getElementById('mooBrewIntro');
  if (legacy) {
    legacy.remove();
    swCin004State.legacyOverlayRemovals += 1;
  }
}

// The original capture listener remains installed, but this predicate makes it
// fall through to the accepted start button and CIN-003 Three.js opening.
identityShouldInterceptStart = function swCin004NeverInterceptForFlatOpening() {
  return false;
};
identityCreateIntroMarkup = function swCin004DoNotCreateFlatOpening() {
  return null;
};

function swCin004EnsureUi() {
  if (!document.getElementById('swCin004Styles')) {
    const style = document.createElement('style');
    style.id = 'swCin004Styles';
    style.textContent = `
      body.sw-cin-004-opening #mooBrewBroadcastBug { display: none !important; }
      #swCin004SkipOpening {
        display: none;
        position: fixed;
        right: max(12px, env(safe-area-inset-right));
        top: max(12px, env(safe-area-inset-top));
        z-index: 260;
        min-width: 92px;
        min-height: 42px;
        padding: 9px 14px;
        border: 2px solid rgba(253, 224, 71, 0.9);
        border-radius: 999px;
        background: rgba(7, 17, 31, 0.88);
        color: #fff7ed;
        font: 900 10px/1 Inter, sans-serif;
        letter-spacing: 0.11em;
        text-transform: uppercase;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.38);
        touch-action: manipulation;
      }
      body.sw-cin-004-opening.sw-cin-004-can-skip #swCin004SkipOpening { display: block; }
    `;
    document.head.appendChild(style);
  }
  let button = document.getElementById('swCin004SkipOpening');
  if (!button) {
    button = document.createElement('button');
    button.id = 'swCin004SkipOpening';
    button.type = 'button';
    button.textContent = 'Skip intro';
    button.setAttribute('aria-label', 'Skip playable opening');
    button.addEventListener('click', () => {
      const playable = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__;
      if (!playable?.getSnapshot?.().active || !playable?.getSnapshot?.().canSkip) return;
      swCin004State.skipClicks += 1;
      playable.finish('skip-button');
      swCin004Sync();
    });
    document.body.appendChild(button);
  }
  return button;
}

function swCin004Sync() {
  if (typeof document === 'undefined' || !document.body) return false;
  swCin004RetireFlatOpening();
  const button = swCin004EnsureUi();
  const playable = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.() || null;
  const active = Boolean(playable?.active);
  const canSkip = active && Boolean(playable?.canSkip);
  if (active && typeof camera !== 'undefined' && camera && Number(camera.fov) < 48) {
    camera.fov = 48;
    camera.updateProjectionMatrix?.();
    swCin004State.cinematicFovCorrections += 1;
  }
  document.body.classList.toggle('sw-cin-004-opening', active);
  document.body.classList.toggle('sw-cin-004-can-skip', canSkip);
  button.setAttribute('aria-hidden', canSkip ? 'false' : 'true');
  button.tabIndex = canSkip ? 0 : -1;
  swCin004State.lastPlayableReason = String(playable?.reason || 'unavailable');
  swCin004State.syncCount += 1;
  if (active) swCin004State.openingFramesObserved += 1;
  return true;
}

swCin004Sync();
if (!globalThis.__SW_CIN_004_SYNC_INTERVAL__) {
  globalThis.__SW_CIN_004_SYNC_INTERVAL__ = setInterval(swCin004Sync, 100);
}

globalThis.__SW_CIN_004_SYNC__ = swCin004Sync;
globalThis.getSwCin004State = function getSwCin004State() {
  const playable = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.() || null;
  const button = document.getElementById('swCin004SkipOpening');
  return Object.freeze({
    ...swCin004State,
    legacyFlatIntroPresent: Boolean(document.getElementById('mooBrewIntro')),
    playableOpeningActive: Boolean(playable?.active),
    playableOpeningVersion: playable?.version || null,
    normalOpeningPathCount: 1,
    skip: Object.freeze({
      present: Boolean(button),
      visible: button ? getComputedStyle(button).display !== 'none' : false,
      canSkip: Boolean(playable?.canSkip),
    }),
    directHandoff: Object.freeze({
      gameStarted: typeof gameStarted !== 'undefined' && Boolean(gameStarted),
      runActive: typeof runActive !== 'undefined' && Boolean(runActive),
      handoffCount: Number(playable?.handoffCount || 0),
    }),
    presentationOnly: true,
    gameplayCameraAuthorityChanged: false,
  });
};
// [SW:CIN:004_SINGLE_PLAYABLE_OPENING:END]
