// [SW:ARCH:ECONOMY_CONTRACTS]
// Types for the run economy: the EF ladder, the grade curve, and campaign stars.
//
// This is the first gameplay logic to leave the inline script and become
// something the build can typecheck and the test runner can exercise directly.
// It was chosen because it is genuinely pure - score in, rating out, no scene
// graph, no THREE, no DOM - and because it is the code that just failed: every
// threshold in it had drifted roughly ten-fold below real play while every
// verification in the repo stayed green.

/** Rungs of the Enhanced Fujita ladder, weakest first. */
export type EfRung = 'ef0' | 'ef1' | 'ef2' | 'ef3' | 'ef4' | 'ef5';

/** The three-act structure of a run. Districts advance forward only. */
export type RunStage = 1 | 2 | 3;

export type Grade = 'S+' | 'A' | 'B' | 'C' | 'F';

export interface EfRating {
  /** Badge as shown in the HUD, e.g. "EF-3". */
  readonly badge: string;
  /** Score multiplier awarded at this rung. */
  readonly multiplier: number;
  /** Uniform scale applied to the funnel at this rung. */
  readonly funnelScale: number;
}

export interface GradeInput {
  /** How many of the storm's three objectives are complete. */
  readonly objectivesDone: number;
  /**
   * Whether the storm's FIRST objective is done - the one with content behind
   * it (landmarks for a tornado, hail corridors for a supercell, structures for
   * a derecho) rather than another score threshold.
   */
  readonly contentObjectiveDone: boolean;
  readonly destructionScore: number;
  /** The active county's score target; every threshold derives from it. */
  readonly scoreTarget: number;
}
