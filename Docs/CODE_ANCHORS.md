# Stable Code Anchors

Use these labels to make high-risk subsystems easy to find and replace safely.

## Format

Start marker:

```js
// ============================================================================
// [SW:AUDIO:ENGINE]
// Purpose: Own Web Audio initialization, buses, voices, and lifecycle.
// Invariants:
// - Runtime playback remains offline.
// - News ducking may reduce volume but never permanently mute a bus.
// ============================================================================
```

End marker:

```js
// [SW:AUDIO:ENGINE:END]
```

## Approved subsystem anchors

### Audio

- `[SW:AUDIO:ENGINE]`
- `[SW:AUDIO:MUSIC]`
- `[SW:AUDIO:AMBIENCE]`
- `[SW:AUDIO:MATERIAL_ROUTING]`
- `[SW:AUDIO:EVENT_LOG]`
- `[SW:AUDIO:QA_PANEL]`

### Gameplay

- `[SW:CAMPAIGN:HEARTLAND]`
- `[SW:GAMEPLAY:STORM_CONTROL]`
- `[SW:GAMEPLAY:ABILITIES]`
- `[SW:GAMEPLAY:DISTRICT_PROGRESSION]`
- `[SW:GAMEPLAY:RUN_CLOCK]`
- `[SW:GAMEPLAY:COMBO]`
- `[SW:GAMEPLAY:SCORING]`
- `[SW:GAMEPLAY:OBJECTIVES]`

### UI

- `[SW:UI:HUD]`
- `[SW:UI:RAMPAGE_FEEDBACK]`
- `[SW:UI:QA_PANEL]`
- `[SW:UI:RESULTS]`

### World

- `[SW:WORLD:CAMPAIGN_IDENTITY]`
- `[SW:WORLD:TREE_RESPONSE]`
- `[SW:WORLD:DESTRUCTION]`
- `[SW:WORLD:MEDIA]`
- `[SW:WORLD:ANIMALS]`
- `[SW:WORLD:BOVINE_SIGNATURE]`
- `[SW:WORLD:POWER_GRID]`

### Build and runtime

- `[SW:BUILD:IDENTITY]`
- `[SW:BUILD:AUDIO_MANIFEST]`
- `[SW:RUNTIME:LIFECYCLE]`
- `[SW:RUNTIME:CLEANUP]`

### Visual engine laboratory

- `[SW:LAB:VISUAL_CONTRACT]`
- `[SW:LAB:ENGINE_LIFECYCLE]`
- `[SW:LAB:QUALITY_GOVERNOR]`
- `[SW:LAB:BENCHMARK_WORLD]`
- `[SW:LAB:TORNADO]`
- `[SW:LAB:DESTRUCTION]`
- `[SW:LAB:SAFE_COW]`
- `[SW:LAB:DETERMINISTIC_REPLAY]`
- `[SW:LAB:DIAGNOSTICS]`

## Approved design-law anchors

- `[SW:LAW:PLAYER-IS-STORM]`
- `[SW:LAW:DISTRICTS-FORWARD-ONLY]`
- `[SW:LAW:MEDIA-NOT-COMBAT]`
- `[SW:LAW:PROTECTED-PEOPLE]`
- `[SW:LAW:SAFE-ANIMALS]`
- `[SW:LAW:PHYSICAL-ACCEPTANCE]`
- `[SW:LAW:OFFLINE-RUNTIME]`

## Rules

- Every anchor must be unique within its file.
- Every replaceable subsystem should have both start and end markers.
- Anchors must describe responsibility, not a temporary implementation.
- Do not embed version numbers in stable anchor names.
- Do not use labels such as `LATEST`, `NEW`, `TEMP`, or `FIXED`.
- Design-law comments should explain what must remain true and why.
- Patch scripts should verify exactly one matching start and end anchor before replacement.
- A patch must fail rather than silently append a duplicate subsystem.

## Example design-law comment

```js
// [SW:LAW:DISTRICTS-FORWARD-ONLY]
// Time pickups may increase the timer, but the highest district reached is
// monotonic. Completed district transitions must never replay or downgrade.
```

## Migration order

Add anchors first to these high-risk areas:

1. audio engine and music routing
2. rampage feedback
3. district progression
4. tree and Gust response
5. Pull response
6. runtime cleanup
7. build identity

Do not perform a broad refactor merely to add anchors. Add them during focused subsystem work and verify behavior through the QA lane.
