# Production Decision Log

This file is append-only. Each entry records a decision, the evidence behind it, rejected alternatives, and the condition that would justify revisiting it.

## 2026-07-23 - Production foundation

### Decisions

- Freeze the HTML build as the Mechanics Laboratory.
- Select Unity 6.3 LTS with URP as the production engine.
- Keep Android as the first performance target.
- Preserve the direct-control action RPG identity.
- Define the world as a connected urban-rural region rather than isolated arenas.
- Require distinct storm verbs.
- Use County High navigation and Impact camera bands.
- Require real environment-art, region-authoring, technical-art, and audio pipelines.
- Reject the idea that zero-dependency Canvas rendering is a production requirement.

### Evidence

The browser laboratory proved mechanics and tone but repeatedly failed the dense dimensional world, material, destruction, and production-pipeline requirements.

### Revisit condition

Only a hard production blocker with measured evidence can reopen the engine decision.

## 2026-07-23 - Repository as persistent project memory

### Decision

The GitHub repository is the canonical durable project memory. Important decisions, current status, build configuration, cloud-build results, physical-device evidence, active blockers, and approved next steps must be committed with the related code whenever practical.

### Evidence

Chat-only context is difficult to version, diff, audit, or recover. The repository already contains code, validation tooling, production rules, and historical source material.

### Rejected alternative

Treating the original ChatGPT conversation as the sole canonical record.

### Revisit condition

This may be supplemented by an issue tracker or external design database, but the repository must retain a self-contained current-status and decision trail.

## 2026-07-23 - Android startup hotfix

### Decision

Keep the startup hotfix narrow: guarantee a runtime shader, create a visible camera before region generation, and surface startup exceptions on-screen.

### Evidence

Build #1 compiled and installed but displayed only black. Build #2 rendered the generated world and HUD after the focused hotfix.

### Rejected alternatives

- bundling unrelated art or control changes into the startup patch
- assuming a successful cloud build proved runtime startup

### Revisit condition

Replace the temporary unlit runtime shader only after a production material pipeline is ready and Android shader inclusion is verified.

## 2026-07-23 - Build #3 mobile-control alignment

### Decision

Repair the mobile controls as one coherent system:

- shared layout for HUD and touch hit testing
- safe-area-aware placement
- floating screen-scaled joystick with dead zone
- movement-touch ownership
- camera-relative movement for both storms
- latched one-shot inputs across Update and FixedUpdate
- pressed-state and telemetry feedback

### Evidence

Build #2 physical testing proved touch reached the app because storm switching worked, but movement was unclear and the visible ability buttons did not align with the horizontal touch bands used by input detection.

### Rejected alternatives

- adjusting only the joystick graphic
- fixing Tornado movement while leaving the Supercell override on world axes
- adding camera orbit, art, audio, loading, or new gameplay to the same patch

### Revisit condition

Tune sizes, dead zone, acceleration, and layout only from Build #3 physical-device evidence.

## 2026-07-23 - Build #4 feel and render recovery

- Build #3 proved that touch input and storm position updates were registering on the physical Android device.
- Build #3 failed because the camera tracked the storm so tightly that movement was not perceptible.
- The Build #3 opening position was a weak interaction test zone: crops were damageable but lacked colliders, so physics-based storm abilities could not find them.
- The flat emergency shader was retained only as a fallback. Build #4 generates guaranteed Standard and URP material templates, uses the stable lit built-in pipeline for the device gate, and leaves authored URP pipeline assets as a later editor-controlled migration.
- Build #4 uses a soft camera leash, stronger differentiated movement, immediate ability VFX, action status, target counts, speed, distance, build identity, graphics API, and render-pipeline telemetry.
- Crop colliders, a mixed starter test pocket, backdrop terrain, distant hills, road markings, mobility classes, approximate masses, and collider-aware density validation are part of the same recovery because they are required to judge feel and interaction honestly.
- Android build identity is set to version `0.1.4`, version code `4`, IL2CPP, ARM64, Vulkan first, and OpenGLES3 fallback.
- Build #4 remains a stylized procedural lab slice. It does not claim production art quality.

## 2026-07-24 - Make storm movement transform-authoritative

**Decision:** Tornado and Supercell roots use transform-authoritative fixed-step translation. The retained kinematic Rigidbody is no longer used as the movement authority.

**Reason:** Build #4 physical telemetry showed full joystick input, commanded speed `28.0`, and requested distance `123.7`, while the actual root position remained at its spawn coordinates. The controller called `Rigidbody.MovePosition` and then wrote rotation directly through `transform.rotation` in the same fixed step, while distance telemetry counted the requested displacement regardless of the resolved pose.

**Evidence:** Android Build #4 screenshot and device telemetry recorded in `Docs/DEVICE_TEST_LOG.md`.

**Rejected alternative:** Another camera-only adjustment. The root position itself did not change, so camera tuning alone cannot repair the failure.

**Revisit condition:** Replace transform-authoritative motion only when the player storm gains a deliberate collision-driven physics contract and automated movement tests verify resolved translation.

## 2026-07-24 - Keep Build #4.1 on one graphics API and one runtime material family

**Decision:** Build #4.1 generates only Built-in runtime material templates and targets Vulkan only for the current physical-device gate.

**Reason:** Build #4 generated unused URP Lit material assets while running the Built-in pipeline and targeted both Vulkan and OpenGLES3. That forced an extremely expensive shader preparation pass without improving the actual device presentation.

**Revisit condition:** Restore multi-API output and authored URP assets after shader stripping, pipeline configuration, and device-matrix requirements are explicit.

## 2026-07-24 - Enforce camera safety in viewport space

**Decision:** Keep approved storm movement speeds and make the camera responsible for keeping the player storm visible. Build #4.2 combines a smaller world-space leash with viewport-aware soft catch-up and immediate hard-edge recovery.

**Reason:** Build #4.1 proved both storms translate correctly, but the fast Tornado can leave the camera frame. Slowing the Tornado would hide the camera defect and weaken storm differentiation.

**Evidence:** Physical Android testing of Build #4.1 confirmed good Supercell speed, successful Tornado movement, and Tornado camera escape.

**Rejected alternatives:** Reducing Tornado speed, returning to hard follow at all times, or treating the off-screen player as acceptable.

**Revisit condition:** Replace this camera contract only when a tested authored camera system provides equal or better containment, motion readability, and distinct Tornado/Supercell feel.

## 2026-07-24 - Advance from camera validation to staged impact

**Decision:** Build #5 focuses on material-readable impact and staged destruction while preserving Build #4.2 movement and camera behavior.

**Evidence:** Physical Android testing confirmed that camera containment and Supercell framing improved. The remaining obvious placeholder is the opaque blue precipitation cylinder, and target reactions still jump through generic darkening and collapse without a clear material-stage language.

**Implementation contract:** Use five shared damage stages, material-colored impact bursts, material-specific deformation, in-place structural collapse, an animated Supercell precipitation curtain, and a mixed-material starter lane.

**Rejected alternative:** Starting missions, progression, a third storm, or final art before the destruction loop proves readable and satisfying.

**Revisit condition:** Broaden into authored fracture assets and progression only after Build #5 passes the physical impact-readability and performance gates.

## 2026-07-24 - Decision B5.1-01: Readability before feature expansion

Build #5 physical testing proved the damage pipeline, stage transitions, target detection, and precipitation replacement work, but exposed unreadable crop poses, debug-shaped hail feedback, storm occlusion, and effect-clutter risk. Build #5.1 is therefore limited to directional deformation, weather-shaped feedback, bounded transient effects, lighter ground contact, Supercell gameplay visibility, and visual-only component reactions. Persistent physics detachment, missions, progression, a third storm, full fracture prefabs, and final art remain outside scope.

## 2026-07-24 - Decision B5.2-01: Remove debug geometry before adding the game loop

**Decision:** Build #5.2 is a constrained cleanup pass. It removes the Supercell trail wedge, suppresses oversized ring and swath geometry, disables looping ground-mist scribbles, softens Tornado contact arcs, and refines flattened crop aftermath while preserving approved mechanics.

**Evidence:** Build #5.1 Android screenshots showed stable movement, target detection, effect caps, and approximately 60 FPS, but the remaining visual artifacts still read as laboratory debug shapes. The crop screenshot also proved that the spike defect was fixed while exposing a new board-like aftermath problem. The cloud build log additionally identified deprecated Unity Rigidbody damping properties.

**Rejected alternatives:** Beginning missions, progression, upgrades, a third storm, authored fracture systems, or final art before the existing storm verbs read clearly on a physical device.

**Revisit condition:** Broaden into Build #6 only after Build #5.2 compiles and a five-minute Android test confirms readable ability feedback, bounded cleanup, stable camera behavior, and acceptable frame pacing.

## 2026-07-29 - Decision AUDIT-01: Source presence is not feature acceptance

**Decision:** The production roster remains Tornado and Supercell. The July 29 Derecho, EF progression, NOAA banner, invincible-animal, power-cascade, and Mechanics Laboratory additions are classified as experimental source until they are explicitly approved, fully integrated, compiled, and physically tested.

**Evidence:** `GameBootstrap` still alternates only Tornado and Supercell. Derecho is never instantiated and lacks dedicated camera, HUD, and visual integration. The EF manager, NOAA banner, animals, and cascade helper are never created or attached by the production bootstrap or region generator. The latest supplied successful Unity build applies to commit `80f2f14`, before these additions.

**Rejected alternatives:** Treating newly present files as a working feature, silently expanding the production scope, or deleting experimental work without review.

**Revisit condition:** Reclassify an experimental feature only after an explicit scope decision, complete runtime wiring, Unity compilation of the exact source head, and appropriate physical Android acceptance evidence.

## 2026-07-29 - Decision AUDIT-02: Restore the repository evidence chain

**Decision:** Restore the removed Build #5.2 decision, correct rolled-back Build #5.1 status documents, and refresh inventory/checksum metadata in the same documentation patch.

**Evidence:** The repository policy makes `CURRENT_STATUS.md` current-state authority and declares this decision log append-only. The July 29 feature batch rolled `CURRENT_STATUS.md` and `VALIDATION_REPORT.md` back to Build #5.1, removed the Build #5.2 decision, and left inventory/checksum metadata inconsistent with tracked source.

**Rejected alternative:** Leaving contradictory documentation in place until the next gameplay patch.

**Revisit condition:** None. Future corrections must append clarification rather than deleting historical evidence.

## 2026-07-31 - Decision HTML-01: Ship the enjoyable HTML game instead of rebuilding it

**Decision:** The HTML/WebGL game becomes the active gameplay source and planned Android foundation. Unity and Godot implementations remain preserved as historical experiments. Android packaging should bundle the HTML game locally in a native web wrapper. Multiplayer is explicitly out of scope.

**Evidence:** The HTML build repeatedly proved more enjoyable than the engine ports. Browser testing of v3.0.0 completed the three-minute loop at approximately 60 FPS with all objectives and no console errors. The user explicitly selected the HTML game's feel as the product to preserve and approved a mobile single-player direction.

**Rejected alternatives:** Continuing to recreate the same game in Unity or Godot without a measured wrapper blocker; treating the HTML game as merely disposable reference material; adding multiplayer before the single-player mobile loop is proven.

**Revisit condition:** Reopen an engine port only if a bundled Android HTML build fails a documented requirement that cannot be corrected within the web runtime.

## 2026-07-31 - Decision HTML-02: Use humorous district destruction as the replayability model

**Decision:** Evolve the three-minute warning run into original storm-driven districts with environmental slapstick, randomized challenges, landmarks, unlocks, and escalating finales. Use classic arcade city-destruction structure as design inspiration without copying protected characters, locations, assets, writing, or branding.

**Evidence:** v3.1.0 implements Pine Ridge, Main Street, and County Fair; thirteen destructible comedy props; one randomized challenge per district; sequential substation activation; and a persistent Neon Funnel cosmetic. A deterministic full browser run completed all systems with no warnings or errors, and the responsive layout fit an `844x390` landscape viewport after correcting the results card.

**Rejected alternatives:** Pursuing visual realism before replayable district personality; adding a large roster of cosmetically different storms with shared verbs; using jokes about real disasters or victims.

**Revisit condition:** Expand beyond one town only after human browser play and a physical Android package confirm that the district loop remains readable, funny, comfortable, and replayable.

## 2026-07-31 - Decision HTML-03: Make the response a media circus, not a battle

**Decision:** News vans and storm chasers are the storm's moving audience. They film destruction, chase safe observation positions, retreat when the storm closes in, and drive live-reporting humor. They are invincible witnesses, never hostile units or destruction targets.

**Evidence:** The previous ten plain red vehicle boxes looked enemy-coded and simply became airborne near the storm. v3.2.0 replaces them with four white satellite vans and five yellow camera-equipped chaser SUVs, event-driven camera flashes, live headlines, safe-distance vehicle behavior, radar markers, footage scoring, and results telemetry. An initial automated round produced 43 media moments and felt noisy; a global editorial cooldown reduced the verified tuned round to eight moments and `+1289` footage points while preserving S+ completion at approximately 60 FPS.

**Rejected alternatives:** Military opposition, weapons fired at the storm, scoring crew destruction, helpless civilian vehicles, or constant broadcast notifications.

**Revisit condition:** Add drones, named reporters, or district-specific broadcast arcs only after human mobile play confirms the nine-crew scene remains readable and the current cadence remains funny rather than repetitive.

## 2026-07-31 - Decision HTML-04: Use a local Capacitor wrapper and respect the managed-PC boundary

**Decision:** Package the exact v3.2.0 HTML game with Capacitor 8.5.0, local fonts, landscape orientation, immersive fullscreen, no cleartext traffic, and no production remote navigation. Keep the generated Android project in the repository. Do not bypass company controls to install Android Studio, the Android SDK, or a JDK on the current work PC.

**Evidence:** The deterministic web build and Capacitor sync completed. The source HTML, generated `www/index.html`, and Android asset copy had identical SHA-256 hashes. The offline bundle rendered correctly at `844x390` with local fonts loaded and no document overflow. Native Gradle compilation cannot be honestly verified here because the required Android toolchain is unavailable and installation is not permitted.

**Rejected alternatives:** Rebuilding the game in another engine before measuring the wrapper; using a paid cloud-build subscription; loading game code or fonts from the network; working around managed-PC permissions.

**Revisit condition:** Reopen the wrapper decision only after a permitted physical-device build demonstrates a specific WebView, performance, input, thermal, audio, or lifecycle requirement that cannot be corrected in the web runtime.

## 2026-07-31 - Decision HTML-05: Accept the Capacitor wrapper after a real Android run

**Decision:** Keep the HTML/WebGL game as the production gameplay source and GitHub Actions as the managed-PC-safe debug APK builder. Stop treating an engine rewrite as a prerequisite for Android.

**Evidence:** GitHub Actions run `30653818627` compiled commit `d2b8fde67b76e7d5d5faa7991f9984801586836b`. The resulting APK installed on a Galaxy S26 Ultra, looked and played like the HTML build, and completed a full Tornado run at `S+` with all objectives, landmarks, substations, and district bonuses.

**Rejected alternatives:** Paying for an engine build service before the wrapper failed; bypassing work-PC software policy; describing a cloud compilation without installation as device acceptance.

**Revisit condition:** Reopen the engine question only if measured testing on the intended Android range exposes a requirement the local WebView wrapper cannot meet.

## 2026-07-31 - Decision HTML-06: Use arcade topography, not terrain physics

**Decision:** v3.3.0 uses one continuous height-mapped county with terrain-following presentation while preserving X/Z storm collision and steering. Pine Ridge rises visibly, Main Street occupies a broad shelf, County Fair rolls over low knolls, and an eastern creek breaks the board silhouette.

**Evidence:** The flat four-color board remained the largest visual weakness after Android gameplay parity was proven. Browser inspection of the new surface showed intact destruction, media behavior, score progression, road readability, and approximately `60 FPS` while moving from Pine Ridge into Main Street.

**Rejected alternatives:** Cosmetic hills that structures float through; full rigid-body terrain physics that changes the proven controls; dense imported scenery that increases APK size and mobile draw calls without improving district identity.

**Revisit condition:** Add slope-aware storm mechanics only if human play shows that elevation itself should create a new decision, not merely because the terrain exists.

## 2026-07-31 - Decision HTML-07: Clean the county before expanding the map

**Decision:** v3.3.1 is a focused presentation and movement cleanup. Extend terrain beyond the playable boundary, keep the storm scar under roads, reduce map-like contour decoration, route media crews on the road grid, and vary commercial silhouettes without changing the proven three-minute scoring structure.

**Evidence:** The first v3.3.0 phone screenshot proved the terrain concept but exposed a black world edge, a dominant opaque swath, a bright repetitive creek-bank strip, lawn-crossing media vehicles, and overly uniform building blocks. The cleanup road-routing run completed at `S+`, score `24830`, all objectives and bonuses, eight media moments, approximately `60 FPS`, and no observed console warnings or errors. A final `844x390` visual check showed no exposed void, road-bound crews, no document overflow, and a settled `61 FPS`.

**Rejected alternatives:** Expanding to a larger playable map before fixing its visible boundary; adding dense imported assets; converting the road system to physics; accepting off-road crew movement because it was mechanically harmless; hiding the world edge by moving the camera back toward the storm.

**Revisit condition:** Expand the playable county only when another district or campaign decision adds distinct mechanics and content, not merely more empty travel distance.
