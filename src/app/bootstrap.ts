// ============================================================================
// [SW:ARCH:BOOTSTRAP]
// Creates the modern shell and attaches Phase 2 clocks plus Phase 3 controls.
// ============================================================================

import { AbilitySystem } from '../abilities/ability-system';
import { GameClocks } from '../core/clocks';
import { InputSystem } from '../input/input-system';
import { LegacyRuntimeAdapter } from '../legacy/legacy-runtime-adapter';
import { GameApp } from './game-app';
import { createGameContext } from './game-context';

declare const __SW_BUILD_VERSION__: string;
declare const __SW_BUILD_LABEL__: string;

export interface SevereWeatherModernShell {
  readonly app: GameApp;
  readonly clocks: GameClocks;
  readonly input: InputSystem;
  readonly abilities: AbilitySystem;
  readonly qa: LegacyRuntimeAdapter;
  readonly architecture: 'modern-shell-v1';
  readonly modernizationPhase: 'phase-3-input-abilities';
}

export async function bootstrapSevereWeather(): Promise<SevereWeatherModernShell> {
  const legacy = new LegacyRuntimeAdapter();
  const clocks = new GameClocks();
  const input = new InputSystem();
  const abilities = new AbilitySystem();
  const context = createGameContext(
    legacy,
    clocks,
    input,
    abilities,
    __SW_BUILD_VERSION__,
    __SW_BUILD_LABEL__,
  );
  const app = new GameApp(context);

  await app.initialize();

  return Object.freeze({
    app,
    clocks,
    input,
    abilities,
    qa: legacy,
    architecture: 'modern-shell-v1',
    modernizationPhase: 'phase-3-input-abilities',
  });
}
