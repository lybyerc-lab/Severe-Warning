# Severe Weather Warning Active Production Slate

Last updated: 2026-08-10
Status: canonical near-term work queue

This file exists so project direction survives short chat windows. Chat may explore ideas freely, but durable scope, locks, queues, assignments, and parked ideas belong here or in another canonical repo document.

## Operating law

- GitHub is the durable project memory. Chat is temporary working context.
- New ideas are captured without silently replacing active work.
- Meaningful ideas must end up as **active**, **queued**, **parked**, or **rejected**. Nothing important should be left only in chat.
- A queued or parked idea is not implementation approval. It is preserved inventory.
- Green CI is engineering evidence, not visual acceptance.
- QA-root browser testing is the default rapid human iteration loop.
- Android APK generation is a deliberate device-checkpoint action, not a requirement for every visual iteration.
- Multi-agent work follows `AGENTS.md` and `Docs/MULTI_AGENT_OPERATING_MODEL.md`.
- One worker, one bounded task, one writable branch/worktree.
- If two desired changes share authoritative source/data, one worker owns the whole shared seam. Do not split presentation from gameplay truth when both depend on the same coordinates or objects.

## Current live QA checkpoint

Public QA root:

`https://lybyerc-lab.github.io/Severe-Warning/`

Current deployed gameplay candidate:

- Hero Slice 6 Browser QA #18
- source `242cb92451073acf7b193a5baa8c60c551335b7a`
- source branch `agent/threejs-hero-slice6-world-identity-storm-silhouette`
- exact web artifact `severe-weather-threejs-hero-slice6-web-18`
- Pages promotion Run #82 completed successfully
- status: playable QA candidate, **not owner visual-accepted**, not physical Android accepted

### Owner live-QA notes, 2026-08-09

Captured from direct phone playtesting of the QA root:

1. **Utility/power-line poles must be moved out of streets.** First SW-WORLD inspection proved pole placement and Grid Zap share authoritative pole coordinates/groups. Director resolved the seam to `SW-GAME-001`, which now owns authoritative pole relocation plus Grid Zap topology/tuning together.
2. **Cow cam should linger roughly 1-2 seconds longer.** This is an explicitly authorized bounded gameplay/presentation timing adjustment in `SW-GAME-001`.
3. **Grid Zap should hit harder and travel farther down connected power lines.** This is an explicitly authorized bounded gameplay tuning request in `SW-GAME-001`. The worker must document exact current and proposed damage/chain/range/cap values and preserve a bounded connected-network rule.

These notes do not authorize unrelated gameplay retuning.

## Parallel worker assignments

Coordination base SHA for the current parallel batch:

`d0ebca88328fd1af590ce2d3916368426df07938`

Director/ops branch:

`agent/director-multi-agent-ops`

### SW-WORLD-001

Issue: #46  
Branch: `agent/sw-world-001-slice6-finish`  
State: ready to resume after successful ownership discovery

Goal: finish the bounded Hero Slice 6 visual acceptance pass without weakening the road law or gameplay protections.

Owns:

- Slice 6 world/storm presentation;
- Main Street massing cleanup;
- municipal water-tower presentation;
- default storm silhouette cleanup;
- bounded Slice 6 verifier/visual-QA adjustments required by those visual changes.

Explicitly does **not** own:

- utility-pole placement;
- power-line topology;
- Grid Zap;
- Cow-camera timing;
- QA workflow architecture;
- cinematic foundation.

The first SW-WORLD run made no changes because it correctly found that pole presentation and Grid Zap share authoritative data in protected source. That discovery is now resolved by assigning the shared electrical seam to SW-GAME.

### SW-QA-001

Issue: #47  
Branch: `agent/sw-qa-001-throughput`  
State: running in isolated physical worktree

Goal: reduce iteration wall-clock time without weakening evidence.

Owns:

- build-once/test-many workflow topology;
- safe reuse of immutable Slice 5 reference output;
- parallel independent browser QA;
- docs/task-only heavy-CI suppression;
- manifest-driven QA-root publisher design;
- preservation of browser-first / opt-in Android cadence.

Does not own visual or gameplay runtime code.

### SW-CIN-001

Issue: #48  
Branch: `agent/sw-cin-001-moo-brew-foundation`  
State: running/ready in isolated physical worktree

Goal: build the isolated Three.js actor/prop/timeline foundation for the Moo Brew fence/water-cooler character beat.

Owns:

- lightweight bipedal Cow 17 presentation rig;
- Moo Brew cup prop;
- conversational chicken presentation rigs;
- fence composition helper;
- deterministic shot/timeline foundation;
- cinematic-only static/browser QA framing.

Does not integrate the full opening into gameplay yet and does not own warning-clock/gameplay authority.

### SW-GAME-001

Issue: #50  
Branch: `agent/sw-game-001-cowcam-gridzap-polish`  
State: **ready for launch; ownership overlap resolved**

Goal: implement exactly three owner-authorized live-QA changes as one coherent electrical/gameplay seam:

- relocate authoritative power-line poles out of protected road corridors while preserving network continuity;
- increase Grid Zap damage and extend bounded propagation farther along connected utility infrastructure;
- extend the existing player-visible Cow 17 camera moment by roughly 1-2 seconds.

Director ownership resolution:

- visible pole construction/positioning and Grid Zap consume the same authoritative `powerPoles` coordinates/groups;
- therefore SW-GAME owns both authoritative utility placement and Grid Zap for this task;
- SW-WORLD is forbidden from visually offsetting the poles independently;
- SW-GAME must add pole-road intrusion QA and return exact before/after Grid Zap tuning values;
- no other gameplay tuning is authorized.

## Active product milestone

### Hero Slice 6: World Identity + Storm Silhouette

Production branch: `agent/threejs-hero-slice6-world-identity-storm-silhouette`  
PR: #45  
Stage: 2A

Current goals:

- make roads own protected corridors and keep buildings/fences/utility poles out of street space;
- maintain `curb -> sidewalk -> verge -> lot -> building` hierarchy;
- eliminate square-on-square prototype massing;
- keep the municipal water tower reading as a believable muted landmark rather than a primitive;
- reduce naked tall rectangular Main Street silhouettes with restrained small-town rooflines;
- keep the default tornado irregular, storm-like, and visually dominant without becoming a clean cone;
- preserve the fun baseline except for separately documented owner-authorized bounded gameplay tuning.

Acceptance remains visual as well as automated. The current live QA root is for owner/playtester feedback, not a declaration that Slice 6 is visually finished.

## Queued / parallel foundation

### Opening Cinematic: Moo Brew Touchdown

Direction is locked unless explicitly changed by the owner. `SW-CIN-001` may build isolated foundations in parallel, but full production integration waits for Director review and the appropriate world checkpoint.

Canonical story:

`newspaper -> farm reveal -> Cow 17 and chickens -> weather/radio shift -> slow double take -> Moo Brew cup drop -> chicken panic -> Cow 17 escape -> barn roof peel -> tornado touchdown -> seamless gameplay handoff`

Director choices locked on 2026-08-09:

- build the final opening inside the same Three.js world and visual language as gameplay;
- no separate DOM/CSS cartoon universe and no loading break;
- Cow 17 is upright/bipedal for the character beat, casually leaning on the fence like a coworker at an office water cooler;
- Cow 17 holds and sips a recognizable Moo Brew cup;
- two or more chickens gather around Cow 17 with small conversational acting beats such as pecking, head bobs, glances, interruption-like reactions, and delayed recognition of the weather change;
- humor comes from body language and timing rather than requiring spoken dialogue;
- Cow 17 keeps sipping while the environment becomes increasingly wrong, then performs the planned slow double take;
- the final ill-advised sip, cup drop, chicken scatter, and sudden action-hero escape are the comedy pivot;
- the Moo Brew logo should face camera during the exaggerated cup-drop beat when practical;
- warning clock starts only when control transfers to gameplay;
- target cinematic length remains roughly 10 to 15 seconds;
- first viewing may be mandatory, later viewings remain skippable;
- repeat runs may rotate newspaper headlines.

Implementation should use lightweight articulated Three.js actors rather than static billboards.

## Remaining Stage 2A table

These items remain alive even if they are not all launched in the current parallel batch:

### World / visual production

- finish Hero Slice 6 human visual acceptance;
- stronger authored identity across ordinary town/farm views;
- destruction readability and believable structure anatomy rather than roof-heavy/generic chunks;
- environmental storytelling and authored place details without procedural clutter;
- consistent material/lighting language across locations;
- further default-storm quality work if the funnel still reads geometric at gameplay speed;
- render-cost/draw-call/material cleanup as visual complexity rises.

### Gameplay feel / electrical network

- authoritative utility poles obey street boundaries while remaining aligned with Grid Zap truth;
- owner-authorized Cow-cam timing adjustment;
- owner-authorized Grid Zap damage/connected-line propagation adjustment;
- preserve direct steering, ordinary-contact destruction, Pull, Gust, scoring/campaign truth, Cow 17 safety, and lifecycle behavior unless separately and explicitly reopened.

### Opening cinematic

- build `SW-CIN-001` actor/prop/timeline foundation;
- Director review deterministic fence-conversation/double-take/last-sip frames;
- later integrate the full newspaper -> farm -> touchdown -> gameplay sequence;
- preserve seamless Three.js handoff, skip/replay law, and warning-clock start at gameplay control.

### QA / production throughput

- complete `SW-QA-001` build-once/test-many and parallel QA work;
- safely reuse immutable reference evidence instead of rebuilding it blindly;
- suppress heavyweight visual CI for planning/docs-only changes;
- finish manifest-driven QA publisher so later slices do not require hard-coded publisher surgery;
- keep APK generation opt-in for meaningful physical-device checkpoints.

### Multi-agent operations

- continue using separate physical Git worktrees for simultaneous local Codex workers;
- validate the first worker round before merging PR #49;
- keep agent startup truth singular and repo-driven;
- inspect returned worker diffs/CI before integration;
- only run tasks truly in parallel when file ownership is disjoint or the Director has explicitly assigned an entire shared authority seam to one worker.

## Current launch recommendation

1. `SW-QA-001` and `SW-CIN-001` continue in their isolated worktrees.
2. Resume `SW-WORLD-001` in the WORLD worktree using the revised Issue #46, which now excludes the electrical seam.
3. Launch `SW-GAME-001` in a fourth isolated physical worktree using revised Issue #50. It owns authoritative utility placement + Grid Zap + Cow-cam timing together.
4. Director reviews returned branches independently, checks overlap and regression evidence, then integrates verified work into an exact candidate.
5. Promote only an integrated, green, manually reviewed candidate to the QA root for owner playtesting.

## QA and build cadence

### Rapid iteration

Primary loop:

1. exact-source browser build;
2. automated regression, visual, and same-runner performance evidence;
3. assistant/director evidence review;
4. promote the reviewed candidate to the public QA root;
5. owner and informal playtesters play the root candidate;
6. record visual/fun feedback in the repo before the next meaningful change.

### Android device checkpoints

APK generation is paused for ordinary visual iterations because replacing the installed development build currently requires uninstalling the existing app first. That install friction does not add value to every art revision.

Generate an APK deliberately when one or more of these are true:

- a milestone is visually close enough to warrant physical-device acceptance;
- touch/input/camera behavior changed;
- WebView, lifecycle, audio, heat, battery, frame pacing, or device-only behavior needs validation;
- a release candidate or major integrated slice is ready.

Physical Android acceptance still requires an actual install and run on the target device. Browser approval never silently becomes Galaxy acceptance.

## Expansion incubator

Expansion ideas are welcome during production and should be captured as they arise without interrupting the current acceptance slice unless they solve an active blocker.

Already-established expansion families include:

- additional compact regional campaigns;
- stronger local-news personalities and media spectacle;
- deeper Moo Brew world branding and recurring jokes;
- Cow 17 recurring campaign comedy and statistics;
- waterspouts for a coast campaign after water interaction exists;
- multi-vortex and twin-funnel advanced storm forms;
- region-specific architecture, props, weather interaction, audio, and finales.

New expansion ideas should be added here or to the product roadmap with a short statement of what makes them fun or mechanically distinct. Do not implement an expansion merely because it sounds possible.

## Informal playtest signal

The owner reports that multiple people have played the game and the response has been consistently positive. Treat this as a strong qualitative signal that the core game is worth protecting, not as formal acceptance data. Continue improving presentation without sacrificing the movement, destruction, humor, and direct-control loop people are already enjoying.

## Protected truths

- Three.js remains production.
- Frozen gameplay/fun baseline remains the default protection law.
- Steering/input/general gameplay-camera feel, ordinary-contact destruction, Pull/Gust, scoring/timing/campaign authority, Cow 17 safety, and lifecycle behavior are not retuned to make art integration easier.
- The owner-authorized utility alignment, Cow-cam timing, and Grid Zap requests are explicit bounded exceptions and must remain isolated, measured, and QA-gated.
- Stage 2A remains active until the visual language holds across ordinary gameplay and the opening cinematic direction is implemented to the same standard.
