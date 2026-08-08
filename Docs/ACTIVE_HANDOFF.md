# Active Handoff

**Last updated:** 2026-08-08 10:23 America/Chicago  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Current direction:** guarded PlayCanvas production-renderer migration  
**Current build train:** `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`  
**Current bounded milestone:** Moo Brew opening / tactical gameplay handoff

## Why this handoff exists

The previous active handoff stopped at the Run 62 camera/Cow correction even though the repository has since advanced through owner-approved multi-structure destruction and a browser-green staged destruction/mass-hierarchy pass.

This file is now the operational recovery point for new chats and contributors.

## Exact parent checkpoint

The next work starts from the sealed PR #37 gameplay source:

- source: `8d390f04223faaa268040afbeaa9eff885a81786`
- PlayCanvas Run 76 / `31259029449`: PASS
- artifact: `severe-weather-playcanvas-slice-76`
- artifact ID: `9022302146`
- artifact digest: `sha256:a93cbd962eacb59db434a774184bdd3b7a15dbc6b4cb6fe2230d10823f864289`
- QA promotion: `4822336f207239ae1444de57e85c6b0be8867bea`
- Pages Run 75 / `31259512722`: PASS

Run 76 is assistant-reviewed and public-browser-QA passed. The owner Galaxy browser verdict for the PR #37 destruction-polish candidate is still pending. Forward engineering is authorized, but that pending verdict must remain pending in all acceptance language.

## Protected browser-stage behavior

Do not retune or replace these while building the intro:

### Storm/environment response

- Pull peak tree tilt: `0.4218329627222749 rad`
- Gust peak tree tilt: `0.3673336055836977 rad`
- Pull max inward light-prop displacement: `5.374028004530404`
- Pull max tangential/orbit displacement: `1.340381940964075`
- Gust max outward light-prop displacement: `5.042881747270892`

### Camera and Cow 17

- Run 62 rotation-stability behavior
- one-stick camera semantics
- camera distance, height, base turn rate, dead zone, and owner trailing scale `0.9`
- release-settle protection
- Cow 17 wall-clock bounded flight
- no immediate Cow 17 relaunch while the storm remains nearby
- Cow 17 safe/invincible/non-targetable law

### Gameplay authority

The accepted authority remains the only owner of:

- movement
- Pull/Gust/Zap acceptance and cooldowns
- health and destruction state
- scoring and combo
- three-minute warning clock
- campaign state
- reset/cleanup

The intro may delay authority startup. It may not replace authority.

## Current destruction checkpoint

PR #36 proved four real Living County targets can drive PlayCanvas structure presentation through accepted gameplay. The owner browser-approved that destruction direction.

PR #37 added:

- readable house/storefront/barn/industrial anatomy
- pitched roof silhouettes
- windows, doors, awnings, vents, loft/loading details
- interior wounds and frame exposure by authoritative stage
- isolated structure debris classes: trim, roof, wall, frame
- measurable mass/horizontal/rise telemetry
- bounded structure body count

Run 75 was deliberately rejected after assistant review despite green automation because trim rose roughly 120 units while roof pieces barely lifted. Run 76 corrected the spectacle band and was the promoted candidate.

## Next milestone: PlayCanvas Moo Brew opening

The canonical opening already exists as approved product direction and as a legacy presentation reference. Do not invent a different story.

Required phase order:

1. `newspaper`
2. `farm-reveal`
3. `moo-brew-sip`
4. `weather-warning`
5. `cow-double-take`
6. `chicken-scatter`
7. `tornado-touchdown`
8. `tactical-handoff`

### Core implementation contract

- The opening is presentation-only.
- Run it **before** `PlayCanvasAuthorityClient.connect()` starts/prepares the accepted warning run.
- The three-minute gameplay clock must therefore remain untouched during the cinematic.
- Normal `?qa=1` and bot-style runs skip the timed cinematic unless an explicit intro test parameter requests it.
- Support explicit `?intro=1` and `?intro=0` behavior.
- Remember a completed/skipped intro for the browser session so ordinary repeat testing is not trapped in the cinematic.
- The final tactical handoff should transition into the existing playable slice rather than reimplement gameplay start logic.
- Do not create a second camera controller, second storm simulation, or second run clock.
- The opening must be skippable.
- Accessibility: the overlay needs a useful label and the skip action must be keyboard/touch usable.

### Visual scope

This is a bounded production-slice presentation proof, not final cinematic art.

Use the existing canonical beats:

- warning newspaper
- farm reveal
- Cow 17 with Moo Brew
- radio/weather shift
- Cow 17 double take
- chickens scatter
- barn-roof/tornado touchdown beat
- tactical handoff

Prefer a clean stylized overlay/scene treatment that can later be replaced by authored assets. Do not block this milestone on a Blender asset pipeline.

## QA contract for the intro

Add deterministic evidence that proves:

- canonical phase list and order are exact
- QA mode skips the timed intro by default
- `intro=1` forces the intro for dedicated QA
- `intro=0` bypasses it
- each deterministic phase can be selected without waiting real seconds
- newspaper/cow/cup/tornado visibility changes match the intended phases
- skip finishes cleanly
- authority is not connected/started before the intro finishes in normal intro mode
- the first authority snapshot after handoff starts at the normal warning-run baseline
- existing storm, camera/Cow, and multi-structure suites remain green
- no console/page errors
- reset/cleanup remains clean

Required screenshot evidence should include at least:

- newspaper
- Cow 17/Moo Brew beat
- touchdown/tactical handoff
- first playable frame after the intro

## Branch strategy

- Handoff branch: `agent/playcanvas-moo-brew-intro-handoff`
- Implementation branch: `agent/playcanvas-moo-brew-intro`
- Implementation PR should target the handoff branch and remain draft until exact-head CI and assistant artifact review pass.

Do not modify PR #37 merely to start the next milestone.

## Acceptance boundary

For the new intro milestone:

- implementation committed: not yet
- browser QA: not yet
- assistant visual review: not yet
- owner browser verdict: not yet
- PlayCanvas Android APK: not built
- physical Android acceptance: no

The broader PlayCanvas migration still cannot be called physically accepted until an exact Android build is installed and approved on the Galaxy S26 Ultra.
