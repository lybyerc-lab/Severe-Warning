# Severe Weather Warning

**Severe Weather Warning** is a mobile-first, single-player arcade destruction game in which the player directly controls the storm.

The active production game is the Three.js/WebGL build rooted at `MechanicsLab/SevereWeather_3D_Lab.html`. Capacitor packages the same offline web build for Android landscape play. Unity, Godot, and Babylon.js work remain preserved as experiments or historical evidence and are not the active production path.

## Canonical identity

- Full product name: **Severe Weather Warning**
- Current campaign/content family: **Heartland**
- Production renderer: **Three.js**
- Primary platform: **Android landscape**
- Browser build: QA and rapid gameplay review
- Android build: physical touch, performance, audio, lifecycle, heat, and battery acceptance

“Heartland” is campaign terminology, not a replacement title for the game.

## Current candidate

Draft PR #15, `agent/threejs-production-slice`, builds the V5.1 Three.js production visual slice on top of the V5 Heartland campaign foundation.

Its current accepted automated gate is tied to commit:

`c49ba1c52ac58d3bd1c6e1d60d7e84cd28a16c72`

GitHub Actions run `30868496726` completed successfully, including:

- accepted gameplay patch-chain verification
- V5 foundation verification
- V5.1 structural verification
- offline web packaging
- deterministic desktop browser QA
- deterministic mobile-landscape browser QA
- Android asset synchronization
- debug APK assembly
- test-package creation and artifact upload

PR #15 remains draft and unmerged until the packaged browser build and APK receive hands-on gameplay acceptance.

## Protected gameplay baseline

Modernization and visual work must preserve the accepted behavior already proven in the current production game:

- direct storm control
- Pull, Gust, and Grid Zap behavior
- continuous scoring across district boundaries
- forward-only district progression
- three-minute real-time warning clock
- Heartland campaign progression and persistence contracts
- QA4 input isolation and deterministic runtime checks
- popup batching and rendering behavior
- deterministic cleanup and reset behavior
- recorded-effect and continuous wind-audio direction
- people protected and never targetable
- animals invincible, non-targetable, and used only for safe slapstick
- news crews and storm chasers as invincible witnesses, never enemies

## Engine decisions

- Three.js remains the production renderer.
- Babylon.js is archived laboratory evidence and should not receive continued migration investment.
- Defold is the strongest current Plan B engine, but only for a tightly bounded proof that tests a specific measured Three.js limitation.
- No engine rewrite is justified by visual dissatisfaction alone.
- The immediate strategy is to improve the Three.js asset, art, destruction, rendering, and authoring pipeline.

## Next milestone: production modernization

The current patch-chain and single-file construction method are slowing development. The next engineering milestone is a controlled modernization that preserves the working game while replacing prototype scaffolding.

Planned direction:

- Vite-based build and development server
- strict TypeScript
- real ES modules instead of generated inline script concatenation
- explicit `GameApp`, lifecycle, and shared game-context contracts
- clear ownership for gameplay, rendering, world, audio, input, persistence, UI, and QA systems
- data-driven campaign, district, landmark, building, and destruction definitions
- a formal QA bridge instead of incidental `globalThis` access
- continued Capacitor Android packaging
- retirement of historical patch scripts only after verified parity

The modernization must be performed as a controlled migration, not a ground-up gameplay rewrite.

## QA and hosting boundary

The current workflow packages a complete `web-preview` and QA evidence bundle. It does **not** currently publish a permanent hosted QA site.

- Use GitHub Actions and an approved GitHub Pages preview workflow for hosted QA.
- Do not use Netlify for this project unless the owner explicitly changes that decision.
- Do not describe a packaged preview as a deployed site.

## Repository map

- `MechanicsLab/`: active Three.js game source and preserved browser laboratories
- `runtime/`: maintained V5.1 Three.js runtime source fragments
- `android/`: Capacitor Android project
- `scripts/`: build, patch, verification, QA, and packaging tools
- `Docs/`: product direction, current decisions, device evidence, and historical records
- `Experiments/`: isolated renderer and visual-engine research
- `Godot/`: preserved migration experiment
- `Assets/`, `Packages/`, `ProjectSettings/`: preserved Unity history

## Required reading before implementation

1. `CURRENT_STATUS.md`
2. `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
3. `Docs/MODERNIZATION_PLAN.md`
4. `Docs/DECISION_2026-08-03_PRODUCTION_DIRECTION.md`
5. `Docs/NO_DRIFT_POLICY.md`
6. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
7. `Docs/DEVICE_TEST_LOG.md`

The repository is the durable project record. Chat is working context until the resulting decisions and evidence are committed here.
