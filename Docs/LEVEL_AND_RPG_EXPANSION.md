# Severe Weather Warning Level and Light-RPG Expansion Direction

Status: canonical product-direction companion
Last updated: 2026-08-10

This document captures the long-form replayability structure for **Severe Weather Warning**.

## Genre law

Severe Weather Warning is a mobile arcade destruction game with **light action RPG progression**.

The player fantasy remains immediate and physical: you are the storm. RPG systems exist to deepen that fantasy, create mastery, unlock new toys, and give the player reasons to revisit destruction sites. They must not turn the game into a menu-management simulator.

## Core long-term loop

`choose a destruction site -> choose storm form/loadout -> unleash storm -> destroy/chase objectives/secrets -> newspaper results -> earn currency/progress -> upgrade abilities/unlock forms/sites -> replay or move somewhere new`

A run should still be fun even if the player ignores progression. Progression makes the next run more interesting, not merely numerically mandatory.

## Extensible level law

The current four levels are a foundation, not the intended final content count.

The game needs a scalable way to add many authored destruction playgrounds without requiring every new level to rewrite the campaign core.

New locations do not all need the same structure, targets, or objective mix. Some may be campaign locations with goals and narrative flavor. Others may be pure score-attack destruction playgrounds.

Preferred architecture: a data-driven **Storm Site** registry or equivalent level-definition system.

A site definition should be able to declare, as appropriate:

- display name and newspaper flavor;
- region/theme;
- authored world/layout module set;
- landmark/POI roster;
- destructible target families;
- objective pool;
- optional pure-destruction mode;
- secret triggers;
- storm-form/cosmetic unlock feats;
- currency/reward rules;
- rank/score thresholds;
- replay variants/modifiers;
- results/headline metadata;
- performance budget/profile.

The goal is that future workers can add a new destruction site primarily by supplying a bounded site package rather than editing unrelated campaign authority.

## Authored variability law

Do not solve replayability with featureless procedural generation.

Locations should remain recognizably authored, but repeated runs do not need identical contents.

A site may vary through bounded authored pools such as:

- alternate prop and parked-vehicle sets;
- rotating sponsor/signage sets;
- different objective combinations;
- optional landmarks/events;
- different secret opportunities;
- local weather/lighting variants;
- target placement variants within safe authored zones;
- special-event editions;
- challenge modifiers.

The desired feeling is **same place, different storm day**, not a random level generator.

## Location families

The following are established expansion directions, not promises that all ship at once.

### County fair / fairground

Can support both the secret Moo Level and ordinary pure-destruction variants.

Useful anatomy:
- rides;
- midway games;
- food stands;
- livestock/farm structures where appropriate;
- sponsor signage;
- grandstand/demolition-derby or tractor-pull elements;
- portable toilets, generators, fencing, trailers, and parked vehicles.

A fairground can succeed as a level with almost no narrative requirement: it is simply an unusually satisfying place to destroy.

### Pier / boardwalk / Coney-Island-style amusement coast

Useful anatomy:
- pier and boardwalk;
- arcade/frontage strip;
- ferris wheel or other ride silhouettes;
- marina/boats;
- beach concessions;
- lifeguard structures;
- beach clutter/cabanas/umbrellas;
- seaside motels or small attractions where useful.

Signature feat idea: **launch a boat** or complete a related coastal stunt to unlock a **Waterspout** storm skin/form.

### Beach / resort coast

The player should be able to run a tornado along a beach and interact with sand, boats, small structures, boardwalk objects, and coastal clutter.

This can overlap with the pier family without requiring every beach site to contain an amusement pier.

### Mall / shopping district

Prefer outdoor/open-air or partially open layouts first if interior camera/navigation would compromise the current tornado-control fantasy.

Useful anatomy:
- department-store anchors;
- parking lots;
- freestanding restaurants;
- signs and light poles;
- loading/service areas;
- carts and exterior retail clutter;
- optional open-air mall streets.

### Strip mall / roadside retail

Useful anatomy:
- grocery anchor;
- pharmacy;
- discount store;
- restaurants;
- gas station;
- parking-lot islands;
- carts/signs/dumpsters/delivery vehicles.

This is a strong everyday-Americana destruction site and can vary heavily between runs.

### Stadium / event grounds

Useful anatomy:
- grandstands/bleachers;
- scoreboard;
- light towers;
- concessions;
- tailgate lots;
- sponsor structures;
- maintenance/service structures.

Crowd representation should obey tone/performance/safety decisions. The destruction fantasy does not require harming visible spectators.

### Grocery store

May exist as part of a strip mall or as a compact specialty destruction site.

Potential identity:
- carts/corrals;
- signage;
- loading docks;
- exterior displays;
- roof/HVAC anatomy;
- parking-lot clutter;
- optional readable interior exposure after structural failure if technically appropriate.

## Unlock-feat law

New storm skins/forms and secrets should often be tied to memorable feats rather than only level completion.

Examples:
- launch a boat -> unlock Waterspout;
- complete Bovine Compliance Test -> unlock Moo Level;
- unusual electrical chain -> unlock related cosmetic/record/headline;
- destroy a landmark in a specific way -> reveal a secret or special edition.

Players should be able to tell friends **how** they found something.

## Soft currency direction

Working currency name: **MOO-LAH**.

This is an earned gameplay currency, not a real-money system by default.

Coin identity:
- small physical-looking arcade coin/token;
- cow/Cow 17 face motif on one side;
- udder emblem on the reverse;
- readable at mobile scale;
- may appear in newspaper rewards, map progression, upgrade screens, and unlock celebrations.

MOO-LAH should primarily come from playing well, completing objectives, finding secrets, achieving ranks, and earning first-time feats.

Avoid grind inflation. Rewards should feel meaningful, and the player should regularly be able to buy or work toward something understandable.

## Light action RPG progression

Abilities should be upgradeable through persistent progression.

The RPG layer should create meaningful choices without making a fresh player feel crippled.

Preferred model:
- core abilities remain fun at base level;
- upgrades are bounded and legible;
- several upgrade paths change utility or style, not only raw percentages;
- upgrades can support specialization while preserving direct tornado control;
- progression is local-first and works offline.

Potential upgrade families:

### Pull
- larger useful capture radius;
- improved grip on heavier debris;
- longer/steadier hold behavior;
- specialized bonus for chaining or collecting debris.

### Gust
- wider or more focused cone/path choice;
- stronger impulse;
- improved debris interaction;
- recharge/efficiency improvements within a bounded range.

### Grid Zap
- controlled chain reach/node count;
- stronger powered-object overload effects;
- specialized topology/bonus behavior;
- recharge/efficiency improvements within a bounded range.

### Storm Core / Vortex utility

Avoid casually changing the fundamental steering feel.

Safer upgrade examples include:
- debris-orbit capacity/utility;
- combo retention support;
- pickup/collection utility;
- spectacle/impact bonuses tied to skilled play;
- defensive/forgiveness systems if future game modes need them.

Raw movement speed/turn response should not become a mandatory stat treadmill unless explicitly proven fun through playtesting.

## Progression balance law

The game must avoid two common failures:

1. **fake RPG:** upgrades exist but barely matter;
2. **grind RPG:** the player is weak until they repeat old content for numbers.

Target instead:
- every purchase is understandable;
- meaningful upgrades arrive at a satisfying cadence;
- skill still dominates score mastery;
- old sites become fun to revisit with new abilities/forms;
- some unlocks are earned through feats/secrets rather than currency;
- cosmetic storm forms can coexist with mechanical upgrades without pay-to-win logic.

## Weather Map evolution

The map should eventually become a growing destination board rather than a four-node linear list.

It can contain:
- campaign anchors;
- destruction playgrounds;
- secret levels;
- bonus score attacks;
- coastal, retail, civic, farm, fairground, stadium, and regional sites;
- locked nodes that tease unusual unlock conditions.

New destinations should create anticipation before the player even presses **UNLEASH STORM**.

## Replayability target

A healthy long-term session loop should regularly offer several competing reasons to play again:

- improve the score/rank on a favorite site;
- complete a different objective set;
- earn enough MOO-LAH for an ability upgrade;
- attempt a secret feat;
- unlock a new storm skin/form;
- try a newly unlocked site;
- chase a site-specific absurd statistic;
- beat a personal best;
- see a different end-of-run newspaper headline.

The player should not feel they have "seen the game" after completing four locations once.
