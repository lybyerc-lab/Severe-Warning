// ============================================================================
// [SW:QUALITY:001_OWNER_PLAYTEST_RESCUE]
// Bounded player-facing correction layered on canonical Stage 2B Integration.
// No scoring, progression, Storm Site selection, or ability balance authority.
// ============================================================================
const SW_QUALITY_001_MARKER = 'SW_QUALITY_001_OWNER_PLAYTEST_RESCUE_V1';

const swQuality001State = {
  tornadoFrames: 0,
  quitResets: 0,
  lastQuitAt: 0,
};

function swQuality001InstallStyles() {
  if (document.getElementById('swQuality001Styles')) return;
  const style = document.createElement('style');
  style.id = 'swQuality001Styles';
  style.textContent = String.raw`
    /* Keep the newspaper readable by removing low-value density instead of
       shrinking prose into microscopic text on short landscape phones. */
    @media (orientation: landscape) and (max-height: 720px),
           (orientation: landscape) and (pointer: coarse) and (max-width: 1100px) {
      #mainMenu {
        align-items: flex-start;
        box-sizing: border-box;
        overflow: hidden;
        padding: 4px max(4px, env(safe-area-inset-right)) 4px max(4px, env(safe-area-inset-left));
      }
      #mainMenu .menu-card.newspaper-front-page {
        width: min(920px, calc(100vw - 8px));
        max-height: calc(var(--sw-ui002-visual-height, 100dvh) - 8px);
        box-sizing: border-box;
        border-width: 4px;
        padding: 6px 8px 8px;
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior-y: contain;
        touch-action: pan-y;
      }
      #mainMenu .newspaper-front-page::before { inset: 4px; }
      #mainMenu .newspaper-front-page .menu-title {
        margin: 4px 0 2px;
        font-size: clamp(21px, 4.6vw, 34px);
        line-height: .92;
      }
      #mainMenu .newspaper-front-page .menu-sub {
        margin-bottom: 5px;
        padding: 3px 6px;
        font-size: 9px;
        letter-spacing: .09em;
      }
      .newspaper-edition-rail {
        padding: 3px 0;
        font-size: 8px;
        letter-spacing: .06em;
      }
      .newspaper-edition-rail span:nth-child(2) { display: none; }
      .newspaper-lead {
        margin-bottom: 5px;
        padding: 4px 7px;
        font-size: 10.5px;
        line-height: 1.22;
      }
      #mainMenu .newspaper-front-page .storm-select-grid {
        gap: 5px;
        margin: 5px 0;
      }
      #mainMenu .newspaper-front-page .storm-card {
        min-height: 58px;
        padding: 5px 7px;
      }
      #mainMenu .newspaper-front-page .storm-card::before {
        margin-bottom: 2px;
        font-size: 8px;
      }
      #mainMenu .newspaper-front-page .storm-card h3 {
        margin: 1px 0 2px;
        font-size: 15px;
        line-height: 1;
      }
      #mainMenu .newspaper-front-page .storm-card p { display: none; }
      #mainMenu .newspaper-front-page .storm-card .hi-score { font-size: 9px; }
      #mainMenu .newspaper-front-page .menu-options { margin: 5px 0; }
      #mainMenu .newspaper-front-page .opt-btn { font-size: 10px; }
      #mainMenu .newspaper-front-page .start-btn.newspaper-unleash {
        width: min(100%, 390px);
        margin-top: 2px;
        padding: 7px 12px 8px;
        font-size: 20px;
      }
      .newspaper-unleash small { font-size: 8px; }
      .newspaper-legal { display: none; }

      /* Pause must never become another trapped sheet on short landscape. */
      #pauseOverlay {
        align-items: flex-start;
        box-sizing: border-box;
        overflow-y: auto;
        padding: max(5px, env(safe-area-inset-top)) max(5px, env(safe-area-inset-right)) max(5px, env(safe-area-inset-bottom)) max(5px, env(safe-area-inset-left));
      }
      .pause-card {
        box-sizing: border-box;
        width: min(500px, calc(100vw - 12px));
        max-height: calc(100dvh - 10px);
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 10px 12px;
        border-radius: 12px;
      }
      .pause-card h2 { margin-bottom: 5px; font-size: 19px; }
      .pause-stats { margin: 5px 0; padding: 6px 8px; font-size: 10px; line-height: 1.3; }
      .pause-btns { gap: 5px; margin-top: 6px; }
      .pause-btn { min-height: 34px; padding: 7px 12px; font-size: 11px; }
    }
  `;
  document.head.appendChild(style);
}

function swQuality001EnhanceTornadoMotion(dt, now) {
  const root = typeof swVisualHeroSlice6StormRoot !== 'undefined' ? swVisualHeroSlice6StormRoot : null;
  if (!root?.children?.length) return;
  const step = Math.max(0, Math.min(0.1, Number(dt) || 0));
  const seconds = (Number(now) || performance.now()) / 1000;

  // The accepted Slice 6 geometry is intentionally irregular. Keep that
  // silhouette, but make the full visible column read as living circulation.
  root.rotation.y += step * 0.075;
  root.rotation.z = Math.sin(seconds * 0.42) * 0.012;

  root.children.forEach((object, index) => {
    const name = String(object?.name || '');
    const phase = Number(object?.userData?.phase || index * 0.37);

    if (name.startsWith('SWVisualSlice6CondensationStreak')) {
      const direction = index % 2 ? -1 : 1;
      object.rotation.y += step * direction * (0.62 + (index % 4) * 0.08);
      object.rotation.x = Math.sin(seconds * 1.15 + phase) * 0.028;
      object.rotation.z = Math.cos(seconds * 0.94 + phase) * 0.024;
      const pulse = 1 + Math.sin(seconds * 1.8 + phase) * 0.025;
      object.scale.x *= pulse;
      object.scale.z *= (2 - pulse);
      return;
    }

    if (name.startsWith('SWVisualSlice6GroundPull')) {
      const direction = index % 2 ? -1 : 1;
      object.rotation.y += step * direction * 0.95;
      return;
    }

    if (name.startsWith('SWVisualSlice6GroundBurst')) {
      object.rotation.y += step * (index % 2 ? -0.72 : 0.72);
      return;
    }

    if (name.startsWith('SWVisualSlice6EdgeWisp')) {
      object.rotation.y += step * (index % 2 ? -0.46 : 0.46);
    }
  });

  swQuality001State.tornadoFrames += 1;
}

if (typeof swVisualHeroSlice6UpdateStorm === 'function') {
  const swQuality001BaseStormUpdate = swVisualHeroSlice6UpdateStorm;
  swVisualHeroSlice6UpdateStorm = function swQuality001StormUpdate(dt, now) {
    const result = swQuality001BaseStormUpdate.call(this, dt, now);
    swQuality001EnhanceTornadoMotion(dt, now);
    return result;
  };
}

if (typeof quitToMainMenu === 'function') {
  const swQuality001BaseQuitToMainMenu = quitToMainMenu;
  quitToMainMenu = function swQuality001QuitToMainMenu(...args) {
    if (typeof runActive !== 'undefined') runActive = false;
    if (typeof gameStarted !== 'undefined') gameStarted = false;
    if (typeof isPaused !== 'undefined') isPaused = false;
    if (typeof activePullVortex !== 'undefined') activePullVortex = false;
    if (typeof pullVortexTimer !== 'undefined') pullVortexTimer = 0;
    try { globalThis.__SW_PHASE3_INPUT_ABILITY_BRIDGE__?.reset?.(); } catch (_) {}
    try { globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__?.hideIntro?.(); } catch (_) {}
    try { if (typeof stopAllStormAudio === 'function') stopAllStormAudio(); } catch (_) {}
    document.getElementById('resultsOverlay')?.classList.remove('active');
    document.getElementById('pauseOverlay')?.classList.remove('active');
    document.body.classList.remove('moo-level-run');
    const result = swQuality001BaseQuitToMainMenu.apply(this, args);
    if (typeof runActive !== 'undefined') runActive = false;
    swQuality001State.quitResets += 1;
    swQuality001State.lastQuitAt = performance.now();
    return result;
  };
}

swQuality001InstallStyles();

globalThis.getSwQuality001State = function getSwQuality001State() {
  const newspaper = document.querySelector('#mainMenu .menu-card.newspaper-front-page');
  const pauseCard = document.querySelector('.pause-card');
  return Object.freeze({
    marker: SW_QUALITY_001_MARKER,
    tornadoFrames: swQuality001State.tornadoFrames,
    quitResets: swQuality001State.quitResets,
    runActive: typeof runActive !== 'undefined' ? Boolean(runActive) : null,
    gameStarted: typeof gameStarted !== 'undefined' ? Boolean(gameStarted) : null,
    newspaper: newspaper ? {
      clientHeight: newspaper.clientHeight,
      scrollHeight: newspaper.scrollHeight,
      overflowY: getComputedStyle(newspaper).overflowY,
    } : null,
    pause: pauseCard ? {
      clientHeight: pauseCard.clientHeight,
      scrollHeight: pauseCard.scrollHeight,
      overflowY: getComputedStyle(pauseCard).overflowY,
    } : null,
  });
};
// [SW:QUALITY:001_OWNER_PLAYTEST_RESCUE:END]
