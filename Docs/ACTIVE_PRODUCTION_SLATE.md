# Severe Weather Warning Active Production Slate

Last updated: 2026-08-14
Status: canonical near-term work queue
Director authority branch: `agent/director-stage2b-game-direction`

## Current accepted Stage 2B base

Canonical integration branch:
`agent/sw-int-003-stage2b-accepted-stack`

Exact accepted canonical head:
`706408e4e367782fed0ffc6e40d0cdd27a7e71bd`

This head includes:
- the previously accepted Stage 2B gameplay/RPG/PWA/world/Storm Site stack;
- QUALITY-001/002 owner-playtest rescue;
- #83 SW-UI-003 run-shell Americana identity;
- #86 SW-UI-004 gameplay product identity;
- #87 SW-INT-004 combined commercial-shell acceptance.

SW-INT-004 proof:
- run `31851282218` — **SUCCESS**
- combined gameplay/pause/results evidence passed Director pixel review.

## ACTIVE NOW

### #81 — SW-WORLD-007 secondary storm identity

State: **visual correction in progress, not accepted**
Branch: `agent/sw-world-007-secondary-storm-forms`
Latest handoff head: `4caeae17d5c7949f1ef110e9ef9df3d209c375b6`
Latest run: `31851426172` in progress at handoff.

Current correction strategy:
- atmospheric sprite mass instead of saucer/plane primitives;
- per-frame visibility lock suppressing legacy Supercell/Derecho geometry;
- QA-only Cow-Cam chrome suppression for truthful evidence.

Acceptance remains label-free visual recognition. Do not integrate until actual screenshots pass.

### #82 — SW-FEEL-001 destruction consequence

State: **visual correction in progress, not accepted**
Branch: `agent/sw-feel-001-destruction-consequence`
Latest handoff head: `d84e5bd66fcb46518324efa8a7c23a1598702658`
Latest run: `31851501064` in progress at handoff.

Current correction strategy:
- keep authoritative lethal-destruction event untouched;
- structural anatomy panels for roof/wall/facade failure;
- structural buildings now limit generic fragment burst to two small fragments so anatomy carries the read;
- trees/cows excluded from the throttle.

Do not integrate until truthful screenshots read as physical structural failure rather than cubes/confetti.

### #84 — SW-QA-009 Pages publisher refresh

State: **validated infrastructure, needs refresh to new canonical before deploy**
Draft PR: #85
Branch: `agent/sw-qa-009-pages-publisher-refresh`
Prior no-deploy validation head: `37df138bce04f7384e5d0e42ded13831fdc1ad83`
Prior validation run: `31850189242` — SUCCESS.

That publisher validation targeted old canonical `7d3e7e...` and is now stale relative to accepted canonical `706408e4...`.

Before any deployment:
- update publisher default/contract to `706408e4...`;
- include accepted UI-003 + UI-004 stages;
- rerun no-deploy validation;
- review exact evidence;
- merge/deploy only deliberately.

## ACCEPTED THIS WAVE

- #83 SW-UI-003 — closed, accepted head `76042f632398d4bef917a08436dc2338034fb3e6`
- #86 SW-UI-004 — closed, accepted head `8becea1133864057050d6cd48ad033dc9992c445`
- #87 SW-INT-004 — closed, accepted head `706408e4e367782fed0ffc6e40d0cdd27a7e71bd`

## NEXT DE-PROTOTYPE PRIORITIES

After #81/#82 are resolved and #84 is refreshed:
1. tactile MOO-LAH + Storm Triangle reward/purchase presentation;
2. Secret Moo Level legendary-stage environment/HUD identity;
3. broader Heartland world density/material-repetition pass;
4. bounded cleanup of remaining technical desktop control/instruction legend.

Do not widen active tasks into these areas.

## HELD

Twin Tornadoes, Waterspout, satellite feat, full U.S. map, online/accounts/leaderboards, major new Storm Site families, and large feature expansion remain held until commercial-quality debt above is reduced.

## Binding product laws

- Product: **Severe Weather Warning**.
- Genre: mobile arcade destruction + light action RPG.
- Fantasy: **YOU ARE THE STORM**.
- Fun/destruction first; beauty first-class.
- Art thesis: **storm-charged stylized Americana**.
- Storm forms must read as connected atmospheric masses, never visible effect primitives.
- Authored places beat generic Blocktown repetition.
- Newspaper is recurring identity across select/results; gameplay UI belongs to the same world without literally becoming newspaper everywhere.
- Cow 17, cows, and Moo Brew remain the comic backbone; cows remain protected/non-targetable.
- MOO-LAH is local-first earned currency.
- Exactly three active abilities in the Storm Triangle.
- Pull/Gust/Grid Zap base behavior remains protected unless an exact task reopens it.
- No stamina/wait/grind/forced ads.
- Phone is a platform, not an excuse to shrink the game.

## Acceptance sequence

`exact worker/integration head -> blocking automated evidence -> Director visual/game-feel review -> canonical fast-forward -> separately validated QA Pages -> owner playtest -> separate Android physical checkpoint`

None of those gates imply the next one automatically.
