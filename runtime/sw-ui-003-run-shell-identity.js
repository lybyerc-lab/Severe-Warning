// ============================================================================
// [SW:UI:RUN_SHELL_IDENTITY_V1]
// SW-UI-003: Presentation-only run shell, pause overlay, and results dispatch
// identity layer. Extends the Americana newsprint art direction to pause and
// post-run debrief while wiring dynamic location metadata across storm sites.
//
// Protected authorities preserved:
// - Pause/resume/restart/quit lifecycle and timing authority
// - Score, grade, combo, objective, and challenge calculation truth
// - Storm site framework and Moo Level unlock/encounter state
// - Target damage, physics, and gameplay controls
// ============================================================================
const SW_UI_003_RUN_SHELL_MARKER = 'SW_UI_003_RUN_SHELL_IDENTITY_V1';

const swUi003State = {
  pauseDecorated: false,
  resultsDecorated: false,
  pauseRefreshes: 0,
  resultsRefreshes: 0,
  lastLocation: null,
};

function swUi003El(id) {
  return document.getElementById(id);
}

function swUi003Text(id, fallback = '') {
  return swUi003El(id)?.textContent?.trim() || fallback;
}

function swUi003SetText(node, value) {
  if (node && node.textContent !== value) {
    node.textContent = value;
  }
}

function swGetActiveLocationProfile() {
  // 1. Check Secret Moo Level
  const mooQa = typeof globalThis.getMooLevelQaState === 'function' ? globalThis.getMooLevelQaState() : null;
  const isMooActive = (typeof isMooLevelActive === 'function' && isMooLevelActive()) ||
                      (typeof mooLevelMode !== 'undefined' && (mooLevelMode === 'moo' || mooLevelMode === 'moo-level')) ||
                      (mooQa && mooQa.mode === 'moo');
  if (isMooActive) {
    return {
      type: 'moo-level',
      siteId: 'moo-level',
      label: 'SECRET BOVINE PASTURE',
      kicker: 'HART FARM · BOVINE SCORE ATTACK',
      districtType: 'SITE',
      headlineFlavor: 'FAIR BOARD DECLARES TOTAL UDDER CHAOS'
    };
  }

  // 2. Check Storm Site Framework
  const siteQa = typeof globalThis.getStormSiteQaState === 'function' ? globalThis.getStormSiteQaState() : null;
  const siteActive = (typeof stormSiteIsActive === 'function' && stormSiteIsActive()) || Boolean(siteQa?.siteActive);
  const activeSiteId = typeof stormSiteSelection !== 'undefined' ? stormSiteSelection : (siteQa?.selectedSiteId || null);

  if (siteActive && activeSiteId && activeSiteId !== 'heartland-home') {
    const def = typeof stormSiteDefinition === 'function' ? stormSiteDefinition(activeSiteId) : null;
    let name = def?.displayName?.toUpperCase();
    if (!name) {
      if (activeSiteId === 'county-fair') name = 'COUNTY FAIR AFTER DARK';
      else if (activeSiteId === 'coastal-boardwalk') name = 'GULLWIND BOARDWALK & PIER';
      else name = 'STORM DESTINATION';
    }
    return {
      type: 'storm-site',
      siteId: activeSiteId,
      label: name,
      kicker: def?.newspaperFlavor || 'AUTHORED STORM DESTINATION',
      districtType: 'SITE',
      headlineFlavor: def?.results?.headline || 'STORM DESTINATION SUSTAINS FRONT-PAGE IMPACT'
    };
  }

  // 3. Check SW Quality 002 Site Profile state
  if (typeof globalThis.getSwQuality002State === 'function') {
    const profile = globalThis.getSwQuality002State()?.siteProfile;
    if (profile === 'county-fair-after-dark') {
      return {
        type: 'storm-site',
        siteId: 'county-fair',
        label: 'COUNTY FAIR AFTER DARK',
        kicker: 'MIDWAY INSURANCE DESK OPENS EARLY',
        districtType: 'SITE',
        headlineFlavor: 'COUNTY FAIR BECOMES A COUNTY AIRFARE'
      };
    }
    if (profile === 'gullwind-storm-coast') {
      return {
        type: 'storm-site',
        siteId: 'coastal-boardwalk',
        label: 'GULLWIND BOARDWALK & PIER',
        kicker: 'PIER ADMISSION NOW INCLUDES A LIFE VEST',
        districtType: 'SITE',
        headlineFlavor: 'GULLWIND PIER RELOCATES TO INTERNATIONAL WATERS'
      };
    }
  }

  // 4. Fallback to Campaign District
  const stage = typeof currentStage !== 'undefined' ? currentStage : 1;
  const dName = (typeof DISTRICTS !== 'undefined' && DISTRICTS[stage]) ? DISTRICTS[stage].name.toUpperCase() : 'PINE RIDGE';
  return {
    type: 'campaign-district',
    stage: stage,
    label: dName,
    kicker: 'LINCOLN COUNTY · HEARTLAND DIVISION',
    districtType: 'DISTRICT',
    headlineFlavor: 'COUNTY WEATHER DESK FILES DAMAGE REPORT'
  };
}

function installSwUi003Styles() {
  if (swUi003El('swUi003RunShellStyles')) return;
  const style = document.createElement('style');
  style.id = 'swUi003RunShellStyles';
  style.textContent = String.raw`
    /* ==========================================================================
       SW-UI-003: RUN SHELL & PAUSE / RESULTS AMERICANA IDENTITY
       ========================================================================== */
    :root {
      --sw-paper-ink: #182233;
      --sw-paper-stock: #f2ead7;
      --sw-paper-age: #d7c7a4;
      --sw-paper-red: #af2723;
      --sw-paper-blue: #234765;
      --sw-paper-gold: #b45309;
      --sw-paper-wood: #263849;
    }

    /* --- PAUSE OVERLAY AMERICANA STYLING --- */
    #pauseOverlay.newspaper-pause-overlay {
      background: rgba(12, 18, 28, 0.88) !important;
      backdrop-filter: blur(12px) grayscale(0.2) !important;
      z-index: 95000 !important;
    }

    .pause-card.newspaper-pause-card {
      position: relative !important;
      width: min(520px, 92vw) !important;
      max-height: calc(100dvh - 16px) !important;
      overflow-y: auto !important;
      box-sizing: border-box !important;
      color: var(--sw-paper-ink) !important;
      border: 7px solid #d8c79f !important;
      border-radius: 3px !important;
      background: repeating-linear-gradient(0deg, rgba(74,55,24,0.045) 0 1px, transparent 1px 4px),
                  radial-gradient(circle at 50% 0%, #fffaf0, var(--sw-paper-stock) 54%, #d9caab) !important;
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.75), inset 0 0 0 2px #263849 !important;
      text-shadow: none !important;
      padding: clamp(10px, 2.2vh, 18px) clamp(12px, 2.8vw, 22px) !important;
      touch-action: manipulation !important;
    }

    .pause-card.newspaper-pause-card::before {
      content: '';
      position: absolute;
      inset: 6px;
      border: 1px solid rgba(24, 34, 51, 0.4);
      pointer-events: none;
    }

    .newspaper-pause-masthead {
      position: relative;
      z-index: 1;
      border-top: 2px solid var(--sw-paper-ink);
      border-bottom: 3px double var(--sw-paper-ink);
      padding: 3px 0;
      color: var(--sw-paper-ink);
      font: 1000 13px/1.1 Georgia, serif;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .newspaper-pause-kicker {
      position: relative;
      z-index: 1;
      margin: 3px 0 6px;
      color: var(--sw-paper-red);
      font: 900 8px/1.15 Inter, sans-serif;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .pause-card.newspaper-pause-card h2 {
      position: relative;
      z-index: 1;
      margin: 2px 0 6px !important;
      color: var(--sw-paper-ink) !important;
      font: 1000 clamp(22px, 4.5vw, 32px)/0.92 Georgia, serif !important;
      letter-spacing: -0.035em !important;
      text-shadow: 1px 1px 0 rgba(175, 39, 35, 0.2) !important;
    }

    .pause-stats.newspaper-pause-stats {
      position: relative;
      z-index: 1;
      margin: 6px 0 10px !important;
      padding: 8px 10px !important;
      border: 1px solid rgba(24, 34, 51, 0.55) !important;
      border-radius: 0 !important;
      background: rgba(255, 255, 255, 0.45) !important;
      color: #263849 !important;
      font: 800 10px/1.4 Inter, sans-serif !important;
      text-align: left !important;
    }

    .pause-stats.newspaper-pause-stats .sw-pause-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 6px;
      padding: 2px 0;
      border-bottom: 1px dashed rgba(24, 34, 51, 0.25);
    }
    .pause-stats.newspaper-pause-stats .sw-pause-row:last-child {
      border-bottom: none;
    }

    .sw-pause-gold { color: var(--sw-paper-gold) !important; font-weight: 1000 !important; }
    .sw-pause-red { color: var(--sw-paper-red) !important; font-weight: 1000 !important; }
    .sw-pause-blue { color: var(--sw-paper-blue) !important; font-weight: 1000 !important; }

    .pause-btns.newspaper-pause-btns {
      position: relative;
      z-index: 1;
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 6px !important;
      margin-top: 8px !important;
    }

    .pause-btns.newspaper-pause-btns .pause-btn {
      min-height: 36px !important;
      padding: 8px 10px !important;
      border: 2px solid #182233 !important;
      border-radius: 0 !important;
      background: var(--sw-paper-wood) !important;
      color: #fff9ec !important;
      font: 900 10px/1.1 Inter, sans-serif !important;
      letter-spacing: 0.08em !important;
      text-transform: uppercase !important;
      box-shadow: 3px 3px 0 #182233 !important;
      cursor: pointer !important;
      pointer-events: auto !important;
      touch-action: manipulation !important;
      transform: none !important;
      transition: transform 0.08s ease, box-shadow 0.08s ease !important;
    }

    .pause-btns.newspaper-pause-btns .pause-btn:hover {
      background: #1b2837 !important;
    }

    .pause-btns.newspaper-pause-btns .pause-btn:active {
      transform: translate(2px, 2px) !important;
      box-shadow: 1px 1px 0 #182233 !important;
    }

    .pause-btns.newspaper-pause-btns .pause-btn.primary {
      grid-column: 1 / -1 !important;
      min-height: 42px !important;
      background: var(--sw-paper-red) !important;
      border: 2px solid #f8eddb !important;
      color: #fff9ec !important;
      font: 1000 16px/1 Georgia, serif !important;
      letter-spacing: 0.04em !important;
      box-shadow: 4px 4px 0 #182233 !important;
    }

    .pause-btns.newspaper-pause-btns .pause-btn.primary:hover {
      background: #8f1f1c !important;
    }

    .pause-btns.newspaper-pause-btns .pause-btn:last-child {
      grid-column: 1 / -1 !important;
      background: #1b2837 !important;
    }

    /* --- RESULTS DISPATCH & INK STAMP OVERHAUL --- */
    #resultsOverlay.newspaper-results-overlay {
      background: rgba(12, 18, 28, 0.9) !important;
      backdrop-filter: blur(12px) grayscale(0.2) !important;
      z-index: 96000 !important;
    }

    #resultsOverlay .newspaper-results-card .grade-stamp {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      justify-self: center !important;
      align-self: center !important;
      width: auto !important;
      min-width: 52px !important;
      max-width: fit-content !important;
      margin: 4px auto 6px !important;
      padding: 3px 18px !important;
      border: 3px solid var(--sw-paper-red) !important;
      border-radius: 4px !important;
      color: var(--sw-paper-red) !important;
      background: rgba(175, 39, 35, 0.08) !important;
      font: 1000 clamp(22px, 4.8vw, 36px)/1 Georgia, serif !important;
      letter-spacing: 0.08em !important;
      text-transform: uppercase !important;
      transform: rotate(-3.5deg) !important;
      box-shadow: inset 0 0 0 1px rgba(175, 39, 35, 0.35), 2px 2px 0 rgba(24, 34, 51, 0.18) !important;
      text-shadow: 0 0 1px rgba(175, 39, 35, 0.5) !important;
    }

    .newspaper-results-breakdown-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 5px;
      margin: 6px 0;
      text-align: left;
    }

    .newspaper-results-breakdown-card {
      padding: 5px 7px;
      border: 1px solid rgba(24, 34, 51, 0.45);
      background: rgba(255, 255, 255, 0.38);
      font: 800 8.5px/1.2 Inter, sans-serif;
      color: #24374a;
    }

    .newspaper-results-breakdown-card strong {
      display: block;
      color: #516170;
      font: 900 7.5px/1 Inter, sans-serif;
      letter-spacing: 0.1em;
      margin-bottom: 2px;
    }

    .newspaper-results-breakdown-card b {
      color: var(--sw-paper-ink);
      font: 1000 11px/1 Georgia, serif;
    }

    /* --- MOBILE LANDSCAPE CONSTRAINED ADJUSTMENTS --- */
    @media (orientation: landscape) and (max-height: 540px) {
      .pause-card.newspaper-pause-card {
        width: min(480px, 94vw) !important;
        padding: 6px 10px 8px !important;
      }
      .newspaper-pause-masthead { font-size: 10px !important; padding: 2px 0 !important; }
      .newspaper-pause-kicker { font-size: 7px !important; margin: 1px 0 3px !important; }
      .pause-card.newspaper-pause-card h2 { font-size: 18px !important; margin: 1px 0 3px !important; }
      .pause-stats.newspaper-pause-stats { margin: 3px 0 5px !important; padding: 4px 7px !important; font-size: 8.5px !important; }
      .pause-btns.newspaper-pause-btns { gap: 4px !important; margin-top: 4px !important; }
      .pause-btns.newspaper-pause-btns .pause-btn { min-height: 28px !important; padding: 4px 6px !important; font-size: 8.5px !important; }
      .pause-btns.newspaper-pause-btns .pause-btn.primary { min-height: 32px !important; font-size: 12px !important; }
      
      #resultsOverlay .newspaper-results-card .grade-stamp {
        font-size: 20px !important;
        padding: 2px 10px !important;
        margin: 2px auto 4px !important;
      }
      .newspaper-results-breakdown-grid { gap: 3px; margin: 3px 0; }
      .newspaper-results-breakdown-card { padding: 3px 5px; font-size: 7.5px; }
      .newspaper-results-breakdown-card b { font-size: 9.5px; }
    }
  `;
  document.head.appendChild(style);
}

function decoratePauseOverlay() {
  const overlay = swUi003El('pauseOverlay');
  const card = overlay?.querySelector('.pause-card');
  if (!overlay || !card) return false;

  overlay.classList.add('newspaper-pause-overlay');
  card.classList.add('newspaper-pause-card');

  if (!swUi003El('newspaperPauseMasthead')) {
    const masthead = document.createElement('div');
    masthead.id = 'newspaperPauseMasthead';
    masthead.className = 'newspaper-pause-masthead';
    masthead.textContent = 'SEVERE WEATHER WARNING · RUN DISPATCH';

    const kicker = document.createElement('div');
    kicker.id = 'newspaperPauseKicker';
    kicker.className = 'newspaper-pause-kicker';
    kicker.textContent = 'EMERGENCY BROADCAST HALTED · RADAR MONITORS ACTIVE';

    const title = card.querySelector('h2');
    card.insertBefore(masthead, title || card.firstChild);
    card.insertBefore(kicker, title || card.firstChild);
  }

  const stats = card.querySelector('.pause-stats');
  if (stats) {
    stats.classList.add('newspaper-pause-stats');
  }

  const btns = card.querySelector('.pause-btns');
  if (btns) {
    btns.classList.add('newspaper-pause-btns');
  }

  swUi003State.pauseDecorated = true;
  return true;
}

function refreshPauseOverlayStats() {
  decoratePauseOverlay();
  const statsBox = swUi003El('pauseStatsBox');
  if (!statsBox) return;

  const loc = swGetActiveLocationProfile();
  swUi003State.lastLocation = loc;

  const mins = Math.floor((typeof runTimeRemaining !== 'undefined' ? runTimeRemaining : 180) / 60);
  const secs = Math.floor((typeof runTimeRemaining !== 'undefined' ? runTimeRemaining : 180) % 60).toString().padStart(2, '0');
  const currentScore = Math.round(typeof destructionScore !== 'undefined' ? destructionScore : 0);
  const rating = typeof efRating !== 'undefined' ? efRating : 'EF-0';

  statsBox.innerHTML = `
    <div class="sw-pause-row">
      <span>CURRENT SCORE:</span>
      <span><b class="sw-pause-gold">${currentScore}</b> | RATING: <b class="sw-pause-red">${rating}</b></span>
    </div>
    <div class="sw-pause-row">
      <span>TIME REMAINING:</span>
      <b>${mins}:${secs}</b>
    </div>
    <div class="sw-pause-row" id="swPauseLocationRow">
      <span>${loc.districtType}:</span>
      <b class="sw-pause-blue" id="swPauseLocationVal">${loc.label}</b>
    </div>
  `;

  // Update Kicker with site context if active
  const kicker = swUi003El('newspaperPauseKicker');
  if (kicker) {
    kicker.textContent = loc.kicker;
  }

  swUi003State.pauseRefreshes += 1;
}

function decorateResultsOverlayRunShell() {
  const overlay = swUi003El('resultsOverlay');
  const card = overlay?.querySelector('.results-card');
  if (!overlay || !card) return false;

  overlay.classList.add('newspaper-results-overlay');
  card.classList.add('newspaper-results-card');

  // Ensure structured breakdown exists if not already present
  if (!swUi003El('newspaperBreakdownGrid')) {
    const grid = document.createElement('div');
    grid.id = 'newspaperBreakdownGrid';
    grid.className = 'newspaper-results-breakdown-grid';
    grid.innerHTML = `
      <div class="newspaper-results-breakdown-card">
        <strong>CATASTROPHE DESK</strong>
        BLOCKS: <b id="swResBreakdownBlocks">0</b> | CHAINS: <b id="swResBreakdownChains">0</b>
      </div>
      <div class="newspaper-results-breakdown-card">
        <strong>INFRASTRUCTURE DESK</strong>
        GRID: <b id="swResBreakdownSubstations">0</b> | LANDMARKS: <b id="swResBreakdownLandmarks">0</b>
      </div>
      <div class="newspaper-results-breakdown-card">
        <strong>MEDIA & WITNESSES</strong>
        MOMENTS: <b id="swResBreakdownMoments">0</b> | FOOTAGE: <b id="swResBreakdownFootage">+0</b>
      </div>
      <div class="newspaper-results-breakdown-card">
        <strong>FIELD CLASSIFICATION</strong>
        <b id="swResBreakdownLocation">LINCOLN COUNTY</b>
      </div>
    `;

    const stats = card.querySelector('.results-stats');
    if (stats) {
      stats.insertAdjacentElement('afterend', grid);
    } else {
      card.appendChild(grid);
    }
  }

  swUi003State.resultsDecorated = true;
  return true;
}

function refreshResultsOverlayRunShell() {
  decorateResultsOverlayRunShell();
  const loc = swGetActiveLocationProfile();

  // Sync structured breakdown
  swUi003SetText(swUi003El('swResBreakdownBlocks'), swUi003Text('resBlocks', '0'));
  swUi003SetText(swUi003El('swResBreakdownChains'), swUi003Text('resChains', '0'));
  swUi003SetText(swUi003El('swResBreakdownSubstations'), swUi003Text('resSubstations', '0/3'));
  swUi003SetText(swUi003El('swResBreakdownLandmarks'), swUi003Text('resLandmarks', '0/2'));
  swUi003SetText(swUi003El('swResBreakdownMoments'), swUi003Text('resMediaMoments', '0'));
  swUi003SetText(swUi003El('swResBreakdownFootage'), swUi003Text('resFootageBonus', '+0'));
  swUi003SetText(swUi003El('swResBreakdownLocation'), `${loc.districtType}: ${loc.label}`);

  swUi003State.resultsRefreshes += 1;
}

function installSwUi003RunShell() {
  installSwUi003Styles();
  decoratePauseOverlay();
  decorateResultsOverlayRunShell();

  // Intercept pause toggle helper and togglePauseMenu to refresh stats immediately
  if (typeof globalThis.setPauseOverlayActive === 'function') {
    const originalSetPauseOverlayActive = globalThis.setPauseOverlayActive;
    globalThis.setPauseOverlayActive = function swUi003SetPauseOverlayActive(active) {
      originalSetPauseOverlayActive.apply(this, arguments);
      if (active) {
        refreshPauseOverlayStats();
      }
    };
  }

  if (typeof globalThis.togglePauseMenu === 'function') {
    const originalTogglePauseMenu = globalThis.togglePauseMenu;
    globalThis.togglePauseMenu = function swUi003TogglePauseMenu() {
      originalTogglePauseMenu.apply(this, arguments);
      if (typeof isPaused !== 'undefined' && isPaused) {
        refreshPauseOverlayStats();
      }
    };
  }

  // Periodic watchdog to keep pause and results presentation synchronized
  const pauseOverlay = swUi003El('pauseOverlay');
  const resultsOverlay = swUi003El('resultsOverlay');

  setInterval(() => {
    if (pauseOverlay && pauseOverlay.classList.contains('active')) {
      refreshPauseOverlayStats();
    }
    if (resultsOverlay && resultsOverlay.classList.contains('active')) {
      refreshResultsOverlayRunShell();
    }
  }, 200);
}

installSwUi003RunShell();

globalThis.getSwUi003State = function getSwUi003State() {
  const pauseOverlay = swUi003El('pauseOverlay');
  const resultsOverlay = swUi003El('resultsOverlay');
  const activeLocation = swGetActiveLocationProfile();

  return Object.freeze({
    marker: 'SW_UI_003_RUN_SHELL_IDENTITY_V1',
    pauseConfigured: Boolean(pauseOverlay?.classList.contains('newspaper-pause-overlay')),
    pauseActive: Boolean(pauseOverlay?.classList.contains('active')),
    resultsConfigured: Boolean(resultsOverlay?.classList.contains('newspaper-results-overlay')),
    resultsActive: Boolean(resultsOverlay?.classList.contains('active')),
    activeLocation,
    pauseLocationText: swUi003Text('swPauseLocationVal'),
    pauseKickerText: swUi003Text('newspaperPauseKicker'),
    resultsLocationText: swUi003Text('swResBreakdownLocation'),
    refreshes: { ...swUi003State }
  });
};
