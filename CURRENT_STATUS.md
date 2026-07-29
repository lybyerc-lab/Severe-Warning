# Severe Weather Current Status

Last updated: 2026-07-24
Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`
Unity editor: `6000.3.0f1`
Primary target: Android

## Canonical memory order

1. Current repository code and physical-device evidence
2. This status file
3. `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
4. Current production documents in `Docs/`
5. `Docs/Archive/SEVERE_WEATHER_ALL_MARKDOWNS.md`
6. Frozen HTML Mechanics Laboratory

Important project decisions and test evidence must be committed to the repository. Chat is working context, not the durable source of truth.

## Tested baseline

- Initial production starter: `5188c78ba99bf8ff7935f583cad926a4107d0da5`
- Android startup hotfix: `23e638f5dbfb0522f512209fa636a17147c6c7d1`
- Build #3 mobile-input commit: `32ec421528e75632bae793ba0569c8770baa0d42`
- Build #4 feel/render commit: `91ee1a257bbe8e771d73097c9c4a3c781c53c225`
- Build #4.1 motion/silhouette commit: `96c9f780daf070648dc69a7f6cd431233b85617a`
- Build #4.2 camera/Supercell commit: `fd54c7c2b0764e8e4b301700caba997a27b08378`
- Build #5 staged-impact commit: `d0b7f15927c082b960c034ccc11ae7abaaaf63c3`
- Unity Build Automation is connected to GitHub `main` and builds with Unity `6000.3.0f1`.

## Build #5 physical evidence

Build #5 launched successfully on Android and displayed `B5 IMPACT + DESTRUCTION LAB` with version `0.1.7`.

Confirmed on the physical device:

- Tornado and Supercell movement, camera containment, storm switching, and abilities remained functional.
- The opaque blue Supercell precipitation cylinder was removed.
- Rain and hail streaks rendered beneath the Supercell.
- Hail target detection worked and reported six targets in the captured pass.
- Five-stage damage and recent material-stage telemetry worked.
- Crop and vegetation targets reached Critical state.

Build #5 failures:

- Crop roots rotated into repeated dark vertical slabs instead of lying downwind near the ground.
- The rectangular Hail Swath outline read as a debug selection box rather than weather.
- Generic radial line bursts did not communicate wood, glass, metal, vegetation, or masonry differently enough.
- Supercell cloud geometry obscured target reactions during attacks.
- Tornado ground contact and Supercell mist remained too solid and primitive.
- Transient effects had no explicit mobile object budget or device telemetry.

Build #5 passes the damage-system gate and fails the impact-readability gate.

## Active work: Build #5.1 impact readability laboratory

Approved scope:

- preserve Build #5 damage math, movement, camera behavior, storm speeds, targeting, and stage thresholds
- capture the most recent horizontal impulse direction for each target
- keep destroyed crops kinematic, ground-hugging, and aligned with storm direction
- delay vegetation Rigidbody release until Critical and clamp tree impulse to avoid weightless launches
- lighten stage color darkening so damaged vegetation does not become a black spike field
- replace the rectangular hail outline with bounded falling hail and ground impact fragments
- replace generic radial impact bursts with capped material-shaped temporary fragments
- cap transient effect roots and fragments and expose both counts in the HUD
- replace the Tornado orange contact disk with animated partial dust arcs
- increase Supercell rain density while replacing blue mist spheres with low-opacity ground arcs
- fade lower Supercell shelf-cloud layers during HAIL, FRONT, and GRID so affected targets remain readable
- add visual-only window, roof, door, crossarm, and crown stage reactions without persistent detached physics pieces
- bump application version to `0.1.8` and Android version code to `8`
- update repository memory in the same commit

Explicitly outside Build #5.1:

- a third storm
- missions, progression, economy, upgrades, or final menus
- final environment or storm art packs
- final audio
- authored fracture meshes and persistent destruction prefabs
- persistent detached roof, crown, or utility physics pieces
- a universal pooling framework
- authored URP pipeline migration
- asynchronous region generation
- people or casualty simulation

## Build #5.1 physical acceptance gate

1. Confirm `B5.1 IMPACT READABILITY LAB` and version `0.1.8` are visible.
2. Confirm Tornado and Supercell movement, speed, switching, and camera containment remain unchanged.
3. Destroy crops from multiple directions and confirm they remain close to the ground, point with the force, and do not form vertical black slabs.
4. Confirm trees lean and fall directionally without launching like light debris.
5. Hold HAIL and confirm no rectangular boundary appears.
6. Confirm HAIL reads as falling ice and ground impacts while still reporting correct target counts.
7. Confirm wood, glass, metal, vegetation, vehicle, infrastructure, and masonry hits produce visually distinct temporary fragments.
8. Confirm temporary fragments shrink and clear automatically.
9. Confirm HUD FX never exceeds `18` and FRAG never exceeds `42`.
10. Confirm the Tornado has partial dust arcs and no opaque orange ground disk.
11. Confirm the Supercell has denser rain, no blue mist spheres, and readable ground targets during HAIL, FRONT, and GRID.
12. Confirm windows disappear progressively and roof, door, crossarm, and crown pieces visibly shift at stage thresholds without becoming persistent physics clutter.
13. Run five minutes of repeated attacks and record FPS, heat, clutter, and any stutter.
14. Append the physical result to `Docs/DEVICE_TEST_LOG.md` before treating the gate as closed.

## Known open issues after Build #5.1

- Procedural primitives remain stand-ins for authored production assets.
- Visual-only component reactions are not final fracture behavior.
- The project still needs a committed authored URP asset strategy.
- Runtime region generation remains synchronous.
- Persistent authored Unity assets still require `.meta` migration.
- Final audio, fracture assets, broader pooling, profiling, and wider device coverage remain open gates.
