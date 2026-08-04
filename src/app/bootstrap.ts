// ============================================================================
// [SW:ARCH:BOOTSTRAP]
// Creates the modern shell without taking gameplay ownership from V5.1.
// ============================================================================

import { GameApp } from './game-app';
import { createGameContext } from './game-context';
import { LegacyRuntimeAdapter } from '../legacy/legacy-runtime-adapter';

declare const __SW_BUILD_VERSION__: string;
declare const __SW_BUILD_LABEL__: string;

export interface SevereWeatherModernShell {
  readonly app: GameApp;
  readonly qa: LegacyRuntimeAdapter;
  readonly architecture: 'modern-shell-v1';
}

export async function bootstrapSevereWeather(): Promise<SevereWeatherModernShell> {
  const legacy = new LegacyRuntimeAdapter();
  const context = createGameContext(legacy, __SW_BUILD_VERSION__, __SW_BUILD_LABEL__);
  const app = new GameApp(context);

  await app.initialize();

  return Object.freeze({
    app,
    qa: legacy,
    architecture: 'modern-shell-v1',
  });
}
