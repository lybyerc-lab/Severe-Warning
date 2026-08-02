# Active Handoff

Last updated: 2026-08-02
Repository: `lybyerc-lab/Severe-Warning`
Current milestone: `v4.5.0 Storm Feel Overhaul`
Current build-train gate: Stage 4 Visual Lab and deterministic browser test

## Active work

- Gameplay branch: `agent/v450-storm-feel-overhaul`
- Draft gameplay PR: `#10`
- Browser QA branch: `qa`
- Latest audio/gameplay correction candidate: `9e26252b12ea951590e10d6e111183f19ace41d4`
- Score continuity patch: `db4f270a999ed4ad515326b727e4a76283290c5d`
- Score patch-chain commit: `2d56b422329109fa373502516409aaadcdb34296`
- Score Pages gate: `42e1aa4d788c1e250015558a77655266e0d171be`
- QA4 Visual Lab patch: `9c643f03830c810382966bbd456ead0a072076f4`
- QA4 patch-chain commit: `901802d281aa47ad9ffba4961f7e4f34ba438f66`
- QA4 Pages gate: `5ad8277cba47cc684df39da3832f66544ce706d0`

## Latest verified browser QA

- URL: `https://lybyerc-lab.github.io/Severe-Warning/`
- Successful QA commit: `62a2dc861539be917ea3305fb7e5a651655a15d5`
- Pages run: `#3`
- Result: opened successfully on Galaxy S26 Ultra

## Current unverified Pages candidate

- Latest runtime-affecting Pages gate commit: `5ad8277cba47cc684df39da3832f66544ce706d0`
- Status: committed; workflow result and browser QA evidence pending
- Do not describe this candidate as building, built, browser-QA passed, or physically accepted without direct evidence.

Included work:
- Audio Lab with individual clip audition and bus diagnostics
- audio corrections for music, glass routing, and disabled synthetic moo
- readable rampage feedback and compact district transitions
- forward-only district progression
- continuous scoring through the former 3999 and 7999 ceilings
- Visual Lab with manual buttons for Pull, Gust, Grid Zap, tree response, collapse, popup, district transition, and results
- approximately 30-second deterministic Tornado test
- self-reporting pass/fail report at `window.__SEVERE_WEATHER_QA4_REPORT__`
- checks for score continuity, monotonic progression, console errors, duration, results, and audio cleanup
- URL activation through `?qa4=true`, `?qa4=run`, or `#qa4`

## QA4 test contract

The deterministic test intentionally activates only through the Visual Lab or `?qa4=run`. Normal gameplay remains unchanged until QA mode is deliberately invoked.

Expected sequence:

1. fresh Tornado run
2. Pull vortex
3. Gust and tree response
4. Grid Zap cascade
5. damage popup
6. structure collapse
7. cross 3999 score boundary
8. district 2 transition
9. cross 7999 score boundary
10. district 3 transition
11. results screen
12. audio cleanup
13. final report at approximately 30 seconds

Stage 4 is implemented but not passed. A successful build alone does not satisfy the Stage 4 exit criteria.

## Open performance concern

- A recovered headless Chromium capture displayed `FPS: 11` at the Main Street transition.
- This is not evidence of Galaxy S26 Ultra performance and has not been reproduced under controlled instrumentation.
- Track as `PERF-001` in `Docs/QA_BACKLOG.md`.

## Build-train rule

- No Android APK should be requested until Stages 1 through 4 pass browser QA.
- Stage 5 signing and update-in-place work remains locked.

## Latest APK

- Build: `#46`
- Exact head: `ead2beb7eb0b4358894909d558690ef718dca488`
- SHA-256: `c5523eb86e5fbd45089ff194587475b92be00b4c2de77722a0d74706f42c5ed4`
- Status: physically tested, not accepted

## Protected behavior

- accepted fullscreen and illustrated presentation
- accepted Gust tree response
- accepted Pull response
- accepted v4.5.0 wind ambience
- realistic recorded-effect direction from APK #46 remains preferable to rejected arcade pew/ping sounds

## Immediate next work

1. Confirm the Pages workflow result for `5ad8277cba47cc684df39da3832f66544ce706d0`.
2. Open the exact QA build and activate `?qa4=run`.
3. Observe the full 30-second sequence without manual intervention.
4. Copy and inspect `window.__SEVERE_WEATHER_QA4_REPORT__` or the Visual Lab report.
5. Correct any failed subsystem without widening scope.
6. Repeat the deterministic test and verify materially consistent results.
7. Complete one normal three-minute browser round on the same candidate.
8. Record pass/fail evidence in `Docs/QA_BACKLOG.md` and `Docs/BUILD_LEDGER.md`.
9. Advance to Stage 5 only after Stage 4 passes.

## New-chat prompt

> Open `lybyerc-lab/Severe-Warning`. Read `AGENTS.md` and every file it lists. Then inspect PR #10 and the `qa` branch before changing anything. Treat repository records as authoritative and ask before overriding an accepted behavior or durable decision.
