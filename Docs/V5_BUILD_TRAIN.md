# V5 Heartland Campaign Build Train

Last updated: 2026-08-03
Milestone: `v5.0.0 Heartland Campaign Foundation`
Active branch: `agent/v500-heartland-campaign`

## Goal

Turn the accepted arcade storm run into a replayable mobile campaign without weakening direct storm control, destruction feel, or offline Android play.

## Phase 1: Campaign foundation

Required:

- television-weather-map level selector
- four ordered Heartland stops
- locked and unlocked states
- persistent stars, best scores, run counts, selected stop, and furthest unlock
- next-stop flow from results
- corrupt-save fallback
- deterministic build patch and named verification
- a three-minute warning clock based on monotonic elapsed time rather than frame count

Exit criteria:

- campaign verifier passes
- low-render-rate automation still completes the warning run in approximately three wall-clock minutes
- failed required full-round checks fail the workflow
- existing QA4 verifier still passes
- all browser and Android workflows package v5.0.0 identity

## Phase 2: Playable Heartland tour

Required:

- Lincoln County
- Prairie Junction
- Grain Belt
- State Fair finale
- distinct station, brief, districts, palette, spawn, target, and scoring rule per stop
- no locked stop can be launched
- every cleared stop unlocks exactly the next stop

Exit criteria:

- a browser run can advance through the complete four-stop tour
- results, retry, weather map, and next-stop controls remain usable on mobile landscape
- deterministic QA reports no regressions in input, abilities, score continuity, districts, popups, or cleanup

## Phase 3: Device acceptance

Required Galaxy S26 Ultra checks:

- campaign progress survives app close and reopen
- all four stops are readable and meaningfully distinct
- fullscreen controls and camera remain accepted
- soundstage remains balanced
- frame pacing, heat, and battery remain acceptable
- signed APK identity and checksum are recorded

V5 is physically accepted only after the user approves the exact APK.

## Honest scope boundary

This milestone establishes the Heartland campaign framework and a complete four-stop progression loop using the current county world as the reusable foundation. More authored landmarks, layouts, farmyard comedy, and region-specific set pieces can deepen the stops after the foundation is stable; they must not be misrepresented as already complete.
