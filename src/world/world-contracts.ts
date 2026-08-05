// ============================================================================
// [SW:ARCH:PHASE5_WORLD_CONTRACTS]
// Read-only contracts captured from the live world and production dressing.
// ============================================================================

export interface Cow17Snapshot {
  readonly present: boolean;
  readonly decorated: boolean;
  readonly airborne: boolean;
  readonly scale: number | null;
  readonly earTag: '#17';
}

export interface WorldPopulationSnapshot {
  readonly campaignId: string;
  readonly quality: string;
  readonly cropRowsCount: number;
  readonly treesCount: number;
  readonly fencesCount: number;
  readonly streetPropsCount: number;
  readonly targetsCount: number;
  readonly landmarksCount: number;
  readonly substationsCount: number;
  readonly mediaCrewsCount: number;
  readonly animalsCount: number;
  readonly cow17: Cow17Snapshot;
}

export const WORLD_POPULATION_MINIMUMS = Object.freeze({
  cropRows: 12,
  trees: 18,
  fences: 1,
});
