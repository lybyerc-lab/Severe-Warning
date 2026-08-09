# Severe Weather Warning Active Production Slate

Last updated: 2026-08-09
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

## Parallel worker assignments

Coordination base SHA for the first parallel batch:

`b9cd567173761adf1484460ef8ca4b1eede56bde`

Director/ops branch:

`agent/director-multi-agent-ops`

### SW-WORLD-001

Issue: #46  
Branch: `agent/sw-world-001-slice6-finish`  
State: ready for worker launch

Goal: finish the bounded Hero Slice 6 visual acceptance pass without weakening the road law or gameplay protections.

Owns:

- Slice 6 world/storm presentation;
- Main Street massing cleanup;
- municipal water-tower presentation;
- default storm silhouette cleanup;
- bounded Slice 6 verifier/visual-QA adjustments required by the implementation.

Does not own QA workflow architecture or cinematic foundation.

### SW-QA-001

Issue: #47  
Branch: `agent/sw-qa-001-throughput`  
State: ready for worker launch

Goal: reduce iteration wall-clock time without weakening evidence.

Owns:

- build-once/test-many workflow topology;
- safe reuse of immutable Slice 5 reference output;
- parallel independent browser QA;
- docs/task-only heavy-CI suppression;
- manifest-driven QA-root publisher design;
- preservation of browser-first / opt-in Android cadence.

Does not own visual runtime code.

### SW-CIN-001

Issue: #48  
Branch: `agent/sw-cin-001-moo-brew-foundation`  
State: ready for worker launch

Goal: build the isolated Three.js actor/prop/timeline foundation for the Moo Brew fence/water-cooler character beat.

Owns:

- lightweight bipedal Cow 17 presentation rig;
- Moo Brew cup prop;
- conversational chicken presentation rigs;
- fence composition helper;
- deterministic shot/timeline foundation;
- cinematic-only static/browser QA framing.

Does not integrate the full opening into gameplay yet and does not own warning-clock/gameplay authority.

## Active product milestone

### Hero Slice 6: World Identity + Storm Silhouette

Production branch: `agent/threejs-hero-slice6-world-identity-storm-silhouette`  
PR: #45  
Stage: 2A

Current goals:

- make roads own protected corridors and keep buildings/fences out of street space;
- maintain `curb -> sidewalk -> verge -> lot -> building` hierarchy;
- eliminate square-on-square prototype massing;
- replace the bright legacy WATER TOWER presentation with a believable muted municipal landmark;
- reduce naked tall rectangular Main Street silhouettes with restrained small-town rooflines;
- keep the default tornado irregular, storm-like, and visually dominant without becoming a clean cone;
- preserve the frozen gameplay/fun baseline.

Acceptance remains visual as well as automated. Do not promote a green artifact if screenshots still look like prototype geometry.

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

## QA and build cadence

### Rapid iteration

Primary loop:

1. exact-source browser build;
2. automated regression, visual, and same-runner performance evidence;
3. assistant/director evidence review;
4. promote the reviewed candidate to the public QA root;
5. owner and informal playtesters play the root candidate;
6. record visual/fun feedback in the repo before the next meaningful change.

Public QA root:

`https://lybyerc-lab.github.io/Severe-Warning/`

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
- Frozen gameplay/fun baseline remains protected.
- Steering/input/camera feel, Pull/Gust/Grid Zap, scoring/timing/campaign authority, Cow 17 safety, and lifecycle behavior are not retuned to make art integration easier.
- Stage 2A remains active until the visual language holds across ordinary gameplay and the opening cinematic direction is implemented to the same standard.
