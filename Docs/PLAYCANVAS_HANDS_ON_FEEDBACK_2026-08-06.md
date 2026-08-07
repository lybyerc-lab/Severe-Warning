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
   - The accepted gameplay authority still interprets movement in world axes.
   - The first PlayCanvas camera was diagonally offset, so screen-space stick directions did not line up naturally with those world axes.

## Correction candidate

Implementation branch: `agent/playcanvas-playable-moo-brew-slice`

- `[SW:PLAYCANVAS:FUNNEL_ORIENTATION]`
  - narrow ground-contact cone first
  - wider cone layers as height increases
  - cone points face downward

- `[SW:PLAYCANVAS:CAMERA_ALIGNED_INPUT]`
  - fixed camera centered on world X
  - screen-right aligns with accepted `+X`
  - screen-up aligns with accepted `-Z`
  - gameplay authority and executor semantics remain unchanged

Regression gates:

- static verifier requires the camera alignment anchor and upright funnel contract
- browser QA requires rightward authority motion to increase X
- browser QA requires upward screen motion to decrease Z

## Acceptance gate

- exact corrected head passes the full PlayCanvas workflow
- generated screenshot is inspected
- sealed corrected artifact is promoted to `/playcanvas/`
- owner re-tests touch controls and tornado orientation in the browser
- no Android acceptance claim until a PlayCanvas APK is built, inspected, checksummed, and physically tested
