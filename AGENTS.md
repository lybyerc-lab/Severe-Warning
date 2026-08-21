# Severe Weather Repository Startup Contract

This repository is the durable project memory. Chat history is working context only.

## Required reading before changing code

Read these files in order:

1. `Docs/ACTIVE_HANDOFF.md`
2. `Docs/BUILD_TRAIN.md`
3. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
4. `Docs/ACCEPTED_BEHAVIOR.md`
5. `Docs/QA_BACKLOG.md`
6. `Docs/BUILD_LEDGER.md`
7. `Docs/DECISIONS.md`
8. `Docs/SYSTEM_MAP.md`
9. `Docs/CODE_ANCHORS.md`

Then inspect the active branch, draft pull request, and latest successful QA build before proposing changes.

## Operating laws

- Never describe code, CI, or packaging success as physical acceptance.
- The Galaxy S26 Ultra physical test is the final authority for Android behavior.
- Preserve accepted behavior unless the user explicitly approves changing it.
- Follow the current stage in `Docs/BUILD_TRAIN.md`; do not skip ahead, widen scope, or request an APK early without explicit user approval.
- Record every meaningful QA result in `Docs/BUILD_LEDGER.md`.
- Record active defects and acceptance criteria in `Docs/QA_BACKLOG.md`.
- Update `Docs/ACTIVE_HANDOFF.md` whenever the active branch, build, milestone, build-train stage, or next action changes.
- Record durable product or architecture decisions in `Docs/DECISIONS.md`.
- Use stable searchable code anchors defined in `Docs/CODE_ANCHORS.md`.
- Do not merge an unaccepted gameplay milestone.

## Status vocabulary

Use these terms precisely:

- **Committed**: source exists in Git.
- **Building**: CI is running.
- **Built**: CI completed and produced the expected artifact.
- **Browser-QA passed**: tested successfully through the GitHub Pages QA lane.
- **Physically accepted**: tested and approved on the target Android device.
- **Merged**: accepted branch integrated into `main`.

## Gameplay source is flat

`MechanicsLab/SevereWeather_3D_Lab.html` is the game and is edited directly.

It used to be a frozen older base that 24 `scripts/apply-*.mjs` patches rewrote on
every build. That chain has been flattened away: there is no `patch:*` npm script,
no patch step in any workflow, and no anchor text to preserve. If you need to change
the game, change the file.

Navigate it with the `[SW:AREA:NAME]` region tags listed in the header comment at
the top of the gameplay script. `runtime/*.js` is no longer a build input — see
`runtime/README.md`.

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
