# glTF actor pipeline — handoff

Everything needed to add, change or debug a `.glb` actor in this project.
Written for someone picking this up cold.

Current at `f7b339a` on `qa`. Fifteen models, 725,056 bytes (0.69 MB) against a
~2 MB budget.

## The one-sentence version

Drop a contract-valid `.glb` in `assets/models/`, regenerate
`FILE_INVENTORY.txt`, commit both together. Everything else is automatic.

## Why the constraints are what they are

Read this before proposing changes to the contract; each rule is load-bearing.

**Three.js r128, inlined by hand.** Three is not an npm dependency. It is pasted
into `MechanicsLab/SevereWeather_3D_Lab.html`. `GLTFLoader` is vendored
separately at `vendor/three-gltfloader-r128.js` -- the legacy `examples/js`
build, which is an IIFE assigning `THREE.GLTFLoader` onto the global. The
`examples/jsm` variant is ES modules and cannot be used here.

**The gameplay is one classic `<script>`.** It cannot `import`. This is why the
loader is vendored rather than imported, and why the compiled TypeScript in
`src/` is inlined at a build marker rather than loaded as a module.

**Single offline package.** The game ships inside an APK via Capacitor. Nothing
streams, nothing is fetched from a CDN. Every byte is in the package.

**No decompressors are present.** `DRACOLoader`, `KTX2Loader` and
`MeshoptDecoder` are all absent, and Draco additionally needs a WASM blob. A
compressed `.glb` looks fine in a viewer and fails to load here.

## Export contract

| | |
|---|---|
| Format | glTF 2.0 **binary** (`.glb`), textures embedded |
| Compression | **None.** No Draco, no Meshopt, no KTX2 |
| Structure | **One mesh, one primitive** |
| Material | One explicit material, `metallicFactor 0.0`, `roughnessFactor 0.8` |
| Attributes | `POSITION` + `NORMAL` + `COLOR_0` |
| Axes | Y-up, −Z forward, origin at the base |
| Base | `minY` exactly `0.0` |
| Triangles | ~500–3000 |
| Vertices | **Welded.** Merge duplicates before export; see below |
| Scale | Final game scale. Drop in at `scale: 1` |

**One mesh is a performance rule, not a style preference.** Three issues one
draw call per mesh. The first cow arrived as 31 meshes; at 38 spawned cows that
is ~1,178 draw calls for cattle alone on a phone.

**A model bound for an instanced prop must be one mesh AND one material.**
This is stricter than it sounds and it is not negotiable. Props that exist in
the dozens -- poles, street furniture -- are not cloned per instance; their
geometry is baked into a single `InstancedMesh` and drawn once for the whole
set. That path reads exactly one mesh and one material off the prototype and
silently ignores everything else, so a second mesh does not cost a draw call,
it simply does not appear. 117 poles as clones would be 234 draw calls against
the 1 they cost now.

Every model that has gone down this path so far happened to satisfy it. None
were asked to. If a model is destined for something there are more than a
handful of, say so in the request and check it before export.

**Budget triangles against the model's neighbours, not against the cap.** The
~500-3000 range above is a ceiling, not a target. `hart-barn` is 1,464
triangles because it was authored as a hero prop, and putting it on all
eighteen farm-belt lots cost 26,352 -- more than every piece of street
furniture in the game combined. It now stands on two lots and the rest of the
belt is 200-triangle houses. Background buildings live at 100-312 triangles
(`split-level-house` 100, `ranch-house` 200, `industrial-warehouse` 256,
`commercial-shop` 312); match that band unless the prop is a hero.

**Size the detail to how the camera sees it.** The follow rig sits 46 up and
108 back on the tornado, further on the other storms, so at fov 42 a prop
renders roughly 6.9 pixels per world unit. `fire-hydrant` was authored at 1.2
units -- 8 pixels on screen -- while costing 308 triangles an instance between
intact and wreck, more than a street lamp at 252 and a traffic signal at 300.
Thirty of them were a tenth of the frame for something no player can resolve,
and they are no longer placed. The models remain on disk against a future
closer camera. Check the pixel height before spending detail.

**An explicit material is mandatory.** A primitive with no material takes the
glTF *default*, and that default is `metallicFactor 1.0`. A fully metallic actor
with no environment reflection renders as dark grey sludge. The first cow shipped
this way and the vertex colours were invisible until metalness was zeroed.

**Weld vertices before export.** An unwelded mesh gives every triangle its own
three copies of position, normal and colour, which costs roughly 3.5x the bytes
for identical geometry and identical appearance.

Measured across the wreck models in this repo:

    model                 tris  verts  v/tri  bytes/tri
    water-tower-wreck     1056    562   0.53       28.2   welded
    grain-silo-wreck      1176    618   0.53       27.9   welded
    farm-windmill-wreck    600    342   0.57       30.1   welded
    courthouse-wreck       460   1380   3.00       98.7   unwelded
    foundry-wreck          980   2940   3.00       97.3   unwelded
    ferris-wheel-wreck    1296   3888   3.00       97.0   unwelded
    grandstand-wreck       432   1296   3.00       98.9   unwelded

Those four unwelded files are 309 KB; welded they would be about 89 KB. That is
215 KB of the ~2 MB budget spent on nothing.

**Self-check:** vertices divided by triangles. Around 0.5 is welded. Exactly
3.00 means no vertex sharing at all -- every triangle is standalone.

In trimesh, `mesh.merge_vertices()` before export. In Blender, Merge by Distance.
Do it as the last step before writing the `.glb`.

Flat shading is not a reason to skip it: `NORMAL` is per-vertex, so hard edges
still need split vertices at those edges specifically -- but a v/tri of exactly
3.00 means nothing anywhere is shared, which is not what flat shading requires.

**The world is not in metres.** Author against these, measured in-engine:

    house              9.5 x 17.7 x 11.5
    barn              24.7 x 19.3 x 19.9
    cow                3.4 x  4.4 x  6.16
    news van           4.0 x  5.6 x  7.4
    water tower       10.4 x 28.1 x 10.4

**Vertex colours, not textures.** The world is flat-shaded low-poly with solid
colour. PBR-textured imports read as objects from a different game, and cost
payload the budget does not have.

## Wreck models

An actor can have a collapse state at `<name>-wreck.glb`. It is optional --
without one, destruction falls back to the generic procedural ruin.

**Same footprint as the intact model.** Identical X and Z extents, base at
Y = 0, height roughly a third. The wreck must sit strictly inside the intact
model's footprint or it pops visually on destruction:

    water-tower        10.40 x 28.07 x 10.40
    water-tower-wreck  10.40 x  9.30 x 10.40

**Author intact + wreck as a pair, one commit per prop family.** For
destructible scenery, authoring the intact model without its wreck causes
visual pops or creates avoidable multi-agent handoff churn. Every destructible
prop family must commit its intact and wreck models together in a single
atomic commit along with `FILE_INVENTORY.txt`.

## Adding a model

1. Put `<name>.glb` in `assets/models/`.
2. `git ls-files --cached --others --exclude-standard | LC_ALL=C sort > FILE_INVENTORY.txt`
3. Commit **both in the same commit**.

That is the whole procedure for an actor. `scripts/build-web.mjs` discovers the
file, validates its `glTF` magic, copies it to `www/models/`, and records name,
size and SHA-256 in `www/build-info.json`. `scripts/verify-qa-package.mjs`
re-hashes each packaged model against that manifest. Both Android workflows
compare every `www/` file against the APK payload byte for byte.

### The rule that will bite you

**Any commit that adds or removes a tracked file must regenerate
`FILE_INVENTORY.txt` in that same commit.** `Tools/validate_project.py` compares
the checked-in inventory against the real tracked set, and it runs in CI on
every push and PR to `qa`. Every CI failure this project has seen traces to this.
The failure message now names the drift and prints the fix command.

## Using a model in gameplay

Landmarks are already wired. For anything else, the API is in
`MechanicsLab/SevereWeather_3D_Lab.html`:

| Symbol | Line | Purpose |
|---|---:|---|
| `loadActorModel(name)` | ~3612 | Fetch once, cache the prototype. Resolves `null` on failure, never rejects |
| `instantiateActorModel(name, opts)` | ~3654 | Clone per instance. `{ scale, rotationY, damageable }` |
| `buildActorMeshData(instance, spec)` | ~3702 | Present a model in the shape the damage system expects |
| `spawnActorChunks(target, count)` | ~3733 | Throw generic debris tinted to the actor |
| `CAMPAIGN_LANDMARK_MODELS` | ~2617 | Landmark kind -> model mapping |

**`damageable: true` matters.** `Object3D.clone()` reuses materials by reference.
That is right for 38 identical cows and wrong for anything the damage system
tints, because it mutates `material.color` in place -- without the flag, damaging
one water tower darkens every water tower. The flag clones materials per
instance; geometry stays shared either way.

**Every failure path resolves rather than rejects, and resolves `null`.** A
missing or corrupt model degrades to the procedural geometry the game already
draws. Callers should not need try/catch. `globalThis.__SW_ACTOR_MODELS__`
reports requested / loaded / failed, because a silent fallback is otherwise
invisible.

### Campaign landmarks

`CAMPAIGN_LANDMARK_MODELS` is keyed by landmark *kind*. All eight kinds are
mapped. Adding a model named after a kind is enough -- no code change.

The procedural body is built first and unconditionally, then replaced once the
model loads: landmark creation is synchronous, loading is not, and a landmark
that waited would be missing from the county for a frame or permanently.

The beacon is deliberately kept on every landmark. It is wayfinding, not
decoration -- how the player finds a landmark, and what flashes red on a hit.
Only the body is replaced.

## Hard rules

**Nothing that moves is ever harmed.** People are never harmed; cattle, media
crews, storm chasers and every future moving actor are invincible. Enforced in
`damageTarget`, the single point every hazard reaches a target through. See
`[SW:LAW:NO_HARM]` and the first-law section of `CURRENT_STATUS.md`. Do not add
a bypass. An actor that needs to be destructible is not a moving actor.

**Do not convert the Hart Farm barn to a single-mesh model.**
`setProductionBarnStage` is a four-stage hand-authored collapse across eleven
named parts -- doors swing, the roof peels one half at a time, walls lean then
detach in sequence. A single mesh cannot express it. `hart-barn.glb` exists and
matches the barn's dimensions and is still the wrong thing to use.

**Do not replace the generic houses with one model.** `createHouseMesh` builds
eight colour variants with size variation. One model makes every house identical.

## State

Payload is 1,114,024 bytes across 78 models -- 53% of the ~2 MB budget. All
78 models are 100% welded with merge-by-distance and normalized with base minY at
0.0000.

Live:
- All eight campaign landmark kinds, each with an intact model and wreck pair.
- All signature setpieces and props: gas station, carwash, substation, power pole,
  billboard, grain bin, propane tank, commercial shop, industrial warehouse,
  street lamp, traffic signal, pine tree, oak tree, and their matching wrecks.
- Modular residential houses: ranch-house, craftsman-house, split-level-house, and their matching wrecks.
- All 13 named comedy gag props (reusing ferris-wheel for the fairground ferris prop):
  - Yard: flamingo, trampoline, bbq-grill, rural-mailbox, and their wrecks.
  - Main Street: billboard, coffee-cup, inflatable-mascot, shopping-carts, and their wrecks.
  - County Fair: ferris-wheel, carousel, food-cart, giant-corndog, porta-potty, and their wrecks.
- Vehicles: news-van, storm-chaser-vehicle, town-car, pickup-truck, tractor.
- Special / Hero: cow-17 (wired exclusively to hero Cow 17 with damageable: false),
  hart-farmhouse (placed beside the Hart Farm signature barn).
- hart-barn stands on exactly two farm-belt lots; the other sixteen are
  ranch-house and craftsman-house. A barn is an outbuilding, and eighteen of the
  same one read as a repeated texture.
- Hart Farm signature barn preserves its authored multi-stage collapse across 14
  named parts, and is deliberately NOT model-backed: the stage code detaches
  roofLeft, frontWall and the doors by name, and a single-mesh model has none of
  them, so every stage would fire and nothing would move.
- fire-hydrant and fire-hydrant-wreck are authored and welded but deliberately
  not placed; see the camera-detail rule above.
- 100% vertex welding verified on all 78 models (including farm-windmill, hart-barn, hart-farmhouse).

Open work:

1. **Main-street commercial block.** Director's ask, and the next batch.
   - `grocery-store` + `grocery-store-wreck`. Low, wide, storefront band along
     the front, roof units on top. The **parking lot is not part of the model** --
     it is ground geometry and will be laid procedurally the way the roads are,
     so author the building only, footprint square to its lot.
   - `discount-store` + `discount-store-wreck`. Same silhouette family, smaller
     footprint. Keep the name and signage generic: no real chain's branding on a
     building the game exists to flatten.
   - Both in the 200-312 triangle band their main-street neighbours occupy. See
     the triangle-budget rule above; the barn is the cautionary tale.
2. `district-barn` + wreck, 200-300 triangles, ~12.0 x 8.8 footprint, if the two
   hero-detail barns now standing in the belt should come down to background
   cost. Optional -- two of them is affordable.
3. `hart-barn-wreck` does not exist, so a felled barn still drops into the
   generic ruin. Small, and the only wreck gap left in the library.
4. Power pole variants and wire tension (currently owned by Claude).

## Verifying a change

    pnpm run modern:build && node scripts/build-web.mjs
    python3 Tools/validate_project.py
    pnpm run verify:v510 && pnpm run verify:phase5
    pnpm test

Rendering can be checked headlessly with Playwright against
`http://127.0.0.1:8099` serving `www/`. Chromium is at
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. In-engine measurement beats
reading a viewer: `new THREE.Box3().setFromObject(o)` after
`scene.updateMatrixWorld(true)` -- without that update a freshly added object
still carries an identity matrix and measures as if at the origin.
