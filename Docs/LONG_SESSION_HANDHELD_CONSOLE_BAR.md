# Severe Weather Warning Long-Session / Handheld-Console Design Bar

Status: canonical product-direction companion
Last updated: 2026-08-10

This document exists to prevent **Severe Weather Warning** from shrinking into the expectations of a disposable mobile game simply because the current production path is browser/mobile-first.

## Platform ambition

Phone is a platform, not the intended size of the game.

Severe Weather Warning should be designed so that its systems, pacing, controls, progression, content density, and replayability could make sense on a dedicated handheld or console-style device in the future.

The current browser/PWA/Android path does not imply that the design should be reduced to short-lived mobile novelty.

This is a **design-quality target**, not a claim that an actual Nintendo Switch 2 port or platform agreement has been completed.

## Long-session test

A healthy version of the game should support both:

- a satisfying short run when the player has only a few minutes;
- a voluntary 30-90+ minute session made of several runs, upgrades, unlock hunts, map choices, score chases, secrets, and favorite destruction sites.

The player should stay because the toy is fun, the progression is interesting, and the world keeps offering new things to try.

Avoid designing around coercive session-extension patterns such as stamina gates, artificial wait timers, forced-ad cadence, deliberately stingy progression, or repetitive grind loops.

## Session texture

Long play should come from variety rather than one oversized level.

A longer session might naturally look like:

`US map -> county run -> newspaper -> buy Pull upgrade -> beach run -> nearly unlock Waterspout -> replay beach -> unlock Waterspout -> try fairground with new build -> discover secret -> return to map`

The player can stop after any run without feeling punished, then resume later with persistent local-first progress.

## Controller-ready design law

Future gameplay/UI architecture should avoid needless dependence on touch-only assumptions.

Where practical, systems should remain compatible with:

- analog or digital movement input;
- controller buttons for core abilities;
- controller-friendly selection/focus navigation;
- readable couch/handheld UI scale;
- pause/resume and clean session boundaries.

Touch remains a first-class current input. Controller readiness should not make phone controls worse.

## Content depth law

The content structure should support a game someone can keep installed and revisit for a long time.

Depth should come from combinations of:

- the existing town/county campaign backbone;
- a growing U.S. destination map;
- many Storm Sites at different scales;
- pure-destruction playgrounds;
- authored replay variants;
- score mastery;
- MOO-LAH earnings and spending;
- meaningful ability upgrades;
- storm forms and advanced abilities;
- feats and unusual unlock methods;
- secret levels such as the Moo Level;
- site-specific records/statistics;
- changing newspaper headlines/results;
- future challenges or event variants that deepen rather than replace the base game.

## Progression quality law

The light action RPG should support experimentation over many hours.

A player should eventually be able to develop noticeably different storm builds without invalidating the fun of the base tornado.

Examples may include:

- stronger Pull/debris-control specialization;
- Gust-focused destructive play;
- Grid Zap electrical-chain specialization;
- advanced spectacle powers such as Twin Tornadoes;
- storm-form unlocks such as Waterspout;
- future build choices that change tactics or visual fantasy.

MOO-LAH should reward play, not manufacture grind.

## Replayability test

Before calling the game mature, the Director should be able to answer yes to questions such as:

- Can I play three or four different runs in a row and have them feel meaningfully different?
- Is there something useful or exciting to earn even after I know the controls?
- Do favorite locations remain fun after they are cleared once?
- Can I develop a storm build that feels like mine?
- Are there secrets or feats I can tell another player about?
- Does the U.S. map keep giving me destinations I am curious to unlock?
- Would I ever boot the game with no checklist goal simply because destroying things is fun?

That final question matters the most.

## Presentation bar

Long-session depth does not excuse ugly or utilitarian presentation.

The storm must remain beautiful and powerful, locations must feel authored, destruction must be satisfying to watch, and UI/newspaper/map/progression surfaces must feel like parts of the same Severe Weather Warning universe.

The target is a game that can be enjoyed for a while and also looks good enough that someone nearby wants to see what is being played.

## Relationship to current development

Browser-first iteration remains useful because it gives the project fast access to playable builds.

PWA installation can make that experience more app-like.

Android remains a deliberate device-test path.

None of those current delivery methods lower the product ambition. The game itself should be built with enough depth, input abstraction, progression, content architecture, and presentation quality that future platform expansion remains plausible rather than requiring a complete redesign of what Severe Weather Warning is.
