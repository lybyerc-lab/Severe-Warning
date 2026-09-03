# QA Automated Full-Round Report

- Tested commit: `b92eddd0c66130a14050d3e80bdac8f507c2b9d3`
- Workflow run: `179`
- Mode: normal-audio scripted full round
- Started: 2026-09-03T01:50:08.274Z
- Finished: 2026-09-03T01:54:33.017Z
- Runtime: 240 seconds

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
- Destruction score: 41920
- Base score: 13078
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 1
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 9
- Moo events observed: 16
- Glass events observed: 74
- Final active voices: 7
- Peak EF rating: EF-5
- Ended by rope-out: no (lowest integrity 100)
- Driver headings: 161 steered at a target, 0 fell back to the pattern

## EF ladder (recorded, not asserted)

Sampled every 5 seconds, so a rung held for less than that can be missed here.
The driver finishes well below the county target, so the upper rungs are not
expected to appear; the guarantee that no rung is skipped lives in the unit tests
over `stepEfRating`.

| At | Rung | Score | District |
|---|---|---|---|
| 0s | EF-0 | 0 | 1 |
| 15s | EF-1 | 982 | 1 |
| 35s | EF-2 | 2730 | 1 |
| 85s | EF-3 | 8324 | 2 |
| 135s | EF-4 | 18602 | 2 |
| 185s | EF-5 | 34113 | 3 |

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
