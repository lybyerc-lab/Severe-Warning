# Moo Brew Opening Cinematic Foundation

Task: `SW-CIN-001`
Status: isolated presentation foundation; not integrated into production flow

## Purpose

`runtime/threejs-opening-cinematic-foundation.js` is a small Three.js actor kit for the fence/water-cooler heart of **Moo Brew Touchdown**. It must be mounted into an existing Three.js scene by a later integration task. It creates no `WebGLRenderer`, no scene, and no gameplay authority.

## Actor and prop kit

- **Cow 17:** upright bipedal rig with named hips, torso, head, ears, shoulders, forelegs, legs, tail, resting hoof, cup hoof, and readable `17` ear tag. Pose controls cover relaxed weight, fence lean, sip, head/ear reaction, slow double take, and reserved escape transition.
- **Moo Brew cup:** lightweight cup body, lid, coffee surface, and a Three.js canvas-texture logo plane. `presentForCamera(camera)` keeps the logo available for the later exaggerated cup-drop composition.
- **Chickens:** two individually named lightweight rigs. The deterministic pose vocabulary covers idle pecks/head bobs, glances, startled anticipation, and a reserved scatter transition.
- **Fence:** three-post, two-rail authored composition. It only establishes cinematic staging; it does not touch farm-fence gameplay authority.

## Timeline and deterministic framing

The 12-second data-driven preview contains `fence-conversation`, `first-chicken-noticing`, `cow-delayed-turn`, `double-take`, `last-sip-setup`, and `escape-transition`. The three required QA frames are described in the runtime's `SHOTS` data and can be applied to a caller-provided camera.

The browser QA extracts the repository's local inlined Three.js r128 source into a temporary QA-only harness, then renders the mounted actor kit with a small test scene and camera. This permits deterministic frame capture without modifying or wiring any production runtime. The foundation API itself still requires a caller-provided existing scene for production integration and does not create a renderer or scene.

## Mobile-cost telemetry

`getSnapshot().budget` exposes deterministic root object, mesh, and distinct-material counts. This is a transparent first-pass cost indicator, not device performance acceptance.

## Deferred integration

The next cinematic task must decide how this actor kit is mounted at the real farm anchor, connect the newspaper/weather/radio/barn/tornado beats, add cup-drop and chicken-scatter motion, design skip/replay flow, and perform the seamless gameplay handoff. It must not start the warning clock until that later handoff.
