# Hero Slice 5: Rainbow Funnel + Cow-Level Easter Egg

## Source identity

- Parent candidate: Hero Slice 4
- Exact parent commit: `0c90db63b74523811f67379a6cc14896227073d5`
- Working branch: `agent/threejs-hero-slice5-rainbow-cow-level`
- Renderer: Three.js r128
- Scope: bounded presentation-only fun pass stacked on the accepted gameplay and Hero Slice 4 visual candidate.

## Requested direction

This pass implements two tester-facing requests without widening gameplay scope:

1. When the player chooses the **existing Neon Funnel menu selection**, make the tornado funnel unmistakably neon, rainbow, and spinning. When Neon is not selected, preserve the default Hero Slice 4 storm presentation.
2. Hide a farm-land cow-level Easter egg around Hart Farm.

The cow secret is independent of the Neon selection. The rainbow treatment is a player-selected cosmetic, not the permanent tornado art direction.

## Neon menu gate

The game already owns the cosmetic choice through its existing `NEON FUNNEL: ON/OFF` menu flow. Hero Slice 5 does not create a second setting.

- `toggleNeonCosmetic()` remains the canonical menu executor.
- `neonFunnelUnlocked` is read as the existing selected/equipped state.
- Hero Slice 5 never assigns, unlocks, persists, or silently enables that state.
- With Neon OFF, the rainbow root, shells, ribbons, and glow must be absent and the Hero Slice 4 funnel/material treatment must be restored.
- With Neon ON, the rainbow presentation may mount and animate while the Hero Slice 4 smoke, dirt, rain, movement, collision, and EF truth continue underneath.
- Switching Neon OFF again must remove the rainbow presentation cleanly without reloading the level.

The name `neonFunnelUnlocked` is inherited from the existing game code. Despite that legacy name, the menu toggles the same boolean and displays `NEON FUNNEL: ON/OFF`, so this pass treats it only as read-only player-selection truth.

## Rainbow funnel

The selected Neon treatment is presentation-only and follows the authoritative storm position read-only.

- Two tapered vertex-colored rainbow shells rotate in opposite directions.
- Seven or more partial torus ribbons spin around the funnel with neon color cycling.
- One lightweight point glow cycles through the rainbow to sell the neon read.
- The legacy gray funnel is dimmed only while Neon is selected so it does not fight the rainbow treatment.
- Hero Slice 4 smoke, dirt skirt, rain traces, collision truth, storm movement, and EF behavior remain untouched.

### Run #3 visual review correction

Run #3 proved the menu gate and regressions, but its captured Neon frame was visually overexposed. The two additive shells, bright ribbons, cycling legacy funnel, and point glow stacked into a mostly white cone. That candidate is not promotable.

The correction layer `THREEJS_VISUAL_HERO_SLICE5_POLISH_V1` keeps the requested arcade effect while reducing the whiteout risk:

- rainbow shells use normal alpha blending rather than additive blending;
- shell opacity is capped at a low presentation range;
- ribbons remain additive, but at a much lower opacity so their individual rainbow bands remain readable;
- the point glow is reduced to an accent instead of a flood light;
- the underlying funnel remains dark enough to hold a tornado silhouette while still cycling subtle color.

The selected-Neon screenshot must still be visually inspected. Numeric opacity gates are guardrails, not proof of beauty.

## Hart Farm cow-level Easter egg

The cow-level scene is a decorative secret near Hart Farm. It is **not a new campaign level**, does not add objectives, and does not modify the authoritative `animals` array.

The presentation-only scene contains:

- eight black-and-white cows arranged around a crop-circle ring;
- one gold champion cow at the center;
- a glowing ring that becomes more energetic when the storm is nearby;
- a `MOO LEVEL / AUTHORIZED BOVINES ONLY` sign;
- lightweight idle animation so discovery feels intentional instead of static clutter.

All Easter-egg meshes live under `SWVisualHeroSlice5CowLevel` and are deliberately separate from gameplay cows. The secret must remain present whether Neon is selected or not.

### Cow-secret presentation budget

Run #3 also showed that the inherited farm QA camera did not actually frame the secret, and the first cow anatomy used roughly twice as many individual meshes as needed.

The correction therefore:

- adds a dedicated `cow-level` QA camera aimed at the ring, champion cow, surrounding cows, and sign;
- consolidates repeated legs, spots, and horns with `THREE.InstancedMesh` while preserving the nine-cow composition;
- enforces a **55-mesh maximum** for the entire cow-secret root in browser QA;
- keeps the cow-secret root hidden from rendering when the storm is far away, except during the dedicated QA view;
- retains the existing proof that no Easter-egg mesh enters the authoritative gameplay `animals` array.

The optimization is presentation-only. It does not reduce or change gameplay cows, Cow17, animal safety, objectives, or collision authority.

## Protected gameplay law

Hero Slice 5 must not change:

- steering or accepted camera/input feel;
- Pull, Gust, or Grid Zap behavior;
- score, combo, timer, rank, objectives, campaign progression, or warning stages;
- target health, damage stages, points, destruction authority, or collision truth;
- storm movement, storm position authority, EF scaling, or hazard logic;
- gameplay animal membership, airborne state, safety rules, or Cow17 behavior;
- lifecycle behavior or Android controls;
- the existing Neon selection/unlock/persistence authority.

No runtime network assets are introduced.

## Evidence required before owner review

The candidate workflow must retain inherited regression gates and produce:

- `threejs-hero-slice5-default-storm.png`, proving the rainbow is absent with Neon OFF;
- `threejs-hero-slice5-rainbow-funnel.png`, captured only after QA uses the real `toggleNeonCosmetic()` menu executor to select Neon;
- `threejs-hero-slice5-cow-level.png`, captured through the dedicated cow-secret camera;
- `threejs-hero-slice5-report.json` with deterministic OFF -> ON -> OFF assertions, Neon exposure bounds, cow framing, and the 55-mesh budget;
- `threejs-hero-slice5-static-report.json` proving the visual gate never writes `neonFunnelUnlocked` and the polish layer remains presentation-only;
- inherited Hero Slice 4 browser evidence;
- same-runner Hero Slice 4 versus Hero Slice 5 performance evidence;
- a Pages-ready `web-preview`;
- Android debug packaging evidence.

The cow QA must prove the Easter-egg meshes do not overlap the authoritative gameplay animal array and do not force the Neon cosmetic ON.

## Browser QA publishing

After the exact-source workflow is green and the screenshots are visually reviewed, the sealed `web-preview` artifact can become the root QA candidate at:

`https://lybyerc-lab.github.io/Severe-Warning/`

The Pages publisher should point at the exact successful artifact rather than rebuilding from a moving branch.

## Acceptance status

**NOT ACCEPTED.**

Green CI is necessary, but this pass still requires owner visual review in the browser. Review both sides of the player choice: the default storm must still look like Hero Slice 4 with Neon OFF, while the selected Neon mode should read as an intentional arcade cosmetic rather than a white cone. The dedicated cow-level frame must clearly show the ring, surrounding cows, gold champion, and sign without taking over normal Hart Farm play.

No physical Galaxy S26 Ultra acceptance is claimed by this work.
