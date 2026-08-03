# V5 Heartland World-Tour QA Report

- Tested commit: `d8f64297113ae2996e774252dc7f226ff1fca878`
- Workflow run: `7`
- Mode: mobile-landscape four-stop authored-world sweep
- Started: 2026-08-03T18:22:57.074Z
- Finished: 2026-08-03T18:23:02.731Z

## Checks

| Check | Result |
|---|---|
| allFourStopsLoaded | PASS |
| uniqueTerrainProfiles | PASS |
| uniqueTerrainSamples | PASS |
| twoLandmarksPerStop | PASS |
| eightUniqueLandmarks | PASS |
| authoredSceneryPresent | PASS |
| animatedSpectaclePresent | PASS |
| uniqueRegionalChallenges | PASS |
| uniqueBroadcastIdentity | PASS |
| intentionalAnimalDensity | PASS |
| noPageErrors | PASS |
| noConsoleErrors | PASS |
| harnessCompletedWithoutException | PASS |

## Stop contracts

| Stop | Profile | Scenery | Landmarks | Animals | Terrain samples |
|---|---:|---:|---|---:|---|
| lincoln-county | 0 | 14 | LINCOLN WATER TOWER, COUNTY COURTHOUSE | 38 | 0.73 / 3.89 / -1.79 |
| prairie-junction | 1 | 21 | PRAIRIE GRAIN ELEVATOR, JUNCTION WINDMILL | 24 | 0.16 / 1.69 / -0.39 |
| grain-belt | 2 | 11 | NORTH SILO BANK, HEARTLAND FOUNDRY | 18 | 0.35 / 3.74 / -0.86 |
| state-fair-finale | 3 | 23 | CHAMPIONSHIP FERRIS WHEEL, HEARTLAND GRANDSTAND | 8 | 0.23 / -0.47 / -0.57 |

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This sweep proves that every stop constructs a distinct terrain, scenery, landmark, challenge, media, and animal-density contract without browser errors. It does not replace subjective phone play, thermal testing, or judging whether the authored differences are fun enough.
