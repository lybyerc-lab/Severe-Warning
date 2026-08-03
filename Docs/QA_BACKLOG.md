# QA Backlog

Last updated: 2026-08-03

## Visual Engine Laboratory

### VISUAL-LAB-001: Install, build, and browser benchmark gate

Status: source implemented; dependency/install verification blocked by workspace approval-credit exhaustion

Publish status: local commits only. Remote push and draft PR creation were also blocked by approval-credit exhaustion; this is not a code or Git authentication failure.

Implemented on `agent/visual-engine-lab-foundation`:

- isolated pinned Babylon.js/TypeScript/Vite package
- renderer-neutral schema and rejection tests
- four runtime quality tiers and diagnostics
- farm-to-town benchmark, layered tornado, five-stage barn, procedural Cow 17, deterministic replay, reset, and disposal
- static verification passed with no runtime CDN markers or `Math.random()` use

Required before Browser benchmark passed:

- generate and commit `package-lock.json` using the approved registry path
- `npm ci` succeeds inside `Experiments/VisualEngineLab/`
- typecheck, unit tests, contract tests, replay tests, and production build pass
- accelerated replay reaches barn wreckage and safe cow recovery, then returns debris and states to baseline
- zero page errors, console errors, and unhandled rejections
- controls and diagnostics remain usable at 1365×630, 932×430, 915×412, and 740×360
- built runtime makes no CDN or external asset request

Physical Android/WebView testing is a later gate and is not authorized by laboratory browser success.

## V5 campaign foundation

### QA-004: Full-round workflow Playwright setup

Status: closed by strict full-round run #5

Observed:
- V5 full-round run #3 failed in `Install Playwright browser harness` before gameplay.
- Historical runs #1 and #2 also failed, so the workflow has no prior green baseline.

Correction:
- pin Playwright `1.55.0` in project dev dependencies and the pnpm lockfile
- use `pnpm exec playwright install --with-deps chromium`
- remove mixed npm/pnpm installation

Acceptance:
- dependency installation succeeds with `pnpm install --frozen-lockfile`
- the complete normal-audio browser round executes and records its report

Run #4 finding:
- Playwright installation and browser launch succeeded.
- The workflow was green, but the report failed `roundCompleted` and `reachedDistrictThree`.
- Headless rendering averaged about `3 FPS`; the capped simulation delta advanced only about 47 seconds during 205 seconds of wall time.
- The report writer exited successfully unless the harness threw, so failed required checks did not fail CI.

Correction:
- drive the warning countdown with monotonic real time while keeping the physics delta capped
- do not charge warning time while paused, hidden, or recovering from a long OS suspension
- fail the playtest process whenever any required named check fails

Acceptance:
- full-round workflow reaches district three and results in approximately three wall-clock minutes
- every named required check passes
- a failed required check produces a failed workflow

Accepted evidence:
- exact tested commit: `c445324951311efdd0bc1da80f28b53c47d49e81`
- workflow run: `30828701004` / run #5
- runtime: 185 seconds
- district three reached and results completed at time 0
- all `11/11` checks passed
- page errors: 0; console errors: 0; harness exception: none

### V5-001: Heartland campaign progression

Status: implemented on `agent/v500-heartland-campaign`; structural and inherited full-round browser QA passed, four-stop tour play pending

Acceptance:
- four Heartland stops are visible on the weather map
- only Lincoln County is initially unlocked
- clearing a stop unlocks the next stop
- stars and best scores update without erasing storm high scores or cosmetics
- Next Stop begins the newly unlocked county without reloading the app

### V5-002: Durable campaign save

Status: implemented; physical Android lifecycle verification pending

Candidate: `Severe-Weather-v5.0.0-Mobile-Test-47.apk` from exact commit `b3dcc63`

Acceptance:
- unlocked stop, selected stop, stars, best score, and run count survive Android close and reopen
- corrupt or missing save data safely falls back to Lincoln County
- the schema remains `severe_weather_campaign_v1`

### V5-003: Heartland stop identity

Status: authored four-stop world-tour candidate implemented; automated CI and physical Android acceptance pending

Implemented:
- distinct station, brief, district names, color treatment, spawn point, target score, and score modifier for each stop
- four road-safe terrain profiles and ground palettes
- stop-specific ridge, prairie/rail, harvest/industrial, and neon-fair scenery
- eight unique destructible landmarks, including water tower, courthouse, grain elevator, windmill, silo bank, foundry, Ferris wheel, and grandstand
- regional media call signs, broadcast identity, bonus challenges, fog treatment, target tint, and animal density
- local mobile-landscape browser sweep loaded all four stops with no page or console errors

Still required before calling V5 accepted:
- pass the strict full-round plus four-stop world-tour CI workflow from the exact candidate commit
- confirm all four stops feel meaningfully different on the Galaxy S26 Ultra
- preserve mobile frame pacing while increasing authored distinction

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

### GAMEPLAY-002: Score freezes at district ceilings while damage continues

Status: correction committed on `qa`; browser verification pending
Observed by user during live QA play on 2026-08-02
Observed ceilings: `3999` and `7999`
Correction commits: `db4f270a999ed4ad515326b727e4a76283290c5d`, `2d56b422329109fa373502516409aaadcdb34296`, `42e1aa4d788c1e250015558a77655266e0d171be`

Root cause:
- `addScore()` hard-clamped total score by district.
- Damage still resolved after the ceiling, but the score delta returned zero.
- Stage-specific EF limits and total score accumulation were incorrectly coupled.

Implemented correction:
- Total destruction score now accumulates continuously for every awarded hit.
- Stage-specific EF and storm-size limits remain owned by `updateEFRating()`.
- Added the `SCORE_CONTINUITY_V1` source marker.
- Pages verification rejects the legacy `2999`, `3999`, and `7999` score clamps.

Acceptance still required:
- Score crosses 3999 during continued damage without pausing or changing districts.
- Score crosses 7999 during continued damage.
- Stage-one and stage-two EF caps remain unchanged.
- Popup awards and final results match the actual accumulated score.

## High priority

### UI-001: Rampage popup congestion and center-screen obstruction

Status: second correction committed on `qa`; browser verification pending
Initial correction candidate: `7e600462520223930db1e255638bb9fcf83330c3`
Latest polish commits: `531a9361ef4f7a5c33492465dc7ae37d7cd755c0`, `66e3438b8c7d28ea8a9602b24077488ac6d5ff33`, `b534ab323dfc63c4c6276a64a3f1eca03077a763`

Implemented correction:
- One major banner remains active at a time.
- Local damage callouts are capped at three.
- Hits within a 90-millisecond window aggregate into one chain-reaction result.
- Popup placement avoids the storm and uses wider HUD-safe margins.
- Major rampage banners now use a compact top-band pill instead of a large center-screen title.
- Major banner animation duration was reduced from 1.18 seconds to 0.86 seconds.
- The Pages build gate rejects the legacy center-screen banner signature.

Acceptance still required:
- Popups remain readable during dense destruction.
- Popups do not cover the storm, objective panel, or active destruction.
- The compact banner remains celebratory without becoming visually timid.

### UI-002: Rampage thresholds trigger too early

Status: candidate thresholds committed on `qa`; browser verification pending

Candidate thresholds:
- Wrecking Spree: 2.2x
- Rampage: 2.8x
- Maximum Mayhem: 3.5x

### UI-003: District transition obscures active play

Status: correction committed on `qa`; browser verification pending
Observed during recovered browser playtest evidence
Correction commits: `531a9361ef4f7a5c33492465dc7ae37d7cd755c0`, `66e3438b8c7d28ea8a9602b24077488ac6d5ff33`, `b534ab323dfc63c4c6276a64a3f1eca03077a763`

Implemented correction:
- Replaced the full-screen darkened transition card with a compact top ribbon.
- Kept the district name, subtitle, and bonus challenge visible.
- Reduced normal transition dwell from 1.9 seconds to 1.25 seconds.
- Reduced bot transition dwell from 0.7 seconds to 0.45 seconds.
- Added `contain: layout paint` to limit layout and paint spill.

Acceptance still required:
- District identity is immediately readable.
- Gameplay remains visible throughout the transition.
- Transition does not interfere with controls or obscure the storm.

### PERF-001: Main Street transition captured at 11 FPS in headless browser

Status: open; not yet reproduced under controlled instrumentation
Observed in: recovered Chromium playtest capture at the Main Street boundary

Interpretation boundary:
- The captured value may be a transient headless-renderer hitch and is not evidence of Galaxy S26 Ultra performance.
- The UI polish reduces overlay area and animation duration, but no performance improvement is claimed without measurement.

Verification required:
- Capture frame-time samples before, during, and after both district transitions.
- Separate simulation, DOM/layout, and renderer stalls where practical.
- Repeat in the browser QA lane and later on the target Android device.

### INFRA-001: APK cannot update in place

Status: passed on Galaxy S26 Ultra

Evidence:
- Signed QA-3 was already installed.
- Signed QA-5 from workflow `30842904406` installed over QA-3 without uninstalling.
- Stable application ID: `com.lybyerclab.severeweather.qa`.
- QA-5 version code: `500005`; version name: `5.0.0-qa.5`.
- The separate legacy `5.0.0` icon is the older debug application identity, not a failed QA update.

Expected:
- Dedicated persistent QA signing key.
- Stable application ID.
- Increasing version code per QA build.
- Later APKs install over the existing QA app without deleting it.

### BOVINE-001: Cow Signature physical acceptance

Status: automated-browser-QA passed and signed QA-6 built; physical acceptance pending
Implementation commit: `cffbeb2`
Exact CI candidate: `4917d16`
Signed artifact: `severe-weather-v5.0.0-qa-6` from workflow `30849403030`
APK SHA-256: `eb7299af09b1888307cc91507028b44d00b3ae5b01a90969a67c28a8eb23a0d8`

Verify on the Galaxy S26 Ultra:
- Cow 17 is visually recognizable and remains present across all four campaign stops.
- Cow-Cam is rare, funny, brief, and does not steal control or hide Pull, Gust, or Zap.
- the Bovine Situation Report is readable with both result buttons visible
- reported relocations, airtime, distance, and hay-bale landings behave plausibly
- cows remain invincible and visibly unharmed
- Moo Brew jokes do not overwhelm ordinary news coverage
- cattle detail does not cause unacceptable frame pacing, heat, or battery use
- Cow 17 career state survives app close and reopen

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
