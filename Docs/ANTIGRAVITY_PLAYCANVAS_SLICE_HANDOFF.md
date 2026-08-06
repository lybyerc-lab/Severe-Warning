# Antigravity Handoff: PlayCanvas Moo-Brew Production Slice Bootstrap

**Project:** Severe Weather Warning  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Authoritative parent branch:** `agent/playcanvas-moo-brew-slice-bootstrap`  
**Parent head before this handoff:** `13db79f9250953e74739c1a479c6f9cdc273426e`  
**Required work branch:** `agent/playcanvas-moo-brew-slice-antigravity`  
**PR target:** `agent/playcanvas-moo-brew-slice-bootstrap`  
**Mode:** Verify and harden the isolated renderer bootstrap. Do not widen into full migration or Android packaging.

## Mission

Run the first real PlayCanvas browser proof from the committed isolated slice, correct only defects demonstrated by that proof, and return exact reproducible evidence.

The accepted Three.js game remains the gameplay and behavior authority. This assignment must not edit, initialize, or replace it.

## Start exactly here

```bash
gh repo clone lybyerc-lab/Severe-Warning
cd Severe-Warning
git fetch origin
git switch -c agent/playcanvas-moo-brew-slice-antigravity \
  origin/agent/playcanvas-moo-brew-slice-bootstrap
git rev-parse HEAD
```

Confirm the starting SHA resolves to the current remote head. Record it in the draft PR body.

## Read before changing code

1. `AGENTS.md`
2. `Docs/ACTIVE_HANDOFF.md`
3. `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`
4. `Docs/DECISIONS.md`
5. this handoff
6. `playcanvas-slice/README.md`
7. `Docs/IMPLEMENTATION_TRUTH_GATE.md`
8. the complete diff for PR #28

Repository code and exact evidence outrank prose when they conflict.

## Existing checkpoint

The parent branch already contains:

- isolated PlayCanvas 2.21.3 preview source
- authored Prairie Junction road intersection
- explicit terrain, road, and tornado vertical contracts
- low-poly Cow 17 readability proof
- basic buildings, lighting, materials, and tornado layers
- separate Vite output at `playcanvas-slice-dist`
- exact-version engine fetch script
- strict TypeScript lane
- static contract verifier
- real Chromium QA harness
- dedicated evidence workflow

Preliminary local checks already passed:

- strict TypeScript source checking
- Node syntax checking
- all 18 static contract checks

These are preliminary only. A real engine build and browser run remain unproven.

## Why Antigravity is needed

The originating environment could write the repository through the GitHub app but could not:

- resolve or connect to the PlayCanvas CDN from its shell
- dispatch a new GitHub Actions workflow through the available connector
- trigger Actions from connector-authored commits, because GitHub suppresses recursive app events

Do not describe this as a code failure. No PlayCanvas workflow run exists yet.

A normal Git push from Antigravity or a Codespace should produce a `synchronize` event and start the committed workflow.

## Required verification sequence

Run in this order:

```bash
corepack enable
pnpm install --frozen-lockfile
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

## Checksum gate

The engine fetch produces `playcanvas-slice-engine-report.json`.

After the first successful exact download:

1. verify the payload identifies PlayCanvas 2.21.3
2. inspect its byte size and SHA-256
3. pin that SHA-256 in the dedicated workflow using `PLAYCANVAS_EXPECTED_SHA256`
4. rerun the fetch and prove `checksumPinned=true`
5. record the exact SHA-256 in the PR body and evidence

Do not substitute `latest`, a version range, or a different engine version.

## Blocking browser checks

The browser report must prove:

- a real PlayCanvas canvas exists
- renderer identity is `PlayCanvas`
- engine version is `2.21.3`
- road clearance is at least `0.10 m`
- tornado-to-road clearance is at least `0.18 m`
- the scene contains at least 40 entities
- QA mode is active
- no browser console errors
- no uncaught page errors
- disposal removes the canvas
- disposal clears the global slice handle
- disposal clears readiness telemetry

Inspect the screenshot manually. A machine-green blank, black, clipped, or nonsensical scene is a failure.

## Correction boundary

Correct only demonstrated bootstrap defects such as:

- PlayCanvas API incompatibility
- bad ESM loading or Vite paths
- invalid primitive or material configuration
- camera framing that hides the proof scene
- road, terrain, sidewalk, or tornado height mistakes
- lifecycle or disposal leaks
- brittle QA assertions
- evidence packaging defects

Do not add gameplay, controls, destruction simulation, campaign logic, cutscene expansion, Android packaging, GLB production assets, or broad visual polish in this assignment.

## Protected files and systems

Do not change:

- `MechanicsLab/SevereWeather_3D_Lab.html`
- accepted Three.js runtime modules
- scoring, combo, objectives, or campaign timing
- Pull, Gust, or Zap behavior
- save schemas
- Capacitor Android package
- PRs #24, #25, #26, or #27
- `main`

Before pushing, prove the historical gameplay source remains unchanged:

```bash
git diff --exit-code \
  origin/agent/playcanvas-moo-brew-slice-bootstrap -- \
  MechanicsLab/SevereWeather_3D_Lab.html
```

## GitHub evidence contract

Push the descendant branch and open a draft PR. The exact pushed head must pass the PlayCanvas workflow.

Return:

- starting SHA
- final source SHA
- draft PR number and target
- workflow run ID and run number
- engine filename, byte size, and SHA-256
- workflow artifact name, ID, and digest
- static report result
- browser report result and failed-check list
- screenshot path and manual visual verdict
- explicit Android status: not built and not physically accepted

Do not claim implementation success until the exact pushed head has a completed green workflow and the evidence artifact has been downloaded and inspected.