# QA Backlog

Last updated: 2026-08-01

## Blockers

### AUDIO-001: Gameplay music is inaudible

Status: open
Observed in: APK #46

Expected:
- Low-intensity music becomes audible within three seconds of beginning a run.
- Higher-intensity layer increases with combo or EF progression.
- Music remains below wind, destruction, and news announcements.

Required diagnostics:
- Log music clip start events.
- Display music bus gain and active music voices.
- Verify decoded clip energy is non-zero.

### AUDIO-002: Glass sound is overused

Status: open
Observed in: APK #46

Expected:
- Glass plays only for glass-bearing targets or explicit window events.
- Repeated destruction does not produce glass as the dominant material sound.
- Add cooldown or concurrency limits for glass events.

### AUDIO-003: Unidentified synthetic sound

Status: open
Observed in: APK #46
User description: intermittent “synth fart” sound

Expected:
- Recent-sound event log identifies every played clip, trigger, gain, and bus.
- Remove, replace, or reroute the offending clip after identification.

### GAMEPLAY-001: District progression can move backward

Status: open
Observed during automated browser round

Expected:
- District progression is monotonic.
- Time pickups may increase remaining time but never return to a completed district or replay its transition.

## High priority

### UI-001: Rampage popup congestion

Status: open
Observed during automated browser round

Expected:
- One major banner at a time.
- No more than three local damage callouts.
- Simultaneous hits aggregate into one readable result.
- Popups do not cover the storm or objective panel.

### UI-002: Rampage thresholds trigger too early

Status: open

Candidate thresholds for QA:
- Wrecking Spree: 2.2x
- Rampage: 2.8x
- Maximum Mayhem: 3.5x

### INFRA-001: APK cannot update in place

Status: open

Expected:
- Dedicated persistent QA signing key.
- Stable application ID.
- Increasing version code per QA build.
- Later APKs install over the existing QA app without deleting it.

## QA infrastructure

### QA-001: Audio Lab

Status: next

Required controls:
- Play every clip individually.
- Solo music, ambience, effects, and news buses.
- Show clip name, trigger, gain, pan, bus, and active voice count.
- Show recent event history.

### QA-002: Visual Lab

Status: planned

Required tests:
- tree sway and extraction
- Gust, Pull, and Grid Zap
- damage popup and combo banner
- building collapse
- district transition
- final results screen

### QA-003: Deterministic short test

Status: planned

Expected:
- Exercise major systems in about 30 seconds.
- Report pass/fail, event counts, console errors, and progression state.
