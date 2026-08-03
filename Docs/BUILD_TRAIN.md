# Severe Weather Build Train

Last updated: 2026-08-03
Current milestone: `v5.0.0 Heartland Campaign Foundation`
Authority: repository memory

## Active V5 fast track

The user explicitly approved advancing directly to V5 on 2026-08-03. The active requirements are defined in `Docs/V5_BUILD_TRAIN.md`. The v4.5 stages below remain historical verification context and protected-regression coverage; they are no longer the active roadmap gate.

## Purpose

This document defines the required order for the next QA and Android builds. It exists so a new chat cannot accidentally skip diagnostics, combine unrelated risks, or request another costly APK before browser QA is ready.

Do not skip a stage, merge an unaccepted gameplay milestone, or widen a stage without explicit user approval. Every completed stage must update `Docs/ACTIVE_HANDOFF.md`, `Docs/QA_BACKLOG.md`, and `Docs/BUILD_LEDGER.md`.

## Build-train rules

1. GitHub Pages is the default test lane for gameplay, UI, audio routing, and diagnostics.
2. Each QA stage must display its build number and commit hash.
3. A stage is complete only when its exit criteria are demonstrated in the browser QA build.
4. Failed findings remain open in `Docs/QA_BACKLOG.md`; they are not buried inside chat history.
5. Do not create another Android APK until Stages 1 through 4 pass browser QA.
6. Android physical acceptance remains separate from browser-QA approval.
7. Preserve all behavior listed in `Docs/ACCEPTED_BEHAVIOR.md`.
8. Use stable anchors from `Docs/CODE_ANCHORS.md` in every subsystem touched.

## Stage 1: QA-1 Audio Diagnostics

Goal: make every sound event observable before changing the mix.

Scope:

- add the in-game Audio Lab
- add `[SW:AUDIO:EVENT_LOG]`
- log clip name, trigger, bus, gain, pan, start time, and active voice count
- show music, ambience, effects, and news bus gains
- add solo and mute controls for each bus
- add one-button playback for every manifest clip
- show decoded clip duration and non-zero energy status
- preserve current gameplay behavior and sound assets

Browser-QA checks:

- every one of the 44 clips can be played individually
- music clips report successful decode and non-zero energy
- playing a clip creates a readable event-log entry
- bus solo and mute controls affect only the selected bus
- the event log remains bounded and does not degrade gameplay

Exit criteria:

- the missing-music path is observable
- the glass trigger path is observable
- the unidentified synthetic sound can be named by clip and trigger
- no accepted wind or ability behavior regresses

## Stage 2: QA-2 Audio Corrections

Goal: correct the known audio defects using evidence from Stage 1.

Scope:

- fix inaudible gameplay music
- establish low- and high-intensity music behavior
- confirm rampage stinger routing
- reduce glass routing to glass-bearing targets or explicit window events
- add glass cooldown and concurrency limits
- replace, remove, or reroute the identified synthetic sound
- preserve accepted wind ambience
- preserve the realistic recorded-effect direction

Browser-QA checks:

- low music is audible within three seconds of starting a run
- high layer increases with combo or EF intensity
- music remains below wind, destruction, and news
- glass no longer dominates ordinary destruction
- the offending synthetic sound is absent or replaced
- event log confirms expected clip and bus routing

Exit criteria:

- `AUDIO-001`, `AUDIO-002`, and `AUDIO-003` meet their acceptance criteria
- no new clipping, runaway voices, or permanently muted buses

## Stage 3: QA-3 Rampage and Progression

Goal: restore readable arcade feedback and make district progression monotonic.

Scope:

- add `[SW:UI:RAMPAGE_FEEDBACK]`
- aggregate simultaneous damage callouts
- cap local damage callouts at three
- allow only one major banner at a time
- raise major rampage thresholds
- add `[SW:GAMEPLAY:DISTRICT_PROGRESSION]`
- add `[SW:LAW:DISTRICTS-FORWARD-ONLY]`
- decouple completed-district state from remaining time
- prevent time pickups from moving progression backward or replaying transitions

Browser-QA checks:

- simultaneous hits remain readable
- popups do not cover the storm or objective panel
- Wrecking Spree, Rampage, and Maximum Mayhem trigger only at approved thresholds
- a time pickup near a district boundary cannot return the player to a completed district
- every district transition occurs at most once

Exit criteria:

- `UI-001`, `UI-002`, and `GAMEPLAY-001` meet their acceptance criteria
- full round reaches the finale without duplicated or reversed transitions

## Stage 4: QA-4 Deterministic Test and Build Hardening

Goal: make future testing fast, repeatable, and self-reporting.

Scope:

- add the Visual Lab
- add a deterministic approximately 30-second test
- exercise Grid Zap, Gust, Pull, tree response, destruction, popups, collapse, district transition, and results
- report event counts, progression state, audio voice counts, and console errors
- keep the fast Pages workflow separate from full audio generation
- update repository records automatically or with a required release checklist

Browser-QA checks:

- deterministic test completes from a fresh page load
- report includes pass or fail for every exercised subsystem
- no uncaught console errors
- no backward progression
- audio buses and voice counts return to idle after cleanup
- repeat test produces materially consistent results

Exit criteria:

- `QA-002` and `QA-003` meet their acceptance criteria
- the full v4.5.0 browser candidate passes a normal round and the deterministic test

## Stage 5: Android QA Packaging

Goal: eliminate uninstall-and-reinstall friction before the next physical candidate.

Scope:

- create a dedicated persistent QA signing key
- keep a stable QA application ID
- increase version code monotonically
- build APK only through the manual signed-QA workflow
- publish the APK through a rolling GitHub prerelease or equivalent stable location
- verify that the new APK installs over the previous QA APK

Required security rule:

- use a QA-only signing key, never a production distribution key
- repository secrets must not expose raw key material in source or logs

Exit criteria:

- `INFRA-001` meets its acceptance criteria
- a signed QA APK updates in place on the Galaxy S26 Ultra
- exact APK SHA-256, commit, workflow run, and version code are recorded

## Stage 6: v4.5.0 Physical Candidate

Goal: perform one meaningful physical-device acceptance run after browser QA passes.

Physical test checklist:

- music is audible and dynamically responsive
- wind ambience remains accepted
- ability and material effects remain believable
- glass is not overrepresented
- no unidentified synthetic sound occurs
- rampage feedback is readable
- districts progress forward only
- complete three-minute run succeeds
- retry and cleanup succeed
- fullscreen, controls, frame pacing, heat, and battery remain acceptable

Exit criteria:

- user explicitly approves the exact APK build
- evidence is recorded in `Docs/BUILD_LEDGER.md`
- accepted behavior is added to `Docs/ACCEPTED_BEHAVIOR.md`
- only then may PR #10 be marked ready and considered for merge

## Beyond v4.5.0

After v4.5.0 physical acceptance, resume the product roadmap in `Docs/PRODUCT_VISION_AND_ROADMAP.md`:

1. `v4.6.0 Farmyard Mayhem`
2. `v5.0.0 Heartland Campaign Foundation`
3. South / Coastland campaign and waterspout systems
4. East Coast dense-infrastructure campaign
5. West Coast terrain and fire-system campaign
6. twin-funnel and multi-vortex advanced forms

Each later milestone must receive its own build train before implementation begins.
