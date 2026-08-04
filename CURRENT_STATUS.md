# Severe Weather Warning Current Status

**Last updated:** 2026-08-03 Central Time  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Default branch:** `main`  
**Production renderer:** Three.js  
**Primary target:** single-player Android landscape  
**Active gameplay source:** `MechanicsLab/SevereWeather_3D_Lab.html`  
**Android packaging:** Capacitor 8.5.0 with offline local assets

## Canonical project identity

The full game name is **Severe Weather Warning**.

- `Heartland` is the current campaign/content family.
- `Production Slice` is a temporary engineering milestone label.
- Neither replaces the product name.

## Canonical memory order

1. Current repository code and exact-commit build evidence
2. This file
3. `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
4. `Docs/MODERNIZATION_PLAN.md`
5. `Docs/DECISION_2026-08-03_PRODUCTION_DIRECTION.md`
6. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
7. `Docs/DECISION_LOG.md`
8. `Docs/NO_DRIFT_POLICY.md`
9. `Docs/DEVICE_TEST_LOG.md`
10. Historical Unity, Godot, and renderer-laboratory records

Important decisions and physical evidence must be committed to the repository. Chat is working context, not durable project memory.

## Production decision

The enjoyable Three.js/WebGL game is the production gameplay source. Capacitor packages that game locally for Android.

- Three.js remains production.
- Unity and Godot remain preserved historical experiments.
- Babylon.js remains archived renderer-laboratory evidence and should not be merged into production.
- Defold is the strongest Plan B engine, but only for a narrowly defined proof tied to a specific measured Three.js limitation.
- No migration is justified by visual dissatisfaction alone.

## Protected product direction

Severe Weather Warning is a humorous, replayable mobile arcade destruction game in which the player directly controls the storm.

- Android landscape is the primary target.
- The response is a media circus, not a battle.
- People remain protected and off-limits.
- Animals are invincible, non-targetable, and may appear in safe slapstick sequences.
- News vans and storm chasers are invincible witnesses, never enemies or rewarded targets.
- `Moo Brew` remains the approved opening-cinematic coffee brand.
- The visual target is a readable stylized American town with strong silhouettes, authored destruction, atmospheric depth, and modern weather spectacle.
- The gameplay loop must remain direct, physical, readable, and replayable.

## Protected accepted behavior

Future work must preserve:

- direct storm controls
- Pull, Gust, and Grid Zap behavior
- continuous scoring across district boundaries
- forward-only district progression
- three-minute real-time warning clock behavior
- Heartland campaign progression and persistence contracts
- QA4 input isolation
- QA4 deterministic runtime coverage
- popup batching and rendering
- deterministic cleanup and reset
- recorded-effect direction and continuous wind ambience
- safe animals and protected people

## Active branch and pull-request state

### PR #13: V5 Heartland campaign foundation

- State: open, draft, unmerged
- Base: `main`
- Head: `agent/v500-heartland-campaign`
- Head commit: `d366cc9a1d6ec97192e5245a41bd193a21a769bc`
- Boundary: preserve as the campaign foundation branch

### PR #14: Babylon.js Visual Engine Laboratory

- State: open, draft, unmerged
- Base: `agent/v500-heartland-campaign`
- Head: `agent/visual-engine-lab-foundation`
- Head commit: `f439db0623543308730386964f31668b76a0f7dc`
- Decision: archive as research evidence; do not merge into production

### PR #15: Three.js production visual slice

- State: open, draft, unmerged
- Base: `agent/v500-heartland-campaign`
- Head: `agent/threejs-production-slice`
- Accepted candidate commit: `c49ba1c52ac58d3bd1c6e1d60d7e84cd28a16c72`
- GitHub Actions run: `30868496726`
- Workflow result: success
- Artifact ID: `8877035856`
- Artifact archive digest: `sha256:f689133f9200d6847034ebce2d9933c7150f0c879c2aada69c64d091ebbb950a`

The successful workflow completed:

- new-script syntax checks
- verified audio generation
- accepted gameplay patch chain
- V5 foundation verification
- V5.1 structural verification
- offline web package verification
- deterministic desktop browser QA
- deterministic mobile-landscape browser QA
- Android asset synchronization
- debug APK assembly
- package creation and artifact upload

PR #15 still requires hands-on browser and physical Android gameplay acceptance before merge consideration.

## Current V5.1 production-slice contents

- layered Three.js tornado shell
- vapor ribbons, suction rings, dust, debris, and canopy depth
- authored crop rows, fences, tree bands, parking details, mailboxes, and commercial awnings
- Hart Farm five-stage destruction setpiece
- roof peel and readable wreckage
- improved Cow 17 scale and silhouette
- tighter camera composition
- progressive storm atmosphere
- Low, Balanced, High, and Showcase visual tiers
- real frame samples in deterministic browser QA

The candidate removes visible prototype symptoms, but it is not the end-state art pipeline.

## Current performance evidence

The successful deterministic QA run reported real sampled frame rates for desktop and mobile-landscape browser tests. These measurements are CI software-rendering evidence, not a substitute for physical-device performance.

Physical Android acceptance remains authoritative for:

- touch feel
- visual readability
- sustained frame pacing
- heat
- battery use
- audio
- pause and resume
- orientation and safe areas
- close and reopen behavior

## QA-site status

The current GitHub Actions workflow packages a complete `web-preview` and QA evidence directory.

It does **not** currently publish a permanent hosted QA URL.

Approved direction:

- add a GitHub Pages preview deployment after the current gate
- keep the preview tied to exact commit and build metadata
- do not use Netlify unless the owner explicitly reverses that decision
- never describe a packaged preview as a deployed site

## Immediate next milestone

Modernize the production structure because the historical patch chain, generated single-file HTML, lexical runtime bundling, and broad global state are slowing development.

The modernization must:

1. Keep Three.js and current gameplay.
2. Introduce Vite and strict TypeScript.
3. Replace generated inline concatenation with real ES modules.
4. Establish `GameApp`, lifecycle, and explicit shared-context contracts.
5. Separate gameplay, rendering, world, input, audio, persistence, UI, and QA ownership.
6. Move campaigns, districts, landmarks, buildings, and destruction stages toward data-driven definitions.
7. Provide a formal deterministic QA bridge.
8. Preserve Capacitor Android packaging.
9. Retire patch scripts only after parity is proven.
10. Work in substantial migration milestones, not a long chain of tiny builds.

## Current known risks

- PR #15 has not yet received hands-on acceptance.
- The active source still depends on a long historical patch chain.
- The generated game remains a large inline runtime.
- Runtime fragments rely on shared lexical scope and globals.
- A hosted QA site is not yet deployed.
- High-end phone success will not prove older-device performance.
- Renderer modernization and a Three.js version upgrade must not be combined into one uncontrolled change.

## Next action

Use `agent/project-context-modernization` to preserve the latest decisions and prepare the modernization work. Do not merge PR #15 or alter protected branches until the owner completes gameplay review and explicitly approves the next transition.
