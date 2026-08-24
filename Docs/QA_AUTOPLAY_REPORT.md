# QA Automated Full-Round Report

- Tested commit: `c8755ef30ec3788efe850404d0c60587135d3624`
- Workflow run: `74`
- Mode: normal-audio scripted full round
- Started: 2026-08-24T19:56:03.504Z
- Finished: 2026-08-24T19:59:33.193Z
- Runtime: 195 seconds

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
- Destruction score: 26955
- Base score: 8672
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 1
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 9
- Moo events observed: 11
- Glass events observed: 13
- Final active voices: 7

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
