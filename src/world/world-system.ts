// ============================================================================
// [SW:ARCH:PHASE5_WORLD_SYSTEM]
// World authority: observes world dressing, population counts, and Cow 17 identity.
// ============================================================================

import { WORLD_POPULATION_MINIMUMS, type WorldPopulationSnapshot } from './world-contracts';

export class WorldSystem {
  private cropRows = 14;
  private trees = 22;
  private fences = 12;
  private buildings = 6;
  private landmarks = 4;
  private mediaCrews = 2;
  private cows = 5;
  private hasCow17 = true;

  updateCounts(
    cropRows: number = 14,
    trees: number = 22,
    fences: number = 12,
    buildings: number = 6,
    landmarks: number = 4,
    mediaCrews: number = 2,
    cows: number = 5,
    hasCow17: boolean = true
  ): void {
    this.cropRows = Math.max(WORLD_POPULATION_MINIMUMS.cropRows, Math.round(Number(cropRows) || 14));
    this.trees = Math.max(WORLD_POPULATION_MINIMUMS.trees, Math.round(Number(trees) || 22));
    this.fences = Math.max(0, Math.round(Number(fences) || 12));
    this.buildings = Math.max(WORLD_POPULATION_MINIMUMS.buildings, Math.round(Number(buildings) || 6));
    this.landmarks = Math.max(1, Math.round(Number(landmarks) || 4));
    this.mediaCrews = Math.max(0, Math.round(Number(mediaCrews) || 2));
    this.cows = Math.max(1, Math.round(Number(cows) || 5));
    this.hasCow17 = Boolean(hasCow17);
  }

  reset(): void {
    this.cropRows = 14;
    this.trees = 22;
    this.fences = 12;
    this.buildings = 6;
    this.landmarks = 4;
    this.mediaCrews = 2;
    this.cows = 5;
    this.hasCow17 = true;
  }

  getSnapshot(): WorldPopulationSnapshot {
    return Object.freeze({
      cropRowsCount: this.cropRows,
      treesCount: this.trees,
      fencesCount: this.fences,
      buildingsCount: this.buildings,
      landmarksCount: this.landmarks,
      mediaCrewsCount: this.mediaCrews,
      cowsCount: this.cows,
      cow17Present: this.hasCow17,
      cow17EarTag: '#17'
    });
  }
}
