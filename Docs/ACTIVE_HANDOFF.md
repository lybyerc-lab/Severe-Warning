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

## Active PlayCanvas Bootstrap Checkpoint

- **Work Branch:** `agent/playcanvas-moo-brew-slice-antigravity`
- **Pushed Head SHA:** `7986d84693a1c0d453ca364a59ca2bdcb9fb56f8`
- **Draft PR:** PR #30 (`https://github.com/lybyerc-lab/Severe-Warning/pull/30`) targeting `agent/playcanvas-production-slice-handoff`
- **Engine Payload:** PlayCanvas 2.21.3 (`2370651` bytes, SHA-256 `d77c4337e8a2fd1dbc38f19b55af8d087a47ca378366558b55aeef4de6a8adb4`)
- **Checksum Status:** `PLAYCANVAS_EXPECTED_SHA256` pinned in `.github/workflows/playcanvas-production-slice.yml` (`checksumPinned: true`)
- **Static Verification:** 18/18 checks passed (`node scripts/verify-playcanvas-slice.mjs`)
- **Browser Verification:** 14/14 checks passed (`node scripts/qa-playcanvas-slice.mjs`)
- **Visual Proof:** Verified Prairie Junction scene rendering cleanly with road clearance (0.10 m) and tornado clearance (0.18 m)
- **Gameplay Integrity:** `MechanicsLab/SevereWeather_3D_Lab.html` 100% clean (0 diffs)
- **Android Status:** Not built and not physically accepted (isolated renderer slice)