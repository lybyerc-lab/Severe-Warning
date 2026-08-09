# Severe Weather Warning Current Status

**Last updated:** 2026-08-09 17:51 America/Chicago  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Primary target:** Android landscape  
**Production renderer:** Three.js r128  
**Active visual-production branch:** `agent/threejs-hero-slice6-world-identity-storm-silhouette`  
**Active PR:** #45  
**Frozen gameplay/fun baseline:** PR #26 head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`  
**Sealed Stage 1 source:** `f2060dff08ddb9df9f90ecd245940d8db86c7266`  
**Hero Slice 5 parent:** `f42f12b3e4e6b38d49f6bcc0b129b4e335f13ecf`

## Canonical project memory

GitHub is the durable project memory. Chat is temporary working context.

Read `Docs/ACTIVE_PRODUCTION_SLATE.md` for the current active/queued/parked work inventory. New ideas may be explored at any time, but meaningful ideas must be captured in the repo rather than left only in chat.

The production slate is intentionally designed for a nonlinear creative process: active work remains active while new ideas are queued or parked with their direction preserved.

## Canonical identity

The product is **Severe Weather Warning**. The player directly controls the storm. `Heartland` is campaign terminology only. People remain protected/absent from destruction targets. Animals and media crews remain invincible/non-targetable. The response remains a media circus, not combat.

Three.js is production. PlayCanvas is preserved research only.

## Gameplay/fun law

The owner compared the PlayCanvas migration against the preserved Three.js game and preferred the Three.js movement, natural destruction, and overall fun. Production therefore resumed from the accepted Three.js line.

Graphics work may improve presentation but may not retune steering, forward movement, Pull/Gust/Grid Zap, authoritative destruction, scoring, timer/stages, campaign persistence, safe-animal behavior, pause/reset cleanup, or the accepted gameplay camera/input feel merely to make art integration easier.

The owner also reports that multiple people have played the current game and the response has been consistently positive. Treat this as an important qualitative signal that the core direct-control destruction loop is worth protecting, not as formal acceptance evidence.

## Stage 1 asset pipeline: accepted browser foundation

Stage 1 proved an authored-presentation seam around the accepted Three.js game.

Exact sealed source:

`f2060dff08ddb9df9f90ecd245940d8db86c7266`

Evidence:

- workflow: Three.js Asset Pipeline Foundation
- Run 5: `31270418326`
- artifact: `severe-weather-threejs-asset-pipeline-5`
- artifact digest: `sha256:90360c1811f0976d6f8d798c75997fb07b5eb6f6e51a8b1d885fa6ab3de0f3e5`
- debug APK SHA-256: `496439b2adc434c29cb0fd7db5ce6f03047efa20d964ba19cf397ef42be95b10`
- public production QA foundation: `https://lybyerc-lab.github.io/Severe-Warning/threejs/`
- QA promotion commit: `7acebcea56ffa6960197f05e851ec6ef618fc4d1`
- Deploy Three.js QA Overlay Run 1: `31271092725`, success

The owner tested the public Three.js browser candidate on 2026-08-08 and reported: **“Great build. Plays really well. I missed it.”**

That is the owner browser PASS for the fun baseline and Stage 1 presentation seam. It is not final graphics approval and is not physical acceptance of later exact APKs.

## Active Stage 2A work: Hero Slice 6

Hero Slice 6 remains the active visual-production checkpoint.

Primary goals:

- make the default tornado read as weather rather than a clean geometric cone;
- make roads own protected corridors;
- establish visible curb -> sidewalk -> verge -> lot -> building hierarchy;
- keep fences, buildings, ditches, and shoulders out of road space;
- eliminate square-on-square prototype massing;
- make Main Street read as authored small-town Americana rather than repeated boxes;
- keep Hart Farm readable and coherent with the same spatial law;
- preserve the accepted Three.js gameplay underneath the presentation layer.

Run #9 proved the road-first correction mechanically: browser QA found zero building-road intrusions and zero fence-road intrusions and the farm fence opened at the road. Human visual review still rejected the remaining giant cyan water-tower treatment and naked rectangular Main Street masses.

The current Slice 6 branch therefore includes an additional town-presentation correction: muted municipal water-tower treatment, restrained tall-building vertical compression, pitched gable rooflines, and less repetitive shell materials. Exact-head CI and screenshot review remain required after each source change.

## Opening cinematic direction: locked and queued

The current DOM/CSS Moo Brew opening remains a story prototype, not the final cinematic implementation.

Canonical story remains:

newspaper -> farm reveal -> Cow 17 and chickens -> weather/radio shift -> Cow 17 double take -> Moo Brew cup drop -> chickens scatter -> barn roof/tornado touchdown -> direct gameplay handoff.

Director choices locked on 2026-08-09:

- final implementation uses the same Three.js world, assets, materials, lighting, atmosphere, and VFX language as gameplay;
- no separate cheap-animation universe and no loading break;
- Cow 17 is upright/bipedal for the character beat, casually leaning on the fence and sipping Moo Brew;
- chickens gather around Cow 17 with small conversational acting beats, creating an office-water-cooler rhythm without requiring spoken dialogue;
- environmental warning signs build while Cow 17 keeps sipping;
- Cow 17 performs the slow double take, takes one final ill-advised sip, then the Moo Brew cup drops in the comedy pivot;
- chickens scatter and Cow 17 switches into an exaggerated action-hero escape;
- barn roof peel and tornado touchdown lead directly into the gameplay camera;
- warning clock begins only at the gameplay handoff;
- target length remains roughly 10 to 15 seconds;
- later viewings remain skippable and may rotate newspaper headlines.

This cinematic should become its own bounded visual-production slice after the current Slice 6 checkpoint is stable enough to build on.

## QA and build cadence

### Browser iteration is the default

The public QA root is the preferred rapid human testing surface:

`https://lybyerc-lab.github.io/Severe-Warning/`

Normal visual iteration should:

1. build the exact browser candidate;
2. run inherited regression, visual, and same-runner performance QA;
3. inspect exact screenshots/reports;
4. promote the reviewed exact candidate to the QA root;
5. gather owner and informal playtest feedback;
6. record meaningful feedback and decisions back in the repo.

A green workflow does not equal visual acceptance.

### APK generation is paused for ordinary art iteration

Replacing the currently installed development app requires uninstall/reinstall friction. Therefore PR visual iterations no longer need to compile an APK automatically.

The Hero Slice 6 workflow keeps Android packaging available as an opt-in manual `package_android` device-checkpoint mode.

Generate an APK when:

- a visual milestone is close enough to warrant physical-device acceptance;
- touch/input/camera behavior changed;
- WebView, lifecycle, audio, heat, battery, frame pacing, or another device-only concern needs validation;
- a release candidate or major integrated slice is ready.

Physical Android acceptance still requires an actual installation and run. Browser approval never silently becomes Galaxy S26 Ultra acceptance.

## Expansion policy

Expansion ideas are encouraged during development and should be captured as they arise. They do not automatically interrupt the current acceptance slice.

Existing expansion families already include regional campaigns, stronger local-news personalities, deeper Moo Brew branding, Cow 17 recurring comedy/statistics, Coastland waterspouts after water interaction exists, multi-vortex/twin-funnel advanced forms, and region-specific architecture/audio/finales.

Use `Docs/ACTIVE_PRODUCTION_SLATE.md` and `Docs/PRODUCT_VISION_AND_ROADMAP.md` to preserve these ideas so none are lost when conversation context changes.

## Art direction

Art thesis: **storm-charged stylized Americana**.

Visual promise: **beautiful at a glance, readable at speed, cinematic up close**.

External packs are ingredients, not the art director. CC0 is preferred. Unknown/unlicensed content is rejected. Production remains offline/local inside the web and Capacitor package.

Ordinary tornado contact must deliver spectacle without requiring an ability. Pull/Gust/Zap amplify or redirect destruction; they do not unlock the only satisfying visuals.

## QA law

Objective regression evidence and owner visual/fun review are both required.

A green candidate does not advance if it looks worse, drives worse, hides the road, weakens ordinary destruction, or makes the opening feel disconnected from gameplay.

Galaxy S26 Ultra physical testing remains the final Android authority at deliberate device checkpoints.
