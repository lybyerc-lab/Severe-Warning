# Active Handoff

Last updated: 2026-08-06 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Current direction: guarded PlayCanvas production-slice migration
Current build-train: `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`

## Durable decision

The owner explicitly selected PlayCanvas as the production-renderer direction after physically testing the PR #26 Android build.

The migration is intended to improve visual quality, scene composition, terrain and road reliability, character presentation, storm atmosphere, and the opening cinematic. It is not permission to redesign the gameplay that already feels excellent.

## Frozen behavior reference

- Draft PR: #26
- Head branch: `agent/presentation-identity-moo-brew-pass`
- Exact reference head: `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`
- Verified workflow: `31094966986` / Run 6
- Artifact: `severe-weather-presentation-identity-6`
- Artifact ID: `8965392745`
- Debug APK: `Severe-Weather-v5.1.0-Presentation-Identity-6.apk`
- APK SHA-256: `2b2afa4012601b0bfc763d02a61cdf6a0b3e0ae7d0dd51df5871df8428ae6999`

PRs #24, #25, and #26 remain an intentional draft stack. They are unmerged and must not be casually retargeted, squashed, or merged.

## Physical findings from 2026-08-06

Accepted and protected:

- Multiple rounds remained fun.
- The owner described the gameplay as still awesome.
- Pull, Gust, Zap, destruction, scoring, campaign timing, and safe-animal behavior remain protected reference behavior.
- Cows read more clearly as cows than in earlier builds.

Rejected or requiring correction:

- Prairie Junction / level two contains road and terrain topology defects.
- The storm visibly passes underneath roads or terrain in many places.
- Sand-like or ground-material patches cover portions of the road.
- The opening cutscene looks rough and is not accepted.
- The current rendering and art-production approach does not achieve the desired visual quality.

## Active branch

- Documentation and migration handoff branch: `agent/playcanvas-production-slice-handoff`
- Base: exact PR #26 head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`
- This branch records the decision and migration gates. It does not yet implement PlayCanvas.

## Next implementation milestone

Build one bounded Moo-Brew production slice in PlayCanvas:

1. newspaper and farm opening
2. Cow 17 drinking Moo Brew and reacting
3. weather shift, chickens, barn-roof beat, and tornado touchdown
4. one corrected Prairie Junction intersection
5. one house or storefront, one cow, one vehicle, and one electrical target
6. Pull, Gust, Zap, and one destruction chain
7. score transition and deterministic reset

Do not port every county before this slice passes physical Android acceptance.

## Required technical boundary

- Keep the accepted gameplay simulation authoritative during the slice.
- Feed state into PlayCanvas through explicit adapters.
- Do not move gameplay authority merely because a PlayCanvas class or component exists.
- Require real-executor telemetry for input, abilities, destruction, scoring, timing, animals, reset, and cleanup.
- Preserve GitHub Actions, exact-source identity, browser QA, Capacitor packaging, artifact upload, APK inspection, and SHA-256 verification.

## Visual acceptance target

The target is a polished miniature disaster-comedy world, not photorealism:

- authored roads and terrain
- strong silhouettes
- readable materials and contact shadows
- expressive Cow 17 animation
- convincing storm depth and lighting
- deliberate cinematic framing
- unmistakable Moo-Brew identity

## Start here

1. Read `AGENTS.md` and every file it lists.
2. Read `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`.
3. Inspect PRs #24, #25, and #26 without changing their stack.
4. Treat PR #26 Run 6 as the frozen gameplay and behavior reference.
5. Create a separate descendant implementation branch for the PlayCanvas slice.
6. Prove the slice in browser QA and on the Galaxy S26 Ultra before widening the migration.

## Process laws

- Repository truth outranks chat memory.
- One writer per branch.
- Do not weaken QA to obtain a green badge.
- Do not call a debug APK a signed release APK.
- Do not claim an APK exists until assembly, upload, inspection, and SHA-256 verification are complete.
- Automated success is not physical acceptance.
- Historical Three.js source and evidence remain intact as the reference until a PlayCanvas slice is physically accepted.