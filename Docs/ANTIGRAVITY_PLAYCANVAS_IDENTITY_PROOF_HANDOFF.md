# PlayCanvas Loaded-Engine Identity Proof Handoff

Last updated: 2026-08-06 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Working branch: `agent/playcanvas-engine-identity-proof`
PR: #31
Base: `agent/playcanvas-production-slice-handoff`

## Mission

Seal the isolated PlayCanvas browser proof by running the exact committed engine, build, Chromium QA, screenshot, and artifact workflow.

This is verification and demonstrated-defect correction only. Do not change gameplay, Three.js runtime, scene composition, Android packaging, campaign logic, controls, abilities, scoring, timing, or saves.

## Current automated route

The repository now owns the CI trigger and exact-head provenance checks directly. The dedicated workflow:

- accepts pull request `opened`, `synchronize`, `reopened`, and `edited` events
- checks out `github.event.pull_request.head.sha`
- verifies the checked-out commit equals that exact SHA before dependency installation
- stamps the same exact source SHA into the evidence artifact

No external Antigravity execution is required for this gate.

## Required checks

The workflow runs, in order:

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

It then starts the Vite preview and executes `scripts/qa-playcanvas-slice.mjs` against the real browser scene.

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

## Return evidence

Record on PR #31:

- final source SHA
- workflow run ID and run number
- engine filename, bytes, and SHA-256
- exported PlayCanvas version and revision
- static verifier result
- browser QA result and failed-check list
- screenshot path and manual verdict
- artifact name, ID, and digest
- explicit statement that Android was not built or physically accepted

Do not merge PR #31 until the exact final head is green and the artifact has been downloaded and inspected.
