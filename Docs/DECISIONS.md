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
Status: superseded by D-012 after owner comparison testing

Original decision:
- PlayCanvas was selected as the production-renderer direction.
- The Three.js build was retained as frozen gameplay/behavior reference during a bounded migration.
- The migration preserved gameplay authority behind explicit adapters and required exact-source browser/Android evidence.

Why it was reasonable at the time:
- The Three.js game had visible topology, authored-scene, material, and cinematic-production limitations.
- A stronger authored scene/lighting/material/animation workflow was expected to improve production quality without losing gameplay.

What the experiment taught us:
- The authority/adaptor boundary was valuable.
- Staged building anatomy, debris mass hierarchy, camera/Cow regression tests, exact-source artifact promotion, and intro timing gates were valuable.
- However, passing those gates did not preserve the preferred gameplay feel or deliver the expected visual-quality advantage.

This decision remains in the log because its evidence and lessons are still useful, but it is no longer the active renderer direction.

## D-012: Resume Three.js production and build the graphics pipeline around the fun game

Date: 2026-08-08
Status: explicitly approved by user
Supersedes: D-011 as the active production-renderer direction

Decision:
- Three.js is production again.
- Restart production work directly from draft PR #26 head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`, the preserved build the owner prefers to play.
- Preserve PlayCanvas branches, artifacts, tests, screenshots, and lessons as research evidence; do not use PlayCanvas as production ancestry.
- Freeze the production Three.js version during the first graphics-pipeline milestone.
- Build an authored-asset/art pipeline around the accepted game rather than replacing the renderer because the visuals are prototype-quality.
- Protect direct storm steering, natural contact destruction, abilities, scoring, timing, campaign state, safe animals, reset/cleanup, and Android landscape control behavior while improving presentation.
- The first graphics milestone is an explicit GLB/glTF-oriented asset registry/loading/material/fallback seam that does not change gameplay collision or destruction authority.
- Later visual milestones may improve destruction anatomy, world rendering, atmosphere, and the opening cinematic, but each must compare against the frozen Three.js fun baseline.

Owner evidence:
- The promoted PlayCanvas candidate required backing/steering like a truck and trailer to move comfortably forward.
- Its destruction improved but remained large-chunk and roof-heavy, with satisfying breakup too dependent on actions.
- The opening and the wider game still looked like cheap/prototype animation.
- The owner explicitly reported that the original Three.js gameplay was more fun and its destruction was better, then approved the pivot back.

Reason:
- Engine migration was consuming effort recreating behavior that already worked before the actual graphics pipeline was solved.
- A renderer change did not create production art by itself.
- The product should compound improvements on the version that is already fun instead of repeatedly paying a gameplay-reconstruction tax.

Acceptance boundary:
- Automated parity is necessary but no longer sufficient for gameplay-facing presentation milestones.
- Every meaningful visual candidate must also pass an owner fun/readability comparison against the frozen Three.js reference.
- A green build that feels worse does not advance.
- Final Android acceptance still belongs to the exact artifact tested on the Galaxy S26 Ultra.
