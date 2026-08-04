# Severe Weather Warning Current Status

**Last updated:** 2026-08-04 08:54 Central Time  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Production renderer:** Three.js r128  
**Primary target:** single-player Android landscape  
**Active gameplay source:** `MechanicsLab/SevereWeather_3D_Lab.html` plus the verified modernization bridge layers  
**Android packaging:** Capacitor 8.5.0 with offline local assets

## Canonical identity

The full product name is **Severe Weather Warning**.

- `Heartland` is campaign and regional-content terminology.
- `Production Slice`, `Mechanics Lab`, and numbered modernization phases are engineering labels only.
- The player directly controls the storm.
- The response is a media circus, not a battle.
- People remain protected and are never targets.
- Animals and media crews remain invincible, non-targetable witnesses or safe slapstick participants.

## Canonical memory order

Use this order when sources conflict:

1. Current repository code and exact-commit build evidence
2. This file
3. `Docs/RECOVERED_KNOWLEDGE_BASE.md`
4. `Docs/ANTIGRAVITY_PHASE4_HANDOFF.md`
5. `Docs/MODERNIZATION_PLAN.md`
6. `Docs/MODERNIZATION_DEVICE_ACCEPTANCE_2026-08-04.md`
7. `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
8. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
9. `Docs/DECISION_LOG.md` and dated decision records
10. Historical Unity, Godot, Babylon.js, and renderer-laboratory records

Chat is working context. Important decisions, deferred concepts, physical findings, and build evidence must be written back to the repository.

## Production decision

The enjoyable Three.js/WebGL game remains production. Capacitor packages the same local web build for Android.

- Three.js remains production.
- Unity and Godot remain historical experiments.
- Babylon.js remains archived research and must not be merged into production.
- Defold remains Plan B only for a narrowly measured blocker.
- Netlify is not part of this project.
- GitHub Actions remains the build and verification path.
- GitHub Pages is the approved future hosted QA-preview path.

## Protected accepted behavior

Future work must preserve:

- direct storm controls
- mobile joystick and keyboard support
- Pull, Gust, and Grid Zap behavior
- no duplicate mobile ability activation
- continuous scoring across district boundaries
- forward-only district progression
- three-minute real-time warning clock behavior
- pause and background time holding correctly
- Heartland campaign progression and persistence contracts
- QA4 input isolation
- deterministic reset and cleanup
- popup batching and rendering
- continuous wind ambience and recorded-effect direction
- protected people, safe animals, and invincible media crews

## Modernization status

The modernization is active and physically accepted through Phase 3.

| Phase | Scope | Status | Draft PR | Accepted head |
|---|---|---|---|---|
| 0 | Preserve V5.1 Three.js reference | Automated and hands-on reference accepted | #15 | `c49ba1c52ac58d3bd1c6e1d60d7e84cd28a16c72` |
| 1 | Vite, strict TypeScript, lifecycle, context, adapter, QA bridge | Automated and physical browser behavior accepted | #17 | `710ee8537e3d4ca6424b8bf32b282abae0dbfc28` |
| 2 | Render, simulation, and real run clocks; pause and run state | Automated and physical timing behavior accepted | #18 | `381014d3d7f4a128e5c6e285200fdb2790af94b5` |
| 3 | Typed keyboard/touch input and ability-command authority | Automated and physical control behavior accepted | #19 | `b9d55188f91ade720a50837f15591c91209098ad` |
| 4 | Scoring, districts, campaign, and persistence | Next implementation phase | not opened | not started |
| 5 | Rendering, camera, world, buildings, destruction | Planned | not opened | not started |
| 6 | Audio, UI, storage, platform lifecycle, formal QA completion | Planned | not opened | not started |
| 7 | Retire historical patch-chain production builds | Planned after parity | not opened | not started |

### Phase 1 sealed evidence

- Workflow run: `30870506335`
- Artifact ID: `8877735187`
- Artifact digest: `sha256:12274df6fed420048575ca8aeb380c7cdd0a8f67e6d04d03500108234273aa20`
- Owner verdict: `Good build`

### Phase 2 sealed evidence

- Final corrected head: `381014d3d7f4a128e5c6e285200fdb2790af94b5`
- Workflow run: `30884351261`
- Artifact ID: `8882537816`
- Artifact digest: `sha256:b35dcac9b266c21a9affc8aabcee0c999ce30904e02d43aba05179d38b28c9a6`
- Physical findings: manual pause held the clock; backgrounding held the clock; return did not jump the countdown
- A QA4 forensic overlay leaked into normal pause, was corrected, and the correction was inherited by the accepted Phase 3 build

### Phase 3 sealed evidence

- Head: `b9d55188f91ade720a50837f15591c91209098ad`
- Workflow run: `30910503447`
- Artifact ID: `8892944447`
- Artifact digest: `sha256:039e4e7697e5cee64ce2b7a9f514fa5979a5fd376a117a4a25b4c98740c202fa`
- APK SHA-256: `35be5607e44a0401b1843b3428450390b48b8620292a0b112e4a5a56944c0de5`
- Physical findings: joystick direction and release were good; Pull, Gust, and Grid Zap responded correctly; no duplicate activation, cooldown anomaly, stuck movement, pause problem, or background/resume defect was reported
- Owner verdict: `Everything was good!`

## Pull-request stack

The current production and modernization history is an intentional descendant chain:

`PR #13 -> PR #15 -> PR #16 -> PR #17 -> PR #18 -> PR #19`

- PR #13: Heartland campaign foundation
- PR #15: Three.js production visual slice
- PR #16: restored production context and modernization plan
- PR #17: Phase 1 modern shell
- PR #18: Phase 2 clocks and run state
- PR #19: Phase 3 input and abilities

PR #14 is the archived Babylon.js laboratory and is not part of the production chain.

All listed PRs remain draft and unmerged. Do not merge, retarget, close, or rewrite this stack without explicit owner approval and a reviewed integration plan.

## Recovered knowledge and deferred product work

The detailed recovered backlog is now preserved in:

`Docs/RECOVERED_KNOWLEDGE_BASE.md`

That document includes work that was present in prior chats or older repository records but was not fully represented in the immediate modernization status, including:

- Moo Brew opening cinematic and generated newspaper recap
- deeper Cow 17 and farmyard behavior
- media and regional broadcast expansion
- complete Pull, Gust, and Grid Zap presentation contracts
- Heartland stop expansion and later regional campaigns
- advanced tornado forms and special variants
- storm progression and mastery questions
- terrain and objects that diminish storm power
- art pipeline, data-driven world assembly, and reusable destruction definitions
- GitHub Pages QA preview
- release-vs-QA package separation
- broader Android device, heat, battery, safe-area, and process-restart testing

## Known remaining gaps

- The normal production build still depends on a long historical patch chain.
- Large generated inline runtime sections and shared lexical scope remain.
- Phase 4 gameplay state is not yet extracted.
- Campaign, district, challenge, building, and destruction definitions are not yet data-driven enough for safe expansion.
- GitHub Pages QA preview is not deployed.
- Most physical evidence comes from a high-end Galaxy S26 Ultra rather than a device matrix.
- Heat, battery, prolonged session behavior, process death, and older-device performance remain incompletely measured.
- A Phase 2 screenshot showed top-title crowding in one landscape geometry; a later Phase 3 result fit correctly. Keep this as a responsive regression case rather than a universal active defect.
- QA build identity remains visible by design in QA artifacts and must be removed from a player release candidate.
- Three.js r128 remains intentionally frozen until architecture parity is established.

## Immediate next action

1. Preserve this documentation branch as the handoff baseline.
2. Give Antigravity the bounded Phase 4 assignment in `Docs/ANTIGRAVITY_PHASE4_HANDOFF.md`.
3. Require Antigravity to create its own descendant branch. One writer per branch.
4. Extract scoring, districts, campaign progression, and persistence without redesigning behavior.
5. Run the complete inherited parity suite plus new score, district, campaign, and save tests.
6. Produce one consolidated browser review and one Android APK for physical acceptance.

## Working protocol

- Repository truth outranks chat memory.
- One writer per branch.
- Work in coherent milestones, not tiny build fragments.
- Preserve accepted behavior before cleanup.
- Do not mix architecture migration, Three.js upgrade, major visual redesign, and gameplay redesign.
- Automated success is necessary but never substitutes for physical Android acceptance.
