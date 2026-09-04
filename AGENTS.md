# Severe Weather Repository Startup Contract

This repository is the durable project memory. Chat history is working context only.

## Read this before anything else: which branch

**The working branch is `qa`. It is the default branch and it is where every
current change lands.** Check out `qa` and read the documents below from `qa`.

Other branches here are historical. Several carry hundreds of commits and look
plausible, so an agent that picks one by name gets a coherent but months-out-of-
date picture and will report finished work as if it were still queued. In
particular `claude/pull-repo-cw2mn8` diverged on 2026-08-20: it is 281 commits
behind `qa`, has 140 commits of its own that were never merged, and does **not**
contain `Docs/BACKLOG.md` at all — so reading the backlog from there silently
falls back to older documents and yields a v4-era task list.

Confirm the branch before starting:

```
git fetch origin qa && git checkout qa && git pull --ff-only
git log -1 --format='%h %ad %s' --date=short    # should be recent
test -f Docs/BACKLOG.md && echo "on the right branch"
```

## Required reading before changing code

Read these files in order:

1. `Docs/BACKLOG.md` — **start here.** The living board: what is queued for each
   lane, what is parked and where it lives, the standing rules that are settled,
   and what landed with the reasoning behind it.
2. `Docs/ACTIVE_HANDOFF.md`
3. `Docs/BUILD_TRAIN.md`
4. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
5. `Docs/ACCEPTED_BEHAVIOR.md`
6. `Docs/QA_BACKLOG.md`
7. `Docs/BUILD_LEDGER.md`
8. `Docs/DECISIONS.md`
9. `Docs/SYSTEM_MAP.md`
10. `Docs/CODE_ANCHORS.md`

### Which backlog is which

There are two, and they are not duplicates. Reading the wrong one is how an
agent misses its own task list:

- **`Docs/BACKLOG.md` — the living work board.** What to do next, per lane
  (assets / code). Decisions that are open and blocking. Standing rules that are
  settled and must not be relitigated. Parked work and exactly where it lives.
  Update it in the same commit as the work it describes.
- **`Docs/QA_BACKLOG.md` — the QA defect register.** Individual numbered defects
  with observed behaviour, correction and acceptance criteria. A defect stays
  open here until evidence closes it.

If a task is "what should I build next", it is in `Docs/BACKLOG.md`. If it is
"this specific thing is broken and here is how we will know it is fixed", it is
in `Docs/QA_BACKLOG.md`.

Then inspect the active branch, draft pull request, and latest successful QA build before proposing changes.

## Operating laws

- Never describe code, CI, or packaging success as physical acceptance.
- The Galaxy S26 Ultra physical test is the final authority for Android behavior.
- Preserve accepted behavior unless the user explicitly approves changing it.
- Follow the current stage in `Docs/BUILD_TRAIN.md`; do not skip ahead, widen scope, or request an APK early without explicit user approval.
- Record every meaningful QA result in `Docs/BUILD_LEDGER.md`.
- Record active defects and acceptance criteria in `Docs/QA_BACKLOG.md`.
- Keep `Docs/BACKLOG.md` current in the **same commit** as the work it describes.
  A backlog updated later is a backlog that is already wrong.
- Update `Docs/ACTIVE_HANDOFF.md` whenever the active branch, build, milestone, build-train stage, or next action changes.
- Record durable product or architecture decisions in `Docs/DECISIONS.md`.
- Use stable searchable code anchors defined in `Docs/CODE_ANCHORS.md`.
- Do not merge an unaccepted gameplay milestone.
- **CI is owned by whoever pushed, and it is checked BEFORE claiming work is
  done — not when someone asks.** Director's call, 2026-09-02. This is written
  here rather than assigned to a person because the failure mode is not an
  unassigned responsibility, it is that red waits to be discovered: two workflows
  once sat red for ten-plus consecutive commits, and on 2026-09-02 four runs went
  red or cancelled in one night and were found only because the director asked
  what was still running. Two supports exist so this does not rest on diligence:
  the SessionStart hook prints the state of every workflow for the commit it just
  synced, and `.github/workflows/ci-alert.yml` opens an issue in this repository
  when a watched workflow fails and closes it when the workflow goes green again.
  If a run is red, that is the next task, ahead of whatever was planned.
- **v5.2.0 is five items, and everything else goes on the NOT IN list.**
  Director's call, 2026-09-04. `Docs/BACKLOG.md` opens with the five, and with a
  `NOT IN v5.2` section directly beneath it. Anything discovered that is not one
  of the five goes on that list **by default** -- including anything you find
  yourself, and especially anything that looks like a quick fix while you are
  already in the file. Not "we'll see", not "while we're here". Promotion off
  that list is a deliberate act by the director, not a default, and not something
  to talk them into. This law exists because the drift was never new ideas: a
  third of three weeks' commits were repairs to the checking apparatus, and every
  finding became work because there was nowhere else to put it. Filing it is
  doing something about it. If you cannot tell whether a finding is one of the
  five, it is not.

- **The game is landscape-only, and every harness viewport must be landscape.**
  Director's call, 2026-09-04. Android enforces it in the manifest
  (`android:screenOrientation="sensorLandscape"`); the browser build asks for the
  lock and raises a stand-by card when refused (`[SW:UI:ORIENTATION_LOCK]`). A
  portrait viewport in a QA script measures a layout that cannot ship —
  `scripts/qa-play-full-round.mjs` did exactly that at 430x932 for months. If a
  new script opens a page, its viewport is wider than it is tall. `npm run
  verify:orientation` checks exactly this and fails the build; do not weaken it
  to make a portrait experiment pass.
- **A burst of pushes is a decision to skip the gate.** `qa-autoplay-full-round`
  sets `cancel-in-progress: true` and takes up to forty minutes, so pushing again
  inside that window cancels the run in flight. Cancelled is not failed and does
  not raise an alert, but it does mean nothing was measured. Batch commits, or
  accept that only the last push of a burst is actually gated.

## Status vocabulary

Use these terms precisely:

- **Committed**: source exists in Git.
- **Building**: CI is running.
- **Built**: CI completed and produced the expected artifact.
- **Browser-QA passed**: tested successfully through the GitHub Pages QA lane.
- **Physically accepted**: tested and approved on the target Android device.
- **Merged**: accepted branch integrated into `main`.

## Gameplay source is flat

`MechanicsLab/SevereWeather_Warning.html` is the game and is edited directly.

It used to be a frozen older base that 24 `scripts/apply-*.mjs` patches rewrote on
every build. That chain has been flattened away: there is no `patch:*` npm script,
no patch step in any workflow, and no anchor text to preserve. If you need to change
the game, change the file.

Navigate it with the `[SW:AREA:NAME]` region tags listed in the header comment at
the top of the gameplay script.

Logic that began life as separate modules — the Three.js production slice and the
four modernization bridges — lives inside `// [SW:SOURCE:<name>]` regions of that
same script. The bridges *must* be inline: they close over its `let` bindings
(`runTimeRemaining`, `cooldowns`, `triggerAbility`, …), so they cannot load as
separate `<script src>` files.

There used to be a `runtime/` directory holding a second copy of every one of
those regions, which the verifications read and `build-web.mjs` shipped next to
the bundle where nothing loaded it. Keeping the two in step was a manual step
that was missed more than once. The copies are gone: `scripts/lib/inlined-regions.mjs`
reads the regions straight out of the gameplay source, so the file the game runs
is the only file there is. Add a region by adding its marker — nothing else needs
teaching.

## Moving logic out of the inline script

The gameplay source is one classic `<script>` in a single lexical scope, so it
cannot `import`. That is the constraint behind everything here: it is why the
modernization bridges are inlined rather than side-loaded, and why extracting
logic needs a delivery route rather than just a module.

The route is `src/gameplay/economy` — the worked example. Pure logic lives in
TypeScript, is typechecked by `tsc` and covered by `npm test`, compiles through
`vite.prelude.config.ts` to an IIFE, and `scripts/build-web.mjs` inlines it at
the `<!-- [SW:BUILD:ECONOMY_PRELUDE] -->` marker **ahead of** the gameplay
script. The game then calls it synchronously while building the world.

To extract another piece, follow that shape:

1. It has to be genuinely pure — no `THREE`, no DOM, no gameplay globals. Logic
   entangled with the scene graph is not ready to move yet.
2. Add it to the prelude entry so it lands on `globalThis`.
3. Have the gameplay **call** it, keeping a literal fallback so a missing prelude
   degrades instead of throwing mid-run.
4. Add a `verify-qa-package` check that the prelude is present *and used* —
   without one, a regression to the fallback path is invisible.

The distinction that matters: the phase bridges *mirror* the game and validate
it; the prelude *is* the game's logic. Prefer extraction over another mirror.

## Checks that can actually see

`npm test` runs `node:test` with Node 22 type stripping — real TypeScript tests,
no extra dependencies. Every `verify-*.mjs` check is a string match against the
source and cannot see anything; roads on causeways, a sand checkerboard, black
metals and cars buried in asphalt all shipped with them green.

`node scripts/visual-regression-gate.mjs` renders the build against the previous
one and fails when the picture moves. It fails on **intended** changes too — put
`[visual-change]` in the commit message to accept one, which leaves a record in
history of every commit allowed to move the picture.

### Reproducing a CI-only rendering difference

The capture harness freezes `requestAnimationFrame`, `performance.now`,
`Date.now` and `Math.random`, so it is tempting to read any remaining difference
as renderer noise. For a long time this repo did exactly that, and the gate grew
a three-attempt voting rule to work around "renderer nondeterminism on this
project's CI runner". It was not the renderer.

**Frame count is the hidden clock.** Freezing rAF does not stop the world
advancing — it just means the harness decides when it advances. Almost
everything animated moves by a fixed amount per *frame* rather than per unit of
simulated time: the mesocyclone canopy at `+0.04` rad, the funnel at `+0.15`,
the dust skirt's orbit angle, and the camera follow rig's `0.08` lerp at
`[SW:VISUAL:CAMERA_FOLLOW]`. So the picture is a function of how many frames
have been stepped — and the boot loop used to stop the instant the page reported
ready, which is pure wall clock. An idle machine got there in zero frames and a
loaded runner in dozens, so the same build was captured at a different phase of
the same animation and about a fifth of the frame changed.

`advanceFrozenBoot` now pads to a fixed `deterministicBootFrames` and throws if
readiness needs more, so every capture in a run shares one animation phase.

Three things make this class findable instead of mythical:

- `SEVERE_WEATHER_VISUAL_CPU_THROTTLE=20` throttles Chrome's CPU so a fast
  machine boots as slowly as a loaded runner. What was invisible locally and
  constant on CI then reproduces in a single run.
- A `semantic=false` line names the fields that moved
  (`camera.y 57.29->57.77`) instead of only reporting that something did.
- Equal-versus-unequal boot frame counts is the diagnostic: two captures that
  stepped the same number of frames come out byte-identical, and two that did
  not, do not.

If you add per-frame animation, prefer deriving it from the simulated clock over
accumulating it, and suspect the harness before the renderer.
