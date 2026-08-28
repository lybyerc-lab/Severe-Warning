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

State at last update: 128 models, 1.93 MB of the ~2 MB budget (**97% — the
model budget is effectively spent**; the next batch has to displace something or
the cap has to move). 3 branches, 0 open PRs, 127 archive tags. `qa` is the
default and the working branch.

---

## Next up — AG (assets)

**Three intact models can be seen through. Repairs, not additions — they do not
touch the model budget** (the displace-before-adding rule is for new models; see
Decisions open). Reproduce any of this with `pnpm models:seethrough`.

1. **`industrial-warehouse-curved` — one end of the barrel vault is uncapped.**
   16 edges belong to a single triangle each and trace a closed ring on the
   plane **z = -6**, the mouth of the vault:
   `[0,-4.50,-6] -> [2.30,-4.04,-6] ... [0,7.50,-6] ... ` 16 segments, closed.
   The material is innocent — opaque, opacity 1, FrontSide — so nothing about it
   explains the look. Front-face culling discards the faces pointing away, so
   where the cap should be you see straight through the building. Rendered in
   isolation it is a solid dome from one end and an almost invisible crescent
   from the other. **Cap the z = -6 end and re-export.** 65.2% of its silhouette
   is backface at the worst angle.

2. **`farm-windmill` — a large inside-out sphere around the fan.** Rendered at
   four yaw angles it is a normal windmill at 0/90/270 and grows a **solid white
   ball swallowing the whole fan at 180**. A sphere whose faces point inward is
   invisible from most angles and opaque from one; in play the windmill would
   balloon into a white ball as the camera orbits past. **Fix the winding (or
   drop the sphere if it is a leftover) and re-export.** 68.5%.

3. **`tractor` — 31.5%, cause not established.** Flagged by the same check and
   worth a look, but unlike the two above nobody has yet confirmed what is wrong
   or that it is visible in play. Diagnose before changing anything.

Wrecks are deliberately excluded from the failure list — a wreck is meant to be
torn open and a torn edge legitimately shows its back. Eight are above the
threshold and are printed as a note; `farm-windmill-wreck` at 86.9% probably
carries the same inside-out sphere as its intact twin and is worth checking
while that one is open.

## Next up — Code & Modernization

From a director's pass played on a 915x412 phone viewport. Ordered by cost to
the player, not by ease of fixing. Each one says what was actually measured, so
the next person does not have to re-derive it.

1. **The opening cutscene's staging, now that it can be seen.** It runs clean —
   zero page errors, subtitles advancing, letterbox and skip behaving — but it
   had thrown on every frame since it shipped, so this is the first time anyone
   has looked at the composition, and it needs work:
   - The camera sits low and close, so the barn is a **flat red slab filling the
     right half of frame** — no roof, no depth, two white rectangles for doors.
   - **Cow 17 reads as a small white blob.** The articulated rig, the arms and
     the Moo Brew cup are all in the code and none of it survives the framing.
   - The pale green ellipsoid behind the barn **reads as a placeholder** — a
     giant green pill rather than a hill or a tree.
   "Another peaceful morning in Lincoln County" wants a wide, warm establishing
   shot. It is currently a close-up of a wall. **This is framing work, not
   assets** — worth doing before spending any displaced model budget.

2. **The mesocyclone reads as a hard-edged ellipse.** From the play camera the
   canopy above the funnel is a flattened disc with a distinct rim — closer to a
   saucer silhouette than a rotating wall cloud. The funnel itself is legible
   once the HUD folds away (see the note in Landed), so this is about the
   canopy's edge treatment, not the tornado's scale.

3. **The town still flattens at play altitude.** Roofline and silhouette are all
   that survive at the distance most of the game is actually played from, and
   there are wide flat pale-green gaps between roads in the foreground. The
   asymmetry and ground-dressing work helped; distance is the remaining problem.
   Any fix here should be measured from the storm camera, not from a low pass.

Previously landed and cleared: the source HTML rename, the county fair /
industrial landmark animations, and the MOO-LAH economy with Storm Triangle
upgrades and cosmetic funnel skins.

## Decisions open

- ~~The model budget is at 97%.~~ **Settled: displace before adding.** 128
  models, 1.93 MB against a ~2 MB cap (measured: `du -sb assets/models` =
  2,026,182 bytes). Director's call is that the cap holds — **a new model must
  retire an existing one.** AG cannot start a batch by adding; the batch request
  has to name what it displaces.
  Known slack, both already parked and unplaced, so retiring them costs nothing
  on screen: `fire-hydrant` / `fire-hydrant-wreck` (308 tris an instance, renders
  5–8 px tall) and `hart-barn` / `hart-barn-wreck` (the hero barn is deliberately
  not model-backed — see Standing rules). Measure before promising the space.

- **Should `models:seethrough` gate the build?** It is an on-demand script right
  now and deliberately not wired into `pnpm build` or CI, because it currently
  FAILS on three models and CI was only just restored to green — turning it red
  again the same day, for a pre-existing asset fault, would bury the signal.
  Once AG has repaired `industrial-warehouse-curved`, `farm-windmill` and
  `tractor`, it should become a build guard alongside the two in
  `scripts/build-web.mjs`, so a model with a hole can never ship again. It adds
  roughly a minute (128 models x 8 angles x 2 renders at 192px).

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
