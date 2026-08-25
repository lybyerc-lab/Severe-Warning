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

State at last update: 93 models, 1.08 MB of the ~2 MB budget (54%). 3 branches,
0 open PRs, 127 archive tags. `qa` is the default and the working branch.

---

## Next up — AG (assets)

1. **Car dealership.** Director's ask.
   - `car-dealership` + `car-dealership-wreck`. Showroom frontage, glass front,
     low. In the 200–312 triangle band its main-street neighbours occupy.
   - `lot-car` + `lot-car-wreck`. A **parked** inventory car. This is not the
     driving `town-car`: see the no-harm note under Standing rules, because
     which one it is decides whether the storm may touch it.
   - Near-neutral `COLOR_0` on `lot-car` so the lot can be tinted into a row of
     different cars from one model.

2. **House variants with garages attached.** This is a regression, not a new
   feature. The procedural houses had garages; the model swap deleted them, and
   a swapped house is now a single mesh with nothing else in the group.
   Attached to the house model rather than placed as a separate prop — attached
   keeps it one draw call and one wreck across 45 houses.

3. **Signage.** `MOO-MART` on `grocery-store`, `UDDER VALUE` on
   `discount-store`. Both are placed as named anchors already; they just do not
   say what they are yet.

## Next up — Claude (code)

1. **Dealership lot.** Blocked on AG's models above. Lot surface reuses
   `addGroundSlab`; inventory cars are placed as destructible scenery, not as
   protected actors.

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

- **Town layout is deterministic on purpose.** Lot jitter, rotation and gaps are
  hashed from each lot's own coordinates, never `Math.random()`. The town is
  rebuilt every run and the visual regression gate compares one build's render
  against another's; random placement would mean it never passes again.

---

## Landed

Newest first. Kept for the reasoning, not the changelog.

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
