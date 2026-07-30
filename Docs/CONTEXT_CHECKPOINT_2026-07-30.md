# Severe Weather Context Checkpoint

Checkpoint date: 2026-07-30
Repository: `lybyerc-lab/Severe-Warning`
Canonical branch: `main`
Checkpoint source commit: `ec054aafb2685590711d41cacad2c15b4a5f37e0`
Unity editor: `6000.3.0f1`
Primary platform: Android

## Product direction

The HTML 2.5 Tactical build is the authoritative gameplay, comfort, layout, pacing, and enjoyment reference.

Unity remains the production engine. Unity must reproduce and improve the HTML experience rather than continue as a separate debug-first interpretation.

The first complete production vertical slice is Tornado.

Non-negotiable features:

- pulled-back tactical camera with movement look-ahead
- comfortable mobile movement
- Tornado Pull, Gust, and Grid Zap
- generous, readable destruction
- four recognizable districts
- score, combo, EF growth, timer, objectives, radar, and results
- persistent event-driven warning/news ticker
- breaking-news callouts
- active, safe storm chasers and captured-on-camera bonuses
- invincible, flingable animals with safe landings
- opening broadcast and ending news recap
- substantially improved tornado, landscape, destruction, lighting, atmosphere, audio, and aftermath

People remain protected, off-limits, and never casualties.

## Current implementation on main

Tornado Tactical P1 source is merged on `main` and hardened with a Tornado-only input lock.

Implemented:

- runtime Tornado Tactical prototype installer
- tactical camera override with velocity look-ahead
- Tornado-only production input lock
- three-minute run timer
- player-facing IMGUI HUD
- destruction-derived score and combo feedback
- EF rating display, breaking-news updates, and tornado growth
- persistent warning/news ticker
- dense nearby destruction test block
- conductive Grid Zap test targets
- runtime-built invincible cow
- cow orbit, Gust launch, ballistic flight, safe landing, and recovery
- safe storm-chaser SUV prototype
- chaser retreat and observation-distance behavior
- captured-on-camera bonus feedback
- suppression of the old debug HUD during the tactical prototype

## Build identity

Expected next Android build:

- application version: `0.2.0`
- Android version code: `10`
- build label: `Tornado Tactical P1`

## Unity Build Automation settings

Use:

- branch: `main`
- exact source commit: `ec054aafb2685590711d41cacad2c15b4a5f37e0`
- Unity: `6000.3.0f1`
- project subfolder: blank
- pre-export method: `SevereWeather.Editor.ProductionSliceBuilder.CreateProductionSliceScene`
- output: Android APK
- scripting backend: IL2CPP
- architecture: ARM64
- signing: debug
- Library caching: enabled
- clean build: only if Unity reports stale generated content

## Evidence status

Tornado Tactical P1 has been source-reviewed through the GitHub connector.

It has not yet been compiled by Unity Build Automation and has not yet been tested on a physical Android device.

No GitHub Actions workflow run or commit status was present for `ec054aaf` when checked. Unity Build Automation is external to the available GitHub controls and must be started from the Unity dashboard.

Do not describe P1 as compiled, playable, stable, or accepted until the Unity compiler and physical-device gates pass.

## First compiler gate

After launching Unity Build Automation:

1. Record the exact source commit shown in the build.
2. Capture the full compiler result.
3. If compilation fails, repair all reported errors in one controlled branch.
4. Do not mix graphics expansion or new features into a compiler-repair pass.
5. Build again from the exact repaired commit.

## First physical-device gate

The APK must confirm:

1. `v0.2.0` and `Tornado Tactical P1` identity.
2. Warning ticker appears across the top.
3. Tactical camera remains pulled back and comfortable.
4. Old debug HUD is hidden.
5. Timer counts down from 03:00.
6. Damage raises score and combo.
7. EF upgrades change the headline and tornado scale.
8. Dense test block appears near the initial tornado.
9. Grid Zap chains through test utility poles.
10. Pull lifts the cow into orbit.
11. Gust flings the cow and it lands safely.
12. The legacy storm-switch action cannot replace the Tornado.
13. Chaser retreats before tornado contact.
14. Destruction near the chaser triggers captured-on-camera feedback.
15. Ordinary gameplay remains at or above 45 FPS.
16. Five-minute stress testing shows no runaway clutter or severe heat regression.

Physical Android evidence is authoritative.

## Known P1 limitations

- runtime installation instead of a final authored scene hierarchy
- IMGUI player HUD
- runtime primitive cow, chaser, and test-district assets
- safe-distance chaser steering rather than road-graph AI
- observation-distance camera bonus rather than a true footage frustum
- final four-district county not yet authored
- radar missing
- intro broadcast missing
- final results menu missing
- production audio missing
- authored destruction and environment assets missing
- `DamageableStructure.cs` still uses deprecated `Rigidbody.drag` and `Rigidbody.angularDrag`
- `FunnelCloudMeshVFX` remains disconnected from the runtime tornado
- repository inventory and checksums still require full regeneration

## Protected direction

Do not:

- restore the old debug-first Unity experience as the gameplay target
- prioritize Supercell or Derecho over Tornado parity
- remove flingable animals
- remove the news ticker
- remove storm chasers
- make people valid targets
- claim build success from source inspection
- expand scope before the first P1 device comparison against HTML 2.5

## Next safe move

Start Unity Build Automation from exact `main` commit `ec054aafb2685590711d41cacad2c15b4a5f37e0`.

Then return with the complete compiler result or build log. The next engineering action is compiler repair if needed, followed by APK installation and the physical-device gate.

## Canonical supporting documents

Read in this order:

1. `CURRENT_STATUS.md`
2. `Docs/CONTEXT_CHECKPOINT_2026-07-30.md`
3. `Docs/TORNADO_TACTICAL_PRODUCT_DIRECTION.md`
4. `Docs/HTML_2_5_UNITY_PARITY_MATRIX.md`
5. `Docs/TORNADO_TACTICAL_P1_IMPLEMENTATION.md`
6. `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
7. `Docs/DEVICE_TEST_LOG.md`
