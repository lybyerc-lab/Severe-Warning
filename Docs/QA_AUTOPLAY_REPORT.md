# QA Automated Full-Round Report

- Tested commit: `760a37e94f0fa70c08032f2af841ff0c09a357ff`
- Workflow run: `52`
- Mode: normal-audio scripted full round
- Started: 2026-08-23T14:04:17.734Z
- Finished: 2026-08-23T14:09:07.525Z
- Runtime: 270 seconds

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
- Destruction score: 18132
- Base score: 6134
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 0
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 10
- Moo events observed: 13
- Glass events observed: 9
- Final active voices: 7

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
