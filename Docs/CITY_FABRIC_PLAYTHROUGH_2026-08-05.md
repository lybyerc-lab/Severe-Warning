# Heartland City Fabric Playthrough

**Date:** 2026-08-05  
**Baseline:** Phase 6 Run 21, commit `b0fff3ced1095b9bc4b27d53c030b21431bdf3b7`  
**Purpose:** Evaluate whether the four Heartland stops deliver the intended fantasy of destroying a readable SimCity-style area.

## Method

The complete four-stop campaign was loaded from the packaged Run 21 web preview. Each stop was sampled at start, late district 1, district 2, district 3, and results. Runtime snapshots were collected alongside screenshots.

## Finding

The campaign identity layer works, but the playable city fabric remains substantially shared.

All four stops use:

- 140 destructible targets
- 13 comedy props
- 4 chain setpieces
- 3 substations
- the same 80-unit road grid
- the same six-by-six block layout
- the same four-lot block construction
- the same core house, commercial, warehouse, and tree families

The stop-specific layer changes terrain, palette, landmarks, media names, challenges, animal count, and a small amount of scenery:

| Stop | Biome | Scenery objects | Animals | Signature landmarks |
|---|---|---:|---:|---|
| Lincoln County | Wooded ridges and creek country | 14 | 38 | Water tower, courthouse |
| Prairie Junction | Open prairie and rail corridor | 21 | 24 | Grain elevator, windmill |
| Grain Belt | Harvest shelves and industrial skyline | 11 | 18 | Silo bank, foundry |
| State Fair | Fairground bowl and neon midway | 23 | 8 | Ferris wheel, grandstand |

These differences are visible, but they do not sufficiently change navigation, target selection, block density, or destruction strategy. The player frequently sees large empty parcels and repeated four-object blocks. The result reads as one town wearing four costumes.

## Root causes

1. `buildLivingCounty()` creates the same six-by-six grid for every campaign stop.
2. Each block uses the same four corner lot offsets.
3. District archetypes are selected from the same quadrant rules regardless of campaign identity.
4. Tree variation is limited and regularly spaced.
5. Campaign scenery is mostly perimeter dressing rather than destructible urban fabric.
6. Landmark swaps provide focal points but do not reshape the surrounding blocks.

## City fabric pass

The first city-fabric pass preserves the accepted road grid and gameplay laws while replacing the shared block filler with four campaign-specific zoning plans.

### Lincoln County

- rural farm edge
- subdivisions and garages
- a low-rise Main Street
- a courthouse-centered civic core
- clustered windbreaks and mixed tree species

### Prairie Junction

- prairie neighborhoods
- a denser junction core
- a rail and warehouse corridor
- service stations and grain infrastructure

### Grain Belt

- silo districts
- dense foundry and warehouse blocks
- worker housing
- industrial service lots

### State Fair

- parking and service blocks
- exhibition pavilions
- dense midway booths
- grandstand approaches
- show-ring support buildings

## Design laws

- The player still controls the storm directly.
- The storm remains visually dominant.
- Campaign timing, scoring, abilities, objectives, and progression do not change.
- Existing roads remain stable in this pass.
- Destructible target count remains bounded for mobile performance.
- Each stop must expose a distinct zoning profile and archetype distribution.
- Foliage must use clustered placement and multiple silhouettes rather than repeated rows.
- Performance evidence remains required before Android acceptance.

## Acceptance boundary

This is a city-fabric prototype, not final art. It is ready for review when:

- all inherited Phase 6 checks pass
- all four campaign profiles are structurally distinct
- each profile has varied target density by block
- campaign screenshots clearly read as different towns
- Android packaging succeeds
- the owner confirms the world feels closer to destroying a miniature city rather than clearing a sparse obstacle grid
