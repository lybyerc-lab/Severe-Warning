# Severe Weather Warning Recovered Knowledge Base

**Recorded:** 2026-08-04 Central Time  
**Purpose:** Preserve project knowledge that existed across earlier chats, older repository records, test conversations, and roadmap discussions but was not fully represented in the immediate modernization handoff.

This file is durable project memory. It does not authorize every idea for immediate implementation. It distinguishes protected laws, accepted behavior, required modernization work, deferred product direction, and unresolved design questions.

## 1. Source and interpretation rules

When this file conflicts with current code or exact build evidence, current code and exact build evidence win.

Use this order:

1. Current repository code and exact-commit evidence
2. `CURRENT_STATUS.md`
3. This file
4. `Docs/MODERNIZATION_PLAN.md`
5. Dated decision records
6. `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
7. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
8. Historical engine and laboratory records

Older ideas are retained here so they are not silently lost. They are not automatically approved scope.

## 2. Protected product laws

These are not backlog items. They govern every future milestone.

- The product name is **Severe Weather Warning**.
- `Heartland` is campaign terminology, not the product title.
- The player is the storm.
- Direct arcade action comes before management systems.
- Android landscape is the primary target.
- The response is a media circus, not a battle.
- People are protected, absent from destruction targets, and never casualties.
- Animals are invincible, non-targetable, and may participate only in safe slapstick.
- News vans and storm chasers are invincible witnesses, never enemies or rewarded targets.
- No hostile police, fire, military, guard, or emergency-response combat layer.
- Humor comes from property destruction, regional flavor, fictional businesses, safe physics, and broadcast framing.
- Three.js remains production until a specific measured blocker justifies revisiting the engine decision.
- Capacitor remains the Android packaging path.
- Netlify is excluded. GitHub Pages is the approved hosted QA-preview direction.
- Automated success does not replace physical Android acceptance.

## 3. Accepted gameplay and modernization baseline

The following behavior is already accepted and must survive future extraction:

- direct mobile joystick control
- keyboard support for browser QA
- Pull, Gust, and Grid Zap
- no duplicate touch plus synthetic-click ability activation
- continuous scoring across district boundaries
- forward-only district progression
- three-minute real-time warning clock
- correct pause and background timing
- ordered Heartland campaign unlocks
- stars, best scores, run counts, selected stop, and furthest unlock
- deterministic reset and cleanup
- QA4 input isolation
- media moments and footage bonuses
- safe Cow 17 reporting and zero-injury framing
- continuous wind ambience and differentiated ability feedback

Modernization Phases 1 through 3 are implemented and physically accepted. Phase 4 is next.

## 4. Required upcoming engineering work

### 4.1 Repository and PR-stack reconciliation

The current descendant chain is:

`PR #13 -> PR #15 -> PR #16 -> PR #17 -> PR #18 -> PR #19`

PR #14 is archived Babylon.js research and must not enter production.

Before final integration:

- verify every accepted descendant contains the required parent behavior
- preserve exact evidence, artifacts, and branch provenance
- decide the eventual integration strategy explicitly
- mark superseded PRs clearly
- audit older open work such as PR #10 and issue #9 so completed audio work is not left as contradictory open scope
- do not merge, close, retarget, squash, or rewrite the stack without owner approval

### 4.2 Phase 4: scoring, districts, campaign, and persistence

Extract explicit typed ownership for:

- score accumulation
- combo state
- media and footage bonuses
- challenge scoring
- district progression
- district thresholds
- campaign selection and completion
- stars and best scores
- ordered unlocks
- run counts
- selected stop and furthest unlock
- save schema, validation, migration, reset, and recovery

Required laws:

- score does not reset at district boundaries
- combo behavior remains compatible
- district progression never moves backward
- the three-minute clock remains unchanged
- retry does not duplicate rewards
- next-stop opens the correct stop
- QA scenarios cannot contaminate real player saves
- existing `severe_weather_campaign_v1` data remains readable or is migrated deterministically

### 4.3 Data-driven campaign content

Phase 4 must do more than wrap globals in classes. Move toward explicit definitions for:

- campaigns and stops
- district order and contracts
- terrain and palette identity
- landmarks and objectives
- challenge pools
- score targets and modifiers
- unlock conditions
- quality-tier density
- next-stop relationships

Validation should detect:

- duplicate IDs
- missing landmarks
- invalid district order
- impossible score thresholds
- broken next-stop links
- missing challenge references
- incompatible save versions

### 4.4 Phase 5: renderer, camera, world, and destruction

After gameplay state is safe, extract:

- renderer ownership
- scene lifecycle and disposal
- camera
- atmosphere
- tornado presentation
- world dressing
- buildings and landmarks
- destruction setpieces
- quality-tier presentation

Required evidence:

- fixed before-and-after captures
- measured performance budget
- Hart Farm readability
- Cow 17 readability
- no gameplay or scoring changes from quality tiers

### 4.5 Hart Farm as the reusable destruction proof

Hart Farm currently establishes the five-state language:

1. intact
2. damaged
3. roof peel
4. exposed or partial collapse
5. wreckage

The next proof is a reusable definition that can drive a second structure without copying custom code.

A setpiece definition should cover:

- ID and placement
- stage thresholds
- visible meshes by stage
- detachable pieces
- material response
- audio events
- score events
- persistence during a run
- reset and disposal

### 4.6 Art pipeline

The approved future pipeline is:

- Blender
- GLB/glTF
- shared mobile-conscious materials
- authored destruction variants
- data-driven town assembly
- asset validation
- quality-tier budgets
- KTX2 only after measured need

Validation should eventually cover:

- scale
- pivots
- naming
- material count
- texture dimensions
- triangle budgets
- collision proxies
- destruction-state completeness
- mobile compatibility

### 4.7 Phase 6: audio, UI, persistence, platform, and QA completion

Finish explicit ownership for:

- audio buses and events
- continuous storm ambience
- ability and material-destruction audio
- HUD
- menus
- pause
- results
- campaign weather map
- storage
- Android lifecycle
- formal QA scenarios and snapshots

The formal QA interface should support:

- prepare named scenario
- advance deterministic time
- read typed snapshot
- capture frame
- verify reset
- verify cleanup
- verify exact build identity

### 4.8 Phase 7: retire patch archaeology

Only after parity:

- stop producing normal builds through the complete historical patch chain
- make TypeScript modules the production source
- archive patch scripts with provenance
- keep reproducible release tags
- preserve the accepted legacy baseline
- remove exact-string mutation from ordinary feature work

### 4.9 Three.js upgrade

Three.js r128 remains frozen during architecture extraction.

A later dedicated upgrade must not be mixed with:

- system extraction
- major visual redesign
- campaign redesign
- destruction redesign

Use official migration guidance, fixed visual comparisons, Android WebView testing, and GLB/material verification.

## 5. QA, release, and deployment work left on the table

### 5.1 GitHub Pages QA preview

The workflows package `web-preview` but do not deploy a permanent URL.

Approved preview behavior:

- approved branch or explicit manual dispatch only
- exact commit and workflow run displayed
- QA tools gated
- rollback by artifact or commit
- no production-branch mutation
- no claim of physical-device acceptance
- no Netlify

### 5.2 Separate QA and player builds

Create explicit package modes:

- QA browser preview
- QA Android APK
- player release candidate
- production release

Player builds must exclude visible:

- QA stage badge
- forensic panels
- direct test controls
- debug telemetry
- accidental QA shortcuts

The QA bridge may remain available internally where required, but it must not create player-facing UI.

### 5.3 Broader Android device matrix

Most accepted physical evidence comes from a high-end Galaxy S26 Ultra.

Still needed:

- at least one midrange Android phone
- at least one older or thermally constrained phone
- multiple landscape aspect ratios
- five-to-ten-minute sustained play
- heat observation
- battery observation
- audio interruption and recovery
- orientation away and back
- safe-area checks
- close and reopen
- process death and save recovery
- repeated retries
- multi-stop campaign sessions

One Phase 2 screenshot showed top-title crowding in a particular wide landscape geometry. A later Phase 3 result fit correctly. Preserve this as a responsive regression case, not a confirmed universal defect.

## 6. Deferred product knowledge

### 6.1 Moo Brew opening cinematic

The canonical opening remains:

1. a newspaper tumbles along a rural road as wind increases
2. the warning headline becomes visible
3. the paper sticks to the camera
4. it peels away to reveal a peaceful farmyard
5. a cow drinks from a Moo Brew cup while animals gather nearby
6. the radio crackles and weather changes
7. the cow notices the forming funnel and double-takes
8. the Moo Brew cup drops logo-forward in exaggerated slow motion
9. the cow escapes while chickens scatter
10. the barn roof starts peeling as the tornado touches down
11. the camera rises into the tactical gameplay angle
12. the HUD fades in and control begins without a loading break

The ending should mirror the opening through a generated newspaper or broadcast recap based on actual run events.

This is retained product direction, not immediate Phase 4 scope.

### 6.2 Cow 17 and farmyard behavior

Cow 17 remains the recurring accidental mascot and visual truth detector.

Full behavior target:

- idle
- graze
- notice
- double take
- brace
- slide
- front lift
- launch
- readable orbit
- safe landing
- recovery
- offended reaction

Retained farmyard ideas:

- chickens flapping with limited progress
- bounded feather puffs
- awning or hay-bale bounce
- brief gliding
- single-file panic afterward
- hay-bale and soft-zone landings
- safe airborne-animal bonuses

Cow humor must remain occasional and surprising. Animals are never objectives or valid targets.

### 6.3 Media and broadcast expansion

Current media crews establish the core witness system. Retained future ideas:

- road-aware repositioning
- safe retreat behavior
- regional station identities
- named reporters and personalities
- event-specific live headlines
- district-specific broadcast arcs
- end-of-run footage reels
- newspaper or television recaps generated from run data
- optional camera drone or high-altitude news helicopter later

Media crews remain invincible and non-targetable.

### 6.4 Full ability-presentation contracts

Pull, Gust, and Grid Zap are functional. Their full presentation targets remain broader.

#### Grid Zap

- electricity follows actual infrastructure
- conductive-target graph
- pole-to-pole line travel
- wire-segment pulses
- insulator, streetlight, transformer, and sign response
- central filament, blue glow, branching micro-arcs, ionized trail, sparks, delayed thunder
- transformer pop, substation surge, or district blackout finale

#### Gust

- readable pressure field or distortion cone
- dust, leaves, and grass response
- progressive tree bending by distance
- branch after-shake
- loose-metal and sign wobble
- roof-panel rattle or detachment
- light-object push
- large intact structures resist normal gusts

#### Pull

- grass bends inward before detachment
- leaves and grit spiral inward
- signs twist toward the storm
- roof panels and loose pieces rattle first
- debris enters readable orbital bands
- touchdown dust thickens
- animals brace, slide, lift, orbit, and land safely

### 6.5 Heartland expansion

Current foundation stops:

- Lincoln County
- Prairie Junction
- Grain Belt
- State Fair

Earlier retained possibilities:

- River County
- Metro Fringe

Do not add more stops until Phase 4 makes new stops primarily a content-authoring task rather than another hardcoded fork.

### 6.6 Future regions

Retained regional campaigns:

#### South / Coastland

- bayou town
- marina
- boardwalk
- port district
- stilt homes
- refinery edge
- beach carnival
- waterspouts, spray, boats, docks, bridges, wet surfaces, heavy rain, coastal media

#### East Coast

- old downtown
- rowhouses
- rail corridor
- harbor
- dense commercial district
- bridge finale
- tight streets, taller structures, dense utilities, rooftop equipment, scaffolding, awnings

#### West Coast

- foothill town
- dry valley
- coastal city
- industrial port
- wind farm
- wildfire edge
- steep terrain, hillside roads, dry vegetation, turbines, dust, smoke, vertical routes

Every region must change architecture, palette, props, animals, media station, soundtrack, weather interaction, finale, and play decisions. A palette swap is insufficient.

### 6.7 Tornado forms and storm variants

Retained forms:

- rope
- cone
- stovepipe
- wedge
- multi-vortex
- dusty plains
- rain-wrapped
- nighttime lightning-lit

Retained advanced variants:

- waterspout after water interaction exists
- twin tornadoes as a temporary advanced evolution or ultimate
- fire whirl only after a real fire, ember, smoke, heat, interruption, and news system exists
- multi-vortex as the strongest near-term advanced form

A variant must alter visuals, positioning, timing, coverage, or damage behavior. It cannot be only a recolor.

### 6.8 Storm progression and mastery

Earlier chats explored RPG-style progression and unique storms. Existing stars, unlocks, score history, and cosmetics cover part of that direction.

Still unresolved:

- whether storms gain mastery levels
- whether upgrades occur between runs
- whether forms are selected, earned, or triggered during play
- how progression avoids weakening the immediate arcade loop
- how every storm preserves distinct verbs rather than stat inflation

No implementation is authorized until this receives a formal design decision.

### 6.9 Terrain and objects that diminish storm power

This concept appeared in earlier design discussion and was not fully retained in the active repository plan.

Potential design space:

- terrain or structures resist specific storm forms
- resistance may affect speed, Pull radius, energy, control, or damage
- obstacles create route choices
- resistance must be readable before contact
- recovery must be understandable
- movement must not become sluggish or frustrating

Questions to resolve before implementation:

- which terrain or structures resist which storm
- whether resistance is temporary or persistent
- whether the effect reduces speed, damage, ability coverage, or energy
- how the player visually reads the resistance
- how balance avoids invalidating direct storm control

Best timing: after Phase 4 and during Phase 5 world extraction.

### 6.10 Camera and viewpoint

The earlier isometric discussion is largely resolved through the accepted elevated tactical camera.

Remaining work is refinement, not a new camera genre:

- safe-area-aware framing
- storm containment
- readable district transitions
- regional camera tuning
- cinematic-to-gameplay handoff
- results-screen responsive containment

## 7. Explicit non-goals and rejected directions

- no multiplayer in the current product path
- no military response or combat escalation
- no people or animal targeting
- no engine migration from visual dissatisfaction alone
- no Babylon.js production migration
- no Netlify deployment
- no broad engine bake-off
- no architecture rewrite from memory
- no synthetic FPS fallback
- no feature acceptance based only on source presence or cloud compilation

## 8. Best use of Antigravity

Antigravity is suited for:

- large repository searches
- dependency maps
- mechanical extraction
- typed schemas
- test fixtures
- static validators
- local build loops
- Android packaging loops
- evidence generation
- asset inventory and conversion tooling

Antigravity must not independently decide:

- gameplay balance
- storm feel
- camera feel
- product identity
- progression design
- regional scope
- whether a physical build is accepted
- PR merge order
- protected-law changes

The bounded Phase 4 task is defined in `Docs/ANTIGRAVITY_PHASE4_HANDOFF.md`.
