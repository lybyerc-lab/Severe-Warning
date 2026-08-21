# QA Automated Full-Round Report

- Tested commit: `d73840cf80b569a42eba2d38b7c7c116d25ccd8a`
- Workflow run: `41`
- Mode: normal-audio scripted full round
- Started: 2026-08-21T19:36:02.167Z
- Finished: 2026-08-21T19:39:19.987Z
- Runtime: 185 seconds

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
- Destruction score: 29179
- Base score: 9318
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 2
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 9
- Moo events observed: 12
- Glass events observed: 11
- Final active voices: 7

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
