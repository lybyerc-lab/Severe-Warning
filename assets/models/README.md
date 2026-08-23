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
| Total payload | Keep all models combined under ~2 MB |

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
