# PlayCanvas Camera Polish - 2026-08-07

## Owner hands-on finding

Expanded Prairie Junction Run 39 / Pages Run 70 ran well on the owner's Galaxy S26 Ultra browser test. The remaining camera note was specific: during sustained turns, the chase camera pivots a little farther forward than desired.

This is a camera presentation polish item, not a control-model rejection and not a gameplay-authority change.

## Camera-only correction

Anchor: `[SW:PLAYCANVAS:OWNER_TRAILING_POLISH]`

The sealed map-scale camera configuration remains the reference:

- base turn rate: 1.05 rad/s
- heading dead zone: 10 degrees
- chase distance: 46.86 world units
- chase height: 28
- look target Y: 3.6
- movement threshold: 0.28
- intent threshold: 0.12

The correction applies `OWNER_TRAILING_TURN_SCALE = 0.9` to camera rotation only, preserving approximately 10% more trailing view during sustained turns. Gameplay movement, storm speed, map geometry, input mapping, chase height/distance, and gameplay authority are unchanged.

## Run 42 browser-gate finding

Run 42 on exact source `64896a6f2dee3ea94077bf598b6e4ada09ed8ac8` passed exact source identity, accepted gameplay reconstruction, TypeScript, static verification, Vite build, authority packaging, visible direction, camera stability, gradual-turn, abilities, destruction, scoring/combo, Cow 17 safety, clearance, reset/disposal, and no-error gates.

It failed only `visible-storm-speed-parity` because that older gate compared raw visible displacement against a nominal 420 ms Playwright wait. On the expanded 233-entity headless scene, browser scheduling stretched the effective test interval substantially, making raw displacement timing-dependent. No owner hands-on speed regression was reported.

## QA correction

Anchor: `[SW:PLAYCANVAS:VISIBLE_AUTHORITY_SCALE_PARITY]`

The speed-parity gate now compares visible storm displacement with authoritative storm displacement over the exact same real visible-joystick interval. The time term cancels, so the gate directly measures presentation scale against the sealed Run 39 visible/authority ratio `0.7717`, with a narrow `0.03` tolerance.

This retains all of the important truth conditions:

- actual visible joystick is exercised
- accepted gameplay authority owns movement
- screen-forward direction remains a separate required gate
- presentation scaling cannot silently make the storm appear materially faster or slower
- headless scheduler stalls no longer masquerade as a gameplay-speed regression

## Current status

- live QA remains Run 39 until the camera-polish exact head is fully green
- PR #34 remains draft/unmerged
- Android PlayCanvas APK: not built
- physical Android acceptance: not claimed
