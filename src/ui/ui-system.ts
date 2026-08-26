import type { UISubsystemContract } from './ui-contracts.ts';
import { HudSystem } from './hud/hud-system.ts';
import { RampageFeedbackSystem } from './feedback/rampage-feedback-system.ts';
import { DistrictTransitionSystem } from './transitions/district-transition-system.ts';
import { ResultsSystem } from './results/results-system.ts';
import { ShopSystem } from './shop/shop-system.ts';

export class UISubsystem implements UISubsystemContract {
  public readonly hud: HudSystem;
  public readonly feedback: RampageFeedbackSystem;
  public readonly transitions: DistrictTransitionSystem;
  public readonly results: ResultsSystem;
  public readonly shop: ShopSystem;

  constructor() {
    this.hud = new HudSystem();
    this.feedback = new RampageFeedbackSystem();
    this.transitions = new DistrictTransitionSystem();
    this.results = new ResultsSystem();
    this.shop = new ShopSystem();
  }

  public reset(): void {
    this.hud.updateTimer(180);
    this.hud.updateScore(0, 1.0, 0, 'EF-0');
    this.hud.updateAbilityCooldown(0, 0, 4);
    this.hud.updateAbilityCooldown(1, 0, 6);
    this.hud.updateAbilityCooldown(2, 0, 8);
    this.feedback.clear();
    this.transitions.dismiss();
    this.results.hideResults();
    this.shop.close();
  }
}
