# QA Automated Full-Round Report

- Tested commit: `56b2a6f1844700b007eebabab55190e4d3702e47`
- Workflow run: `46`
- Mode: normal-audio scripted full round
- Started: 2026-08-22T02:52:42.642Z
- Finished: 2026-08-22T02:55:53.953Z
- Runtime: 180 seconds

## Checks

| Check | Result |
|---|---|
| roundCompleted | PASS |
| noPageErrors | PASS |
| noConsoleErrors | PASS |
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
- Destruction score: 29756
- Base score: 9458
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 1
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 10
- Moo events observed: 13
- Glass events observed: 17
- Final active voices: 7

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
