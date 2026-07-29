# Severe Weather Current Status

Last updated: 2026-07-29
Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`
Unity editor: `6000.3.0f1`
Primary target: Android

## Canonical memory order

1. Current repository code and physical-device evidence
2. This status file
3. `Docs/TORNADO_TACTICAL_PRODUCT_DIRECTION.md`
4. `Docs/HTML_2_5_UNITY_PARITY_MATRIX.md`
5. `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
6. Current production documents in `Docs/`
7. `Docs/Archive/SEVERE_WEATHER_ALL_MARKDOWNS.md`

Important project decisions and test evidence must be committed to the repository. Chat is working context, not the durable source of truth.

## Current source state

Current pre-pivot `main` source commit:

`9b856fd2586bc0c70e3ee95da02fe1dfe0162f74`

This commit contains:

- the repaired Unity Build 5.2 source foundation
- Unity identity `v0.1.9 / Build 5.2`
- Android version code `9`
- repaired Derecho input calls
- repaired `InvincibleAnimal` namespace and safe landing height
- restored Build 5.2 HUD cleanup telemetry
- restored production-scene generation
- HTML Mechanics Lab v2.5.0 Tactical View and World Expansion
- a procedural `FunnelCloudMeshVFX` source file that is not yet integrated into the runtime bootstrap

The unconfigured duplicate GameCI workflow was removed. Unity Build Automation remains the intended Android build route.

## Build status

A Unity build may be launched from current `main` to establish whether the repaired Build 5.2 foundation compiles and launches.

Expected build settings:

- branch: `main`
- Unity: `6000.3.0f1`
- project subfolder: blank
- pre-export method: `SevereWeather.Editor.ProductionSliceBuilder.CreateProductionSliceScene`
- Android APK
- IL2CPP
- ARM64
- debug signing
- Library caching enabled
- clean build only if Unity reports stale generated content

Expected identity:

- `B5.2 ABILITY FEEDBACK CLEANUP`
- `v0.1.9`

No cloud-build result or physical-device result for commit `9b856fd2` has been recorded yet.

## Locked product pivot

HTML 2.5 is now the authoritative gameplay, layout, pacing, comfort, and enjoyment reference.

Unity remains the production engine, but Unity must reproduce and improve the HTML experience instead of continuing as a separate debug-first interpretation.

The primary production vertical slice is Tornado only.

The locked direction includes:

- HTML-style tactical camera and look-ahead
- comfortable mobile movement
- Pull, Gust, and Grid Zap
- generous destruction
- four readable districts: Downtown, Suburbs, Industrial, Farmland
- score, combo, EF growth, timer, objectives, radar, and results
- persistent event-driven warning/news ticker
- breaking-news callouts
- active, safe storm chasers and captured-on-camera bonuses
- invincible, flingable animals with safe landings
- opening broadcast and ending news recap
- dramatically improved tornado, landscape, destruction, lighting, atmosphere, audio, and aftermath

Authoritative pivot documents:

- `Docs/TORNADO_TACTICAL_PRODUCT_DIRECTION.md`
- `Docs/HTML_2_5_UNITY_PARITY_MATRIX.md`

## Non-negotiable rules

- The player is the storm.
- Direct action comes before management.
- HTML 2.5 is the fun blueprint.
- Unity must match or beat HTML 2.5 on the same physical Android device.
- Tornado receives the first complete production pass.
- People remain protected and off-limits.
- Animals are invincible and may be lifted, orbited, flung, and safely landed.
- Storm chasers are witnesses and moving footage zones, not targets.
- The news ticker reports real gameplay events.
- Graphics must improve gameplay readability, power, scale, and aftermath.
- Build success does not equal production readiness.

## Immediate sequence

1. Run the repaired Build 5.2 Unity build from current `main`.
2. Record the exact source commit and cloud-build result.
3. Install and test the APK on the physical Android device.
4. Record Build 5.2 launch, movement, abilities, destruction, and five-minute cleanup behavior.
5. Preserve the verified Build 5.2 baseline.
6. Begin the Tornado Tactical vertical slice on a controlled feature branch.
7. Implement tactical camera and movement first.
8. Add a dense test district, flingable cow prototype, event-driven ticker stub, and one safe storm chaser.
9. Compare Unity directly against HTML 2.5 on the same device.

## First post-baseline gate

Unity must prove:

- tactical camera comfort
- movement comfort
- readable tornado silhouette
- satisfying Pull, Gust, and Grid Zap
- rapid access to destructible targets
- visible aftermath
- one invincible animal capture, fling, and safe landing loop
- one event-driven ticker update
- one storm chaser footage-zone interaction
- acceptable Android performance

Supercell and Derecho remain preserved but cannot displace Tornado parity work until this gate passes.

## Known technical debt

- `DamageableStructure.cs` still uses deprecated `Rigidbody.drag` and `angularDrag` properties.
- `FunnelCloudMeshVFX` is not connected to `GameBootstrap`.
- Unity player HUD is still debug-oriented.
- HTML 2.5 systems are not yet ported into Unity production code.
- Repository inventory and checksums require regeneration after the design-document merge.
- Final authored assets, audio, pooling, profiling, and wider device coverage remain open.
