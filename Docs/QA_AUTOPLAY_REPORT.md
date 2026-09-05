# QA Automated Full-Round Report

- Tested commit: `d5d031484f8d630278812a707242e9221402e728`
- Workflow run: `187`
- Mode: normal-audio scripted full round
- Started: 2026-09-04T23:57:51.019Z
- Finished: 2026-09-05T00:02:40.034Z
- Runtime: 265 seconds

## Checks

| Check | Result |
|---|---|
| roundCompleted | PASS |
| noPageErrors | PASS |
| noConsoleErrors | PASS |
| noFailedRequests | PASS |
| districtProgressionMonotonic | PASS |
| reachedDistrictThree | PASS |
| popupCapObserved | PASS |
| musicDecodedWithEnergy | PASS |
| musicEventsObserved | PASS |
| syntheticMooNeverPlayed | PASS |
| audioContextInitialized | PASS |
| harnessCompletedWithoutException | PASS |

## Round result

- Final district: 3
- Time remaining: 0
- Destruction score: 38922
- Base score: 12310
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 0
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 9
- Moo events observed: 14
- Glass events observed: 71
- Final active voices: 7
- Peak EF rating: EF-5
- Ended by rope-out: no (lowest integrity 100)
- Driver headings: 177 steered at a target, 0 fell back to the pattern

## EF ladder (recorded, not asserted)

Sampled every 5 seconds, so a rung held for less than that can be missed here.
The driver finishes well below the county target, so the upper rungs are not
expected to appear; the guarantee that no rung is skipped lives in the unit tests
over `stepEfRating`.

| At | Rung | Score | District |
|---|---|---|---|
| 0s | EF-0 | 0 | 1 |
| 10s | EF-1 | 989 | 1 |
| 50s | EF-2 | 3990 | 1 |
| 80s | EF-3 | 8606 | 2 |
| 140s | EF-4 | 19173 | 2 |
| 195s | EF-5 | 34056 | 3 |

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
