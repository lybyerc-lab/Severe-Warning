# Visual Asset Pipeline

## Universal GLB contract

- Units: meters; `1.0` scene unit equals one meter.
- Coordinates: right-handed, Y up. Forward is local `-Z` after import normalization.
- Origin: ground contact centered under the primary mass unless a category contract says otherwise.
- Pivot: physically meaningful hinge/rotation point; never an arbitrary exporter origin.
- Names: lowercase kebab-case asset IDs; node and mesh suffixes described below.
- Materials: `mat-{family}-{variant}` where family is wood, roofing, sheet-metal, masonry, concrete, glass, utility, vehicle, foliage, or hay.
- Textures: `{asset}-{material}-{channel}-{size}` with base-color, normal, orm, emissive; power-of-two dimensions; KTX2-ready source retained.
- Animations: `anim-{action}-{variant}`; deterministic start/end poses and no gameplay root motion unless explicitly contracted.
- Damage nodes: `damage-intact`, `damage-damaged`, `damage-exposed`, `damage-partial-collapse`, `damage-wreckage`.
- LOD nodes: `lod0`, `lod1`, `lod2`, `lod3`; lowest LOD must preserve the gameplay silhouette.
- Collision: `collision-{purpose}`; primitive proxies preferred and non-rendering.
- Debris sockets: `socket-debris-{material}-{nn}` with outward local direction.
- Shadows: asset metadata declares cast/receive defaults; alpha-tested foliage needs a mobile fallback.
- Metadata: asset ID, semantic category, version, author, source, license/SPDX identifier, modification record, units, forward axis, bounds, triangles by LOD, textures, animations, materials, collision, and fallback.
- License: every asset has a repository-side license record before entering the lab. “Found online” is not a license.

## Provisional budgets by asset

| Asset | LOD0 triangles | LOD2 triangles | Texture cap | Required contract |
|---|---:|---:|---:|---|
| Cow | 12k | 1.8k | 2×1024 | Cow 17 tag, hide variants, 12-state animation set, safe collision |
| Barn | 18k | 3k | 3×1024 | five authored damage groups, large debris sockets |
| House | 12k | 2k | 2×1024 | intact/damaged/exposed/wreckage |
| Commercial | 16k | 2.5k | 2×1024 | sign socket, glass material separation |
| Silo | 8k | 1.2k | 1×1024 | sheet-metal family, dent/collapse states |
| Utility pole | 4k | 600 | 1×512 | wire/insulator sockets, conductive metadata |
| News van | 14k | 2.2k | 2×1024 | Moo Brew/station decal variants, dish/camera pivots |
| Landmark | 24k | 4k | 3×1024 | damage groups and stable silhouette |
| Tree | 7k | 700 | 1×1024 | trunk/canopy separation, bend pivot, billboard fallback |
| Tractor | 12k | 1.8k | 2×1024 | wheel pivots and vehicle material family |
| Hay bale | 3k | 450 | 1×512 | soft-landing metadata and collision proxy |
| Road module | 2k | 300 | 1×1024 atlas | snap sockets, lane direction, shoulder bounds |

## Category details

- **Cow:** torso/shoulder/hip weight must read at gameplay distance. Head, ears, muzzle, legs, hooves, tail, and tag remain distinct through LOD1. No injury animation or target metadata.
- **Barn/buildings:** damage states are authored alternate groups, not runtime boolean-cut geometry. Interiors and framing must exist before collapse.
- **Utility:** wire sockets have stable order and voltage/network identifiers supplied by gameplay snapshots.
- **Vehicles:** wheels, camera, dish, and doors have named pivots. Media assets are protected observers.
- **Vegetation:** bend pivot is at root; wind animation must work without a skeleton at low tier.
- **Road:** modules provide connectivity metadata; visual assets do not decide legal vehicle routes.

## Validation checklist

1. GLB opens offline with no external URI.
2. Scale, axes, forward direction, ground contact, and pivot match contract.
3. Names are unique and stable.
4. Triangle/texture budgets are recorded for every LOD.
5. Materials map to approved families and avoid accidental duplicates.
6. Damage, animation, collision, socket, and fallback nodes exist as required.
7. No unsupported extension is the only rendering path.
8. Shadow and alpha behavior pass Low and Balanced tiers.
9. License/source/modification record is complete.
10. Asset loads, unloads, reloads, and disposes without resource growth.
11. Normal gameplay camera preserves silhouette and semantic readability.
12. Safe-animal and protected-media invariants are present where applicable.

