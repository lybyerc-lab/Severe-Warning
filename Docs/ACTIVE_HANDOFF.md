# Active Handoff

Last updated: 2026-08-01
Repository: `lybyerc-lab/Severe-Warning`
Current milestone: `v4.5.0 Storm Feel Overhaul`

## Active work

- Gameplay branch: `agent/v450-storm-feel-overhaul`
- Draft gameplay PR: `#10`
- Browser QA branch: `qa`
- Audio Lab and QA correction delivery candidate: `7e600462520223930db1e255638bb9fcf83330c3`

## Latest verified browser QA

- URL: `https://lybyerc-lab.github.io/Severe-Warning/`
- Successful QA commit: `62a2dc861539be917ea3305fb7e5a651655a15d5`
- Pages run: `#3`
- Result: opened successfully on Galaxy S26 Ultra

## Current unverified Pages candidate

- Exact gameplay candidate: `7e600462520223930db1e255638bb9fcf83330c3`
- Correction script: `scripts/apply-qa-corrections-patch.mjs`
- Patch script commit: `0b54ce1d30e280e9f68376fbb122a7790e6ab5c0`
- Patch-chain commit: `6e1395664c3990f0d2349efd527113eeb09e3153`
- Status: committed; Pages build result not yet verified through the available connector
- Do not describe this candidate as browser-QA passed or physically accepted yet.

Included work:
- Audio Lab with individual clip audition
- music, ambience, effects, and news bus solo controls
- recent sound-event log with clip, trigger, gain, pan, bus, and status
- decoded clip RMS energy and active voice diagnostics
- higher but still subordinate music mix targets
- explicit glass routing, pickup-glass removal, cooldown, and concurrency limit
- popup aggregation, three-callout cap, HUD-safe placement, and 2.2x / 2.8x / 3.5x thresholds
- forward-only district progression
- monotonic stage-three elapsed clock so time pickups cannot relock substations

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

1. Verify the Pages workflow for exact candidate `7e600462520223930db1e255638bb9fcf83330c3`.
2. Open the QA page on the Galaxy S26 Ultra.
3. Use Audio Lab to confirm both music clips have non-zero energy and audible playback.
4. Reproduce the intermittent synthetic sound and capture its logged clip and trigger.
5. Test repeated destruction for glass dominance and throttled events.
6. Collect a time pickup after reaching districts 2 and 3; confirm no backward transition or substation relock.
7. Stress dense destruction; confirm no more than three local callouts and readable aggregation.
8. Correct any browser-QA failures before building another APK.
9. Build a new APK only after browser QA passes.
10. Complete physical Android acceptance before merging PR #10.

## New-chat prompt

> Open `lybyerc-lab/Severe-Warning`. Read `AGENTS.md` and every file it lists. Then inspect PR #10 and the `qa` branch before changing anything. Treat repository records as authoritative and ask before overriding an accepted behavior or durable decision.
