# QA Automated Full-Round Report

- Tested commit: `2e5e0213f320cf082c9f4de7dc4e939a2207c830`
- Workflow run: `77`
- Mode: normal-audio scripted full round
- Started: 2026-08-25T01:42:59.479Z
- Finished: 2026-08-25T01:47:38.115Z
- Runtime: 260 seconds

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
- Destruction score: 19275
- Base score: 6459
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 0
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 10
- Moo events observed: 8
- Glass events observed: 9
- Final active voices: 7

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
