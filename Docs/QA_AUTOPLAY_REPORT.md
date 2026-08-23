# QA Automated Full-Round Report

- Tested commit: `3cca895a5adf37fab0e84752ae8c47796f32d6ba`
- Workflow run: `53`
- Mode: normal-audio scripted full round
- Started: 2026-08-23T14:47:45.545Z
- Finished: 2026-08-23T14:51:41.118Z
- Runtime: 220 seconds

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
- Destruction score: 22188
- Base score: 7258
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 1
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 10
- Moo events observed: 9
- Glass events observed: 8
- Final active voices: 7

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
