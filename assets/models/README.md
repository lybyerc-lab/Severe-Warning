# Actor and scenery models

Drop Blender-authored `.glb` files in this directory. `scripts/build-web.mjs`
discovers them automatically — there is no list to update. They are copied to
`www/models/`, hashed into `www/build-info.json`, verified by
`scripts/verify-qa-package.mjs`, and checked byte-for-byte into the APK payload
by the Android workflows.

An empty directory is a valid state. Anything the loader cannot find falls back
to the procedural geometry the game already builds, so a missing model never
leaves a hole in the world.

## Export requirements

| | |
|---|---|
| Format | glTF 2.0 **binary** (`.glb`), one file per actor, textures embedded |
| Compression | **None.** No Draco, no Meshopt, no KTX2 |
| Axes | Y-up, metres, −Z forward, origin at the base/feet |
| Materials | glTF PBR metallic-roughness. Vertex colours or flat untextured strongly preferred |
| Triangles | ~1–3k per actor |
| Total payload | Keep all models combined under **4 MB** (see below) |

### Where the 4 MB comes from

The old number was ~2 MB and nothing in this repository ever said why. It was
raised to 4 MB on 2026-08-28 after measuring what the payload actually costs,
because a cap nobody can derive is a cap nobody can argue with.

At today's 128 models / 2,248,570 bytes of raw `.glb`:

| cost | measured |
|---|---|
| Added to the APK | **489 KB** -- assets are DEFLATE'd into the zip, so raw bytes are not install bytes |
| Over the wire, gzipped | **407 KB** (18% of raw) |
| JS heap, all 128 resident at once | **5.0 MB** |
| Geometry, all 128 | 41,386 vertices / 45,736 triangles |
| Parse time, all 128 | 2.03 s under software rendering; a real scene loads ~52 |

Uncompressed float32 vertex data with no textures compresses about 5.5x, so the
raw figure overstates every cost that actually matters by roughly that factor.
4 MB of raw `.glb` is under 1 MB of install and under 10 MB of heap -- both
comfortably inside a phone's budget, which is why the number moved rather than
the library being cut.

**Raw bytes are still the number to check** (`du -sb assets/models`) because it
is the one anybody can measure in a second. It is a proxy, not the constraint.
The real constraint is triangles drawn in one scene, and if that ever becomes
the binding limit this table should be replaced rather than raised again.

**Compression is a hard constraint, not a preference.** The renderer is three.js
r128 with only `GLTFLoader` vendored (`vendor/three-gltfloader-r128.js`).
`DRACOLoader`, `KTX2Loader` and `MeshoptDecoder` are not present, and Draco
additionally needs a WASM blob. A compressed `.glb` will fail to load.

**Why untextured is preferred:** the existing world is flat-shaded low-poly with
solid colours, drawn from procedural geometry. PBR-textured imports read as
objects from a different game. Vertex-coloured low-poly sits in the existing look
and costs no texture payload.

**Why the size budget is what it is:** the signed APK is about 5 MB and `www/` is
3 MB of that. Textured models grow it quickly, and this ships as one offline
package — nothing streams.

## Checks that will reject a bad file

- `build-web.mjs` fails the build if a `.glb` does not begin with the `glTF`
  magic bytes, which catches a truncated or mis-exported file at build time
  rather than as an actor that never appears on a device.
- `verify-qa-package.mjs` re-hashes each packaged model against the manifest.
- The Android workflows compare every `www/` file against the APK payload.
