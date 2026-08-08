// ============================================================================
// [SW:PLAYCANVAS:INTRO_BEFORE_AUTHORITY]
// The canonical Moo Brew opening owns the page before the gameplay module is
// imported. Because main.ts creates/connects the accepted authority iframe, this
// ordering guarantees cinematic time cannot consume the warning-run clock.
// ============================================================================

import './moo-brew-intro.css';
import {
  createMooBrewIntroController,
  type MooBrewIntroController,
} from './moo-brew-intro';

declare global {
  var __SW_PLAYCANVAS_INTRO__: MooBrewIntroController | undefined;
}

const intro = createMooBrewIntroController();
globalThis.__SW_PLAYCANVAS_INTRO__ = intro;
document.documentElement.dataset.swPlaycanvasIntroGameplayLoaded = 'false';

try {
  await intro.start();
  // Keep this import after the awaited intro gate. Moving it above the gate can
  // start the accepted three-minute authority while the cinematic is visible.
  await import('./main');
  intro.markGameplayLoaded();
} catch (error) {
  intro.markGameplayError();
  console.error('[Severe Weather Warning] Moo Brew intro/gameplay handoff failed.', error);
  throw error;
}
