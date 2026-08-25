/**
 * [SW:ARCH:PHASE6_RESULTS_CONTRACTS]
 * Type definitions for post-run situation reports, star ratings, and grade summaries.
 */

export interface ResultsSituationReport {
  score: number;
  starsAwarded: number;
  letterGrade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  targetsDestroyedCount: number;
  maxComboAchieved: number;
  bonusObjectivesCompleted: number;
  campaignStopTitle: string;
  nextStopUnlocked: boolean;
  bovineSummary: string;
}

export interface ResultsSystemContract {
  presentResults(report: ResultsSituationReport): void;
  hideResults(): void;
  getReport(): ResultsSituationReport | null;
  isOpen(): boolean;
}
