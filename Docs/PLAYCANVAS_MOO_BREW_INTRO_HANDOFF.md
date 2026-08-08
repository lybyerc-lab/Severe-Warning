# PlayCanvas Moo Brew Opening Handoff

**Created:** 2026-08-08 America/Chicago  
**Parent exact source:** `8d390f04223faaa268040afbeaa9eff885a81786`  
**Handoff branch:** `agent/playcanvas-moo-brew-intro-handoff`  
**Required implementation branch:** `agent/playcanvas-moo-brew-intro`

## Mission

Close the remaining canonical-opening gap in the bounded PlayCanvas production slice without changing accepted gameplay authority or the already-protected storm/camera/destruction behavior.

## Canonical reference

Use the established Moo Brew phase names and story order from the accepted presentation-identity runtime:

1. `newspaper`
2. `farm-reveal`
3. `moo-brew-sip`
4. `weather-warning`
5. `cow-double-take`
6. `chicken-scatter`
7. `tornado-touchdown`
8. `tactical-handoff`

The existing legacy presentation reference uses a short skippable roughly eight-second sequence. Matching the story, handoff law, and readability matters more than matching every CSS pixel.

## Critical timing law

The intro must not consume gameplay time.

Preferred integration:

1. load the PlayCanvas shell/intro presentation
2. determine whether the intro should run
3. if running, complete or skip it
4. only then connect/prepare `PlayCanvasAuthorityClient`
5. build/synchronize the normal playable slice

Do not start the authority and then hide a running warning clock behind a cinematic.

## URL/session behavior

- `?qa=1`: skip timed intro by default
- `?intro=1`: force intro even for dedicated intro QA
- `?intro=0`: bypass intro
- normal player run: show once per browser session until completed/skipped

Dedicated deterministic QA may expose a presentation-only test handle for selecting phases. It must not expose damage, scoring, or gameplay mutation shortcuts.

## Protected source behavior

The implementation must preserve exact existing behavior for:

- Run 53 tree Pull/Gust response
- Run 62 camera release stability
- Run 62 Cow 17 finite safe flight
- one-stick camera constants and trailing scale
- visible/authority movement scale
- Pull/Gust/Zap executor integration
- health/destruction/score/combo/timer authority
- staged multi-structure presentation
- structure mass hierarchy
- safe-animal law
- reset/cleanup

## Suggested code shape

Prefer a focused module such as:

`playcanvas-slice/src/moo-brew-intro.ts`

Responsibilities:

- phase definitions
- should-show decision
- overlay construction
- deterministic phase selection
- timed schedule
- skip/finish cleanup
- minimal telemetry/snapshot for QA

Keep visual CSS in the existing PlayCanvas stylesheet or a dedicated imported intro stylesheet. Do not grow `main.ts` with a large cinematic implementation.

`main.ts` should only orchestrate the intro before authority connection and publish the minimal intro QA handle/telemetry required by tests.

## Static verification

Require stable anchors such as:

- `[SW:PLAYCANVAS:MOO_BREW_INTRO]`
- `[SW:PLAYCANVAS:INTRO_BEFORE_AUTHORITY]`
- `[SW:PLAYCANVAS:INTRO_QA]`

Static checks should prove:

- exact eight phase names exist
- intro orchestration occurs before `authority.connect()`
- QA default skip and explicit force/bypass parameters exist
- session seen key exists
- no direct gameplay mutation helper is introduced

## Browser QA

Add a dedicated browser QA script rather than overloading unrelated destruction assertions.

It should verify at minimum:

1. `qa=1` starts playable without waiting for the timed intro
2. `qa=1&intro=1` exposes/plays the intro
3. deterministic phase selection reports all eight phases in order
4. newspaper phase visibly contains the warning paper
5. Moo Brew phase visibly contains Cow 17/cup presentation
6. touchdown phase visibly contains the tornado beat
7. skip/finish removes the blocking overlay
8. authority is not connected before intro completion in forced intro mode
9. post-handoff authority starts from normal baseline time/state
10. no console/page errors

Capture focused screenshots for the three key beats plus the first post-handoff playable frame.

## Workflow integration

The implementation PR targets this handoff branch. The repository-owned PlayCanvas workflow must include this base branch in its `pull_request.branches` filter and run the new intro QA alongside all inherited suites.

Do not drop or relax the existing storm, rotation, multi-structure, evidence, or exact-source gates.

## Definition of done

- strict TypeScript passes
- current static suites pass
- intro static verification passes
- current storm browser suite passes unchanged
- camera/Cow stability passes unchanged
- multi-structure destruction V2 passes unchanged
- dedicated intro browser QA passes
- evidence screenshots are packaged
- assistant reviews the exact artifact before QA promotion
- repository memory records exact source/run/artifact if promoted

No Android physical acceptance is claimed by this browser milestone.
