/**
 * [SW:ARCH:PHASE6_TRANSITION_CONTRACTS]
 * Type definitions for district announcements, EAS tickers, and stage alerts.
 */

export interface DistrictTransitionPayload {
  districtIndex: number;
  districtName: string;
  stageName: string;
  stageSubtitle: string;
  alertHeadline: string;
  scoreMultiplier: number;
  durationMs: number;
}

export interface DistrictTransitionContract {
  announceDistrict(payload: DistrictTransitionPayload): void;
  dismiss(): void;
  getCurrentTransition(): DistrictTransitionPayload | null;
  isVisible(): boolean;
}
