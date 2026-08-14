// SW-UI-002: owner-playtest correction for constrained mobile landscape.
// Presentation-only. It does not replace selection, launch, gameplay, progression, or results authority.
const SW_UI_002_LANDSCAPE_UNLEASH_MARKER = 'SW_UI_002_LANDSCAPE_UNLEASH_V1';

function swUi002SyncVisualViewport() {
  const height = Math.max(1, Math.round(globalThis.visualViewport?.height || globalThis.innerHeight || 1));
  document.documentElement.style.setProperty('--sw-ui002-visual-height', `${height}px`);
}

function swUi002InstallLandscapeReachability() {
  if (document.getElementById('swUi002LandscapeUnleashStyles')) return;
  const style = document.createElement('style');
  style.id = 'swUi002LandscapeUnleashStyles';
  style.textContent = String.raw`
    @media (orientation: landscape) and (max-height: 720px), (orientation: landscape) and (max-width: 900px) {
      #mainMenu .menu-card.newspaper-front-page {
        box-sizing: border-box;
        max-height: calc(100dvh - 8px);
        max-height: calc(var(--sw-ui002-visual-height, 100dvh) - 8px);
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior-y: contain;
        touch-action: pan-y;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
      }
    }
  `;
  document.head.appendChild(style);
  swUi002SyncVisualViewport();
}

swUi002InstallLandscapeReachability();
globalThis.visualViewport?.addEventListener('resize', swUi002SyncVisualViewport, { passive: true });
globalThis.visualViewport?.addEventListener('scroll', swUi002SyncVisualViewport, { passive: true });
globalThis.addEventListener('orientationchange', swUi002SyncVisualViewport, { passive: true });

globalThis.getLandscapeUnleashQaState = () => {
  const card = document.querySelector('#mainMenu .menu-card.newspaper-front-page');
  const launch = document.getElementById('btnStartMenu');
  const cardStyle = card ? getComputedStyle(card) : null;
  const launchRect = launch?.getBoundingClientRect();
  const visualHeight = globalThis.visualViewport?.height || globalThis.innerHeight || 0;
  return {
    marker: SW_UI_002_LANDSCAPE_UNLEASH_MARKER,
    cardExists: Boolean(card),
    launchExists: Boolean(launch),
    overflowY: cardStyle?.overflowY || '',
    touchAction: cardStyle?.touchAction || '',
    scrollTop: card?.scrollTop || 0,
    scrollHeight: card?.scrollHeight || 0,
    clientHeight: card?.clientHeight || 0,
    visualHeight,
    launchTop: launchRect?.top ?? null,
    launchBottom: launchRect?.bottom ?? null,
    launchWithinVisualViewport: Boolean(launchRect && launchRect.top >= 0 && launchRect.bottom <= visualHeight)
  };
};