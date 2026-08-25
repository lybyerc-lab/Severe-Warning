/**
 * [SW:ARCH:PHASE6_FEEDBACK_CONTRACTS]
 * Type definitions for score popups, combo banners, and rampage milestones.
 */

export interface ScorePopupItem {
  id: string;
  x: number;
  y: number;
  z: number;
  text: string;
  color: string;
  amount: number;
  createdAtMs: number;
}

export type RampageTier = 0 | 1 | 2 | 3 | 4 | 5;

export interface RampageBannerData {
  tier: RampageTier;
  title: string;
  subtitle: string;
  accentColor: string;
  timestampMs: number;
}

export interface RampageFeedbackContract {
  addScorePopup(x: number, y: number, z: number, text: string, color?: string): void;
  triggerMilestone(tier: RampageTier, title: string, subtitle?: string): void;
  clear(): void;
  getActivePopups(): ScorePopupItem[];
  getCurrentTier(): RampageTier;
}
