// ============================================================================
// [SW:ARCH:PHASE5_WORLD_CONTRACTS]
// Typed contracts for world dressing, crop rows, trees, fences, and entities.
// ============================================================================

export interface WorldPopulationSnapshot {
  readonly cropRowsCount: number;
  readonly treesCount: number;
  readonly fencesCount: number;
  readonly buildingsCount: number;
  readonly landmarksCount: number;
  readonly mediaCrewsCount: number;
  readonly cowsCount: number;
  readonly cow17Present: boolean;
  readonly cow17EarTag: string;
}

export const WORLD_POPULATION_MINIMUMS = Object.freeze({
  cropRows: 12,
  trees: 18,
  buildings: 4
});
