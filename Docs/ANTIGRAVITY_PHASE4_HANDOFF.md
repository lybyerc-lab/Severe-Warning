# Antigravity Handoff: Phase 4 Scoring, Districts, Campaign, and Persistence

**Project:** Severe Weather Warning  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Handoff branch:** `agent/phase3-knowledge-antigravity-handoff`  
**Required work branch:** `agent/phase4-scoring-campaign-antigravity`  
**PR target:** `agent/phase3-knowledge-antigravity-handoff`  
**Mode:** Controlled strangler migration, not a rewrite

## 1. Mission

Implement Modernization Phase 4 by extracting explicit typed ownership for:

- scoring
- combos
- district progression
- campaign progression
- campaign persistence

Preserve all accepted gameplay, presentation, timing, input, audio, and campaign behavior.

The goal is not to redesign the game. The goal is to make the existing behavior deliberate, typed, testable, and data-driven enough that future Heartland stops can be added safely.

## 2. Read before changing code

Read in this exact order:

1. `CURRENT_STATUS.md`
2. `Docs/RECOVERED_KNOWLEDGE_BASE.md`
3. this file
4. `Docs/MODERNIZATION_PLAN.md`
5. `Docs/MODERNIZATION_DEVICE_ACCEPTANCE_2026-08-04.md`
6. `Docs/DECISION_2026-08-04_RECOVERED_KNOWLEDGE_AND_AGENT_PROTOCOL.md`
7. `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
8. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
9. `Docs/NO_DRIFT_POLICY.md`
10. current code, workflows, QA scripts, and PR history

Repository code and exact build evidence outrank prose when they conflict.

## 3. Branch protocol

Do not write to the handoff branch or any earlier branch.

Start with:

```bash
git fetch origin
git switch -c agent/phase4-scoring-campaign-antigravity \
  origin/agent/phase3-knowledge-antigravity-handoff
git rev-parse HEAD
```

Record the starting SHA in the first Phase 4 status note and eventual PR body.

Rules:

- one writer per branch
- no force pushes unless correcting Antigravity's own unpublished local history
- no merge, rebase, retarget, close, or squash of PR #13 through PR #19
- no changes to `main`
- no changes to PR #14 or Babylon.js laboratory files
- no Netlify work
- draft PR only

## 4. Current accepted baseline

### Production and platform

- Three.js r128
- Vite 8.1.5
- TypeScript 7.0.2 with strict checking
- Playwright 1.55.0
- Capacitor 8.5.0
- pnpm 11.9.0
- Node.js 22 in CI
- JDK 21 in CI
- Android landscape
- offline local assets

### Accepted modernization heads

- Phase 1: `710ee8537e3d4ca6424b8bf32b282abae0dbfc28`
- Phase 2: `381014d3d7f4a128e5c6e285200fdb2790af94b5`
- Phase 3: `b9d55188f91ade720a50837f15591c91209098ad`

### Accepted behavior to preserve

- direct joystick and keyboard movement
- Pull, Gust, and Grid Zap
- no duplicate Android ability activation
- three-minute real-time warning clock
- pause and background time hold
- continuous score across district boundaries
- forward-only district progression
- three-star results
- ordered Heartland unlocks
- best score and run-count persistence
- selected stop and furthest unlock persistence
- retry and next-stop flow
- QA4 input isolation
- deterministic reset and cleanup
- media moments, footage bonus, Cow 17 report, and results presentation

## 5. Protected product laws

Do not alter:

- product name
- campaign identity
- storm feel
- ability feel
- camera feel
- score values
- combo values
- district timing
- district order
- objective requirements
- star thresholds
- campaign unlock order
- save meaning
- protected people, animal, and media rules
- Three.js version
- renderer behavior
- audio balance
- visual quality tiers

A code cleanup that changes behavior is a regression.

## 6. Scope

### In scope

- map current scoring, district, campaign, and persistence ownership
- define typed contracts and snapshots
- create data definitions for existing campaign and district contracts
- add validators
- introduce a single legacy compatibility bridge
- route existing behavior through typed authorities
- preserve the existing legacy executor paths during migration where safest
- add deterministic unit, integration, and browser QA
- add save fixtures and migration tests
- update package scripts and a Phase 4 workflow
- synchronize Android and assemble a debug APK
- update Phase 4 documentation and evidence

### Out of scope

- new campaign stops
- River County or Metro Fringe implementation
- Moo Brew cinematic
- newspaper recap
- new Cow 17 behavior
- new tornado forms
- storm progression or mastery
- terrain resistance
- renderer extraction
- camera extraction
- world or destruction refactor
- Three.js upgrade
- audio redesign
- major UI redesign
- player release packaging
- PR-stack integration or merge decisions

## 7. Phase 4 parity contract

Before implementation, write a concise source map that identifies:

- every score mutation path
- combo creation, extension, timeout, multiplier, and reset paths
- district score checkpoints
- district transition triggers
- challenge scoring paths
- footage and media bonus paths
- results aggregation
- campaign star calculation
- best-score updates
- unlock updates
- run-count updates
- selected-stop updates
- furthest-unlock updates
- storage key and schema
- save read, write, reset, and recovery paths
- QA or bot paths that bypass normal progression

Capture existing constants and formulas. Do not infer or improve them.

## 8. Suggested architecture

Exact paths may change when evidence supports a better boundary. Keep ownership explicit.

```text
src/gameplay/scoring/
  scoring-system.ts
  scoring-contracts.ts

src/gameplay/districts/
  district-system.ts
  district-contracts.ts

src/gameplay/campaign/
  campaign-system.ts
  campaign-contracts.ts
  heartland-definitions.ts

src/platform/persistence/
  campaign-store.ts
  campaign-save-schema.ts

src/legacy/
  legacy-runtime-adapter.ts

runtime/
  modernization-phase4-scoring-campaign.js

scripts/
  apply-modernization-phase4-scoring-campaign.mjs
  verify-modernization-phase4-scoring-campaign.mjs
  qa-modernization-phase4-scoring-campaign.mjs
```

### Scoring authority responsibilities

- accept existing score events
- preserve existing score arithmetic
- preserve combo laws
- expose read-only typed snapshots
- reset deterministically
- never write campaign storage directly

### District authority responsibilities

- hold current district identity
- enforce forward-only movement
- preserve current threshold and timing logic
- expose district snapshots and transition history
- never reset total score at a district boundary

### Campaign authority responsibilities

- evaluate the existing run result
- preserve star and unlock calculations
- preserve best-score and run-count behavior
- select next stop using existing rules
- delegate persistence through one store

### Persistence responsibilities

- read the existing `severe_weather_campaign_v1` data
- validate without destroying valid older saves
- migrate only when necessary and deterministic
- preserve unknown future-safe fields where practical
- recover from malformed data without crashing
- isolate QA storage from player storage
- expose explicit read, write, reset, and snapshot operations

## 9. Data definitions

Represent the existing content, not imagined future content.

Minimum definitions:

- campaign ID and title
- ordered stop IDs
- stop title and unlock relationship
- district IDs and order
- district time or progression contract
- landmark and objective references
- star thresholds
- next-stop relationship
- terrain and palette identity references where already established

Add validation for:

- duplicate IDs
- missing referenced stops
- invalid stop order
- invalid district order
- broken next-stop links
- invalid star thresholds
- missing landmark or objective references
- unsupported save versions

Do not add River County, Metro Fringe, Coastland, East Coast, or West Coast content in this phase.

## 10. Compatibility strategy

Use the established strangler pattern.

- one Phase 4 lexical bridge
- typed authorities attach after the accepted runtime exists
- fallback behavior matches the accepted legacy runtime before attachment
- avoid two scoring authorities or two campaign writers
- legacy fields may remain compatibility mirrors temporarily
- typed state and compatibility mirrors must update atomically
- no arbitrary new `globalThis` surface
- expose only the deliberate QA and adapter contracts required for tests

Do not rewrite the complete scoring or campaign loop from memory.

## 11. Save compatibility requirements

Create fixtures for at least:

- empty storage
- a valid current `severe_weather_campaign_v1` save
- partially populated valid save
- malformed JSON
- wrong primitive type
- missing stop data
- impossible selected stop
- future or unknown fields
- QA-isolated save

Required behavior:

- valid current saves load without losing progress
- missing optional values receive deterministic defaults
- malformed saves recover safely
- recovery does not throw during startup
- player storage is not modified by ordinary QA scenarios
- retry cannot double-count stars, unlocks, or run totals

Do not rename the player storage key in Phase 4 unless a migration path preserves the old key and tests prove compatibility.

## 12. Required automated tests

### Contract tests

- scoring arithmetic matches captured legacy fixtures
- combo progression and timeout match legacy behavior
- score remains continuous at both district transitions
- district progression cannot move backward
- star thresholds match current behavior
- unlock order matches current Heartland behavior
- best score only moves upward
- run count increments exactly once per completed run
- retry does not duplicate completion rewards
- next stop resolves correctly

### Persistence tests

- empty save
- valid save load
- save write and reload
- malformed-save recovery
- partial-save defaults
- unknown-field handling
- QA storage isolation
- deterministic reset

### Browser QA

Run inherited suites plus a Phase 4 suite on desktop and mobile landscape.

The Phase 4 browser suite must prove:

- shell and lifecycle identity
- scoring snapshot agreement with displayed results
- score continuity at district boundaries
- forward-only district history
- campaign result agreement
- save write and reload
- retry safety
- next-stop correctness
- no page errors
- no console errors
- no player-visible QA or forensic panel in normal mode

### Android gate

- Capacitor asset parity
- debug APK assembly
- exact source commit in package manifest
- artifact digest
- APK SHA-256

## 13. Existing script chain

Install:

```bash
pnpm install --frozen-lockfile
```

Current inherited script names from `package.json`:

```text
modern:typecheck
modern:build
audio:generate
patch:v431
patch:v440
patch:v441
patch:v442
patch:v450
patch:v500
patch:v510
patch:phase2
patch:phase3
verify:v500
verify:v510
verify:phase2
verify:phase3
qa:v510
qa:phase2
qa:phase3
cap:sync
```

Add coherent Phase 4 scripts:

```text
patch:phase4
verify:phase4
qa:phase4
```

Authoritative Phase 4 workflow order should remain equivalent to:

1. frozen dependency install
2. script syntax checks
3. strict TypeScript
4. verified audio generation
5. accepted historical gameplay chain
6. V5 verification
7. V5.1 production-slice patch and verification
8. Phase 2 patch and verification
9. Phase 3 patch and verification
10. Phase 4 patch and verification
11. Vite build and offline packaging
12. inherited visual QA
13. inherited clock QA
14. inherited input and ability QA
15. Phase 4 score, district, campaign, and save QA
16. Capacitor synchronization
17. debug APK assembly
18. evidence packaging and upload

The workflow must use frozen dependencies and read-only permissions unless a documented step truly requires a write.

## 14. Implementation rhythm

Work in substantial checkpoints:

### Checkpoint A: source map and contracts

- identify all state paths
- capture formulas and constants
- add typed interfaces and contract probes

### Checkpoint B: scoring and district authority

- attach typed authorities
- preserve score and district behavior
- add deterministic tests

### Checkpoint C: campaign and persistence authority

- preserve stars, unlocks, best scores, run counts, and selected stop
- add save fixtures and recovery tests

### Checkpoint D: data definitions and validators

- encode current Heartland content
- prove validator failures are actionable

### Checkpoint E: full gate and packaging

- run inherited and Phase 4 QA
- synchronize Android
- assemble one review APK
- package evidence

Do not create a separate owner APK for every checkpoint.

## 15. Stop conditions

Proceed without repeatedly asking routine implementation questions.

Stop and request owner or technical-lead direction only when evidence shows that proceeding would require:

- changing score or combo behavior
- changing district timing or order
- changing star thresholds or unlock order
- breaking or abandoning current saves
- renaming the player storage key without a compatible migration
- altering the three-minute clock
- changing input or ability feel
- changing the product name or campaign identity
- adding new product scope
- changing renderer, engine, or platform direction
- merging or rewriting protected branches

A failing test is not automatically a stop condition. Diagnose and correct implementation or harness assumptions first.

## 16. Required draft PR

Open a draft PR:

- Head: `agent/phase4-scoring-campaign-antigravity`
- Base: `agent/phase3-knowledge-antigravity-handoff`
- Suggested title: `Extract Phase 4 scoring campaign and persistence authority`

PR body must include:

- exact starting SHA
- exact head SHA
- source-map summary
- systems extracted
- legacy compatibility retained
- data definitions added
- save compatibility behavior
- validators added
- automated test results
- workflow run and artifact IDs
- APK hash
- known limitations
- exact physical-device tests still required

Keep the PR draft and unmerged.

## 17. Definition of done

Phase 4 is ready for owner review only when:

- strict TypeScript passes
- all inherited verification passes
- Phase 4 structural verification passes
- desktop and mobile browser QA pass
- scoring snapshots match displayed results
- score remains continuous across districts
- district history remains forward-only
- campaign results, stars, and unlocks match the accepted game
- current saves load without lost progress
- malformed saves recover safely
- QA does not contaminate player saves
- Capacitor assets match the web package
- Android APK assembles
- exact evidence is packaged
- the draft PR is open
- no protected branch is modified

Physical acceptance remains the owner's decision after installing and playing the exact Phase 4 APK.

## 18. Final reporting format

At completion, report:

```text
Branch:
Starting SHA:
Final SHA:
Draft PR:
Workflow run:
Artifact ID:
Artifact digest:
APK SHA-256:
Typecheck:
Inherited QA:
Phase 4 QA:
Save compatibility:
Known limitations:
Physical tests required:
```

Do not report `complete` merely because code compiles. Report exactly what the evidence proves.
