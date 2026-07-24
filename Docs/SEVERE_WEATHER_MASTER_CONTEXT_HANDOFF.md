# Severe Weather - Master Project Context Handoff

**Living handoff last updated:** 2026-07-23
**Repository:** `lybyerc-lab/Severe-Warning`
**Default branch:** `main`
**Current production engine:** Unity 6.3 LTS / Unity `6000.3.0f1` with URP
**Primary target:** Android
**Development reality:** The owner is working mobile-first through Android, ChatGPT, GitHub, Termux, and Unity Build Automation. The GitHub repository is the durable project memory.

---

## Live repository status

This section supersedes older status statements elsewhere in this living handoff. Historical prototype descriptions remain useful, but current code and physical-device evidence take priority.

- The repository is initialized and Unity Cloud Build Automation is connected to `main`.
- Initial production starter commit: `5188c78ba99bf8ff7935f583cad926a4107d0da5`.
- Android startup hotfix commit: `23e638f5dbfb0522f512209fa636a17147c6c7d1`.
- Build #1 compiled and installed but displayed a black screen.
- Build #2 compiled, installed, rendered the generated county graybox and HUD, and allowed Tornado/Supercell switching.
- Build #2 physical testing exposed unclear movement, world-axis steering, mismatched ability hit zones, and insufficient input feedback.
- Build #3 is the approved mobile-control alignment pass: shared safe-area layout, floating joystick, touch ownership, camera-relative movement, latched taps, pressed states, and device telemetry.
- Before Build #3, the repository contained 48 tracked project files. The Build #3 candidate intentionally adds the persistent-memory documents and shared mobile-control layout.
- `CURRENT_STATUS.md` is the compact first-read status record. `Docs/DECISION_LOG.md` and `Docs/DEVICE_TEST_LOG.md` are append-only evidence trails.
- The repository, not chat alone, is the canonical durable project record.

---

## 1. Instructions to the receiving AI or developer

Treat this document as the complete project handoff and the best compact source of truth available outside the original design conversation.

Before changing code:

1. Pull and inspect `lybyerc-lab/Severe-Warning`.
2. Verify the current `main` commit and `ProjectSettings/ProjectVersion.txt`.
3. Read the repository `README.md`, `Docs/NO_DRIFT_POLICY.md`, `Docs/CORE_DIRECTION.md`, `Docs/VISION_LOCK.md`, and `Docs/STORM_VERBS.md`.
4. Do not silently redefine the game, simplify the world into sparse arenas, or make all storms use the same radial damage pattern.
5. Do not claim the Unity project compiles, runs, or builds until it has actually been compiled by Unity.
6. Do not deploy Unity source files to Netlify. Only deploy a generated WebGL build artifact.
7. Use feature branches and reviewable commits for new work.
8. Preserve the frozen HTML Mechanics Laboratory. It is reference material, not the production renderer.

The user values directness and diligence. Call out blockers, uncertainty, unsafe assumptions, missing dependencies, and unverified claims plainly.

---

## 2. Canonical project identity

**Severe Weather is a stylized 3D, direct-control weather destruction action RPG set in a dense, living urban-rural region.**

The player is the storm.

The player does not manage weather from a control panel, play as a storm chaser, or watch a simulation from a distance. The storm itself is the controllable action character.

### North stars

- **Every storm creates a story worth retelling.**
- **A miniature world photographed like a disaster movie.**
- **City-builder clarity, action-game control.**
- **Scale changes the view, not the genre.**
- **Graphics are gameplay.**

### One-sentence visual target

A living miniature county, from farms to downtown, photographed like a disaster movie and destroyed through direct control of evolving weather systems.

---

## 3. Player fantasy and moment-to-moment experience

The player should feel that they are not moving an icon over a map. They are steering an organized, physical weather system through a functional region.

The game should continuously communicate:

- wind pressure before failure
- precipitation affecting surfaces and visibility
- trees, crops, signs, vehicles, roofs, glass, and utilities reacting before destruction
- materials failing differently
- infrastructure networks creating chain reactions
- persistent storm scars and aftermath
- readable opportunities in every district
- an evolving sense of scale and power

The most satisfying stories should emerge from interacting systems. Examples:

- a tornado gathers sheet metal and lumber, then throws it through a commercial strip
- a hail swath shreds crops, dents vehicles, cracks glass, and leaves white accumulation around structures
- a supercell routes charge through poles, substations, rail, towers, and transformers, blacking out a district
- a gust front peels roofs and pushes vehicles in one shared direction
- a water tower failure triggers a neighborhood-scale chain reaction
- a flying cow becomes a harmless recurring news-footage celebrity

---

## 4. Tone and safety boundaries

The tone mixes cinematic weather with deadpan local-news humor.

### Non-negotiable content rules

- No visible human casualties.
- Civilians are evacuated, sheltered, or otherwise off-screen and safe.
- People are never targets.
- Property destruction provides the spectacle.
- Animals are invincible, harmless, and occasionally airborne.
- No blood, injury detail, or suffering.

### Presentation tone

- serious weather cinematography
- goofy environmental physics
- storm-chaser commentary
- local-news intros and aftermath reports
- occasional fake commercials and regional flavor later

The humor should come from the contrast between professional broadcast framing and absurd property/animal physics, not from harm to people.

---

## 5. No-Drift Policy

These rules govern all future design and technical decisions:

1. The player is the storm.
2. Direct action comes before management systems.
3. Scale changes the view, not the genre.
4. Graphics are gameplay.
5. Destruction must be physical, readable, and persistent.
6. Power and Stability remain separate systems.
7. Every storm requires unique verbs, positioning, timing, visuals, movement, and damage signatures.
8. Mobile is the primary design target.
9. People remain protected and off-limits as targets.
10. Technology serves the fantasy and cannot silently redefine the game.
11. External suggestions are advisory and must be evaluated.
12. A build is not production-ready merely because it runs.
13. Real Android testing is authoritative for touch, readability, sound, heat, battery, and performance.
14. Core concept changes require explicit owner approval.
15. The GitHub repository is the canonical durable project record. Chat is working context; decisions and evidence become persistent when committed.

### Governing statement

> Build the fantasy first. Use technology to protect and expand it. Never allow technology, scope, realism, or outside suggestions to quietly turn Severe Weather into a different game.

---

## 6. Why the project moved from browser Canvas to Unity

The browser prototype successfully proved mechanics, tone, mobile controls, progression ideas, chain reactions, giant-storm scaling, and the direct-control fantasy.

It did not prove a production-quality environment pipeline.

The main mismatch was trying to solve a dense, visually authored 3D-world problem with procedural Canvas shapes and a single-file prototype architecture. That caused repeated builds to become more technically capable while still looking sparse, icon-like, flat, and visually disconnected from the intended game.

### The production pipeline that was missing

- modular environment assets
- proper 3D scene authoring
- UVs, materials, atlases, trim sheets, and decals
- lighting and storm-shadow control
- shaders and technical art
- LOD and HLOD
- region-authoring tools
- destruction-ready prefabs
- recorded or professionally authored impact audio
- platform profiling

### Production decision

- **HTML:** frozen as the Mechanics Laboratory
- **Unity 6.3 LTS + URP:** production track
- **Android:** first performance target
- **WebGL:** remote test and Netlify distribution target
- **Future:** desktop and console-class targets, with Switch-class ambitions subject to platform access and performance proof

Do not resume polishing the Canvas environment as though it is the final game.

---

## 7. Current repository state

Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`
Visibility: public
Unity version: `6000.3.0f1`

### Proven repository and build state

- The initial 47-file production starter was committed and pushed successfully.
- The Android startup hotfix added a guaranteed runtime shader and increased the tracked file count to 48.
- Unity Build Automation is connected to GitHub and produces signed device-test APKs.
- Unity restored packages, compiled the project, generated the production scene, and built Android artifacts.
- Build #1 exposed a runtime black screen.
- Build #2 validated the startup hotfix by rendering the generated region and HUD on a physical Android device.
- Tornado/Supercell switching works on-device.
- Build #3 is the focused mobile-control correction and repository-memory milestone.

### Repository purpose

This repository is both the production source tree and the durable project memory. It contains code, current status, decisions, physical-device evidence, validation tooling, production documentation, and the frozen Mechanics Laboratory.

Generated Unity folders such as `Library/`, `Temp/`, `Logs/`, `Obj/`, `Build/`, `Builds/`, and `UserSettings/` remain uncommitted.
---

## 8. Current production starter

The initial Unity starter contains a graybox architecture, not final art.

### Declared packages

- Universal Render Pipeline 17.3.0
- Input System 1.17.0

### Implemented architecture

- runtime bootstrapping
- mobile and desktop storm input
- direct-control Tornado
- direct-control Supercell
- automatic hybrid camera
- material-aware damage
- conductive infrastructure chaining
- wind-reactive props
- region-density validation
- editor scene-generation tools
- project-readiness validation

### Primary source structure

```text
Assets/SevereWeather/
  Runtime/
    Camera/
      HybridStormCamera.cs
    Core/
      GameBootstrap.cs
      StormGameState.cs
    Damage/
      ConductiveNode.cs
      DamageEvent.cs
      DamageableStructure.cs
      DamageType.cs
      IDamageable.cs
      WindReactive.cs
    Input/
      StormInput.cs
    Storms/
      StormControllerBase.cs
      StormKind.cs
      StormVisualAnimator.cs
      SupercellController.cs
      TornadoController.cs
    UI/
      StormDebugHud.cs
    World/
      PrimitiveFactory.cs
      RegionChunk.cs
      RegionGenerator.cs
      WorldDensityValidator.cs
  Editor/
    ProductionSliceBuilder.cs
    ProjectReadinessWindow.cs
```

### Current honesty gate

Unity package restoration, C# compilation, deterministic scene generation, Android packaging, APK installation, runtime rendering, and storm switching have now passed through actual Unity Cloud and physical-device evidence.

The current open gate is reliable physical Android control: movement direction, touch ownership, exact ability hit zones, safe-area placement, and all abilities for both Tornado and Supercell. WebGL, sustained performance, thermals, audio, production art, and editor-authored scenes remain unproven. A successful cloud build is not a substitute for physical-device judgment.

---

## 9. Core gameplay systems

### Power

Power represents destructive strength and weather intensity.

It influences:

- suction and wind force
- damage
- lightning
- hail intensity
- visible storm mass
- environmental reach

### Stability

Stability represents organization and survivability.

It influences:

- storm coherence
- movement control
- visual organization
- resistance to hostile terrain or suppression
- recovery and sustained operation

Power and Stability must remain separate. A storm can be powerful but poorly organized, or stable but not yet destructive.

### Terrain and resistance concepts

Examples already established in the mechanics work:

- warm fields restore or support the storm
- forests slow and drain
- rocky ridges weaken organization
- cold outflow drains
- active weather stations suppress
- reinforced warehouses disrupt

These should be re-authored as physical, readable regional systems in Unity rather than invisible stat zones.

### Progression

Long-term progression can include:

- storm-specific branches
- resistance mitigation
- experience and level growth
- size classes
- persistent regional scars
- chaser and broadcast progression
- rival storms
- legendary debris
- seasons and recurring locations

Persistent progression is postponed until the core region and storm identities are worth revisiting.

---

## 10. Tornado identity

### Movement identity

Fast, responsive, physical, locally precise.

### Primary verbs

- pull
- orbit
- lift
- throw
- carve
- concentrate
- gather debris
- maintain contact

### Core abilities

#### Suction

Pulls loose objects inward, creates orbiting debris, lifts vehicles and components, and dismantles structures through persistent localized pressure.

#### Gust

Bursts outward and weaponizes accumulated debris. It should create clear directional consequences rather than a generic damage flash.

#### Tactical lightning

A focused infrastructure strike. It supports chain reactions but must not replace the tornado's physical identity.

### Tornado damage signature

- concentrated path
- directional rubble
- displaced recognizable objects
- uprooted vegetation
- debris drifts
- missing roofs
- local infrastructure failure
- persistent ground and crop scars

### Nested tornado field

1. inflow radius
2. strong-wind radius
3. debris radius
4. destructive core

The field telegraphs itself through environmental response. It should not require a visible gamey radius circle.

### Scale classes already explored

| Class | Physical diameter | Intended view |
|---|---:|---|
| Rope | 24 m | close tactical |
| Cone | 55 m | neighborhood |
| Wedge | 120 m | town |
| Giant Wedge | 260 m | district |
| Monster Wedge | 480 m | county impact |
| Half-Mile Wedge | 805 m | large county impact |

These values are design references from the prototype phase, not untouchable balance constants.

---

## 11. Supercell identity

### Governing rule

The Supercell must never become a bigger tornado with different particles.

### Movement identity

Heavy, broad, momentum-driven, directionally strategic.

- steering builds gradually
- the cloud body lags direction changes
- the storm controls multiple spatial regions
- heading matters
- positioning across infrastructure and districts matters

### Physical storm regions

- updraft tower
- rotating mesocyclone
- hail core
- forward precipitation area
- rear-flank downdraft
- gust front
- hook-shaped precipitation region

### Production abilities

#### Hail Swath

A persistent moving corridor related to storm heading, not a circular hold attack.

Expected effects:

- crops shred
- roofs lose material
- glass cracks and bursts
- vehicles dent
- hail accumulates in protected areas
- wetness and wear persist

#### Gust Front

A persistent leading boundary, not a radial burst.

Expected effects:

- the player aims it through movement and heading
- trees and signs lean before failure
- vehicles slide in a shared direction
- roof panels peel downwind
- an intensification pulse may increase the boundary temporarily

#### Electrical Network

A charge-building infrastructure attack, not a generic zap.

Expected effects:

- charge builds through storm organization
- positioning selects a conductive anchor
- electricity routes through poles, substations, rail, towers, metal roofs, and transformers
- the network layout determines chaining
- blackouts and transformer failures persist

#### Rainfall and runoff

Initially a broad passive or semi-active system:

- roads darken
- puddles and drainage respond
- soil saturates
- low terrain collects water
- later upgrades create flash-flood interactions

### Supercell damage signature

- wide hail corridors
- directional wind lanes
- network-shaped electrical failures
- blackout districts
- wet surfaces
- runoff accumulation
- broad storm shadow and precipitation footprint

### Design test

If a Tornado and Supercell ability can be swapped without changing player positioning, timing, heading, target selection, or route planning, the abilities are not differentiated enough.

---

## 12. Future storm roster

Long-term planned storm types:

- Tornado
- Severe Supercell / Thunderstorm
- Flood
- Hurricane
- Blizzard
- Hail-focused storm variants

Do not add another storm during the current foundation phase. Tornado and Supercell must first feel genuinely different on the same region.

Each future storm needs:

- unique movement model
- unique spatial footprint
- unique ability verbs
- unique relationship with terrain
- unique damage and aftermath signature
- unique camera and LOD needs
- direct action control

---

## 13. Living region direction

The world is a **living county-scale urban-rural region**, not a sparse landscape with scattered targets and not a sequence of isolated arenas.

### Regional flow

```text
open farmland
-> farmsteads and grain facilities
-> small town
-> suburbs
-> commercial corridor
-> industrial district
-> downtown
-> riverfront and transport hub
```

### Connected systems

- roads
- driveways and lots
- rail
- power distribution
- substations
- rivers and creeks
- drainage
- traffic
- utilities
- district landmarks

The region should look as though it functioned before the storm arrived.

### Rural does not mean empty

Rural gameplay territory includes:

- crop fields
- farmhouses
- barns and sheds
- silos and grain bins
- irrigation
- greenhouses
- equipment
- shelterbelts and windbreaks
- ponds and creeks
- towers and substations
- rail crossings
- truck stops
- small communities
- transmission corridors

Rural surfaces must react continuously through crop flattening, dust, mud, water, vegetation, signs, equipment, and utility response.

### Urban district roles

#### Residential

Progressive debris, houses, garages, vehicles, trees, fences, roofs, and neighborhood utilities.

#### Commercial

Glass, signage, parked cars, rooftop equipment, hail vulnerability, and electrical opportunities.

#### Industrial

Reinforced targets, sheet metal, tanks, pipes, substations, warehouses, and large chain reactions.

#### Downtown

Higher-level storm play, dense vertical landmarks, difficult infrastructure networks, and finales.

### Vertical-slice region target

Approximate reference footprint: **1.2 km x 1.2 km**.

Districts:

- farmland
- small town
- suburb
- commercial corridor
- industrial district
- civic center

Every district needs a recognizable landmark and visible connectors.

### No-dead-zone rule

During normal movement, at least one of the following should occur roughly every three seconds:

- a destructible object reacts
- an environmental surface reacts
- a chain-reaction opportunity is visible
- a destination landmark is visible
- an infrastructure line provides direction
- terrain affects Power or Stability
- the player makes a meaningful route choice

This rule exists because huge open landscapes were a repeated, explicit playtest failure.

---

## 14. Visual direction

### Visual north star

A miniature world photographed like a disaster movie.

### Style

- stylized 3D
- believable materials and proportions
- exaggerated silhouettes for mobile readability
- not photorealistic
- not flat icon art
- not toy-like or childish

### Required visual pillars

1. Readable physical world
2. Storm ownership of the entire screen
3. Dense regional fabric
4. Material-specific failure
5. Clear depth and scale

### Material families

- asphalt and road paint
- concrete and masonry
- residential siding and shingles
- commercial glass and signage
- industrial sheet metal and tanks
- farm soil and crops
- grass, mud, water, and vegetation
- vehicle paint, glass, metal, and rubber

### Weather transformation

#### Rain

- dark roads and roofs
- wet reflections
- puddles
- drainage movement
- mud

#### Hail

- shredded crops
- roof wear
- vehicle dents
- broken glass
- visible accumulation

#### Tornado

- dust and debris curtains
- flattened crops
- missing roofs
- directional rubble
- persistent scars

#### Lightning

- brief local illumination
- wet reflections
- transformer burns
- fires only where appropriate and controllable
- blackout districts

### Target screenshot acceptance list

An approved production target screenshot must show:

- one connected road network
- at least three recognizable district types
- meaningful background density
- a storm affecting the whole scene
- clear depth and scale
- readable vehicles and buildings
- no large dead zone
- visible weather response before failure
- a destination landmark
- HUD that supports rather than hides the storm

---

## 15. Production art pipeline

### Tools

- Blender for modeling and destruction-ready assets
- Unity URP for materials, lighting, VFX, LOD, streaming, and profiling
- image or texture tools for atlases, trim sheets, masks, and decals

### Scale rules

- meters in Blender and Unity
- ground-contact pivots
- documented forward direction
- shared physical scale sheet for buildings, vehicles, infrastructure, vegetation, and storms

### Modular asset kits

#### Residential

- walls and corners
- doors and windows
- roof segments
- porches
- garages
- foundations
- gutters and vents

#### Commercial and industrial

- storefront bays
- glass panels
- loading doors
- rooftop equipment
- metal wall panels
- tanks and pipes
- fencing
- substation components

#### Rural

- barns and sheds
- silos and grain bins
- irrigation
- greenhouses
- equipment pads
- field-edge props

### Destruction-ready asset standard

Important assets should provide:

- intact parent mesh
- detachable components
- stressed state
- damaged replacement state
- collapse proxy
- rubble/wreckage set
- simplified collision
- LOD0, LOD1, LOD2, and distant proxy

### Performance-oriented art rules

- texture atlases
- trim sheets
- controlled vertex-color variation
- decals for dirt, wetness, hail, cracks, burns, and scars
- GPU instancing for repeated props
- district HLOD
- pooled debris and particles
- mobile-first shader variants
- no uncontrolled per-frame material creation

---

## 16. Audio direction

Continuous weather may use procedural layers. Physical impacts need real recorded or professionally authored source material.

### Mixer buses

- Master
- Weather Bed
- Wind Pressure
- Rain and Hail
- Thunder and Electricity
- Structural Impacts
- Debris
- Environment
- UI and Broadcast

### Lightning stack

1. immediate electrical snap
2. close pressure crack
3. low-frequency body
4. reflected/distant thunder tail
5. environmental response such as transformer burst or glass reaction

Simple oscillator beeps are prohibited for final lightning impact.

### Hail material sets

- asphalt
- metal roof
- glass
- vehicle body
- crop field
- water
- wood siding

### Destruction material sets

- timber strain, snap, and splinter
- sheet-metal flex and tear
- glass crack and burst
- masonry chip and collapse
- vehicle suspension, panel, and impact
- power equipment arc and transformer burst

### Mobile audio gate

Test on:

- phone speaker
- earbuds
- low volume
- noisy room
- sustained play for fatigue

Audio must provide gameplay information without becoming a constant wall of noise.

---

## 17. Camera direction

Physical Android testing produced these results:

| Camera | Best use | Weakness |
|---|---|---|
| County High | finding districts and understanding the region | destruction feels less physical |
| ISO Grid | reading impacts and object damage | less regional awareness |
| Impact Oblique | cinematic middle ground | straight roads and infrastructure distort |

### Selected gameplay direction: Auto Hybrid

#### NAV state

- County High values
- approximately 68-degree presentation
- used in low-density traversal and district finding

#### TRANSITION state

Smooth interpolation based on:

- target density
- nearest meaningful target
- active abilities
- lock-on activity
- gust/downburst activity
- lightning flash
- destruction combo

#### IMPACT state

- ISO-derived values
- approximately 45-degree presentation
- used for readable destruction

Impact Oblique is not the primary gameplay camera. It may remain useful for replay, broadcast, or controlled cinematic views.

### Camera acceptance condition

Auto Hybrid is the leading baseline, but transition timing, hysteresis, and distraction level still require physical device validation across Tornado, Giant Wedge, and Supercell.

---

## 18. Input and interface direction

### Desktop reference controls

- WASD or arrow keys: movement
- Space: primary ability
- Q: secondary ability
- E: tertiary ability
- Tab: storm switch in the starter

### Mobile reference controls

- left-side drag: movement
- large right-side hold zone: primary ability
- upper-right tap: secondary ability
- middle-right tap: tertiary ability
- top-center storm label: switch storm in the starter

These are starter controls, not final UX. Mobile readability and thumb reach are authoritative.

### HUD principles

- compact
- storm remains visually dominant
- Power and Stability readable at a glance
- cooldowns clear
- mission direction visible
- no giant panels obscuring the world

---

## 19. Performance and technical architecture

### Production principles retained from the browser engine

- fixed or disciplined simulation timing
- clear separation of simulation and presentation
- spatial partitioning before detailed physics
- object pooling and hard caps
- LOD by camera scale and screen size
- culling
- cached and instanced repeated assets
- adaptive quality
- effect reduction before simulation degradation
- damped camera shake
- 60 FPS target, playable 30 FPS fallback

### Mobile performance priorities

- GPU instancing
- mesh LOD
- district HLOD
- frustum and occlusion culling
- pooled debris and VFX
- simplified collision
- bounded physics interactions
- thermal and battery testing
- no uncontrolled particle or rigidbody explosions

### Large-storm principle

Small objects must become appropriately smaller or simplify at wide scale. Do not artificially keep cars and houses huge on screen merely for visibility.

Simulation detail should remain local and aggregate at distance.

---

## 20. Gameplay and mission direction

The action loop is expected to combine:

1. move through a living district
2. read terrain and infrastructure
3. use storm-specific abilities
4. create physical destruction and chain reactions
5. maintain Power and Stability
6. grow or specialize
7. complete broadcast-worthy objectives
8. receive an aftermath report

### Established mission ideas

- warm-inflow recovery
- radar/weather-station suppression
- reinforced warehouse disruption
- pole and transformer chains
- county blackout
- water-tower blast
- damage-value objective
- district route objectives
- storm-specific milestone objectives

### Broadcast framing

- news-anchor intro
- storm-chaser observations
- mid-run commentary
- aftermath report
- future replay footage and fake commercials

---

## 21. Mechanics Laboratory history and lessons

The browser prototype evolved through these major stages:

### `v0.2.0-test.1`

Core storm feel, smoother movement, suction/orbiting, mission checkpoints, chaser commentary, cooldowns, pause/restart, haptics, short test loop.

This remains the current Netlify production baseline.

### `v0.3.x`

Upgrades, water-tower chain reaction, pole lightning chains, blackout, trampolines, objective beacon, aftermath, settings, HUD clarity.

### `v0.4.0-vlp.1`

First visual-language prototype. Better regions and roads, but still procedural icon-like props.

### `v0.4.1-rc.1`

Browser engine foundation: fixed timestep, interpolation, spatial hash, pooling, cached terrain, procedural audio, adaptive quality.

### `v0.4.2-rc.1`

Prop identity overhaul. Technically improved, still visually too flat and mixed-perspective.

### `v0.5.0-vs.1`

Volumetric multi-scale slice. Shared physical scale, projected roads, dimensional vehicles and structures, scalable camera.

### `v0.5.4-sp.1`

Storm presence phase. Layered funnel, wall cloud, debris curtain, nested wind fields, structural stress, localized atmosphere, procedural audio.

Physical feedback: Power drained too quickly, structures took too long to fail, lightning sounded arcade-like.

### `v0.6.0-gs.1`

Giant-storm foundation. Multiple physical tornado sizes, 260 m Giant Wedge sandbox, wide damage, camera pullback, multi-vortex, screen-size LOD.

Physical feedback: movement slightly choppy under giant load but responsive.

### `v0.7.0-ms.1`

Multi-storm core. Added Severe Supercell sandbox with Hail Core, Downburst, Chain Zap.

### `v0.7.1-sc.1`

Supercell mission and anatomy. Physical Android feedback remained negative: it still felt like a larger tornado, lacked persistent surface damage, abilities felt too similar, sounds felt arcade-like, and open fields caused target hunting.

### `v0.7.5-camera-lab.1`

Rejected because touch controls were broken and camera differences were too timid.

### `v0.7.5-camera-lab.2`

Valid physical comparison of County High, ISO Grid, and Impact Oblique.

### `v0.7.5-camera-lab.3`

Auto Hybrid camera and in-run storm selector. This was the last major browser laboratory build before the Unity pivot.

### The decisive lesson

More prototype systems did not solve the core visual and world-density problem. The project needed a real production pipeline, not another Canvas patch.

---

## 22. Current Netlify status

### Production site

`https://severe-weather-warning.netlify.app`

### Current known production deployment

- Site ID: `aec2cbd0-c3de-4528-80e9-16d76ab68f99`
- Last verified deploy ID: `6a611a71adf66511abcb8157`
- State: ready
- Content: HTML mechanics baseline `v0.2.0-test.1`

### Important deployment rule

The Unity repository is source code. It cannot be dropped onto Netlify and expected to run.

Netlify requires a generated Unity WebGL output containing an entry `index.html` and Unity build assets. Production deployment requires explicit owner approval and successful browser testing of the artifact first.

Do not overwrite the working site with source files.

---

## 23. Mobile-first development reality

The owner is currently using an Android device and Termux.

### Can be handled on mobile

- GitHub repository management
- Termux git workflows
- reviewing code and diffs
- creating branches and commits
- ChatGPT/Codex-directed source changes
- cloud build configuration
- reading logs
- testing WebGL builds
- approving direction and art references
- planning and issue management

### Cannot realistically be completed on mobile alone

- full Unity scene editing
- visual prefab composition
- material and Shader Graph work
- Blender asset creation
- detailed VFX tuning
- Unity profiling
- production lighting
- many editor-only debugging tasks

### Best long-term mobile arrangement

Phone-managed development with Unity running on a desktop, laptop, or remote cloud workstation.

### Current short-term objective

Make the repository as cloud-buildable and batch-mode-friendly as practical so compilation and simple graybox generation require minimal manual editor interaction.

This does not remove the eventual need for a real editor session for art and level production.

---

## 24. Recommended immediate workstream

### Immediate objective

**Compile and physically validate Build #3 as the first coherent Android mobile-control pass without mixing in unrelated production work.**

### Approved sequence

1. Start from clean `main` at the tested Build #2 hotfix.
2. Create `agent/mobile-controls-build3`.
3. Add one shared safe-area-aware layout used by both HUD drawing and touch detection.
4. Give the movement finger persistent ownership until release or cancellation.
5. Scale the floating joystick from screen height and apply a dead zone.
6. Convert movement to camera-relative world direction in the base storm controller and the Supercell override.
7. Latch one-shot taps so short Android touches cannot be lost between `Update` and `FixedUpdate`.
8. Add pressed-state feedback plus temporary MOVE and POS telemetry.
9. Update repository memory, file inventory, checksums, and validation records in the same patch.
10. Build through the existing Android Unity Cloud configuration.
11. Install as an update and execute the physical test plan in `CURRENT_STATUS.md`.
12. Record the result in `Docs/DEVICE_TEST_LOG.md` before selecting the next patch.

### Explicit exclusions

Do not combine Build #3 with loading work, art, audio, `.meta` migration, camera orbit, new storms, missions, or production UI redesign.

### Branch

`agent/mobile-controls-build3`
---

## 25. Production vertical-slice plan

### Phase 0: starter and toolchain

- Unity project opens
- packages resolve
- C# compiles
- production scene generates or is prepared deterministically
- Tornado and Supercell move and use distinct abilities
- WebGL development build launches
- Android development build launches when desktop/cloud tooling permits

### Phase 1: vision lock

Approve:

- one target screenshot
- material and lighting guide
- region-density map
- physical scale sheet
- Tornado storyboard
- Supercell storyboard
- audio reference sheet

### Phase 2: asset laboratory

Create production-quality:

- two houses
- one barn
- one commercial building
- one warehouse
- sedan, pickup, and SUV
- utility pole and transformer
- tree set
- crop/field-edge set
- road intersection kit

Each includes LOD and destruction states.

### Phase 3: dense region slice

Build one connected urban-rural region with no long inactive gaps.

### Phase 4: Tornado proof

Prove concentrated physical destruction, debris, object displacement, path damage, and readable material failure.

### Phase 5: Supercell proof

Prove Hail Swath, Gust Front, Electrical Network, broad rain response, and directional navigation.

### Phase 6: Android performance proof

- instancing
- LOD/HLOD
- culling
- pooled debris/VFX
- adaptive quality
- thermals
- battery
- stable touch

---

## 26. Acceptance gates

A milestone does not pass because automated checks are green.

### Visual gate

- coherent on a real phone
- readable material and structure identity
- no flat icon-like world
- no giant dead spaces
- storm owns the scene

### Tornado gate

- concentrated physical path
- satisfying debris gathering and throwing
- readable object displacement
- strong local control

### Supercell gate

- does not feel like a tornado
- heading and broad-body positioning matter
- hail, gust front, and electrical network produce different decisions
- persistent surface and infrastructure consequences

### Audio gate

- lightning no longer sounds arcade-like
- impacts are material-specific
- mix works on phone speaker and earbuds

### Mobile gate

- touch is reliable
- UI does not cover action
- 30 FPS remains playable
- heat and battery are acceptable
- no severe hitching under destruction load

### Deployment gate

- artifact is actually built
- artifact is tested
- current production build is recoverable
- owner explicitly approves deployment

---

## 27. Known risks and unresolved questions

- Build #3 has not yet compiled or passed physical Android testing.
- Runtime region generation is synchronous and may stall weaker devices during startup.
- The current starter region is generated from primitives and remains a graybox.
- The guaranteed runtime shader is intentionally simple and unlit; it is not the production material solution.
- Unity `.meta` files are not yet committed and must be addressed before serious authored asset production.
- The Supercell design is specified more strongly than it is visually implemented.
- Audio source assets are not yet supplied.
- A production environment-art pipeline has not yet been executed.
- Sustained Android thermals, battery use, frame pacing, and heavy-destruction performance remain unproven.
- The user does not currently have dependable desktop access.
- Full 3D visual production will eventually require Unity Editor and Blender access, locally or remotely.

These risks must remain visible in `CURRENT_STATUS.md` and related evidence logs rather than being hidden by successful build numbers.
---

## 28. Decisions that should not be casually reopened

- Unity is the production engine unless a hard blocker proves it impossible.
- The HTML build is the Mechanics Laboratory, not the production renderer.
- The world is a connected living county, not sparse arenas.
- The player directly controls the storm.
- Tornado and Supercell must have different verbs and spatial logic.
- Power and Stability remain separate.
- People stay safe and off-limits.
- Android is the primary design target.
- Auto Hybrid is the leading gameplay camera baseline pending real device tuning.
- No third production storm before Tornado and Supercell pass on the same region.
- Persistent progression waits until the core world is worth revisiting.

---

## 29. What success looks like for the first real Unity slice

A successful first slice is not a huge county.

It is one dense, authored, connected section containing:

- farm edge
- rural highway and utility corridor
- suburban neighborhood
- commercial strip
- industrial yard
- civic landmark
- continuous roads
- visible next targets
- no long dead travel zones

Both Tornado and Supercell run on the same geography.

The player should be able to switch between them and immediately feel that they require different decisions.

---

## 30. Concise prompt for a future GitHub-enabled conversation

```text
You are continuing the Severe Weather production project.

Repository: lybyerc-lab/Severe-Warning
Default branch: main
Unity version: 6000.3.0f1
Primary target: Android
Current workflow: Android + Termux + GitHub + Unity Build Automation.

Read CURRENT_STATUS.md first, then Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md, Docs/NO_DRIFT_POLICY.md, Docs/DECISION_LOG.md, and Docs/DEVICE_TEST_LOG.md. The repository is the durable project memory.

Use current code, cloud-build logs, and physical Android evidence as the source of truth. Preserve the No-Drift Policy. Do not reopen settled engine, player-role, region, or storm-differentiation decisions without new evidence.

Before changing code, identify the current tested commit, active blocker, approved patch scope, and explicit exclusions in CURRENT_STATUS.md. Update repository memory with the code whenever practical.
```
---

## 31. Project record as of 2026-07-23

| Item | Current record |
|---|---|
| Project | Severe Weather |
| Genre | Direct-control weather destruction action RPG |
| Player role | The storm |
| Production engine | Unity 6.3 LTS / 6000.3.0f1 |
| Renderer | URP with temporary guaranteed runtime shader for the graybox |
| Primary platform | Android |
| Cloud build | Unity Build Automation connected to GitHub `main` |
| Repository | lybyerc-lab/Severe-Warning |
| Default branch | main |
| Initial commit | `5188c78ba99bf8ff7935f583cad926a4107d0da5` |
| Tested startup hotfix | `23e638f5dbfb0522f512209fa636a17147c6c7d1` |
| Build #1 | Compiled and installed; black runtime screen |
| Build #2 | Rendered world and HUD; storm switch passed; controls failed physical gate |
| Current production storms | Tornado and Supercell |
| Camera | Auto Hybrid baseline, County High NAV to ISO-derived IMPACT |
| World | Generated dense urban-rural graybox; authored production region not yet built |
| Prototype | Frozen HTML Mechanics Laboratory |
| Current Netlify production | v0.2.0-test.1 browser baseline |
| Current technical gate | Build #3 mobile-control compile and physical Android validation |
| Next creative gate | Vision-lock screenshot and dense living-region slice |
| Canonical durable record | GitHub repository |
---

## 32. Included documentation bundle

The handoff archive includes:

- this master handoff
- a single merged file containing all recovered project Markdown documents
- original Markdown documents preserved by source/build folder
- repository README and bootstrap documents
- validation report and file inventory
- a Termux workflow note
- a machine-readable project record
- SHA-256 checksums for the handoff package contents

Older documents may describe superseded prototype stages. The current production direction in this master handoff and the Unity production `Docs/` folder takes precedence where conflicts exist.

## Living update - 2026-07-23 - Build #4 feel and render recovery

This section supersedes older status statements in this handoff when they conflict with the repository's current code or physical-device evidence.

### Proven since the original handoff

- Unity Build Automation is connected to `lybyerc-lab/Severe-Warning` and builds branch `main` with Unity `6000.3.0f1`.
- Android Build #1 compiled and installed but displayed a black screen.
- Commit `23e638f5dbfb0522f512209fa636a17147c6c7d1` fixed startup visibility and produced a rendered Android build.
- Commit `32ec421528e75632bae793ba0569c8770baa0d42` aligned mobile touch rectangles, added a floating joystick, latched one-shot inputs, and added device telemetry.
- Physical Build #3 testing proved that touch input and storm position updates were registering.

### Build #3 physical failure

Build #3 did not pass production feel or visual-quality gates:

- the camera followed the storm so tightly that translation was difficult to perceive
- the opening crop field supplied weak parallax and few immediate interaction landmarks
- damageable crops lacked colliders and were invisible to physics-based storm queries
- abilities could consume resources without visible world feedback
- the emergency unlit material path produced flat, opaque, low-information presentation
- world edges could reveal the empty background

### Active approved response

Build #4 is a focused feel, interaction, physics, and rendering recovery pass. It includes:

- a soft camera leash and stronger differentiated storm motion
- a deliberate mixed starter test pocket
- collider-backed crops and collider-aware density validation
- immediate action VFX and no-target feedback
- lit material templates, shadows, fog, transparency, and a larger backdrop
- mobility classes, approximate masses, and pre-destruction prop release
- deterministic Android identity and player settings
- repository-memory updates committed with the implementation

Build #4 remains a procedural laboratory slice. It does not claim final production art, audio, missions, progression, or finished destruction assets.

### Current authority

Read `CURRENT_STATUS.md`, `Docs/DEVICE_TEST_LOG.md`, `Docs/DECISION_LOG.md`, and `Docs/UNITY_CLOUD_BUILD_SETTINGS.md` before planning or testing the next build. Physical Android evidence remains authoritative.

## Build #4 physical correction - 2026-07-24

Build #4 successfully improved lighting, action feedback, backdrop coverage, and starter-pocket interaction density, but it did not move the storm root on the physical Android device. The device HUD showed full input, commanded speed, and increasing requested distance while the actual position remained at the configured spawn. Camera feel was therefore not the primary blocker.

The approved Build #4.1 response is narrow:

- transform-authoritative Tornado and Supercell movement
- actual-delta speed and distance telemetry
- motion-blocked diagnostics
- slower, wider camera leash
- smoother tornado silhouette
- compact-landscape HUD fit and contrast
- reduced shader-build scope

This does not reopen the No-Drift rules or substitute code-generated graybox geometry for the future production asset laboratory.

## Build #4.2 camera containment update

Build #4.1 commit `96c9f780daf070648dc69a7f6cd431233b85617a` passed the physical movement gate. Tornado and Supercell both move correctly, and the Supercell speed feels appropriate. The next authoritative defects are Tornado camera escape and oversized Supercell framing.

Build #4.2 preserves storm speeds, adds viewport-aware camera containment with hard-edge recovery, separates Tornado and Supercell framing profiles, flattens and reduces the Supercell shelf cloud, adds a dark updraft core, and exposes camera state in the HUD. Application version is `0.1.6`; Android version code is `6`.

## Build #5 impact and destruction update

Build #4.2 physical testing passes the movement and camera-foundation gate. Build #5 preserves both storm movement profiles and viewport containment while replacing the Supercell blue precipitation cylinder, adding animated rain and hail streaks, adding five shared damage stages, differentiating material reactions, preventing structural whole-building launch behavior, and adding a mixed-material impact lane near spawn. Device evidence remains authoritative.
