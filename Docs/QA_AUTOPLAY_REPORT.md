# QA Automated Full-Round Report

- Tested commit: `aff9f2123e0d61729d0a24a00830bba72cfa798a`
- Workflow run: `170`
- Mode: normal-audio scripted full round
- Started: 2026-09-02T00:49:17.530Z
- Finished: 2026-09-02T00:52:38.992Z
- Runtime: 175 seconds

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
- Time remaining: 23.623300000000064
- Destruction score: 12507
- Base score: 4404
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 0
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 9
- Moo events observed: 10
- Glass events observed: 37
- Final active voices: 7
- Peak EF rating: EF-3

## EF ladder (recorded, not asserted)

Sampled every 5 seconds, so a rung held for less than that can be missed here.
The driver finishes well below the county target, so the upper rungs are not
expected to appear; the guarantee that no rung is skipped lives in the unit tests
over `stepEfRating`.

| At | Rung | Score | District |
|---|---|---|---|
| 0s | EF-0 | 0 | 1 |
| 15s | EF-1 | 952 | 1 |
| 35s | EF-2 | 3375 | 1 |
| 100s | EF-3 | 8760 | 2 |

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
