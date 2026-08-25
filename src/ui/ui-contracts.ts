import { HudSystemContract, HudStateSnapshot } from './hud/hud-contracts.ts';
import { RampageFeedbackContract } from './feedback/rampage-feedback-contracts.ts';
import { DistrictTransitionContract } from './transitions/district-transition-contracts.ts';
import { ResultsSystemContract } from './results/results-contracts.ts';

export interface UISubsystemContract {
  hud: HudSystemContract;
  feedback: RampageFeedbackContract;
  transitions: DistrictTransitionContract;
  results: ResultsSystemContract;
  reset(): void;
}
