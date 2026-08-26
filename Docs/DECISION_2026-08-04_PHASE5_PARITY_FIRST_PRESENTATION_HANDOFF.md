# Decision: Phase 5 Uses Parity-First Presentation Extraction

**Date:** 2026-08-04 Central Time  
**Status:** Approved  
**Applies to:** Severe Weather Warning Modernization Phase 5

## Decision

Phase 5 will extract renderer, scene, camera, atmosphere, tornado presentation, world, buildings, and destruction through a parity-first strangler migration.

The accepted legacy presentation remains the production executor until typed mirrors, lifecycle contracts, visual baselines, cleanup evidence, and physical Android review prove equivalence.

Antigravity will work on its own descendant branch and open a draft PR against the Phase 5 handoff branch.

## Required execution laws

1. `MechanicsLab/SevereWeather_Warning.html` remains unchanged in the branch diff.
2. The accepted game is rebuilt by replaying the historical patch chain.
3. A clean-source provenance guard runs before TypeScript and browser QA.
4. Exact source mapping precedes implementation.
5. Typed mirrors and wrappers precede executor replacement.
6. No second renderer, scene, camera, world, or animation loop may be introduced.
7. Three.js remains at r128.
8. Architecture extraction must not include visual redesign.
9. The accepted Phase 4 base and the Phase 5 head are compared on the same runner.
10. Visual thresholds are derived from measured repeat-run noise rather than chosen to make the candidate pass.
11. Hart Farm is represented through a reusable setpiece contract without changing its existing presentation or behavior.
12. A second existing structure may prove contract reuse only through its existing art and authored states.
13. If safe reuse cannot be proven without inventing art or behavior, the agent must stop and report that evidence.
14. Physical Android acceptance remains an owner decision.

## Reason

The initial Antigravity Phase 4 submission demonstrated that locally green structural checks can preserve the wrong behavior. It included generated source contamination and invented scoring, district, campaign, and save rules.

Presentation work is even more vulnerable to false greens because a renderer can compile, render, and pass marker checks while camera feel, lighting, object density, destruction readability, cleanup, or mobile performance silently drift.

Phase 5 therefore requires stronger evidence:

- exact source provenance
- semantic presentation snapshots
- fixed viewport captures
- base-to-base noise measurement
- base-to-head comparison
- repeated reset and disposal checks
- inherited gameplay QA
- Android packaging
- physical device review

## Authorized scope

Antigravity may:

- map presentation and world ownership
- create typed read-only contracts and mirrors
- add a single compatibility bridge
- add deterministic QA scenarios and snapshots
- make resource and listener behavior observable
- represent existing Hart Farm states through data
- prove contract reuse on one existing structure
- add workflow, verification, browser QA, diagnostics, and Android packaging required for Phase 5 evidence

## Prohibited without explicit owner approval

- Three.js upgrade
- renderer replacement
- engine migration
- visual redesign
- new art assets
- new destruction stages
- changed camera values
- changed lighting, fog, tornado, debris, or world density
- new quality tiers
- gameplay, scoring, district, campaign, or save changes
- Cow 17 behavior changes
- Moo Brew cinematic work
- new regions or campaign stops
- merge, retarget, close, squash, or history rewrite of protected PRs

## Branch protocol

- Handoff branch: `agent/phase4-knowledge-antigravity-handoff`
- Required work branch: `agent/phase5-rendering-world-antigravity`
- Required PR base: `agent/phase4-knowledge-antigravity-handoff`
- PR state: draft until automated and physical acceptance are complete
- One writer per branch

## Revisit conditions

Revisit this decision only when:

- a measured blocker proves observation cannot establish the required ownership boundary
- a specific accepted visual behavior cannot be represented without changing the legacy executor
- no existing second structure can prove setpiece reuse safely
- the owner approves a separate visual redesign or Three.js upgrade milestone
- Phase 5 is physically accepted and the next replacement boundary is being planned
