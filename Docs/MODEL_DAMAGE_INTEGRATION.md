# Wiring glTF actors into the damage system

Status: implemented 2026-08-23. Adapter, chunk spawning, wreck swap and the
campaign landmark swap are all in.

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

## Decision

**Both, in sequence: chunks during the damage stages, collapse at destruction.**

Directed 2026-08-23. This is cheaper than the three-state version originally
costed, because the damage stages are carried by the shared debris kit and only
the final state needs authoring: **two states per landmark, not three.**

    stage 1   tint + lean + squash + throw chunks from the shared kit
    stage 2   deeper tint + more lean/squash + more chunks
    destroy   explodeStructure, then swap in <name>-wreck.glb if one exists

Correction to an earlier draft of this doc: rubble already persists.
`spawnPersistentRuin` drops a concrete slab and tilted debris into `ruinsGroup`
on every destruction. A wreck model therefore does not add persistence -- it
replaces a generic slab-and-boxes ruin with an authored one. Still worth it for
landmarks the player lines up and watches fall; a smaller claim than first
made.

The wreck swap is optional per actor. An actor with no `-wreck` model falls back
to today's behaviour -- removal plus explosion -- so this stays a per-actor
upgrade rather than a requirement, exactly like the loader's procedural
fallback.

### Cost

Only landmarks need a wreck: the water tower and grain silo are targets the
player deliberately lines up and watches fall. Vehicles and cattle do not. At
roughly 70 KB per model that is ~140 KB against the remaining ~1.75 MB budget.

### What to ask the authoring pipeline for

Per landmark, one additional `.glb` named `<actor>-wreck.glb`, same contract as
the intact model: one mesh, one primitive, explicit material at metal 0.0 /
rough 0.8, POSITION + NORMAL + COLOR_0, minY 0.0, no compression.

Authored as the collapsed remains occupying the same footprint and origin as the
intact model, so the swap needs no repositioning: same X/Z extents, base at
Y = 0, and a height roughly a third of the intact model.

## Required regardless of choice

Clone the material per instance for damageable actors, in
`instantiateActorModel`. Geometry stays shared.

**Implemented.** Gated on `options.damageable`, so cattle and parked scenery keep
the shared material and stay cheap while targets get their own. Verified in a
running build: with the flag, materials are distinct, geometry is still shared,
and tinting one instance leaves a sibling at `#ffffff`; without it, both
materials remain the same object.

## Implementation

`buildActorMeshData(instance, spec)` presents a loaded model in the shape
`applyTargetDamageStage` expects, and marks it with `modelActor`.

The single mesh still lands in `damageParts` because the tint loop reads that
array. The stage-2 pop loop is guarded by `parts.length > 1`, so it will not
remove the only mesh an actor has -- that existing guard is what makes this safe
without a special case inside the stage code.

`spawnActorChunks(target, count)` throws generic boxes tinted to the actor,
reusing `activeExplosionFragments` so physics, bouncing and lifetime are the
ones the rest of the game already uses. Five at stage 1 (standing in for the
roof a model has no way to shed), nine at stage 2.

`explodeStructure` takes an optional `wreckName`. The generic ruin is placed
first and removed only once a wreck has actually loaded, because destruction is
synchronous and loading is not: anything that waited for the model would leave
bare ground for a frame, or forever if the file is missing.

Verified in a running build, on a model-backed target driven through every
stage:

    stage 1     tint #ffffff -> #e5e5e5, scale.y 0.88, lean 0.08, chunks spawned
    stage 2     tint -> #b7b7b7, scale.y 0.616, more chunks
    destroy     group removed, damageParts never popped, ruin persists

and on the wreck swap specifically, with one actor given a wreck and one given a
missing name: immediately after destruction both hold a generic ruin; once the
async load lands, one is an authored wreck and one is still generic, with the
total unchanged. The generic ruin is replaced, not added to.

## What was swapped, and what deliberately was not

Campaign landmarks are swapped by KIND, via `CAMPAIGN_LANDMARK_MODELS`. A new
model is adopted by dropping a file named after the kind into `assets/models` --
the same no-code-change property the asset pipeline has. Kinds with no entry
keep their procedural mesh, which is the fallback rather than a gap:

    water-tower      -> water-tower.glb      (+ wreck)
    grain-elevator   -> grain-silo.glb       (+ wreck)
    silo-bank        -> grain-silo.glb       (+ wreck)
    windmill         -> farm-windmill.glb    (wreck absent; generic ruin)
    courthouse, foundry, ferris-wheel, grandstand   procedural

The beacon is kept on every landmark. It is wayfinding rather than decoration --
how a player finds a landmark across the county, and what flashes red on a hit --
so only the body is replaced.

Landmarks have no damage stages of their own; they take hits and then collapse.
Chunks are therefore thrown per hit rather than per stage, or a model-backed
landmark would absorb damage with no visible response until the moment it falls.

### The Hart Farm barn is NOT swapped

`hart-barn.glb` matches the in-world barn to two decimals and is still the wrong
thing to use. `setProductionBarnStage` is a four-stage hand-authored collapse
that manipulates eleven named parts: the sign tilts, both big doors swing, the
loft door falls open, the roof peels one half at a time, walls lean and then
detach in sequence, and the beacon goes dark. A single-mesh model cannot express
any of it.

This is the case the model contract is wrong for, and it is worth stating
plainly: one mesh per actor is right for a county full of props and wrong for a
hero prop with authored multi-stage destruction. The barn should stay
procedural unless it is re-authored as an eleven-part model, which would cost
the draw calls the contract exists to save.

### Generic houses are NOT swapped

`hart-farmhouse.glb` matches the generic house dimensions, but `createHouseMesh`
builds eight colour variants with size variation. Replacing them with one model
would make every house in the county identical -- a visual regression, not an
upgrade. It also has the same multi-part damage story as the barn, at smaller
scale.

`hart-farmhouse.glb` therefore has no home yet. Candidates: a unique building at
the Hart Farm beside the barn, or a distinct district-3 landmark. Ships as
payload until then.

## Remaining work

1. A wreck for the windmill (`farm-windmill-wreck.glb`), which currently falls
   back to the generic ruin.
2. Models for the four unmapped landmark kinds, if wanted.
3. A home for `hart-farmhouse.glb`.
