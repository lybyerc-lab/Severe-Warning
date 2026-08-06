# Antigravity Handoff: PlayCanvas Loaded-Engine Identity Proof

Last updated: 2026-08-06 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Working branch: `agent/playcanvas-engine-identity-proof`
PR: #31
Base: `agent/playcanvas-production-slice-handoff`
Implementation commit before this handoff: `ae4692fcf199df3a172db28a7349fe8595534b7b`

## Mission

Seal the isolated PlayCanvas browser proof by running the exact committed engine, build, Chromium QA, screenshot, and artifact workflow.

This is verification and demonstrated-defect correction only. Do not change gameplay, Three.js runtime, scene composition, Android packaging, campaign logic, controls, abilities, scoring, timing, or saves.

## Ownership transfer

The repository-writing agent has finished the identity-hardening patch. Antigravity may now take write ownership of `agent/playcanvas-engine-identity-proof` until the gate is sealed.

Start with:

```bash
gh repo clone lybyerc-lab/Severe-Warning
cd Severe-Warning
git fetch origin
git switch agent/playcanvas-engine-identity-proof
git pull --ff-only origin agent/playcanvas-engine-identity-proof
git rev-parse HEAD
```

Confirm the remote head contains this handoff and the four-file identity patch.

## Required checks

Run in order:

```bash
corepack enable
pnpm install --frozen-lockfile
PLAYCANVAS_EXPECTED_SHA256=d77c4337e8a2fd1dbc38f19b55af8d087a47ca378366558b55aeef4de6a8adb4 \
  node scripts/fetch-playcanvas-engine.mjs
pnpm exec tsc -p tsconfig.playcanvas.json --noEmit
node scripts/verify-playcanvas-slice.mjs
pnpm exec vite build --config vite.playcanvas.config.ts
pnpm exec playwright install --with-deps chromium
```

Start the preview:

```bash
pnpm exec vite preview \
  --config vite.playcanvas.config.ts \
  --host 127.0.0.1 \
  --port 4175
```

In another shell:

```bash
PLAYCANVAS_SLICE_URL='http://127.0.0.1:4175/?qa=1' \
  node scripts/qa-playcanvas-slice.mjs
```

## Blocking identity proof

The browser report must show:

- `renderer = PlayCanvas`
- loaded module `engineVersion = 2.21.3`
- loaded module `engineRevision` is a resolved revision string of at least seven characters
- DOM dataset version and revision exactly agree with loaded-module telemetry
- road clearance is at least `0.10 m`
- tornado-to-road clearance is at least `0.18 m`
- at least 40 scene entities
- no console or page errors
- disposal removes canvas, global handle, readiness, version, and revision evidence

Manually inspect `playcanvas-slice-evidence/playcanvas-slice.png`. A blank, black, clipped, or nonsensical frame is blocking.

## GitHub event requirement

The GitHub connector-created PR did not emit an Actions event. After local checks pass, create and push a normal commit from Antigravity. If no source correction is required, use one explicit empty event commit:

```bash
git commit --allow-empty -m "ci: trigger PlayCanvas loaded-engine identity proof"
git push origin agent/playcanvas-engine-identity-proof
```

The pushed head must produce the `PlayCanvas Production Slice Bootstrap` workflow.

## Return evidence

Record on PR #31:

- starting and final SHA
- workflow run ID and run number
- engine filename, bytes, and SHA-256
- exported PlayCanvas version and revision
- static verifier pass count
- browser QA pass count and failed-check list
- screenshot path and manual verdict
- artifact name, ID, and digest
- explicit statement that Android was not built or physically accepted

Do not merge PR #31 until the exact final head is green and the artifact has been downloaded and inspected.