# QA Automated Full-Round Report

- Tested commit: `dc36e98f9dcd5a2d31fdfd365d8f6f9d5430a945`
- Workflow run: `183`
- Mode: normal-audio scripted full round
- Started: 2026-09-03T21:20:55.272Z
- Finished: 2026-09-03T21:24:59.605Z
- Runtime: 220 seconds

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
- Destruction score: 48587
- Base score: 14849
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 0
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 9
- Moo events observed: 15
- Glass events observed: 81
- Final active voices: 7
- Peak EF rating: EF-5
- Ended by rope-out: no (lowest integrity 100)
- Driver headings: 147 steered at a target, 0 fell back to the pattern

## EF ladder (recorded, not asserted)

Sampled every 5 seconds, so a rung held for less than that can be missed here.
The driver finishes well below the county target, so the upper rungs are not
expected to appear; the guarantee that no rung is skipped lives in the unit tests
over `stepEfRating`.

| At | Rung | Score | District |
|---|---|---|---|
| 0s | EF-0 | 0 | 1 |
| 10s | EF-1 | 939 | 1 |
| 35s | EF-2 | 3596 | 1 |
| 75s | EF-3 | 9325 | 2 |
| 110s | EF-4 | 18654 | 2 |
| 165s | EF-5 | 34229 | 3 |

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
