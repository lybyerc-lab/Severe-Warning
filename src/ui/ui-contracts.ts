import type { HudSystemContract } from './hud/hud-contracts.ts';
import type { RampageFeedbackContract } from './feedback/rampage-feedback-contracts.ts';
import type { DistrictTransitionContract } from './transitions/district-transition-contracts.ts';
import type { ResultsSystemContract } from './results/results-contracts.ts';

export interface UISubsystemContract {
  hud: HudSystemContract;
  feedback: RampageFeedbackContract;
  transitions: DistrictTransitionContract;
  results: ResultsSystemContract;
  reset(): void;
}
