# Severe Warning — backlog

**This is the living work board.** Named in `AGENTS.md` as the first required
read. Not to be confused with `Docs/QA_BACKLOG.md`, which is the QA defect
register — numbered defects with acceptance criteria. If the question is "what
should I build next", it is answered here. If it is "this specific thing is
broken and here is how we will know it is fixed", it is answered there.

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

State at last update: 128 models, 2.14 MB of the 4 MB budget (**56%** — the cap
was re-derived from measurement on 2026-08-28; see Landed). 3 branches, 0 open
PRs, 127 archive tags. `qa` is the default and the working branch.

---

## Next up — AG (assets)

Nothing queued. ASSET-001 is verified closed (see Landed).

The payload is no longer the blocker it was: the cap is 4 MB and the library
sits at 2.14 MB (56%). Whether displace-before-adding still applies at that
level is an open question under Decisions open — until the director rules, the
rule stands and a batch request still has to name what it retires.

## Next up — Code & Modernization

From a director's pass played on a 915x412 phone viewport. Ordered by cost to
the player, not by ease of fixing. Each one says what was actually measured, so
the next person does not have to re-derive it.

Nothing queued.

Previously landed and cleared: the source HTML rename, the county fair /
industrial landmark animations, and the MOO-LAH economy with Storm Triangle
upgrades and cosmetic funnel skins.

## Decisions open

- **ACTION FOR THE DIRECTOR: paste `scripts/sync-checkout.sh` into the
  environment's setup script.** This is the only fix for the reverting checkout,
  and it cannot be done from inside a session.

  Root cause, proved rather than guessed: remote containers are provisioned from
  a cached image, and this project's image carries a checkout pinned at
  **8188a45 (2026-08-21)**. The SessionStart guard meant to catch staleness was
  added afterwards in `961fa35`, so —

      $ git cat-file -e 8188a45:.claude/hooks/session-start.sh
      fatal: path '.claude/hooks/session-start.sh' exists on disk,
             but not in '8188a45'

  — every re-provision restores a tree in which the guard **does not exist**. It
  is deleted by the exact event it exists to catch and has never once fired on a
  stale checkout. Anything else kept in the repo (AGENTS.md, a build-time check)
  fails identically and for the same reason: at 8188a45 it is the 8188a45
  version, or absent.

  It has bitten twice in one session. The second time the container reverted
  mid-conversation and an edit landed on a **228-commit-old** copy of the very
  file being changed; the resulting failure read as a real finding until the
  error message was read properly. Everything survived only because it had been
  pushed.

  **Correction to an earlier version of this entry:** it said the environment's
  setup script "runs on every provision". It does not, and that mattered. The
  docs are explicit — a setup script "runs the first time you start a session in
  an environment", the filesystem is then snapshotted, and later sessions "skip
  the setup script step"; it runs again only when the script or the allowed hosts
  change, or when the cache expires "after roughly seven days". That caching IS
  the bug: the snapshot carries the repository directory, which is why two
  sessions eight days apart both came up at exactly 8188a45.

  So the fix takes **two layers**, and neither works alone:

  1. **The environment setup script** (`scripts/sync-checkout.sh`, pasted into
     the **Setup script** field). Changing it forces the stale snapshot to be
     rebuilt, and guarantees the new snapshot's checkout is recent enough to
     contain `.claude/` at all. Alone it re-pins weekly and drifts again.
  2. **The SessionStart hook**, which runs on every start and resume and calls
     the same script. Alone it cannot bootstrap into a snapshot that predates it;
     once layer 1 has put it there, it keeps every session current.

  `scripts/sync-checkout.sh` fast-forwards a clean checkout and refuses to touch
  one that is dirty or ahead, so it can never destroy unpushed work. Both paths
  are verified: it fast-forwarded a worktree four commits behind, and refused
  this one while a new file was uncommitted.

  Where the field is: the cloud environment selector in the composer, hover the
  environment, click its settings gear, and use the **Setup script** box. Note
  the constraints — the script must exit zero or the session fails to start, and
  finish inside ~5 minutes. This one does both.

  Environment: **Severe Weather Warning** (`env_01JPML8FqjauwA3tTMBHongV`).
  Docs: https://code.claude.com/docs/en/claude-code-on-the-web

  Worth doing at the same time: refresh the environment so its cached image
  stops being pinned three weeks back. That alone would let the in-repo hook
  work, but it decays again with the next image, which is why the setup script
  is the real answer.

  **Until it is set, the standing rule stands:** push early rather than batching,
  and check `git status -sb` against origin before trusting any tree.

- **A second push within ~40 minutes silently voids the first one's visual
  comparison.** `qa-autoplay-full-round.yml` sets `cancel-in-progress: true`, and
  the visual gate is the longest step in the job. Run #159 reached the gate on
  the sheath commit, ran it for 11 minutes, and was cancelled when a docs commit
  pushed behind it. Re-running does not recover it: the workflow checks out
  `ref: qa`, the branch tip, not the SHA that triggered it — so a run's
  `head_sha` does not tell you what was actually tested, and a re-run measures
  today's tip. Either the gate stops being cancellable, or pushing inside its
  window has to be treated as a decision to skip it.

- ~~The model budget is at 97%.~~ **Settled: displace before adding.** 128
  models, 1.93 MB against a ~2 MB cap (measured: `du -sb assets/models` =
  2,026,182 bytes). Director's call is that the cap holds — **a new model must
  retire an existing one.** AG cannot start a batch by adding; the batch request
  has to name what it displaces.
  Known slack, both already parked and unplaced, so retiring them costs nothing
  on screen: `fire-hydrant` / `fire-hydrant-wreck` (308 tris an instance, renders
  5–8 px tall) and `hart-barn` / `hart-barn-wreck` (the hero barn is deliberately
  not model-backed — see Standing rules). Measure before promising the space.

- **`claude/pull-repo-cw2mn8` — audited 2026-08-28, nothing to salvage.**
  Two earlier claims about it in this file were wrong and are corrected here.
  It is **not** "140 unmerged commits": `qa` and that branch have **no common
  ancestor at all** — `git merge-base` returns nothing. `qa` is 80 commits rooted
  at "Verify exact Phase 4 legacy parity"; the branch is 140 rooted at
  "Initialize Severe Weather Unity production starter" (2026-07-23). Two
  unrelated histories in one repository, so "140 ahead" is just the branch's
  entire life.
  Only **6 files** exist there and not on `qa`, and none are wanted: four
  `apply-v4xx-source-patch.mjs` patch-chain scripts (exactly what `qa`
  deliberately flattened — reviving them undoes that), and two Pages workflows
  superseded by `qa`'s own, one triggering on a branch that no longer exists.
  Its two plausible gameplay fixes: the wind-rumble one patches
  `updateWindRumble`, which does not exist in `qa` (the audio system was rewritten
  around the sprite manifest). The seven-defect commit was tested rather than
  trusted, each with a control proving live state advances before checking frozen
  state — pause freezing timer/score/storm, abilities blocked while paused,
  `quitToMainMenu` clearing the run, `damageTarget` guarding on `runActive` — all
  **already fixed in `qa`**.
  **Verdict: do not cherry-pick. Leave it as archaeology.** Its real value was as
  a pointer: reading its defect list sent someone looking at post-run scoring and
  found a live bug by a different mechanism (below).

- **Does displace-before-adding still apply at 56%?** The rule was set when the
  budget was 97% spent. It is now 2.14 MB of 4 MB, so the premise is gone but
  the rule has not been revoked — it still stands until the director says
  otherwise. Worth a decision either way, because AG currently cannot open a
  batch without naming something to retire.

- **Nothing watches CI.** Two of the three workflows were red for at least ten
  consecutive commits and nobody noticed, because the only workflow anyone reads
  the badge for is Validate project, which stayed green throughout. Either the
  red workflows need to gate merges, or someone has to own reading them.

---

- Interactive In-Game MOO-LAH & Funnel Skin Storefront ("Udder Value Outfitters"):
  - Added in-game storefront modal (`#swShopModal`) with responsive arcade/newspaper UI, tabs for Storm Upgrades and Funnel Skins, and MOO-LAH balance tracking.
  - Connected live 3D storm funnel skin styling (`applyFunnelSkinMaterials`) to update Three.js vapor ribbons and suction ring colors in real time.
  - Added shop entry buttons to the Morning Edition Main Menu and Evening Edition Results broadsheets.
  - Implemented modular architecture in `src/ui/shop/` (`shop-contracts.ts`, `shop-system.ts`, `shop-system.test.ts`) integrated into `UISubsystem`.
  - Inlined `[SW:SOURCE:sw-ui-002-shop.js]` in `MechanicsLab/SevereWeather_Warning.html` with marker `SW_UI_002_SHOP_MODAL_V1`.
  - Added automated verification `scripts/verify-shop-system.mjs` (10/10 checks pass).

- Revived MOO-LAH Economy, Storm Upgrades & Cosmetic Funnel Skins:
  - Revived persistent storm currency (MOO-LAH) and Storm Triangle ability upgrades (`pull`, `gust`, `gridZap`) with local-first persistent storage.
  - Added cosmetic funnel skins registry (`default-classic`, `midnight-neon`, `crimson-fury`, `golden-harvest`, `emerald-tempest`).
  - Added skin purchasing and equipping with balance validation and unit testing under `src/gameplay/economy/` (`moolah-system.ts`, `moolah-system.test.ts`).
  - Inlined `[SW:SOURCE:sw-rpg-001-moolah-storm-triangle.js]` in `MechanicsLab/SevereWeather_Warning.html` with marker `SW_RPG_001_MOOLAH_STORM_TRIANGLE_V1`.
  - Added automated verification `scripts/verify-moolah-economy.mjs` (8/8 checks pass).

- County Fair & Industrial Landmark Animations:
  - Added continuous Ferris wheel mechanical rotation (`speed: 0.22`) with counter-rotating gondolas and festive lighting in District 3.
  - Added carousel rotation (`speed: 0.45`) with vertical sinusoidal galloping horse oscillation.
  - Added active rising industrial smoke plume particle systems to the 32m twin smelting chimneys on the Foundry in District 2.
  - Added pulsating thermal crucible glow to the Foundry interior.
  - Created type contracts and implementation under `src/world/animations/` (`landmark-animation-system.ts`, `landmark-animation.test.ts`).
  - Inlined `[SW:SOURCE:sw-anim-001-landmark-animations.js]` into `MechanicsLab/SevereWeather_Warning.html` with marker `SW_ANIM_001_LANDMARK_ANIMATIONS_V1`.
  - Added automated verification `scripts/verify-landmark-animations.mjs` (9/9 checks pass).

- Canonical Source HTML Renaming:
  - Renamed primary gameplay source file to `MechanicsLab/SevereWeather_Warning.html`.
  - Updated all build pipelines (`scripts/build-web.mjs`), inlined region extraction (`scripts/lib/inlined-regions.mjs`), verification test suites, and documentation.

---

## Parked — do not lose, not being worked

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

- **MOO-LAH is the in-game currency, and the name is reserved.** Nothing else
  in the game may be called MOO-LAH, which is why the discount store is UDDER
  VALUE. It is no longer parked: the economy, the Storm Triangle upgrades, the
  funnel skins and the storefront are all wired and verified
  (`verify-moolah-economy` 11/11, `verify-shop-system` 10/10).

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

- **The visual gate can see the funnel skins now, and the scenario was proved
  before it was trusted.** Its scenarios were `['initial', 'hero']` and neither
  equipped one, so five skins that recolour the funnel, the outer sheath and the
  suction rings were entirely outside coverage. That was found the useful way:
  the sheath-opacity fix was gated against the commit before it and passed at
  0.0000% across all six scenarios — correct for the default look, and proof the
  gate would not have noticed had the fix been wrong for every skinned player.

  `hero-skinned` is the hero pose with `crimson-fury` equipped. Proved against
  that same known change, and this is the whole point of it:

      FAIL mobile-915x412 hero-skinned :: repeat=0.0000% candidate=5.3220%
      FAIL mobile-915x412 hero-skinned :: repeat=0.0000% candidate=5.3220%

  Both attempts, byte-identical, against a 0.0000% repeat floor, while all six
  pre-existing scenarios held at 0.0000%. So the scenario detects a real skinned
  change, agrees with itself across attempts, and is not merely noisy — a check
  that had come back clean here would have been decorative and was going to be
  binned rather than shipped.

  **One viewport, not three, deliberately.** A skin is a material tint and does
  not interact with layout, so extra viewports re-measure the same thing at real
  cost: captures scale with viewports x scenarios x 3, so this adds 3 an attempt
  rather than 9. `mobile-915x412` is the phone the game ships to.

  A missing `applyFunnelSkinMaterials` throws rather than skipping. Skipping
  would leave the scenario byte-identical to plain `hero` and quietly assert
  nothing, which is the exact failure it exists to end.

  Job timeout raised 60 -> 75. At the ~1.1 min a capture measures here, 18 -> 21
  captures takes an attempt from ~20 to ~23 minutes and two from ~40 to ~47,
  against ~6 minutes of build, play round and sweep. Sixty left about seven
  minutes of headroom, and a run of this workflow has already been lost once to a
  budget set before the gate's real cost was known.

- **The screenshot decoder was scrambling every capture the visual gate has ever
  compared, and there is now a rig that refuses to lie.** `decodePng` hardcoded
  4 bytes per pixel; Chromium writes screenshots as colour type 2 — RGB, 3 bytes,
  no alpha. Wrong stride means every row is read from the middle of the previous
  one, so a brightly lit farmyard decoded with 92% of its red channel in the 0–31
  bucket and sampled pixels reading `[0, 0, 0, 0]`. It hid because both sides of
  every comparison were scrambled identically: matching builds still differenced
  to 0.0000% and the gate looked healthy. Only an absolute question — "what
  colour is this pixel?" — exposes it. Verified fixed against known content: the
  red barn decodes `[92, 24, 32]`, sky `[50, 73, 101]`, mean luminance
  15.0 → 105.7.

  `scripts/measure-scene-occlusion.mjs` (`pnpm qa:occlusion`) came out of the
  same work. It answers "how much of the frame is this responsible for?" and
  refuses to answer unless four guards pass: a mandatory control (hiding the
  whole tornado) must move real pixels, the noise floor must be near zero, the
  run must actually be in gameplay, and the baseline must contain a real scene.
  Every one of those exists because an earlier version failed it silently —
  pausing the game stops the render loop, so a whole table of plausible numbers
  came back describing a frozen canvas, and only hiding the entire tornado and
  measuring 0.69% gave it away.

  Two more traps are documented in the script: this world animates per FRAME, not
  per millisecond, so exposures must be separate page lives stepped to identical
  frame counts (holding one page at a fixed timestamp still gave a 16% floor);
  and a run opens on the Hart Farm cinematic, so an unskipped rig measures a
  farmyard with no tornado in it.

- **The funnel sheath stopped reading as a wall under a skin.** The outer vapour
  sheath is authored at 0.36 opacity for a desaturated slate that reads as haze;
  a saturated skin colour through the same alpha reads as a wall. Measured
  footprints at EF-5: classic 22.80%, crimson **30.74%** — same geometry, same
  alpha, a third more screen. `SKINNED_SHEATH_OPACITY = 0.18` puts a skinned
  sheath at 24.76%, within measurement noise of classic's own weight; 0.24 is far
  too heavy at 27.04% and 0.12 is visibly lighter than classic.

  Verified through `applyFunnelSkinMaterials` rather than by forcing the uniform,
  which would have passed whether or not the fix was wired up, and the classic
  round trip restores 0.36 so equipping a skin does not thin the storm forever.
  Gated against the commit before it: 0.0000% across six scenarios, correct
  because the default look is deliberately untouched.

  Revert path: set `SKINNED_SHEATH_OPACITY` to `CLASSIC_SHEATH_OPACITY`.

  **Precision caveat, learned the hard way:** the rig's 0.000% noise floor is
  WITHIN one invocation. The same setting re-measured in a fresh process moved by
  up to 1.4 points (0.18 read 23.36% then 24.76%), most likely async model loads
  settling on different frames. Compare variants inside one invocation; treat
  cross-invocation numbers as carrying a point and a half of slack.

- **The results paper reported EF-0 for every run ever played.**
  `decorateNewspaperResults` read `#resEfRating`, an element that has never
  existed in the document; the optional chain returned undefined and `|| 'EF-0'`
  fired every time. Its five sibling lookups all resolve — only that one was a
  phantom, which is why nothing looked broken. It now prints the run's PEAK
  rating, tracked beside `maxComboReached`, because EF genuinely falls mid-run
  when the stage ceiling resets. Proved with a control that separates peak from
  live: live EF-0, printed EF-5.

- **The build shipped every model twice, and the verifier checked the dead
  copy.** Found while measuring the payload cap, which is the only reason anyone
  looked. `build-web.mjs` wrote each `.glb` to both `www/models/` and
  `www/assets/models/`, and recorded the first in `build-info.json`. The game
  reads `ACTOR_MODEL_PATH = './assets/models/'`, so the manifest — and therefore
  `verify-qa-package.mjs`, which follows it — was hashing the copy the game
  never opens. A corrupted `www/assets/models/*` would have passed verification
  clean.

  Not deduced from reading the code: measured by recording every network request
  the built bundle makes. The opening scene asks for `assets/models/` **52
  times** and `www/models/` **zero**. One copy now, at `assets/models/`, and the
  manifest names it, so the verifier and the game finally check the same bytes.

  | | before | after |
  |---|---|---|
  | `www/` on disk | 7.55 MB | **5.41 MB** |
  | zipped, i.e. APK-shaped | 2.86 MB | **2.39 MB** |
  | models' share of the APK | ~978 KB | **489 KB** |

  Verified after the change: 52/52 models load with zero page errors and zero
  non-200 responses, `models:seethrough` still passes 128/128, and
  `verify-qa-package.mjs` returns 511/518 — the identical count, with the
  identical seven failures, that the unmodified build returns (they are the
  missing Pages stamp and the ungenerated audio, both local-only). The control
  was run, not assumed.

- **The ~2 MB model cap was raised to 4 MB, and it is now derived.** The old
  number appeared in five documents and was justified in none of them. What the
  payload actually costs, measured at 128 models / 2,248,570 raw bytes:

  | cost | measured |
  |---|---|
  | Added to the APK | **489 KB** — assets are DEFLATE'd into the zip |
  | Over the wire, gzipped | **407 KB** (18% of raw) |
  | JS heap, all 128 resident | **5.0 MB** |
  | Geometry, all 128 | 41,386 verts / 45,736 tris |
  | Parse, all 128 | 2.03 s under software rendering; a scene loads ~52 |

  Untextured float32 vertex data compresses about 5.5x, so raw bytes overstate
  every cost that matters by roughly that factor. 4 MB raw is under 1 MB of
  install and under 10 MB of heap. The library was over a ceiling that was
  costing half a megabyte to honour.

  Raw bytes stay the number to check, because `du -sb assets/models` takes a
  second. It is a proxy: the real constraint is triangles in one scene, and if
  that ever binds, the table in `assets/models/README.md` should be replaced
  rather than raised again.

  **One thing could not be measured here:** whether GitHub Pages gzips
  `model/gltf-binary` over the wire. The container's network policy blocks
  `github.io`, so the 407 KB figure is what a compressing server would send, not
  a confirmed observation of the QA site. It does not affect the Android build,
  where the 489 KB is measured directly from a zip.

- **The asset generators can run on Linux again, and they reproduce the shipped
  models byte for byte.** Five `generate-*.mjs` plus `build-all-assets.mjs`
  lived in capital-`Tools/asset-pipeline/` while `glb-builder.mjs` and
  `model-validator.mjs` lived in lowercase `tools/asset-pipeline/`. On Windows
  those fold into one directory and it works; on Linux they are two, and the
  pipeline was a hard `ERR_MODULE_NOT_FOUND` — reproduced before touching
  anything, so the fix had something to prove itself against. Moved the five
  generators down into `tools/` with `git mv`; `Tools/validate_project.py` stays
  capital-T because `validate-project.yml` invokes it by that name.

  Nothing else had to change: every generator resolves its output with
  `path.resolve('assets/models')`, relative to the working directory rather than
  to the script, so moving the file up one case does not move where models land.

  The real payoff was the verification. `build-all-assets.mjs` was run with its
  working directory pointed at a scratch tree, so the repo's own models were
  never at risk of being overwritten — and all **80 models it generates came out
  byte-identical to the 80 shipped in `assets/models`**. That says two things
  worth keeping: the pipeline is deterministic, and AG's ASSET-001 repairs went
  into the generators rather than into hand-edited GLBs, so regenerating cannot
  silently undo them. The other 48 models in the library are authored outside
  this pipeline and it neither writes nor deletes them.

- **`models:seethrough` now gates CI.** It runs as its own step in
  **QA Automated Full Round**, immediately after the build and before the play
  round, so a model with a hole fails fast instead of 25 minutes downstream.

  It is deliberately NOT in `pnpm build`, which is where the backlog originally
  proposed it: the check needs a browser, and putting it in the build would make
  every local build and every Android packaging run depend on Chromium. The
  autoplay workflow already installs one for the visual gate, so the step is
  free of new setup — no `CHROME_BIN`, same fallback the visual gate uses.

  Verified passing before wiring, not after: 128/128 models, worst score 0.1%
  (`foundry`) against a 20% threshold, in **56.6 s** measured on this container
  — so the backlog's ~1 minute estimate holds and the 60-minute job budget is
  not meaningfully touched. That the check can actually fail is not
  assumed either — it is what caught `industrial-warehouse-curved`,
  `farm-windmill` and `tractor` in the first place, which is the only reason
  ASSET-001 exists.

- **ASSET-001: Repaired all three see-through models and sealed geometry pipeline.**
  - `industrial-warehouse-curved`: Fixed uncapped barrel vault opening at $Z = -6$ and reversed cylinder cap winding so both front and rear circular vault ends are solid, sealed, and front-facing.
  - `farm-windmill`: Fixed inverted sphere triangle winding order in `GlbBuilder.addSphere` and replaced solid cylinder discs covering the fan with hollow concentric `addTorus` hoops.
  - `tractor`: Fixed `wy => 0.95` lambda parameter that was corrupting rear wheel hub vertex positions into `NaN`.
  - `GlbBuilder`: Upgraded primitives to generate watertight bottom caps with CCW winding for `addCylinder` and `addCone`, true outward-facing facet normals for `addWedge` and `addPyramid`, and automatic $Y_{\text{min}} \ge 0.0$ grounding in `toGlbBuffer()`.
  - Automated inspection with `pnpm models:seethrough` (`scripts/check-model-see-through.mjs`) passes 128/128 models with 0% backface leakage on all intact models.

- **The visual gate's real cost had never been paid, and it did not fit.**
  With the baseline finally able to boot, the gate ran its true comparison for
  the first time — and overran the job. Measured on the CI runner: **one attempt
  is ~20 minutes** (18 software-rendered captures of a 2110-object scene) and it
  runs **two** attempts for its agreement rule, against a 30-minute job budget
  that also has to cover the play round and the world-tour sweep. The run was
  killed mid-second-attempt, taking the sweep and the evidence commit with it.
  It had never been caught because the gate had always died early first.

  Attempt 1 passed all six scenarios at 0.0000% before the kill, which is the
  result that mattered: the picture is unchanged.

  Two changes, and one deliberate refusal:
  - **The gate now skips when the render inputs are byte-identical to the
    baseline.** `resolveBaselineRef` walks back to the last commit that touched
    a render input, so script-only, workflow-only and Docs-only commits arrive
    with nothing to compare — the build is bit-for-bit the same and the result
    can only be 0.0000%. It was paying ~40 minutes to prove that. No coverage is
    lost: identical inputs cannot render differently, and anything touching a
    render input still renders and still compares.
  - Job timeout 30 → 60 minutes, for the runs that genuinely do render.
  - **Refused: cutting the two attempts to save time.** The agreement rule is
    what separates a real change from renderer flake, and this script's own
    comments record CI producing a spurious 19.9% diff between builds differing
    only in test scripts. Trading it for speed reintroduces exactly the failure
    it exists to prevent.

  **A bug in the first cut of that skip, caught by testing it:** `git diff
  <a> <b>` compares two commits and ignores the working tree, so on the
  dirty-tree path — where the baseline is `HEAD` *because* there are uncommitted
  render-input edits — it compared HEAD against itself and skipped the change
  under test. A false pass, worse than the slowness being fixed. A single-ref
  `git diff <ref>` compares the working tree and is correct on both paths.
  Verified in both directions after the fix.

- **The visual regression gate blamed the picture for its own failure to run.**
  With the play round finally passing, the full-round workflow reached its last
  step and failed there. Its message was
  "the rendered picture moved further than this harness's own measured noise" --
  but two lines above it said `Scenarios with enough agreeing measurements:
  0 of 0`. Nothing had been measured. The real fault was that the **baseline**
  build (the previous commit) was from before the boot-crash fix, so its capture
  threw `Deterministic boot did not reach QA readiness` with `shellReady: false`
  and there was nothing to compare against.

  Proven, not assumed: running the gate's own comparison with the current build
  on both sides passes all six scenarios at 0.0000% difference, so the frozen
  boot path and the gate are both healthy — it was purely the poisoned baseline.

  Two defects fixed, both of which cost real time here:
  - The two failure modes are now reported apart. "Moved" and "proved nothing"
    are opposite claims and were printing the same sentence.
  - **`[visual-change]` no longer waives an inconclusive gate.** The marker means
    "I meant to change the picture", which nobody can claim about a comparison
    that never ran; it was previously enough to wave through a build nothing had
    looked at. The inconclusive branch is checked first and exits non-zero
    regardless of the marker.

- **The town read flat because the fill light drowned the shadows.**
  Two wrong leads first, both killed by measurement: fog is only 12.6% at the
  167-unit play distance, and `normalBias` 0.6 -> 0.12 moves 0.35% of real
  screenshot pixels. Cast shadows turned out to be rendering correctly the whole
  time — proven against a **noise floor**, which the earlier attempt lacked: the
  storm shaders run on the render clock, so two identical exposures of a paused
  frame already differ by 3.22%, while disabling the shadow map changes 9.31%.
  With the fill removed so only the sun lights the scene, shadows ON puts clear
  cast shapes beside every building and OFF wipes them out.
  The real ratio, same frame: **fill 53.56% of the image, shadowing 9.31%.** The
  county was lit almost flat and the shadows were a rounding error on top.
  Director's call: fill to 60%. Applied as `FILL_LIGHT_SCALE`, because the fill
  is set from **three** places — the per-frame stage lerp and the NIGHT / STORM /
  DAY set-points — so scaling one gets pulled back by the others. All nine
  set-points route through the constant.
  **To revert the look, set `FILL_LIGHT_SCALE` to 1.0 and nothing else.**
  Result: ambient 0.64 -> 0.392, hemisphere 0.60 -> 0.354, directional untouched;
  mean luminance -5.3 of 255 (about 2% darker) with visibly more form. Diligence
  audit 20/20, zero page errors.

- **The mesocyclone read as a saucer; the cause was not where it looked.**
  Two suspects were wrong before the right one turned up, and both were killed by
  measurement rather than argument. The `cloudBase` cylinder looked obviously
  guilty (a capped disc at canopy height) and hiding it appeared to change
  nothing; the anvil looked even guiltier (`CylinderGeometry(54, 38, 10, 32)`,
  capped, and the only canopy element still on a **lit MeshStandardMaterial**
  rather than the storm-cloud shader) and hiding that also looked identical.
  So instead of eyeballing, each element was hidden in a frozen frame and the
  changed pixels counted:

  | element | changed | share |
  |---|---|---|
  | funnel | 48,059 | 12.75% |
  | downdraft | 39,644 | 10.52% |
  | canopy lobes | 36,163 | 9.59% |
  | cloudBase | 24,828 | 6.59% |
  | meso wall | 13,287 | 3.52% |
  | anvil | 65 | **0.02%** |

  That settled it. The **anvil is effectively invisible** — my prime suspect
  contributes 65 pixels. And the eyeball verdict on `cloudBase` was simply wrong:
  it changes 6.59% of the frame, too subtle to see at that size but far from
  nothing. The hard elliptical underside was `cloudBase`'s **flat bottom cap**
  plus lobes whose undersides all landed on one plane.
  Fixed at those two: the base is `openEnded` now so there is no cap to draw a
  rim, with a wider edge falloff and lower opacity; the lobes vary in both
  flattening and height (jitter 1.5 -> 4.6) so their undersides no longer align;
  and the lobe rim dissolve went 0.55 -> 0.68. The mass keeps a solid dark core
  and loses the hard rim. Diligence audit 20/20, zero page errors.

  **Left alone deliberately:** the anvil is dead weight — a 32-segment capped
  cylinder of radius 54 on a lit material, drawing 0.02% of the frame. Removing
  it is a free win but it is a change with no visual justification to verify
  against, so it is recorded rather than done.

- **ASSET-001 closed: no intact model can be seen through.** AG's repair sealed
  cylinder bottom caps and corrected sphere winding across **77 of the 128
  models**, well beyond the three that were reported. Verified with
  `pnpm models:seethrough`: **PASS**, worst intact model now 0.1% (`foundry`),
  down from `farm-windmill` 68.5%, `industrial-warehouse-curved` 65.2% and
  `tractor` 31.5%. The wrecks cleared too — `farm-windmill-wreck` was 86.9% and
  no longer appears above the threshold at all, so the advisory list is empty.

- **The build guard was quietly blinded, and is restored.** AG's commit changed
  the stray-model guard's directory comparison to case-INSENSITIVE:
  `path.resolve(absolute).toLowerCase() === path.resolve(sourceModelsDir).toLowerCase()`.
  That fixes a real false positive on Windows, where `Assets/models` genuinely IS
  `assets/models` and the guard would otherwise report all 128 legitimate models
  as strays. On Linux and in CI it does the opposite of its job: the names fold
  equal, the loop `continue`s, and the guard skips the exact directory it exists
  to catch.
  Proven side by side with one stray `.glb` planted in `Assets/models`:
  the restored guard fails the build with
  `Models found outside assets/models: Assets/models (1 .glb)`; AG's version
  prints `Built offline web bundle` and packages none of them. That is the
  failure that silently reverted 39 buildings to procedural boxes.
  Fixed by asking the question actually being asked — *is this the same
  directory?* — with a device+inode identity test instead of a name comparison.
  Correct on both kinds of filesystem, and it refuses to skip when a filesystem
  reports no inode, so an unknown case is loud rather than ignored.

- **The opening cutscene was framing the back of the barn.**
  With the every-frame crash fixed, the composition could finally be looked at,
  and the establishing shot was a featureless red slab with a shapeless green
  mass beside it. Both had specific causes, found by raycasting into the frame
  rather than guessing:
  - The slab is `barn-back-wall-group` on `HartFarmSignatureBarn`. The set was
    staged at z = -196, which is the barn's **back** side; the front wall — both
    big cross-braced doors, the loft door, the gable and the white trim — is at
    world z = -228.2. The camera sat at `farmZ + 15` looking toward -Z, so it
    could never see the doors. The barn had never once read as a barn.
  - The green mass is not a placeholder: it is a **760 x 210 PlaneGeometry about
    168 units out**, the distant ground apron, looming because the camera was low
    enough to look along it rather than down at it.
  Set restaged to z = -242, about 13 units clear of the front wall on flat ground
  with nothing else within 22 units; the group turned 180 degrees so Cow 17 faces
  the lens and the chickens and hay bales fall in front of her; the camera spline
  mirrored to the -Z side and lifted so the apron sits on the horizon.
  The barn now reads as a barn, the close-up reads as a character — snout, eyes,
  ear tag, the Moo Brew cup — and the grain bin and farmhouse give real farm
  context. Verified end to end: diligence audit 20/20, subtitles progressing,
  zero page errors, and the handoff still clean (letterbox lifts, `runActive`
  true).

- **The chopper kept scoring after you quit.** Found by auditing the abandoned
  branch's defect list rather than by cherry-picking it. Quitting to the main
  menu with a cow still airborne awarded **exactly +350 and an extra media
  moment, three trials out of three** — deterministic, not flake. It also popped
  the Cow-Cam overlay, the chopper-cam overlay, a headline and a moo, over the
  main menu.
  It escaped every existing guard because it is neither damage nor a normal
  award: cows are protected actors so they keep simulating after a run ends, and
  `triggerNewsChopperLiveFeed` writes `destructionScore += 350` **directly**,
  bypassing `addScore` entirely — while `damageTarget`'s `if (!runActive) return`
  only ever covered damage. Grepping for the old commit's fix would not have
  found this; the mechanism is different.
  Guarded at both entry points (`activateCowCam` and
  `triggerNewsChopperLiveFeed`) in the codebase's own "refuse before any state is
  touched" style. Proven both ways: the scoop still awards +350 during a live run
  (positive control — otherwise the fix is just deleting a feature), and the leak
  is gone across three trials with no stray overlays.

- **`pnpm build` had never worked.** Found while running the suite after the
  see-through work. Three scripts had every backtick and `${...}` stripped out,
  leaving lines like `console.error(FAIL: File count mismatch: expected , got );`
  — not a subtle bug, a **syntax error**: they could not parse, let alone run.
  `check-inventory.mjs`, `check-hygiene.mjs`, `update-inventory.mjs`.
  `pnpm build` runs `inventory:check && lint:hygiene` as its first two steps, so
  the documented build command died immediately. It survived because CI never
  calls `pnpm build` — the workflows run the individual steps — so the only
  casualty was anyone building locally, and `cap:sync`, which is the local
  Android path.
  **Not caused by the BOM commit that last touched them**, which is where the
  blame first landed: checking the introducing commit shows they were committed
  broken in `8ff30b7` and have never once executed. Repaired and both proven to
  work: hygiene passes clean and fails on a planted `vitest` import; inventory
  reports 473/473 synchronized.

- **Models you can see through, and the check that now catches them.**
  Two barrel-vault warehouses in a play screenshot read as ghosts. Not
  transparency: every material was opaque, opacity 1, FrontSide. The geometry
  had a hole — one end of the vault was never capped — and front-face culling
  did the rest.
  Nothing could have caught it. `tools/asset-pipeline/model-validator.mjs` is
  135 lines that parse the GLB header and count vertices, bytes and missing
  wrecks. **Nothing in the pipeline had ever looked at a model.**
  **A heuristic that was tried and thrown away, so nobody rebuilds it:** counting
  unshared edges and judging them by size relative to the model. Measured across
  all 128 models it gives no usable threshold — the largest benign hole is 0.448
  of its model's diagonal and the smallest real one 0.464. A continuum, not a
  gap. Plenty of models have holes that are completely fine because nothing can
  ever see them: the open inner ends of `lot-car`'s wheel cylinders, ring joins
  inside `district-barn`, the missing floor every building has.
  What replaced it measures the symptom instead of guessing the cause:
  `scripts/check-model-see-through.mjs` renders each model from eight angles
  twice, once front-faces-only and once with backfaces drawn, and counts pixels
  lit ONLY when backfaces are drawn — pixels where you were seeing through the
  shell. A solid model scores zero however many hidden holes it has. Here the
  populations separate for real: benign tops out at 9%, broken starts at 31%.
  Run it with `pnpm models:seethrough`.

- **The evening paper congratulated you for failing.**
  A run scoring 172 with 0/3 objectives, 0/2 landmarks and a grade of F printed
  "WEATHER DESK REPORTS A VERY EVENTFUL AFTERNOON". Not a rendering accident:
  that cheerful line was the **default**, and the ladder only branched upward
  (S+, or a score over 4500), so it is what every wipe printed. The gag landed
  backwards — the funniest copy for a total failure is a small-town paper being
  unimpressed, not delighted. The fair lane had the same fault.
  Fixed by extracting `resolveNewspaperHeadline({title, grade, score})` as a
  pure function ordered worst-first, so a bad run cannot fall through to
  celebratory copy. F now prints "COUNTY DECLINES TO COMMENT ON ALLEGED
  TORNADO", C prints "WEATHER DESK RECORDS A LARGELY ORDINARY AFTERNOON".
  `verify-newspaper-opening` evaluates the shipped function and asserts the
  outcomes rather than grepping for a string; proven with a negative control
  (delete the F branch → FAIL).

- **A director's-pass finding that was wrong, and the measurement that killed
  it.** The pass claimed the HUD ate roughly a quarter of the phone screen. It
  does not. Measured on 915x412: the title card is 13.6% of the viewport and the
  whole HUD 16% — and the card **auto-collapses to 4% on the player's first
  movement** (`collapseTitleCardOnFirstMove`), taking the total to 13.3% with
  everything at the edges. The alarming screenshot was an artifact of a capture
  harness that launched a round and then never moved, so the auto-collapse never
  armed. The existing behaviour is well reasoned and documented in place: the
  card is worth reading while stationary and worth losing the moment the player
  starts driving. **No change made.** Recorded because the wrong version of this
  claim is persuasive and someone will otherwise "fix" a non-problem.

- **CI round two: the checks were pinned to a UI and an audio design that had
  both moved on.** Getting past the build blockers only exposed the next layer.
  1. **The modern shell crashed at boot.** The Hart Farm barn destruction rework
     renamed `roofLeft` to `roofLeftGroup`; `getProductionSliceQaState` still read
     `productionBarn.roofLeft`, so `.parent` on `undefined` threw and took the
     whole modern-shell bootstrap down. A QA reporter must never be the thing
     that stops the game booting, so it is defensive now as well as correct.
  2. **The play harness waited 60s for a button that no longer exists.** The
     CRT/TV menu rework replaced `#btnStartMenu` with `#btnTvPower`. That single
     dead selector was reporting the round, the district sweep and every audio
     check as failed. It now polls the known launch controls for the first
     *visible* one — not a comma selector, which resolves in DOM order and picks
     `#btnLaunchFromMap` inside the closed region-map modal.
  3. **The world tour had the same fault waiting.** `#campaignMapGrid` moved
     inside that modal too, so it is present but zero-size, and
     `waitForSelector` waits for visibility by default. It waits for attachment
     now; the real readiness gate is the `waitForFunction` on the next line.
  4. **`synthetic source disabled` asserted a design that was deliberately
     changed.** The moo used to be suppressed and logged as
     `disabled-synthetic-source`; it now plays sampled `moo_1`/`moo_2` clips.
     The marker is gone from the game, so the check could only fail — and its
     sibling in the play harness could only pass by seeing zero moos, which is
     exactly what it had been doing. Both re-expressed against the invariant
     that still holds: **a moo is a recorded clip, never the synthesiser.**
     Proven with a negative control (swap `playStormClip` for an oscillator →
     FAIL).
  5. **Console 404s were healthy behaviour counted as errors.** `fetchAudio`
     probes three candidate paths so one file works from `MechanicsLab/` and
     from `www/`; the packaged build misses twice and succeeds on the third by
     design. Chrome logs those with no URL attached, so they cannot be filtered
     from console text. Failing requests are now tracked by URL with the known
     probe misses excluded, and there is a new `noFailedRequests` check. This is
     **stricter** than what it replaced: a 404 on a model or a script used to
     hide inside a generic console line and now has a named check.

  Results: full round 11/12 and world tour 19/19 locally, the one gap being
  `musicDecodedWithEnergy`, which needs three ffmpeg-generated music clips this
  container cannot build. CI generates them and its own log confirms them
  present.

- **A near miss worth recording: do not bend the game to suit a check.**
  Chrome refuses `navigator.vibrate()` before the frame is tapped and logs an
  error per call. Gating the game's haptics on `navigator.userActivation`
  silenced it — and made `triggerHaptic` untestable without a gesture, which
  broke the haptic waveform audit outright. Reverted. The harness filters it as
  the headless artifact it is. **A console line in a headless harness is not a
  reason to change shipped behaviour.**

- **CI restored: Android APK and QA Full Round were red for 10+ commits.**
  Five separate faults, only one of which was a broken check:
  1. `--experimental-strip-types` (what `npm test` uses) cannot compile
     TypeScript **parameter properties** — they emit real code, so stripping
     types breaks them. `tsc` compiles them fine, which is why typecheck stayed
     green and hid the problem. Five files used them; only `campaign-system.ts`
     surfaced, because only it had a test importing it. All five converted to an
     explicit field plus a body assignment.
  2. Underneath that: 96 extensionless relative imports across 21 files in
     `src/`. Node ESM requires the extension. All given `.ts` (the tsconfig
     already sets `allowImportingTsExtensions` with `moduleResolution: Bundler`).
  3. `verify-v500-campaign` asserted the string `kind: '` appeared **exactly 8
     times**. The 3-region expansion made it 18, with all 8 signature kinds still
     present. Rewritten to check the set of kinds, not the count.
  4. `verify-phase4` pinned four literal score targets. The campaign was retuned
     and the numbers moved. Rewritten to assert targets ascend per region, which
     is the property that actually matters.
  5. `verify-phase5` matched the literal source line
     `if (!qaCameraParked && !presentationLatched) {`. The cutscene added
     `&& !cinematicActive`. Rewritten as a regex that tolerates added conditions.
  All three rewritten checks were proven against negative controls (delete
  `windmill` → 7/8 FAIL; make a target descend → FAIL; drop `presentationLatched`
  → FAIL). Results: 49/49 tests, typecheck PASS, vite build PASS, v500 66/66,
  phase4 70/70, phase5 104/104.

- **The opening cutscene threw on every frame; nobody could see it.**
  `updateOpeningCinematic` reads `farmX`/`farmY`/`farmZ` for the whole camera
  spline, but `farmX`/`farmZ` were `const` **locals inside
  `startOpeningCinematic`** and `farmY` was never declared anywhere. So the
  first update frame threw `ReferenceError: farmX is not defined`, before the
  camera moved and before the subtitles advanced past beat 1.
  It went unseen because the only check that exercises the cutscene lives in
  `verify-full-diligence-audit.mjs`, which hardcoded a Windows Chrome path and
  so died with ENOENT on Linux and in CI — indistinguishable from passing unless
  you read the exit code. That script and `verify-master-audit.mjs` now honour
  `CHROME_BIN` / `QA_PLAY_BROWSER` before falling back to the Windows path.
  Fix: the farm anchor is now module-scope (`SW_CINEMATIC_FARM_X/Z`), and
  `update` reads the anchor back off the group it actually placed, so the flight
  path cannot drift from the set. Full diligence audit now 20/20; master audit
  8/8.
  **The lesson, worth more than the fix:** a check that cannot run on the machine
  that runs CI is not a check.

- Broadsheet Newspaper Presentation & "Moo Brew Touchdown" Opening Cutscene:
  - Created type-safe opening cinematic subsystem (`src/presentation/cinematics/`) with Cow 17 actor rig, Moo Brew coffee cup, chickens, fence staging, and a 1.5s cubic-smooth camera spline blend to player follow camera.
  - Created broadsheet newspaper presentation system (`src/ui/newspaper/`) with morning lead forecast kicker, period launch styling (`EXTRA! EXTRA! ISSUE THE WARNING!`), and evening edition results dispatch with integrated MOO-LAH shop.
  - Added unit test suites `src/presentation/cinematics/opening-cinematic.test.ts` and `src/ui/newspaper/newspaper-presentation.test.ts` (100% pass across 31 total tests).
  - Inlined `[SW:UI:NEWSPAPER_PRESENTATION_V1]` and `[SW:CINEMATIC:PLAYABLE_OPENING_V1]` in `MechanicsLab/SevereWeather_Warning.html`.
  - Added `scripts/verify-newspaper-opening.mjs` verification suite.
- CI Hardening & TypeScript Hygiene:
  - Cleaned up unused imports across test suites and systems ensuring strict `tsc --noEmit` adherence (`noUnusedLocals`).
  - Added `scripts/lib`, `vite.config.ts`, and `vite.prelude.config.ts` to `RENDER_INPUTS` in `scripts/visual-regression-gate.mjs` ensuring historical baseline rebuilds match their exact configuration.
- Building-Specific Debris FX & Color Mapping:
  - Enhanced `spawnActorChunks` with building-specific color palettes (primary wall paint, foundation stone/mortar, structural wood timber, and galvanized metal trim).
  - Added varied fragment geometries (elongated structural planks, flat wall panels, and shattered blocks).
- Revived MOO-LAH Economy & Storm Upgrades:
  - Ported parked MOO-LAH destruction economy and Storm Triangle upgrade loadout (`pull`, `gust`, `gridZap`) into `src/gameplay/economy/` (`MoolahSystem`, `moolah-contracts.ts`).
  - Added unit test suite `src/gameplay/economy/moolah-system.test.ts` (100% pass).
  - Inlined `[SW:GAME:RPG_V1]` in `MechanicsLab/SevereWeather_Warning.html` with persistent LocalStorage schema (`severe_weather_rpg_v1`).
  - Added `scripts/verify-moolah-economy.mjs` verification suite.
- County Fair & Industrial Landmark Animations:
  - Added continuous Ferris wheel mechanical rotation (`speed: 0.22`) for authored and procedural wheel models in District 3.
  - Added active rising industrial smoke plume particle systems to the 32m twin smelting chimneys on the Foundry in District 2.
  - Added `emitSmoke` and `emitMoltenEmber` to `ParticleSystem` (`src/presentation/vfx/`) with unit test coverage.
- Phase 8 Physics & Engine Subsystems Modularization:
  - Created type-safe vortex physics system under `src/gameplay/physics/` (`TornadoPhysicsSystem`, `tornado-physics-contracts.ts`) implementing Rankine vortex velocity fields, radial suction vectors, and ballistic debris particles.
  - Implemented `CollisionDetectionSystem` enforcing the `damageTarget` chokepoint, multi-stage structure degradation, and First Law invariant protection.
  - Created `ParticleSystem` (`src/presentation/vfx/`) and `GameLoopController` (`src/gameplay/loop/`).
  - Added unit test suite `src/gameplay/physics/tornado-physics-system.test.ts` (100% pass across all 27 unit tests).
  - Inlined `[SW:ARCH:PHASE8_ENGINE_BRIDGE]` in `MechanicsLab/SevereWeather_Warning.html` with marker `MODERNIZATION_PHASE8_ENGINE_V1`.
  - Added automated structural verification (`verify-modernization-phase8-engine.mjs` - 19/19 checks pass) and live headless Chrome CDP probe (`qa-modernization-phase8-engine.mjs`).
- Phase 7 Audio & Traffic Subsystems Modularization:
  - Created type-safe audio subsystem under `src/audio/` (`AudioSystem`, `audio-contracts.ts`) managing master/sfx/ambient/ui gain mix, sprite cue playback, and synthesizer fallback.
  - Connected generated 41-clip audio sprite (`assets/audio/storm-feel-sprite.wav` and `assets/audio/storm-feel-manifest.json`) resolving audio load errors and warning logs.
  - Created type-safe ambient traffic subsystem under `src/gameplay/traffic/` (`TrafficSystem`, `traffic-contracts.ts`, `traffic-system.test.ts`) spawning all 4 authored vehicles (`town-car`, `pickup-truck`, `news-van`, `storm-chaser-vehicle`) with waypoint route navigation and panic flee behaviors enforcing the First Law invariant.
  - Inlined `[SW:ARCH:PHASE7_AUDIO_TRAFFIC_BRIDGE]` in `MechanicsLab/SevereWeather_Warning.html` with marker `MODERNIZATION_PHASE7_AUDIO_TRAFFIC_V1`.
  - Added verification test suite (`verify-modernization-phase7-audio-traffic.mjs` - 22/22 checks pass) and headless Chrome CDP probe (`qa-modernization-phase7-audio-traffic.mjs`).
- Phase 6 HUD & UI TypeScript Modularization:
  - Created type-safe TypeScript UI subsystem under `src/ui/` (`HudSystem`, `RampageFeedbackSystem`, `DistrictTransitionSystem`, `ResultsSystem`, and master `UISubsystem`).
  - Added unit test suite `src/ui/hud/hud-system.test.ts` (100% pass across all 20 test cases).
  - Inlined `[SW:ARCH:PHASE6_UI_BRIDGE]` / `[SW:SOURCE:modernization-phase6-ui.js]` in `MechanicsLab/SevereWeather_Warning.html` with marker `MODERNIZATION_PHASE6_UI_V1`.
  - Added automated structural verification (`verify-modernization-phase6-ui.mjs` - 40/40 checks pass) and live headless Chrome CDP probe (`qa-modernization-phase6-ui.mjs`).
- County-Wide High-Detail Model Overhaul (Residential, Commercial, Landmarks & Vehicles):
  - Upgraded 24+ primary models and wrecks (`ranch-house`, `ranch-house-garage`, `craftsman-house`, `craftsman-house-garage`, `split-level-house`, `district-barn`, `grocery-store`, `car-dealership`, `discount-store`, `commercial-shop`, `commercial-shop-gable`, `commercial-shop-mansard`, `commercial-shop-deco`, `courthouse`, `gas-station`, `substation`, `farm-windmill`, `grain-bin`, `water-tower`, `coffee-cup`, `lot-car`) with authentic structural geometry, multi-layer siding, stone foundations, window mullions, shutters, porches, and rooftop HVAC machinery.
  - Re-authored the `coffee-cup` (MOO-BREW) with a proper vertical C-shaped cup handle, dome sipping lid with drinking spout, insulated cardboard sleeve, and espresso spill wreck.
  - Preserved 100% Single Mesh Contract compliance across all 103 `.glb` files with 0 footprint/Y-min/geometry violations (total payload 1.067 MB / 2.0 MB budget).
  - Fixed `ACTOR_MODEL_PATH` routing and ensured vertex-color fidelity across swapped models.
- Residential House Road Alignment & Visible Garage Driveways:
  - Aligned all residential houses and commercial storefronts parallel to the adjacent perimeter street, ensuring front entrances, porches, and garage doors face outward directly towards the road.
  - Prioritized garage house models (`ranch-house-garage`, `craftsman-house-garage`) across residential blocks with procedural white overhead door panels.
  - Adjusted ground dressing lift and pad layering so wide concrete driveway slabs (`drivewayMat`, $4.8\text{m}$ width) connect cleanly from the garage and front facade straight to the asphalt road shoulder.
- QA 90 Playability & Clean Skyline Hotfix:
  - Fixed startup `ReferenceError: Cannot access 'streetPropSets' before initialization` causing black screen in QA 90.
  - Removed obtrusive overhead wire lines that formed thick spiderleg polygons across roads; preserved high-detail authored utility poles with step-down transformer cans and dynamic electric blowout particle bursts.
  - Verified 0 browser console/runtime errors across live Playwright/CDP round simulation.
- County Micro-Dressing (Driveway Mailboxes, Industrial Rail Spur & Pasture Fencing):
  - Placed 47 `rural-mailbox` + `rural-mailbox-wreck` props at the heads of residential driveways along Pine Ridge and the farm belt via instanced street props (costing 1 draw call, fully destructible).
  - Added continuous industrial rail spur tracks (crushed rock ballast bed, 150 creosote timber ties, dual steel rails) along Foundry Row ($X: -280 \to -40, Z = 96$).
  - Added rustic split-rail cedar timber fencing enclosing agricultural pastures in District 3 (instanced into 1 draw call).
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
