# Severe Weather Warning Active Production Slate

Last updated: 2026-08-14 16:36 America/Chicago
Status: canonical near-term work queue
Director authority branch: `agent/director-stage2b-game-direction`

## Operating law

- Product title is **Severe Weather Warning**.
- Genre is mobile arcade destruction with light action RPG progression.
- Player fantasy is **YOU ARE THE STORM**.
- GitHub is durable project memory; chat is working context.
- Owner feedback is product input, not automatic source mutation.
- Director owns decomposition, sequencing, conflict prevention, QA review, integration, and repo memory.
- Worker agents execute bounded tasks only.
- One task, one worker, one writable branch/worktree.
- Green CI is evidence, not product acceptance.
- Branch existence is not proof a worker ran or finished.
- Current execution truth is governed by exact issue/branch/commit/CI evidence and `Docs/ACTIVE_HANDOFF.md`.

## Current accepted Stage 2B base

Canonical integration branch:

`agent/sw-int-003-stage2b-accepted-stack`

Exact accepted canonical head:

`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

This head includes the accepted Stage 2B stack plus the owner-playtest QUALITY-001/QUALITY-002 rescue. Issues #79 and #80 are closed completed.

The prior canonical `271e5d3d7b438727df8b217ad59b7974ff1374b6` is now the pre-rescue comparison baseline, not current gameplay authority.

## Accepted Stage 2B inputs already in canonical lineage

- SW-GAME-002 Hart Farm unlock + real Moo Level: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`
- SW-PWA-001 accepted PWA source: `7cda055a4773c5c9dc69c0d02018cd9454a86628`
- SW-UI-001 newspaper: `43348db9b56ec18bca8418c8dfe13470aad4722d`
- SW-SCORE-001 scorekeeper: `3d1661cfdd019f0285dc8556d0e598c22f0cb489`
- SW-RPG-001 MOO-LAH + Storm Triangle: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`
- SW-RPG-002 Slingshot: `97aa6ae792ed5fb201c0fd35d748a4dfff971e61`
- SW-WORLD-006 accepted visual stack: `1264617b49a95241024f52ba550713ba28d84888`
- SW-LEVEL-001 Storm Sites: `1350cee7535220fb9fc5e7c1b4de284e6aae8156`
- SW-UI-002 landscape launch correction: `271e5d3d7b438727df8b217ad59b7974ff1374b6`
- QUALITY-001/002 owner-playtest rescue accepted canonical head: `7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

Do not reopen accepted source branches for opportunistic cleanup. New work layers from the exact assigned canonical base unless the Director explicitly specifies another base.

## Latest product-quality evidence

### Independent QUALITY-002 visual acceptance

Evidence branch/head:

`agent/sw-qa-quality-002-visual-acceptance`
`ec723a14474e5db502b8a5fd7899807dad7db4d0`

Reviewed visual candidate:

`f493e3d51f6d772d89bdbe945529ebde9d58196f`

Verdict: PASS across the owned QUALITY-002 areas.

### Post-QUALITY-002 hostile audit

Audit branch/head:

`agent/sw-audit-post-quality-002-gap-map`
`ea2946912c623504e22da74a4f58463f373b3491`

No P0 blockers found.

Remaining P1 gaps:
1. Supercell/Derecho storm identity.
2. Pause/site-label identity.
3. Results hierarchy/fanfare.
4. MOO-LAH/Storm Triangle tactile presentation.
5. Secret Moo Level bespoke visual/HUD identity.
6. Physical destruction consequence/anatomy.

## ACTIVE NOW: parallel commercial-quality wave

All tasks below use exact base:

`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

They are deliberately separated by ownership to minimize conflicts.

### #81 — SW-WORLD-007: Supercell and Derecho atmospheric identity overhaul

Branch:
`agent/sw-world-007-secondary-storm-forms`

Primary question:
**Can the two secondary storm forms look like severe weather instead of visible Three.js primitives?**

Goal:
- Supercell becomes a connected rotating mesocyclone/anvil/rain-hail mass;
- Derecho becomes an advancing shelf/arcus cloud wall;
- Hail and Burst remain mechanically unchanged but visually originate from the storm body;
- accepted Tornado remains untouched.

Protected:
movement, steering, camera, abilities, damage, scoring, sites, UI, RPG, Cow safety.

### #82 — SW-FEEL-001: Physical destruction consequence presentation

Branch:
`agent/sw-feel-001-destruction-consequence`

Primary question:
**Does destroying a normal building visibly feel like the storm physically wrecked it?**

Goal:
- first bounded slice for ordinary houses/common commercial buildings;
- expose readable roof/wall/facade failure, directional debris, and dust;
- consume existing authoritative lethal-destruction truth;
- make floating `WRECKED`/score text secondary to physical consequence.

Protected:
health, damage, collision, scoring, targetability, coordinates, abilities, storm bodies, campaign, Cow safety.

### #83 — SW-UI-003: Run-shell Americana identity for pause and results

Branch:
`agent/sw-ui-003-run-shell-identity`

Primary question:
**Do pause and results feel like the same authored game as the accepted newspaper selector?**

Goal:
- replace generic cyan/web pause presentation with restrained Severe Weather Warning Americana identity;
- display correct active location/site identity;
- improve results hierarchy so score/rank is the emotional payoff;
- preserve all existing result truth and pause lifecycle behavior.

Protected:
pause/quit authority, scoring/rank/stat calculations, progression, gameplay, storm geometry, abilities, destruction authority, Cow safety, RPG mechanics.

## NEXT WAVE CANDIDATES — NOT ACTIVE YET

Do not implement these inside #81/#82/#83. They require separate bounded tickets after current evidence returns.

### Tactile MOO-LAH + Storm Triangle presentation

Product problem:
The progression system exists but currently reads like an administrative HTML table rather than an arcade reward/build desk.

Likely direction:
- stronger MOO-LAH token/reward feedback;
- tactile purchase confirmation;
- visually meaningful Storm Triangle loadout presentation;
- preserve prices, upgrade truth, persistence, and exactly-three-slot law.

### Secret Moo Level legendary identity pass

Product problem:
The real Moo Level exists mechanically but its environment/HUD still reads too much like a primitive sandbox.

Likely direction:
- authored bonus-stage environment identity;
- bespoke MOO METER arcade treatment;
- more environmental comedy and motion while preserving cow safety and score authority.

### World density / material-repetition pass

Product problem:
Some Heartland/common architecture remains sparse or repetitive even after the stronger site-specific environment rescue.

Likely direction:
- authored neighborhood/commercial material hierarchy;
- stronger environmental story and place density;
- preserve road/parcel/target/collision authority.

### Destruction expansion after SW-FEEL-001

Only after the first consequence layer proves clean:
- additional material/structure families;
- stronger staged failure hierarchy;
- selective sound/camera punctuation where separately authorized.

## HELD / FUTURE DIRECTION

Not active unless separately assigned:
- Twin Tornadoes;
- Waterspout unlock/form;
- satellite feat;
- broader Weather Map / U.S. expansion;
- online/accounts/leaderboards;
- additional Storm Site families;
- larger audio overhaul;
- release/physical Android checkpoint work.

## Binding product laws

### Storm

The storm is the visual hero. Every storm form must read as one connected dangerous atmospheric mass. Visible effect primitives, detached bubbles, stacked discs, clean cones, UFOs, laser barriers, and debug-wireframe reads fail the art direction.

### Destruction

Fun and destruction come first. Destruction should expose believable/readable anatomy and consequence. Presentation may amplify authoritative destruction but may not silently become damage/scoring/collision authority.

### World

Art thesis: **storm-charged stylized Americana**.
Visual promise: **beautiful at a glance, readable at speed, cinematic up close**.
Authored places beat generic Blocktown repetition.
Town/county campaign remains the home backbone. Storm Sites expand around it.
Replay target remains **same place, different storm day**.

### Newspaper / UI

Newspaper is recurring Severe Weather Warning identity across storm selection and results. Humor supports comprehension. Gameplay HUD/pause should belong to the same world without turning every surface into literal newspaper.

### RPG / replay

MOO-LAH remains local-first earned gameplay currency. Base abilities remain complete and fun. Exactly three equipped active abilities live in the Storm Triangle. Slingshot remains the first accepted Pull + Gust physical synergy.

### Cows / comedy

Cow 17, cows, and Moo Brew remain the comic backbone. Cows remain protected/non-targetable. Hart Farm is the unlock encounter; the dedicated Moo Level is the actual secret bonus level.

### Monetization / platform

No stamina, wait timers, grind treadmill, or forced ads. Phone is a platform, not an excuse to make the game tiny. Android physical acceptance remains a separate deliberate device gate.

## Integration sequence for current wave

1. Each worker must push an exact final head and evidence.
2. Director reviews each diff against its issue contract and protected territory.
3. Visual/game-feel work requires actual evidence review, not marker-only QA.
4. Accepted worker heads are integrated in a conflict-aware order chosen after evidence returns.
5. Combined exact-source regression/visual QA must pass.
6. Canonical moves only after Director acceptance.
7. Pages promotion is separately verified; accepted canonical source does not automatically equal deployed public QA.
8. Owner playtest remains a separate product gate.

## Historical-note rule

Older Stage 2A/QA #29 and first-batch Stage 2B descriptions remain useful history, but they are no longer the active production queue. Use repository history/issues for archaeology instead of keeping obsolete execution state in this live slate.
