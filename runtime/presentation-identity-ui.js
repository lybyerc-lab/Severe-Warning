function identityCreateIntroMarkup() {
  if (document.getElementById('mooBrewIntro')) return;
  const overlay = document.createElement('section');
  overlay.id = 'mooBrewIntro';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Moo Brew tornado warning opening');
  overlay.innerHTML = `
    <div class="identity-intro-sky"></div>
    <div class="identity-intro-clouds"></div>
    <div class="identity-intro-ground"></div>
    <div class="identity-intro-barn"></div>
    <div class="identity-intro-radio"></div>
    <div class="identity-intro-cow" aria-label="Cow 17 drinking Moo Brew">
      <div class="identity-intro-cow-body"></div>
      <div class="identity-intro-cow-head"></div>
      <span class="identity-intro-cow-leg l1"></span><span class="identity-intro-cow-leg l2"></span>
      <span class="identity-intro-cow-leg l3"></span><span class="identity-intro-cow-leg l4"></span>
    </div>
    <div class="identity-intro-cup" aria-label="Moo Brew cup">M</div>
    <span class="identity-intro-chicken c1"></span><span class="identity-intro-chicken c2"></span><span class="identity-intro-chicken c3"></span>
    <div class="identity-intro-tornado"></div>
    <article class="identity-intro-newspaper">
      <div class="identity-intro-newspaper-kicker">THE HEARTLAND HERALD · SPECIAL WEATHER EDITION</div>
      <h2>TORNADO WARNING</h2>
      <p>Officials advise residents to shelter. Moo Brew advises livestock to remain photogenic.</p>
    </article>
    <div class="identity-intro-brand">SEVERE WEATHER WARNING · PRESENTED WITH QUESTIONABLE CONFIDENCE BY MOO BREW</div>
    <div class="identity-intro-caption" id="mooBrewIntroCaption">SPECIAL WEATHER EDITION</div>
    <button type="button" class="identity-intro-skip" id="mooBrewIntroSkip">SKIP BROADCAST</button>
  `;
  document.body.appendChild(overlay);
  document.getElementById('mooBrewIntroSkip')?.addEventListener('click', () => identityFinishIntro(true));
}

function identityCreateBroadcastBug() {
  if (document.getElementById('mooBrewBroadcastBug')) return;
  const bug = document.createElement('div');
  bug.id = 'mooBrewBroadcastBug';
  bug.textContent = 'MOO BREW · OFFICIAL COW-CAM REFRESHMENT';
  document.body.appendChild(bug);
}

function identityConfigureResultsCard() {
  const card = document.querySelector('#resultsOverlay .results-card');
  if (!card || card.classList.contains('identity-results-card')) return false;
  card.classList.add('identity-results-card');
  const actions = card.querySelector('.results-actions');
  const title = card.querySelector('h2');
  const grade = card.querySelector('.grade-stamp');
  const scroll = document.createElement('div');
  scroll.className = 'identity-results-scroll';
  const moveCandidates = [...card.children].filter((child) => child !== title && child !== grade && child !== actions);
  moveCandidates.forEach((child) => scroll.appendChild(child));
  if (actions) card.insertBefore(scroll, actions);
  else card.appendChild(scroll);

  const sponsor = document.createElement('div');
  sponsor.className = 'moo-brew-score-sponsor';
  sponsor.innerHTML = '<span class="moo-brew-score-cup" aria-hidden="true"></span><span><strong>MOO BREW POST-STORM HYDRATION DESK</strong><small>All scores final. All cattle statements pending legal review.</small></span>';
  scroll.appendChild(sponsor);
  identityState.resultsConfigured = true;
  return true;
}

function identityClearIntroTimers() {
  identityState.introTimers.forEach((timer) => clearTimeout(timer));
  identityState.introTimers = [];
}

function identityIntroCaption(phase) {
  const captions = {
    newspaper: 'SPECIAL WEATHER EDITION: THE SKY HAS FILED A COMPLAINT.',
    'farm-reveal': 'HART FARM · 6:42 PM · CONDITIONS: SUSPICIOUSLY_CINEMATIC',
    'moo-brew-sip': 'COW 17 ENJOYS A MOO BREW. FOR NOW.',
    'weather-warning': 'RADIO: TORNADO WARNING. MOO BREW: CUP LIDS RECOMMENDED.',
    'cow-double-take': 'COW 17 HAS REVIEWED THE FORECAST AND OBJECTS.',
    'chicken-scatter': 'LOCAL CHICKENS DECLINE FURTHER COMMENT.',
    'tornado-touchdown': 'BARN ROOF STATUS: SEEKING NEW OPPORTUNITIES.',
    'tactical-handoff': 'LIVE CONTROL INCOMING · THE STORM IS YOURS.',
  };
  return captions[phase] || 'MOO BREW WEATHER NETWORK';
}

function identitySetIntroPhase(phase) {
  if (!PRESENTATION_IDENTITY_INTRO_PHASES.includes(phase)) return false;
  const overlay = document.getElementById('mooBrewIntro');
  if (!overlay) return false;
  overlay.dataset.phase = phase;
  identityState.introPhase = phase;
  const caption = document.getElementById('mooBrewIntroCaption');
  if (caption) caption.textContent = identityIntroCaption(phase);
  return true;
}

function identityFinishIntro(startGame = identityState.introStartAfter) {
  identityClearIntroTimers();
  const overlay = document.getElementById('mooBrewIntro');
  if (overlay) {
    overlay.classList.remove('active');
    overlay.removeAttribute('data-phase');
  }
  identityState.introActive = false;
  identityState.introPhase = 'complete';
  try { sessionStorage.setItem('severe_weather_moo_brew_intro_seen', '1'); } catch (_) {}
  if (startGame) {
    const startButton = document.getElementById('btnStartMenu');
    if (startButton) {
      identityState.startBypass = true;
      startButton.click();
      identityState.startBypass = false;
    }
  }
}

function identityLaunchIntro(options = {}) {
  identityCreateIntroMarkup();
  identityClearIntroTimers();
  const overlay = document.getElementById('mooBrewIntro');
  if (!overlay) return false;
  identityState.introActive = true;
  identityState.introStartAfter = options.startAfter !== false;
  overlay.classList.add('active');
  identitySetIntroPhase(options.phase || 'newspaper');
  if (options.deterministic === true) return true;

  const schedule = [
    [900, 'farm-reveal'],
    [1750, 'moo-brew-sip'],
    [2700, 'weather-warning'],
    [3550, 'cow-double-take'],
    [4450, 'chicken-scatter'],
    [5350, 'tornado-touchdown'],
    [6600, 'tactical-handoff'],
  ];
  schedule.forEach(([delay, phase]) => {
    identityState.introTimers.push(setTimeout(() => identitySetIntroPhase(phase), delay));
  });
  identityState.introTimers.push(setTimeout(() => identityFinishIntro(identityState.introStartAfter), 7900));
  return true;
}

function identityShouldInterceptStart() {
  const params = new URLSearchParams(globalThis.location?.search || '');
  if (params.get('intro') === '0') return false;
  if (params.get('intro') === '1') return true;
  if (params.get('qa') === '1' || params.get('bot') === 'true') return false;
  try {
    if (sessionStorage.getItem('severe_weather_moo_brew_intro_seen') === '1') return false;
  } catch (_) {}
  return true;
}

function identityInstallStartIntercept() {
  if (identityState.startInterceptInstalled) return;
  const startButton = document.getElementById('btnStartMenu');
  if (!startButton) return;
  startButton.addEventListener('click', (event) => {
    if (identityState.startBypass || identityState.introActive || !identityShouldInterceptStart()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    identityLaunchIntro({ startAfter: true });
  }, true);
  identityState.startInterceptInstalled = true;
}

function identityResultsBounds() {
  const overlay = document.getElementById('resultsOverlay');
  const card = overlay?.querySelector('.results-card');
  const actions = card?.querySelector('.results-actions');
  const title = card?.querySelector('h2');
  if (!overlay || !card) return null;
  const cardRect = card.getBoundingClientRect();
  const actionsRect = actions?.getBoundingClientRect() || null;
  const titleRect = title?.getBoundingClientRect() || null;
  const tolerance = 1;
  return Object.freeze({
    viewport: Object.freeze({ width: innerWidth, height: innerHeight }),
    card: Object.freeze({ top: cardRect.top, bottom: cardRect.bottom, left: cardRect.left, right: cardRect.height }),
    titleVisible: Boolean(titleRect && titleRect.top >= -tolerance && titleRect.bottom <= innerHeight + tolerance),
    actionsVisible: Boolean(actionsRect && actionsRect.top >= -tolerance && actionsRect.bottom <= innerHeight + tolerance),
    withinViewport: cardRect.top >= -tolerance && cardRect.bottom <= innerHeight + tolerance && cardRect.left >= -tolerance && cardRect.right <= innerWidth + tolerance,
    scrollRegionCount: card.querySelectorAll('.identity-results-scroll').length,
  });
}

function identityShowResultsForQa() {
  identityConfigureResultsCard();
  const overlay = document.getElementById('resultsOverlay');
  if (!overlay) return false;
  if (!identityState.resultPreviewActive) {
    overlay.dataset.identityPreviousStyle = overlay.getAttribute('style') || '';
  }
  overlay.style.display = 'flex';
  overlay.style.visibility = 'visible';
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'none';
  identityState.resultPreviewActive = true;
  return true;
}

function identityHideResultsForQa() {
  const overlay = document.getElementById('resultsOverlay');
  if (!overlay || !identityState.resultPreviewActive) return false;
  const previous = overlay.dataset.identityPreviousStyle || '';
  if (previous) overlay.setAttribute('style', previous);
  else overlay.removeAttribute('style');
  delete overlay.dataset.identityPreviousStyle;
  identityState.resultPreviewActive = false;
  return true;
}

function identityCowSnapshot() {
  const enhanced = animals.filter((cow) => cow?.mesh?.userData?.mooBrewEnhanced);
  const cow17 = enhanced.find((cow) => Number(cow.id) === 17);
  const rig = cow17?.mesh?.userData?.mooBrewCowRig || null;
  return Object.freeze({
    totalAnimals: animals.length,
    enhancedCount: enhanced.length,
    enhancedIds: Object.freeze(enhanced.map((cow) => Number(cow.id))),
    cow17Present: Boolean(cow17),
    cow17Parts: rig ? rig.root.children.length + rig.headPivot.children.length + rig.legs.reduce((sum, leg) => sum + leg.children.length, 0) : 0,
    cow17HasHead: Boolean(rig?.head),
    cow17HasFourLegs: rig?.legs?.length === 4,
    cow17HasTag: Boolean(rig?.tag),
  });
}

function identityWorldSnapshot() {
  return Object.freeze({
    mooBrewPropCount: identityWorldProps.length,
    worldBuilds: identityState.mooBrewWorldBuilds,
    propNames: Object.freeze(identityWorldProps.map((prop) => prop.children.map((child) => child.name).filter(Boolean)).flat()),
  });
}

function identityIntroSnapshot() {
  const overlay = document.getElementById('mooBrewIntro');
  const cup = overlay?.querySelector('.identity-intro-cup');
  const cow = overlay?.querySelector('.identity-intro-cow');
  const tornado = overlay?.querySelector('.identity-intro-tornado');
  const newspaper = overlay?.querySelector('.identity-intro-newspaper');
  const visibility = (element) => {
    if (!element) return false;
    const style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0.05;
  };
  return Object.freeze({
    active: Boolean(overlay?.classList.contains('active')),
    phase: identityState.introPhase,
    cowVisible: visibility(cow),
    cupVisible: visibility(cup),
    tornadoVisible: visibility(tornado),
    newspaperVisible: visibility(newspaper),
  });
}

function identityInstallPresentationLayer() {
  identityInstallStyle();
  identityCreateIntroMarkup();
  identityCreateBroadcastBug();
  identityConfigureResultsCard();
  identityInstallStartIntercept();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', identityInstallPresentationLayer, { once: true });
} else {
  identityInstallPresentationLayer();
}

window.addEventListener('resize', () => identityConfigureResultsCard(), { passive: true });

globalThis.__SW_PRESENTATION_IDENTITY_BRIDGE__ = Object.freeze({
  version: PRESENTATION_IDENTITY_MOO_BREW_VERSION,
  phases: PRESENTATION_IDENTITY_INTRO_PHASES,
  showIntro(options = {}) { return identityLaunchIntro(options); },
  setIntroPhase(phase) { return identitySetIntroPhase(phase); },
  hideIntro() { identityFinishIntro(false); return true; },
  skipIntro(startGame = false) { identityFinishIntro(Boolean(startGame)); return true; },
  showResultsForQa() { return identityShowResultsForQa(); },
  hideResultsForQa() { return identityHideResultsForQa(); },
  getSnapshot() {
    return Object.freeze({
      version: PRESENTATION_IDENTITY_MOO_BREW_VERSION,
      intro: identityIntroSnapshot(),
      results: identityResultsBounds(),
      cows: identityCowSnapshot(),
      world: identityWorldSnapshot(),
      state: Object.freeze({
        resultsConfigured: identityState.resultsConfigured,
        startInterceptInstalled: identityState.startInterceptInstalled,
        cowDecorations: identityState.cowDecorations,
      }),
    });
  },
});
// [SW:PRESENTATION:MOO_BREW_IDENTITY:END]
