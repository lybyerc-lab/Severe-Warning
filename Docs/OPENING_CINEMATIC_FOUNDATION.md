# Moo Brew Opening Cinematic Foundation

Task: `SW-CIN-002` acting polish over `SW-CIN-001`
Status: isolated presentation foundation; not integrated into production flow

## Purpose

`runtime/threejs-opening-cinematic-foundation.js` is a small Three.js actor kit for the fence/water-cooler heart of **Moo Brew Touchdown**. It must be mounted into an existing Three.js scene by a later integration task. It creates no `WebGLRenderer`, no scene, and no gameplay authority.

## Actor and prop kit

- **Cow 17:** upright bipedal rig with named hips, torso, head, ears, shoulders, forelegs, legs, tail, resting hoof, cup hoof, and readable `17` ear tag. Restrained front-facing black patches, a face patch, dark ears/horns, and hooves make the character read as Cow 17 at a glance. A flattened hoof contact pad visibly plants the lean on the upper fence rail, and a small visible thumb overlaps the cup.
- **Moo Brew cup:** lightweight cup body, lid, coffee surface, and a Three.js canvas-texture logo plane. `presentForCamera(camera)` keeps the logo available for the later exaggerated cup-drop composition.
- **Chickens:** two individually named lightweight rigs. The deterministic pose vocabulary covers idle pecks/head bobs, glances, startled anticipation, and a reserved scatter transition.
- **Fence:** three-post, two-rail authored composition. It only establishes cinematic staging; it does not touch farm-fence gameplay authority.

## Timeline and deterministic framing

The 12-second data-driven preview contains `fence-conversation`, `first-chicken-noticing`, `cow-delayed-turn`, `double-take`, `last-sip-setup`, and `escape-transition`. The three required QA frames are described in the runtime's `SHOTS` data and can be applied to a caller-provided camera. The relaxed frame holds a settled lean and conversational head turn; the double take shifts hips, torso, head, ears, legs, tail, and chicken wings; the last sip bends the cup arm and brings the cup visibly toward the muzzle.

The browser QA extracts the repository's local inlined Three.js r128 source into a temporary QA-only harness, then renders the mounted actor kit with a small test scene and camera. This permits deterministic frame capture without modifying or wiring any production runtime. The foundation API itself still requires a caller-provided existing scene for production integration and does not create a renderer or scene.

## Mobile-cost telemetry

`getSnapshot().budget` exposes deterministic root object, mesh, and distinct-material counts. SW-CIN-002's browser QA enforces the Issue #51 guard of no more than 66 meshes and 17 materials from the SW-CIN-001 baseline of 57 meshes and 15 materials. This is a transparent first-pass cost indicator, not device performance acceptance.

## Deferred integration

The next cinematic task must decide how this actor kit is mounted at the real farm anchor, connect the newspaper/weather/radio/barn/tornado beats, add cup-drop and chicken-scatter motion, design skip/replay flow, and perform the seamless gameplay handoff. It must not start the warning clock until that later handoff.
