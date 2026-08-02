# QA Backlog

Last updated: 2026-08-01

## Blockers

### AUDIO-001: Gameplay music is inaudible beneath effects

Status: second correction committed on `qa`; browser and physical verification pending
Observed in: APK #46 and QA browser feedback on 2026-08-01
Latest correction candidate: `9e26252b12ea951590e10d6e111183f19ace41d4`

Confirmed user finding:
- Music exists but cannot be heard over destruction and ability effects.

Implemented diagnostics and correction:
- Log music clip start and gain-change events.
- Display music bus gain and active music voices.
- Display decoded clip RMS energy.
- Raise music bus base gain from 0.78 to 1.00.
- Raise low-intensity music target from 0.14 to 0.22.
- Raise high-intensity music contribution from 0.16 to 0.24.
- Reduce effects bus base gain from 0.92 to 0.68.
- Dynamically reduce the effects bus to 0.61 with three or more active effects voices and 0.54 with five or more.
- Preserve the accepted wind ambience levels.

Acceptance still required:
- Low-intensity music becomes audible within three seconds of beginning a run.
- Higher-intensity layer increases with combo or EF progression.
- Music remains supportive rather than dominant.
- Wind, major destruction, and news remain intelligible.

### AUDIO-002: Glass sound is overused

Status: correction committed on `qa`; browser and physical verification pending
Observed in: APK #46
Correction candidate: `7e600462520223930db1e255638bb9fcf83330c3`

Implemented correction:
- Commercial targets no longer route to glass automatically.
- Glass now requires explicit glass or window evidence.
- Removed the glass sound from ordinary pickup collection.
- Added a 0.32-second glass cooldown and one-voice glass concurrency limit.
- Log throttled glass events for QA.

Acceptance still required:
- Glass plays only for glass-bearing targets or explicit window events.
- Repeated destruction does not produce glass as the dominant material sound.

### AUDIO-003: Synthetic moo sounds like a “synth fart”

Status: offending clip identified and disabled in gameplay; replacement pending
Observed in: QA browser feedback on 2026-08-01
Offending clip: `moo_1`
Latest correction candidate: `9e26252b12ea951590e10d6e111183f19ace41d4`

Root cause:
- `moo_1` is generated from descending saw-wave tones and does not resemble a believable cow vocal.

Implemented correction:
- Disable `moo_1` during normal gameplay playback.
- Log attempted moo playback as `disabled-synthetic-source`.
- Leave the clip available in Audio Lab for diagnosis only.

Replacement requirement:
- Replace with a commercially usable real cow vocal, verified CC0/public-domain recording, or a higher-quality original recording.
- Do not restore the synthetic source to gameplay.

### GAMEPLAY-001: District progression can move backward

Status: correction committed on `qa`; browser verification pending
Observed during automated browser round
Correction candidate: `7e600462520223930db1e255638bb9fcf83330c3`

Implemented correction:
- District selection uses `Math.max(currentStage, timeStage)`.
- Added a forward-only design-law anchor.
- Stage-three elapsed time is monotonic so time pickups cannot relock active substations.

Acceptance still required:
- Time pickups may increase remaining time but never return to a completed district.
- Completed transitions never replay.
- Stage-three substations never relock after a time pickup.

## High priority

### UI-001: Rampage popup congestion

Status: correction committed on `qa`; browser verification pending
Correction candidate: `7e600462520223930db1e255638bb9fcf83330c3`

Implemented correction:
- One major banner remains active at a time.
- Local damage callouts are capped at three.
- Hits within a 90-millisecond window aggregate into one chain-reaction result.
- Popup placement avoids the storm and uses wider HUD-safe margins.

Acceptance still required:
- Popups remain readable during dense destruction.
- Popups do not cover the storm or objective panel.

### UI-002: Rampage thresholds trigger too early

Status: candidate thresholds committed on `qa`; browser verification pending

Candidate thresholds:
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

Status: implemented on `qa`; Pages build and browser QA pending
Implementation candidate: `7e600462520223930db1e255638bb9fcf83330c3`

Implemented controls:
- Play every manifest clip individually.
- Solo music, ambience, effects, and news buses.
- Show selected clip, decoded RMS energy, bus gains, audio context state, mute state, total voices, and music voices.
- Show recent event history with clip name, trigger, gain, pan, bus, and status.

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
