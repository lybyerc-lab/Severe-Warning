// [SW:ARCH:ECONOMY_SYSTEM] tests
// Run with `npm test` (node:test + type stripping, no extra dependencies).
//
// These lock the tuning AND the specific failures that got here. Before this
// file existed, the only checks over this logic were string matches against the
// source, which stayed green while every threshold drifted ten-fold out of scale.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SCORE_TARGET,
  EF_LADDER,
  EF_PROMOTION_DWELL_SECONDS,
  efRungRank,
  efScoreThreshold,
  resolveEfRating,
  resolveGrade,
  resolveStars,
  stepEfRating,
} from './economy-system.ts';

const LINCOLN = 45_000;
const PRAIRIE = 65_000;
const FINALE = 105_000;

describe('EF ladder', () => {
  test('thresholds scale with the county target', () => {
    assert.equal(efScoreThreshold('ef5', LINCOLN), 33_750);
    assert.equal(efScoreThreshold('ef5', FINALE), 78_750);
    assert.equal(efScoreThreshold('ef4', PRAIRIE), 26_000);
  });

  test('rungs are strictly increasing', () => {
    const rungs = Object.keys(EF_LADDER) as (keyof typeof EF_LADDER)[];
    for (let i = 1; i < rungs.length; i++) {
      assert.ok(
        efScoreThreshold(rungs[i]!, PRAIRIE) > efScoreThreshold(rungs[i - 1]!, PRAIRIE),
        `${rungs[i]} must sit above ${rungs[i - 1]}`,
      );
    }
  });

  test('stage ceilings hold even at an enormous score', () => {
    assert.equal(resolveEfRating(1, 10_000_000, PRAIRIE).badge, 'EF-2', 'stage 1 caps at EF-2');
    assert.equal(resolveEfRating(2, 10_000_000, PRAIRIE).badge, 'EF-4', 'stage 2 caps at EF-4');
    assert.equal(resolveEfRating(3, 10_000_000, PRAIRIE).badge, 'EF-5');
  });

  test('REGRESSION: the score gate actually binds, it is not just the stage', () => {
    // The shipped ladder had EF-5 at an absolute 11,000 against runs finishing
    // near 150,000, so entering stage 3 handed over EF-5 immediately and the
    // score threshold never bound. Entering a stage must NOT grant its ceiling.
    assert.equal(resolveEfRating(3, 11_000, PRAIRIE).badge, 'EF-2', 'stage 3 alone is not EF-5');
    assert.equal(resolveEfRating(2, 7_000, PRAIRIE).badge, 'EF-2', 'stage 2 alone is not EF-4');
    assert.equal(resolveEfRating(2, 0, PRAIRIE).badge, 'EF-1', 'stage 2 floor');
    assert.equal(resolveEfRating(3, efScoreThreshold('ef5', PRAIRIE), PRAIRIE).badge, 'EF-5');
  });

  test('a rung is earned exactly at its threshold, not a point before', () => {
    const t = efScoreThreshold('ef3', PRAIRIE);
    assert.equal(resolveEfRating(3, t, PRAIRIE).badge, 'EF-3');
    assert.equal(resolveEfRating(3, t - 1, PRAIRIE).badge, 'EF-2');
  });

  test('multiplier and funnel scale rise together with the badge', () => {
    const climb = [0, 0.03, 0.07, 0.2, 0.45, 0.8].map(f => resolveEfRating(3, f * PRAIRIE, PRAIRIE));
    for (let i = 1; i < climb.length; i++) {
      assert.ok(climb[i]!.multiplier >= climb[i - 1]!.multiplier);
      assert.ok(climb[i]!.funnelScale >= climb[i - 1]!.funnelScale);
    }
  });

  test('a missing or nonsense target falls back rather than dividing by zero', () => {
    assert.equal(efScoreThreshold('ef5', 0), 0.75 * DEFAULT_SCORE_TARGET);
    assert.equal(efScoreThreshold('ef5', Number.NaN), 0.75 * DEFAULT_SCORE_TARGET);
    assert.equal(resolveEfRating(3, Number.NaN, PRAIRIE).badge, 'EF-2');
  });
});

describe('walking the ladder', () => {
  const dwell = EF_PROMOTION_DWELL_SECONDS;

  test('REGRESSION: the badge goes EF-2 -> EF-4 without ever showing EF-3', () => {
    // Reported from play on 2026-08-29: "the tornado never hits EF-3, it goes
    // from 2 to 4." This reproduces the cause with no stepper involved. A run
    // that is past the EF-4 gate before the stage-2 boundary is handed EF-4 the
    // frame the ceiling lifts, because resolveEfRating is a pure function of
    // (stage, score) and nothing requires the climb to be walked.
    const past4 = efScoreThreshold('ef4', LINCOLN) + 1;
    assert.equal(resolveEfRating(1, past4, LINCOLN).badge, 'EF-2', 'capped by stage 1');
    assert.equal(resolveEfRating(2, past4, LINCOLN).badge, 'EF-4', 'and EF-3 is skipped');
    // The stepper is what closes it: the same boundary now shows EF-3 first.
    const earned = resolveEfRating(2, past4, LINCOLN);
    const shown = stepEfRating('EF-2', earned, 10);
    assert.equal(shown.badge, 'EF-3', 'the skipped rung is displayed');
    assert.equal(stepEfRating('EF-3', earned, dwell).badge, 'EF-4', 'then the climb continues');
    assert.equal(stepEfRating('EF-3', earned, dwell - 0.01).badge, 'EF-3', 'and not before');
  });

  test('the skipped rung is held for the dwell, not for a frame', () => {
    const earned = resolveEfRating(3, 10_000_000, LINCOLN);
    assert.equal(earned.badge, 'EF-5');
    assert.equal(stepEfRating('EF-3', earned, 0).badge, 'EF-3', 'held immediately after promoting');
    assert.equal(stepEfRating('EF-3', earned, dwell - 0.01).badge, 'EF-3', 'still held a frame short');
    assert.equal(stepEfRating('EF-3', earned, dwell).badge, 'EF-4', 'and released exactly on it');
  });

  test('multiplier and funnel scale follow the badge that is shown', () => {
    // A ticker reading EF-3 while a 2.8x multiplier is paid would be its own bug.
    const earned = resolveEfRating(2, efScoreThreshold('ef4', LINCOLN), LINCOLN);
    const shown = stepEfRating('EF-2', earned, 10);
    const ef3 = resolveEfRating(3, efScoreThreshold('ef3', LINCOLN), LINCOLN);
    assert.equal(shown.multiplier, ef3.multiplier);
    assert.equal(shown.funnelScale, ef3.funnelScale);
  });

  test('a rung earned in normal play is not delayed', () => {
    // Rungs are tens of seconds apart in a real run, so the limit never binds.
    const earned = resolveEfRating(3, efScoreThreshold('ef5', LINCOLN), LINCOLN);
    assert.equal(stepEfRating('EF-4', earned, 30).badge, 'EF-5');
  });

  test('REGRESSION: the LAST rung of a climb is rate-limited too', () => {
    // An earlier version exempted single-rung promotions. That made the step
    // EF-3 -> EF-4 exempt the moment the ladder had reached EF-3, so the
    // skipped rung was displayed for one frame. Live probe, 2026-08-29:
    // EF-2 at t=4.22s -> EF-4 at t=5.72s, with EF-3 never sampled.
    const earned = resolveEfRating(2, efScoreThreshold('ef4', LINCOLN) + 1, LINCOLN);
    assert.equal(earned.badge, 'EF-4');
    assert.equal(stepEfRating('EF-3', earned, 0).badge, 'EF-3', 'not on the next frame');
    assert.equal(stepEfRating('EF-3', earned, dwell - 0.01).badge, 'EF-3');
    assert.equal(stepEfRating('EF-3', earned, dwell).badge, 'EF-4', 'only after the dwell');
  });

  test('demotions are immediate, only promotions are stepped', () => {
    const earned = resolveEfRating(2, 0, LINCOLN);
    assert.equal(earned.badge, 'EF-1');
    assert.equal(stepEfRating('EF-4', earned, 0).badge, 'EF-1');
  });

  test('an unreadable or absent badge shows what was earned', () => {
    const earned = resolveEfRating(3, 10_000_000, LINCOLN);
    assert.equal(stepEfRating('', earned, 0).badge, 'EF-5');
    assert.equal(stepEfRating('EF-?', earned, 0).badge, 'EF-5');
  });

  test('every rung is displayed on the way up, whatever the score curve', () => {
    // Drive the stepper the way the game does -- resolve, step, repeat -- for a
    // run that outruns the ladder completely, and assert the displayed sequence
    // never gains more than one rung at a time and misses none.
    let shown = 'EF-0';
    let held = 0;
    const seen: string[] = [shown];
    for (let frame = 0; frame < 1_800; frame++) {
      const seconds = frame / 60;
      const stage: 1 | 2 | 3 = seconds < 6 ? 1 : seconds < 12 ? 2 : 3;
      // Scores far above every gate from the first frame: the worst case.
      const next = stepEfRating(shown, resolveEfRating(stage, 10_000_000, LINCOLN), held);
      held = next.badge === shown ? held + 1 / 60 : 0;
      if (next.badge !== shown) seen.push(next.badge);
      shown = next.badge;
    }
    assert.deepEqual(seen, ['EF-0', 'EF-1', 'EF-2', 'EF-3', 'EF-4', 'EF-5']);
  });

  test('efRungRank orders the rungs and rejects everything else', () => {
    assert.equal(efRungRank('EF-0'), 0);
    assert.equal(efRungRank('EF-5'), 5);
    assert.ok(efRungRank('EF-4') > efRungRank('EF-3'));
    assert.equal(efRungRank('EF-9'), -1, 'out of range');
    assert.equal(efRungRank('nonsense'), -1);
  });
});

describe('grade curve', () => {
  const grade = (objectivesDone: number, contentObjectiveDone: boolean, destructionScore: number) =>
    resolveGrade({ objectivesDone, contentObjectiveDone, destructionScore, scoreTarget: PRAIRIE });

  test('REGRESSION: a huge score with no content objective cannot reach A', () => {
    // The device run that exposed this scored 149,669 with LANDMARKS 0/2 and was
    // graded A purely on score thresholds that a good run cleared in a minute.
    assert.equal(grade(2, false, 149_669), 'B');
    assert.equal(grade(2, false, 10_000_000), 'B');
  });

  test('the content objective plus the target earns an A', () => {
    assert.equal(grade(3, true, PRAIRIE), 'A');
    assert.equal(grade(3, true, PRAIRIE - 1), 'B', 'one point short of target is not an A');
  });

  test('S+ needs every objective and half again the target', () => {
    assert.equal(grade(3, true, PRAIRIE * 1.5), 'S+');
    assert.equal(grade(2, true, PRAIRIE * 1.5), 'A', 'objectives missing, so not S+');
  });

  test('lower grades step down cleanly', () => {
    assert.equal(grade(1, false, PRAIRIE * 0.4), 'B');
    assert.equal(grade(0, false, PRAIRIE * 0.4), 'C', 'no objective earned, so no B');
    assert.equal(grade(0, false, PRAIRIE * 0.1), 'C');
    assert.equal(grade(0, false, PRAIRIE * 0.1 - 1), 'F');
  });

  test('grades never invert as score rises', () => {
    const order: Record<string, number> = { F: 0, C: 1, B: 2, A: 3, 'S+': 4 };
    let previous = 0;
    for (let score = 0; score <= PRAIRIE * 2; score += PRAIRIE / 40) {
      const rank = order[grade(3, true, score)]!;
      assert.ok(rank >= previous, `grade fell at score ${score}`);
      previous = rank;
    }
  });
});

describe('campaign stars', () => {
  test('two completed objectives always clear the county', () => {
    // Load-bearing: this is why a mis-tuned score target cannot hard-block the
    // campaign. A player who does the work still advances.
    assert.equal(resolveStars(0, FINALE, 2), 1);
  });

  test('three stars need every objective as well as the score', () => {
    assert.equal(resolveStars(FINALE * 1.5, FINALE, 3), 3);
    assert.equal(resolveStars(FINALE * 1.5, FINALE, 2), 2, 'score alone is not three stars');
  });

  test('star bands follow the target', () => {
    assert.equal(resolveStars(FINALE, FINALE, 0), 2);
    assert.equal(resolveStars(FINALE * 0.6, FINALE, 0), 1);
    assert.equal(resolveStars(FINALE * 0.6 - 1, FINALE, 0), 0);
  });

  test('the device run lands where the tuning intends', () => {
    // 149,669 at Prairie Junction with 1 of 3 objectives: two stars, and the
    // finale still has something left to earn.
    assert.equal(resolveStars(149_669, PRAIRIE, 1), 2);
    assert.equal(resolveStars(149_669, FINALE, 1), 2);
  });
});
