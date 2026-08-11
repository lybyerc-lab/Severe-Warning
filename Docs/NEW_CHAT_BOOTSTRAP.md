# Severe Weather Warning — New Chat Bootstrap

Use this file when starting a fresh ChatGPT project chat. Do not rely on conversational memory alone.

## Exact repository context

Repository: `lybyerc-lab/Severe-Warning`
Director branch: `agent/director-stage2b-game-direction`
Active phase: **Stage 2B: Make It Feel Like a Game**
Product title: **Severe Weather Warning**
Production renderer: Three.js r128
First-batch frozen coordination base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`

## Mandatory startup sequence for the new Director chat

1. Use the GitHub connector/tool. Do not answer from generic memory first.
2. Read these files from branch `agent/director-stage2b-game-direction`, not from `main`:
   - `AGENTS.md`
   - `Docs/ACTIVE_HANDOFF.md`
   - `Docs/GAME_DIRECTOR.md`
   - `Docs/WORKER_STARTUP_ORDER.md`
   - `Docs/ACTIVE_PRODUCTION_SLATE.md`
3. Read GitHub Issues #60 through #68 and their latest Director comments.
4. Inspect the live heads of these first-batch branches before giving status:
   - `agent/sw-world-003-storm-hero-recovery`
   - `agent/sw-game-002-moo-level-unlock`
   - `agent/sw-qa-002-rapid-prototype-lane`
5. Reconcile the branch heads with the latest issue comments. Newer exact evidence beats older prose.
6. Resume as Game Director. The owner should not need to restate the project or coordinate branches, QA, task bases, worker scope, or integration order.

## Immediate checkpoint when this bootstrap was written

### WORLD #61

Branch: `agent/sw-world-003-storm-hero-recovery`
At last check it still pointed at frozen base `82e6c6fbeffffc3ee929c00260f924e36c70de28`, so no committed worker result had landed yet.

Goal: recover the default tornado from the rejected attack-bubble look into one coherent dangerous storm mass while preserving protected gameplay authority.

### GAME #62

Branch: `agent/sw-game-002-moo-level-unlock`
Observed head at last check: `3d3733b18cd45c877c7f4bcf3990bf77fc625f0f`.

The branch had active commits and was not yet Director-reviewed at this checkpoint.

Goal: Hart Farm becomes a real unlock encounter that persistently unlocks a separate replayable MOO LEVEL bonus stage, with cow safety and normal-campaign behavior preserved.

### QA #63

Branch: `agent/sw-qa-002-rapid-prototype-lane`
Reviewed head: `4361a1cb8931766548281379ae22d703675ee1df`.

Director code-shape/drift verdict: PASS. The branch was one commit off the frozen base and added only six bounded prototype/QA files.

Remaining blocker: its new `workflow_dispatch`-only workflow could not self-prove pre-integration because GitHub requires a manually dispatched workflow to already exist on the default branch. The latest #63 Director comment requests the smallest safe pre-integration execution path and then a real harmless example run proving exact SHA, elapsed time, artifact/screenshots, `productionAuthority: false`, `qaPagesDispatched: false`, and no publisher/Pages dispatch.

## Product direction that must survive chat rollover

- Genre: arcade destruction game with light action RPG progression.
- Exactly three active abilities per run in the **Storm Triangle**. Storm form and passives are separate.
- Physical/discoverable ability synergy is a major replay pillar.
- Named prototype synergy: **Pull + Gust = Slingshot**, pull an object in and launch it across the map.
- Individual abilities remain fun alone. Synergy adds discovery rather than fixing weak abilities.
- Synergy can unlock bizarre feats, secrets, locations, special abilities, and other content. Late-game tonal benchmark: the right build/progression/site setup can pull down a satellite.
- Persistent scorekeeping is a must-have. Local-first personal/site/build/version-aware records come before optional social leaderboards.
- Newspaper presentation is the recurring UI family for storm selection, UNLEASH STORM, and end-run score/results.
- The Weather Map evolves toward a stylized nostalgic U.S. destination-select map.
- **MOO-LAH** is the gameplay currency direction.
- Cows and Moo Brew are the humor backbone. Cow-fucius is an approved recurring humor concept, with loading/transitions as the preferred first home.
- Storm Sites should be authored substantial locations with signature destruction fantasies, not generic procedural maps.
- Free Storm, location mastery, Storm Day variants, signature destruction chains, scrapbook/archive, PB pace, and special challenge editions are approved future directions but should be sequenced rather than dumped into current workers.
- Fun/destruction first. Beauty is first-class.
- Phone is a platform, not the intended size of the game. Design for substantial handheld/controller-friendly sessions, without claiming a solved console port.
- C++ direction: become C++-ready, not C++-dependent. No rewrite. Keep simulation/state/input/render seams clean so isolated C++/Wasm experiments are possible later if profiling proves a need.

## Drift / process laws discovered during Stage 2B launch

- Worker startup order is mandatory: `assigned worktree -> assigned branch -> exact SHA -> task-versioned docs -> scope/protection/proof plan -> edit`.
- Never interpret task authority from an unverified checkout.
- Missing local tooling is not automatically a repository defect. Example: local Windows lacked `ffmpeg`, while Ubuntu CI intentionally installs it.
- New workflows need an explicit pre-integration self-proof mechanism.
- Clean diff, correct implementation, and executed acceptance evidence are separate gates.
- Drift is treated as a product defect. Every task must state what changes, what stays unchanged, and how both will be proved.

## Immediate Director behavior in the fresh chat

Do not ask the owner to reconstruct the project.
Do not tell the owner to paste worker summaries if GitHub can be inspected directly.
Do not launch #64-#68 blindly before first-batch seams are reviewed.
Do not production-merge rejected QA #29.
Do not assume green CI equals visual/product acceptance.
Do not invent newer worker status without checking exact GitHub evidence.

After loading the above, respond with a short recovered-state summary and the single next action that actually needs the owner's attention, if any.
