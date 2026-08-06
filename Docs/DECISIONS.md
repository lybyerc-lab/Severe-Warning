# Durable Decision Log

Only decisions intended to survive individual chats belong here.

## D-001: Repository is durable memory

Date: 2026-07-31
Status: accepted

Decision:
- The GitHub repository is the authoritative project memory.
- Chat history is working context only.
- New work must begin by reading `AGENTS.md` and its required documents.

Reason:
- Long chats become slow.
- New chats risk losing accepted behavior, active defects, and rationale.

## D-002: Player is the storm

Status: locked product law

Decision:
- The player directly controls the storm.
- Direct action takes priority over management systems.

## D-003: People and media are protected

Status: locked product law

Decision:
- People are never casualties or valid targets.
- Animals are invincible, non-targetable, and visibly unharmed.
- Media crews are witnesses and comic chorus, never enemies or destruction targets.
- There are no hostile police, fire, guard, or military vehicles.

## D-004: Physical Android acceptance is final

Status: accepted process law

Decision:
- Code, CI, browser QA, and APK packaging are verification stages, not acceptance.
- The Galaxy S26 Ultra physical run is the final authority for controls, sound, readability, performance, and lifecycle behavior.

## D-005: GitHub Pages is the fast QA lane

Date: 2026-08-01
Status: accepted

Decision:
- Use `https://lybyerc-lab.github.io/Severe-Warning/` for frequent browser QA.
- Publish through the dedicated `qa` branch.
- Build APKs only after a group of changes passes browser QA.

Reason:
- Repeated APK installation on the user's phone is slow and requires security changes and uninstalling the previous app.
- Netlify free-plan limits are unsuitable for frequent drops.

## D-006: Separate fast QA, audio, and APK work

Status: accepted direction

Decision:
- Ordinary gameplay and UI QA should reuse verified audio assets.
- Full audio generation should run only when audio sources or generation logic change.
- Signed APK builds should be milestone gates, not the default test mechanism.

## D-007: Stable QA signing

Status: physically verified

Decision:
- Use a dedicated persistent QA signing key, stable application ID, and increasing version codes.
- Keep QA signing separate from future production signing.

Goal:
- Future APKs update in place without deleting the installed QA app.

Evidence:
- Signed QA-5 installed over signed QA-3 on the Galaxy S26 Ultra without uninstalling.

## D-008: Stable code anchors

Status: accepted

Decision:
- Use searchable subsystem and design-law anchors defined in `Docs/CODE_ANCHORS.md`.
- Do not use labels such as “latest fix,” “new code,” or version-number-only comments.
- Anchors describe responsibility and invariants, not implementation history.

## D-009: V5 fast-track campaign foundation

Date: 2026-08-03
Status: explicitly approved by user

Decision:
- Advance directly to `v5.0.0 Heartland Campaign Foundation` using the browser-tested `qa` gameplay as the base.
- Preserve accepted and QA-proven storm gameplay while adding campaign structure around it.
- Do not relabel the single-run game; V5 must include real selection, unlock, progression, results, and persistence systems.
- Carry the unresolved signed update-in-place check forward as packaging work rather than blocking campaign implementation.

## D-010: Cow humor is a signature system

Date: 2026-08-03
Status: approved product direction; implementation awaiting physical acceptance

Decision:
- Cow 17 is a recurring, numbered, invincible campaign mascot.
- Cow comedy is measured and reported through safe relocations, airtime, distance, soft landings, broadcast callouts, and the Bovine Situation Report.
- Cow-Cam is rare and brief; it may change presentation and cow animation but must not slow player controls or the warning clock.
- Moo Brew sponsors the media circus without becoming a real-world brand or an intrusive advertisement.
- Animal injuries remain zero by design.

## D-011: Move production rendering toward PlayCanvas

Date: 2026-08-06
Status: explicitly approved by user

Decision:
- PlayCanvas is the selected production-renderer direction for Severe Weather.
- The current Three.js build remains the frozen gameplay and behavior reference until a PlayCanvas production slice is physically accepted.
- The first migration milestone is a bounded Moo-Brew production slice, not a whole-game rewrite.
- Preserve the accepted gameplay simulation as authority during the slice and feed visual state into PlayCanvas through explicit adapters.
- Keep GitHub, TypeScript, browser QA, Capacitor Android packaging, exact-commit evidence, artifact verification, and physical-device acceptance.
- Historical Three.js source and evidence remain intact and must not be overwritten or declared obsolete prematurely.

Reason:
- Physical testing confirmed that gameplay remains excellent.
- Prairie Junction has visible road and terrain topology defects, including the storm passing under roads and terrain and ground material covering roads.
- Cow readability improved, but the current visual-production approach still falls short.
- The opening cinematic looks rough and is not accepted.
- PlayCanvas provides a stronger authored scene, lighting, material, animation, particle, and camera workflow while remaining compatible with the web and Android direction.

Acceptance boundary:
- Do not migrate all counties before the opening and one Prairie Junction block demonstrate an obvious visual improvement on the Galaxy S26 Ultra.
- The slice must preserve controls, Pull, Gust, Zap, scoring, combo, campaign timing, destruction behavior, safe animals, pause/background handling, reset, and cleanup.
- A green workflow or packaged APK is not acceptance. The exact PlayCanvas APK must be installed and approved physically.