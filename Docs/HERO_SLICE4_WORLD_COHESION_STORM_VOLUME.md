# Hero Slice 4: World Cohesion + Storm Volume

Date: 2026-08-08
Status: **CANDIDATE / NOT ACCEPTED**
Branch: `agent/threejs-hero-slice4-world-cohesion-storm-volume`
Parent visual evidence source: `9515a3a5cc0ff04e1e4f95ff55b4a319aaa3602c` (sealed Three.js visual-production Run #5)
Frozen gameplay/fun reference: `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`
Sealed Stage 1 reference: `f2060dff08ddb9df9f90ecd245940d8db86c7266`

## Purpose

Hero Slice 4 is a bounded Stage 2A visual candidate. It attacks the specific Run #5 visual gaps without widening unfinished art across the full game and without changing gameplay authority.

The approved direction for this pass is:

- make the Prairie Junction acceptance neighborhood feel like an authored street rather than a finished storefront surrounded by blockout boxes;
- improve transitions between asphalt, sidewalk, shoulder, verge, farm apron, and track so the world stops reading as flat slabs laid on a tabletop;
- replace the clearly faceted tornado presentation with layered weather volume, vapor breakup, ground grit, and rain streaks while preserving the existing tornado executor and collision truth;
- add deterministic pristine, storm-volume, and staged-damage evidence before asking to widen the art conversion.

## Protected gameplay law

This milestone may not retune or replace:

- storm steering or forward movement;
- Pull, Gust, or Grid Zap;
- natural storm-contact destruction authority;
- target health, score, combo, warning clock, stages, campaign, or persistence;
- safe-animal behavior;
- gameplay camera feel or Android landscape controls;
- pause/reset/lifecycle behavior.

`runtime/threejs-visual-hero-slice4.js` is a presentation layer. Static verification rejects writes to protected target/global/storm authority fields.

## Visual implementation

### World cohesion

The pass adds a presentation-only facade kit to a bounded set of nearby secondary buildings around the authored Prairie Supply storefront. It adds cornices, windows, canopies/sign forms, posts, and metal rhythm where appropriate. These pieces are parented to existing presentation groups and do not join `damageParts` or change target collision/health truth.

Ground transition strips are added around the representative storefront and Hart Farm acceptance areas to soften hard rectangular pad boundaries and strengthen roadside/farm-edge relationships.

### Storm volume

The existing tornado meshes remain the gameplay-linked storm presentation anchor. Hero Slice 4 only tunes their visual materials and adds a presentation-only volume shell composed of:

- layered translucent condensation shells;
- mobile-bounded vapor wisps;
- an irregular dust/grit ground skirt;
- sparse rain/gust trace cards.

The new shell follows `storm.pos` read-only. It never moves the authoritative storm.

## External VFX candidate lane

The candidate uses only the already reviewed Kenney Particle Pack subset from `assets/production/asset-provenance.json`:

- `dirt_01.png` for ground grit/dust;
- `smoke_03.png` for condensation/vapor;
- `trace_03.png` for rain/gust streaks.

Upstream repository: `Calinou/kenney-particle-pack`  
Pinned upstream commit: `ab7086639ee73be31abd87feb21bf1402d4e8144`  
License: CC0-1.0

`scripts/vendor-threejs-hero-slice4-assets.mjs` fetches those exact pinned files during candidate construction, verifies each Git blob SHA before use, writes local packaged copies under `assets/production/vfx/kenney/`, and records local SHA-256 evidence in `checksums.json`.

This is **candidate vendoring**, not production approval. `asset-provenance.json` intentionally keeps `productionImports` empty until the visual candidate passes its objective gates and owner visual review.

Production runtime still has no network dependency. `scripts/build-web.mjs` packages `assets/production/` locally into the browser and Capacitor output.

## Evidence required before owner review

The candidate workflow must retain inherited regression gates and produce:

- `threejs-hero-slice4-pristine-street.png`;
- `threejs-hero-slice4-storm-volume.png`;
- `threejs-hero-slice4-damaged-storefront.png`;
- `threejs-hero-slice4-report.json`;
- `threejs-hero-slice4-static-report.json`;
- VFX `checksums.json`;
- same-runner performance comparison against sealed Run #5;
- Android debug APK packaging evidence.

The staged-damage screenshot uses the game's real `damageTarget(...)` executor on the authored storefront in a disposable QA page. It must reach a non-destroyed damage stage and expose/remove authored structure anatomy. The QA script must not directly write target health or damage-stage fields.

## Acceptance boundary

A green workflow only makes this a reviewable candidate. It does **not** mean the art is accepted.

Before this pass can become the new visual yardstick, owner visual review still needs to answer yes to the important comparisons:

- Does Prairie Junction feel more authored and less like blockout geometry?
- Are road/ground transitions more natural without reducing gameplay readability?
- Does the tornado read as turbulent weather before it reads as a mesh?
- Do VFX add scale without hiding steering?
- Does the damage view expose believable structure anatomy?
- Is the game still at least as fun and controllable as the frozen Three.js reference?

Galaxy S26 Ultra physical acceptance remains a later Android authority. This candidate must not be described as physically accepted from CI, browser evidence, or APK packaging alone.
