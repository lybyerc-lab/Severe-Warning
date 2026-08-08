# Active Handoff

**Last updated:** 2026-08-08 10:34 America/Chicago  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Current direction:** guarded PlayCanvas production-renderer migration  
**Current build train:** `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`  
**Current bounded milestone:** Moo Brew opening / tactical gameplay handoff

## Current implementation lane

- Handoff branch: `agent/playcanvas-moo-brew-intro-handoff`
- Handoff memory commit: `91ff8e26bf15edbd33d3a3a87f03549b49994588`
- Implementation branch: `agent/playcanvas-moo-brew-intro`
- Draft PR: #39
- Exact intro code commit before this memory refresh: `b9076422b752c83fcb9413200ebc5fecd4d93d25`
- PR base: `agent/playcanvas-moo-brew-intro-handoff`
- Workflow status at this update: no run reported yet; do not call it building or green

## Exact protected parent checkpoint

This lane descends directly from the sealed PR #37 gameplay source:

- source: `8d390f04223faaa268040afbeaa9eff885a81786`
- PlayCanvas Run 76 / `31259029449`: PASS
- artifact: `severe-weather-playcanvas-slice-76`
- artifact ID: `9022302146`
- artifact digest: `sha256:a93cbd962eacb59db434a774184bdd3b7a15dbc6b4cb6fe2230d10823f864289`
- QA promotion: `4822336f207239ae1444de57e85c6b0be8867bea`
- Pages Run 75 / `31259512722`: PASS

Run 76 is assistant-reviewed and public-browser-QA passed. The owner Galaxy browser verdict for the PR #37 destruction-polish candidate is still pending. Forward engineering is authorized, but that pending verdict must remain pending in all acceptance language.

## Protected browser-stage behavior

Do not retune or replace:

- Pull peak tree tilt `0.4218329627222749 rad`
- Gust peak tree tilt `0.3673336055836977 rad`
- Pull inward light-prop displacement `5.374028004530404`
- Pull tangential/orbit displacement `1.340381940964075`
- Gust outward light-prop displacement `5.042881747270892`
- Run 62 camera/Cow 17 rotation-stability behavior
- one-stick camera semantics and owner trailing scale `0.9`
- current storm speed / visible-authority scale
- Run 76 staged structure breakup and debris mass hierarchy
- Pull/Gust/Zap acceptance and cooldown semantics
- health, destruction, scoring, combo, three-minute timer, campaign authority
- safe/invincible/non-targetable animal law
- deterministic reset and cleanup

## Current implementation contract

PR #39 adds a bounded presentation-only Moo Brew opening without changing `main.ts` gameplay ownership.

`playcanvas-slice/src/entry.ts` is now the browser entrypoint. It:

1. creates the intro controller
2. awaits intro completion or bypass
3. only then dynamically imports `main.ts`

Because `main.ts` creates and connects `PlayCanvasAuthorityClient`, this ordering is the hard timing gate: the accepted authority and three-minute warning run cannot start behind the cinematic.

## Canonical intro phases

The implementation preserves this exact phase order:

1. `newspaper`
2. `farm-reveal`
3. `moo-brew-sip`
4. `weather-warning`
5. `cow-double-take`
6. `chicken-scatter`
7. `tornado-touchdown`
8. `tactical-handoff`

The intro is skippable and presentation-only.

## QA policy implemented in PR #39

- ordinary `?qa=1` skips the timed cinematic
- `?qa=1&intro=1` forces deterministic intro QA
- `?intro=0` explicitly bypasses it
- completed/skipped intro is remembered for the browser session
- dedicated QA can select phases without waiting real seconds
- intro QA exposes presentation state only, not gameplay mutation helpers
- static verification checks that the intro gate precedes dynamic import of gameplay
- browser QA must prove no PlayCanvas gameplay slice exists before intro finish
- after handoff, the accepted run must begin fresh at stage 1 with zero destruction score and near the full warning time
- inherited storm, camera/Cow, and multi-structure suites remain mandatory
- screenshots are required for newspaper, Moo Brew/Cow 17, touchdown, and playable handoff

## Files added or changed in the intro code commit

- `playcanvas-slice/index.html`
- `playcanvas-slice/src/entry.ts`
- `playcanvas-slice/src/moo-brew-intro.ts`
- `playcanvas-slice/src/moo-brew-intro.css`
- `scripts/verify-playcanvas-intro.mjs`
- `scripts/qa-playcanvas-intro.mjs`
- `.github/workflows/playcanvas-production-slice.yml`

## Immediate gate

The next action is verification, not more feature work:

1. wait for/inspect the exact-head PR #39 PlayCanvas workflow
2. if red, fix the cause without weakening QA or protected behavior
3. if green, inspect the intro artifact screenshots and intro report
4. assistant-play/review the candidate before any QA Pages promotion
5. only then consider promoting the exact artifact to `/playcanvas/` for owner browser review

Do not expand the intro scope while this gate is unresolved.

## Acceptance vocabulary

For PR #39 at this update:

- implementation committed: yes
- draft PR open: yes (#39)
- exact-head CI: not yet reported
- browser QA: not yet proven
- assistant visual review: not yet
- owner browser verdict: not yet
- PlayCanvas Android APK: not built
- physical Android acceptance: no
- merged: no

For PR #37 destruction polish:

- implementation committed: yes
- browser QA: passed
- assistant review: passed
- public QA deployment: passed
- owner Galaxy browser verdict: pending
- PlayCanvas Android physical acceptance: no
- merged: no

Never convert browser success into physical Android acceptance language.
