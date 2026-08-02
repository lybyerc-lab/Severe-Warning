# Active Handoff

Last updated: 2026-08-02
Repository: `lybyerc-lab/Severe-Warning`
Current milestone: `v4.5.0 Storm Feel Overhaul`
Current build-train gate: combined browser verification for Stages 1 through 3

## Active work

- Gameplay branch: `agent/v450-storm-feel-overhaul`
- Draft gameplay PR: `#10`
- Browser QA branch: `qa`
- Latest audio/gameplay correction candidate: `9e26252b12ea951590e10d6e111183f19ace41d4`
- UI polish script commit: `531a9361ef4f7a5c33492465dc7ae37d7cd755c0`
- UI polish patch-chain commit: `66e3438b8c7d28ea8a9602b24077488ac6d5ff33`
- UI polish Pages verification gate: `b534ab323dfc63c4c6276a64a3f1eca03077a763`
- QA backlog update: `e1a2b9e67a330dcbfe3982d231a1873d43074eab`

## Latest verified browser QA

- URL: `https://lybyerc-lab.github.io/Severe-Warning/`
- Successful QA commit: `62a2dc861539be917ea3305fb7e5a651655a15d5`
- Pages run: `#3`
- Result: opened successfully on Galaxy S26 Ultra

## Current unverified Pages candidate

- Latest runtime-affecting Pages gate commit: `b534ab323dfc63c4c6276a64a3f1eca03077a763`
- Status: committed; workflow result and browser QA evidence pending
- Do not describe this candidate as building, built, browser-QA passed, or physically accepted without direct evidence.

Included work:
- Audio Lab with individual clip audition
- music, ambience, effects, and news bus solo controls
- recent sound-event log with clip, trigger, gain, pan, bus, and status
- decoded clip RMS energy and active voice diagnostics
- music bus and layer increases with dense-effects ducking
- synthetic `moo_1` disabled during gameplay
- explicit glass routing, pickup-glass removal, cooldown, and concurrency limit
- popup aggregation, three-callout cap, HUD-safe placement, and 2.2x / 2.8x / 3.5x thresholds
- forward-only district progression
- monotonic stage-three elapsed clock so time pickups cannot relock substations
- compact top-band major rampage banner that no longer occupies the center of play
- compact top-ribbon district transition that preserves the district name, subtitle, and bonus challenge
- district transition dwell reduced from 1.9 seconds to 1.25 seconds for normal play
- Pages verification rejects the legacy center-screen rampage banner and missing UI polish markers

## Open performance concern

- A recovered headless Chromium capture displayed `FPS: 11` at the Main Street transition.
- This is not evidence of Galaxy S26 Ultra performance and has not been reproduced under controlled instrumentation.
- The UI polish reduces overlay area and animation duration, but no performance improvement is claimed yet.
- Track as `PERF-001` in `Docs/QA_BACKLOG.md`.

## Build-train correction

- The premature Android QA workflow was removed at `14b01e08def78ad9b755edb8aa9e6f237f1e58e5`.
- No Android APK should be requested until Stages 1 through 4 pass browser QA.
- Stage 4 Visual Lab and deterministic test remain locked until Stages 1 through 3 are demonstrated.

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

1. Confirm the Pages workflow result for the current `qa` runtime candidate.
2. Open the QA page and confirm the exact visible build stamp before testing.
3. Complete Stage 1 Audio Lab checks for all 44 clips, bus solo behavior, bounded logging, and music energy.
4. Complete Stage 2 checks for audible music, dynamic high layer, glass routing, absent synthetic moo, and stable buses.
5. Complete Stage 3 checks for popup readability, compact major banners, compact district transitions, approved thresholds, and forward-only progression.
6. Measure frame time before, during, and after district transitions without treating a headless FPS label as device evidence.
7. Record pass or fail evidence in `Docs/QA_BACKLOG.md` and `Docs/BUILD_LEDGER.md`.
8. Implement Stage 4 Visual Lab and deterministic test only after Stages 1 through 3 pass.
9. Build Android only after Stage 4 passes browser QA.

## New-chat prompt

> Open `lybyerc-lab/Severe-Warning`. Read `AGENTS.md` and every file it lists. Then inspect PR #10 and the `qa` branch before changing anything. Treat repository records as authoritative and ask before overriding an accepted behavior or durable decision.
