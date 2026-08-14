# Severe Weather Warning Current Status

**Last updated:** 2026-08-14 16:36 America/Chicago  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Primary target:** mobile landscape / browser-first QA  
**Production renderer:** Three.js r128  
**Active phase:** Stage 2B — Make It Feel Like a Game  
**Director authority branch:** `agent/director-stage2b-game-direction`

> **Status-document role:** This file is a concise human-readable snapshot. For fresh-chat recovery and current execution authority, read `Docs/ACTIVE_HANDOFF.md` first. Exact issue/branch/commit/CI evidence outranks this summary if anything has moved since its timestamp.

## Current canonical gameplay source

Canonical integration branch:

`agent/sw-int-003-stage2b-accepted-stack`

Exact Director-accepted head:

`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

Previous canonical:

`271e5d3d7b438727df8b217ad59b7974ff1374b6`

The previous SHA is now the pre-quality-rescue comparison baseline, not current gameplay authority.

## What just closed

The owner-playtest quality rescue is complete.

Closed issues:
- #79 `SW-QUALITY-001: Owner-playtest quality rescue`
- #80 `SW-QUALITY-002: Owner playtest visual rescue`

Decisive engineering evidence:
- branch/head: `agent/sw-quality-001-owner-playtest-rescue` @ `7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`
- workflow: `SW-QUALITY Owner Playtest Rescue`
- Actions run: `31834411255`
- conclusion: success

Independent visual acceptance evidence:
- branch/head: `agent/sw-qa-quality-002-visual-acceptance` @ `ec723a14474e5db502b8a5fd7899807dad7db4d0`
- reviewed candidate: `f493e3d51f6d772d89bdbe945529ebde9d58196f`
- verdict: PASS across QUALITY-002-owned visual areas

Hostile post-rescue audit:
- branch/head: `agent/sw-audit-post-quality-002-gap-map` @ `ea2946912c623504e22da74a4f58463f373b3491`
- no P0 blockers
- remaining material quality gaps converted into the next bounded work wave

## Accepted quality-rescue outcomes

Protect these unless an exact later task deliberately reopens them:

- Tornado reads as a connected dirty volumetric rotating storm through the whole column.
- Short-landscape newspaper is compact, legible, scroll-safe, and launch-reachable.
- Pause remains reachable in short landscape.
- Quit-to-main-menu actually ends active-run presentation/lifecycle state.
- County Fair and Gullwind Boardwalk have materially distinct environmental identities.
- Storm Sites do not inherit the Heartland Cow 17 opening.
- Cow 17 opening uses improved Three.js actor/camera/material staging without prototype/debug chrome.
- Core movement, abilities, score/progression authority, Cow safety, and accepted site framework remain protected.

## Active work

All current workers start from exact accepted base:

`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

### #81 — SW-WORLD-007
**Supercell and Derecho atmospheric identity overhaul**  
Branch: `agent/sw-world-007-secondary-storm-forms`

Purpose:
replace the remaining UFO/saucer and cyan/wireframe storm reads with connected severe-weather silhouettes while preserving gameplay mechanics and the accepted Tornado.

### #82 — SW-FEEL-001
**Physical destruction consequence presentation**  
Branch: `agent/sw-feel-001-destruction-consequence`

Purpose:
make ordinary structural destruction visibly read through anatomy, direction, debris, and dust while leaving damage, health, collision, score, and targetability authority unchanged.

### #83 — SW-UI-003
**Run-shell Americana identity for pause and results**  
Branch: `agent/sw-ui-003-run-shell-identity`

Purpose:
make pause/results belong to the same Severe Weather Warning universe, show correct active-site identity, and turn end-of-run score/rank into a stronger emotional payoff without changing result truth or lifecycle authority.

**Worker-state caution:** branch preparation/assignment is not proof of completion. Verify branch movement, exact returned SHA, diff, QA, and evidence before acceptance.

## Near-term work held behind the active wave

Not currently authorized inside #81/#82/#83:

- tactile MOO-LAH and Storm Triangle reward/loadout presentation;
- Secret Moo Level bespoke environment/HUD identity;
- broader Heartland/world density and material-repetition improvement;
- later destruction-anatomy expansion after the first bounded FEEL slice proves safe.

Longer-term ideas such as Twin Tornadoes, Waterspout, broader map expansion, satellite feats, online/accounts, and additional Storm Sites remain future scope unless separately assigned.

## Product identity

The game is **Severe Weather Warning**.

Genre:
**mobile arcade destruction game with light action RPG progression**.

Player fantasy:
**YOU ARE THE STORM**.

Art thesis:
**storm-charged stylized Americana**.

Visual promise:
**beautiful at a glance, readable at speed, cinematic up close**.

The quality bar is a polished commercial-feeling mobile game, not a Three.js technology demonstration.

## Gameplay / protection law

Unless an exact task explicitly reopens a system, protect:

- steering/input/general gameplay-camera feel;
- storm movement/speed authority;
- Pull, Gust, Grid Zap and accepted advanced-ability behavior;
- scoring/combo/timer/objectives/rank/campaign truth;
- target health, damage, collision, targetability, and gameplay coordinates;
- Cow 17/cow safety;
- pause/reset/lifecycle behavior;
- local-first progression and score persistence.

Presentation may read gameplay truth. It may not silently become gameplay authority.

## World / replay law

- Town/county campaign remains the home backbone.
- Storm Sites are authored substantial destruction playgrounds.
- Desired replay read: **same place, different storm day**.
- Avoid generic Blocktown repetition and featureless procedural generation.
- Hart Farm is the Moo Level unlock encounter; the dedicated Moo Level is the actual secret bonus stage.

## RPG / economy law

- MOO-LAH is earned local-first gameplay currency, not real-money currency by default.
- Base abilities remain fun and complete.
- Exactly three equipped active abilities live in the Storm Triangle.
- Slingshot is the first accepted Pull + Gust physical synergy.
- Avoid both fake upgrades and grind treadmills.

## Public QA status

Canonical source acceptance and public QA deployment are separate gates.

The exact accepted canonical source is now `7d3e7e...`.

Do **not** claim the public GitHub Pages QA root is serving that SHA without separately verifying the Pages publisher/deployment evidence. The previously documented deployed source was `271e5d3...`.

## Android status

Browser-first QA remains the normal iteration path.

Physical Android acceptance is a separate deliberate checkpoint requiring the exact artifact to be installed and played on the target device. Browser green status never silently becomes physical acceptance.

## Recovery pointers

Fresh session:
1. Issue #71 `DIRECTOR START HERE`;
2. `Docs/ACTIVE_HANDOFF.md`;
3. exact issue/branch/CI evidence needed for the current decision;
4. deeper law/docs only when planning, assigning, reviewing, integrating, or changing work.

Do not use old PR descriptions, `main`, or pre-rescue status prose as current execution authority.
