// ============================================================================
// [SW:ARCH:GAME_CONTEXT]
// Shared Phase 4 ownership for clocks, input, abilities, scoring, districts,
// campaign, persistence, and legacy boundary.
// ============================================================================

import type { AbilitySystem } from '../abilities/ability-system';
import type { GameClocks } from '../core/clocks';
import type { InputSystem } from '../input/input-system';
import type { ScoringSystem } from '../gameplay/scoring/scoring-system';
import type { DistrictSystem } from '../gameplay/districts/district-system';
import type { CampaignSystem } from '../gameplay/campaign/campaign-system';
import type { CampaignStore } from '../platform/persistence/campaign-store';
import type { LegacyRuntimeAdapter } from '../legacy/legacy-runtime-adapter';

export interface BuildIdentity {
  readonly productName: 'Severe Weather Warning';
  readonly version: string;
  readonly label: string;
  readonly renderer: 'Three.js r128';
  readonly architecture: 'modern-shell-v1';
  readonly modernizationPhase: 'phase-4-scoring-campaign';
}

export interface GameContext {
  readonly build: BuildIdentity;
  readonly clocks: GameClocks;
  readonly input: InputSystem;
  readonly abilities: AbilitySystem;
  readonly scoring: ScoringSystem;
  readonly district: DistrictSystem;
  readonly campaign: CampaignSystem;
  readonly persistence: CampaignStore;
  readonly legacy: LegacyRuntimeAdapter;
  readonly document: Document;
  readonly window: Window;
}

export function createGameContext(
  legacy: LegacyRuntimeAdapter,
  clocks: GameClocks,
  input: InputSystem,
  abilities: AbilitySystem,
  scoring: ScoringSystem,
  district: DistrictSystem,
  campaign: CampaignSystem,
  persistence: CampaignStore,
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
      modernizationPhase: 'phase-4-scoring-campaign',
    }),
    clocks,
    input,
    abilities,
    scoring,
    district,
    campaign,
    persistence,
    legacy,
    document,
    window,
  });
}
