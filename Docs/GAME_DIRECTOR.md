# Severe Weather Warning Game Director North Star

Status: canonical product-direction contract
Last updated: 2026-08-10

This document exists so the identity of Severe Weather Warning survives chat limits, model changes, worker turnover, and long implementation cycles.

## Product ambition

Build a real commercial-feeling mobile arcade game that the owner is excited to show people on its own merits.

The quality bar is not "good for Three.js," "good for an AI project," or "technically impressive." The target is a game that can sit beside polished Google Play arcade titles and feel intentional, replayable, visually coherent, responsive, funny, and worth returning to.

The project should also be a credible demonstration of what ChatGPT plus coordinated coding agents can build when given creative direction and a durable production system.

## Canonical title law

The game is called **Severe Weather Warning**.

Player-facing branding must use **Severe Weather Warning** as the product title. Do not silently shorten the game name to "Severe Weather" in menus, headers, splash screens, manifests, scorecards, store-facing copy, promotional material, or other identity surfaces unless a specific platform field has a documented length constraint and an explicitly approved short label is required.

The repository name `Severe-Warning` and casual conversational shorthand do not redefine the product name.

## Genre law

Severe Weather Warning is a **mobile arcade destruction game with light action RPG progression**.

The arcade layer comes first: direct movement, destruction, spectacle, score chasing, objectives, secrets, and short replayable runs.

The light-RPG layer gives the player persistent growth, ability upgrades, currency, unlocks, storm forms, and reasons to revisit old destruction sites. It must deepen the tornado fantasy rather than turn the game into a menu-management or grind simulator.

Core long-term loop:

`choose a destruction site -> choose storm form/loadout -> UNLEASH STORM -> destroy/chase objectives/secrets -> newspaper results -> earn currency/progress -> upgrade abilities/unlock forms/sites -> replay or move somewhere new`

A run should remain fun even if the player temporarily ignores progression.

## Player fantasy

You are the storm.

A run should deliver a fast, legible power fantasy built from movement, destruction, escalation, spectacle, score chasing, secrets, and increasingly ridiculous consequences.

The player should regularly experience moments worth showing another person:

- a tornado ripping through a recognizable small-town street;
- chained power-grid destruction;
- structures failing in readable stages;
- cows becoming airborne without becoming disposable targets;
- local-news/media spectacle reacting to the run;
- a strange secret being discovered;
- a rare unlock or bonus route appearing;
- a last-second score or objective chase that makes another run tempting.

## Art direction

Core thesis: **storm-charged stylized Americana**.

Visual promise: **beautiful at a glance, readable at speed, cinematic up close**.

The game may be stylized and chunky, but it must not read as a primitive tech demo.

The storm is the hero. It must read as one dangerous connected atmospheric mass, not a stack of discs, attack bubbles, detached smoke balls, a clean cone, or a collection of visible effect primitives.

World spaces must feel authored. Main Street, farms, fairgrounds, roadside businesses, utilities, civic landmarks, neighborhoods, retail districts, beaches, piers, and event grounds should have distinct silhouettes and environmental stories. Avoid generic block-town repetition.

Destruction should expose believable anatomy and hierarchy. Players should be able to understand what failed and why, even when the action is chaotic.

Mobile restraint remains mandatory. Visual quality comes from composition, hierarchy, motion, material choices, lighting, authored detail, and selective effects, not unlimited particles or draw calls.

## Newspaper presentation identity

Newspaper presentation is a recurring part of the Severe Weather Warning identity, not merely a one-time cinematic prop.

Any newspaper shown in the game should have a **goofy local-newspaper vibe**. The humor should feel like a small-town paper taking ridiculous weather, civic problems, bovine incidents, sponsor notices, and storm statistics with absurd seriousness.

The newspaper language should connect the beginning and end of a run through one coherent UI family:

1. opening/newspaper cinematic moments;
2. pre-run storm-type selection;
3. the **UNLEASH STORM** action;
4. end-of-run score/results.

Target visual language:

- strong old-local-paper or tabloid masthead energy;
- large readable headlines;
- columns, rules, boxes, captions, stamps, classifieds, ads, and sidebars used selectively;
- slightly imperfect print, ink, and paper character without harming mobile legibility;
- restrained newsprint foundation with selective game accents and images where useful;
- goofy local copy, Moo Brew ads, weather bureaucracy, bovine/legal notices, and absurd statistics;
- authored composition rather than a generic newspaper CSS template.

The storm selector should feel like a weather special edition. Each storm can be treated as a featured forecast or story while keeping gameplay traits obvious. **UNLEASH STORM** should feel like a giant headline, press action, special-edition callout, or equivalent newspaper-native launch device rather than an ordinary floating button.

The results screen should feel like a fresh edition reporting what the player just did. Score, rank, major destruction events, cow/grid/secret statistics, best-score progress, unlocks, currency, upgrade availability, and near misses should be presented as readable stories, sidebars, callouts, and headlines. A dynamic run headline is encouraged where practical. Replay, continue, and Weather Map actions must remain obvious.

The end-of-run edition should be visually strong enough to feel screenshot-worthy and shareable.

Humor never outranks comprehension. The primary action and important run information must remain instantly readable.

## Game feel

Every player action should answer back.

Important response layers include:

- immediate readable impact;
- satisfying object reaction;
- debris and motion with clear direction;
- camera impulse that supports rather than obscures control;
- useful sound and music punctuation;
- score/combo feedback that feels earned;
- escalating spectacle as the run improves;
- short quiet beats that make the loud moments hit harder.

Do not confuse more effects with better feel.

## Replayability

A fun first run is not enough.

The game should create reasons to play again through a combination of:

- score mastery and combo routes;
- rotating or branching objectives;
- storm forms/cosmetics that change the visual fantasy without invalidating skill;
- persistent unlocks;
- secret encounters and bonus levels;
- region/location variation;
- challenge conditions;
- campaign progression;
- light-RPG ability growth;
- earned soft currency;
- local-news/media moments;
- collectible or trackable absurd statistics;
- near-miss goals that produce a natural "one more run" response.

Replay systems should deepen the core tornado fantasy rather than becoming detached menu chores.

## Extensible destruction-site law

The current four levels are a foundation, not the intended final content count.

Severe Weather Warning needs a scalable library of authored destruction playgrounds. New locations do not all need the same objectives, props, landmarks, or gameplay structure. Some may be campaign anchors with goals and secrets. Others may be nearly pure score-attack destruction.

Preferred architecture is a data-driven **Storm Site** registry or equivalent level-definition system so future locations can be added through bounded site packages rather than repeated campaign-core rewrites.

A site should be able to declare, when relevant:

- display name and newspaper flavor;
- region/theme;
- authored layout/module set;
- landmark and POI roster;
- destructible target families;
- objective pool or pure-destruction mode;
- secret and unlock triggers;
- reward/currency rules;
- score/rank thresholds;
- replay variants/modifiers;
- results/headline metadata;
- performance profile.

Repeated runs may use bounded authored variation such as different objective combinations, prop sets, parked vehicles, sponsors, optional events, secrets, target placements in safe authored zones, or lighting/weather editions.

Desired feeling: **same place, different storm day**.

Do not replace authored places with featureless procedural generation.

Established location families include:

- county fair / fairground;
- pier / boardwalk / Coney-Island-style amusement coast;
- beach / resort coast;
- mall or open-air shopping district;
- strip mall / roadside retail;
- stadium / event grounds;
- grocery-store variants;
- additional future regional destruction playgrounds.

A fairground can simply be a glorious destruction level. It does not need a story excuse.

## Unlock-feat law

Not every unlock should come from finishing a level or buying it.

Memorable feats should reveal selected storm forms, cosmetics, secrets, or special nodes.

Established examples:

- complete the Hart Farm Bovine Compliance Test -> unlock the real Moo Level;
- **launch a boat on a coastal site -> unlock a Waterspout skin/form**.

The player should be able to tell friends how unusual content was discovered.

## MOO-LAH economy direction

Working soft-currency name: **MOO-LAH**.

MOO-LAH is an earned gameplay currency, not a real-money economy by default.

Coin/token identity:

- cow or Cow 17 face motif on one side;
- udder emblem on the reverse;
- compact arcade-token read at mobile scale;
- appears in newspaper rewards, Weather Map progression, upgrades, and unlock celebrations.

MOO-LAH should be earned primarily by playing well, completing objectives, finding secrets, achieving ranks, clearing challenges, and hitting selected milestone feats.

Avoid grind inflation. Players should regularly understand what they are saving for and feel that good play moves them toward it.

## Light action RPG ability progression

Core abilities remain fun and complete at base level. Persistent upgrades should create meaningful growth and specialization without making a fresh player intentionally weak.

Initial upgrade families may include:

### Pull
- larger useful capture radius;
- improved grip on heavier debris;
- steadier or longer hold behavior;
- debris-chain/collection specialization.

### Gust
- wider or more focused behavior;
- stronger impulse;
- improved debris interaction;
- bounded recharge/efficiency improvements.

### Grid Zap
- controlled chain reach/node count;
- powered-object overload improvements;
- specialized network bonuses;
- bounded recharge/efficiency improvements.

### Storm Core / Vortex utility

Prefer upgrades that preserve the accepted steering feel, such as debris-orbit utility, combo-retention support, collection utility, or skilled-play impact bonuses.

Raw movement speed/turn response should not become a mandatory stat treadmill without explicit playtest evidence that it improves the game.

Avoid both common failures:

1. **fake RPG**, where upgrades barely matter;
2. **grind RPG**, where the base game is weak until numbers are farmed.

Skill must remain important. Old sites should become enjoyable to revisit with new builds, not merely easier checklists.

## Weather Map evolution

The Weather Map should eventually become a growing destination board rather than a four-node linear list.

It can contain:

- campaign anchors;
- destruction playgrounds;
- secret levels;
- bonus score attacks;
- coastal, retail, civic, farm, fairground, stadium, and regional sites;
- locked nodes that tease unusual discovery conditions.

The map should create anticipation before the player presses **UNLEASH STORM**.

## Humor and identity

Humor should feel embedded in the world rather than pasted on top.

Recurring identity anchors include:

- Cow 17;
- Moo Brew;
- local-news personalities and headlines;
- bovine statistics and suspicious legal disclaimers;
- regional small-town details;
- secret-level folklore;
- escalating weather absurdity;
- MOO-LAH and ridiculous official upgrade/reward bureaucracy where useful.

Comedy should come from timing, world logic, visual reaction, recurring references, and player-created situations.

## Moo Level law

The current Hart Farm cow ring is **not** the final Cow Level.

It should become an unlock encounter or discovery that can reveal a genuine secret playable Cow Level.

Desired player experience:

1. discover the suspicious Hart Farm bovine gathering;
2. receive a clear but funny short challenge;
3. complete a skillful cow/airtime/relocation condition using existing tornado play;
4. receive an unmistakable secret unlock moment;
5. gain access to a dedicated authored bonus level with its own map identity, objectives, score chase, and replay value.

The Cow Level should be the kind of secret players tell friends about. It must be more than decorative cows standing in a ring.

Cow 17 and animal-safety rules remain protected unless a specific design contract intentionally changes them.

## PWA and phone-access direction

The GitHub Pages build should become installable as a Progressive Web App when the queued PWA task is sequenced safely with QA infrastructure.

The PWA exists to make browser-first playtesting and casual sharing feel more like launching a real app:

`visit Pages -> install Severe Weather Warning -> home-screen icon -> standalone launch`

PWA implementation must preserve exact build identity and must not trap testers on stale cached QA builds. Fresh deployment discovery and deterministic cache/version invalidation are blocking requirements.

PWA installability is not a substitute for physical Android acceptance. APK/device checkpoints remain deliberate when actual device behavior matters.

## Current owner playtest truth: QA #29

Exact source: `b501737e71e61b979901d4899d969390aa37b1f4`

Positive signal:

- the round was fun;
- the core game remains worth protecting.

Blocking quality notes and new direction:

- the default tornado reads like "attack bubbles";
- some graphics feel regressed compared with earlier builds;
- the current cow-level Easter egg has no meaningful player purpose;
- the owner wants an actual Cow Level, with the current encounter serving as an unlock path;
- the game needs materially stronger replayability and commercial-mobile presentation;
- the current four levels are only a starting set;
- future levels should include strongly themed destruction playgrounds with authored run-to-run variation;
- the original light-action-RPG intent remains active and should include upgradeable abilities and persistent earned rewards.

These notes outrank green CI when evaluating the current visual/product state.

## Director authority

The owner supplies taste, reactions, fantasies, priorities, and final acceptance.

The Director is expected to make game-development decisions between those reactions and worker implementation. The owner should not have to specify particles, state machines, exact geometry techniques, progression schemas, or file-level architecture unless they want to.

When the owner says things such as:

- "attack bubbles";
- "Blocktown";
- "this feels cheap";
- "I don't know what to do here";
- "this was fun";
- "I want a real cow level";
- "I want to run the tornado around a beach";
- "this was supposed to be a light action RPG";

The Director must translate the observation into concrete design hypotheses, priorities, worker contracts, and acceptance criteria.

If multiple interpretations are plausible, prefer bounded prototype alternatives and visual/playtest comparison rather than forcing the owner to pre-specify implementation.

## Production philosophy

Use two gears deliberately.

### Prototype gear

Use for discovering visual language, mechanics, pacing, and feel.

- bounded experiments;
- disposable branches are acceptable;
- compare alternatives quickly;
- production merge is forbidden without later integration review;
- human playtest judgment is the primary purpose.

### Production gear

Use after a direction has earned acceptance.

- exact source identity;
- worker ownership boundaries;
- protected gameplay law;
- regression QA;
- sealed artifacts;
- performance evidence;
- integration review;
- public QA promotion;
- owner playtest.

Do not force every exploratory visual idea through the full production digestive tract before anyone has seen whether it is good.

## What Severe Weather Warning must not become

- a generic block-town destroyer;
- a renderer demonstration searching for a game;
- a random pile of features;
- a particle showcase where effects obscure form;
- a shallow one-and-done score run;
- a four-level game that feels exhausted after one clear;
- a fake RPG where upgrades are meaningless;
- a grind RPG where the base storm is deliberately weak;
- a cow joke with no playable payoff;
- a project where green CI is mistaken for artistic success;
- a project that requires the owner to become a software or game-development project manager.

## Stage 2B acceptance question

For every major candidate, ask:

> Does this look and play materially more like a finished, replayable commercial mobile game than the currently deployed build?

If the answer requires a paragraph explaining what changed, the milestone probably did not move far enough.

See `Docs/LEVEL_AND_RPG_EXPANSION.md` for the detailed level-library, location-family, currency, and progression design companion.
