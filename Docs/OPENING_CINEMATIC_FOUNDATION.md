# Moo Brew Opening Cinematic Foundation

Task: `SW-CIN-003` playable integration over `SW-CIN-002`
Status: integrated into the production Three.js world; browser-QA candidate, not owner accepted

## Purpose

`runtime/threejs-opening-cinematic-foundation.js` is a small Three.js actor kit for the fence/water-cooler heart of **Moo Brew Touchdown**. `runtime/threejs-opening-cinematic-integration.js` mounts it into the existing production scene at the Hart Farm apron. Neither runtime creates a `WebGLRenderer`, a scene, or gameplay authority.

## Actor and prop kit

- **Cow 17:** upright bipedal rig with named hips, torso, head, ears, shoulders, forelegs, legs, tail, resting hoof, cup hoof, and readable `17` ear tag. Restrained front-facing black patches, a face patch, dark ears/horns, and hooves make the character read as Cow 17 at a glance. A flattened hoof contact pad visibly plants the lean on the upper fence rail, and a small visible thumb overlaps the cup.
- **Moo Brew cup:** lightweight cup body, lid, coffee surface, and a Three.js canvas-texture logo plane. `presentForCamera(camera)` keeps the logo available for the later exaggerated cup-drop composition.
- **Chickens:** two individually named lightweight rigs. The deterministic pose vocabulary covers idle pecks/head bobs, glances, startled anticipation, and a reserved scatter transition.
- **Fence:** three-post, two-rail authored composition. It only establishes cinematic staging; it does not touch farm-fence gameplay authority.

## Timeline and deterministic framing

The 12.4-second playable sequence is `0.0–1.35 newspaper/farm reveal`, `1.35–5.9 fence conversation and escalating weather`, `5.9–8.15 delayed double take`, `8.15–10.15 final sip`, and `10.15–12.4 cup plink, chicken panic, Cow 17 escape, roof peel, touchdown, and handoff`. The relaxed frame holds a settled lean and conversational head turn; the double take shifts hips, torso, head, ears, legs, tail, and chicken wings; the last sip bends the cup arm and brings the cup visibly toward the muzzle.

The browser QA extracts the repository's local inlined Three.js r128 source into a temporary QA-only harness, then renders the mounted actor kit with a small test scene and camera. This permits deterministic frame capture without modifying or wiring any production runtime. The foundation API itself still requires a caller-provided existing scene for production integration and does not create a renderer or scene.

## Mobile-cost telemetry

`getSnapshot().budget` exposes deterministic root object, mesh, and distinct-material counts. SW-CIN-002's browser QA enforces the Issue #51 guard of no more than 66 meshes and 17 materials from the SW-CIN-001 baseline of 57 meshes and 15 materials. This is a transparent first-pass cost indicator, not device performance acceptance.

## Playable lifecycle

The cinematic temporarily owns only camera, presentation actors, and HUD visibility. `runActive` is false from cinematic start until handoff, so the warning clock remains at 3:00. Natural completion marks the viewing seen; later runs may use Escape to skip, with both paths disposing the cinematic roots, restoring presentation state and HUD, and resuming normal gameplay without a second scene or renderer. Reset/retry remounts a fresh actor set.

## Deferred integration

Owner browser playtest remains the acceptance gate. Audio polish, final character-animation quality, and any later replay/skip UX refinement must preserve the same timer, input, renderer, and scene contract.
