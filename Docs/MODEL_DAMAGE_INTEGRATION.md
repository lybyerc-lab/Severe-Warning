# Wiring glTF actors into the damage system

Status: options for decision. Nothing here is implemented.

Five models are committed and verified in `assets/models/`, and none is
referenced by gameplay yet. Making them real means satisfying the contract the
damage system already imposes on every destructible target. That contract was
written around procedurally-built, multi-part props, and a single-mesh glTF does
not satisfy it. This is the decision that has to be made before the first actor
is swapped in -- and it should be made once, for the whole future cast, not per
actor.

## The contract as it stands

`applyTargetDamageStage()` and `destroyTarget()` require `target.meshData` to
provide:

| Field | Used for |
|---|---|
| `group` | leaned on `rotation.z`, squashed on `scale.y` / `scale.x` per stage |
| `damageParts[]` | stage 2 pops ~40% of them off and throws them as physics chunks; all survivors get darkened |
| `roof` | stage 1 removes it and throws it as its own fragment |
| `base`, `color` | fallback tint target, explosion colour |
| `footprint`, `points`, `label` | explosion radius, scoring, HUD |

The visible damage language is therefore: **roof flies off, chunks fly off,
survivors darken, the whole thing leans and squashes, then explodes.**

## Why a single-mesh model does not fit

Everything below was measured in a running build, not inferred.

1. **No parts to throw.** A single-mesh actor yields `damageParts.length === 1`.
   The stage-2 loop is guarded by `parts.length > 1`, so it pops nothing. No
   chunks, no debris -- the actor just darkens and shrinks. It fails soft rather
   than crashing, which is good, but the destruction reads as broken.

2. **No roof to lose.** Stage 1 is a no-op without `meshData.roof`.

3. **Tint leaks across instances.** This one is a live bug in the loader as
   written. `Object3D.clone()` copies transforms but assigns `material` by
   reference, so every instance of an actor shares one material. Verified:
   tinting one water tower turned an untouched sibling from `#ffffff` to
   `#d1d1d1`. Hit one, and every copy in the county darkens.

   Geometry sharing is fine and wanted -- it is what keeps memory flat across 38
   cows. Only the material needs to be per-instance, and only for actors that
   can be damaged.

## Options

### A. Author damage parts into the model

Export each actor with named nodes (`dmg_roof`, `dmg_wall_01`, ...). The loader
maps them onto `damageParts` and `roof`.

- Full fidelity with the existing system; no engine change.
- Gives back the draw calls we just spent a round recovering: cow-17 went from
  31 meshes to 1 for exactly this reason.
- Authoring burden on every actor, forever, and the naming convention becomes a
  contract GPT has to honour per model.

### B. Single mesh plus a shared debris kit

The actor stays one mesh. Damage tints and deforms it; chunks come from a small
shared set of generic fragments (or the existing `explodeStructure` boxes),
tinted to the actor's colour.

- One draw call for the common, undamaged case.
- Zero extra authoring: every future actor works the moment it lands.
- Debris is generic, so a shattered silo throws the same chunks as a shattered
  van. At the distance these are seen, that is likely invisible.
- The actor never visibly loses a part; it darkens, leans and squashes, then
  explodes.

### C. Encode part IDs in the mesh, split at load

Author one mesh but tag vertices with a part index (spare `COLOR_0` alpha, or a
second UV channel). The loader splits into sub-meshes once, at load, and caches
the result.

- One file, one draw call until damaged, full part fidelity after.
- The most complex option by a wide margin, and the split cost lands during
  world assembly.
- Hard to author reliably and hard to debug when a tag is wrong.

### D. Damage-state swaps

Author three states per actor -- intact, damaged, wreck -- and swap the whole
model per stage.

- Best looking by far: damage is art-directed rather than simulated, and it is
  always one draw call.
- Roughly 3x payload per actor. At today's 249 KB for five actors that is
  affordable; across a full cast it is the thing most likely to hit the 2 MB
  budget.
- No dynamic chunk physics, so it loses the flying-debris language the game
  currently leans on.

## Recommendation

**B as the default contract, D reserved for hero actors, and the material fix
regardless.**

Reasoning for the future cast rather than these five:

- B costs nothing per actor. Every model GPT produces works on arrival with no
  naming convention to honour and no per-actor engine work. That property
  matters more as the cast grows than any single actor's damage fidelity.
- A and C both scale their cost with the number of actors -- A in draw calls and
  authoring, C in complexity. Neither is a good trade for a mobile target that
  already carries a particle system and instanced debris.
- D is genuinely better looking, so it should stay available. The water tower
  and grain silo are landmarks the player deliberately targets and watches fall;
  those are worth three states. A parked news van is not.

This gives one code path with an optional upgrade, rather than four paths.

### Required regardless of choice

Clone the material per instance for damageable actors, in
`instantiateActorModel`. Geometry stays shared. Without this, any option that
tints will tint the whole species.

An `options.damageable` flag is the cheapest way to scope it: cows and parked
scenery keep the shared material and stay cheap; targets get their own.

## Open question for the director

Do landmarks keep the flying-chunk language, or is art-directed collapse (D)
better for them? It changes what to ask GPT for next: one mesh per actor, or
three states for the landmarks.
