# QA Automated Full-Round Report

- Tested commit: `544a6d2df422f61320c293470b9e5f668f5ae9e1`
- Workflow run: `9`
- Mode: normal-audio scripted full round
- Started: 2026-08-03T20:24:02.615Z
- Finished: 2026-08-03T20:27:24.787Z
- Runtime: 190 seconds

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
- Destruction score: 20823
- Base score: 6837
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 0
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 10
- Moo events observed: 12
- Glass events observed: 13
- Final active voices: 7

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
