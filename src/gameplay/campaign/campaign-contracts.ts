// ============================================================================
// [SW:ARCH:PHASE4_CAMPAIGN_CONTRACTS]
// Exact contracts for the accepted Heartland campaign and save semantics.
// ============================================================================

export type StopId = 'lincoln-county' | 'prairie-junction' | 'grain-belt' | 'state-fair-finale';

export interface CampaignDistrictDefinition {
  readonly title: string;
  readonly subtitle: string;
}

export interface CampaignStopDefinition {
  readonly id: StopId;
  readonly index: number;
  readonly title: string;
  readonly shortTitle: string;
  readonly station: string;
  readonly brief: string;
  readonly scoreTarget: number;
  readonly scoreMultiplier: number;
  readonly durationSeconds: number;
  readonly districts: readonly CampaignDistrictDefinition[];
  readonly defaultNextStopId: StopId | null;
}

export interface CampaignDefinition {
  readonly id: 'heartland-v1';
  readonly title: 'Heartland Campaign';
  readonly stops: readonly CampaignStopDefinition[];
}

export interface CampaignLevelProgress {
  readonly stars: number;
  readonly bestScore: number;
  readonly runs: number;
  readonly bestGrade: string;
  readonly [key: string]: unknown;
}

export interface CampaignSaveSnapshot {
  readonly schema: 1;
  readonly unlockedLevel: number;
  readonly selectedLevel: number;
  readonly levels: Readonly<Record<string, CampaignLevelProgress>>;
  readonly [key: string]: unknown;
}

export interface RunResultSnapshot {
  readonly stopId: StopId;
  readonly score: number;
  readonly grade: string;
  readonly objectivesDone: number;
  readonly starsEarned: number;
  readonly bestStars: number;
  readonly isNewBestScore: boolean;
  readonly isNewUnlock: boolean;
  readonly nextStopId: StopId | null;
}

export interface StopProgress {
  readonly bestScore: number;
  readonly stars: number;
  readonly runs: number;
  readonly bestGrade: string;
  readonly unlocked: boolean;
}

export type CampaignProgressMap = Readonly<Record<StopId, StopProgress>>;

export interface CampaignContractProbe {
  readonly passed: boolean;
  readonly checks: Readonly<Record<string, boolean>>;
  readonly samples: Readonly<{
    oneStar: number;
    twoStars: number;
    threeStars: number;
    unlockedLevel: number;
    runs: number;
  }>;
}
