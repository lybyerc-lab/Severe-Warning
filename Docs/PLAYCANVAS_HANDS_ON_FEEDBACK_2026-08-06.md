# PlayCanvas Hands-On Feedback - 2026-08-06

Delivery: live GitHub Pages preview at `/Severe-Warning/playcanvas/`
Device context: Galaxy S26 Ultra browser test
Status: browser-playable candidate, not Android physical acceptance

## Owner verdict

- Graphics are a **huge improvement** over the prior renderer direction.
- The candidate is visibly **prettier** and validates continuing the PlayCanvas migration.
- It still needs work before acceptance.

## Blocking defects found

1. **Tornado silhouette is upside down.**
   - The first candidate is widest at ground contact and narrowest aloft.
   - Intended silhouette is narrow at the ground and broad into the storm base.

2. **Controls feel inverted in the visible PlayCanvas camera.**
   - The accepted gameplay authority interprets movement in world axes.
   - The PlayCanvas view must translate visible screen-space input back into those accepted world axes.

## Owner camera direction

The elevated diagonal view is promising. A camera that follows the tornado in a third-person/isometric style should strengthen the feeling that the player **is the storm**.

First follow-camera pass should stay conservative:

- camera translates with the tornado at a stable elevated diagonal offset
- tornado remains the focal subject
- keyboard and touch input are camera-relative, so screen-up means move toward the top of the screen and screen-right means move right on screen
- accepted gameplay authority remains unchanged
- more aggressive chase-camera turning/orbit can be added only after the stable follow-camera feel is physically comfortable

## Correction candidate

Implementation branch: `agent/playcanvas-playable-moo-brew-slice`

- `[SW:PLAYCANVAS:FUNNEL_ORIENTATION]`
  - narrow ground-contact cone first
  - wider cone layers as height increases
  - cone points face downward

- `[SW:PLAYCANVAS:STORM_FOLLOW_CAMERA]`
  - stable elevated diagonal camera offset
  - camera position follows rendered tornado position
  - camera continuously looks at tornado

- camera-relative input contract
  - visible screen vector is converted into PlayCanvas ground direction
  - PlayCanvas direction is inverse-transformed into accepted gameplay-authority axes
  - keyboard and touch use the same accepted movement executor path

Regression gates:

- static verifier requires upright funnel, follow-camera, and camera-relative input contracts
- browser QA drives the visible joystick upward and requires tornado motion toward screen-forward
- browser QA drives keyboard right and requires tornado motion toward screen-right
- browser QA requires camera translation to match tornado translation during both tests

## Acceptance gate

- exact corrected head passes the full PlayCanvas workflow
- generated screenshot is inspected
- sealed corrected artifact is promoted to `/playcanvas/`
- owner re-tests touch controls, tornado orientation, and follow-camera feel in browser
- no Android acceptance claim until a PlayCanvas APK is built, inspected, checksummed, and physically tested
