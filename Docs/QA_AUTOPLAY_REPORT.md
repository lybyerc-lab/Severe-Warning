# QA Automated Full-Round Report

- Tested commit: `3a73965f50d8a946a16b9dc6ab7065c29df181a6`
- Workflow run: `181`
- Mode: normal-audio scripted full round
- Started: 2026-09-03T21:03:34.967Z
- Finished: 2026-09-03T21:08:03.490Z
- Runtime: 250 seconds

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
- Destruction score: 35533
- Base score: 11386
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 0
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 9
- Moo events observed: 20
- Glass events observed: 59
- Final active voices: 7
- Peak EF rating: EF-5
- Ended by rope-out: no (lowest integrity 94)
- Driver headings: 167 steered at a target, 0 fell back to the pattern

## EF ladder (recorded, not asserted)

Sampled every 5 seconds, so a rung held for less than that can be missed here.
The driver finishes well below the county target, so the upper rungs are not
expected to appear; the guarantee that no rung is skipped lives in the unit tests
over `stepEfRating`.

| At | Rung | Score | District |
|---|---|---|---|
| 0s | EF-0 | 0 | 1 |
| 15s | EF-1 | 986 | 1 |
| 40s | EF-2 | 2823 | 1 |
| 95s | EF-3 | 9627 | 2 |
| 150s | EF-4 | 19642 | 2 |
| 250s | EF-5 | 35533 | 3 |

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
