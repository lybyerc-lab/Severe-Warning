# Hero Slice 5: Rainbow Funnel + Cow-Level Easter Egg

## Source identity

- Parent candidate: Hero Slice 4
- Exact parent commit: `0c90db63b74523811f67379a6cc14896227073d5`
- Working branch: `agent/threejs-hero-slice5-rainbow-cow-level`
- Renderer: Three.js r128
- Scope: bounded presentation-only fun pass stacked on the accepted gameplay and Hero Slice 4 visual candidate.

## Requested direction

This pass implements two tester-facing requests without widening gameplay scope:

1. Make the tornado funnel unmistakably neon, rainbow, and spinning.
2. Hide a farm-land cow-level Easter egg around Hart Farm.

The result is intentionally more arcade and playful than the prior storm treatment. The gray Hero Slice 4 weather volume stays underneath as atmospheric depth, while the new rainbow shell and ribbons provide the loud silhouette.

## Rainbow funnel

The rainbow treatment is presentation-only and follows the authoritative storm position read-only.

- Two tapered vertex-colored rainbow shells rotate in opposite directions.
- Seven or more partial torus ribbons spin around the funnel with additive neon color cycling.
- One lightweight point glow cycles through the rainbow to sell the neon read.
- The legacy gray funnel is dimmed so it does not fight the new treatment.
- Hero Slice 4 smoke, dirt skirt, rain traces, collision truth, storm movement, and EF behavior remain untouched.

## Hart Farm cow-level Easter egg

The cow-level scene is a decorative secret near Hart Farm. It is **not a new campaign level**, does not add objectives, and does not modify the authoritative `animals` array.

The presentation-only scene contains:

- eight black-and-white cows arranged around a crop-circle ring;
- one gold champion cow at the center;
- a glowing ring that becomes more energetic when the storm is nearby;
- a `MOO LEVEL / AUTHORIZED BOVINES ONLY` sign;
- lightweight idle animation so discovery feels intentional instead of static clutter.

All Easter-egg meshes live under `SWVisualHeroSlice5CowLevel` and are deliberately separate from gameplay cows.

## Protected gameplay law

Hero Slice 5 must not change:

- steering or accepted camera/input feel;
- Pull, Gust, or Grid Zap behavior;
- score, combo, timer, rank, objectives, campaign progression, or warning stages;
- target health, damage stages, points, destruction authority, or collision truth;
- storm movement, storm position authority, EF scaling, or hazard logic;
- gameplay animal membership, airborne state, safety rules, or Cow17 behavior;
- lifecycle behavior or Android controls.

No runtime network assets are introduced.

## Evidence required before owner review

The candidate workflow must retain inherited regression gates and produce:

- `threejs-hero-slice5-rainbow-funnel.png`;
- `threejs-hero-slice5-cow-level.png`;
- `threejs-hero-slice5-report.json`;
- `threejs-hero-slice5-static-report.json`;
- inherited Hero Slice 4 browser evidence;
- same-runner Hero Slice 4 versus Hero Slice 5 performance evidence;
- a Pages-ready `web-preview`;
- Android debug packaging evidence.

The cow QA must prove the Easter-egg meshes do not overlap the authoritative gameplay animal array.

## Browser QA publishing

After the exact-source workflow is green and the screenshots are visually reviewed, the sealed `web-preview` artifact can become the root QA candidate at:

`https://lybyerc-lab.github.io/Severe-Warning/`

The Pages publisher should point at the exact successful artifact rather than rebuilding from a moving branch.

## Acceptance status

**NOT ACCEPTED.**

Green CI is necessary, but this pass still requires owner visual review in the browser. In particular, review whether the rainbow treatment reads as intentional neon rather than visual noise, whether the funnel remains readable at speed, and whether the cow-level secret is discoverable without taking over the Hart Farm hero composition.

No physical Galaxy S26 Ultra acceptance is claimed by this work.
