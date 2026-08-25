# Severe Warning — backlog

The living list. **This file is the source of truth**, not a chat message and not
a published board. It lives in the repo so it survives container rewinds, agent
handoffs and the gap between sessions, and so AG can read it without being told
what is in it.

Rules for keeping it alive:

- Update it **in the same commit** as the work it describes. A backlog updated
  later is a backlog that is already wrong.
- Move things to **Landed** rather than deleting them. The record of why
  something was done is worth more than a short file.
- **Parked** is not a graveyard. Anything there must say exactly where the work
  lives, so picking it back up is a lookup and not an excavation.
- Numbers in here are measured, not estimated. If a figure cannot be measured
  right now, say so instead of guessing.

State at last update: 103 models, 1.20 MB of the ~2 MB budget (60%). 3 branches,
0 open PRs, 127 archive tags. `qa` is the default and the working branch.

---

## Next up — AG (assets)

All current batch requests completed. Open for next director requests.

## Next up — Code & Modernization

1. **County Micro-Dressing.** Place `rural-mailbox` props at driveway heads, fairgrounds split-rail fencing, and industrial rail spur tracks.
2. **Phase 6 HUD / UI TypeScript modularization.** Type-safe HUD overlays and campaign transitions.

Nothing else is queued. Say the word and this fills up.

## Decisions open

Nothing blocking. The board is clear.

---

## Parked — do not lose, not being worked

- **MOO-LAH — storm currency, upgrades and skins.**
  Lives at tag `archive/agent/sw-rpg-001-moolah-storm-triangle`, commit
  `ce1e47c`. 423 lines: a runtime module, a QA script, a verify script, wired
  to the persistent scorekeeper.
  **Catch:** it predates the patch-chain flattening, so it sits in `runtime/`
  behind an `apply-*.mjs`. Reviving it means porting into the inlined game, not
  checking the branch out. Budget for that, not for a merge.
  The name is reserved: nothing else in the game may be called MOO-LAH, which
  is why the discount store is UDDER VALUE.

- **`fire-hydrant`, `fire-hydrant-wreck`.** Authored, welded, deliberately not
  placed. They render 5–8 pixels tall at the game's own cameras while costing
  308 triangles an instance, more than a street lamp at 252 or a signal at 300.
  Worth reviving only if the camera ever moves closer.

- **`hart-barn`, `hart-barn-wreck`.** The hero Hart Farm barn's likeness, and
  the hero barn does not want a model — see Standing rules. Keep as reference
  or retire; do not wire.

---

## Standing rules — settled, do not relitigate

- **First law: nothing that moves is ever harmed.** Enforced at `damageTarget`,
  which is the single chokepoint every hazard reaches a target through.
  The dealership draws the line precisely: **a car with a driver is a protected
  actor; a car parked on a lot is inventory.** Town cars drive, so the storm
  cannot touch them. Lot cars do not, so it can.

- **The hero Hart Farm barn is not model-backed, deliberately.** Its collapse
  detaches `roofLeft`, `frontWall`, the ridge and both doors **by name** across
  four stages. Point a single-mesh model at it and every stage fires, every
  point is awarded, every gag toast prints, and nothing moves on screen.

- **FRAMING keeps its toggle.** STORM is the better view and CLASSIC stays
  available; people like different views.

- **Export contract lives in `Docs/GLB_PIPELINE_HANDOFF.md`**, including the
  three rules that cost us a round each to learn: one mesh and one material for
  anything instanced, triangles budgeted against a model's neighbours rather
  than the cap, and near-neutral `COLOR_0` on anything that stands on many lots.

- **The build refuses to ship a model batch that cannot load.** Two guards in
  `scripts/build-web.mjs`, both added because the failure they catch is silent:
  a `.glb` anywhere but `assets/models` fails the build (the Unity-era `Assets/`
  tree differs only by case and is not packaged), and any name passed to
  `instantiateActorModel`/`loadActorModel` that is not packaged fails it too.
  Both are proven against negative controls. If a batch lands and the build goes
  red with either message, that is the guard working, not a broken build.

- **Town layout is deterministic on purpose.** Lot jitter, rotation and gaps are
  hashed from each lot's own coordinates, never `Math.random()`. The town is
  rebuilt every run and the visual regression gate compares one build's render
  against another's; random placement would mean it never passes again.

---

## Landed

Newest first. Kept for the reasoning, not the changelog.

- Power grid overhaul, catenary lines & transformer blowout FX:
  - Re-authored `power-pole` + `power-pole-wreck` ($1.2\text{m} \times 9.0\text{m} \times 1.2\text{m}$) with authentic cylindrical high-voltage transformer drum cans, tiered crossarms, blue glazed ceramic insulators, and steel conduit.
  - Generated county-wide catenary utility power lines spanning between all 117 poles in a single draw call via `THREE.LineSegments`.
  - Added dynamic wire snapping and transformer blowout spark particle bursts with lightning flash and electrical sound FX upon storm impact.
- Dealership lot & parked inventory cars wired in-engine: Placed `car-dealership` as a
  named county anchor with an expanded 44m x 22m paved parking apron and 2 rows of 4
  color-tinted destructible `lot-car` inventory sedans (points: 60, health: 65, wreck: `lot-car-wreck`).
  All inventory cars take damage, flip, and collapse under storm wind/debris while adhering
  to the First Law (parked cars on lots are inventory).
- Round 2 3D Model visual polish:
  - Corrected `coffee-cup` handle orientation from horizontal to a proper **vertical ceramic C-ear handle** along the side of the mug, eliminating the 'trash can' appearance.
  - Re-authored `inflatable-mascot` from stiff vertical tubes to a **dynamic S-curve dancing tube man** with wildly flailing wavy arms, yellow fringe fingers, mayor suit/tie, and cartoon smiley face.
  - Re-authored `oak-tree` with natural root flares firmly planted on the ground and clustered low-poly organic canopy masses.
- Build guards against silent model-batch failures — wrong-case directory, and
  gameplay naming a model that is not packaged.
- 3D Model visual repairs & geometry normal fix: Corrected vertex winding order and
  outward normal calculation in core primitives (`addCylinder`, `addCone`, `addBarrelVault`).
  Re-authored `coffee-cup` (solid flared ceramic mug with sleeve & foam topping, fixing the
  inverted cone hole), `foundry` (sealed continuous sawtooth roof bays & 32m smelting stack,
  eliminating floating wedges), `courthouse` (integrated clock tower, belfry & solid dome,
  eliminating floating slices), `bbq-grill` (rounded kettle bowl, domed lid, wire grate,
  eliminating the hourglass cones), and `industrial-warehouse-curved` (sealed barrel vault).
- Car dealership (`car-dealership` + wreck) with high-ceiling glass showroom, service
  garage bay, brand pylon sign, and parked inventory car (`lot-car` / `parked-car` + wreck)
  with near-neutral COLOR_0 for runtime lot row tinting.
- Attached garage house variants (`ranch-house-garage`, `craftsman-house-garage` + wrecks),
  restoring suburban attached garage silhouettes in a single welded mesh per house.
- Authentic supermarket & discount store branding: `MOO-MART` green/white pasture branding
  on `grocery-store` + wreck, `UDDER VALUE` red/yellow discount branding on `discount-store` + wreck.
- Sidewalks downtown, gravel shoulder left alone in the farm belt. 20 continuous
  runs rather than 72 per-block slabs.
- Named store anchors with parking, driveways for every house. 65 ground slabs,
  no new assets.
- AG's storefront batch landed and the tint rebuilt for it. Every new model had
  gone to `Assets/models/` rather than `assets/models/`, so none were packaged
  and 39 buildings had fallen back to procedural boxes. 30 shopfronts across 6
  silhouettes and 8 tints now.
- Town asymmetry: lot shift, off-axis rotation, mixed uses, occasional gaps.
  Distinct building yaws 4 → 94.
- Rain that reads as rain, a horizon without a seam, an unclipped radar label.
- Two barns and a road of farmhouses, not a belt of eighteen barns.
- Pole wrecks — the storm leaves a trail. 117 stumps for the same 2 draw calls
  the original boxes cost.
- The damage regression: 122 of 140 destructible props were taking damage with
  nothing to show for it. One root cause, one shared helper.
- Storm cloud shader — canopy and supercell wall cloud.
