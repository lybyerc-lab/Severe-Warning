# Accepted Behavior Register

This file records historically accepted behavior and current protected behavior. **Exact current task authority, `Docs/ACTIVE_HANDOFF.md`, `AGENTS.md`, and `Docs/GAME_DIRECTOR.md` outrank older acceptance entries when a later Director-approved milestone explicitly superseded them.**

Do not interpret an old visual acceptance as permission to revert later accepted Stage 2B presentation.

## Historical physical Android acceptances

### v4.4.0 Illustrated Storm Feedback

Accepted on Galaxy S26 Ultra at that milestone.

- Fullscreen behavior worked correctly.
- Mobile HUD and presentation were readable for that build.
- The illustrated storm presentation was accepted **for v4.4.0**.

Reference:
- Merge commit: `8fef0e0cc3b3a30fa6b2845b70e72fca367dc657`

**Supersession note:** this is no longer the current visual baseline. Later owner playtests rejected subsequent visual states and Stage 2B established newer storm/world presentation authority, including the QUALITY-001/002 rescue. Preserve the historical device evidence, not the old art state as current authority.

### v4.4.1 Gust Feedback

Accepted on Galaxy S26 Ultra.

- Tree response to Gust was good.
- Later work should preserve the accepted gameplay response unless an exact task deliberately reopens it.

Reference:
- Exact accepted head: `4c91694b406dfca119f457135276bc145837c169`
- Merge commit: `578777de9d50f0f44313681746b19b427e2376b1`

### v4.4.2 Pull Feedback

Accepted on Galaxy S26 Ultra as a good build.

- Pull environmental response and readability were accepted.
- Later audio/UI/presentation changes must not casually weaken Pull behavior.

Reference:
- Exact accepted head: `82c455fff9ddb0e6a37f60b583a87b58f73173a4`
- Merge commit: `3b3727da55c91439f99772f7ef5d1c50cdc957a5`

### v4.5.0 partial acceptance

Not accepted as a complete milestone.

Protected historical partial result:
- Continuous wind ambience from APK build #42 sounded good and should not be casually regressed.

Rejected or unresolved at that historical checkpoint:
- Earlier ability/destruction sounds resembled arcade pews and pings.
- APK #46 improved those sounds, but music was inaudible, glass was overused, and a synthetic sound remained.

## Current Stage 2B protected source/browser behavior

Current canonical integration branch:

`agent/sw-int-003-stage2b-accepted-stack`

Exact Director-accepted head at this register update:

`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

Current protected behavior includes:

- direct storm steering/input and accepted gameplay camera feel;
- ordinary storm movement/speed authority;
- accepted Pull, Gust, and Grid Zap gameplay behavior;
- scoring/combo/timer/objective/rank/campaign authority unless an exact task reopens it;
- Cow 17/cow safety and non-targetability;
- local-first persistence and accepted progression semantics;
- Storm Site framework and authored site identity contracts;
- short-landscape newspaper launch reachability;
- pause reachability and accepted quit-to-main-menu lifecycle behavior;
- accepted Tornado whole-column dirty/volumetric/rotating presentation from QUALITY-002;
- distinct County Fair and Gullwind Boardwalk presentation;
- Storm Sites launching without the Heartland Cow 17 opener;
- improved Cow 17 opening staging without prototype/debug chrome.

The Stage 2B entries above are Director/source/browser acceptance unless separately recorded as physical Android acceptance. Do not silently upgrade browser/CI evidence into physical-device acceptance.

## Acceptance rule

Keep these gates separate:

1. source committed;
2. executed QA/evidence for the exact source;
3. Director acceptance;
4. owner browser/play acceptance when required;
5. physical Android acceptance when required.

A cloud build, green CI run, browser test, or successful APK assembly is not by itself physical-device acceptance.
