import type { HudSystemContract } from './hud/hud-contracts.ts';
import type { RampageFeedbackContract } from './feedback/rampage-feedback-contracts.ts';
import type { DistrictTransitionContract } from './transitions/district-transition-contracts.ts';
import type { ResultsSystemContract } from './results/results-contracts.ts';
import type { ShopSystemContract } from './shop/shop-contracts.ts';

export interface UISubsystemContract {
  hud: HudSystemContract;
  feedback: RampageFeedbackContract;
  transitions: DistrictTransitionContract;
  results: ResultsSystemContract;
  shop: ShopSystemContract;
  reset(): void;
}
