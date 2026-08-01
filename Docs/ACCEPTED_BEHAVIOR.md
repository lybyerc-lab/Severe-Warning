# Accepted Behavior Register

This file records behavior that passed physical Android testing or was explicitly accepted by the user. Do not change these items casually.

## v4.4.0 Illustrated Storm Feedback

Accepted on Galaxy S26 Ultra.

- Fullscreen behavior works correctly.
- Mobile HUD and presentation remain readable.
- Illustrated storm presentation is the accepted visual baseline.

Reference:
- Merge commit: `8fef0e0cc3b3a30fa6b2845b70e72fca367dc657`

## v4.4.1 Gust Feedback

Accepted on Galaxy S26 Ultra.

- Tree pull response is good.
- Gust feedback must preserve the accepted tree behavior.

Reference:
- Exact accepted head: `4c91694b406dfca119f457135276bc145837c169`
- Merge commit: `578777de9d50f0f44313681746b19b427e2376b1`

## v4.4.2 Pull Feedback

Accepted on Galaxy S26 Ultra as a good build.

- Pull environmental response and readability are accepted.
- Later audio or UI changes must not weaken Pull behavior.

Reference:
- Exact accepted head: `82c455fff9ddb0e6a37f60b583a87b58f73173a4`
- Merge commit: `3b3727da55c91439f99772f7ef5d1c50cdc957a5`

## v4.5.0 partial acceptance

Not accepted as a complete milestone.

Protected partial result:

- Continuous wind ambience from APK build #42 sounded great and must be preserved.

Rejected or unresolved portions:

- Earlier ability and destruction sounds resembled arcade pews and pings.
- APK #46 improved those sounds, but music was inaudible, glass was overused, and an unidentified synthetic sound remained.

## Acceptance rule

A cloud build, browser test, or successful APK installation is not enough. A gameplay milestone becomes accepted only after the exact build is played and approved on the target Android device, with the result recorded in `Docs/BUILD_LEDGER.md`.
