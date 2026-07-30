# Severe Weather Current Status

Last updated: 2026-07-30
Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`
Unity editor: `6000.3.0f1`
Primary target: Android

## Canonical memory order

1. Current repository code and physical-device evidence
2. This status file
3. `Docs/CONTEXT_CHECKPOINT_2026-07-30.md`
4. `Docs/TORNADO_TACTICAL_PRODUCT_DIRECTION.md`
5. `Docs/HTML_2_5_UNITY_PARITY_MATRIX.md`
6. `Docs/TORNADO_TACTICAL_P1_IMPLEMENTATION.md`
7. `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
8. Current production documents in `Docs/`
9. `Docs/Archive/SEVERE_WEATHER_ALL_MARKDOWNS.md`

Important project decisions and test evidence must be committed to the repository. Chat is working context, not the durable source of truth.

## Locked product direction

HTML 2.5 is the authoritative gameplay, layout, pacing, comfort, and enjoyment reference.

Unity remains the production engine, but Unity must reproduce and improve the HTML experience rather than continue as a separate debug-first interpretation.

The primary production vertical slice is Tornado.

Non-negotiable features include:

- HTML-style tactical camera and look-ahead
- comfortable mobile movement
- Pull, Gust, and Grid Zap
- generous destruction
- four readable districts
- score, combo, EF growth, timer, objectives, radar, and results
- persistent event-driven warning/news ticker
- active safe storm chasers and captured-on-camera bonuses
- invincible flingable animals with safe landings
- opening broadcast and ending news recap
- substantially improved tornado, landscape, destruction, atmosphere, audio, and aftermath

## Current implementation

Tornado Tactical P1 source is implemented on `main` and hardened with a Tornado-only input lock.

Implemented systems:

- runtime Tornado Tactical prototype installer
- pulled-back tactical camera override with velocity look-ahead
- Tornado-only production input lock
- three-minute run timer
- player-facing HUD
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
- debug HUD suppression while the tactical prototype runs

Implementation records:

- `Docs/CONTEXT_CHECKPOINT_2026-07-30.md`
- `Docs/TORNADO_TACTICAL_P1_IMPLEMENTATION.md`

## Build identity

Expected next Android build identity:

- application version: `0.2.0`
- Android version code: `10`
- build label: `Tornado Tactical P1`

Expected Unity Build Automation settings:

- branch: `main`
- exact checkpoint source commit before this docs-only checkpoint: `ec054aafb2685590711d41cacad2c15b4a5f37e0`
- Unity: `6000.3.0f1`
- project subfolder: blank
- pre-export method: `SevereWeather.Editor.ProductionSliceBuilder.CreateProductionSliceScene`
- Android APK
- IL2CPP
- ARM64
- debug signing
- Library caching enabled
- clean build only if Unity reports stale generated content

## Evidence status

Tornado Tactical P1 has been source-reviewed through the GitHub connector.

It has not yet been compiled by Unity Build Automation and has not yet been tested on a physical Android device.

No GitHub Actions workflow run or GitHub commit status was present when the checkpoint was created. Unity Build Automation must be launched from the Unity dashboard.

Do not describe the implementation as compiled, playable, stable, or accepted until those gates pass.

## First device gate

The first device build must confirm:

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

## Known P1 limitations

- The tactical prototype uses runtime installation rather than a final authored scene hierarchy.
- The HUD uses IMGUI for rapid device testing.
- Cow, chaser, and dense district assets use runtime primitives.
- Chaser logic is safe-distance steering, not final road-graph AI.
- Camera bonuses use observation distance rather than a final footage frustum.
- The final four-district county is not yet authored.
- Supercell and Derecho remain in source but cannot be selected during the P1 run.
- Radar, intro broadcast, final results menu, authored assets, and production audio remain missing.
- `DamageableStructure.cs` still uses deprecated `Rigidbody.drag` and `angularDrag` properties.
- `FunnelCloudMeshVFX` remains disconnected from the runtime tornado.
- Repository inventory and checksums require regeneration after implementation.

## Immediate sequence

1. Run Unity Build Automation from current `main`.
2. Record the exact commit selected by Unity Build Automation.
3. Capture the complete compiler result.
4. Fix all remaining compile errors in one repair pass if necessary.
5. Install the APK on the physical Android device.
6. Complete the first device gate.
7. Compare Tornado Tactical P1 directly with HTML 2.5 on the same device.
8. Tune camera, movement, destruction, cow fling, ticker, and chaser behavior from physical evidence.
