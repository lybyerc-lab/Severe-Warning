// ============================================================================
// [SW:ARCH:GAME_CONTEXT]
// Shared Phase 3 ownership for clocks, input, abilities, and legacy boundary.
// ============================================================================

import type { AbilitySystem } from '../abilities/ability-system';
import type { GameClocks } from '../core/clocks';
import type { InputSystem } from '../input/input-system';
import type { LegacyRuntimeAdapter } from '../legacy/legacy-runtime-adapter';

export interface BuildIdentity {
  readonly productName: 'Severe Weather Warning';
  readonly version: string;
  readonly label: string;
  readonly renderer: 'Three.js r128';
  readonly architecture: 'modern-shell-v1';
  readonly modernizationPhase: 'phase-3-input-abilities';
}

export interface GameContext {
  readonly build: BuildIdentity;
  readonly clocks: GameClocks;
  readonly input: InputSystem;
  readonly abilities: AbilitySystem;
  readonly legacy: LegacyRuntimeAdapter;
  readonly document: Document;
  readonly window: Window;
}

export function createGameContext(
  legacy: LegacyRuntimeAdapter,
  clocks: GameClocks,
  input: InputSystem,
  abilities: AbilitySystem,
  version: string,
  label: string,
): GameContext {
  return Object.freeze({
    build: Object.freeze({
      productName: 'Severe Weather Warning',
      version,
      label,
      renderer: 'Three.js r128',
      architecture: 'modern-shell-v1',
      modernizationPhase: 'phase-3-input-abilities',
    }),
    clocks,
    input,
    abilities,
    legacy,
    document,
    window,
  });
}
