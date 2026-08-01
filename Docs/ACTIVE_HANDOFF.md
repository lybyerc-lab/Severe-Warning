# Active Handoff

Last updated: 2026-08-01
Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`
Current milestone: `v4.5.0 Storm Feel Overhaul`

## Active branches and pull requests

- Gameplay branch: `agent/v450-storm-feel-overhaul`
- Draft gameplay PR: `#10`
- Browser QA branch: `qa`
- Repository-memory branch: `agent/project-memory-foundation`

## Latest browser QA

- GitHub Pages URL: `https://lybyerc-lab.github.io/Severe-Warning/`
- QA branch commit: `62a2dc861539be917ea3305fb7e5a651655a15d5`
- Pages workflow run: `#3`
- Result: deployed successfully and opened on the user's Galaxy S26 Ultra in Chrome
- Visible build badge: `QA #3 · 62a2dc8`

## Latest Android APK

- Build: `#46`
- Exact gameplay head: `ead2beb7eb0b4358894909d558690ef718dca488`
- APK SHA-256: `c5523eb86e5fbd45089ff194587475b92be00b4c2de77722a0d74706f42c5ed4`
- Status: physically tested but not accepted

## Physical findings from APK #46

- Music was not audible during the run.
- Glass-shattering audio triggered too frequently.
- An unidentified synthetic or flatulent-sounding effect played intermittently.
- Rampage popups returned but require congestion control.
- District progression may move backward after a time pickup.

## Protected accepted behavior

Do not regress these while correcting v4.5.0:

- v4.4.0 fullscreen and illustrated-storm presentation
- v4.4.1 Gust tree-pull response
- v4.4.2 Pull feedback
- v4.5.0 wind ambience from APK #42
- realistic recorded-effect direction from APK #46 is better than the rejected arcade pew/ping layer

## Immediate next actions

1. Establish repository memory documents and startup contract.
2. Add stable code anchors and design-law comments without changing behavior.
3. Add an in-game Audio Lab and recent sound-event log to the QA branch.
4. Diagnose why music clips are packaged but inaudible.
5. Reduce glass routing frequency and identify the intermittent synthetic sound by logged clip name.
6. Add popup arbitration and aggregation.
7. Make district progression forward-only.
8. Publish corrections to GitHub Pages first.
9. Build a new APK only after browser QA passes.
10. Establish persistent QA signing so later APKs update in place.

## New-chat startup prompt

Use this exact instruction:

> Open `lybyerc-lab/Severe-Warning`. Read `AGENTS.md` and every file it lists. Then inspect PR #10 and the `qa` branch before changing anything. Treat repository records as authoritative and ask before overriding an accepted behavior or durable decision.
