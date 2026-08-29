// [SW:ARCH:ECONOMY_SYSTEM]
// The run economy, as pure functions. No THREE, no DOM, no globals.
//
// Every threshold here is a FRACTION of the active county's score target rather
// than a literal. Literals are exactly how this drifted: the ladder shipped with
// EF-5 at 11,000 while a real run finished near 150,000, so simulating it against
// the observed device curve put EF-4 at t=60s and EF-5 at t=120s - precisely the
// stage boundaries. The score gates never bound at all; the clock alone drove the
// badge, and the tornado sat at maximum size and multiplier for most of a round.
import type { EfRating, Grade, GradeInput, RunStage } from './economy-contracts.ts';

/** Fractions of the county score target at which each rung is earned. */
export const EF_LADDER = Object.freeze({
  ef1: 0.02,
  ef2: 0.06,
  ef3: 0.18,
  ef4: 0.40,
  ef5: 0.75,
});

/** Used when no county is active yet; matches the first county's target. */
export const DEFAULT_SCORE_TARGET = 45_000;

const RATING = Object.freeze({
  ef0: Object.freeze({ badge: 'EF-0', multiplier: 1.0, funnelScale: 1.0 }),
  ef1: Object.freeze({ badge: 'EF-1', multiplier: 1.25, funnelScale: 1.1 }),
  ef2: Object.freeze({ badge: 'EF-2', multiplier: 1.6, funnelScale: 1.25 }),
  ef3: Object.freeze({ badge: 'EF-3', multiplier: 2.2, funnelScale: 1.5 }),
  ef4: Object.freeze({ badge: 'EF-4', multiplier: 2.8, funnelScale: 1.8 }),
  ef5: Object.freeze({ badge: 'EF-5', multiplier: 3.8, funnelScale: 2.2 }),
});

/** The rungs in order, so a rank can be turned back into a rating. */
const RATING_BY_RANK = Object.freeze([
  RATING.ef0, RATING.ef1, RATING.ef2, RATING.ef3, RATING.ef4, RATING.ef5,
]);

/**
 * Seconds a skipped rung is held before the climb continues.
 *
 * Long enough to read the badge and see the funnel grow, short enough that the
 * lower multiplier it implies costs a rounding error on a run that finishes
 * above 100,000.
 */
export const EF_PROMOTION_DWELL_SECONDS = 2.5;

/** EF-0..EF-5 as a number. Anything unparseable is -1 and never wins a compare. */
export function efRungRank(badge: string): number {
  const match = /EF-(\d)/.exec(String(badge));
  if (!match) return -1;
  const rank = Number(match[1]);
  return rank >= 0 && rank < RATING_BY_RANK.length ? rank : -1;
}

/**
 * The rating to SHOW, given the rating that has been EARNED.
 *
 * Reported from play on 2026-08-29: "the tornado never hits EF-3, it goes from
 * 2 to 4." The cause is structural rather than a tuning slip. Stage 1 caps at
 * EF-2 while the score keeps climbing past it, so a competent run arrives at the
 * stage-2 boundary already above the EF-4 gate; resolveEfRating is a pure
 * function of (stage, score), the ceiling lifts from EF-2 to EF-4 in one frame,
 * and EF-3 is never a value the badge takes. Nothing in the ladder ever required
 * the climb to be walked.
 *
 * So the badge climbs AT MOST ONE RUNG PER EF_PROMOTION_DWELL_SECONDS. Every
 * rung is therefore displayed -- badge, multiplier and funnel scale together,
 * since a ticker reading EF-3 while a 2.8x multiplier is paid would be its own
 * bug -- and each is legible before the next arrives.
 *
 * The rate limit has to cover the LAST rung of a climb as well as the skipped
 * ones. An earlier version exempted single-rung promotions, reasoning that a
 * naturally earned rung should never be delayed; live probing showed why that
 * is wrong. Once the ladder has stepped EF-2 -> EF-3, the remaining climb to
 * EF-4 IS a single rung, so it was exempt and fired on the very next frame:
 * EF-3 was displayed for about a tenth of a second, which is the original bug
 * with extra steps. In natural play rungs are tens of seconds apart and the
 * limit never binds.
 *
 * Deliberately asymmetric: only promotions are held. A demotion is immediate,
 * because showing a rating the score no longer supports would overstate the
 * storm, and stepping down through rungs would be a second animation nobody
 * asked for.
 *
 * `secondsSinceChange` is measured on the run clock, so it does not advance
 * while the game is paused.
 */
export function stepEfRating(
  displayedBadge: string,
  earned: EfRating,
  secondsSinceChange: number,
): EfRating {
  const from = efRungRank(displayedBadge);
  const to = efRungRank(earned.badge);
  // No history to step from (first update of a run, or an unreadable badge):
  // show what was earned rather than inventing a climb.
  if (from < 0 || to < 0) return earned;
  // Demotions and holds are immediate.
  if (to <= from) return earned;
  const held = Number.isFinite(secondsSinceChange) ? secondsSinceChange : 0;
  return held >= EF_PROMOTION_DWELL_SECONDS ? RATING_BY_RANK[from + 1]! : RATING_BY_RANK[from]!;
}

function safeTarget(scoreTarget: number): number {
  return Number.isFinite(scoreTarget) && scoreTarget > 0 ? scoreTarget : DEFAULT_SCORE_TARGET;
}

/** Score at which `rung` is earned in the given county. */
export function efScoreThreshold(rung: keyof typeof EF_LADDER, scoreTarget: number): number {
  return EF_LADDER[rung] * safeTarget(scoreTarget);
}

/**
 * The rating for a score, honouring each stage's ceiling.
 *
 * Stage 1 caps at EF-2 and stage 2 at EF-4 on purpose: the run should climb
 * through its three acts rather than reach the top in the first one. The stage
 * ceiling and the score threshold are two independent gates and BOTH have to
 * open, which is what the old absolute ladder lost - its score gate was so low
 * that only the stage ceiling was ever doing any work.
 */
export function resolveEfRating(stage: RunStage, destructionScore: number, scoreTarget: number): EfRating {
  const score = Number.isFinite(destructionScore) ? destructionScore : 0;
  const at = (rung: keyof typeof EF_LADDER) => score >= efScoreThreshold(rung, scoreTarget);

  if (stage === 1) {
    if (at('ef2')) return RATING.ef2;
    if (at('ef1')) return RATING.ef1;
    return RATING.ef0;
  }
  if (stage === 2) {
    if (at('ef4')) return RATING.ef4;
    if (at('ef3')) return RATING.ef3;
    if (at('ef2')) return RATING.ef2;
    return RATING.ef1;
  }
  if (at('ef5')) return RATING.ef5;
  if (at('ef4')) return RATING.ef4;
  if (at('ef3')) return RATING.ef3;
  return RATING.ef2;
}

/**
 * The end-of-run grade.
 *
 * The top two grades require the storm's FIRST objective - the one with content
 * behind it. Grading on objectivesDone alone let a run that shattered nothing
 * take an A, because the other two objectives were themselves just score gates.
 * Campaign stars and level unlocks never consult this, so tightening it cannot
 * block progression.
 */
export function resolveGrade(input: GradeInput): Grade {
  const target = safeTarget(input.scoreTarget);
  const score = Number.isFinite(input.destructionScore) ? input.destructionScore : 0;
  if (input.objectivesDone >= 3 && score >= target * 1.5) return 'S+';
  if (input.contentObjectiveDone && score >= target) return 'A';
  if (input.objectivesDone >= 1 && score >= target * 0.4) return 'B';
  if (score >= target * 0.1) return 'C';
  return 'F';
}

/**
 * Campaign stars for a finished run.
 *
 * The `||` on one star is deliberate and load-bearing: a player who completes
 * two objectives clears the county whatever they scored, so a mis-tuned score
 * target can never hard-block the campaign.
 */
export function resolveStars(destructionScore: number, scoreTarget: number, objectivesDone: number): 0 | 1 | 2 | 3 {
  const target = safeTarget(scoreTarget);
  const score = Number.isFinite(destructionScore) ? destructionScore : 0;
  if (score >= target * 1.5 && objectivesDone === 3) return 3;
  if (score >= target) return 2;
  if (score >= target * 0.6 || objectivesDone >= 2) return 1;
  return 0;
}
