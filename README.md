# Severe Weather Warning

**Severe Weather Warning** is a mobile arcade destruction game with light action RPG progression. The player fantasy is simple: **YOU ARE THE STORM**.

Production uses **Three.js r128**. Browser/PWA QA is the normal rapid-review lane; Android remains the deliberate physical-device acceptance lane. Unity, Godot, Babylon.js, PlayCanvas, and older HTML experiments are preserved historical/research evidence and are not current production authority.

## Current authority

GitHub is durable project memory. Chat is working context.

Do **not** treat the default `main` branch as current gameplay/project authority.

Director authority branch:

`agent/director-stage2b-game-direction`

For current execution state, start with:

1. Issue #71, `DIRECTOR START HERE: current authority and fresh-chat recovery protocol`;
2. `Docs/ACTIVE_HANDOFF.md` on the Director authority branch;
3. exact task issue + exact branch/commit/CI/evidence for the lane being acted on.

Before planning, assigning, reviewing, integrating, or changing work, also read:

- `AGENTS.md`
- `Docs/GAME_DIRECTOR.md`
- `Docs/WORKER_STARTUP_ORDER.md`
- `Docs/ACTIVE_PRODUCTION_SLATE.md`
- `Docs/IMPLEMENTATION_TRUTH_GATE.md`

Exact current evidence outranks older prose.

## Current accepted Stage 2B base

Canonical integration branch:

`agent/sw-int-003-stage2b-accepted-stack`

Exact Director-accepted canonical head:

`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

This includes the accepted Stage 2B stack plus the completed owner-playtest QUALITY-001 / QUALITY-002 rescue. Issues #79 and #80 are closed completed.

The prior canonical `271e5d3d7b438727df8b217ad59b7974ff1374b6` is a pre-rescue comparison baseline, not current gameplay authority.

## Active quality wave

The current parallel worker wave starts from exact base `7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`:

- #81 `SW-WORLD-007` — Supercell and Derecho atmospheric identity overhaul
- #82 `SW-FEEL-001` — physical destruction consequence presentation
- #83 `SW-UI-003` — run-shell Americana identity for pause and results

Branch creation or assignment is not proof a worker ran or completed. Worker evidence must be pushed and reviewed before Director acceptance.

## Product laws

- Full title: **Severe Weather Warning**.
- Genre: mobile arcade destruction with light action RPG progression.
- Storm is the visual hero and must read as one connected dangerous atmospheric mass.
- Fun and destruction come first; beauty is a product requirement.
- Visual thesis: **storm-charged stylized Americana**.
- Visual promise: **beautiful at a glance, readable at speed, cinematic up close**.
- Cows, Cow 17, and Moo Brew are recurring comic identity; cows remain protected/non-targetable.
- Newspaper presentation connects storm select, `UNLEASH STORM`, and results.
- The town/county campaign remains the home backbone while authored Storm Sites expand the game.
- MOO-LAH is local-first earned currency. Exactly three active abilities are equipped in the Storm Triangle.
- No stamina, wait timers, grind treadmill, or forced ads.

`Docs/GAME_DIRECTOR.md` is the canonical long-form product-direction contract.

## Repository map

- `MechanicsLab/` — legacy production gameplay source and preserved browser laboratories
- `runtime/` — maintained Three.js presentation/game-support runtime layers
- `scripts/` — deterministic application, build, verification, and QA tools
- `android/` — Capacitor Android wrapper
- `Docs/` — current authority, product direction, evidence, and historical records
- `artifacts/` — committed bounded QA/audit evidence when a task requires durable visual proof
- legacy engine directories — preserved historical/research material only

## Status vocabulary

A committed branch is not automatically accepted. Keep these gates separate:

`committed -> executed QA evidence -> Director acceptance -> public QA / owner browser review -> physical Android acceptance when required`

Green CI is engineering evidence, not automatic product acceptance.

## Historical documentation

The repository intentionally preserves old build trains, phase handoffs, validation reports, migration experiments, and engine research. Their dates and exact SHAs remain useful evidence, but they do **not** override Issue #71, `Docs/ACTIVE_HANDOFF.md`, the current Director laws, or exact task evidence unless explicitly reactivated.
