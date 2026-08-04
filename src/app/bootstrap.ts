// ============================================================================
// [SW:ARCH:BOOTSTRAP]
// Creates the modern shell and attaches Phase 2 clocks, Phase 3 controls,
// and Phase 4 scoring, district, campaign, and persistence authorities.
// ============================================================================

import { AbilitySystem } from '../abilities/ability-system';
import { GameClocks } from '../core/clocks';
import { InputSystem } from '../input/input-system';
import { ScoringSystem } from '../gameplay/scoring/scoring-system';
import { DistrictSystem } from '../gameplay/districts/district-system';
import { CampaignSystem } from '../gameplay/campaign/campaign-system';
import { CampaignStore } from '../platform/persistence/campaign-store';
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
  readonly scoring: ScoringSystem;
  readonly district: DistrictSystem;
  readonly campaign: CampaignSystem;
  readonly persistence: CampaignStore;
  readonly qa: LegacyRuntimeAdapter;
  readonly architecture: 'modern-shell-v1';
  readonly modernizationPhase: 'phase-4-scoring-campaign';
}

export async function bootstrapSevereWeather(): Promise<SevereWeatherModernShell> {
  const legacy = new LegacyRuntimeAdapter();
  const clocks = new GameClocks();
  const input = new InputSystem();
  const abilities = new AbilitySystem();
  const scoring = new ScoringSystem();
  const district = new DistrictSystem();
  const persistence = new CampaignStore();
  const campaign = new CampaignSystem(persistence);

  const context = createGameContext(
    legacy,
    clocks,
    input,
    abilities,
    scoring,
    district,
    campaign,
    persistence,
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
    scoring,
    district,
    campaign,
    persistence,
    qa: legacy,
    architecture: 'modern-shell-v1',
    modernizationPhase: 'phase-4-scoring-campaign',
  });
}
