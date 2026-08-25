import type {
  ScorePopupItem,
  RampageTier,
  RampageBannerData,
  RampageFeedbackContract
} from './rampage-feedback-contracts.ts';

const TIER_COLORS: Record<RampageTier, string> = {
  0: '#94a3b8',
  1: '#38bdf8',
  2: '#22c55e',
  3: '#eab308',
  4: '#f97316',
  5: '#ef4444'
};

export class RampageFeedbackSystem implements RampageFeedbackContract {
  private popups: ScorePopupItem[] = [];
  private currentTier: RampageTier = 0;
  private latestBanner: RampageBannerData | null = null;
  private idCounter = 0;

  public addScorePopup(x: number, y: number, z: number, text: string, color = '#fbbf24'): void {
    const match = /^\+(\d+)/.exec(String(text));
    const amount = match ? Number(match[1]) : 0;
    const item: ScorePopupItem = {
      id: `popup-${++this.idCounter}`,
      x, y, z,
      text,
      color,
      amount,
      createdAtMs: Date.now()
    };
    this.popups.push(item);
    if (this.popups.length > 30) this.popups.shift();
  }

  public triggerMilestone(tier: RampageTier, title: string, subtitle = ''): void {
    this.currentTier = tier;
    this.latestBanner = {
      tier,
      title,
      subtitle,
      accentColor: TIER_COLORS[tier] || '#ef4444',
      timestampMs: Date.now()
    };
  }

  public clear(): void {
    this.popups.length = 0;
    this.currentTier = 0;
    this.latestBanner = null;
  }

  public getActivePopups(): ScorePopupItem[] {
    const now = Date.now();
    return this.popups.filter(p => now - p.createdAtMs < 1500);
  }

  public getCurrentTier(): RampageTier {
    return this.currentTier;
  }

  public getLatestBanner(): RampageBannerData | null {
    return this.latestBanner;
  }
}
