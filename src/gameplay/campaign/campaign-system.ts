// ============================================================================
// [SW:ARCH:PHASE4_CAMPAIGN_SYSTEM]
// Typed mirror and exact contract evaluator for the accepted Heartland campaign.
// ============================================================================

import { CampaignStore } from '../../platform/persistence/campaign-store.ts';
import { validateCampaignSave, type ValidatedCampaignSave } from '../../platform/persistence/campaign-save-schema.ts';
import { HEARTLAND_CAMPAIGN_DEFINITION } from './heartland-definitions.ts';
import type {
  CampaignContractProbe,
  CampaignDefinition,
  CampaignProgressMap,
  CampaignStopDefinition,
  RunResultSnapshot,
  StopId,
  StopProgress,
} from './campaign-contracts.ts';

function clampScore(value: number): number {
  return Math.max(0, Math.round(Number(value) || 0));
}

function clampObjectives(value: number): number {
  return Math.max(0, Math.min(3, Math.round(Number(value) || 0)));
}

export class CampaignSystem {
  private saveState: ValidatedCampaignSave;

  // Declared as a field and assigned in the body rather than as a constructor
  // parameter property. `pnpm test` runs node --experimental-strip-types, which
  // only removes type syntax; a parameter property emits a real assignment, so
  // the loader rejects the file outright. tsc supports them fully, which is why
  // the typecheck stayed green while the test run died.
  private readonly store: CampaignStore;

  private readonly definition: CampaignDefinition;

  constructor(
    store: CampaignStore = new CampaignStore(),
    definition: CampaignDefinition = HEARTLAND_CAMPAIGN_DEFINITION,
  ) {
    this.store = store;
    this.definition = definition;
    this.saveState = this.store.getSnapshot();
  }

  get activeStopId(): StopId {
    return this.definition.stops[this.saveState.selectedLevel]?.id ?? this.definition.stops[0]!.id;
  }

  get furthestUnlockedStopId(): StopId {
    return this.definition.stops[this.saveState.unlockedLevel]?.id ?? this.definition.stops[0]!.id;
  }

  get stops(): readonly CampaignStopDefinition[] {
    return this.definition.stops;
  }

  getStopDefinition(stopId: StopId): CampaignStopDefinition {
    return this.definition.stops.find((stop) => stop.id === stopId) ?? this.definition.stops[0]!;
  }

  synchronize(raw: unknown): ValidatedCampaignSave {
    this.saveState = this.store.synchronize(raw);
    return this.saveState;
  }

  calculateStars(score: number, objectivesDone: number, stopId: StopId = this.activeStopId): number {
    const stop = this.getStopDefinition(stopId);
    const validScore = clampScore(score);
    const validObjectives = clampObjectives(objectivesDone);
    if (validScore >= stop.scoreTarget * 1.5 && validObjectives === 3) return 3;
    if (validScore >= stop.scoreTarget) return 2;
    if (validScore >= stop.scoreTarget * 0.6 || validObjectives >= 2) return 1;
    return 0;
  }

  isStopUnlocked(stopId: StopId): boolean {
    return this.getStopDefinition(stopId).index <= this.saveState.unlockedLevel;
  }

  selectStop(stopId: StopId): boolean {
    const stop = this.getStopDefinition(stopId);
    if (stop.index > this.saveState.unlockedLevel) return false;
    const next = validateCampaignSave({
      ...this.saveState,
      selectedLevel: stop.index,
    });
    this.saveState = next;
    this.store.save(next);
    return true;
  }

  recordRunResult(
    stopId: StopId,
    grade: string,
    score: number,
    objectivesDone: number,
  ): RunResultSnapshot {
    const stop = this.getStopDefinition(stopId);
    const validScore = clampScore(score);
    const validObjectives = clampObjectives(objectivesDone);
    const starsEarned = this.calculateStars(validScore, validObjectives, stopId);
    const previous = this.saveState.levels[stopId] ?? {
      stars: 0,
      bestScore: 0,
      runs: 0,
      bestGrade: 'F',
    };
    const bestStars = Math.max(previous.stars, starsEarned);
    const updatedLevel = Object.freeze({
      ...previous,
      stars: bestStars,
      bestScore: Math.max(previous.bestScore, validScore),
      runs: previous.runs + 1,
      bestGrade: bestStars > previous.stars ? String(grade || 'F') : String(previous.bestGrade || grade || 'F'),
    });
    const levels = {
      ...this.saveState.levels,
      [stopId]: updatedLevel,
    };
    const nextIndex = stop.index + 1;
    const cleared = starsEarned > 0;
    const unlockedLevel = cleared && nextIndex < this.definition.stops.length
      ? Math.max(this.saveState.unlockedLevel, nextIndex)
      : this.saveState.unlockedLevel;
    const nextSave = validateCampaignSave({
      ...this.saveState,
      unlockedLevel,
      levels,
    });
    const previousUnlocked = this.saveState.unlockedLevel;
    this.saveState = nextSave;
    this.store.save(nextSave);

    return Object.freeze({
      stopId,
      score: validScore,
      grade: String(grade || 'F'),
      objectivesDone: validObjectives,
      starsEarned,
      bestStars,
      isNewBestScore: validScore > previous.bestScore,
      isNewUnlock: unlockedLevel > previousUnlocked,
      nextStopId: cleared ? this.definition.stops[nextIndex]?.id ?? null : null,
    });
  }

  startNextStop(): boolean {
    const next = this.definition.stops[this.saveState.selectedLevel + 1];
    return next ? this.selectStop(next.id) : false;
  }

  getProgressMap(): CampaignProgressMap {
    const entries = this.definition.stops.map((stop) => {
      const progress = this.saveState.levels[stop.id];
      const value: StopProgress = Object.freeze({
        bestScore: progress?.bestScore ?? 0,
        stars: progress?.stars ?? 0,
        runs: progress?.runs ?? 0,
        bestGrade: progress?.bestGrade ?? 'F',
        unlocked: stop.index <= this.saveState.unlockedLevel,
      });
      return [stop.id, value] as const;
    });
    return Object.freeze(Object.fromEntries(entries)) as CampaignProgressMap;
  }

  getSnapshot(): ValidatedCampaignSave {
    return this.saveState;
  }

  resetProgress(): void {
    this.saveState = this.store.reset();
  }

  runContractProbe(): CampaignContractProbe {
    const isolatedStore = new CampaignStore('phase4_campaign_contract_probe', true);
    const probe = new CampaignSystem(isolatedStore, this.definition);
    const oneStar = probe.calculateStars(4800, 0, 'lincoln-county');
    const oneStarByObjectives = probe.calculateStars(0, 2, 'lincoln-county');
    const twoStars = probe.calculateStars(8000, 0, 'lincoln-county');
    const threeStars = probe.calculateStars(12000, 3, 'lincoln-county');
    const firstResult = probe.recordRunResult('lincoln-county', 'C', 4800, 0);
    const secondResult = probe.recordRunResult('lincoln-county', 'S+', 12000, 3);
    const snapshot = probe.getSnapshot();
    const checks = Object.freeze({
      exactStopIds: this.definition.stops.map((stop) => stop.id).join('|')
        === 'lincoln-county|prairie-junction|grain-belt|state-fair-finale',
      exactScoreTargets: this.definition.stops.map((stop) => stop.scoreTarget).join('|')
        === '8000|14000|22000|28000',
      exactScoreMultipliers: this.definition.stops.map((stop) => stop.scoreMultiplier).join('|')
        === '1|1.1|1.15|1.25',
      oneStarAtSixtyPercent: oneStar === 1,
      oneStarFromTwoObjectives: oneStarByObjectives === 1,
      twoStarsAtTarget: twoStars === 2,
      threeStarsNeedsTargetAndObjectives: threeStars === 3,
      anyPositiveStarsUnlockNext: firstResult.isNewUnlock && snapshot.unlockedLevel === 1,
      runsIncrementExactlyOnceEach: snapshot.levels['lincoln-county']?.runs === 2,
      bestScoreMovesUp: snapshot.levels['lincoln-county']?.bestScore === 12000,
      bestStarsMoveUp: snapshot.levels['lincoln-county']?.stars === 3,
      nextStopMatchesLegacyOrder: secondResult.nextStopId === 'prairie-junction',
    });
    return Object.freeze({
      passed: Object.values(checks).every(Boolean),
      checks,
      samples: Object.freeze({
        oneStar,
        twoStars,
        threeStars,
        unlockedLevel: snapshot.unlockedLevel,
        runs: snapshot.levels['lincoln-county']?.runs ?? 0,
      }),
    });
  }
}
