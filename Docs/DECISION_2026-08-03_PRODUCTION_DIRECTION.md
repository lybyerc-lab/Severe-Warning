# Production Direction Decision Record

**Decision date:** 2026-08-03 Central Time  
**Project:** Severe Weather Warning  
**Repository:** `lybyerc-lab/Severe-Warning`

This file records the current production decisions made after the Babylon.js comparison, Defold review, Three.js production-slice work, and successful V5.1 automated gate.

## Decision 1: Restore and protect the full product name

The canonical full game name is:

# Severe Weather Warning

`Heartland` is campaign/content terminology. It must not replace the product name in documentation, build metadata, menus, artifacts, or future release identity.

### Reason

The full title was lost during rapid branch and milestone naming. Product identity and campaign identity must remain separate.

### Revisit condition

Only an explicit owner-approved product rebrand can change the canonical title.

## Decision 2: Three.js remains production

Three.js is the production renderer and gameplay runtime.

### Reason

The current game already contains the costly working systems:

- controls
- abilities
- scoring
- districts
- campaign
- destruction
- audio
- HUD
- mobile behavior
- Android packaging
- cleanup
- QA contracts

Rebuilding those systems in another engine would create two jobs: restore current parity, then improve the game.

### Rejected alternatives

- migrate production to Babylon.js
- resume Unity or Godot recreation
- perform an engine rewrite solely to improve visuals

### Revisit condition

Reopen the engine decision only when repeated measured evidence shows that Three.js cannot meet a specific production requirement after reasonable pipeline and architecture improvements.

## Decision 3: Babylon.js becomes archived research

Babylon.js replaces no production component.

PR #14 remains an isolated laboratory record and should not merge into production.

### Useful findings to preserve

- layered tornado depth
- darker storm atmosphere
- closer dramatic camera
- clearer Cow 17 scale
- authored roof-peel chunks
- stronger debris and ground interaction

### Reason

The Babylon showcase looked different, but not clearly better enough to justify migration. Its main value was identifying transferable visual ideas and proving that a renderer change alone does not solve the art and content problem.

### Revisit condition

None for the current production plan. Individual ideas may be ported into Three.js after fixed comparisons.

## Decision 4: Defold is Plan B, not an active port

Defold is the strongest current full-engine alternative for a compact native/mobile-first version of the game.

It does not replace Three.js now.

### Proof condition

A Defold vertical slice may be built only to test a specific suspected Three.js limitation, using:

- one farm block
- one Cow 17
- one controllable tornado
- one destructible barn
- one Gust or Pull interaction
- one Android build
- optional HTML5 build
- same assets, camera, lighting target, and gameplay sequence
- actual FPS, memory, startup, build size, and iteration measurements

### Revisit condition

Proceed only when tooling, native deployment, scene authoring, or another explicit requirement becomes the measured blocker.

## Decision 5: Complete the V5.1 gate before modernization

PR #15 at commit `c49ba1c52ac58d3bd1c6e1d60d7e84cd28a16c72` completed its full automated workflow successfully.

### Exact evidence

- GitHub Actions run: `30868496726`
- Artifact ID: `8877035856`
- Artifact archive digest: `sha256:f689133f9200d6847034ebce2d9933c7150f0c879c2aada69c64d091ebbb950a`
- Desktop browser QA: passed
- Mobile-landscape browser QA: passed
- Android sync: passed
- APK assembly: passed
- Package upload: passed

### Acceptance boundary

Automated success does not equal physical acceptance. The owner must still test the browser preview and APK.

## Decision 6: Modernize the structure now

The current patch-chain and single-file construction method are slowing development.

The next engineering milestone is a controlled Vite/TypeScript modernization.

### Approved direction

- Vite
- TypeScript with strict checking
- ES modules
- explicit `GameApp`
- explicit `GameContext`
- owned system lifecycle
- separate render, simulation, and run clocks
- data-driven campaign, district, building, landmark, and destruction definitions
- formal QA bridge
- continued Capacitor Android packaging

### Rejected alternative

Delete the current runtime and rewrite the game from scratch.

### Migration policy

Use a strangler migration through a compatibility adapter. Extract coherent systems in substantial phases and remove old patch machinery only after parity is proven.

### Revisit condition

The architecture may evolve during implementation, but the no-rewrite and preserve-behavior constraints remain unless explicitly changed by the owner.

## Decision 7: Separate architecture modernization from the Three.js upgrade

Do not upgrade the renderer version during the first structural migration.

### Reason

Combining architecture changes and renderer breaking changes would make regressions difficult to attribute and would weaken visual comparisons.

### Sequence

1. modernize structure on the current renderer behavior
2. establish golden gameplay and visual tests
3. upgrade Three.js in a dedicated later milestone

## Decision 8: No Netlify

Netlify is not part of the Severe Weather Warning workflow.

### Approved hosting direction

- GitHub Actions for build and verification
- GitHub Pages for a future exact-commit QA preview
- Capacitor artifacts for Android testing

### Current truth

The existing workflow packages a `web-preview`; it does not yet deploy a permanent QA site.

### Revisit condition

Only an explicit owner decision may introduce another host.

## Decision 9: Efficient milestone cadence

The owner prefers substantial, coherent milestones instead of many tiny test builds.

### Working cadence

1. implement a complete phase
2. run automated gates
3. one browser review
4. one consolidated correction pass
5. one APK gate
6. physical acceptance

Routine technical decisions should be made without repeatedly interrupting the owner. Pause only for changes that materially affect gameplay, scope, visual identity, protected behavior, platform strategy, or product identity.

## Governing rule

> It improves or it does nothing. We only alter what is an improvement.
