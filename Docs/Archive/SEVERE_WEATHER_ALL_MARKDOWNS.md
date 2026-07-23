# Severe Weather - Historical Markdown Archive

Repository role: append-only historical context. Current instructions live in `CURRENT_STATUS.md`, `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`, and the current production documents in `Docs/`. Older entries are preserved even when superseded.

Last repository archive update: 2026-07-23

---

Documents are preserved for historical and technical context. Current production direction in the master handoff and Unity production Docs takes precedence when older documents conflict.



---

## Source: `SevereWarning_RepoRoot_v0.1.0/Docs/ART_PIPELINE.md`

# Production Art Pipeline

## Tools

- Blender for modeling and destruction-ready asset construction
- Unity 6.3 URP for lighting, materials, VFX, LOD, streaming, and device profiling
- Image editor or texture-authoring tool for atlases, trim sheets, masks, and decals

## Scale and units

- Blender and Unity use meters
- Asset origins sit at ground-contact pivots
- Forward direction is documented per asset category
- Buildings, vehicles, infrastructure, vegetation, and storms share one physical scale sheet

## Modular kits

### Residential

- wall segments
- corners
- doors
- windows
- roof segments
- porches
- garages
- foundations
- gutters and vents

### Commercial and industrial

- storefront bays
- glass panels
- loading doors
- rooftop equipment
- metal wall panels
- tanks, pipes, fencing, and substations

### Rural

- barns
- sheds
- silos
- grain bins
- irrigation
- greenhouses
- equipment pads
- field-edge props

## Material strategy

- reusable trim sheets
- atlas textures
- vertex-color variation
- decals for dirt, wetness, hail, cracks, burns, and storm scars
- consistent texel density
- district-specific palette variation without breaking material identity

## Destruction-ready asset rules

Each important asset provides:

- intact parent mesh
- detachable components
- stressed visual cues
- damaged replacements
- collapse proxy
- rubble and wreckage set
- collision proxy
- LOD0, LOD1, LOD2, and distant proxy

## Performance rules

- GPU instancing for repeated props
- mesh LOD and district HLOD
- texture atlases and trim sheets
- pooled debris and particles
- simplified collision
- mobile-first shader variants
- no per-frame material instantiation


---

## Source: `SevereWarning_RepoRoot_v0.1.0/Docs/AUDIO_PIPELINE.md`

# Production Audio Pipeline

## Principle

Continuous weather can use procedural layers. Physical impacts require real recorded or professionally authored source material.

## Mixer buses

- Master
- Weather Bed
- Wind Pressure
- Rain and Hail
- Thunder and Electricity
- Structural Impacts
- Debris
- Environment
- UI and Broadcast

## Lightning event stack

1. immediate electrical snap
2. close pressure crack
3. low-frequency body
4. reflected or distant thunder tail
5. environment response such as transformer burst or glass reaction

Simple oscillator beeps are prohibited for final lightning impact.

## Hail material sets

- asphalt
- metal roof
- glass
- vehicle body
- crop field
- water
- wood siding

## Destruction material sets

- timber strain and snap
- sheet-metal flex and tear
- glass crack and burst
- masonry chip and collapse
- vehicle suspension, panel, and impact
- power equipment arc and transformer burst

## Mobile validation

Audio must be tested on:

- phone speaker
- earbuds
- low volume
- noisy room
- sustained play for fatigue

The mix must preserve useful gameplay information without becoming a constant wall of noise.


---

## Source: `SevereWarning_RepoRoot_v0.1.0/Docs/CORE_DIRECTION.md`

# Severe Weather Core Direction - Production Track

## Canonical identity

Severe Weather is a stylized 3D, direct-control weather destruction action RPG set in a dense living urban-rural region.

The player is the storm. The player does not manage weather from a dashboard.

## North star

Every storm creates a story worth retelling.

## World fantasy

The region existed before the storm arrived. Roads connect farms, towns, neighborhoods, shopping corridors, industry, utilities, rivers, rail, and civic landmarks. Destruction is more satisfying because the world appears functional and connected.

## Production rendering direction

- Unity 6.3 LTS
- Universal Render Pipeline
- Stylized dimensional 3D
- City-builder readability with action-game destruction
- County High camera for navigation
- Impact camera for close destruction
- Cinematic replay cameras separate from gameplay cameras

## Storm differentiation

### Tornado

Primary verbs:

- pull
- orbit
- lift
- throw
- carve
- concentrate
- gather debris

### Supercell

Primary verbs:

- paint a hail swath
- aim and intensify a persistent gust front
- build and route electrical charge through infrastructure
- organize a broad moving storm body
- saturate the environment through rain

The Supercell must never become a large tornado with alternate particles.

## Tone

- no human casualties
- civilians evacuated or sheltered
- property destruction is the spectacle
- animals are invincible and occasionally airborne
- deadpan news and storm-chaser framing
- cinematic weather with goofy environmental humor

## Production boundary

The HTML prototype is the mechanics laboratory. Unity is the production track. Prototype renderer limitations must not dictate the final art, map, audio, or storm design.


---

## Source: `SevereWarning_RepoRoot_v0.1.0/Docs/DECISION_LOG.md`

# Production Decision Log

## 2026-07-23

- Freeze the HTML build as the Mechanics Laboratory.
- Select Unity 6.3 LTS with URP as the production engine.
- Keep Android as the first performance target.
- Preserve the direct-control action RPG identity.
- Define the world as a connected urban-rural region rather than isolated arenas.
- Require distinct storm verbs.
- Use County High navigation and Impact camera bands.
- Require real environment-art, region-authoring, technical-art, and audio pipelines.
- Reject the idea that zero-dependency Canvas rendering is a production requirement.


---

## Source: `SevereWarning_RepoRoot_v0.1.0/Docs/MIGRATION_FROM_HTML.md`

# Migration from the HTML Mechanics Laboratory

## Keep as design reference

- Power and Stability
- direct storm control
- no-casualty tone
- news and storm-chaser framing
- terrain resistance
- tornado growth
- chain reactions
- airborne cows
- mission and aftermath structure
- actual phone playtest notes

## Reimplement in Unity

- storm movement and fields
- damage and materials
- abilities
- camera logic
- mobile controls
- mission system
- persistent damage
- audio

## Do not port directly

- procedural Canvas environment art
- sparse object placement
- oscillator-heavy impact audio
- icon-like props
- monolithic single-file architecture
- prototype-specific UI layout

## Frozen mechanics reference

`MechanicsLab/SevereWeather_MechanicsLab_v0.7.1.html` is preserved for comparison. It is not production source.


---

## Source: `SevereWarning_RepoRoot_v0.1.0/Docs/NO_DRIFT_POLICY.md`

# Severe Weather No-Drift Policy - Production Summary

1. The player is the storm.
2. Direct action comes before management systems.
3. Scale changes the view, not the genre.
4. Graphics are gameplay.
5. Destruction must be physical, readable, and persistent.
6. Power and Stability remain separate systems.
7. Every storm requires unique verbs, positioning, timing, visuals, and damage signatures.
8. Mobile is the primary design target.
9. People remain protected and off-limits as targets.
10. Technology serves the fantasy and cannot silently redefine the game.
11. External suggestions are advisory and require evaluation.
12. A build is not production-ready merely because it runs.
13. The real Android device is the final authority for touch, heat, battery, sound, and readability.
14. Core concept changes require explicit approval.
15. The canonical project source is the ChatGPT conversation.


---

## Source: `SevereWarning_RepoRoot_v0.1.0/Docs/PRODUCTION_PLAN.md`

# Production Vertical Slice Plan

## Phase 0 - Starter and toolchain

- Unity 6.3 LTS project opens
- URP and Input System resolve
- production slice scene generates
- Tornado and Supercell both move and use distinct abilities
- Android development build launches

## Phase 1 - Vision lock

- approve one target screenshot
- approve material and lighting guide
- approve region-density map
- approve scale sheet
- approve Tornado and Supercell storyboards
- approve audio reference sheet

## Phase 2 - Asset laboratory

Create production-quality:

- two houses
- one barn
- one commercial building
- one warehouse
- sedan, pickup, and SUV
- utility pole and transformer
- tree set
- crops and field-edge set
- road intersection kit

Each asset includes LOD and destruction states.

## Phase 3 - Dense living-region slice

Build one connected urban-rural region with no long inactive gaps.

## Phase 4 - Tornado proof

Prove concentrated physical destruction, debris, object displacement, and readable path damage.

## Phase 5 - Supercell proof

Prove Hail Swath, Gust Front, Electrical Network, rain response, and broad-storm navigation.

## Phase 6 - Android performance proof

- GPU instancing
- LOD and HLOD
- culling
- pooled debris and VFX
- adaptive quality
- thermals and battery
- stable touch input

## Production release gate

No production claim until:

- the region looks coherent on the real phone
- both storms feel mechanically different
- no-dead-zone playtest passes
- sound no longer feels arcade-like
- Android performance and temperature are acceptable
- previous production build remains recoverable


---

## Source: `SevereWarning_RepoRoot_v0.1.0/Docs/REGION_DENSITY_SPEC.md`

# Living Region Density Specification

## Vertical-slice target

- Approximate playable footprint: 1.2 km by 1.2 km
- Districts: farmland, small town, suburb, commercial corridor, industrial district, civic center
- One major landmark per district
- Roads, utility lines, drainage, and property access must visibly connect districts

## No-dead-zone rules

During normal movement, at least one of these should occur every three seconds:

- a destructible object reacts
- an environmental surface reacts
- a chain-reaction opportunity is visible
- a destination landmark is visible
- an infrastructure line gives navigational direction
- terrain changes storm Power or Stability
- the player is making a meaningful route choice

## Navigation visibility

From County High view, the player should normally see:

- the current district
- at least one adjacent target cluster
- one route or infrastructure connector
- one meaningful landmark or objective direction

## Rural density

Rural does not mean empty. Rural chunks use:

- crops
- farmhouses
- barns
- silos
- grain handling
- irrigation
- equipment
- windbreaks
- ponds and drainage
- substations and transmission corridors
- roads and rail crossings

## Urban density

Urban chunks use overlapping interaction layers:

- buildings
- parked and moving vehicles
- signs
- glass
- rooftop equipment
- utilities
- trees and street furniture
- drainage
- power and communication networks

## Validation

The graybox runtime reports nearest-target spacing. Final validation also requires human play, because environmental reactions and visible landmarks can make a transition meaningful even when structures are farther apart.


---

## Source: `SevereWarning_RepoRoot_v0.1.0/Docs/STORM_VERBS.md`

# Storm Verb Contract

## Tornado

### Movement identity

Fast, responsive, physical, locally precise.

### Abilities

- Suction: pull, orbit, lift, and dismantle
- Gust: burst outward and weaponize debris
- Lightning: tactical infrastructure strike

### Damage signature

A concentrated path with displaced objects, directional rubble, debris fields, uprooted vegetation, and localized infrastructure failure.

## Supercell

### Movement identity

Heavy, broad, momentum-driven, directionally strategic.

### Abilities

#### Hail Swath

A moving corridor linked to storm heading. It shreds crops, cracks glass, dents vehicles, damages roofs, and accumulates visual hail wear.

#### Gust Front

A persistent leading boundary. The player aims it through storm direction, then intensifies it. Trees, signs, vehicles, and roof panels fail in a shared downwind direction.

#### Electrical Network

Charge builds through organization. The player selects a conductive anchor through positioning. Electricity travels through connected poles, substations, rail, towers, metal roofs, and transformers.

### Damage signature

Wide hail corridors, directional wind lanes, blacked-out infrastructure networks, wet surfaces, and accumulating runoff.

## Design test

If two storm abilities can be swapped without changing the player's positioning, timing, or target-selection decision, the abilities are not differentiated enough.


---

## Source: `SevereWarning_RepoRoot_v0.1.0/Docs/UNITY_SETUP.md`

# Unity Setup Checklist

## Install

- Unity Hub
- Unity 6.3 LTS
- Android Build Support
- Android SDK and NDK Tools
- OpenJDK

## Open

Open the folder `SevereWeather_UnityProductionStarter_v0.1.0` from Unity Hub.

## Resolve packages

The project declares:

- Universal Render Pipeline 17.3.0
- Input System 1.17.0

If Unity recommends a compatible patch package for the installed 6.3 LTS editor, accept the editor-supported patch within the same major package line.

## Generate the scene

Use:

`Tools > Severe Weather > Create Production Slice Scene`

## Validate

Use:

`Tools > Severe Weather > Validate Production Starter`

## Android

- Switch build platform to Android
- Use Landscape Left orientation
- Use IL2CPP for release builds
- Use Development Build for early device profiling
- Confirm active input handling supports the Input System

## First compile notes

The starter intentionally creates materials and graybox content at runtime. Replace these primitives through the Asset Laboratory rather than polishing them into final art.


---

## Source: `SevereWarning_RepoRoot_v0.1.0/Docs/VISION_LOCK.md`

# Vision Lock v1

## One-sentence target

A living miniature county, from farms to downtown, photographed like a disaster movie and destroyed through direct control of evolving weather systems.

## Visual pillars

### 1. Readable physical world

Buildings show wall height, roof construction, foundations, entrances, and material identity. Roads connect real destinations. Infrastructure belongs to visible networks.

### 2. Storm ownership

The storm changes light, wind, precipitation, vegetation, traffic, power, surfaces, sound, and debris across the entire screen.

### 3. Dense regional fabric

The player can see or infer the next destruction opportunity. Open land remains interactive through crops, dust, water, utility corridors, trees, signs, and distant landmarks.

### 4. Material-specific failure

Wood splinters and peels. Metal bends and tears. Glass cracks and bursts. Masonry chips and collapses. Vegetation bends, strips, and uproots. Vehicles rock, slide, lift, tumble, and remain recognizable as wreckage.

### 5. Stylized, not toy-like

The game avoids photorealism, but materials, proportions, lighting, and weather behavior remain believable. Shapes are exaggerated for mobile readability without becoming childish.

## Target screenshot checklist

An approved target screenshot must show:

- one connected road network
- at least three recognizable district types
- meaningful background density
- a storm that changes the whole scene
- clear depth and scale
- readable vehicles and buildings
- no large dead empty zone
- visible weather response before destruction
- a destination landmark
- HUD that supports rather than covers the storm


---

## Source: `SevereWarning_RepoRoot_v0.1.0/MechanicsLab/README.md`

# Mechanics Laboratory

This HTML build is frozen as a rapid mechanics and interaction reference.

Known limitations:

- environment art is not production quality
- map density is inconsistent
- the Supercell does not yet achieve full production differentiation
- impact audio is overly synthetic
- the Canvas renderer is not the production renderer

Use it to compare control ideas, ability timing, mission pacing, and the established tone. Do not continue investing in its environment-rendering pipeline.


---

## Source: `SevereWarning_RepoRoot_v0.1.0/README.md`

# Severe Weather - Unity Production Starter v0.1.0

This package begins the production track for **Severe Weather**, a direct-control weather destruction action RPG set in a dense living urban-rural region.

The HTML prototype is preserved as a mechanics laboratory. It is no longer treated as the final rendering or world-production pipeline.

## Target editor

- Unity 6.3 LTS
- Universal Render Pipeline
- Android first
- Future desktop, console, and Switch-class targets

## What is included

- A Unity project scaffold with URP and Input System package declarations
- Runtime bootstrapping that creates a dense playable graybox region from an empty scene
- Direct-control Tornado and Supercell implementations
- Distinct Supercell verbs: Hail Swath, Gust Front, and Electrical Network
- Hybrid County High and Impact camera behavior
- Material-aware damage and conductive network chaining
- Wind-reactive props
- Runtime density validation
- Editor menu tools that build and validate the production slice scene
- Production art, audio, level-design, and migration standards
- Frozen HTML mechanics laboratory reference

## First desktop setup

1. Install Unity Hub.
2. Install Unity 6.3 LTS with Android Build Support, Android SDK and NDK Tools, and OpenJDK.
3. Open this folder as a Unity project.
4. Wait for packages to resolve.
5. Use **Tools > Severe Weather > Create Production Slice Scene**.
6. Open `Assets/SevereWeather/Scenes/ProductionSlice.unity` if Unity does not open it automatically.
7. Enter Play Mode.
8. Use **Tools > Severe Weather > Validate Production Starter** before building.

## Controls in the starter scene

Desktop:

- WASD or arrow keys: move the storm
- Space: primary ability
- Q: secondary ability
- E: tertiary ability
- Tab: switch between Tornado and Supercell

Mobile:

- Drag on the left side: move
- Hold the large right-side zone: primary ability
- Tap the upper-right zone: secondary ability
- Tap the middle-right zone: tertiary ability
- Tap the storm label at top-center: switch storms

## Important status

This is a production architecture and graybox starter, not final art. It is designed to prevent further investment in the prototype renderer while preserving the mechanics and design discoveries already proven through playtesting.

Unity is not installed in the current chat execution environment, so the project could not be opened or compiled in the Unity Editor here. The C# source has been structurally validated, the project layout has been checked, and all runtime dependencies are declared. The first real compile and device build remain desktop-editor gates.

## Canonical design source

The ChatGPT project conversation remains the canonical design and decision record. The documents in `Docs/` mirror the current production direction so the project can survive tool and chat transitions.


---

## Source: `SevereWarning_RepoRoot_v0.1.0/REPOSITORY_BOOTSTRAP.md`

# Repository Bootstrap

Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`

This archive is arranged at repository root. Commit `Assets/`, `Packages/`, `ProjectSettings/`, documentation, tools, and the frozen mechanics laboratory.

Do not commit Unity-generated folders such as `Library/`, `Temp/`, `Logs/`, `Build/`, `Builds/`, `Obj/`, or `UserSettings/`. They are excluded by `.gitignore`.

Recommended first commit message:

`Initialize Severe Weather Unity production starter`

After the initial commit:

1. Verify `ProjectSettings/ProjectVersion.txt` reports Unity `6000.3.0f1`.
2. Confirm `Packages/manifest.json` includes URP and the Input System.
3. Open the project in Unity and allow package restoration.
4. Run `Tools > Severe Weather > Validate Production Starter`.
5. Run `Tools > Severe Weather > Create Production Slice Scene`.
6. Make future changes on feature branches and merge through reviewed pull requests.


---

## Source: `SevereWarning_RepoRoot_v0.1.0/VALIDATION_REPORT.md`

# Validation Report

## Completed in this environment

- Required project files present
- Unity package manifest parses as JSON
- URP and Input System dependencies declared
- 22 C# source files structurally scanned
- Namespace and brace-balance checks passed
- No tab characters in C# source
- Full project and Assets-only archives created
- SHA-256 inventory generated
- Frozen mechanics laboratory included

## Not available in this environment

Unity Editor is not installed here, so these gates remain open:

- Unity C# compilation
- URP package resolution inside the Editor
- scene generation through the Editor menu
- Play Mode execution
- Android build
- real-device performance, thermals, audio, and touch testing

## First editor gate

1. Open with Unity 6.3 LTS.
2. Allow packages to resolve.
3. Run `Tools > Severe Weather > Create Production Slice Scene`.
4. Enter Play Mode.
5. Run `Tools > Severe Weather > Validate Production Starter`.
6. Fix any editor-version API changes before asset production begins.

The starter is intentionally a production architecture and graybox. It is not presented as a compiled or production-ready game build.


---

## Source: `severe-warning-v0.2.0-testing/CHANGELOG.md`

# Changelog

## v0.2.0-test.1

- Added smoother acceleration, deceleration, and boundary handling.
- Added joystick deadzone and safer edge placement.
- Reworked suction into radial pull plus orbital force and mass-sensitive lift.
- Added suction lock count and visible tether feedback.
- Added sequential mission checkpoints and objective beacon guidance.
- Added dynamic storm-chaser reactions and refreshed news ticker messages.
- Added visible numerical ability cooldowns.
- Added pause, resume, tester-end, and two-tap restart controls.
- Added automatic pause when the app loses focus.
- Added supported-device haptic feedback.
- Increased test mission duration from two to three minutes.
- Added visible build identifier and structural code anchors.


---

## Source: `severe-warning-v0.2.0-testing/README.md`

# Severe Warning v0.2.0 Test Build

Mobile-first isometric weather-destruction prototype.

## Build

- Build ID: `v0.2.0-test.1`
- Primary target: landscape mobile browser
- Deployment target: Cloudflare Workers static upload
- No external libraries or network calls

## Controls

### Mobile
- Drag anywhere in the lower-left control zone to steer.
- Hold **Suction** to pull, orbit, lift, and damage nearby objects.
- Tap **Gust Burst** for radial knockback.
- Tap **Static Zap** to strike the nearest valid target.
- Tap the pause button in the mission panel to pause, end, or restart a test.

### Desktop
- Move: `WASD`
- Hold suction: `Space`
- Gust Burst: `Q`
- Static Zap: `E`
- Pause: `P` or `Escape`

## Mission test route

1. Follow the objective beacon to the suppression station.
2. Destroy the station.
3. Return to the warm field and remain there for three seconds.
4. Enter Harlow County.
5. Reach $30,000 in damage.
6. Bonus: make a cow airborne.

## Deploy

Upload the contents of the Cloudflare upload ZIP as static files. `index.html` must remain at the ZIP root.


---

## Source: `severe-warning-v0.2.0-testing/TEST_PLAN.md`

# v0.2.0 Mobile Test Plan

Record anything that feels confusing, slow, unfair, or unexpectedly delightful.

## 1. Movement
- Make tight circles.
- Reverse direction quickly.
- Push against map boundaries.
- Note whether the tornado feels heavy, slippery, or responsive.

## 2. Suction
- Test trees, cars, poles, buildings, debris, and cows.
- Watch whether light objects orbit before release.
- Check the `LOCK` count on the suction button.
- Note objects that feel too heavy or too easy.

## 3. Mission guidance
- Follow the beacon through all four mission stages.
- Confirm each completed stage turns green.
- Confirm the warm recharge percentage advances only after the station is disabled.

## 4. Terrain and stability
- Enter the forest, ridge, cold outflow, and warm field.
- Check whether warnings and meter changes make sense.

## 5. Abilities
- Confirm cooldown numbers are readable.
- Try abilities without enough power.
- Confirm pause and two-tap restart prevent accidental restarts.

## 6. Report
- End early from the pause menu.
- Confirm the aftermath report reflects damage, level, objects flung, cow status, station status, and end condition.

## Known prototype limits
- No sound or music.
- No persistent save data.
- No graphics-quality settings.
- Destruction uses stylized 2.5D physics rather than a full rigid-body engine.


---

## Source: `severe-warning-v0.3.0-rc/CHANGELOG.md`

# Changelog

## v0.3.0-rc.1

### Added

- Storm Evolution choice screen at levels 2 and 3.
- Wide Core, Pressure Drop, and Static Feed upgrade branches.
- Objective direction arrow with distance estimate.
- Animated world-space objective beacon.
- Water-tower pressure-wave chain reaction.
- Power-pole electrical chaining.
- County-blackout bonus after three destroyed poles.
- Trampoline bounce interactions for debris and livestock.
- Damage bars for partially damaged destructible objects.
- Forecast rank, peak combo, structures lost, and upgrade loadout in the aftermath report.
- Persistent control-response selector.
- Persistent camera-shake selector with Full, Reduced, and Off settings.
- Automated release-candidate debug hooks and smoke-test harness.

### Changed

- Damage goal increased from $30,000 to $45,000.
- Mission time increased from three minutes to three minutes thirty seconds.
- Bonus display expanded to show airborne cow, blackout, and chain reaction.
- Level-up flow now pauses for a meaningful build decision.
- Chaser commentary expanded for evolution and signature destruction events.
- Netlify is now the intended production host.

### Verification

- JavaScript syntax validated with Node.js.
- All DOM ID references checked against existing elements.
- Duplicate ID check passed.
- Mock-browser simulation passed for startup, frame loop, pause/resume, settings, two upgrade choices, Gust Burst, water-tower chain reaction, pole blackout, and aftermath data collection.


---

## Source: `severe-warning-v0.3.0-rc/DEPLOYMENT.md`

# Netlify Deployment

Production site:

`https://severe-weather-warning.netlify.app`

Project ID:

`aec2cbd0-c3de-4528-80e9-16d76ab68f99`

## Release policy

Netlify production deployments are limited by the free plan. Use this sequence:

1. Test the standalone HTML locally on Android.
2. Collect and batch all corrections.
3. Produce a release candidate.
4. Approve the release candidate.
5. Upload the Netlify deployment ZIP once.
6. Verify the production deploy through Netlify.

The deployment ZIP must contain `index.html` and `_headers` at its root.


---

## Source: `severe-warning-v0.3.0-rc/README.md`

# Severe Weather Warning v0.3.0 RC

Mobile-first isometric weather-destruction prototype.

## Build

- Build ID: `v0.3.0-rc.1`
- Release type: local release candidate
- Primary target: landscape mobile browser
- Hosting target: Netlify static deployment
- External libraries: none
- Network calls: none

## Major systems in this build

- Three permanent in-run storm upgrades
- Edge objective compass and world-space objective beacon
- Water-tower pressure-wave chain reactions
- Power-pole electrical chaining and county-blackout bonus
- Trampoline debris and livestock bounces
- Visible object damage bars before destruction
- Expanded run telemetry and final forecast rank
- Persistent control-response and camera-shake settings
- Expanded three-part bonus objective display
- Increased mission target and test window

## Controls

### Mobile

- Drag in the lower-left control zone to steer.
- Hold **Suction** to pull, orbit, lift, and damage nearby objects.
- Tap **Gust Burst** for radial knockback.
- Tap **Static Zap** to strike the nearest valid target.
- Tap pause to adjust control response or camera shake.

### Desktop

- Move: `WASD`
- Hold suction: `Space`
- Gust Burst: `Q`
- Static Zap: `E`
- Pause: `P` or `Escape`

## Mission route

1. Disable the suppression station.
2. Recharge over the warm field for three seconds.
3. Enter Harlow County.
4. Reach $45,000 in property damage.

Bonuses:

- Make a cow airborne.
- Destroy three power poles for a county blackout.
- Trigger an environmental chain reaction.

## Storm evolution choices

- **Wide Core:** wider suction radius, faster target lock, stronger orbital pull.
- **Pressure Drop:** increased contact damage and stronger, wider Gust Burst.
- **Static Feed:** reduced Static Zap cost and cooldown with higher strike damage.

## Deployment policy

This build is a local release candidate. Test the standalone HTML first. Only deploy to Netlify after the build is approved, because production deployments are being conserved on the free plan.


---

## Source: `severe-warning-v0.3.0-rc/TEST_PLAN.md`

# v0.3.0 RC Android Test Plan

Do not deploy this release candidate to Netlify until the standalone build passes the checks below.

## 1. Startup and orientation

- Open the standalone HTML on Android.
- Rotate to landscape.
- Confirm the intro fills the screen without clipped controls.
- Confirm the build label reads `v0.3.0`.

## 2. Movement and settings

- Start the run and steer in several directions.
- Pause and switch Control Response between Standard and Quick.
- Confirm Quick feels more immediate without becoming unstable.
- Cycle Camera Shake through Full, Reduced, and Off.
- Resume and confirm each setting behaves as labeled.

## 3. Mission navigation

- Confirm the top-center objective arrow points toward the station.
- Confirm the distance number decreases while approaching it.
- Destroy the station.
- Confirm the arrow retargets to the warm field.
- Recharge for three seconds.
- Confirm it retargets to Harlow County.

## 4. Storm evolution

- Reach level 2.
- Confirm the game pauses and presents three upgrade cards.
- Choose one and verify play resumes automatically.
- Reach level 3.
- Confirm the chosen upgrade is unavailable and a second choice can be made.
- Verify the chosen upgrade produces a noticeable gameplay difference.

## 5. Signature destruction

- Destroy the water tower and observe the pressure-wave reaction.
- Destroy power poles and confirm electrical chaining can occur.
- Destroy three poles and confirm County Blackout is checked.
- Pull an object or cow across the trampoline and look for `BOING`.
- Partially damage a sturdy structure and confirm its health bar appears.

## 6. Mission and reporting

- Reach $45,000 damage.
- Confirm the damage mission step completes.
- End the test from the pause menu.
- Confirm the report shows rank, peak combo, structures lost, upgrades, station status, cow status, and end condition.

## Tester questions

1. Is the objective route understandable without reading this document?
2. Do the three upgrades feel meaningfully different?
3. Are chain reactions readable or merely noisy?
4. Is the HUD still readable during heavy destruction?
5. Does Standard or Quick control response feel better?
6. Which camera-shake setting should be the default?
7. Is the three-minute-thirty-second run too long, too short, or useful?


---

## Source: `severe-warning-v0.3.0-rc.2/TEST_PLAN.md`

# v0.3.0 RC2 Android Test Plan

Do not deploy this candidate to Netlify until the standalone build passes this visibility-focused test.

## 1. Immediate readability

- Open the standalone HTML and rotate to landscape.
- Start the run without studying the HUD.
- Confirm the tornado, roads, buildings, trees, and objective beacon are easy to distinguish.
- Confirm the center of the screen stays mostly clear.

## 2. Compact HUD

- Confirm power, stability, growth, damage, and timer remain readable.
- Confirm only one current objective is shown during play.
- Confirm bonus progress appears as a compact `0 / 3`, `1 / 3`, and so on.
- Confirm the ability buttons do not cover important nearby targets.
- Confirm the news crawl and chaser message no longer dominate the bottom of the screen.

## 3. Context behavior

- Move continuously and watch the top-right panel soften slightly.
- Follow the objective until its world position passes behind a top panel.
- Confirm the obstructing panel fades but remains readable.
- Partially damage a distant object and confirm no persistent health bar clutters the view.
- Approach or suction that object and confirm its health bar appears contextually.

## 4. Pause information

- Pause the storm.
- Confirm the pause screen shows:
  - Current objective
  - Damage and time remaining
  - All three bonus states
  - Selected upgrade loadout
  - Terrain resistance reference
- Confirm Reduced is the default camera-shake setting on a fresh test.
- Confirm the pause card scrolls if the device height is limited.

## 5. Existing gameplay regression

- Destroy the station and verify the objective changes to warm inflow.
- Reach level 2 and select an upgrade.
- Trigger at least one chain reaction.
- Use Gust, Zap, and Suction.
- End the test and verify the aftermath report still works.

## Tester questions

1. Is the battlefield meaningfully easier to see than RC1?
2. Is any essential information now too small or too hidden?
3. Does the current-objective line provide enough guidance?
4. Are the ability buttons still comfortable to tap?
5. Should the news crawl remain, become event-only, or disappear during play?
6. Is Reduced camera shake the right default?
7. Is this clear enough to approve one Netlify deployment?


---

## Source: `severe-warning-v0.3.0-rc.3/TEST_PLAN.md`

# Android Test Plan: v0.3.0-rc.3

Do not deploy this candidate to Netlify until it passes the phone test.

## 1. Floating storm vitals

- Start a run and move in several directions.
- Confirm the power and stability panel follows the tornado.
- Confirm the panel stays readable without hiding the funnel.
- Confirm level, terrain, and growth remain understandable.
- Drain power by holding suction and confirm the yellow bar responds.
- Enter hostile terrain and confirm stability changes are easy to notice.

## 2. Field-report readability

- Trigger a terrain change or major event.
- Confirm `MARA VOSS · STORM CHASER` is easy to read.
- Confirm the report text is larger without blocking too much gameplay.

## 3. Object recognition

- Approach the weather station, cars, trees, buildings, a power pole, a trampoline, and a cow.
- Confirm their shapes look meaningfully different.
- Confirm contextual labels help without covering the battlefield.
- Hold suction and confirm labels prioritize objects being affected.

## 4. Screen hierarchy

- Confirm the live forecast remains useful in the upper-left.
- Confirm the direction pill in the upper-right is easy to find.
- Confirm warning banners do not cover the floating storm vitals.
- Confirm the center still feels open enough for destruction.

## 5. Controls and performance

- Complete at least one full run.
- Confirm steering, suction, Gust, and Zap still respond correctly.
- Watch for frame drops while several objects and labels are active.
- Confirm no buttons are blocked by the larger storm-chaser report.

## Approval questions

1. Does the floating storm status feel natural or distracting?
2. Are power and stability readable at a glance?
3. Which objects are still hard to recognize?
4. Are contextual labels helpful, excessive, or too small?
5. Is the larger storm-chaser report the right size?
6. Does the overall battlefield now read clearly enough for a production deployment?


---

## Source: `severe-warning-v0.3.0-rc.4/TEST_PLAN.md`

# Android Test Plan: v0.3.0-rc.4

Use the standalone HTML file in landscape orientation.

## 1. Floating storm panel

- Start a run and move in several directions.
- Confirm the panel remains above the visible funnel instead of covering its center.
- Confirm the panel is transparent enough to see terrain behind it.
- Confirm Power and Stability remain readable.

## 2. Persistent storm damage

- Move near a house, car, tree, pole, or other destructible object.
- Do not hold Suction and do not press an ability.
- Watch for the subtle wind ring and the object's health bar.
- Confirm health decreases slowly while the storm remains nearby.
- Move away and confirm the slow damage stops.

## 3. Damage balance

- Confirm proximity alone does not destroy a house quickly.
- Confirm direct contact damages faster than loose proximity.
- Confirm Suction, Gust Burst, and Static Zap remain much stronger.
- Confirm cows remain unharmed.

## 4. Bottom reports

- Wait for a storm-chaser report.
- Confirm its dark panel sits above the red WXR 8 ticker.
- Confirm the label and report text no longer collide with ticker text.

## Feedback to record

- Is the floating panel high enough?
- Is it too transparent or still too dark?
- Is passive wind damage noticeable?
- Is passive wind damage too weak, appropriate, or too strong?
- Does the weathering ring help explain what is being damaged?
- Does any bottom text still overlap?


---

## Source: `severe-warning-v0.4.0-vlp.1/CHANGELOG.md`

# Changelog

## v0.4.0-vlp.1

### Visual world rebuild

- Removed visible tile borders and high-contrast checkerboard variation.
- Recolored terrain into quieter, natural regional palettes.
- Added warm-field crop rows, forest-floor variation, and town lots.
- Rebuilt roads with asphalt, shoulders, drainage edges, and center markings.
- Added a moving storm cloud shadow over the landscape.

### Object readability

- Strengthened material shading and cast shadows.
- Rebuilt houses with roof mass, doors, windows, chimneys, and porch lines.
- Rebuilt barns with larger gambrel-like massing and cross-braced doors.
- Rebuilt warehouses with broad metal roofs and loading doors.
- Improved trees, cars, power poles, cows, trampolines, water towers, and the weather station.
- Added visible damage cracks.
- Replaced destroyed-object cross marks with persistent rubble fields.
- Reduced ordinary object labels to two contextual labels at a time.

### Storm presentation

- Added a wider dust skirt and rotating ground debris.
- Added passive inflow streaks that communicate circulation direction.
- Rebuilt the funnel with a darker core, highlighted rain wrap, condensation bands, and a low cloud base.
- Raised and lightened the floating Power and Stability panel.
- Replaced the pointer wedge with a thin tether.
- Added restrained cinematic color grading and lightning illumination.

### Gameplay continuity

- Preserved the RC4 movement, mission, upgrades, chain reactions, abilities, and scoring systems.
- Extended passive proximity weathering across the storm's near-field radius.
- Verified that weathering stops when the storm moves away.

### Testing hooks

- Added deterministic frame stepping and prop-state inspection to `window.__SW_DEBUG__` for local verification.


---

## Source: `severe-warning-v0.4.0-vlp.1/DESIGN_BRIEF.md`

# Severe Warning v0.4.0 Visual Language Brief

## Purpose

This build is not a final art pass. It is a playable proof that Severe Warning can become a readable, cinematic mobile disaster diorama without sacrificing the mechanics that already make it fun.

The central test is simple:

> Can the player recognize the world, understand the storm, and read destruction within one second of looking at the screen?

## Visual target

A stylized rural world photographed with the lighting and atmosphere of a storm documentary.

The game should not imitate photorealistic footage. On a phone, realism without sufficient resolution becomes visual mud. The intended result is a miniature world with exaggerated silhouettes, believable materials, dramatic weather, and restrained interface elements.

## Design laws

1. **Recognition before decoration**
   Objects must be identifiable by silhouette, scale, material, and context before labels are added.

2. **The ground stays quiet**
   Terrain explains geography and storm resistance without competing with buildings, debris, or the funnel.

3. **The storm owns the scene**
   Cloud shadow, dust, inflow, debris, lighting, and environmental response make the storm feel larger than its sprite.

4. **Atmosphere communicates behavior**
   Every effect must explain pull, power, instability, damage, direction, or scale. Decorative noise does not earn screen space.

5. **Mobile is the truth**
   The art is judged at the Android landscape dimensions used in testing, not on a desktop monitor.

6. **Graphics are gameplay**
   Visual changes must improve targeting, navigation, damage reading, terrain decisions, or emotional impact.

## Keep

- Tornado movement and momentum
- Power and Stability as separate systems
- Persistent proximity damage
- Suction, Gust Burst, and Static Zap
- Upgrade choices
- Weather-station suppression
- Terrain resistance
- Chain reactions
- Flying cows and non-graphic humor
- News and storm-chaser framing
- Floating storm vitals

## Change

- Checkerboard terrain becomes broad natural regions
- Generic shapes become material-specific silhouettes
- Flat roads gain shoulders and drainage depth
- Structures gain recognizable doors, windows, roofs, loading bays, braces, and equipment
- Destroyed objects become rubble fields rather than crossed-out icons
- The funnel gains weight, dust, inflow, condensation, cloud base, and a moving shadow
- Labels confirm targets instead of identifying the entire world
- Health bars become lighter and contextual

## Cut

- Visible tile outlines
- Alternating high-contrast ground squares
- Permanent labels on ordinary objects
- Effects that obscure the storm without communicating anything
- Large opaque world-space HUD panels

## Postpone

- Full WebGL or native 3D conversion
- Photorealistic materials
- Dynamic volumetric clouds
- Detailed building interiors
- Multiple maps and storm classes
- Final asset pipeline and production-quality 3D models

These should wait until the visual language proves itself in the current lightweight architecture.

## Approval gate

The visual direction advances only if the Android test confirms:

- houses, barns, warehouses, cars, trees, poles, station, tower, and trampoline are distinguishable without constant labels;
- terrain no longer reads as a board or checkerboard;
- the storm is visually dominant but does not hide targets;
- damage states and rubble are understandable;
- atmosphere improves scale without reducing performance;
- the floating vitals remain readable and stay above the funnel.


---

## Source: `severe-warning-v0.4.0-vlp.1/README.md`

# Severe Warning v0.4.0-vlp.1

Playable mobile visual-language prototype for Severe Warning.

## Status

- Local candidate only
- Netlify production unchanged
- Based on the stable v0.3.0-rc.4 gameplay systems
- Canonical project history and decisions remain in the ChatGPT project conversation

## Run

Open `index.html` in a modern mobile or desktop browser. Landscape orientation is required on mobile.

## Controls

### Mobile

- Left side: touch joystick
- Suction: hold the large orange button
- Gust: tap Gust
- Zap: tap Zap
- Pause: top-left pause button

### Desktop

- Move: WASD
- Suction: Space
- Gust: Q
- Zap: E
- Pause: P or Escape

## Build goal

Prove a cinematic, readable storm-diorama visual language before committing it to production or migrating to a heavier rendering engine.


---

## Source: `severe-warning-v0.4.0-vlp.1/TEST_PLAN.md`

# Android Test Plan: v0.4.0-vlp.1

This is a visual-language prototype. Do not deploy it to Netlify yet.

## Setup

1. Open the standalone HTML file in Chrome.
2. Rotate the phone to landscape.
3. Start a run and play for at least two minutes.
4. Move from the warm field to the station and then into town.

## Test A: One-second recognition

Without stopping to study the screen, identify:

- house
- barn
- warehouse
- car
- power pole
- weather station
- water tower
- trampoline
- cow

Record anything that still requires a label.

## Test B: Ground readability

Check whether:

- the checkerboard feeling is gone;
- the warm field reads as farmland;
- the forest reads as a darker wooded region;
- roads are clearly separate from lots and grass;
- terrain remains understandable during movement.

## Test C: Storm ownership

Check whether:

- the funnel feels heavier and more dimensional;
- dust and inflow communicate rotation;
- the cloud shadow makes the storm feel connected to the environment;
- storm effects help rather than hide nearby targets;
- the floating vitals remain above the funnel.

## Test D: Damage language

Approach a house without using an ability.

- Confirm its health slowly decreases.
- Move away and confirm the damage stops.
- Damage it further and look for cracks and the contextual health bar.
- Destroy a structure and confirm the rubble reads as a destroyed building site.

## Test E: Performance

Watch for:

- stuttering while the storm moves;
- lag during Gust Burst;
- frame drops around the forest or town;
- touch delay on the joystick or ability buttons;
- excessive battery heat during one full run.

## Questions that decide the next step

1. What objects remain difficult to identify?
2. Does the world finally look like a place rather than a game board?
3. Does the storm feel dramatic enough without becoming visual fog?
4. Are the colors too dark, too muted, or appropriately stormy?
5. Is the camera close enough to appreciate the objects?
6. Does this direction deserve to become the new production foundation?


---

## Source: `severe-warning-v0.4.0-vlp.1/VERIFICATION.md`

# Verification Record

## Static checks

- JavaScript syntax: passed with Node.js 22
- Duplicate HTML IDs: none detected
- External runtime dependencies: none
- Self-contained HTML: confirmed

## Simulated runtime checks

Tested with a Canvas/DOM execution harness at:

- 932 x 430 mobile landscape
- 760 x 360 compact landscape

Passed:

- initial reset and draw
- game start
- floating HUD render path
- visual ground and prop render paths
- pause and resume
- station destruction
- water-tower chain reaction
- three-pole blackout
- mission-state updates
- level progression

## Passive damage balance check

A house positioned approximately 1.1 world units from the funnel lost about 1.50 health over two simulated seconds. After the storm moved away, the house lost no additional health.

This verifies low persistent weathering without turning proximity into an instant-destruction field.

## Limitation

The automated environment could execute the game logic and canvas calls but could not capture a trustworthy browser rendering because its managed Chromium installation blocks local and data URLs. Final visual judgment therefore requires the supplied Android standalone test.


---

## Source: `severe-warning-v0.4.1-rc.1/CHANGELOG.md`

# Changelog

## v0.4.1-rc.1

### Engine

- Added explicit world camera and isometric projection systems.
- Added pixel-aligned final raster projection while retaining sub-pixel simulation.
- Replaced variable-delta simulation with a 60 Hz fixed timestep.
- Added bounded catch-up to prevent spiral-of-death stalls.
- Added camera and entity render interpolation.
- Added a fixed-capacity spatial hash for storm, ability, lightning, chain, and trampoline queries.
- Added fixed-capacity particle, bolt, floating-text, and debris pools.
- Added graceful recycling when effect pools reach capacity.
- Added cached terrain, tree, and shadow canvases with OffscreenCanvas fallback.
- Replaced random frame shake with a damped oscillator.
- Added an adaptive visual-effects governor.
- Added procedural Web Audio wind, rumble, burst, lightning, and structural-impact layers.

### Performance

- Removed particle, bolt, and floating-text array growth/filter churn from the frame loop.
- Removed full-scene proximity scans from storm and ability interactions.
- Removed per-object radial-gradient shadow construction.
- Reduced Canvas state-stack churn in common line rendering.
- Throttled DOM HUD updates to 20 Hz while simulation remains at 60 Hz.
- Hard-capped active debris and decorative particles.

### Interface

- Added engine status to the pause screen.
- Added a procedural-audio toggle.
- Preserved Reduced camera shake as the default.

### Visuals and gameplay

- Preserved the v0.4 cinematic-diorama art direction.
- Preserved all mechanics, missions, upgrades, destruction events, and safety tone.


---

## Source: `severe-warning-v0.4.1-rc.1/DEPLOYMENT.md`

# Netlify Deployment

## Target

- Project: `severe-weather-warning`
- Site ID: `aec2cbd0-c3de-4528-80e9-16d76ab68f99`
- Production URL: `https://severe-weather-warning.netlify.app`
- Current production deployment before this release: `6a611a71adf66511abcb8157`

## Policy

This release should replace production only after one successful physical Android run. The Netlify upload ZIP contains `index.html` and `_headers` at its root.

The current production deploy remains the rollback baseline.


---

## Source: `severe-warning-v0.4.1-rc.1/ENGINE_ARCHITECTURE.md`

# Severe Weather Engine Architecture

## Core loop

The browser animation frame supplies elapsed wall time. The game accumulates that time and advances gameplay in fixed 1/60-second steps. At most five steps are processed per animation frame. Excess backlog is discarded rather than allowing an unrecoverable simulation spiral.

Rendering receives the remaining accumulator fraction and interpolates camera and entity transforms between the previous and current simulation states.

## Coordinate layers

1. World coordinates store gameplay positions.
2. Camera coordinates track the world-space isometric focus.
3. Projection converts world coordinates into viewport coordinates.
4. Final screen coordinates are rounded for cached raster drawing.

The simulation and camera remain sub-pixel precise.

## Scene queries

The map is divided into fixed spatial cells. Every active prop is inserted by center point once per simulation step. Radius queries inspect only overlapping cells and then perform exact squared-distance checks.

Used by:

- suction and passive storm influence
- Gust Burst
- Static Zap targeting
- power-pole chaining
- trampoline interactions

## Memory policy

High-frequency transient systems are preallocated:

- 240 atmospheric and impact particles
- 16 lightning bolts
- 24 floating text events
- 48 persistent debris props

Inactive entries are recycled. When a pool is full, the cursor recycles an existing entry instead of allocating additional objects.

## Rendering passes

1. terrain and roads
2. depth-sorted world props
3. pooled particles
4. suction links
5. tornado and storm atmosphere
6. world-space storm vitals
7. additive lightning
8. floating feedback
9. full-screen lighting grade
10. DOM interface

## Audio

Audio initializes only after player interaction. Wind uses filtered generated noise. Rumble uses a low oscillator. Gust, zap, and heavy impacts use short synthesized one-shots. The player can disable audio from Pause.

## Honest remaining work

The high-frequency simulation and transient systems now follow pooled and partitioned engine patterns. Some legacy procedural vector helpers still use short-lived point arrays and local Canvas save/restore calls. They are not currently producing measurable stalls in the tested scene, but they remain the next renderer-cleanup target before substantially increasing map density.


---

## Source: `severe-warning-v0.4.1-rc.1/README.md`

# Severe Weather Warning v0.4.1-rc.1

Production candidate for the Severe Weather mobile browser game.

This release keeps the cinematic storm-diorama presentation from v0.4.0-vlp.1 and introduces the first formal engine foundation beneath it.

## Runtime

- Self-contained HTML5 Canvas game
- Zero external runtime dependencies
- Mobile-first landscape layout
- Netlify static deployment
- Production site: `severe-weather-warning.netlify.app`

## Engine foundation

- Explicit Camera2D and isometric Projection objects
- 60 Hz fixed-step simulation with bounded catch-up
- Interpolated camera and entity rendering
- Fixed-capacity spatial hash for nearby storm interactions
- Fixed-capacity pools for particles, lightning bolts, floating text, and debris
- Cached terrain diamonds, vegetation sprites, and object shadows
- Damped camera-shake oscillator
- Adaptive decorative effect quality
- Procedural Web Audio wind, rumble, gust, lightning, and impact tones
- Production pause controls for response, shake, and audio

## Gameplay preserved

- Tornado movement and momentum
- Passive proximity damage
- Suction, Gust Burst, and Static Zap
- Power and Stability systems
- Terrain resistance and recharge
- Mission sequence and objective beacon
- Storm evolution upgrades
- Water-tower chain reactions
- Power-grid blackout bonus
- Trampoline interactions
- Harmless airborne livestock
- News and storm-chaser presentation

## Production status

The release has passed automated mobile and compact-landscape browser tests. It remains an RC until one real Android run confirms controls, audio behavior, readability, and thermal performance.


---

## Source: `severe-warning-v0.4.1-rc.1/TEST_PLAN.md`

# Android Production-Candidate Test

Test in landscape from the standalone HTML before uploading to Netlify.

## One complete run

1. Start with sound enabled.
2. Move in small circles and then make several sharp direction changes.
3. Disable the weather station.
4. Recharge in the warm field.
5. Enter town.
6. Use Suction, Gust, and Zap repeatedly.
7. Choose at least one evolution upgrade.
8. Trigger a water-tower or power-grid chain reaction.
9. Pause once, toggle audio, and resume.
10. Finish or manually end the run.

## Approval questions

- Does movement remain smooth during heavy debris activity?
- Are there any freezes or visible garbage-collection jolts?
- Does the phone become unusually hot during one run?
- Does procedural audio improve the storm without becoming irritating?
- Does pausing silence or soften the storm appropriately?
- Do Power and Stability remain readable above the funnel?
- Can houses, trees, roads, cars, poles, and special objects be recognized quickly?
- Do chain reactions remain understandable?
- Does the game recover normally after switching apps and returning?

## Production blockers

Do not deploy if the run shows a repeatable crash, frozen controls, severe audio distortion, major visual regression, or sustained frame stutter.


---

## Source: `severe-warning-v0.4.1-rc.1/VERIFICATION.md`

# Verification Record

## Static checks

- JavaScript syntax: passed
- Duplicate element IDs: passed
- External runtime dependencies: none
- Netlify static headers: included

## Automated browser matrix

### 932 x 430 mobile landscape

- startup and build ID: passed
- fixed-step engine state: passed
- keyboard movement: passed
- pause and resume: passed
- procedural-audio toggle: passed
- station mission: passed
- warm recharge mission: passed
- town mission: passed
- evolution selection: passed
- water-tower chain event: passed
- three-pole blackout: passed
- passive proximity damage: passed
- damage stops outside radius: passed
- pooled prop cap under destruction load: passed
- JavaScript and console errors: none

### 760 x 360 compact landscape

All tests above passed.

## Observed automated performance

- Approximate headless test rate: 60 FPS
- Active static gameplay props: 55
- Maximum active props after pooled debris stress: 101
- Particle pool cap: 240

Headless performance is a regression signal, not a substitute for physical-device thermal and touch testing.


---

## Source: `severe-warning-v0.4.2-rc.1/CHANGELOG.md`

# Changelog: v0.4.2-rc.1

## Prop identity overhaul

- Replaced procedural roof icons with layered cached house sprites.
- Added two residential forms with mirrored facings and readable wall volume.
- Added consistent roofs, chimneys, porches, doors, windows, foundations, and siding.
- Rebuilt barns around a gambrel-roof silhouette and removed the misleading full-size X door treatment.
- Rebuilt warehouses with broad metal roofs, loading doors, service entrances, and rooftop vents.
- Added sedan, pickup, and SUV vehicle classes.
- Added readable hoods, cabins, beds, windows, wheels, headlights, taillights, and bumpers.
- Aligned vehicles to roads and driveways.

## Damage presentation

- Added intact, stressed, damaged, and critical cached states.
- Added missing roof sections, exposed framing, broken glass, dented panels, and wall failures.
- Added damage-threshold particle and text feedback.
- Added dedicated building-rubble and vehicle-wreck sprites.
- Removed reliance on generic crossed-out destruction symbols.

## Readability and performance

- Prewarms and stores sprite references on each prop before gameplay.
- Runtime drawing uses cached `drawImage()` blits instead of reconstructing major props each frame.
- Reduced labels for ordinary intact houses and vehicles.
- Health bars now appear only for strongly targeted or substantially damaged props.
- Increased cast-shadow footprints to match the new visual mass.
- Added visual-height metadata for correctly positioned health feedback.

## World composition

- Replaced random vehicle placement with seven deliberate road and driveway positions.
- Added deterministic vehicle classes and orientations for a more believable town layout.
- Preserved map, mission, physics, scoring, and storm systems.


---

## Source: `severe-warning-v0.4.2-rc.1/DEPLOYMENT.md`

# Deployment Record

## Target

- Netlify project: `severe-weather-warning`
- Site ID: `aec2cbd0-c3de-4528-80e9-16d76ab68f99`
- Production URL: `https://severe-weather-warning.netlify.app`

## Current production baseline

- Deploy ID: `6a611a71adf66511abcb8157`
- Netlify state: ready
- v0.4.2-rc.1 has not been deployed

## Release package

Use `severe-weather-warning-v0.4.2-rc.1-netlify-upload.zip` only after the Android production test is approved.

The ZIP contains at its root:

- `index.html`
- `_headers`

## Rollback

The existing Netlify deploy remains the rollback baseline until the new deployment has been verified live on the Android device.


---

## Source: `severe-warning-v0.4.2-rc.1/ENGINE_ARCHITECTURE.md`

# Severe Weather Engine Architecture

## Simulation

- Fixed 60 Hz simulation
- Bounded catch-up loop
- Interpolated rendering
- Sub-pixel world and camera state
- Integer-aligned cached raster placement

## Camera and projection

- Explicit Camera2D state
- Explicit isometric world-to-screen projection
- Reusable projected-point ring
- Camera shake handled as a separate damped oscillator

## Scene queries

- Fixed-capacity spatial hash
- Nearby-cell queries for suction, passive damage, lightning, and trampoline checks
- Stable anchor-based depth sorting

## Transient memory

- Fixed particle pool
- Fixed lightning-bolt pool
- Fixed floating-text pool
- Recycled debris props with hard caps

## Asset pipeline

- OffscreenCanvas when available
- hidden-canvas fallback
- pre-rendered terrain, vegetation, shadows, buildings, vehicles, damage states, rubble, and wrecks
- per-prop direct references to cached visual states
- major prop runtime drawing performed through `drawImage()`

## Render passes

1. terrain and natural regions
2. roads, lots, and objective markings
3. shadows and depth-sorted props
4. pooled particles and debris
5. tornado and atmospheric circulation
6. lightning and transient illumination
7. world-space indicators
8. DOM interface

## Audio

- user-gesture initialization
- procedural wind and pressure rumble
- synthesized gust, lightning, and impact tones

## Known boundary

Some inherited vector helpers and small effects still create temporary point arrays. Major repeated props now use cached images, removing the most expensive procedural reconstruction from the primary render loop. Further cleanup should be driven by profiling as map density increases.


---

## Source: `severe-warning-v0.4.2-rc.1/PROP_IDENTITY.md`

# Prop Identity Standard

## Visual objective

Each major object must be recognizable on a phone before a label appears.

The art target is a cinematic animated disaster diorama: exaggerated enough to read at small scale, dimensional enough to feel physical, and restrained enough to remain performant under storm effects.

## Recognition order

1. Silhouette
2. Physical volume
3. Orientation
4. Material family
5. Functional details
6. Decorative detail

## Shared lighting

- Primary light arrives from the upper-left.
- Upper planes receive the highest value.
- Right-facing planes are darker and cooler.
- Cast shadows move down-right.
- Lightning and storm grading remain separate scene passes.

## Residential structures

Residential props use visible wall mass beneath a pitched roof. Windows, door, porch, chimney, foundation, and siding support the silhouette rather than replacing it.

Two variants provide visual diversity without compromising recognition:

- compact hipped-roof home
- farmhouse with porch and dormer

## Agricultural structures

The barn uses a gambrel-roof profile, red wood siding, hay-loft opening, vertical plank doors, and restrained diagonal bracing. Door braces must not resemble a destroyed-object marker.

## Industrial structures

The warehouse uses a low, broad metal volume with loading doors, corrugated roof cues, service access, and rooftop ventilation. It should read as heavier and harder to disrupt than a house.

## Vehicles

Vehicles use a consistent long-to-wide ratio and are aligned with roads or driveways. Sedan, pickup, and SUV silhouettes are distinct at gameplay scale. Wheels are drawn behind the body, and the hood, cabin, glass, lights, and bumpers establish direction.

## Damage states

- Intact: complete silhouette and clean materials
- Stressed: missing shingles, cracked glass, small dents
- Damaged: roof or hood sections missing, visible framing or deformation
- Critical: major structural opening or body collapse
- Destroyed: persistent rubble or wreckage with recognizable source materials

Damage state changes receive fragment feedback so the transition reads as an event rather than a sprite swap.

## Label policy

Ordinary props do not receive labels merely because they are nearby. Labels are reserved for:

- special mission or bonus objects
- strong suction lock
- critical damage

The asset must do the identifying work.


---

## Source: `severe-warning-v0.4.2-rc.1/README.md`

# Severe Weather Warning v0.4.2-rc.1

Production candidate for the Severe Weather mobile browser game.

This release builds on the v0.4.1 engine foundation and replaces the icon-like residential, agricultural, industrial, and vehicle rendering with a cached layered-prop system designed for mobile readability.

## Runtime

- Self-contained HTML5 Canvas game
- Zero external runtime dependencies
- Mobile-first landscape layout
- Netlify static deployment
- Production site: `severe-weather-warning.netlify.app`

## Prop identity system

- Cached residential house sprites with two architectural variants and mirrored facings
- Cached barn and warehouse sprites with distinct material and silhouette language
- Three vehicle classes: sedan, pickup, and SUV
- Vehicles aligned to roads and driveways instead of random map angles
- Four visible condition states: intact, stressed, damaged, and critical
- Dedicated collapsed-building and wrecked-vehicle sprites
- Material-specific lighting, windows, doors, roofs, loading bays, wheels, lamps, and shadows
- Damage-threshold fragment feedback so state changes feel physical rather than abrupt
- Reduced ordinary object labeling so the art carries recognition
- Contextual health bars reserved for targeted or significantly damaged props

## Engine behavior preserved

- Explicit Camera2D and isometric Projection objects
- 60 Hz fixed-step simulation
- Spatial hash nearby-object queries
- Fixed-capacity particle, bolt, floater, and debris pools
- Tornado movement, passive damage, suction, Gust Burst, Static Zap
- Power, Stability, terrain resistance, upgrades, missions, and bonuses
- Chain reactions, blackout event, trampoline behavior, and harmless flying cows
- Procedural Web Audio and adaptive visual effects

## Production status

The release passed a 64-check automated matrix at 932 x 430 and 760 x 360. The remaining approval gate is one real Android run focused on prop recognition, touch performance, and thermal behavior. No Netlify deployment has been consumed for this candidate.


---

## Source: `severe-warning-v0.4.2-rc.1/TEST_PLAN.md`

# Android Production Test Plan

## Setup

1. Open `severe-weather-warning-v0.4.2-rc.1.html` in landscape.
2. Start a full run.
3. Keep camera shake on Reduced for the first pass.
4. Leave procedural audio enabled unless it prevents comparison.

## Visual recognition

Check whether these can be identified without labels:

- residential house
- farmhouse
- barn
- warehouse
- sedan
- pickup
- SUV

Check that vehicles appear aligned with roads and driveways rather than scattered like tokens.

## Damage states

Damage at least one house and one vehicle gradually.

Confirm that:

- early damage is visible but not overwhelming
- broken glass and missing roof or hood pieces read clearly
- the critical state looks physically unstable
- destruction leaves rubble or a wreck, not an abstract X
- state changes feel supported by fragments and impact feedback

## Gameplay and performance

Complete one full run while using Suction, Gust Burst, and Static Zap.

Confirm that:

- touch movement remains responsive in the town
- larger props do not obscure the tornado excessively
- the phone does not become unusually hot
- no repeated stutter occurs when damage states change
- switching apps and returning pauses safely
- audio remains useful rather than tiring

## Production decision

Approve deployment only when the new props are clearly better than v0.4.1 on the real phone and no repeatable control, rendering, or thermal failure appears.


---

## Source: `severe-warning-v0.4.2-rc.1/VERIFICATION.md`

# Verification Record: v0.4.2-rc.1

## Static checks

- JavaScript syntax: passed
- Duplicate element IDs: passed, 75 unique IDs
- External runtime scripts: none
- External runtime styles: none
- Netlify static headers: included

## Automated matrix

64 of 64 checks passed across:

- 932 x 430 mobile landscape
- 760 x 360 compact landscape

## Systems verified

- production build ID
- startup and running state
- fixed 60 Hz simulation
- cached prop population
- house, barn, warehouse, vehicle, and rubble cache generation
- asset warmup below 250 ms in headless testing
- keyboard movement
- pause and resume
- house and vehicle damage states
- house and vehicle destruction bookkeeping
- weather-station mission
- warm-field recharge mission
- town-entry mission
- storm-evolution selection
- water-tower chain reaction
- county blackout bonus
- passive proximity damage
- damage cessation outside the storm radius
- particle and prop hard caps
- 600-step compressed simulation
- runtime console and JavaScript errors: none

## Observed cache counts in the test run

- residential sprites: 20
- barn sprites: 4
- warehouse sprites: 4
- vehicle sprites: 48
- rubble and wreck sprites: 19

These are generated once during reset and referenced directly by props during rendering.

## Visual review artifacts

- `prop-town-intact.png`
- `prop-town-damaged.png`
- `prop-town-destroyed.png`
- `prop-town-compact.png`

Headless screenshots are useful regression evidence but do not replace the final physical-device evaluation.


---

## Source: `severe-warning-v0.5.0-vs.1/NO_DRIFT_POLICY.md`

# Severe Weather No-Drift Policy

## Core identity

Severe Weather is a direct-control weather destruction action RPG. The player is the storm.

## Non-negotiable rules

- Action comes first.
- Scale changes the view, not the genre.
- Graphics are gameplay.
- Destruction must be physical and readable.
- Power and Stability remain separate.
- Every storm type must move, grow, resist, and destroy differently.
- Mobile is the primary design target.
- Civilians are evacuated or sheltered. There are no visible human casualties.
- Humor comes from property destruction, physics, news coverage, and invincible animals.

## Approval gate

A substantial feature must strengthen the fantasy of being the storm, improve direct play, remain readable on a phone, and justify the work it displaces.

## Visual gate

A visual release requires physical-device review. Automated execution checks cannot prove that the art looks right.

## Change control

Core concepts cannot change silently. A proposed genre or identity change requires explicit owner approval.

## North star

Every storm creates a story worth retelling.


---

## Source: `severe-warning-v0.5.0-vs.1/SCALE_ARCHITECTURE.md`

# Multi-Scale World Architecture

## Governing rule

Scale changes the view, not the genre. The player remains the storm.

## Current foundation

- Horizontal map coordinates use shared world units.
- One world unit currently represents six meters for prop construction.
- Vertical dimensions convert from meters to projected pixels through a dedicated scale.
- The camera owns a smooth zoom value independent of simulation coordinates.
- Major storm geometry scales with the camera.
- Props are constructed from physical dimensions rather than arbitrary screen sizes.

## Future expansion

Large tornadoes, hurricanes, floods, blizzards, and thunderstorm systems can use the same world data while selecting different camera bands and levels of detail.

The renderer should eventually provide:

- detailed prop geometry at close scale
- simplified silhouettes at town scale
- district and infrastructure representation at county scale
- streamed geographic chunks for regional storms
- detailed simulation near active impacts and aggregated state at distance

These systems support direct action. They do not convert the game into a management interface.


---

## Source: `severe-warning-v0.5.0-vs.1/TEST_PLAN.md`

# Android Test Plan

## Setup

1. Open `severe-weather-warning-v0.5.0-vs.1.html` in Chrome.
2. Rotate the phone to landscape.
3. Start one complete run.

## Visual checks

- Cars should read as small vehicles, not colored cards.
- The sedan, pickup, and SUV should have distinguishable silhouettes.
- Houses should show wall height beneath their roofs.
- The barn and warehouse should remain distinguishable without labels.
- The water tower should read as a tall landmark with visible legs and tank height.
- Roads should feel embedded in the land, with shoulders and a believable intersection.
- The tornado and its floating vitals should remain clear without obscuring nearby buildings.
- Damaged objects should look physically altered rather than merely recolored.

## Control and performance checks

- Movement remains smooth around dense town geometry.
- Suction, Gust Burst, and Static Zap remain responsive.
- No repeated stutter occurs when buildings or vehicles change damage state.
- The phone does not become unusually hot during a full run.
- Returning from another app pauses or resumes safely.

## Decision

Approve the visual direction only if the scene feels like one coherent miniature world at first glance. Running correctly is necessary, but not sufficient.


---

## Source: `severe-warning-v0.5.0-vs.1/VERIFICATION.md`

# Verification Report

## Build

`v0.5.0-vs.1`

## Static checks

- JavaScript syntax: passed
- Self-contained runtime: passed
- External runtime dependencies: none
- Netlify package structure: ready

## Browser-injected runtime checks

The complete HTML document was injected into Chromium through the Chrome DevTools Protocol to avoid the environment's managed local-URL block.

- Runtime exceptions: 0
- Unexpected console errors or warnings: 0
- Expected autoplay and vibration policy notices were excluded
- Fixed simulation: 60 Hz
- Observed automated frame rate: approximately 60 FPS
- Active scene props: 55 before destruction

## Viewport checks

- 932 x 430: passed
- 760 x 360: passed
- Manual overview scale at 0.62: passed

## Interaction checks

- Game start: passed
- Town teleport and camera follow: passed
- House destruction: passed
- Vehicle destruction: passed
- Water-tower destruction and chain event: passed
- Damage-state rendering: passed
- Debris and scoring bookkeeping: passed

## Generated captures

- `town-932x430.png`
- `town-760x360.png`
- `town-damaged.png`
- `town-destroyed.png`
- `town-overview.png`

## Remaining gate

Physical Android visual, touch, and thermal review.


---

## Source: `severe-warning-v0.5.4-sp.1/STORM_INTEGRATION.md`

# Storm Integration Architecture

## Governing rule

The player is the storm. Atmospheric systems must strengthen direct action rather than replace it.

## Nested tornado field

The tornado exposes four ordered physical regions:

1. Inflow field
2. Strong-wind field
3. Debris field
4. Destructive core

The visual system uses these regions to telegraph reach through environmental motion. No visible gameplay radius is required.

## Storm state

The rendered tornado responds to:

- Power
- Stability
- Storm level
- Funnel growth
- Terrain
- Upgrades
- Suction state
- Lightning state

High Stability produces organized condensation and smoother rotation. Low Stability increases wobble, broken bands, and visual raggedness. Higher Power increases core mass, wind reach, debris density, shadow, and audio intensity.

## Environmental response contract

Nearby props maintain reusable state values:

- wind
- windAngle
- windPhase
- bend
- rock
- stress

Trees, vehicles, poles, roofs, and metal panels interpret the same field differently. This keeps future storm types extensible without making every object respond identically.

## Render order

1. Terrain and roads
2. Wind field and crop response
3. Storm shadow, rain curtain, and ground dust
4. Power lines
5. World props
6. Particles and suction links
7. Tornado body and wall cloud
8. Lightning and foreground debris
9. Atmosphere and illumination
10. Compact world-space storm vitals
11. DOM interface

## Audio layers

The procedural audio engine maintains continuous wind, rain, and rumble layers. Short-lived oscillators provide gust, zap, thunder, creak, and impact accents. Audio begins only after user interaction and can be disabled in the pause menu.

## Scalability

This build completes the close and town-scale tornado experience. The nested field model, physical world coordinates, adaptive effects, and compact HUD are compatible with later large-tornado levels of detail. Giant-storm scaling is intentionally outside this release scope.


---

## Source: `severe-warning-v0.5.4-sp.1/TEST_PLAN.md`

# Android Test Plan

## Setup

1. Open `severe-weather-warning-v0.5.4-sp.1.html` in Chrome.
2. Rotate the phone to landscape.
3. Enable sound for the first run.
4. Complete one full production-length run.

## Storm presence

- The funnel should connect visually to the wall cloud.
- The ground contact should be partially hidden by dust and debris.
- The tornado should look denser and broader at high Power.
- Low Stability should make the funnel noticeably ragged and less organized.
- Lightning should briefly reveal the storm and nearby world without washing out the screen.
- The compact vitals panel should remain beside the storm rather than covering it.

## Wind response

- Trees should bend before taking major damage.
- Leaves should begin moving before structural debris dominates.
- Crops should visibly lean within the inflow field.
- Vehicles should rock before sliding or lifting.
- Roof edges and warehouse panels should show stress before failure.
- Power poles and connected lines should sway.
- The damaging wind should be understandable without a visible radius circle.

## Destruction

- Damage should progress through readable states.
- Wood and metal failures should look and sound different.
- Buildings should shed material before collapsing.
- Cars should remain recognizable when lifted and when wrecked.
- Chain reactions, blackout events, and water-tower failure should remain reliable.

## Audio

- Wind should grow with storm strength.
- Rain and rumble should support the storm without overpowering feedback sounds.
- Thunder should feel delayed rather than synchronized with every flash.
- Creaks should warn of severe stress without repeating constantly.
- The audio toggle should silence all procedural layers.

## Controls and performance

- Direction changes remain responsive under heavy effects.
- Suction, Gust Burst, and Static Zap remain reliable.
- No repeated stutter appears during damage transitions.
- The browser survives app switching and return.
- The phone does not become unusually hot during a full run.

## Approval rule

This phase is approved only when the tornado and the reacting world feel like one weather system during normal play. Correct execution alone is not sufficient.


---

## Source: `severe-warning-v0.5.4-sp.1/VERIFICATION.md`

# Verification Report

## Build

`v0.5.4-sp.1`

## Static checks

- JavaScript syntax: passed
- Duplicate DOM IDs: none
- External runtime dependencies: none
- Self-contained HTML runtime: passed
- Stable engine section anchors: passed
- HTML size: 149,525 bytes

## Browser execution method

The managed Chromium environment blocks local and localhost navigation. The complete game document was injected directly through the Chrome DevTools Protocol, allowing the actual Canvas renderer, simulation, controls, audio initialization, HUD, and game logic to execute.

## Automated result

- Passed: 56
- Failed: 0
- Runtime exceptions: 0
- Unexpected console errors: 0

## Tested viewports

- 932 x 430
- 760 x 360

## Verified storm systems

- Correct build and debug bridge
- Fixed 60 Hz simulation
- Ordered inflow, strong-wind, debris, and core fields
- Hard-capped particle pool
- Stable prop population
- Procedural wind, rain, and rumble layers
- Strong storm visual state
- Weak and unstable visual state
- Tree bending
- Vehicle rocking
- Building stress response
- Suction direct-control timing
- Gust Burst power use and activation
- In-cloud flash state
- Compact and overview camera operation

## Verified gameplay systems

- Game start
- Mission progression
- Suppression-station destruction
- Warm-field recharge
- Water-tower chain reaction
- Progressive property damage
- Pause and resume
- Audio toggle

## Visual captures

- `storm-strong-932x430.png`
- `storm-weak-932x430.png`
- `storm-damage-932x430.png`
- `storm-strong-760x360.png`

## Honest limits

Automated execution cannot judge speaker quality, touch feel, sustained phone temperature, or whether every effect remains readable during a complete physical-device run. Those remain part of the Android gate.


---

## Source: `severe-warning-v0.6.0-gs.1/BALANCE_AND_AUDIO.md`

# Balance and Audio Corrections

## Source playtest notes

The Android playtest identified three release-blocking problems:

1. Power depleted too quickly.
2. Structures required too much sustained damage.
3. Lightning sounded like an arcade effect from the 1980s.

These notes were corrected before the Giant Storm Foundation was packaged.

## Current tuning

| System | Current value |
|---|---:|
| Continuous Suction drain | 3.0 Power per second |
| Suppression-station drain | 3.5 Power per second |
| Gust Burst cost | 14 Power |
| Static Zap base cost | 20 Power |
| Passive damage multiplier | 1.85 |
| Core damage multiplier | 1.65 |
| Suction damage multiplier | 1.42 |
| Gust damage multiplier | 1.28 |
| Zap damage multiplier | 1.28 |

## Automated pacing observations

- Five seconds of Suction while under suppression drained approximately 25.5 Power.
- A normal house exposed to sustained Suction after suppression was destroyed in approximately 3.75 seconds.
- Gust Burst consumed approximately 14.3 Power in the automated simulation.
- Static Zap consumed approximately 20.8 Power in the automated simulation.

Small differences from the listed costs come from simultaneous terrain and simulation ticks.

## Lightning audio redesign

The old lightning effect relied too heavily on a tonal oscillator, producing a game-like beep.

The new sound combines:

- a short high-pass noise crack
- a filtered mid-frequency snap
- a low-frequency rumble body
- existing delayed thunder behavior

The shared noise buffer is allocated once when Web Audio initializes.

## Honest limit

Automated tests can prove that the new noise-based signal path exists and executes. They cannot judge the physical phone speaker, perceived loudness, or whether the sound is convincing. Android listening remains the approval gate.


---

## Source: `severe-warning-v0.6.0-gs.1/GIANT_STORM_FOUNDATION.md`

# Giant Storm Foundation

## Governing rule

Scale changes the view, not the genre. The player remains in direct control of the storm at every size.

## Physical scale classes

| Class | Diameter | Intended view |
|---|---:|---|
| Rope | 24 m | close tactical |
| Cone | 55 m | neighborhood |
| Wedge | 120 m | town |
| Giant Wedge | 260 m | district |
| Monster Wedge | 480 m | county impact |
| Half-Mile Wedge | 805 m | large county impact |

The class changes physical field radii, camera scale, storm geometry, environmental reach, and visual level of detail. It is not merely a name change.

## Nested field model

Each tornado owns four ordered regions:

1. Inflow radius
2. Strong-wind radius
3. Debris radius
4. Core radius

The wide field applies structural pressure and environmental response. Suction remains a direct player ability and intensifies damage inside the core.

## Camera behavior

The camera calculates its target zoom from the physical diameter. Larger storms pull the view back smoothly while movement remains direct and centered on the storm.

The lowest current target zoom is 0.12. Simulation coordinates remain unchanged by camera scale.

## Multi-scale rendering

### Close scale

- Full volumetric houses and vehicles
- Small props, poles, wires, debris, and labels
- Detailed particles and destruction states

### Town scale

- Simplified prop presentation
- Reduced label density
- Reduced small-particle traffic
- Strong silhouettes and storm field cues

### County scale

- Small props are suppressed when they would become unreadable fixed-pixel clutter
- Regional roads and district masses carry the scene
- Broad damage scars and storm geometry communicate impact
- Environmental effects reduce before simulation quality

## Giant destruction

Large tornadoes apply damage across their strong-wind and core fields. Structures remain fixed to foundations until failure, while vehicles and loose material can move.

A preallocated scar system records broad storm passage without allocating new objects in the main loop.

## Wedge Sandbox

The Wedge Sandbox begins at 260 meters and level 4. Its scale is locked so the large initial damage event does not immediately advance it into another class. This provides a stable comparison point for art, camera, performance, and control testing.

Normal mission mode retains progression-based growth.

## Future compatibility

The same physical camera, map, field, and level-of-detail architecture can support larger maps and other directly controlled storms. Future storm implementations must retain their own movement and destruction identity under the No-Drift Policy.


---

## Source: `severe-warning-v0.6.0-gs.1/TEST_PLAN.md`

# Android Test Plan

## Setup

1. Open `severe-weather-warning-v0.6.0-gs.1.html` in Chrome.
2. Rotate the phone to landscape.
3. Keep sound enabled for the first run.
4. Test both `ENTER THE STORM` and `WEDGE SANDBOX`.

## Mission balance

- Hold Suction for several seconds under normal terrain.
- Confirm Power no longer collapses before a useful attack can be completed.
- Enter suppression range and verify the combined drain is dangerous but manageable.
- Hold Suction over a normal house and judge whether destruction takes roughly three to five seconds at early strength.
- Confirm reinforced structures still feel tougher than ordinary houses.
- Use Gust and Zap several times and judge whether their costs allow meaningful ability use without becoming free.

## Lightning audio

- Trigger Static Zap near a target.
- Listen for a noisy electrical crack and low body rather than a clean electronic beep.
- Confirm delayed thunder remains distinct from the immediate strike.
- Confirm repeated Zaps do not become painfully sharp through the phone speaker.
- Test the procedural-audio toggle from pause.

## Wedge Sandbox

- Start `WEDGE SANDBOX`.
- Confirm the storm begins as a 260 meter Giant Wedge.
- Move continuously in several directions and verify control still feels direct.
- Confirm buildings and roads look appropriately small beneath the storm.
- Confirm the camera does not pulse or constantly hunt for scale.
- Watch the wide wind field damage multiple structures without requiring exact core contact.
- Confirm a broad damage path remains behind the storm.
- Confirm the displayed class remains Giant Wedge during the sandbox test.

## Multi-scale readability

- Small props should disappear before they become oversized screen icons.
- Roads, districts, major buildings, and the storm path should remain readable at wide scale.
- The storm must remain visually dominant without obscuring every useful navigation cue.
- Labels and health bars should not cover the giant funnel.
- The player should still understand travel direction and objective direction.

## Performance

- Play the Wedge Sandbox for at least three minutes.
- Watch for repeated long stalls during the initial damage burst.
- Confirm controls remain responsive when many structures fail.
- Confirm the browser survives switching apps and returning.
- Judge phone heat after the full test.
- Note whether effects visibly reduce while gameplay remains stable.

## Approval rule

The phase passes only when giant storms remain fun to steer, destruction feels faster without becoming meaningless, Power supports sustained play, and the lightning sound no longer reads as an arcade beep.


---

## Source: `severe-warning-v0.6.0-gs.1/VERIFICATION.md`

# Verification Report

## Build

`v0.6.0-gs.1`

## Static checks

- JavaScript syntax: passed
- Duplicate DOM IDs: none
- External runtime dependencies: none
- Self-contained HTML runtime: passed
- Standalone HTML matches deploy index: passed
- Stable structural anchors detected: 15
- HTML size: 159,511 bytes

## Browser execution method

The complete game document was executed in managed Chromium through the Chrome DevTools Protocol. This runs the actual Canvas renderer, fixed-step simulation, controls, Web Audio initialization, HUD, damage logic, and debug bridge at target viewport sizes.

## Automated result

- Passed: 44
- Failed: 0
- Runtime exceptions: 0
- Unexpected console errors: 0

## Tested viewports

- 932 x 430
- 760 x 360

## Verified tuning corrections

- Five-second suppression plus Suction drain: approximately 25.5 Power
- House destruction under sustained Suction: approximately 3.75 seconds
- Gust Burst execution and tuned cost
- Static Zap execution and tuned cost
- Shared procedural noise source for lightning

## Verified giant-storm systems

- Six physical diameter classes
- Ordered storm field radii
- Mission growth advances physical scale
- 260 meter Wedge Sandbox
- Stable sandbox scale lock
- Camera pullback at giant scale
- 805 meter Half-Mile class support
- Wide county damage
- Persistent broad damage scars
- Direct movement retained
- Water-tower chain reaction retained
- Suppression objective retained

## Visual captures

- `mission-932x430.png`
- `mission-760x360.png`
- `wedge-932x430.png`
- `half-mile-932x430.png`

## Performance observation

During the automated 260 meter Wedge sequence, the adaptive governor selected Balanced FX and reported approximately 46.6 FPS in the headless environment while multiple structures and power poles failed. Simulation remained fixed at 60 Hz and controls remained active. This is not a substitute for physical Android frame pacing and heat testing.

## Honest limits

Automated execution cannot judge touch feel, phone temperature, speaker quality, subjective visual appeal, or sustained battery behavior. The 805 meter class is engine-verified and visually captured, but the current player-facing sandbox starts at 260 meters. Physical Android review remains mandatory before production deployment.


---

## Source: `severe-warning-v0.7.0-ms.1/MULTI_STORM_CORE.md`

# Multi-Storm Core

## Governing rule

The player remains the storm. Shared architecture may change implementation, but it must not turn direct action into weather management.

## Shared storm contract

The current build provides a common player-storm state with:

- direct world position and velocity
- Power and Stability
- physical footprint and nested influence fields
- preferred camera scale
- storm-specific primary ability
- storm-specific burst ability
- storm-specific lightning behavior
- storm-specific rendering passes
- storm-specific terrain response

## Tornado implementation

The existing tornado remains intact:

- Suction
- Gust Burst
- Static Zap
- rotating inflow
- destructive core
- debris field
- scale classes from Rope through Half-Mile Wedge

## Severe supercell implementation

The first additional playable storm is a direct-control severe supercell sandbox.

### Primary ability: Hail Core

Holding the primary control maintains a concentrated hail core. It drains Power gradually and damages structures beneath the core.

### Downburst

The burst control creates a wide radial wind event that damages and pushes exposed objects.

### Chain Zap

The lightning control has a longer range than tornado Static Zap and can chain to nearby targets.

### Environmental identity

The supercell uses:

- broad anvil and storm shadow
- rotating mesocyclone bands
- updraft tower
- rain curtain
- hail core
- gust-front field
- hook-shaped precipitation band
- in-cloud and cloud-to-ground lightning

## No-drift check

The supercell is not a tornado with different particles. It has different scale, abilities, wind behavior, terrain response, rendering, and attack rhythm while preserving direct movement and destruction.


---

## Source: `severe-warning-v0.7.0-ms.1/PLAYTEST_LOG.md`

# Playtest Log

## Source build

`v0.6.0-gs.1`

## Physical Android feedback

- Giant-storm movement felt slightly choppy.
- Direct control never dropped and the storm always moved.
- Prior notes remain active: Power economy is improved, destruction pacing is improved, and lightning audio is functional but still requires final artistic tuning.

## Actions in v0.7.0-ms.1

- Removed integer rounding from world-to-screen vector projection.
- Kept integer alignment only at cached bitmap draw boundaries.
- Started giant storm and supercell sandboxes in Balanced FX so frame pacing is protected before the governor measures load.
- Raised the adaptive quality downgrade threshold from 46 FPS to 52 FPS.
- Preserved the fixed 60 Hz simulation and render interpolation.
- Added automated projected-motion sampling. Each tested mode produced at least 12 unique sub-pixel screen positions across 16 samples.

## Remaining physical-device gate

The Android run must confirm that the giant wedge and supercell feel smoother during continuous diagonal movement and during heavy destruction bursts.


---

## Source: `severe-warning-v0.7.0-ms.1/TEST_PLAN.md`

# Android Test Plan

## 1. Giant-storm movement

Start **Wedge Sandbox**.

- Hold a diagonal direction for at least ten seconds.
- Reverse direction several times.
- Move while buildings are failing and debris is active.
- Confirm movement feels smoother than v0.6.0-gs.1.
- Confirm the storm never ignores input or stops unexpectedly.

## 2. Supercell identity

Start **Supercell Sandbox**.

- Confirm the player directly moves the storm.
- Confirm it does not feel like a tornado reskin.
- Look for the broad cloud shield, updraft tower, rain curtain, gust front, and hail core.

## 3. Hail Core

Hold **Hail Core** over buildings.

- Power should drain gradually rather than collapse immediately.
- Buildings should visibly take damage.
- Hail should remain readable without covering the whole screen.

## 4. Downburst

Use **Downburst** near vehicles, trees, and structures.

- The effect should read as broad straight-line wind.
- Objects should be damaged and pushed outward.
- Movement should remain responsive during the burst.

## 5. Chain Zap

Use **Chain Zap** near a group of targets.

- The first strike should be clear.
- Nearby conductive targets may receive chained strikes.
- The sound should feel like an electrical crack and thunder, not a musical arcade tone.

## 6. Performance and heat

Play each sandbox for at least three minutes.

- Watch for repeated stutter.
- Check phone temperature.
- Switch apps and return.
- Confirm touch controls resume normally.

## 7. Tornado regression

Run the normal Tornado Mission.

- Suction, Gust Burst, and Static Zap must still work.
- Mission objectives and upgrades must still work.
- Power and destruction pacing should remain improved.


---

## Source: `severe-warning-v0.7.0-ms.1/VERIFICATION.md`

# Verification Report

## Build

`v0.7.0-ms.1`

## Automated result

**41 of 41 checks passed.**

## Tested viewports

- 932 × 430
- 760 × 360

## Verified

- JavaScript syntax
- no duplicate markup IDs
- no external runtime scripts or stylesheets
- tornado mission startup
- Wedge Sandbox startup
- Supercell Sandbox startup
- fixed 60 Hz simulation
- direct movement in all tested modes
- sub-pixel projected movement samples
- valid camera scaling
- supercell storm identity
- storm-specific ability labels
- nested supercell influence fields
- controlled Hail Core Power drain
- Hail Core property damage
- Downburst Power cost
- Chain Zap Power cost
- no runtime exceptions
- no console errors

## Automated performance observations

- A separate 3.6-second continuous-movement benchmark at 932 × 430 measured approximately 58.8 FPS for the tornado mission, 57.9 FPS for Wedge Sandbox, and 60.1 FPS for Supercell Sandbox.
- Wedge Sandbox began in Balanced FX and maintained the fixed simulation.
- Physical Android performance remains the authoritative gate.

## Limitation

Automated tests establish functional behavior and rendered output. They do not replace physical-device judgment of touch feel, sound quality, heat, and visual appeal.


---

## Source: `severe-warning-v0.7.1-sc.1/BALANCE_AND_AUDIO.md`

# Balance and Audio Corrections

## Source playtest notes

The Android playtest identified three release-blocking problems:

1. Power depleted too quickly.
2. Structures required too much sustained damage.
3. Lightning sounded like an arcade effect from the 1980s.

These notes were corrected before the Giant Storm Foundation was packaged.

## Current tuning

| System | Current value |
|---|---:|
| Continuous Suction drain | 3.0 Power per second |
| Suppression-station drain | 3.5 Power per second |
| Gust Burst cost | 14 Power |
| Static Zap base cost | 20 Power |
| Passive damage multiplier | 1.85 |
| Core damage multiplier | 1.65 |
| Suction damage multiplier | 1.42 |
| Gust damage multiplier | 1.28 |
| Zap damage multiplier | 1.28 |

## Automated pacing observations

- Five seconds of Suction while under suppression drained approximately 25.5 Power.
- A normal house exposed to sustained Suction after suppression was destroyed in approximately 3.75 seconds.
- Gust Burst consumed approximately 14.3 Power in the automated simulation.
- Static Zap consumed approximately 20.8 Power in the automated simulation.

Small differences from the listed costs come from simultaneous terrain and simulation ticks.

## Lightning audio redesign

The old lightning effect relied too heavily on a tonal oscillator, producing a game-like beep.

The new sound combines:

- a short high-pass noise crack
- a filtered mid-frequency snap
- a low-frequency rumble body
- existing delayed thunder behavior

The shared noise buffer is allocated once when Web Audio initializes.

## Honest limit

Automated tests can prove that the new noise-based signal path exists and executes. They cannot judge the physical phone speaker, perceived loudness, or whether the sound is convincing. Android listening remains the approval gate.


---

## Source: `severe-warning-v0.7.1-sc.1/CHANGELOG.md`

# Changelog

## v0.7.1-sc.1

### Supercell identity

- Replaced sandbox-only supercell progression with a complete mission sequence.
- Added warm-inflow organization and electrical-charge milestones.
- Added a complete radar, town, warehouse, blackout, and damage objective chain.
- Added supercell-specific objective guidance, chaser commentary, mission telemetry, and aftermath language.

### Movement

- Added heavier momentum and slower steering response than the tornado.
- Added storm-body lag so the broad cloud mass follows directional changes rather than sliding as one rigid icon.
- Preserved sub-pixel projected movement and fixed 60 Hz simulation.

### Storm anatomy

- Strengthened the updraft tower, mesocyclone, hail sector, rain curtain, hook region, rear-flank gust front, and dark storm underside.
- Added rain puddles and localized weather marks.
- Kept the player directly centered on the storm rather than introducing a management view.

### Abilities

- Hail Core now uses a heading-relative hail sector, sustained Power drain, material-specific damage, wetness, and hail-wear signatures.
- Downburst is now directional, advances the town objective, and pushes damage along the storm heading.
- Chain Zap requires electrical charge, prioritizes conductive targets, branches to nearby targets, and leaves electrical strike signatures.

### Progression

- Added three supercell evolution branches:
  - Tight Mesocyclone
  - Ice Factory
  - Rear-Flank Surge
- Added supercell leveling, diameter growth, Power and Stability growth, charge recovery, and branch-specific ability changes.

### Balance corrections

- Reduced hail damage to poles and elevated infrastructure.
- Reduced passive supercell field damage to prevent the storm footprint from completing objectives automatically.
- Reduced Downburst structural damage and radius while retaining broad visible impact.
- Prevented Downburst from automatically triggering the blackout objective.
- Reduced supercell XP from destroyed props so one ability does not skip the mission progression.
- Suppressed small BOING floating text at wide supercell camera scales while retaining the physics event.

### Verification

- Added independent-page tests so ability and mission checks do not contaminate one another through level-up pauses.
- Added warm-inflow, charge, movement, Hail Core, Downburst, Chain Zap, upgrade, objective-copy, audio-layer, compact-viewport, and sustained-movement checks.


---

## Source: `severe-warning-v0.7.1-sc.1/DEPLOYMENT.md`

# Deployment Status

This build is packaged as a candidate only.

- Candidate: `v0.7.1-sc.1`
- Netlify project: `severe-weather-warning`
- Site ID: `aec2cbd0-c3de-4528-80e9-16d76ab68f99`
- Existing production deploy remains unchanged.
- Do not deploy until the Android test plan is completed and explicit approval is given.


---

## Source: `severe-warning-v0.7.1-sc.1/ENGINE_ARCHITECTURE.md`

# Engine Architecture

## Simulation

- Fixed 60 Hz simulation
- Bounded catch-up loop
- Interpolated camera and entity rendering
- Spatial hash for nearby interaction queries
- Hard-capped pooled particles, debris, bolts, floating text, and storm scars
- No external runtime dependencies

## Physical storm model

The tornado stores a physical diameter and derives its nested field radii from that value:

- inflow
- strong wind
- debris
- destructive core

Power, Stability, terrain, upgrades, abilities, and physical size all influence the resulting damage and environmental response.

## Camera

The camera remains separate from world simulation. Its target zoom is selected from physical storm diameter and smoothly interpolated.

World positions remain sub-pixel precise. Final projected draw positions are integer-aligned at the raster boundary.

## Render levels

- Close scale: full volumetric props and local detail
- Town scale: reduced small effects and stronger silhouettes
- County scale: regional roads, district masses, storm geometry, and damage paths

Decorative effects reduce before simulation quality.

## Render passes

1. regional terrain and macro ground
2. detailed terrain, roads, lots, and districts
3. storm scars and wind-ground response
4. power lines and depth-sorted props
5. particles, debris, and suction links
6. giant storm body, vortices, wall cloud, and lightning
7. atmosphere and foreground weather
8. world-space feedback and DOM interface

## Audio

Web Audio initializes after a user gesture and synthesizes filtered wind, rain, circulation rumble, thunder, impacts, creaks, Gust, and noise-based electrical strikes.

## QA sandbox law

The Wedge Sandbox scale is locked at 260 meters. Its broad damage field can generate enough XP to change classes almost immediately, so the lock keeps art and performance comparisons repeatable. Normal mission progression remains unlocked.


---

## Source: `severe-warning-v0.7.1-sc.1/GIANT_STORM_FOUNDATION.md`

# Giant Storm Foundation

## Governing rule

Scale changes the view, not the genre. The player remains in direct control of the storm at every size.

## Physical scale classes

| Class | Diameter | Intended view |
|---|---:|---|
| Rope | 24 m | close tactical |
| Cone | 55 m | neighborhood |
| Wedge | 120 m | town |
| Giant Wedge | 260 m | district |
| Monster Wedge | 480 m | county impact |
| Half-Mile Wedge | 805 m | large county impact |

The class changes physical field radii, camera scale, storm geometry, environmental reach, and visual level of detail. It is not merely a name change.

## Nested field model

Each tornado owns four ordered regions:

1. Inflow radius
2. Strong-wind radius
3. Debris radius
4. Core radius

The wide field applies structural pressure and environmental response. Suction remains a direct player ability and intensifies damage inside the core.

## Camera behavior

The camera calculates its target zoom from the physical diameter. Larger storms pull the view back smoothly while movement remains direct and centered on the storm.

The lowest current target zoom is 0.12. Simulation coordinates remain unchanged by camera scale.

## Multi-scale rendering

### Close scale

- Full volumetric houses and vehicles
- Small props, poles, wires, debris, and labels
- Detailed particles and destruction states

### Town scale

- Simplified prop presentation
- Reduced label density
- Reduced small-particle traffic
- Strong silhouettes and storm field cues

### County scale

- Small props are suppressed when they would become unreadable fixed-pixel clutter
- Regional roads and district masses carry the scene
- Broad damage scars and storm geometry communicate impact
- Environmental effects reduce before simulation quality

## Giant destruction

Large tornadoes apply damage across their strong-wind and core fields. Structures remain fixed to foundations until failure, while vehicles and loose material can move.

A preallocated scar system records broad storm passage without allocating new objects in the main loop.

## Wedge Sandbox

The Wedge Sandbox begins at 260 meters and level 4. Its scale is locked so the large initial damage event does not immediately advance it into another class. This provides a stable comparison point for art, camera, performance, and control testing.

Normal mission mode retains progression-based growth.

## Future compatibility

The same physical camera, map, field, and level-of-detail architecture can support larger maps and other directly controlled storms. Future storm implementations must retain their own movement and destruction identity under the No-Drift Policy.


---

## Source: `severe-warning-v0.7.1-sc.1/MULTI_STORM_CORE.md`

# Multi-Storm Core

## Governing rule

The player remains the storm. Shared architecture may change implementation, but it must never turn direct action into weather management.

## Shared storm contract

The current build supports common storm capabilities:

- direct world position and velocity
- Power and Stability
- physical footprint and nested influence fields
- preferred camera scale
- storm-specific primary, burst, and lightning abilities
- storm-specific rendering passes
- storm-specific terrain response
- storm-specific mission logic and progression

## Tornado implementation

The tornado retains:

- Suction
- Gust Burst
- Static Zap
- rotating inflow
- destructive core
- debris field
- physical scale classes from Rope through Half-Mile Wedge

## Supercell implementation

The supercell now has a complete mission identity:

- heavy momentum and delayed body response
- warm-inflow organization
- electrical-charge progression
- heading-relative Hail Core
- directional Downburst
- charged Chain Zap
- distinct weather regions and damage signatures
- three unique evolution branches
- radar, town, warehouse, blackout, and damage objectives

## No-drift check

The supercell is not a tornado with different particles. It changes movement, scale, attack rhythm, objective logic, environmental response, progression, and rendering while preserving direct storm control.


---

## Source: `severe-warning-v0.7.1-sc.1/NO_DRIFT_POLICY.md`

# Severe Weather No-Drift Policy

## Core identity

Severe Weather is a direct-control weather destruction action RPG. The player is the storm.

## Non-negotiable rules

- Action comes first.
- Scale changes the view, not the genre.
- Graphics are gameplay.
- Destruction must be physical and readable.
- Power and Stability remain separate.
- Every storm type must move, grow, resist, and destroy differently.
- Mobile is the primary design target.
- Civilians are evacuated or sheltered. There are no visible human casualties.
- Humor comes from property destruction, physics, news coverage, and invincible animals.

## Approval gate

A substantial feature must strengthen the fantasy of being the storm, improve direct play, remain readable on a phone, and justify the work it displaces.

## Visual gate

A visual release requires physical-device review. Automated execution checks cannot prove that the art looks right.

## Change control

Core concepts cannot change silently. A proposed genre or identity change requires explicit owner approval.

## North star

Every storm creates a story worth retelling.


---

## Source: `severe-warning-v0.7.1-sc.1/PLAYTEST_LOG.md`

# Playtest Log

## Earlier physical Android notes

### v0.5.4-sp.1

- Power depleted too quickly.
- Structures required too much sustained damage.
- Lightning audio sounded like an arcade game from the 1980s, although it functioned.

Actions taken:

- reduced continuous Power drain
- increased useful destruction pacing
- replaced the tonal lightning strike with a noise-based electrical crack and delayed thunder

### v0.6.0-gs.1

- Giant-storm movement felt slightly choppy.
- Direct control never dropped and the storm always moved.

Actions taken:

- preserved sub-pixel projected geometry
- retained integer alignment only at cached bitmap boundaries
- started giant modes at Balanced FX
- reduced decorative effects before simulation quality
- added projected-motion sampling and sustained movement checks

## v0.7.1-sc.1 development findings

The first Supercell Identity implementation was mechanically successful but over-destructive:

- one Downburst could collapse most of the power grid
- two seconds of Hail Core could trigger blackout progression
- broad field damage generated upgrades too quickly

Actions taken before packaging:

- reduced passive supercell damage
- made poles highly resistant to hail
- reduced Downburst radius and structural damage
- prevented Downburst from automatically completing blackout progression
- reduced supercell XP earned per destroyed prop
- retained strong Chain Zap damage as the deliberate grid weapon

## Remaining physical Android gate

The next run must judge:

- heavy movement feel without sluggishness
- visual clarity of the storm regions
- distinct feel of Hail Core, Downburst, and Chain Zap
- sound quality through the phone speaker
- heat and frame pacing during a complete mission
- whether the mission remains fun after the novelty of the new storm wears off


---

## Source: `severe-warning-v0.7.1-sc.1/README.md`

# Severe Weather Warning v0.7.1-sc.1

A self-contained, mobile-first, direct-control weather destruction action RPG prototype.

## Playable modes

- Tornado Mission
- Giant Wedge Sandbox
- Supercell Mission

## Supercell Mission

The supercell is now a complete mission candidate rather than a sandbox-only systems test.

The player directly steers a broad rotating storm through this sequence:

1. Root the updraft in warm inflow.
2. Build electrical charge.
3. Disable the weather radar with Chain Zap.
4. Drive a directional gust front into Harlow County.
5. Break the reinforced warehouse.
6. Collapse three power poles and trigger a county blackout.
7. Reach the damage goal and complete the forecast.

The supercell has distinct movement, storm anatomy, abilities, environmental damage signatures, progression branches, mission commentary, and aftermath presentation.

## Controls

### Mobile

- Left side: movement joystick
- Right side: Hail Core, Downburst, and Chain Zap
- Pause button: settings, mission details, upgrades, and end-test control

### Keyboard

- WASD: movement
- Space: hold Hail Core
- Q: Downburst
- E: Chain Zap
- P or Escape: pause

## Build priorities

- the player remains the storm
- direct action before management systems
- distinct storm identities
- readable physical destruction
- mobile performance and touch reliability
- no human casualties
- harmless, invincible animals

Production is not changed by this package. The Android standalone is the approval candidate.


---

## Source: `severe-warning-v0.7.1-sc.1/SCALE_ARCHITECTURE.md`

# Multi-Scale World Architecture

## Governing rule

Scale changes the view, not the genre. The player remains the storm.

## World units

- Horizontal simulation uses shared world units.
- One world unit represents six meters in the current prop and storm scale model.
- Vertical dimensions use a dedicated projected conversion.
- Camera zoom never changes simulation coordinates.

## Current world

- County map: 160 by 110 world units
- Detailed Harlow district retained inside the regional map
- Additional satellite districts and regional roads
- Physical storm diameter range: 24 to 805 meters

## Object level of detail

Close views preserve individual vehicles, poles, wires, small props, labels, and detailed particles.

Wide views suppress small fixed-pixel elements before they become oversized clutter. Major buildings, roads, district masses, storm fields, and persistent damage paths remain.

## Simulation level of detail

The current build still simulates a bounded county prop population. It does not yet stream an unlimited regional world. The current architecture establishes the physical scale, camera behavior, culling rules, and persistent damage representation needed before chunk streaming is introduced.

## Future storms

Future storms may select different scale bands and field models, but each remains a directly controlled action character under the No-Drift Policy.


---

## Source: `severe-warning-v0.7.1-sc.1/SUPERCELL_IDENTITY.md`

# Supercell Identity Standard

## Governing rule

The player is the storm. The supercell must remain a directly controlled action character, not a weather dashboard or strategy token.

## Movement identity

The supercell carries more momentum than the tornado.

- Steering builds gradually.
- The broad cloud body lags behind directional changes.
- The gust-front heading follows the player's movement with controlled delay.
- Camera scale reflects the large storm footprint while preserving direct control.

## Physical storm regions

The playable storm exposes several linked regions:

- updraft tower
- rotating mesocyclone
- hail core
- forward precipitation area
- rear-flank downdraft
- gust front
- hook-shaped precipitation region

These regions are visible and support different gameplay effects.

## Ability identity

### Hail Core

A sustained heading-relative attack that works roofs, windows, vehicles, crops, and exposed materials. It leaves wetness and hail-wear marks. Poles and elevated steel infrastructure are deliberately resistant so hail does not replace the grid-focused lightning ability.

### Downburst

A broad directional wind attack projected ahead of the storm heading. It damages and pushes exposed targets, advances the town-impact objective, and leaves a clear gust signature. Its balance is intentionally below the level that would erase the district or complete the blackout objective automatically.

### Chain Zap

A charged infrastructure attack. It requires sufficient electrical charge, prioritizes conductive and strategic targets, branches to nearby objects, and leaves a visible electrical signature. This is the deliberate tool for radar and power-grid objectives.

## Progression branches

### Tight Mesocyclone

- sharper steering
- faster charge generation
- stronger Stability recovery
- an additional lightning chain

### Ice Factory

- wider Hail Core
- larger hail damage
- lower sustained Hail Core drain

### Rear-Flank Surge

- larger directional Downburst
- stronger gust-front damage
- shorter Downburst cooldown

## Damage signatures

The three abilities must not feel interchangeable.

- Hail: cumulative roof, glass, crop, and vehicle wear
- Downburst: directional wind stress, displacement, and broad gust marks
- Chain Zap: concentrated electrical failure, branching strikes, and grid chains

## Current visual boundary

The supercell now has a coherent playable identity, but final production art still depends on physical Android review. The broad storm silhouette, cloud depth, precipitation layering, effect contrast, and small-screen readability remain subject to device-based refinement.


---

## Source: `severe-warning-v0.7.1-sc.1/TEST_PLAN.md`

# Android Test Plan

## 1. Launch and movement

Start **Supercell Mission**.

- Hold a diagonal direction for ten seconds.
- Reverse direction several times.
- Confirm movement feels heavy but remains responsive.
- Confirm the cloud body visually follows rather than sliding as one rigid disk.
- Confirm no control input is ignored during rain, hail, or destruction.

## 2. Organize the storm

Follow the objective to warm inflow.

- Hold the storm over warm ground until the updraft organizes.
- Confirm charge then becomes the active objective.
- Build charge to the required threshold.
- Confirm the next objective points to the weather radar.

## 3. Chain Zap

Use **Chain Zap** on the radar and later on the power grid.

- Confirm the ability requires sufficient charge.
- Confirm the strike branches to nearby targets.
- Confirm the phone speaker produces an electrical crack and thunder rather than a musical arcade tone.
- Confirm grid destruction feels deliberate rather than automatic.

## 4. Downburst

Aim the storm toward Harlow County and use **Downburst**.

- Confirm the blast projects in the movement direction.
- Confirm multiple town objects visibly react.
- Confirm the town objective advances.
- Confirm one Downburst does not automatically collapse the power grid or erase the warehouse.

## 5. Hail Core

Hold **Hail Core** over houses, vehicles, and the reinforced warehouse.

- Confirm Power drains gradually.
- Confirm roofs and vehicles show cumulative wear.
- Confirm rain and hail remain readable without covering the whole screen.
- Confirm utility poles do not collapse from hail alone.
- Confirm the warehouse takes sustained work rather than disappearing instantly.

## 6. Evolution branches

Reach the first upgrade and inspect all three choices.

- Tight Mesocyclone should improve steering, charge, and lightning chaining.
- Ice Factory should improve hail coverage and efficiency.
- Rear-Flank Surge should improve Downburst reach, force, and cooldown.

Choose one and confirm the run resumes normally.

## 7. Complete mission

Finish the full objective sequence:

- warm inflow
- charge threshold
- radar disabled
- gust front through town
- warehouse failure
- county blackout
- damage goal

Confirm the aftermath report reflects a supercell rather than tornado language.

## 8. Performance and heat

Play one complete mission.

- Watch for repeated stutter during Hail Core and Downburst.
- Check phone temperature after several minutes.
- Switch apps and return.
- Confirm controls and procedural audio resume normally.

## 9. Regression

Briefly test Tornado Mission and Wedge Sandbox.

- Existing movement and abilities must still work.
- The new supercell mission must not change the tornado into the same movement or attack rhythm.


---

## Source: `severe-warning-v0.7.1-sc.1/VERIFICATION.md`

# Verification Report

## Build

`v0.7.1-sc.1`

## Automated result

**77 of 77 checks passed.**

## Tested viewports

- 932 x 430
- 760 x 360

## Verified

- JavaScript syntax
- standalone startup
- Supercell Mission launch at both phone targets
- fixed 60 Hz simulation
- direct heavy movement
- 18 unique projected positions across 18 movement samples
- visible storm-body lag during steering
- warm-inflow organization
- electrical-charge milestone
- Hail Core labels and operation
- Hail Core warehouse damage
- Hail Core wetness and hail-wear signatures
- Hail Core does not erase the warehouse
- Hail Core does not automatically collapse the power grid
- directional Downburst operation
- Downburst town-object hits
- Downburst town-objective progression
- Downburst does not automatically trigger blackout
- Downburst damages but preserves the reinforced warehouse
- Chain Zap charge consumption
- Chain Zap radar destruction
- Chain Zap branching
- Chain Zap electrical signature
- all three supercell upgrade branches
- full objective-copy sequence
- procedural wind, rain, hail, rumble, and audio layers
- sustained movement at both phone viewports
- no runtime exceptions
- no browser console errors

## Balance observations

Independent fresh-page scenarios produced the following results:

- Two seconds of Hail Core reduced the warehouse from 650 health to approximately 585 health and left visible hail-wear and wetness state.
- The same Hail Core test left the power grid standing and did not trigger blackout.
- A town-centered Downburst affected more than fifty nearby props, advanced the town objective, damaged the warehouse modestly, and did not collapse any power poles.
- A fully charged Chain Zap disabled the weather radar, branched to two nearby targets, and reduced charge from 100 to approximately 66.

## Automated performance observations

The headless browser reported 60 FPS during the sustained movement checks at both 932 x 430 and 760 x 360. Balanced FX remained active.

This result is useful for regression testing but is not a guarantee of physical phone performance.

## Limitation

Automated tests establish behavior and rendered output. They cannot replace physical-device judgment of touch feel, storm readability, sound quality, phone heat, or whether the complete mission is genuinely fun.


---

## Source: `severe-warning-v0.7.5-camera-lab.1/CAMERA_LAB.md`

# Camera and Region Laboratory

Build: v0.7.5-camera-lab.1

## Purpose

This build compares three camera concepts over the same playable world and physics.

### Orthographic ISO

The current control sample. It provides strong map readability and predictable scale, but can flatten buildings, vehicles, and vertical destruction.

### Dynamic Oblique

The leading candidate. It adds mild near-to-far perspective, stronger vertical scale, and more physical impact while keeping roads and districts readable.

### High Angle

A county-scale candidate for giant storms. It reveals more of the world and supports wider storm footprints, but increases the amount of visible world and may require more aggressive level-of-detail and effect scaling.

## Controls

- Tap a CAMERA LAB button to switch views during play
- Press C on a keyboard to cycle camera modes
- The storm, map, physics, objectives, and damage values do not change

## Current preliminary judgment

Dynamic Oblique is the strongest primary gameplay direction in the current town scene.

High Angle is promising as a scale band for giant storms and broad weather systems, not as the default close-impact view.

Orthographic ISO remains valuable as a baseline and possible accessibility/performance option.

No final camera decision is made until physical Android comparison is complete.


---

## Source: `severe-warning-v0.7.5-camera-lab.1/CORE_DIRECTION.md`

# Severe Weather Core Direction v2.0

Status: Active and canonical
Updated: 2026-07-23
Source of truth: Project conversation

## Core fantasy

Severe Weather is a direct-control weather destruction action RPG.

The player is the storm. The player moves, attacks, grows, resists weakening conditions, chooses upgrades, creates chain reactions, and leaves a physical path through a world that existed before the storm arrived.

North star:

> Every storm creates a story worth retelling.

## World identity

The game takes place in a connected living region containing urban, suburban, small-town, industrial, agricultural, and natural spaces.

The world must feel intentionally constructed:

1. Terrain, rivers, drainage, and elevation
2. Regional roads, streets, rail, and bridges
3. Power, communications, and water infrastructure
4. District boundaries and property access
5. Lots, buildings, vehicles, vegetation, and small props
6. Storm interactions and material-specific failure
7. Persistent aftermath and regional scars

Rural space is not empty travel. It provides farms, equipment, crops, transmission lines, rail crossings, windbreaks, drainage, roadside businesses, and large-scale environmental response.

Urban space provides density, landmarks, traffic, glass, signs, utilities, rooftops, parking, industrial equipment, and interconnected chain reactions.

## Camera direction

Strict orthographic isometric remains a useful baseline, but it is no longer the assumed final camera.

The leading direction is a dynamic oblique perspective camera:

- Close impact band: lower oblique angle for visible walls, vertical debris, and physical destruction
- District band: primary gameplay angle balancing city readability and storm spectacle
- County band: higher angle for giant tornadoes, supercells, and future hurricanes
- Replay and news camera: separate cinematic camera that never compromises gameplay controls

Camera rules:

- Scale changes the view, not the genre
- The player remains in direct control at every camera band
- Camera transitions are smooth and restrained
- Four-angle snap rotation may be added only after obstruction and touch tests pass
- Free camera is reserved for replay, aftermath, and presentation

## Visual direction

Visual north star:

> A living miniature region photographed like a disaster movie.

The region should combine city-builder clarity with action-game motion and destruction.

Required qualities:

- coherent world scale
- readable silhouettes
- visible wall and roof volume
- connected roads and lots
- consistent light direction
- material-specific surfaces and failures
- weather-responsive terrain and structures
- near, mid, and far visual representations
- low reliance on labels
- mobile readability before decorative detail

High-resolution textures cannot rescue weak geometry. Geometry, materials, lighting, context, and weather response must work together.

## Storm identity

Every storm must have unique movement, abilities, internal structure, damage signatures, progression, resistance, camera behavior, and rhythm.

Tornado:

- concentrated physical destruction
- suction, debris, and narrow violent cores
- direct contact with individual structures
- growth from rope to giant wedge

Supercell:

- broad multi-hazard footprint
- hail, lightning, straight-line wind, and heavy rain
- internal regions that matter to tactics
- damage signatures across crops, roofs, glass, vehicles, and power networks

Future storms must not be reskins.

## Gameplay loop

Title
→ Select storm and mission
→ News intro
→ Direct-control gameplay
→ Environmental resistance and evolution choices
→ District and landmark encounters
→ Mission climax
→ Aftermath report and replayable story record

Simulation, streaming, and level-of-detail systems support this loop. They must not turn the game into weather management.

## Region construction policy

The region will use authored modular chunks connected through roads, utilities, water, and district edges.

Examples:

- farmstead and grain complex
- rural crossroads and truck stop
- small-town main street
- suburban neighborhood
- commercial strip
- industrial rail district
- downtown civic block
- river and bridge corridor
- electrical substation corridor

Open areas must provide environmental response, route choice, resistance, buildup, or visible destinations. Long dead zones are not acceptable.

## Current milestone sequence

### v0.7.5 Camera and Region Laboratory

Compare orthographic isometric, dynamic oblique, and high-angle views using the same world, storms, physics, and controls.

### v0.8.0 Living Region and Visual Quality Foundation

Build one connected urban-rural region with improved materials, district identity, continuous destruction routing, storm-specific damage signatures, and scalable rendering.

### Later milestone

Persistent storm selection, progression, aftermath records, and reusable mission data follow after the world is attractive and worth revisiting.

## No-drift gate

Every major proposal must answer:

1. Does it strengthen the fantasy of being the storm?
2. Does it improve direct control, destruction, progression, readability, or storytelling?
3. Does it make the living region more believable or more fun to destroy?
4. Does it work on the actual Android viewport?
5. Does it preserve distinct storm identities?
6. Is the visible benefit worth the implementation cost?

Technology serves the fantasy. It does not redefine it.


---

## Source: `severe-warning-v0.7.5-camera-lab.1/TEST_HARNESS.md`

# Browser Test Harness

## What is now possible

The standalone game can be loaded into headless Chromium through the Chrome DevTools Protocol and exercised as a running game.

The harness can:

- set phone-class viewport sizes
- start tornado, wedge, and supercell modes
- switch camera modes
- simulate keyboard movement
- trigger storm abilities
- inspect debug snapshots
- capture screenshots
- monitor JavaScript and browser errors
- record projected movement samples

## Why document injection is used

The managed Chromium environment blocks localhost and file URLs. The harness opens a blank page and injects the complete self-contained HTML with `Page.setDocumentContent`.

This executes the real Canvas renderer, simulation, HUD, input handlers, and game loop without changing the source.

## What the harness cannot prove

It cannot replace physical Android testing for:

- touch feel
- speaker sound quality
- haptics
- heat
- battery use
- subjective visual appeal
- whether the game is genuinely fun in a human hand

Automated browser testing is a development gate. The phone remains the final approval gate.


---

## Source: `severe-warning-v0.7.5-camera-lab.1/TEST_PLAN.md`

# Android Camera Laboratory Test Plan

## Setup

1. Open the standalone HTML in landscape.
2. Start the Tornado Mission.
3. Enter the town district.
4. Switch among ISO, OBLIQUE, and HIGH using the CAMERA LAB panel.

## Compare each camera

Judge the following without pausing for technical details:

- Can buildings and cars be recognized immediately?
- Do roads, driveways, lots, and intersections feel connected?
- Does the storm clearly touch the ground?
- Does debris appear to rise vertically rather than slide over the map?
- Is the next destruction opportunity visible?
- Does the camera hide important objects behind buildings or trees?
- Does movement remain comfortable and predictable?
- Does the scene look attractive at first glance?

## Giant-storm test

1. Restart in Wedge Sandbox.
2. Compare OBLIQUE and HIGH.
3. Watch for frame pacing, visual clutter, and whether the wedge feels enormous rather than merely zoomed out.

## Supercell test

1. Restart in Supercell Mission.
2. Compare OBLIQUE and HIGH while moving across open terrain and a target district.
3. Confirm the storm footprint, roads, and next destination remain understandable.

## Device checks

- no repeatable freeze
- direct control never drops
- phone temperature remains reasonable
- no severe battery drain during a ten-minute run
- camera switching does not cause a lasting stutter
- all controls remain reachable at 932 × 430 class viewports

## Decision record

Record one answer:

- ISO is best
- OBLIQUE is best
- HIGH is best
- Hybrid is best, with OBLIQUE close and HIGH for giant storms

Also note any camera that should be rejected.


---

## Source: `severe-warning-v0.7.5-camera-lab.1/VERIFICATION.md`

# Verification Report

Build: v0.7.5-camera-lab.1
Date: 2026-07-23

## Static checks

- standalone HTML: passed
- JavaScript syntax: passed
- duplicate DOM IDs: none
- external runtime dependencies: none

## Automated browser checks

Chromium loaded the complete standalone document through the Chrome DevTools Protocol.

Verified:

- build initialized successfully
- Tornado Mission started
- Wedge Sandbox started
- Supercell Mission started
- ISO camera switch worked
- Dynamic Oblique camera switch worked
- High Angle camera switch worked
- camera switch preserved world and storm state
- sustained movement remained continuous
- 12 unique projected positions were recorded from 12 movement samples
- Hail Core executed
- Downburst executed
- Chain Zap executed
- screenshots captured at 932 × 430 and 760 × 360
- runtime exceptions: zero
- browser log errors: zero

## Performance observation

Dynamic Oblique reached approximately 60 FPS after warmup in automated testing.

High Angle showed greater rendering pressure in the dense town at 932 × 430 and caused the adaptive effects governor to reduce decorative quality during one sustained run. A fresh isolated run remained roughly in the upper-40s to 60 FPS range.

This supports using High Angle as a giant-storm scale band with stronger culling and level-of-detail rules rather than as the universal default view.

## Visual observation

In the current detailed town scene:

- Dynamic Oblique gives the strongest building volume and road depth.
- High Angle shows the broadest tactical area.
- Orthographic ISO remains the cleanest baseline but looks flatter.

These are preliminary findings. Physical Android comparison remains authoritative.


---

## Source: `severe-warning-v0.7.5-camera-lab.2/CAMERA_LAB_CORRECTION.md`

# Camera Laboratory Correction

## Playtest finding

The owner reported that the camera views could not be changed on Android and that the build looked and felt essentially the same as the prior version.

That finding invalidated v0.7.5-camera-lab.1 as a camera comparison.

## Root causes

1. `#hud` disables pointer events by default, but the camera panel did not explicitly restore `pointer-events: auto`.
2. The projection parameters differed only modestly.
3. The active camera state was not prominent enough to prove that a switch occurred.
4. On compact screens, a permanent right-side laboratory panel competed with gameplay controls.

## Corrections

- Touch-safe pointer handling on all camera controls.
- A large top-center camera cycle control.
- Persistent active-view label.
- Haptic, toast, and chaser confirmation after each switch.
- Direct buttons on wide screens.
- Compact screens hide the side panel and use the cycle control, preserving ability access.
- Strongly separated projection and zoom values.
- Oblique camera adds stronger vertical scale, perspective, closer framing, and movement look-ahead.
- County camera uses a near top-down projection and substantially wider framing.

The corrected candidate is v0.7.5-camera-lab.2.


---

## Source: `severe-warning-v0.7.5-camera-lab.2/CORE_DIRECTION_UPDATE.md`

# Core Direction Update

The project remains a direct-control weather destruction action RPG set in a living urban-rural region.

Camera policy:

- strict isometric is no longer assumed to be final
- angled top-down readability remains essential
- dynamic oblique is a candidate for normal impact play
- high angle is a candidate for giant storms and county-scale play
- camera choice must be proven through a valid physical comparison
- v0.7.5-camera-lab.1 is not valid evidence because its touch controls failed and its modes were insufficiently separated
- v0.7.5-camera-lab.2 is the current decision instrument

No production architecture or regional build should be locked to a new projection until this gate is resolved.


---

## Source: `severe-warning-v0.7.5-camera-lab.2/TEST_PLAN.md`

# Android Camera Comparison Test

1. Open the standalone HTML in landscape orientation.
2. Start the Tornado Mission.
3. Move into a block containing houses, roads, vehicles, trees, and the water tower.
4. Tap the large top-center camera button repeatedly.
5. Confirm the label cycles in this order:
   - COUNTY HIGH
   - ISO GRID
   - IMPACT OBLIQUE
6. Compare the same block in all three views.
7. Repeat while moving and while destroying a structure.
8. Start Wedge Sandbox and compare IMPACT OBLIQUE against COUNTY HIGH.

## Questions

- Which view makes buildings and vehicles easiest to identify?
- Which view makes destruction feel most physical?
- Does IMPACT OBLIQUE become too close or distorted?
- Does COUNTY HIGH become too flat or detached?
- Can the next target be found without searching?
- Does the camera switch reliably on every tap?
- Are the ability controls unobstructed?

The camera decision remains open until this corrected physical comparison is completed.


---

## Source: `severe-warning-v0.7.5-camera-lab.2/VERIFICATION.md`

# Verification

Build: `v0.7.5-camera-lab.2`

## Automated execution

Chromium loaded the complete standalone HTML through the Chrome DevTools Protocol.

Verified:

- build identity
- JavaScript syntax
- zero runtime exceptions
- zero browser log errors
- fixed game execution remains active
- 12 unique positions from 12 movement samples
- all three camera modes report separate zoom and pitch values
- Supercell abilities remain executable

## Real touch-path verification

Chrome touch emulation was used rather than calling the camera debug method.

At 760 by 360:

- compact side panel is hidden
- top camera control is visible
- touch sequence changed `oblique -> high -> iso -> oblique`
- ability controls remain available

At 932 by 430:

- direct touch on ISO selected ISO
- direct touch on Oblique selected Oblique
- direct touch on High selected High

No errors were observed.

## Visual separation

Average RGB pixel differences between identical town captures:

- ISO vs Oblique: 24.94
- ISO vs High: 33.58
- Oblique vs High: 32.99

This confirms substantial rendered differences. It does not determine which camera is best.

## Remaining authority

Physical Android testing remains authoritative for touch reliability, comfort, visual preference, heat, and gameplay feel.


---

## Source: `severe-warning-v0.7.5-camera-lab.3/CAMERA_DECISION.md`

# Camera Decision Record

## Evidence from physical Android testing

| View | Strongest use | Weakness |
|---|---|---|
| County High | Finding town clusters and understanding the region | Destruction is less readable and less physical |
| ISO Grid | Reading impacts, objects, and damage | Provides less regional awareness |
| Impact Oblique | Middle ground and cinematic depth | Distorts straight roads and long infrastructure lines |

## Selected direction

A two-band hybrid camera is the leading solution.

- **NAV state:** County High values, 68-degree presentation.
- **TRANSITION state:** smooth interpolation based on target density and attack activity.
- **IMPACT state:** ISO-derived values, 45-degree presentation.

The transition is driven by nearby meaningful props, active storm abilities, lock-on activity, flashes, gust pulses, and current destruction combos.

This is a laboratory implementation, not final tuning. Transition distance, speed, and hysteresis must be judged on Android across all three playable storm modes.


---

## Source: `severe-warning-v0.7.5-camera-lab.3/CORE_DIRECTION_UPDATE.md`

# Core Direction Update: Camera and Cross-Storm Testing

Severe Weather remains a direct-control weather destruction action RPG set in a connected living urban-rural region.

## Camera direction

The leading gameplay camera is now **Auto Hybrid**:

1. County High while the player is crossing lower-density terrain or locating the next district.
2. A smooth transition toward ISO framing when meaningful targets are nearby or an attack is active.
3. A return to County High after leaving the destruction corridor.

Impact Oblique is no longer the leading gameplay camera because perspective distortion makes straight roads and infrastructure look bent or uneven. It remains useful for replay, news footage, and controlled cinematic shots.

## Testing rule

Every future camera, region, and destruction prototype must allow Tornado, Giant Wedge, and Supercell selection without reloading the file. Cross-storm comparison is part of the acceptance gate, not an optional convenience.

## Next milestone

`v0.8.0 Living Region and Visual Quality Foundation`

The region will be designed around urban and rural destruction corridors, district readability, better materials, and weather-specific damage signatures. Auto Hybrid becomes the camera baseline unless physical testing rejects the transition behavior.


---

## Source: `severe-warning-v0.7.5-camera-lab.3/PLAYTEST_LOG.md`

# Physical Android Playtest Log

## Camera Laboratory 2 feedback

- County High was the easiest view for finding town clusters.
- ISO Grid was the best view for seeing destruction clearly.
- Impact Oblique was a usable middle ground, but straight roads and other long lines looked distorted.
- The build had no in-run storm selector, so only the Supercell could be compared during that session.

## Decision

The result supports a two-band camera rather than one permanent angle:

- County High for travel, route finding, and giant-scale awareness.
- ISO-derived framing for active destruction.
- Oblique retained only as a laboratory and possible replay camera, not the primary gameplay projection.

The missing storm selector was a test-design failure and is corrected in Camera Laboratory 3.


---

## Source: `severe-warning-v0.7.5-camera-lab.3/TEST_PLAN.md`

# Android Test Plan: Camera Laboratory 3

## 1. Auto Hybrid with Tornado

1. Start Tornado Mission.
2. Leave a town cluster and cross open terrain.
3. Confirm the top label changes to `AUTO NAV` and the view opens toward County High.
4. Enter a dense cluster or begin Suction.
5. Confirm the camera transitions smoothly to `AUTO IMPACT` without a hard jump.
6. Verify buildings, debris, and damage are as readable as ISO Grid.

## 2. In-run storm switching

1. Tap the blue `STORM` button.
2. Select Giant Wedge.
3. Confirm the world restarts and the selected camera mode is preserved.
4. Repeat for Supercell and Tornado.
5. Confirm the picker can be cancelled without changing the current run.

## 3. Manual reference views

Cycle through Auto Hybrid, County High, ISO Grid, and Impact Oblique.

Check:

- County High still provides the strongest route awareness.
- ISO still provides the strongest destruction readability.
- Oblique distortion remains visible enough to justify excluding it as the default.

## 4. Device checks

- Touch targets respond reliably.
- Camera transitions do not cause nausea or disorientation.
- The storm remains centered during transitions.
- Frame pacing remains stable.
- Phone heat remains acceptable.
- Ability buttons are not blocked by laboratory controls.


---

## Source: `severe-warning-v0.7.5-camera-lab.3/VERIFICATION.md`

# Verification Report

## Build

`v0.7.5-camera-lab.3`

## Browser execution

The complete standalone HTML was executed in Chromium through the Chrome DevTools Protocol at `760 × 360` and `932 × 430`.

## Verified behavior

- Compact touch camera cycle: Hybrid → High → ISO → Oblique → Hybrid.
- In-run storm picker opened through the actual touch path.
- Touch selection switched successfully to Supercell, Giant Wedge, and Tornado.
- Camera mode remained Hybrid while switching storms.
- Auto Hybrid entered NAV at 68 degrees in open terrain.
- Auto Hybrid entered IMPACT at 45 degrees in a dense destruction cluster.
- Wide-screen direct camera buttons activated all four modes.
- Tornado movement produced 12 unique positions from 12 samples.
- Supercell Hail Core, Downburst, and Chain Zap smoke tests completed.
- Runtime exceptions: 0.
- Browser log errors: 0.
- Runtime DOM duplicate IDs: 0.
- External runtime dependencies: 0.

## Remaining physical gate

Android testing must judge whether the automatic transition is smooth, correctly timed, comfortable, and useful with all three storms. Phone heat, touch feel, and audio remain physical-device concerns.


---

## Source: `SevereWeather_UnityProductionStarter_v0.1.0/Docs/ART_PIPELINE.md`

# Production Art Pipeline

## Tools

- Blender for modeling and destruction-ready asset construction
- Unity 6.3 URP for lighting, materials, VFX, LOD, streaming, and device profiling
- Image editor or texture-authoring tool for atlases, trim sheets, masks, and decals

## Scale and units

- Blender and Unity use meters
- Asset origins sit at ground-contact pivots
- Forward direction is documented per asset category
- Buildings, vehicles, infrastructure, vegetation, and storms share one physical scale sheet

## Modular kits

### Residential

- wall segments
- corners
- doors
- windows
- roof segments
- porches
- garages
- foundations
- gutters and vents

### Commercial and industrial

- storefront bays
- glass panels
- loading doors
- rooftop equipment
- metal wall panels
- tanks, pipes, fencing, and substations

### Rural

- barns
- sheds
- silos
- grain bins
- irrigation
- greenhouses
- equipment pads
- field-edge props

## Material strategy

- reusable trim sheets
- atlas textures
- vertex-color variation
- decals for dirt, wetness, hail, cracks, burns, and storm scars
- consistent texel density
- district-specific palette variation without breaking material identity

## Destruction-ready asset rules

Each important asset provides:

- intact parent mesh
- detachable components
- stressed visual cues
- damaged replacements
- collapse proxy
- rubble and wreckage set
- collision proxy
- LOD0, LOD1, LOD2, and distant proxy

## Performance rules

- GPU instancing for repeated props
- mesh LOD and district HLOD
- texture atlases and trim sheets
- pooled debris and particles
- simplified collision
- mobile-first shader variants
- no per-frame material instantiation


---

## Source: `SevereWeather_UnityProductionStarter_v0.1.0/Docs/AUDIO_PIPELINE.md`

# Production Audio Pipeline

## Principle

Continuous weather can use procedural layers. Physical impacts require real recorded or professionally authored source material.

## Mixer buses

- Master
- Weather Bed
- Wind Pressure
- Rain and Hail
- Thunder and Electricity
- Structural Impacts
- Debris
- Environment
- UI and Broadcast

## Lightning event stack

1. immediate electrical snap
2. close pressure crack
3. low-frequency body
4. reflected or distant thunder tail
5. environment response such as transformer burst or glass reaction

Simple oscillator beeps are prohibited for final lightning impact.

## Hail material sets

- asphalt
- metal roof
- glass
- vehicle body
- crop field
- water
- wood siding

## Destruction material sets

- timber strain and snap
- sheet-metal flex and tear
- glass crack and burst
- masonry chip and collapse
- vehicle suspension, panel, and impact
- power equipment arc and transformer burst

## Mobile validation

Audio must be tested on:

- phone speaker
- earbuds
- low volume
- noisy room
- sustained play for fatigue

The mix must preserve useful gameplay information without becoming a constant wall of noise.


---

## Source: `SevereWeather_UnityProductionStarter_v0.1.0/Docs/CORE_DIRECTION.md`

# Severe Weather Core Direction - Production Track

## Canonical identity

Severe Weather is a stylized 3D, direct-control weather destruction action RPG set in a dense living urban-rural region.

The player is the storm. The player does not manage weather from a dashboard.

## North star

Every storm creates a story worth retelling.

## World fantasy

The region existed before the storm arrived. Roads connect farms, towns, neighborhoods, shopping corridors, industry, utilities, rivers, rail, and civic landmarks. Destruction is more satisfying because the world appears functional and connected.

## Production rendering direction

- Unity 6.3 LTS
- Universal Render Pipeline
- Stylized dimensional 3D
- City-builder readability with action-game destruction
- County High camera for navigation
- Impact camera for close destruction
- Cinematic replay cameras separate from gameplay cameras

## Storm differentiation

### Tornado

Primary verbs:

- pull
- orbit
- lift
- throw
- carve
- concentrate
- gather debris

### Supercell

Primary verbs:

- paint a hail swath
- aim and intensify a persistent gust front
- build and route electrical charge through infrastructure
- organize a broad moving storm body
- saturate the environment through rain

The Supercell must never become a large tornado with alternate particles.

## Tone

- no human casualties
- civilians evacuated or sheltered
- property destruction is the spectacle
- animals are invincible and occasionally airborne
- deadpan news and storm-chaser framing
- cinematic weather with goofy environmental humor

## Production boundary

The HTML prototype is the mechanics laboratory. Unity is the production track. Prototype renderer limitations must not dictate the final art, map, audio, or storm design.


---

## Source: `SevereWeather_UnityProductionStarter_v0.1.0/Docs/DECISION_LOG.md`

# Production Decision Log

## 2026-07-23

- Freeze the HTML build as the Mechanics Laboratory.
- Select Unity 6.3 LTS with URP as the production engine.
- Keep Android as the first performance target.
- Preserve the direct-control action RPG identity.
- Define the world as a connected urban-rural region rather than isolated arenas.
- Require distinct storm verbs.
- Use County High navigation and Impact camera bands.
- Require real environment-art, region-authoring, technical-art, and audio pipelines.
- Reject the idea that zero-dependency Canvas rendering is a production requirement.


---

## Source: `SevereWeather_UnityProductionStarter_v0.1.0/Docs/MIGRATION_FROM_HTML.md`

# Migration from the HTML Mechanics Laboratory

## Keep as design reference

- Power and Stability
- direct storm control
- no-casualty tone
- news and storm-chaser framing
- terrain resistance
- tornado growth
- chain reactions
- airborne cows
- mission and aftermath structure
- actual phone playtest notes

## Reimplement in Unity

- storm movement and fields
- damage and materials
- abilities
- camera logic
- mobile controls
- mission system
- persistent damage
- audio

## Do not port directly

- procedural Canvas environment art
- sparse object placement
- oscillator-heavy impact audio
- icon-like props
- monolithic single-file architecture
- prototype-specific UI layout

## Frozen mechanics reference

`MechanicsLab/SevereWeather_MechanicsLab_v0.7.1.html` is preserved for comparison. It is not production source.


---

## Source: `SevereWeather_UnityProductionStarter_v0.1.0/Docs/NO_DRIFT_POLICY.md`

# Severe Weather No-Drift Policy - Production Summary

1. The player is the storm.
2. Direct action comes before management systems.
3. Scale changes the view, not the genre.
4. Graphics are gameplay.
5. Destruction must be physical, readable, and persistent.
6. Power and Stability remain separate systems.
7. Every storm requires unique verbs, positioning, timing, visuals, and damage signatures.
8. Mobile is the primary design target.
9. People remain protected and off-limits as targets.
10. Technology serves the fantasy and cannot silently redefine the game.
11. External suggestions are advisory and require evaluation.
12. A build is not production-ready merely because it runs.
13. The real Android device is the final authority for touch, heat, battery, sound, and readability.
14. Core concept changes require explicit approval.
15. The canonical project source is the ChatGPT conversation.


---

## Source: `SevereWeather_UnityProductionStarter_v0.1.0/Docs/PRODUCTION_PLAN.md`

# Production Vertical Slice Plan

## Phase 0 - Starter and toolchain

- Unity 6.3 LTS project opens
- URP and Input System resolve
- production slice scene generates
- Tornado and Supercell both move and use distinct abilities
- Android development build launches

## Phase 1 - Vision lock

- approve one target screenshot
- approve material and lighting guide
- approve region-density map
- approve scale sheet
- approve Tornado and Supercell storyboards
- approve audio reference sheet

## Phase 2 - Asset laboratory

Create production-quality:

- two houses
- one barn
- one commercial building
- one warehouse
- sedan, pickup, and SUV
- utility pole and transformer
- tree set
- crops and field-edge set
- road intersection kit

Each asset includes LOD and destruction states.

## Phase 3 - Dense living-region slice

Build one connected urban-rural region with no long inactive gaps.

## Phase 4 - Tornado proof

Prove concentrated physical destruction, debris, object displacement, and readable path damage.

## Phase 5 - Supercell proof

Prove Hail Swath, Gust Front, Electrical Network, rain response, and broad-storm navigation.

## Phase 6 - Android performance proof

- GPU instancing
- LOD and HLOD
- culling
- pooled debris and VFX
- adaptive quality
- thermals and battery
- stable touch input

## Production release gate

No production claim until:

- the region looks coherent on the real phone
- both storms feel mechanically different
- no-dead-zone playtest passes
- sound no longer feels arcade-like
- Android performance and temperature are acceptable
- previous production build remains recoverable


---

## Source: `SevereWeather_UnityProductionStarter_v0.1.0/Docs/REGION_DENSITY_SPEC.md`

# Living Region Density Specification

## Vertical-slice target

- Approximate playable footprint: 1.2 km by 1.2 km
- Districts: farmland, small town, suburb, commercial corridor, industrial district, civic center
- One major landmark per district
- Roads, utility lines, drainage, and property access must visibly connect districts

## No-dead-zone rules

During normal movement, at least one of these should occur every three seconds:

- a destructible object reacts
- an environmental surface reacts
- a chain-reaction opportunity is visible
- a destination landmark is visible
- an infrastructure line gives navigational direction
- terrain changes storm Power or Stability
- the player is making a meaningful route choice

## Navigation visibility

From County High view, the player should normally see:

- the current district
- at least one adjacent target cluster
- one route or infrastructure connector
- one meaningful landmark or objective direction

## Rural density

Rural does not mean empty. Rural chunks use:

- crops
- farmhouses
- barns
- silos
- grain handling
- irrigation
- equipment
- windbreaks
- ponds and drainage
- substations and transmission corridors
- roads and rail crossings

## Urban density

Urban chunks use overlapping interaction layers:

- buildings
- parked and moving vehicles
- signs
- glass
- rooftop equipment
- utilities
- trees and street furniture
- drainage
- power and communication networks

## Validation

The graybox runtime reports nearest-target spacing. Final validation also requires human play, because environmental reactions and visible landmarks can make a transition meaningful even when structures are farther apart.


---

## Source: `SevereWeather_UnityProductionStarter_v0.1.0/Docs/STORM_VERBS.md`

# Storm Verb Contract

## Tornado

### Movement identity

Fast, responsive, physical, locally precise.

### Abilities

- Suction: pull, orbit, lift, and dismantle
- Gust: burst outward and weaponize debris
- Lightning: tactical infrastructure strike

### Damage signature

A concentrated path with displaced objects, directional rubble, debris fields, uprooted vegetation, and localized infrastructure failure.

## Supercell

### Movement identity

Heavy, broad, momentum-driven, directionally strategic.

### Abilities

#### Hail Swath

A moving corridor linked to storm heading. It shreds crops, cracks glass, dents vehicles, damages roofs, and accumulates visual hail wear.

#### Gust Front

A persistent leading boundary. The player aims it through storm direction, then intensifies it. Trees, signs, vehicles, and roof panels fail in a shared downwind direction.

#### Electrical Network

Charge builds through organization. The player selects a conductive anchor through positioning. Electricity travels through connected poles, substations, rail, towers, metal roofs, and transformers.

### Damage signature

Wide hail corridors, directional wind lanes, blacked-out infrastructure networks, wet surfaces, and accumulating runoff.

## Design test

If two storm abilities can be swapped without changing the player's positioning, timing, or target-selection decision, the abilities are not differentiated enough.


---

## Source: `SevereWeather_UnityProductionStarter_v0.1.0/Docs/UNITY_SETUP.md`

# Unity Setup Checklist

## Install

- Unity Hub
- Unity 6.3 LTS
- Android Build Support
- Android SDK and NDK Tools
- OpenJDK

## Open

Open the folder `SevereWeather_UnityProductionStarter_v0.1.0` from Unity Hub.

## Resolve packages

The project declares:

- Universal Render Pipeline 17.3.0
- Input System 1.17.0

If Unity recommends a compatible patch package for the installed 6.3 LTS editor, accept the editor-supported patch within the same major package line.

## Generate the scene

Use:

`Tools > Severe Weather > Create Production Slice Scene`

## Validate

Use:

`Tools > Severe Weather > Validate Production Starter`

## Android

- Switch build platform to Android
- Use Landscape Left orientation
- Use IL2CPP for release builds
- Use Development Build for early device profiling
- Confirm active input handling supports the Input System

## First compile notes

The starter intentionally creates materials and graybox content at runtime. Replace these primitives through the Asset Laboratory rather than polishing them into final art.


---

## Source: `SevereWeather_UnityProductionStarter_v0.1.0/Docs/VISION_LOCK.md`

# Vision Lock v1

## One-sentence target

A living miniature county, from farms to downtown, photographed like a disaster movie and destroyed through direct control of evolving weather systems.

## Visual pillars

### 1. Readable physical world

Buildings show wall height, roof construction, foundations, entrances, and material identity. Roads connect real destinations. Infrastructure belongs to visible networks.

### 2. Storm ownership

The storm changes light, wind, precipitation, vegetation, traffic, power, surfaces, sound, and debris across the entire screen.

### 3. Dense regional fabric

The player can see or infer the next destruction opportunity. Open land remains interactive through crops, dust, water, utility corridors, trees, signs, and distant landmarks.

### 4. Material-specific failure

Wood splinters and peels. Metal bends and tears. Glass cracks and bursts. Masonry chips and collapses. Vegetation bends, strips, and uproots. Vehicles rock, slide, lift, tumble, and remain recognizable as wreckage.

### 5. Stylized, not toy-like

The game avoids photorealism, but materials, proportions, lighting, and weather behavior remain believable. Shapes are exaggerated for mobile readability without becoming childish.

## Target screenshot checklist

An approved target screenshot must show:

- one connected road network
- at least three recognizable district types
- meaningful background density
- a storm that changes the whole scene
- clear depth and scale
- readable vehicles and buildings
- no large dead empty zone
- visible weather response before destruction
- a destination landmark
- HUD that supports rather than covers the storm


---

## Source: `SevereWeather_UnityProductionStarter_v0.1.0/VALIDATION_REPORT.md`

# Validation Report

## Completed in this environment

- Required project files present
- Unity package manifest parses as JSON
- URP and Input System dependencies declared
- 22 C# source files structurally scanned
- Namespace and brace-balance checks passed
- No tab characters in C# source
- Full project and Assets-only archives created
- SHA-256 inventory generated
- Frozen mechanics laboratory included

## Not available in this environment

Unity Editor is not installed here, so these gates remain open:

- Unity C# compilation
- URP package resolution inside the Editor
- scene generation through the Editor menu
- Play Mode execution
- Android build
- real-device performance, thermals, audio, and touch testing

## First editor gate

1. Open with Unity 6.3 LTS.
2. Allow packages to resolve.
3. Run `Tools > Severe Weather > Create Production Slice Scene`.
4. Enter Play Mode.
5. Run `Tools > Severe Weather > Validate Production Starter`.
6. Fix any editor-version API changes before asset production begins.

The starter is intentionally a production architecture and graybox. It is not presented as a compiled or production-ready game build.

---

## Source: `Repository milestone - Android Builds #1 through #3`

# Unity Android Milestone Record

## Build #1

- Unity Cloud compiled Unity `6000.3.0f1` and produced an Android APK.
- The APK installed and launched to a black screen.
- Result: build pipeline passed; runtime startup failed the physical gate.

## Startup hotfix

- Added a guaranteed runtime shader.
- Created and configured the camera before region generation.
- Added on-screen startup exception reporting.
- Added explicit shader fallback failure.
- Commit: `23e638f5dbfb0522f512209fa636a17147c6c7d1`.

## Build #2

- Rendered the generated graybox county and HUD on Android.
- Spawned Tornado and switched between Tornado and Supercell.
- Physical testing found unclear movement and mismatched visible ability buttons versus touch zones.

## Build #3 approved scope

- shared safe-area-aware mobile control layout
- floating screen-scaled joystick with dead zone
- persistent movement-touch ownership
- camera-relative movement for both storms
- latched short taps across Update/FixedUpdate
- exact ability hit zones and pressed states
- temporary MOVE/POS telemetry
- repository memory updated with code

The Build #3 result must be appended only after physical Android testing.
