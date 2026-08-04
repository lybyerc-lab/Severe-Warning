// ============================================================================
// [SW:ARCH:GAME_CONTEXT]
// Deliberately narrow in Phase 1. Legacy state remains behind the adapter.
// ============================================================================

import type { LegacyRuntimeAdapter } from '../legacy/legacy-runtime-adapter';

export interface BuildIdentity {
  readonly productName: 'Severe Weather Warning';
  readonly version: string;
  readonly label: string;
  readonly renderer: 'Three.js r128';
  readonly architecture: 'modern-shell-v1';
}

export interface GameContext {
  readonly build: BuildIdentity;
  readonly legacy: LegacyRuntimeAdapter;
  readonly document: Document;
  readonly window: Window;
}

export function createGameContext(
  legacy: LegacyRuntimeAdapter,
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
    }),
    legacy,
    document,
    window,
  });
}
