# Severe Weather Warning Game Director North Star

Status: canonical product-direction contract
Last updated: 2026-08-10

This document exists so the identity of Severe Weather Warning survives chat limits, model changes, worker turnover, and long implementation cycles.

## Product ambition

Build a real commercial-feeling mobile arcade game that the owner is excited to show people on its own merits.

The quality bar is not "good for Three.js," "good for an AI project," or "technically impressive." The target is a game that can sit beside polished Google Play arcade titles and feel intentional, replayable, visually coherent, responsive, funny, and worth returning to.

The project should also be a credible demonstration of what ChatGPT plus coordinated coding agents can build when given creative direction and a durable production system.

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

World spaces must feel authored. Main Street, farms, fairgrounds, roadside businesses, utilities, civic landmarks, and neighborhoods should have distinct silhouettes and environmental stories. Avoid generic block-town repetition.

Destruction should expose believable anatomy and hierarchy. Players should be able to understand what failed and why, even when the action is chaotic.

Mobile restraint remains mandatory. Visual quality comes from composition, hierarchy, motion, material choices, lighting, authored detail, and selective effects, not unlimited particles or draw calls.

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
- local-news/media moments;
- collectible or trackable absurd statistics;
- near-miss goals that produce a natural "one more run" response.

Replay systems should deepen the core tornado fantasy rather than becoming detached menu chores.

## Humor and identity

Humor should feel embedded in the world rather than pasted on top.

Recurring identity anchors include:

- Cow 17;
- Moo Brew;
- local-news personalities and headlines;
- bovine statistics and suspicious legal disclaimers;
- regional small-town details;
- secret-level folklore;
- escalating weather absurdity.

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

## Current owner playtest truth: QA #29

Exact source: `b501737e71e61b979901d4899d969390aa37b1f4`

Positive signal:

- the round was fun;
- the core game remains worth protecting.

Blocking quality notes:

- the default tornado reads like "attack bubbles";
- some graphics feel regressed compared with earlier builds;
- the current cow-level Easter egg has no meaningful player purpose;
- the owner wants an actual Cow Level, with the current encounter serving as an unlock path;
- the game needs materially stronger replayability and commercial-mobile presentation.

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

## What Severe Weather must not become

- a generic block-town destroyer;
- a renderer demonstration searching for a game;
- a random pile of features;
- a particle showcase where effects obscure form;
- a shallow one-and-done score run;
- a cow joke with no playable payoff;
- a project where green CI is mistaken for artistic success;
- a project that requires the owner to become a software or game-development project manager.

## Stage 2B acceptance question

For every major candidate, ask:

> Does this look and play materially more like a finished, replayable commercial mobile game than the currently deployed build?

If the answer requires a paragraph explaining what changed, the milestone probably did not move far enough.
