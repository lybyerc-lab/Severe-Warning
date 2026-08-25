import type {
  DistrictTransitionPayload,
  DistrictTransitionContract
} from './district-transition-contracts.ts';

export class DistrictTransitionSystem implements DistrictTransitionContract {
  private activeTransition: DistrictTransitionPayload | null = null;
  private visibleUntilMs = 0;

  public announceDistrict(payload: DistrictTransitionPayload): void {
    this.activeTransition = { ...payload };
    this.visibleUntilMs = Date.now() + (payload.durationMs || 3500);
  }

  public dismiss(): void {
    this.activeTransition = null;
    this.visibleUntilMs = 0;
  }

  public getCurrentTransition(): DistrictTransitionPayload | null {
    if (this.isVisible()) {
      return this.activeTransition;
    }
    return null;
  }

  public isVisible(): boolean {
    return this.activeTransition !== null && Date.now() < this.visibleUntilMs;
  }
}
