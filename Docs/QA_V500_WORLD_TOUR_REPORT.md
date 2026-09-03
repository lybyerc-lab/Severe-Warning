# V5 Heartland World-Tour QA Report

- Tested commit: `dca5a7fc669d8bfd830f82048a09be540588f918`
- Workflow run: `180`
- Mode: mobile-landscape four-stop authored-world sweep
- Started: 2026-09-03T11:39:27.583Z
- Finished: 2026-09-03T11:40:22.372Z

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
| cow17PresentAtEveryStop | PASS |
| cow17EarTagPersists | PASS |
| fourHayBaleLandingZones | PASS |
| animalsRemainUnharmed | PASS |
| roadsFollowGroundAtEveryStop | PASS |
| noPageErrors | PASS |
| noConsoleErrors | PASS |
| noFailedRequests | PASS |
| harnessCompletedWithoutException | PASS |

## Stop contracts

| Stop | Profile | Scenery | Landmarks | Animals | Cow 17 | Terrain samples |
|---|---:|---:|---|---:|---|---|
| lincoln-county | 0 | 14 | LINCOLN WATER TOWER, COUNTY COURTHOUSE | 38 | tagged | 0.73 / 3.89 / -0.28 |
| prairie-junction | 1 | 21 | PRAIRIE GRAIN ELEVATOR, JUNCTION WINDMILL | 24 | tagged | -0.57 / 1.69 / -0.23 |
| grain-belt | 2 | 11 | NORTH SILO BANK, HEARTLAND FOUNDRY | 18 | tagged | 3.93 / 3.74 / -1.21 |
| state-fair-finale | 3 | 23 | CHAMPIONSHIP FERRIS WHEEL, HEARTLAND GRANDSTAND | 8 | tagged | 0.15 / -0.47 / -0.17 |

## Errors

- Page errors: 0
- Console errors: 0
- Harness exception: no

## Interpretation boundary

This sweep proves that every stop constructs a distinct terrain, scenery, landmark, challenge, media, and animal-density contract without browser errors. It does not replace subjective phone play, thermal testing, or judging whether the authored differences are fun enough.
