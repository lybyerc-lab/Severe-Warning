// ============================================================================
// [SW:ARCH:PHASE4_CAMPAIGN_SYSTEM]
// Campaign authority: evaluates run results, calculates stars, updates unlocks,
// manages best scores, run counts, and delegates persistence to CampaignStore.
// ============================================================================

import { CampaignStore } from '../../platform/persistence/campaign-store';
import { validateCampaignSave, type ValidatedCampaignSave } from '../../platform/persistence/campaign-save-schema';
import { HEARTLAND_CAMPAIGN_DEFINITION } from './heartland-definitions';
import type {
  CampaignDefinition,
  CampaignProgressMap,
  CampaignStopDefinition,
  RunResultSnapshot,
  StopId,
  StopProgress
} from './campaign-contracts';

export class CampaignSystem {
  private saveState: ValidatedCampaignSave;

  constructor(
    private readonly store: CampaignStore = new CampaignStore(),
    private readonly definition: CampaignDefinition = HEARTLAND_CAMPAIGN_DEFINITION
  ) {
    this.saveState = this.store.getSnapshot();
  }

  get activeStopId(): StopId {
    return this.saveState.selectedStop;
  }

  get furthestUnlockedStopId(): StopId {
    return this.saveState.furthestUnlockedStop;
  }

  get stops(): readonly CampaignStopDefinition[] {
    return this.definition.stops;
  }

  getStopDefinition(stopId: StopId): CampaignStopDefinition {
    const found = this.definition.stops.find((s) => s.id === stopId);
    if (!found) {
      return this.definition.stops[0]!;
    }
    return found;
  }

  calculateStars(score: number, stopId: StopId = this.activeStopId): number {
    const stop = this.getStopDefinition(stopId);
    const validScore = Math.max(0, Math.round(Number(score) || 0));
    if (validScore >= stop.starThresholds.star3) return 3;
    if (validScore >= stop.starThresholds.star2) return 2;
    if (validScore >= stop.starThresholds.star1) return 1;
    return 0;
  }

  isStopUnlocked(stopId: StopId): boolean {
    const stop = this.getStopDefinition(stopId);
    if (!stop.unlockRequiresStopId) return true;

    const prerequisiteProgress = this.saveState.stops[stop.unlockRequiresStopId];
    if (!prerequisiteProgress) return false;

    return prerequisiteProgress.stars >= stop.unlockRequiresStars;
  }

  selectStop(stopId: StopId): boolean {
    if (!this.isStopUnlocked(stopId)) return false;

    const nextState: ValidatedCampaignSave = validateCampaignSave({
      ...this.saveState,
      selectedStop: stopId
    });

    this.saveState = nextState;
    this.store.save(nextState);
    return true;
  }

  recordRunResult(stopId: StopId, score: number): RunResultSnapshot {
    const stopDef = this.getStopDefinition(stopId);
    const validScore = Math.max(0, Math.round(Number(score) || 0));
    const starsEarned = this.calculateStars(validScore, stopId);

    const currentStopData = this.saveState.stops[stopId] ?? { bestScore: 0, stars: 0, runsCompleted: 0 };
    const isNewBestScore = validScore > currentStopData.bestScore;
    const newBestScore = Math.max(currentStopData.bestScore, validScore);
    const newStars = Math.max(currentStopData.stars, starsEarned);
    const newRuns = currentStopData.runsCompleted + 1;

    const updatedStops = {
      ...this.saveState.stops,
      [stopId]: {
        bestScore: newBestScore,
        stars: newStars,
        runsCompleted: newRuns
      }
    };

    // Evaluate unlocks for all stops
    let newFurthestUnlocked = this.saveState.furthestUnlockedStop;
    let isNewUnlock = false;

    for (const s of this.definition.stops) {
      if (s.unlockRequiresStopId && updatedStops[s.unlockRequiresStopId]) {
        const prereqStars = updatedStops[s.unlockRequiresStopId]?.stars ?? 0;
        if (prereqStars >= s.unlockRequiresStars) {
          if (s.index > this.getStopDefinition(newFurthestUnlocked).index) {
            newFurthestUnlocked = s.id;
            isNewUnlock = true;
          }
        }
      }
    }

    const nextSave: ValidatedCampaignSave = validateCampaignSave({
      version: 1,
      selectedStop: this.saveState.selectedStop,
      furthestUnlockedStop: newFurthestUnlocked,
      stops: updatedStops
    });

    this.saveState = nextSave;
    this.store.save(nextSave);

    const nextStopId = (newStars >= 1 && stopDef.defaultNextStopId && this.isStopUnlocked(stopDef.defaultNextStopId))
      ? stopDef.defaultNextStopId
      : null;

    return Object.freeze({
      stopId,
      score: validScore,
      starsEarned,
      isNewBestScore,
      isNewUnlock,
      nextStopId
    });
  }

  getProgressMap(): CampaignProgressMap {
    const map: Record<StopId, StopProgress> = {
      'lincoln-county': { bestScore: 0, stars: 0, runsCompleted: 0, unlocked: true },
      'prairie-junction': { bestScore: 0, stars: 0, runsCompleted: 0, unlocked: false },
      'grain-belt': { bestScore: 0, stars: 0, runsCompleted: 0, unlocked: false },
      'state-fair': { bestScore: 0, stars: 0, runsCompleted: 0, unlocked: false }
    };

    for (const stop of this.definition.stops) {
      const p = this.saveState.stops[stop.id];
      map[stop.id] = Object.freeze({
        bestScore: p?.bestScore ?? 0,
        stars: p?.stars ?? 0,
        runsCompleted: p?.runsCompleted ?? 0,
        unlocked: this.isStopUnlocked(stop.id)
      });
    }

    return Object.freeze(map);
  }

  resetProgress(): void {
    this.saveState = this.store.reset();
  }
}
