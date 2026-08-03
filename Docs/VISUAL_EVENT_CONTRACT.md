# Visual Event Contract

Version: `severe-warning.visual.v1`

## Purpose

The contract lets a renderer portray decisions without making them. Gameplay remains the authority for input, storm movement, ability eligibility, damage, scoring, combos, campaign progress, clocks, targets, and cooldowns. A renderer receives immutable, timestamped visual events and read-only world snapshots.

## Ownership boundary

```text
player input -> gameplay simulation -> visual events/snapshots -> renderer
                                  \-> UI/audio adapters
```

The renderer may interpolate, animate, choose LOD, pool debris, select a quality tier, frame a camera, and retire presentation objects. It may not award score, select a target, decide damage, advance a district, alter a cooldown, slow the warning clock, or mutate campaign state.

## Files

- `schema-version.ts`: exact supported schema identifier.
- `visual-events.ts`: supported event names and payload hints.
- `world-snapshot.ts`: read-only entity/world presentation state.
- `quality-profile.ts`: renderer-owned budgets.
- `asset-contract.ts`: procedural/GLB replacement boundary and material families.
- `metrics-contract.ts`: diagnostic and benchmark evidence shape.
- `validators.ts`: runtime version, shape, and event-name rejection.

## Determinism

Every event has an ID, non-negative replay timestamp, integer deterministic seed, optional entity/source IDs, and presentation payload. Positions, directions, intensities, material families, categories, and hints are data. Random-looking visual variation derives from the supplied seed and stable IDs—not `Math.random()` in gameplay-facing decisions.

Events are accepted only when their schema version and type are supported. Unsupported versions fail before dispatch. Unknown events such as `score.awarded` are rejected, preventing presentation code from quietly acquiring gameplay authority.

## Reset and cleanup

`world.reset` requests immediate deterministic baseline restoration. `scene.cleanup.requested` is the full ownership boundary for disposing scene resources, listeners, timers, pools, materials, textures, and the engine. A retry is an event; it is not permission for the renderer to recreate gameplay state.

## Evolution

Breaking changes require a new schema string and validator. Readers must not guess at forward compatibility. Additive optional presentation hints may be ignored by older renderers only when the schema contract explicitly allows them.

