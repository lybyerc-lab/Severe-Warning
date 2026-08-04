// ============================================================================
// [SW:ARCH:BOOTSTRAP]
// Creates the modern shell and attaches the Phase 2 clock authority.
// ============================================================================

import { GameApp } from './game-app';
import { createGameContext } from './game-context';
import { GameClocks } from '../core/clocks';
import { LegacyRuntimeAdapter } from '../legacy/legacy-runtime-adapter';

declare const __SW_BUILD_VERSION__: string;
declare const __SW_BUILD_LABEL__: string;

export interface SevereWeatherModernShell {
  readonly app: GameApp;
  readonly clocks: GameClocks;
  readonly qa: LegacyRuntimeAdapter;
  readonly architecture: 'modern-shell-v1';
  readonly modernizationPhase: 'phase-2-clocks';
}

export async function bootstrapSevereWeather(): Promise<SevereWeatherModernShell> {
  const legacy = new LegacyRuntimeAdapter();
  const clocks = new GameClocks();
  const context = createGameContext(legacy, clocks, __SW_BUILD_VERSION__, __SW_BUILD_LABEL__);
  const app = new GameApp(context);

  await app.initialize();

  return Object.freeze({
    app,
    clocks,
    qa: legacy,
    architecture: 'modern-shell-v1',
    modernizationPhase: 'phase-2-clocks',
  });
}
