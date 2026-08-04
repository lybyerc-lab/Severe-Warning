# Decision: Preserve Recovered Knowledge and Use a Bounded Agent Handoff

**Date:** 2026-08-04 Central Time  
**Status:** Approved  
**Applies to:** Severe Weather Warning production and modernization work

## Decision

1. Preserve recovered product, engineering, QA, device, and deferred-scope knowledge inside the repository.
2. Treat `Docs/RECOVERED_KNOWLEDGE_BASE.md` as the durable record for ideas and obligations that were previously scattered across chats and older documents.
3. Update `CURRENT_STATUS.md` and `Docs/MODERNIZATION_PLAN.md` so they reflect that Phases 1 through 3 are implemented and physically accepted.
4. Give Antigravity one bounded next mission: Phase 4 scoring, districts, campaign, and persistence extraction.
5. Require one writer per branch.
6. Require Antigravity to work on its own descendant branch and open a draft PR against the documentation handoff branch.
7. Keep all protected draft PRs unmerged until the owner approves an integration strategy.

## Evidence

The repository previously still stated that modernization had not started, while the following work had already been completed:

- Phase 1 modern shell
- Phase 2 clocks and run state
- Phase 3 input and ability authority
- full inherited browser QA
- Capacitor synchronization
- Android APK assembly
- physical browser and Android acceptance
- correction of the QA4 forensic-panel leak

Important product ideas also remained distributed across previous conversations and older roadmap sections, including:

- Moo Brew opening cinematic and run-generated recap
- fuller Cow 17 and farmyard behavior
- media and regional broadcast expansion
- complete Pull, Gust, and Grid Zap presentation contracts
- additional Heartland stops and later regions
- tornado forms and advanced variants
- storm mastery questions
- terrain and objects that diminish storm power
- broader device, heat, battery, safe-area, process-restart, and release-package testing

Leaving these items only in chat would violate the repository-as-memory rule.

## Agent operating protocol

Antigravity must:

- read the repository memory in the order defined by `CURRENT_STATUS.md`
- resolve the latest head of `agent/phase3-knowledge-antigravity-handoff`
- create `agent/phase4-scoring-campaign-antigravity` from that exact head
- never push to the handoff branch or any earlier protected branch
- preserve accepted gameplay behavior
- make routine implementation decisions without repeatedly interrupting the owner
- stop only when an ambiguity could alter protected gameplay, product identity, save compatibility, platform direction, or physical acceptance criteria
- run the complete inherited test chain plus new Phase 4 tests
- open a draft PR against `agent/phase3-knowledge-antigravity-handoff`
- record exact source commit, workflow run, artifact, and remaining physical-test requirements

## Scope boundary

Antigravity is authorized to perform mechanical and architectural Phase 4 work.

Authorized:

- source mapping
- typed score and campaign contracts
- compatibility bridges
- data definitions
- validators
- save fixtures
- migration tests
- deterministic QA scenarios
- workflow and packaging updates required for Phase 4 evidence

Not authorized without owner approval:

- gameplay rebalance
- changed score values or combo rules
- new campaign stops
- storm progression or mastery design
- terrain resistance implementation
- Moo Brew cinematic implementation
- renderer upgrade
- major visual redesign
- engine migration
- PR merge, retarget, close, or history rewrite

## Rejected alternatives

### Continue relying on chat memory

Rejected because chat cannot be reliably versioned, diffed, audited, or recovered.

### Give Antigravity an open-ended modernization prompt

Rejected because broad scope would invite drift across gameplay, rendering, content, and build systems.

### Let multiple agents write to the same branch

Rejected because concurrent branch ownership obscures provenance and increases conflict and regression risk.

### Merge the entire draft stack before Phase 4

Rejected because integration order and historical preservation require deliberate review and explicit owner approval.

## Revisit conditions

Revisit this protocol only when:

- the Phase 4 branch is complete and ready for review
- the owner approves a different integration strategy
- a measured blocker proves that one-writer branch isolation is preventing progress
- repository tooling changes enough to provide an equally auditable alternative
