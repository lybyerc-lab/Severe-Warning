# QA Automated Full-Round Report

- Tested commit: `8b193b594b6cb0f7087823340fc68dd40d08be39`
- Workflow run: `4`
- Mode: normal-audio scripted full round
- Started: 2026-08-03T15:29:44.519Z
- Finished: 2026-08-03T15:33:22.782Z
- Runtime: 205 seconds

## Checks

| Check | Result |
|---|---|
| roundCompleted | FAIL |
| noPageErrors | PASS |
| noConsoleErrors | PASS |
| districtProgressionMonotonic | PASS |
| reachedDistrictThree | FAIL |
| popupCapObserved | PASS |
| musicDecodedWithEnergy | PASS |
| musicEventsObserved | PASS |
| syntheticMooNeverPlayed | PASS |
| audioContextInitialized | PASS |
| harnessCompletedWithoutException | PASS |

## Round result

- Final district: 1
- Time remaining: 133.21680000000256
- Destruction score: 25856
- Base score: 8294
- Maximum combo: 3.5
- Maximum simultaneous visible popups: 0
- Music low/high decoded energy: 0.159472 / 0.077905
- Music events observed: 8
- Moo events observed: 10
- Glass events observed: 13
- Final active voices: 7

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This automated browser round verifies control flow, progression, event routing, decoded audio energy, popup counts, and runtime errors. It cannot judge subjective loudness, realism, mix quality, mobile thermals, touch feel, or physical-device acceptance.
