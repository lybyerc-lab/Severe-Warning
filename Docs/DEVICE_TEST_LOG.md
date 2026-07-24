# Physical Device Test Log

This file is append-only. Record the tested build, commit, device-visible behavior, failures, and the next approved response. Do not replace physical evidence with assumptions from a successful cloud build.

## 2026-07-23 - Android Build #1

### Source

- Initial production starter commit: `5188c78ba99bf8ff7935f583cad926a4107d0da5`
- Unity: `6000.3.0f1`
- Target: Android APK through Unity Build Automation

### Result

- Cloud build succeeded.
- APK installed and launched.
- Device displayed a black screen.

### Engineering response

The startup path was made observable and resilient:

- camera creation moved ahead of region generation
- camera received a guaranteed solid-color clear surface
- startup exceptions gained an on-screen diagnostic panel
- a guaranteed-included runtime shader was added
- runtime material lookup gained explicit fallbacks and a clear failure

Hotfix commit: `23e638f5dbfb0522f512209fa636a17147c6c7d1`

## 2026-07-23 - Android Build #2

### Result

- Cloud build succeeded.
- APK installed as an update.
- Generated graybox region rendered successfully.
- Tornado spawned.
- HUD rendered.
- Storm switching between Tornado and Supercell worked.

### Physical findings

- Storm movement was not clear or reliably controllable.
- The camera-follow behavior made world-axis steering difficult to interpret.
- Visible ability buttons did not share the same rectangles as touch detection.
- The right side was interpreted as horizontal touch bands, so visible labels and actual actions could disagree.
- No joystick, dead-zone display, input vector, or position telemetry existed.

### Approved response

Build #3 is a focused mobile-control alignment pass. It must fix the complete input path without mixing in art, audio, loading, or new gameplay work.

## Build #3 test record

Status: pending physical Android test.

Record after installation:

- Cloud build result:
- APK update or clean install:
- Tornado movement:
- Supercell movement:
- Primary ability:
- Secondary ability:
- Tertiary ability:
- Storm switching:
- Safe-area fit:
- Frame pacing:
- Heat:
- New defects:
- Decision:

## 2026-07-23 - Android Build #3

### Source

- Commit: `32ec421528e75632bae793ba0569c8770baa0d42`
- Unity: `6000.3.0f1`
- Target: Android APK through Unity Build Automation

### Result

- Cloud build succeeded from the intended commit.
- APK installed and launched.
- `B3 INPUT LAB` rendered.
- Joystick input telemetry changed during touch.
- Storm position telemetry changed, confirming runtime movement input was reaching the controller.
- Storm switching and primary resource drain worked.

### Physical findings

- Movement was not perceptible because the camera immediately tracked the storm and kept it nearly fixed on screen.
- The opening crop field provided poor parallax and few visible landmarks.
- Crops were damageable objects without colliders, so storm physics queries could not interact with them.
- Ability input could drain resources without visible world feedback.
- The emergency unlit material path produced flat lighting, no useful surface separation, weak storm transparency, and an unacceptable visual-quality baseline.
- Black world edges remained visible at some camera angles.

### Decision

Build #3 failed the movement-feel and visual-quality gates. Build #4 is approved as a focused feel, interaction, physics, and deterministic-rendering recovery pass. Production art, final audio, missions, and progression remain out of scope.

## Build #4 test record

Status: pending physical Android test.

Record after installation:

- Cloud build result:
- APK update or clean install:
- Build identity shown:
- Active render pipeline:
- Graphics API:
- Tornado movement and speed:
- Supercell movement and speed:
- Camera leash readability:
- Starter test-pocket visibility:
- Primary ability feedback:
- Secondary ability feedback:
- Tertiary ability feedback:
- Crop interaction:
- Vehicle movement:
- Shadows, fog, and transparency:
- World-edge coverage:
- Frame pacing:
- Five-minute heat result:
- New defects:
- Decision:

## 2026-07-24 - Android Build #4

### Source

- Commit: `91ee1a257bbe8e771d73097c9c4a3c781c53c225`
- Application version: `0.1.4`
- Unity: `6000.3.0f1`
- Builder: Windows 11 24H2 Micro
- Graphics API observed on device: Vulkan
- Render pipeline observed on device: Built-in

### Result

- Cloud build succeeded after a fresh Library import and a long shader preparation stage.
- APK installed and launched.
- Lit materials, soft shadows, road markings, props, debris, and immediate-action visuals rendered.
- Frame telemetry showed approximately 60 FPS in the captured starter scene.

### Movement failure evidence

With the joystick at full right input, the HUD showed:

- `INPUT +1.00, 0.00`
- `SPEED 28.0`
- `DIST 123.7`
- `POS -121.8, 111.9`

The configured spawn is `-122.0, 112.0`. Position therefore remained essentially unchanged while intended speed and distance advanced. The movement controller was recording requested displacement without verifying resolved root translation.

### Visual findings

- Tornado still read as stacked primitive layers with a flat upper silhouette.
- The compact-landscape status panel clipped its final lines.
- Inactive control buttons lacked contrast.
- Environment presentation remained procedural graybox quality despite improved lighting and feedback.

### Decision

Build #4 fails the movement and target-visual-quality gates. Build #4.1 is approved as a focused correction for actual translation, honest telemetry, camera motion readability, tornado silhouette, HUD fit, and shader-build scope.

## 2026-07-24 - Android Build #4.1

### Source

- Commit: `96c9f780daf070648dc69a7f6cd431233b85617a`
- Application version: `0.1.5`
- Unity: `6000.3.0f1`
- Graphics API observed on device: Vulkan
- Render pipeline observed on device: Built-in

### Result

- Cloud build succeeded.
- APK installed and launched.
- Tornado and Supercell both translated correctly.
- Input, actual speed, position, and distance telemetry agreed.
- Supercell movement speed felt appropriate.
- Tornado silhouette improved substantially over the stacked-cylinder version.

### New physical findings

- The regular Tornado can outrun the camera and leave the visible frame.
- The Supercell cloud mass is too large for its camera distance and obscures world readability.
- Build #4.1 passes the movement gate but fails camera containment and Supercell framing.

### Approved response

Build #4.2 keeps both movement speeds and adds viewport containment, hard-edge recovery, wider Supercell framing, a flatter shelf-cloud silhouette, and camera-state telemetry.

## Build #4.2 test record

Status: pending physical Android test.

Record after installation:

- Cloud build result:
- APK update or clean install:
- Build identity shown:
- Tornado remains visible at full speed:
- `CAM SAFE` behavior:
- `CAM CATCHUP` behavior:
- `CAM RECOVER` behavior:
- Supercell full silhouette fit:
- Roads and targets readable around Supercell:
- Rain/hail core visible:
- Tornado movement speed preserved:
- Supercell movement speed preserved:
- Abilities and storm switching:
- Frame pacing:
- Five-minute heat result:
- New defects:
- Decision:

## 2026-07-24 - Android Build #4.2

### Source

- Commit: `fd54c7c2b0764e8e4b301700caba997a27b08378`
- Application version: `0.1.6`
- Unity: `6000.3.0f1`
- Target: Android APK through Unity Build Automation

### Result

- Tornado and Supercell movement remained functional.
- Tornado camera containment improved.
- Camera transition between Tornado and Supercell improved.
- Supercell navigation framing now preserves roads, buildings, targets, and ground context.
- Captured frame telemetry remained near 60 FPS.

### New findings

- The Supercell precipitation volume is visibly an opaque blue cylinder.
- Damage and collapse still lack a strong staged material language.
- Procedural primitives remain laboratory assets rather than production art.

### Decision

Build #4.2 passes the movement and camera-foundation gate. Build #5 is approved as a focused impact, precipitation, material-reaction, and staged-destruction laboratory.

## Build #5 test record

Status: pending Unity compilation and physical Android test.

Record after installation:

- Cloud build result:
- APK update or clean install:
- Build identity shown:
- Blue precipitation cylinder removed:
- Rain and hail curtain readability:
- Ground mist readability:
- Wood stage response:
- Glass stage response:
- Metal stage response:
- Masonry stage response:
- Crop response:
- Vegetation response:
- Vehicle response:
- Structural collapse behavior:
- Tornado abilities:
- Supercell abilities:
- Camera containment during impacts:
- Frame pacing:
- Five-minute heat result:
- New defects:
- Decision:

## 2026-07-24 - Build #5 physical result - impact systems pass, readability fail

Device screenshots confirmed:

- `B5 IMPACT + DESTRUCTION LAB` and version `0.1.7` launched successfully.
- Tornado and Supercell movement, camera containment, switching, target detection, and staged damage remained functional.
- The blue Supercell cylinder was removed and rain/hail streaks rendered.
- Hail reported six targets in the captured pass and material-stage telemetry reported Crop and Vegetation Critical states.
- Crops rotated into repeated dark vertical slabs instead of flattening near the ground.
- The Hail Swath rectangle read as a debug selection box rather than weather.
- Generic radial line bursts read as laboratory graphics rather than material response.
- Supercell cloud lobes still obscured the affected ground during attacks.
- Ground mist and Tornado contact geometry remained too solid and primitive.

Build #5 passes the systems gate and fails the impact-readability gate. Build #5.1 must preserve working mechanics while correcting presentation and bounding transient object counts.
