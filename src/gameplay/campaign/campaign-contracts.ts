// ============================================================================
// [SW:ARCH:PHASE4_CAMPAIGN_CONTRACTS]
// Typed contracts for Heartland stops, star evaluation, unlocks, and campaign runs.
// ============================================================================

export type StopId = 'lincoln-county' | 'prairie-junction' | 'grain-belt' | 'state-fair';

export interface StarThresholds {
  readonly star1: number;
  readonly star2: number;
  readonly star3: number;
}

export interface CampaignStopDefinition {
  readonly id: StopId;
  readonly index: number; // 1-indexed
  readonly title: string;
  readonly region: string;
  readonly description: string;
  readonly unlockRequiresStopId: StopId | null;
  readonly unlockRequiresStars: number;
  readonly starThresholds: StarThresholds;
  readonly defaultNextStopId: StopId | null;
}

export interface CampaignDefinition {
  readonly id: string;
  readonly title: string;
  readonly stops: readonly CampaignStopDefinition[];
}

export interface RunResultSnapshot {
  readonly stopId: StopId;
  readonly score: number;
  readonly starsEarned: number;
  readonly isNewBestScore: boolean;
  readonly isNewUnlock: boolean;
  readonly nextStopId: StopId | null;
}

export interface StopProgress {
  readonly bestScore: number;
  readonly stars: number;
  readonly runsCompleted: number;
  readonly unlocked: boolean;
}

export type CampaignProgressMap = Readonly<Record<StopId, StopProgress>>;
