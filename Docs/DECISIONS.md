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
- The browser lane cannot enforce it — `screen.orientation.lock` is fullscreen-only where it exists at all and absent on iOS Safari — so the web build enters fullscreen on the player's own gesture (GO LIVE ON AIR, or a tap on the stand-by card) and asks for the lock there, which is the only place Android Chrome grants it. Where fullscreen or the lock is refused, the KSWX-7 stand-by card at `[SW:UI:ORIENTATION_LOCK]` goes up and a live run is suspended through the same path a backgrounded tab uses.
- The gate is media-query driven (`(orientation: portrait) and (max-width: 900px)`), so a windowed desktop browser is never gated. The bot harness (`?bot=true`) and the QA labs (`?qa=1`) are ungated by class.
- Every automated harness viewport must be landscape. A portrait viewport measures a layout that cannot ship.
- `npm run verify:orientation` (`scripts/verify-orientation-lock.mjs`) enforces all of the above on every build and is wired into the full-round workflow. This decision is not maintained by memory.

Rationale:
- The twin-stick layout wants the thumbs wide apart, the HUD is a broadcast lower-third, and the world is framed for a wide picture. Portrait cannot have all three, and supporting it doubles the layout surface of every screen for a hand nobody wants to play.

## D-012: v5.2.0 is the finish line, and it is a list rather than a bar

Date: 2026-09-04
Status: explicitly approved by director

Context:
- Asked where to write *fin*, the director's answer was that they did not know: "Every time we make solid progress, it's shanghaied several directions."
- Nothing in the repository had ever defined "finished". `CORE_DIRECTION.md`, `PRODUCT_VISION_AND_ROADMAP.md` and `BUILD_TRAIN.md` name no release target, no date, and no acceptance bar; the roadmap ends on "twin-funnel and multi-vortex advanced forms" with no terminus.
- The project was never at risk of dying. 358 commits across 21 active days, ~17 a day, all four workflows green on the current head. The risk was the opposite one: high velocity with no edge to stop at.
- The drift was measured rather than guessed. Of the substantive commits between 2026-08-22 and 2026-09-04, roughly a third repaired the *checking apparatus* rather than the game. 37 of 55 files in `scripts/` are verification rigs; there are 10 workflows. The machine that checks the game now generates more work than the game does.

Decision:
- The finish line is **v5.2.0 "Hand It To Someone"**, five items, listed at the top of `Docs/BACKLOG.md`: real icon and splash; the other six counties gated into progression; one logged device run on current code; tag and merge `qa` to `main`; and nothing else.
- "Nothing else" is an item, not a footnote. A `NOT IN v5.2` section sits directly beneath the five and is the **default destination** for everything else found, including findings raised by agents mid-task. Promotion off it is a deliberate act by the director.
- The Play Store is explicitly **not** in this milestone and is a separate decision for afterwards. It is allowed to be answered "no", in which case the missing release key, the frozen `main` and the absent store artifacts stop being debt and become unused machinery.

Rationale:
- A quality bar has no bottom. "Does the menu have the right vibe" can always take another pass, and every such question generated real, good work that moved the line further away. A list can be emptied.
- The list is deliberately short and probably slightly wrong. A slightly wrong list that gets finished beats a perfect standard that never does.
