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

## D-011: The game is landscape-only

Date: 2026-09-04
Status: explicitly approved by director

Decision:
- Severe Warning ships landscape. There is no portrait layout and none will be built.
- Android enforces it: `MainActivity` keeps `android:screenOrientation="sensorLandscape"`, which allows either landscape direction and no upright one.
- The browser lane cannot enforce it — `screen.orientation.lock` is fullscreen-only where it exists at all and absent on iOS Safari — so the web build asks for the lock and, when refused, raises the KSWX-7 stand-by card at `[SW:UI:ORIENTATION_LOCK]` and suspends a live run through the same path a backgrounded tab uses.
- The gate is media-query driven (`(orientation: portrait) and (max-width: 900px)`), so a windowed desktop browser is never gated. The bot harness (`?bot=true`) and the QA labs (`?qa=1`) are ungated by class.
- Every automated harness viewport must be landscape. A portrait viewport measures a layout that cannot ship.

Rationale:
- The twin-stick layout wants the thumbs wide apart, the HUD is a broadcast lower-third, and the world is framed for a wide picture. Portrait cannot have all three, and supporting it doubles the layout surface of every screen for a hand nobody wants to play.
