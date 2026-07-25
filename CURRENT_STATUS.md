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
- Build #5.1 impact-readability commit: `7695875effea2dafb8bb8c1e6519f1b9181b1587`
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

## Build #5.1 physical evidence

Build #5.1 compiled successfully and launched on Android at approximately 60 FPS in the supplied screenshots.

Confirmed:

- the blue HAIL rectangle was removed
- the orange Tornado ground disk was removed
- effects and fragments remained under the `18` and `42` caps in the captured frames
- trees, utility pieces, roof pieces, and props reacted directionally
- crops no longer formed the vertical black spike field
- Supercell rain and hail rendered while target counts remained functional

Remaining failures:

- the Supercell left a large dark triangular TrailRenderer wedge
- looping ground-mist and hail lines read as tangled blue debug scribbles
- Tornado PULL still used a giant pale boundary ring and dark center rings
- flattened crops read as scattered orange boards rather than row-oriented storm damage
- the supplied session did not include the required five-minute stress test
- the cloud log reported deprecated `Rigidbody.drag` and `Rigidbody.angularDrag` calls

Build #5.1 passes the mechanical impact-reaction gate and fails the final ability-feedback presentation gate.

## Active work: Build #5.2 ability feedback cleanup

Branch: `agent/build5-2-ability-feedback-cleanup`

Locked scope:

- preserve movement, camera containment, storm speeds, targeting, damage thresholds, and effect caps
- remove the Supercell TrailRenderer wedge
- suppress oversized `Storm Ring` and `Storm Swath` debug geometry
- disable looping ground-mist scribbles while retaining rain and hail weather cues
- reduce Tornado contact arcs to subtle low-alpha dust motion
- keep flattened crops thin, darkened, row-oriented, and visually grouped
- thin a bounded portion of destroyed crop renderers and cull distant flattened crops
- add elapsed cleanup time and crop-management telemetry for the five-minute test
- replace deprecated `Rigidbody.drag` and `Rigidbody.angularDrag` with Unity 6 `linearDamping` and `angularDamping`
- advance application version to `0.1.9`, build label to `5.2`, and Android version code to `9`

Current implementation state:

- temporary self-editing GitHub Action removed after verification showed it never ran
- Build #5.2 runtime presentation governor added
- build identity, Android version code, and HUD label advanced
- Unity 6 damping API corrections committed
- file inventory includes the new runtime source
- `main` remains untouched

## Build #5.2 physical acceptance gate

1. Confirm `B5.2 ABILITY FEEDBACK CLEANUP` and version `0.1.9` are visible.
2. Confirm Tornado and Supercell movement, speed, switching, targeting, and camera containment are unchanged.
3. Confirm no dark triangular trail follows the Supercell.
4. Confirm HAIL has falling streaks and localized impacts without looping blue ground scribbles or a rectangle.
5. Confirm Tornado PULL has no giant pale boundary ring dominating the town.
6. Confirm flattened crops stay low, darkened, and broadly aligned with their rows rather than reading as loose boards.
7. Confirm FX never exceeds `18` and FRAG never exceeds `42`.
8. Run repeated destruction until `CLEANUP T+300s` or greater is shown.
9. Confirm effect and fragment counts fall after attacks rather than remaining pinned at their caps.
10. Record FPS, heat, clutter, and stutter after the five-minute run.
11. Append the physical result to `Docs/DEVICE_TEST_LOG.md` before treating Build #5.2 as passed.

## Known open issues after Build #5.2

- Procedural primitives remain stand-ins for authored production assets.
- Visual-only component reactions are not final fracture behavior.
- The project still needs a committed authored URP asset strategy.
- Runtime region generation remains synchronous.
- Persistent authored Unity assets still require `.meta` migration.
- Final audio, fracture assets, broader pooling, profiling, and wider device coverage remain open gates.
