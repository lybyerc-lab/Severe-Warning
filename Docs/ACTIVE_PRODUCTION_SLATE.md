# Severe Weather Warning Active Production Slate

Last updated: 2026-08-10
Status: canonical near-term work queue

This file exists so project direction survives short chat windows. Product identity lives in `Docs/GAME_DIRECTOR.md`. Detailed replay expansion direction lives in `Docs/LEVEL_AND_RPG_EXPANSION.md`. Chat is temporary working context.

## Operating law

- The game is **Severe Weather Warning**. Player-facing branding uses the full title unless a documented platform constraint requires an explicitly approved short label.
- Severe Weather Warning is a mobile arcade destruction game with **light action RPG progression**.
- GitHub is durable project memory.
- Owner feedback may be qualitative. The Director translates it into game-design and implementation contracts.
- The owner is not the branch/QA/task coordinator.
- Green CI is engineering evidence, not game-quality acceptance.
- Prototype gear is for answering uncertain visual/game-feel questions quickly.
- Production gear remains exact-source, sealed, regression-gated, integration-reviewed, and owner-playtested.
- One worker, one task, one writable branch/worktree.

## Current public QA checkpoint

Public QA root:

`https://lybyerc-lab.github.io/Severe-Warning/`

Exact deployed Stage 2A integration candidate:

- PR #59
- Hero Slice Run #29
- source `b501737e71e61b979901d4899d969390aa37b1f4`
- artifact `severe-weather-threejs-hero-slice6-web-29`
- Pages publisher Run #84

Status: technically green and publicly playable, but **not visual/product accepted**.

## QA #29 owner playtest truth

Positive:

- a full round was fun;
- core tornado-control/destruction gameplay remains worth protecting.

Blocking notes and Stage 2B direction:

1. Default tornado reads like **"attack bubbles"**.
2. Graphics feel regressed in some areas.
3. Existing Hart Farm cow-ring Easter egg has no clear gameplay purpose.
4. Owner wants a genuine secret Cow Level. The Hart Farm encounter should unlock it.
5. Game needs stronger replayability and commercial-mobile presentation.
6. Quality target is a real video game that is exciting to show people, not merely a demonstration of Three.js or AI-generated code.
7. Newspaper presentation should become a goofy recurring local-news UI language across opening, storm select, **UNLEASH STORM**, and end-of-run results.
8. GitHub Pages PWA installability is desired to make phone playtesting and sharing feel more app-like without replacing Android device checkpoints.
9. The current four levels are a starting set, not the intended final content count.
10. Future destruction sites should include fairgrounds, piers/boardwalks, beaches, malls/strip malls, stadium/event grounds, grocery-store variants, and other authored locations.
11. Replays of a site may vary in authored ways and do not need identical props/objectives every time.
12. The original light-action-RPG intent remains active: earned currency, storm-form unlocks, and upgradeable abilities should become part of the long-term replay loop.

These notes are product truth for Stage 2B.

## Active phase

# Stage 2B: Make It Feel Like a Game

Umbrella issue: #60

North star: `Docs/GAME_DIRECTOR.md`

Director docs branch: `agent/director-stage2b-game-direction`

First-batch coordination base:

`82e6c6fbeffffc3ee929c00260f924e36c70de28`

That coordination base descends directly from public QA #29 source `b501737e71e61b979901d4899d969390aa37b1f4` and adds Stage 2B direction/docs only. It does not alter gameplay/runtime behavior.

The Director docs branch may continue accumulating later product decisions. Do not silently move already-prepared worker branches off the exact first-batch coordination base merely because Director documentation advanced afterward.

Acceptance question:

> Does the candidate look and play materially more like a finished, replayable commercial mobile game than QA #29?

If the answer requires an explanation of where to look, the change probably did not move far enough.

## First parallel batch

All first-batch workers verify HEAD equals the Stage 2B coordination base above before editing.

### SW-WORLD-003: Storm hero recovery

Issue: #61
Branch: `agent/sw-world-003-storm-hero-recovery`
State: ready for WORLD Codex launch

Goal:

- remove the mobile "attack bubbles" read;
- recover the tornado as one connected atmospheric hero mass;
- audit graphics regression against stronger earlier visual evidence;
- preserve gameplay authority.

Director visual bias: ragged condensation-column/wedge hybrid, continuous mass, streak structure, dark inner core, lower debris sheath, strong ground attachment, broken cloud-base transition, no visible effect primitives.

### SW-GAME-002: Real Moo Level path

Issue: #62
Branch: `agent/sw-game-002-moo-level-unlock`
State: ready for GAME Codex launch

Goal:

- convert Hart Farm cow ring into a clear short unlock challenge;
- persist `mooLevelUnlocked`;
- reveal a secret MOO LEVEL node;
- build a dedicated roughly 90-second Moo County Fair bovine score-attack bonus stage;
- make cow relocation/airtime and a MOO METER meaningful;
- provide a replayable best score and clear return path.

This is an intentional bounded reopening of secret-level/progression authority. Unrelated gameplay remains protected.

### SW-QA-002: Rapid prototype evidence lane

Issue: #63
Branch: `agent/sw-qa-002-rapid-prototype-lane`
State: ready for QA Codex launch

Goal:

- create a fast exact-source build/smoke/screenshot/web-artifact lane for prototypes;
- materially shorten the time from idea to visual evidence;
- give prototype evidence zero production authority;
- preserve all existing full sealed QA and Pages-publisher contracts.

## Next queue after first batch

Do not launch these until first-batch evidence teaches us what should be kept and the Director assigns exact conflict-safe bases.

### SW-LEVEL-001: Extensible Storm Site framework

Issue: #66
State: queued after GAME-002 review because map/progression seams may overlap.

Goal:

- move beyond four fixed levels through a reusable Storm Site/level-definition system;
- preserve authored locations while allowing bounded run-to-run variation;
- support levels with different target families, objective pools, secrets, rewards, or pure-destruction score-attack behavior;
- prove the framework with substantially different content packages.

Preferred first proof directions:

1. county fair/fairground pure-destruction vertical slice;
2. coastal boardwalk/pier vertical slice with boats and a future Waterspout unlock feat.

Established future families include beaches, malls/open-air retail, strip malls, stadiums/event grounds, grocery-store variants, and regional destruction playgrounds.

Product read: **same place, different storm day**, not featureless procedural generation.

### SW-RPG-001: MOO-LAH economy and ability progression

Issue: #67
State: queued after GAME-002 and first Stage 2B playtest evidence.

Goal:

- restore the intended light-action-RPG layer;
- working earned soft currency: **MOO-LAH**;
- cow/Cow 17 face coin motif on one side, udder emblem on the reverse;
- currency earned through good play, objectives, secrets, ranks, challenges, and selected feats;
- persistent bounded upgrades for Pull, Gust, Grid Zap, and later storm-core utility;
- base abilities remain complete and fun;
- no real-money economy by default;
- avoid fake upgrades and grind treadmills;
- selected storm forms remain feat unlocks rather than purchases.

Established feat example: **launch a boat on a coastal site -> unlock Waterspout skin/form**.

### SW-UI-001: Newspaper presentation system

Issue: #65
State: queued after first-batch review, especially after GAME-002 because menu/results wiring may overlap.

Product law:

- any newspaper shown in-game has a goofy local-paper/tabloid vibe;
- storm-type selection uses the newspaper language;
- **UNLEASH STORM** becomes a newspaper-native launch action rather than a generic button;
- the end-of-run scorecard is laid out like a fresh newspaper edition reporting the run;
- opening newspapers use the same identity family;
- all player-facing title/branding uses **Severe Weather Warning**.

Target outcome: beginning and end of a run feel like connected editions of the same ridiculous local-news universe, with the final scorecard strong enough to be screenshot-worthy.

### SW-PWA-001: Installable GitHub Pages app shell

Issue: #64
State: queued after SW-QA-002 because build/deployment files may overlap.

Goal:

- make the GitHub Pages build installable as **Severe Weather Warning**;
- home-screen icon and standalone app-like launch;
- correct `/Severe-Warning/` scope/start path behavior;
- update/cache strategy that cannot strand QA testers on stale builds;
- preserve exact build identity and full production QA authority;
- retain Android APK/device checkpoints for actual physical acceptance.

### Destruction and game-feel pass

Planned owner: GAME plus presentation support.

Focus:

- stronger impact/readability;
- destruction-stage anatomy;
- directional debris and dust;
- restrained camera impulse;
- sound/music punctuation;
- combo/score feedback;
- escalating spectacle without visual clutter.

The task should preserve ordinary-contact destruction authority unless a specific behavior is deliberately reopened.

### Commercial presentation pass

Focus on moments that make the game feel shippable:

- menu/weather-map hierarchy;
- unlock/reward moments;
- results-screen motivation;
- readable objective presentation;
- sound/UI transitions;
- visual consistency across cinematic, gameplay, newspaper presentation, progression, and results.

SW-UI-001 (#65) owns the first concrete newspaper identity slice of this broader pass.

## Level-library product law

The current four levels are the beginning of the content library.

Future sites do not all need the same things. A fairground may be almost pure destruction. A pier can be built around rides, arcades, boats, and beach objects. A stadium can focus on grandstands, scoreboards, lights, concessions, and tailgate lots. A retail site can use malls, strip malls, grocery anchors, parking lots, signs, carts, and loading areas.

Strongly themed locations matter more than forcing every site through one campaign template.

## Light-RPG product law

The progression loop should make players care about what happens after the score screen without making the arcade game feel stingy.

Preferred loop:

`play -> earn MOO-LAH/progress -> make a meaningful upgrade or unlock choice -> revisit favorite site or open a new one -> play differently`

Not every unlock is purchased. Secrets and feats remain important.

## Existing accepted/protected features

Preserve unless a specific Stage 2B issue reopens them:

- direct steering/input/general gameplay-camera feel;
- ordinary tornado movement authority;
- current base Pull and Gust behavior outside declared future upgrade layers;
- integrated Grid Zap values/topology from SW-GAME-001 outside declared future upgrade layers;
- road-safe utilities;
- normal campaign scoring/timing/objectives;
- Neon unlock/selection/persistence;
- Cow 17 safety/targetability;
- opening Moo Brew cinematic lifecycle and warning-clock handoff;
- browser-first rapid iteration and opt-in Android checkpoints.

## Moo Level product law

The Hart Farm ring is an unlock encounter, not the final secret level.

The actual Moo Level must be a dedicated authored playable bonus stage with its own objective/score identity and replay reason.

The desired folklore is:

> "Wait, you haven't unlocked the cow level yet?"

## Newspaper product law

Newspaper presentation is part of the game's recurring identity.

Any newspaper should feel goofy, local, authored, and unmistakably part of the Severe Weather Warning universe. Storm selection, **UNLEASH STORM**, and results should become connected newspaper-style presentation surfaces rather than isolated generic UI panels.

Humor may use Moo Brew ads, fake civic seriousness, weather bureaucracy, bovine/legal notices, local headlines, and absurd statistics, but readability and primary actions always win.

## Director autonomy decision

The owner has explicitly asked the Director to take the reins on game-development translation.

The owner should be able to say things like:

- "attack bubbles";
- "Blocktown";
- "it feels regressed";
- "I want an actual cow level";
- "I want to run the tornado around a beach";
- "this was supposed to be a light action RPG";
- "this isn't satisfying enough";
- "this is fun";

and have the Director turn that into concrete design, worker scope, sequencing, evidence, and acceptance criteria.

Do not make the owner pre-specify technical implementation merely because the feedback is qualitative.

## Android and PWA

Android remains opt-in for deliberate physical-device checkpoints. Browser approval never silently becomes device acceptance.

PWA installability is a browser-first convenience and product-feel improvement, not a declaration of Android acceptance.

## Integration law

Workers do not merge themselves. The Director reviews exact heads and evidence first.

A Stage 2B integrated candidate may auto-promote to the QA root only after it passes the normal exact-source integration workflow. Public QA is still a playtest gate, not production/release approval.
