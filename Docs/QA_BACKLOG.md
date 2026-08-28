# QA Backlog

Last updated: 2026-08-28

**This is the defect register** — numbered defects with observed behaviour,
correction and acceptance criteria. For "what should I build next", read
`Docs/BACKLOG.md` instead; that is the living work board and it is the first
required read in `AGENTS.md`.

## Open — assets

### ASSET-001: Three intact models can be seen through

Status: open, assigned to the asset lane

Observed:
- Two barrel-vault warehouses read as ghosts in a play screenshot on 2026-08-27.
- The cause is not transparency. Every material involved is `MeshStandardMaterial`
  with `transparent: false`, `opacity: 1`, `side: FrontSide`.
- `industrial-warehouse-curved`: one end of the barrel vault was never capped.
  16 edges belong to a single triangle each and trace a closed ring on the plane
  `z = -6` — the mouth of the vault. Front-face culling discards the faces
  pointing away from the camera, so where the cap should be you look straight
  through the building. Rendered in isolation it is a solid dome from one end and
  an almost invisible crescent from the other. Worst angle: 65.2% backface.
- `farm-windmill`: a large sphere around the fan whose faces point inward. It is
  invisible from most angles and a solid white ball from one — rendered at four
  yaw angles it is a normal windmill at 0/90/270 and a white ball at 180. In play
  the windmill would balloon as the camera orbits past. Worst angle: 68.5%.
- `tractor`: 31.5%. Flagged by the same check; the cause has **not** been
  established and nobody has confirmed it is visible in play. Diagnose first.

Correction:
- cap the open end of the curved warehouse vault and re-export
- fix the winding on the windmill sphere, or drop it if it is a leftover, and
  re-export
- diagnose the tractor before changing it

Acceptance:
- `pnpm models:seethrough` reports PASS with no intact model above the threshold
- the repaired models render solid from all eight tested angles
- these are **repairs, not new models**, so they do not consume the model budget

Notes:
- Wrecks are deliberately excluded from the failure list: a wreck is meant to be
  torn open and a torn edge legitimately shows its back. Eight are above the
  threshold and printed as a note. `farm-windmill-wreck` at 86.9% probably
  carries the same inside-out sphere as its intact twin and is worth checking
  while that one is open.
- The check is not yet wired into the build, on purpose — it fails today and CI
  was only just restored to green. It should become a build guard once these are
  repaired.


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

### ASSET-001: See-through geometry and hollow model repairs

Status: resolved on `qa`; automated visual see-through inspection `128/128` passing (`pnpm models:seethrough`)
Observed in: live browser/mobile play and camera fly-around
Reproduction command: `pnpm models:seethrough`

Observed coordinates & symptoms:
- **District 1 (Hart Farm & Pine Ridge)**:
  - Farm Windmill ($X: -240, Z: -160$): solid white sphere ballooning across the fan at 180° due to inverted sphere winding and solid cylinder discs.
  - Water Tower ($X: -260, Z: -120$): elevated water tank cylinder lacked bottom cap; visible hollow hole from standard camera angles.
  - Grain Bins & Silos ($X: -220, Z: -140$): bottom cylinder rims and hopper cones had unsealed undersides when tossed by storm vortex.
  - Hart Farmhouse & Ranch Houses ($X: -280 \dots -180, Z: -200 \dots -160$): overhanging eaves wedges and porch roofs had inverted/missing underside quads, showing sky/terrain through walls.
- **District 2 (Downtown Commercial & Industrial Row)**:
  - Industrial Quonset Warehouse ($X: -160, Z: 96$): barrel vault $Z = -6$ mouth uncapped, showing transparent shell and ghost interior.
  - Tractor ($X: -240, Z: -180$): rear wheel hub had invalid `wy => 0.95` lambda parameter yielding `NaN` vertex positions and corrupted mesh.
  - Commercial Stores ($X: -120 \dots 80, Z: -40 \dots 60$): mansard roof wedges and parapet caps had missing back/bottom quads.
- **District 3 (County Fairgrounds)**:
  - Ferris Wheel & Carousel ($X: 180, Z: 220$): passenger gondolas and carousel canopy lacked sealed bottom faces.

Root cause:
- `addCylinder` in `tools/asset-pipeline/glb-builder.mjs` only generated top caps (`y = +halfH`) and omitted bottom caps (`y = -halfH`), and inverted triangle winding when rotated by $\pi/2$.
- `addSphere` in `glb-builder.mjs` generated clockwise inward-pointing triangles, creating inside-out spheres.
- `tractor` generator had `wy => 0.95` lambda as the Y coordinate of the wheel hub.
- `addWedge` and `addPyramid` shared non-planar normal vectors `[0, 1, 0]` across all faces rather than generating true face-specific outward facet normals.

Implemented correction:
- Added watertight bottom caps with correct outward CCW winding to `addCylinder` in `glb-builder.mjs`.
- Corrected sphere triangle winding order in `addSphere`.
- Replaced solid cylinder discs on windmill with hollow concentric `addTorus` hoops.
- Fixed tractor wheel hub Y coordinate to `0.95`.
- Sealed both front and rear endwalls on `industrial-warehouse-curved`.
- Re-authored `addWedge` and `addPyramid` with exact facet normals.
- Added automatic Y-min grounding in `GlbBuilder.toGlbBuffer()` enforcing the $Y_{\text{min}} = 0.0$ export contract.
- Verified with `pnpm models:seethrough` (`scripts/check-model-see-through.mjs`): 128/128 models passing with 0% intact backface leakage.

Acceptance:
- `pnpm models:seethrough` audits all 128 `.glb` models with 0 defects below 20% threshold.
- All intact models show 0% backface visibility from all 8 camera angles.

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
