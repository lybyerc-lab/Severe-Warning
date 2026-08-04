# Severe Weather Warning - Master Project Context Handoff

**Living handoff last updated:** 2026-08-03 Central Time  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Canonical product name:** **Severe Weather Warning**  
**Production renderer:** Three.js  
**Primary target:** Android landscape  
**Browser target:** rapid QA and gameplay review  
**Android wrapper:** Capacitor 8.5.0 with offline local assets

---

## 1. Purpose of this document

This is the current durable handoff for Severe Weather Warning. It replaces stale statements that describe Unity, Godot, or Babylon.js as the production path.

The repository is the canonical project memory. Chat is working context until decisions, evidence, and implementation changes are committed.

Before changing code, read:

1. `CURRENT_STATUS.md`
2. this document
3. `Docs/MODERNIZATION_PLAN.md`
4. `Docs/DECISION_2026-08-03_PRODUCTION_DIRECTION.md`
5. `Docs/NO_DRIFT_POLICY.md`
6. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
7. `Docs/DEVICE_TEST_LOG.md`

Do not rely on archived engine documents for current production direction.

---

## 2. Canonical identity

The full game name is:

# Severe Weather Warning

`Heartland` is the current campaign and regional content family. It is not the product title.

Temporary engineering labels such as `Production Slice`, `Visual Engine Laboratory`, `Mechanics Lab`, or `Heartland Campaign Foundation` identify branches, milestones, or test builds. They do not replace the canonical game name.

### Product statement

Severe Weather Warning is a mobile-first, single-player arcade destruction game in which the player directly controls the storm through a dense, readable, stylized American region.

The game combines:

- city-builder readability
- direct arcade control
- authored physical destruction
- modern weather spectacle
- deadpan local-news humor
- safe environmental slapstick

The player is the storm. The game is not a management simulator, storm-chaser game, military battle, or passive weather model.

---

## 3. Tone and safety laws

These are non-negotiable:

- No visible human casualties.
- People are evacuated, sheltered, off-screen, and never targets.
- Property destruction provides the spectacle.
- Animals are invincible, non-targetable, and may participate only in safe slapstick.
- News crews and storm chasers are invincible witnesses, never enemies.
- The player is never rewarded for targeting people, animals, news crews, or storm chasers.
- Humor comes from regional flavor, environmental physics, fictional businesses, broadcast framing, and absurd but harmless outcomes.
- No blood, injury detail, or suffering.

The intended contrast is serious storm cinematography paired with professional local reporting of increasingly ridiculous property events.

---

## 4. Current production decision

The active production game is the Three.js/WebGL build rooted at:

`MechanicsLab/SevereWeather_3D_Lab.html`

Capacitor packages the same offline web build for Android.

### Active production path

- Three.js/WebGL gameplay
- browser QA
- Capacitor Android packaging
- GitHub Actions verification and artifact creation

### Preserved but inactive paths

- Unity: historical implementation evidence
- Godot: historical migration experiment
- Babylon.js: isolated renderer laboratory

### Engine policy

Three.js remains production.

Babylon.js answered an important research question: changing renderers alone does not solve the visual-quality problem. Its useful ideas may be ported into Three.js, but the Babylon branch is not a production migration path.

Defold is the strongest current Plan B engine because it offers a compact native/mobile-first runtime, editor, integrated scene workflow, Lua architecture, 3D physics, and mobile deployment. It is not a replacement decision.

A Defold proof is justified only if it tests a specific measured limitation that Three.js is repeatedly failing to solve, such as:

- visual level authoring
- native mobile binary size or startup
- integrated scene workflow
- native deployment requirements
- integrated physics workflow

No broad engine bake-off should be performed from curiosity alone.

---

## 5. Protected accepted gameplay baseline

Modernization, visual improvement, art-pipeline work, and QA work must preserve the accepted behavior already proven in the current Three.js game.

### Core controls and abilities

- direct storm control
- Pull
- Gust
- Grid Zap
- mobile joystick and action controls
- camera behavior that supports readable storm movement

### Run structure

- three-minute real-time warning clock
- continuous scoring across district boundaries
- forward-only district progression
- no regression to district score resets or backward stage movement
- stable results and retry flow

### Campaign

- four-stop Heartland campaign foundation
- ordered unlock progression
- stars, best scores, run counts, selected stop, and furthest unlock
- distinct campaign terrain and regional identity contracts
- persistent save schema already established by the V5 foundation

### Presentation and feedback

- accepted v4.4.0 illustrated presentation direction
- v4.4.1 Gust tree response
- v4.4.2 Pull response
- v4.5 continuous wind ambience
- recorded-effect direction
- readable score and popup presentation
- media circus behavior and coverage feedback

### QA and cleanup

- QA4 input isolation
- QA4 deterministic runtime coverage
- popup batching and rendering
- deterministic cleanup
- deterministic reset behavior
- no synthetic 60 FPS performance fallback

Any modernization change that silently alters these behaviors is a regression, even if the code looks cleaner.

---

## 6. Current branch and pull-request map

### PR #13 - V5 Heartland campaign foundation

- State: open, draft, unmerged
- Base: `main`
- Head: `agent/v500-heartland-campaign`
- Head commit: `d366cc9a1d6ec97192e5245a41bd193a21a769bc`

This branch is the protected campaign foundation for subsequent production work.

### PR #14 - Babylon.js Visual Engine Laboratory

- State: open, draft, unmerged
- Base: `agent/v500-heartland-campaign`
- Head: `agent/visual-engine-lab-foundation`
- Head commit: `f439db0623543308730386964f31668b76a0f7dc`

Decision:

- preserve as laboratory evidence
- do not merge into production
- stop investing in Babylon migration
- port only individually proven visual ideas into Three.js

### PR #15 - Three.js production visual slice

- State: open, draft, unmerged
- Base: `agent/v500-heartland-campaign`
- Head: `agent/threejs-production-slice`
- Accepted automated-gate commit: `c49ba1c52ac58d3bd1c6e1d60d7e84cd28a16c72`
- GitHub Actions run: `30868496726`
- Artifact ID: `8877035856`
- Artifact archive digest: `sha256:f689133f9200d6847034ebce2d9933c7150f0c879c2aada69c64d091ebbb950a`

The full workflow completed successfully:

- source syntax checks
- verified audio generation
- accepted gameplay patch chain
- V5 foundation verification
- V5.1 verification
- offline web packaging
- deterministic desktop browser QA
- deterministic mobile-landscape browser QA
- Android asset synchronization
- debug APK assembly
- package creation
- artifact upload

PR #15 still requires hands-on browser and physical Android gameplay acceptance before merge consideration.

### Current documentation branch

`agent/project-context-modernization`

Purpose:

- restore the canonical title
- record the completed V5.1 automated gate
- record engine decisions
- record the no-Netlify boundary
- define the production modernization plan
- prepare the next implementation phase without changing PR #15

---

## 7. V5.1 production visual slice

The V5.1 slice removes major visible prototype symptoms while preserving the working game.

### Included visual and world work

- layered tornado shell
- vapor ribbons
- ground suction rings
- dust and debris staging
- additional canopy and atmosphere depth
- authored crop rows
- fences
- tree bands
- parking details
- mailboxes
- commercial awnings
- tighter tactical camera composition
- progressive storm atmosphere

### Hart Farm setpiece

Hart Farm is an authored destruction benchmark with five states:

1. intact
2. damaged
3. roof peel
4. exposed/partial collapse
5. wreckage

The setpiece exists to establish the destruction language for future houses, businesses, utilities, and landmarks.

### Cow 17

Cow 17 is the visual truth detector for readable living-world presentation.

The long-term Cow 17 behavior target remains:

- idle
- graze
- notice
- double take
- brace
- slide
- front lift
- launch
- orbit
- safe landing
- recovery
- offended reaction

The V5.1 slice improves scale and silhouette, but Cow 17 remains an ongoing production-quality benchmark.

### Quality tiers

- Low
- Balanced
- High
- Showcase

Quality tiers may change presentation density and visual cost. They must not change gameplay rules or scoring.

---

## 8. Visual north star

The target is a compact, SimCity-readable American town designed for approximately three minutes of joyful destruction.

### World scale

- roughly 6 to 12 readable blocks per focused production area
- broad farm/outskirts, residential/commercial, and landmark/finale flow
- dense enough to feel authored
- open enough for storm readability and mobile performance

### Three-minute pacing

- Minute 1: farms and outskirts
- Minute 2: residential and commercial escalation
- Minute 3: landmarks, chain reactions, and finale destination

### Art direction

- clean geometry
- strong silhouettes
- exaggerated but coherent proportions
- readable painted materials
- atmospheric depth
- large authored destruction chunks
- selective spectacle rather than uniform particle noise
- no photorealism requirement
- no return to empty graybox presentation

### Destruction language

Important structures should move through authored readable states:

1. intact
2. damaged
3. exposed interior
4. partial collapse
5. wreckage

Destruction should be persistent, readable, and materially different. Important structures should not simply disappear into generic debris.

---

## 9. Moo Brew opening sequence

The canonical opening concept remains:

1. newspaper tumbles with warning headline
2. paper sticks to camera and peels away to reveal the farm
3. cow drinks Moo Brew
4. radio and weather change
5. cow double take
6. cup drops logo-forward
7. escape and chickens scatter
8. barn roof peels and tornado touches down
9. camera rises to tactical angle
10. HUD fades in
11. control begins seamlessly
12. ending recap visually mirrors the opening

This is a source-of-truth sequence even though it is not yet implemented in the current production runtime.

---

## 10. Why modernization is now required

The game has outgrown its prototype construction method.

Current friction includes:

- a long historical patch chain
- exact-string source replacement
- one generated large HTML runtime
- runtime fragments concatenated into shared lexical scope
- broad global state
- QA access through incidental globals
- source and build artifact roles mixed together
- ordinary changes triggering fragile build interactions

These techniques were useful during rapid experimentation. They are now slowing development and increasing regression risk.

The modernization is intended to improve delivery speed, clarity, testability, and long-term ownership without rewriting accepted gameplay.

---

## 11. Approved modernization direction

### Core stack

- Three.js
- Vite
- TypeScript with strict checking
- ES modules
- Capacitor for Android
- Playwright for browser and visual QA
- Blender to GLB/glTF for authored assets
- KTX2 or similar mobile texture compression when justified by measured need

### Core architecture

The modern runtime should establish:

- `GameApp`
- explicit lifecycle
- `GameContext`
- owned systems
- explicit clocks
- stable runtime interfaces
- a formal QA bridge

### Intended system ownership

- gameplay
- storm and abilities
- scoring
- districts and campaign
- destruction
- renderer and camera
- atmosphere and effects
- world and entities
- input
- audio
- persistence
- UI
- QA
- platform/Android integration

### Clock separation

The runtime should explicitly separate:

- render time
- simulation time
- run-clock time

The accepted three-minute warning countdown is a real-time gameplay contract and must not be accidentally tied to render or simulation delta.

### Data-driven content

The following should gradually move from hardcoded implementation forests to explicit data definitions:

- campaigns
- campaign stops
- districts
- landmarks
- destructible buildings
- destruction states
- scoring contracts
- challenges
- world placement
- quality-tier density

### No full rewrite

Use a controlled strangler migration:

1. establish a modern shell
2. run the current game through a compatibility adapter
3. prove behavioral parity
4. move one coherent system group at a time
5. remove old patch machinery only after replacement is proven

Do not delete the working game and attempt to reproduce it from memory.

---

## 12. Modernization milestone order

### Milestone A - preserve and document the accepted candidate

- keep PR #15 intact
- complete hands-on browser review
- complete physical Android review
- record findings
- merge only with explicit owner approval

### Milestone B - modern shell

Create a new production structure with:

- Vite
- strict TypeScript
- module entrypoint
- `GameApp`
- `GameContext`
- lifecycle contracts
- legacy runtime adapter
- exact build metadata
- canonical Severe Weather Warning product identity

The game should play the same at the end of this milestone.

### Milestone C - coherent system extraction

Move systems in substantial groups:

1. clocks, run state, and configuration
2. input and abilities
3. scoring and district progression
4. rendering, camera, and atmosphere
5. world generation and destruction
6. audio and UI
7. persistence and QA

Avoid death by a thousand tiny migrations.

### Milestone D - art and content pipeline

- Blender/GLB authored assets
- shared material and texture strategy
- authored destruction variants
- data-driven town assembly
- performance budgets by quality tier
- repeatable asset validation

### Milestone E - Three.js upgrade

Do not combine the architecture migration with a major Three.js version upgrade.

First establish parity and golden tests on the existing r128 behavior. Then perform a dedicated renderer-upgrade milestone using official migration guidance and fixed visual comparisons.

---

## 13. QA and evidence rules

Automated verification is necessary but not sufficient.

### Automated gates

- syntax and type checks
- unit and integration checks
- deterministic gameplay scenarios
- responsive browser tests
- screenshot comparisons where stable
- console and page-error checks
- real frame samples
- package verification
- Android asset parity
- APK assembly
- cleanup and reset checks

### Physical gates

The owner controls final acceptance for:

- visual quality
- gameplay feel
- touch comfort
- camera comfort
- real-device performance
- heat
- battery use
- audio balance
- loading and startup
- pause and resume
- orientation and safe-area behavior
- close and reopen persistence

Never describe CI success as physical-device acceptance.

### Performance honesty

- no synthetic 60 FPS fallback
- label software-rendered CI measurements honestly
- record exact commit, workflow run, viewport/device, and artifact
- distinguish browser evidence from Android evidence
- distinguish structural verification from gameplay acceptance

---

## 14. QA-site and hosting decision

The current workflow packages a `web-preview` and QA evidence directory.

It does not currently deploy a permanent hosted QA site.

Approved direction:

- use GitHub Actions for build and verification
- use GitHub Pages for an exact-commit QA preview when implemented
- include build metadata and commit identity in the preview
- keep preview deployment isolated from production branches
- do not use Netlify unless the owner explicitly changes the decision
- never claim a hosted URL exists before deployment is verified

A packaged HTML directory and a deployed site are not the same thing.

---

## 15. Working protocol

The owner has explicitly asked for efficient, substantial progress rather than many tiny builds.

### Build rhythm

1. implement a coherent milestone
2. run automated gates
3. provide one browser QA review point
4. perform one consolidated correction pass
5. build the APK
6. perform physical Android acceptance

### Decision protocol

The technical lead should make routine implementation decisions without repeatedly interrupting the owner.

Pause only when a decision could materially change:

- core gameplay
- visual identity
- protected accepted behavior
- project scope
- performance target
- platform strategy
- product name or campaign identity

### Governing rule

> It improves or it does nothing. We only alter what is an improvement.

---

## 16. Immediate next action

1. Let the owner test the PR #15 packaged browser preview and APK.
2. Record physical findings without modifying PR #15 prematurely.
3. Continue the documentation and modernization preparation on `agent/project-context-modernization`.
4. Add a verified GitHub Pages QA-preview workflow as part of the modernization foundation, not through Netlify.
5. Begin the modern Vite/TypeScript shell only after the candidate and branch boundaries are clearly preserved.
6. Keep all new work draft and unmerged until the owner approves the resulting transition.

---

## 17. Final receiving-developer summary

- The product is **Severe Weather Warning**.
- Heartland is a campaign, not the title.
- Three.js is production.
- Capacitor packages Android.
- PR #15 passed its complete automated gate at `c49ba1c52ac58d3bd1c6e1d60d7e84cd28a16c72`.
- PR #15 still needs hands-on acceptance.
- Babylon.js is archived research and should not merge.
- Defold is Plan B, not an active migration.
- No Netlify.
- Modernize with Vite, strict TypeScript, ES modules, explicit lifecycle/context, data-driven content, and formal QA.
- Preserve accepted gameplay and migrate through compatibility, not rewrite.
- Work in substantial milestones.
- The repository, not chat, is the durable source of truth.
