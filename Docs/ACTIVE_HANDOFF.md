# Active Handoff

Last updated: 2026-08-13 21:18 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Product title: **Severe Weather Warning**
Production renderer: Three.js r128
Active phase: **Stage 2B: Make It Feel Like a Game**
Director branch: `agent/director-stage2b-game-direction`

## Director operating law

Repository state is durable memory. Chat is temporary context. Never use `main` as product/gameplay authority.

Startup law:
`assigned worktree -> assigned branch -> exact SHA verified -> task-versioned governing docs -> intended change / protected behavior / proof plan -> edit`

Worker-state law:
**Assignment is authority to start. Branch movement / returned evidence is proof that work actually happened. Director acceptance is a separate gate.**

Green CI is evidence, not automatic product acceptance. Worker-reported completion is not Director acceptance. Drift is a product defect.

Current tooling constraint: Codex/Work usage is exhausted until August 18, 2026. Antigravity may be used only as a bounded worker harness. It does not replace Director authority or GitHub source truth.

## Accepted Stage 2B source inputs

- SW-GAME-002 Hart Farm unlock + real Moo Level: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`
- SW-PWA-001 accepted PWA source: `7cda055a4773c5c9dc69c0d02018cd9454a86628`
  - prototype parent: `73b28e07a5b05dd632226af851b06a32e99bb068`
  - never wholesale promote prototype authority
- SW-UI-001 newspaper: `43348db9b56ec18bca8418c8dfe13470aad4722d`
- SW-SCORE-001 scorekeeper: `3d1661cfdd019f0285dc8556d0e598c22f0cb489`
- SW-RPG-001 MOO-LAH + Storm Triangle: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`
- SW-RPG-002 Slingshot: `97aa6ae792ed5fb201c0fd35d748a4dfff971e61`
- SW-WORLD-006 accepted visual stack: `1264617b49a95241024f52ba550713ba28d84888`
- SW-LEVEL-001 Storm Sites: `1350cee7535220fb9fc5e7c1b4de284e6aae8156`
- SW-UI-002 landscape launch correction: `271e5d3d7b438727df8b217ad59b7974ff1374b6`

Slingshot, WORLD-006, and LEVEL-001 remain Director accepted/frozen at their exact source heads. Do not rewrite those accepted source branches. SW-UI-002 is a bounded correction layered onto canonical Integration, not a rewrite of the accepted SW-UI-001 source branch.

## SW-INT-003 Integration — FULL STAGE 2B STACK + LANDSCAPE CORRECTION ACCEPTED / CANONICAL

Issue: #70
Canonical branch: `agent/sw-int-003-stage2b-accepted-stack`
Exact canonical head: `271e5d3d7b438727df8b217ad59b7974ff1374b6`

### Integration chain

1. Accepted RPG-001 / pre-PWA base:
   `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`
2. Recovered historical PWA candidate:
   `6fc3d64c81b286f7743aaac46ba98e1f4a916dc3`
   - preserved at `archive/sw-int-003-frozen-6fc3d64`
3. Corrected and validated PWA Integration base:
   `00e57966ba70f69dcf6d65de7ef9c40d1e67bbf3`
4. PWA + accepted Slingshot:
   `e0591f68bc90a4be8b39481db9e3c3c8c7378ad0`
5. PWA + Slingshot + accepted WORLD stack:
   `5f9a75d9f979aff1e71df34138752b5c5cb997ea`
6. Full Stage 2B Integration with accepted Storm Sites:
   `4e5b4c714a56ec0dc652b6e30fcd04054143ee5b`
7. Full Stage 2B + accepted mobile-landscape launch correction:
   `271e5d3d7b438727df8b217ad59b7974ff1374b6`

All canonical movements were non-force fast-forwards. No bulk merge was used.

### PWA closure

The original recovered candidate reproduced GAME-002 red on its accepted baseline. A clean Ubuntu comparison later isolated a candidate-only console 404 caused by unconditional production probing for optional `qa-build.json`.

The bounded product correction made QA identity lookup opt-in and preserved production `build-info.json` identity behavior.

Corrected PWA candidate:
`00e57966ba70f69dcf6d65de7ef9c40d1e67bbf3`

Decisive hardened A/B closure:
- Actions run: `31756483510`
- exact baseline/candidate isolation
- no masked required failures
- deterministic state-driven GAME/Scorekeeper QA
- production fixture font/audio parity
- PWA static/browser PASS
- no candidate-only page/runtime/HTTP regression

### Slingshot append closure

Combined candidate:
`e0591f68bc90a4be8b39481db9e3c3c8c7378ad0`

Decisive focused closure:
- Actions run: `31758118990`
- deterministic Slingshot browser QA PASS
- packaged GAME-002 PASS
- inherited Scorekeeper/RPG/PWA evidence remained clean

Slingshot integration required only CI-driver timing/collision sampling corrections. Accepted Slingshot product runtime was not rewritten.

### WORLD append closure

WORLD combined candidate:
`5f9a75d9f979aff1e71df34138752b5c5cb997ea`

WORLD-owned files were unchanged by the GAME/RPG/PWA/Slingshot lineage, so the accepted WORLD visual stack was transplanted exactly, without conflict guessing.

Initial combined WORLD run passed WORLD static/visual, Scorekeeper, RPG-001, PWA, and Slingshot, but packaged GAME-002 timed out before Hart Farm activation.

Focused diagnostic proved this was not a WORLD gameplay regression. Hero Slice 6's accepted Cow 17 opening cinematic intentionally owns startup with `runActive=false` until its natural handoff. Under headless SwiftShader, the 12.4-second simulated cinematic advances at only up to 0.1 simulated seconds per rendered frame and can therefore exceed normal wall-clock QA waits.

CI-only solution:
- let the accepted cinematic begin normally;
- use its exposed QA/debug seek to the final accepted frame;
- call its own frame path;
- let its own natural `finish()` restore gameplay;
- never write `runActive=true` from CI;
- preserve all original GAME assertions.

Decisive WORLD closure:
- Actions run: `31760681763`
- job: `94646163855`
- WORLD visual QA PASS, failures=0
- GAME-002 12/12 PASS
- page/runtime/asset errors empty

### Full WORLD + LEVEL / Storm Sites closure

Full candidate:
`4e5b4c714a56ec0dc652b6e30fcd04054143ee5b`

LEVEL append is exactly one commit over the WORLD spine and changes only accepted LEVEL runtime/apply/QA/verifier files plus three package hooks.

Decisive full Stage 2B closure:
- Actions run: `31760709067`
- job: `94646245609`
- exact source `4e5b4c714a56ec0dc652b6e30fcd04054143ee5b`
- WORLD static / visual PASS
- LEVEL static PASS
- County Fair launch / replay variation / signature PASS
- Coastal Boardwalk launch / replay variation / boat-launch signal PASS
- campaign home restoration PASS
- cows protected PASS
- LEVEL no page / HTTP / runtime errors PASS
- GAME-002 all 12 checks PASS
- GAME no page / runtime / asset transport errors
- explicit `FULL_STAGE2B_HANDOFF_CLOSURE PASS`

Artifact:
- `sw-int-003-full-stage2b-handoff-closure`
- artifact ID `9204556468`
- SHA-256 `457d79b034684d5f2bd8f272ec21724dc71607586f5d3b7445a5f77d8a823390`

### SW-UI-002 owner-playtest blocker correction — DIRECTOR ACCEPTED

Issue: #77
Correction branch: `agent/sw-ui-002-landscape-unleash`
Accepted base: `4e5b4c714a56ec0dc652b6e30fcd04054143ee5b`
Exact accepted/canonical head: `271e5d3d7b438727df8b217ad59b7974ff1374b6`
Director acceptance comment: `5288657786`

Owner playtest on Android mobile landscape showed the newspaper selection surface clipped before the launch CTA. `UNLEASH STORM` was below the reachable viewport and gameplay could not start.

Root cause:
- accepted SW-UI-001 gives `.newspaper-front-page` `overflow:hidden`;
- its small/mobile rule caps the card near `100dvh`;
- constrained landscape/browser chrome reduced the visual viewport;
- there was no vertical overflow path to the CTA;
- prior newspaper browser QA covered portrait `390x844`, not short landscape.

Bounded correction:
- presentation-only landscape adapter;
- uses the real `visualViewport.height` as a height guard;
- makes the newspaper vertically touch-scrollable only on constrained landscape;
- preserves the real existing `#btnStartMenu` and launch semantics;
- no gameplay/progression/selection authority rewrite.

Scope proof relative to `4e5b4c...`:
- zero behind;
- only four added files;
- no existing product/gameplay runtime file rewritten;
- product behavior is isolated in `runtime/sw-ui-002-landscape-unleash.js`;
- apply/QA/CI support are the other three files.

Decisive packaged landscape QA:
- Actions run: `31762972802`
- job: `94653052437`
- exact head: `271e5d3d7b438727df8b217ad59b7974ff1374b6`
- evidence artifact ID: `9205315513`
- artifact SHA-256: `45ceafe79bf833bd197f75c556709c9578b117f7aac45830ee19b12953bfac89`
- Android-like `844x390` touch viewport
- real Chromium touch swipe moves the newspaper
- `UNLEASH STORM` becomes fully reachable in visual viewport
- real button click starts the accepted Cow 17 opening flow
- menu leaves selection surface
- zero page errors
- zero runtime-console errors
- zero asset transport errors
- unchanged inherited SW-UI-001 static and portrait browser QA PASS

Earlier raw-fixture asset 404 signal was classified as a fixture-packaging mismatch. The decisive proof uses the actual packaged `www` bundle and is clean.

Status: **SW-UI-002 DIRECTOR ACCEPTED; issue #77 closed completed; canonical Integration fast-forwarded to exact `271e5d3...`.**

## QA Pages — CORRECTED FULL STAGE 2B PLAYABLE DEPLOYED

Public QA URL:
`https://lybyerc-lab.github.io/Severe-Warning/`

Published gameplay source:
`271e5d3d7b438727df8b217ad59b7974ff1374b6`

QA Pages is owner-playtest infrastructure only. `main` is still not gameplay authority.

Infrastructure history:
- full-stack Pages publisher prepared as workflow-only commit `23d7c5e5bdf29d0ca4efcefdd277f13fdb5cd564`
- first full-stack publish run `31761042632` failed before assembly because Pages runner lacked ffmpeg
- infra-only ffmpeg prerequisite fix: `743e8d7df84b604edc5df69646ec2a258821807f`
- first successful full-stack Pages run: `31761090536`
- landscape-correction publisher update on `main`: `350690d32338bc8a51f6929be323ab9747e55fee`
- corrected successful Pages run: `31763225553`
- corrected deployment job: `94653743786`
- corrected Pages artifact ID: `9205368317`
- corrected Pages artifact SHA-256: `210cee362adc13947e02074bc7ee6d2196c869d7408c9aec7ba5c8d6d269f895`
- deployment reported success

Corrected publisher verified exact checkout of `271e5d3...`, assembled the accepted full Stage 2B patch chain, then explicitly applied `apply-sw-ui-002-landscape-unleash.mjs`, built successfully, uploaded successfully, and deployed successfully.

Published bundle includes PWA shell, local generated audio, vendored VFX, fonts, runtime modules including `sw-ui-002-landscape-unleash.js`, and `playtest-info.json` identifying exact source ref `271e5d3...`.

## Product laws

- Genre: mobile arcade destruction with light action RPG progression.
- Full title: **Severe Weather Warning**.
- Fun/destruction first; beauty is first-class.
- Storm is the visual hero and must read as one connected dangerous mass.
- Cows and Moo Brew are the comic backbone; cows are protected/non-disposable comic actors.
- Newspaper presentation is recurring identity for select, `UNLEASH STORM`, and results.
- **A constrained mobile landscape viewport must never trap the player on the newspaper; the real launch CTA must remain reachable by ordinary touch interaction.**
- Town/county campaign remains home territory/backbone.
- Storm Sites are authored substantial destruction fantasies, not generic tiny arenas.
- Replay variation law: **same place, different storm day**.
- MOO-LAH is local-first gameplay currency.
- Exactly three equipped active abilities in the Storm Triangle. Storm forms/passives remain separate.
- Advanced powers consume one of the three slots.
- Physical/discoverable synergy is a replay pillar. First accepted concrete synergy: **Pull + Gust = Slingshot**.
- Twin Tornadoes, Waterspout, satellite feat, full U.S. map, and online/accounts remain future/held-back scope unless separately assigned.
- No stamina/wait/grind/forced ads.
- Controller-friendly, local-first, C++-ready not C++-dependent.
- Phone is a platform, not the intended size of the game.

## Current priority order

1. Owner playtest the newly deployed corrected exact source `271e5d3...` on the real phone, especially landscape selection -> scroll -> `UNLEASH STORM` -> Cow 17 opening -> gameplay.
2. Treat owner playtest findings as product feedback, not automatic source mutations.
3. Preserve canonical Integration at exact `271e5d3...` unless another bounded Director-approved correction earns replacement.
4. Do not reopen accepted Slingshot, WORLD, LEVEL, or SW-UI-001 source branches for opportunistic cleanup.
5. After owner playtest, choose the next bounded Stage 2B game-feel/product milestone from current product laws.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. Recover from GitHub, not owner memory.
