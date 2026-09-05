# QA Automated Full-Round Report

- Tested commit: `dafc1845f766caf48c76a682183d784f3db10d1e`
- Workflow run: `188`
- Mode: normal-audio scripted full round
- Started: 2026-09-05T00:07:37.411Z
- Finished: 2026-09-05T00:12:34.987Z
- Runtime: 275 seconds

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
- Destruction score: 31393
- Base score: 10168
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 0
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 9
- Moo events observed: 8
- Glass events observed: 64
- Final active voices: 7
- Peak EF rating: EF-4
- Ended by rope-out: no (lowest integrity 86.6)
- Driver headings: 184 steered at a target, 0 fell back to the pattern

## EF ladder (recorded, not asserted)

Sampled every 5 seconds, so a rung held for less than that can be missed here.
The driver finishes well below the county target, so the upper rungs are not
expected to appear; the guarantee that no rung is skipped lives in the unit tests
over `stepEfRating`.

| At | Rung | Score | District |
|---|---|---|---|
| 0s | EF-0 | 0 | 1 |
| 15s | EF-1 | 986 | 1 |
| 50s | EF-2 | 3969 | 1 |
| 110s | EF-3 | 9813 | 2 |
| 175s | EF-4 | 19730 | 2 |

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
