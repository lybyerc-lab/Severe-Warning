# PlayCanvas Hands-On Feedback - 2026-08-06

Delivery: live GitHub Pages preview at `/Severe-Warning/playcanvas/`
Device context: Galaxy S26 Ultra browser test
Status: browser-playable candidate, not Android physical acceptance

## Owner verdict

- Graphics are a **huge improvement** over the prior renderer direction.
- The candidate is visibly **prettier** and validates continuing the PlayCanvas migration.
- It still needs work before acceptance.

## First hands-on defects

1. **Tornado silhouette was upside down.**
   - The first candidate was widest at ground contact and narrowest aloft.
   - Intended silhouette is narrow at the ground and broad into the storm base.
   - The corrected candidate now renders the funnel upright.

2. **Controls felt inverted in the first visible PlayCanvas camera.**
   - The accepted gameplay authority interprets movement in world axes.
   - The PlayCanvas view must translate visible screen-space input back into those accepted world axes.
   - Camera-relative input corrected the inversion, but exposed the next camera-feel issue.

## Follow-camera retest

The stable-offset follow camera preserved the improved graphics and corrected funnel, but it still did not feel like the intended player experience.

Owner observation:

- when steering left or right, the camera appeared to pan laterally with the tornado
- the movement was technically following the storm but did not feel like a third-person game camera
- the desired reference is the **third-person follow camera used in shooting games**, adapted to one joystick because the tornado does not need a separate look stick

## Owner-approved camera direction

Target a **one-stick third-person chase camera**:

- one joystick controls storm movement
- camera remains behind and above the tornado
- camera heading is a separate state from instantaneous joystick direction
- pushing forward should keep the camera nearly stable
- a sustained turn should curve the storm path while the camera gradually eases around behind the new travel direction
- small steering corrections should not whip or snap the world around
- camera maintains a stable chase distance and elevated framing
- joystick and keyboard remain camera-relative as the camera heading changes
- no second look stick is introduced
- accepted gameplay authority remains unchanged

This is intentionally closer to a third-person shooter chase camera than a fixed isometric map camera or a steering-attached orbit camera.

## Current correction candidate

Implementation branch: `agent/playcanvas-playable-moo-brew-slice`

- `[SW:PLAYCANVAS:FUNNEL_ORIENTATION]`
  - narrow ground-contact cone first
  - wider cone layers as height increases
  - cone points face downward

- `[SW:PLAYCANVAS:ONE_STICK_CHASE_CAMERA]`
  - explicit camera heading and desired-heading state
  - bounded turn rate
  - heading dead zone for small corrections
  - travel-direction threshold before camera heading updates
  - stable horizontal chase distance
  - reset restores deterministic opening heading

- camera-relative input contract
  - visible screen vector uses the current chase-camera basis
  - PlayCanvas direction is inverse-transformed into accepted gameplay-authority axes
  - keyboard and touch use the same accepted movement executor path

Regression gates:

- static verifier requires upright funnel, one-stick chase-camera, and camera-relative input contracts
- browser QA drives the visible joystick upward and requires tornado motion toward screen-forward
- forward joystick input must leave camera heading materially stable
- browser QA drives keyboard right and requires tornado motion toward screen-right
- sustained right movement must rotate the camera gradually, neither remaining frozen nor snapping immediately
- horizontal chase distance must remain stable through forward and turning motion

## Acceptance gate

- exact corrected head passes the full PlayCanvas workflow
- generated screenshot is inspected
- sealed corrected artifact is promoted to `/playcanvas/`
- owner re-tests the one-stick chase-camera feel in browser
- no Android acceptance claim until a PlayCanvas APK is built, inspected, checksummed, and physically tested
