# QA Automated Full-Round Report

- Tested commit: `fd57e59d65b5cf98a2c4e99c2c8b2f66dff2ed87`
- Workflow run: `196`
- Mode: normal-audio scripted full round
- Started: 2026-09-06T12:51:02.208Z
- Finished: 2026-09-06T12:55:26.635Z
- Runtime: 245 seconds

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
- Destruction score: 52202
- Base score: 13210
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 0
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 9
- Moo events observed: 17
- Glass events observed: 69
- Final active voices: 7
- Peak EF rating: EF-5
- Ended by rope-out: no (lowest integrity 100)
- Driver headings: 164 steered at a target, 0 fell back to the pattern

## EF ladder (recorded, not asserted)

Sampled every 5 seconds, so a rung held for less than that can be missed here.
The driver finishes well below the county target, so the upper rungs are not
expected to appear; the guarantee that no rung is skipped lives in the unit tests
over `stepEfRating`.

| At | Rung | Score | District |
|---|---|---|---|
| 0s | EF-0 | 0 | 1 |
| 15s | EF-1 | 1592 | 1 |
| 35s | EF-2 | 3453 | 1 |
| 95s | EF-3 | 10655 | 2 |
| 115s | EF-4 | 18665 | 2 |
| 175s | EF-5 | 34045 | 3 |

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
