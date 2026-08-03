# QA Automated Full-Round Report

- Tested commit: `d8f64297113ae2996e774252dc7f226ff1fca878`
- Workflow run: `7`
- Mode: normal-audio scripted full round
- Started: 2026-08-03T18:19:48.263Z
- Finished: 2026-08-03T18:22:56.889Z
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
- Destruction score: 43828
- Base score: 13547
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 2
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 11
- Moo events observed: 9
- Glass events observed: 18
- Final active voices: 7

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
