# Severe Weather Warning

**Severe Weather Warning** is a mobile-first, single-player arcade destruction game in which the player directly controls the storm.

The project is currently in a **guarded PlayCanvas production-renderer migration**. The migration deliberately preserves the accepted legacy gameplay runtime as authority while PlayCanvas takes over visible presentation in bounded, reversible slices.

## Product laws

- The player is the storm.
- Direct arcade action comes before management systems.
- People are protected and are never targets.
- Animals are invincible, non-targetable, and used only for safe slapstick.
- Media crews are invincible witnesses, never enemies.
- Destruction must be physical, readable, persistent, and materially distinct.
- Android landscape is the primary target.
- Browser QA is a fast verification lane; Galaxy Android testing is final acceptance.

## Current runtime shape

### Accepted gameplay authority

The reconstructed legacy Severe Weather runtime still owns movement, Pull/Gust/Zap, damage/destruction truth, score/combo, the warning clock, campaign state, Cow 17 safety, and reset behavior.

### PlayCanvas presentation slice

`playcanvas-slice/` is the active renderer-migration lane. It uses a same-origin authority bridge rather than duplicating gameplay rules.

Current PlayCanvas work includes:

- a 190x190 Prairie Junction test world
- one-stick chase camera with rotation-stability protections
- accepted Pull/Gust tree and light-prop response parity
- Cow 17 finite safe-flight correction
- four authoritative representative structures
- staged structure breakup and readable building anatomy
- isolated trim/roof/wall/frame debris mass hierarchy
- exact-source browser QA and GitHub Pages promotion

## Latest sealed browser candidate

PR #37 exact tested source:

`8d390f04223faaa268040afbeaa9eff885a81786`

PlayCanvas Run 76 passed the repository-owned verification chain and was promoted to the QA Pages lane through QA commit:

`4822336f207239ae1444de57e85c6b0be8867bea`

That candidate is browser-QA passed and assistant-reviewed. Its owner Galaxy browser verdict is still pending, and no PlayCanvas Android physical acceptance is claimed.

## Next bounded milestone

The next Stage 1 gap is the **Moo Brew opening / tactical handoff**. It must play before gameplay authority starts the three-minute warning run, remain deterministic for QA, and hand off into the existing slice without changing accepted controls or gameplay state.

See:

- `CURRENT_STATUS.md`
- `Docs/ACTIVE_HANDOFF.md`
- `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`
- `Docs/PLAYCANVAS_MOO_BREW_INTRO_HANDOFF.md`

## Repository map

- `playcanvas-slice/`: active PlayCanvas renderer/presentation migration
- `runtime/`: accepted modernized legacy runtime and compatibility bridges
- `MechanicsLab/`: historical source reconstructed by the accepted patch chain
- `scripts/`: deterministic patching, verification, browser QA, packaging, and evidence tooling
- `android/`: Capacitor Android project
- `Docs/`: durable project memory, decisions, evidence, build trains, and handoffs
- `Experiments/`, `Godot/`, Unity folders: preserved historical/experimental evidence, not the active production direction

## Repository memory rule

The repository is the durable project record. When documents disagree, current code and exact-commit evidence win. Start with `AGENTS.md` before changing implementation.

Do not describe a green workflow, public browser deployment, or packaged APK as physical acceptance unless the exact Android artifact has been tested and approved on the target device.
