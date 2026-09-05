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

## 2026-07-24 - Android Build #5.1

### Source

- Commit: `7695875effea2dafb8bb8c1e6519f1b9181b1587`
- Application version: `0.1.8`
- Unity: `6000.3.0f1`
- Target: Android APK through Unity Build Automation

### Recorded physical result

- Build #5.1 compiled and launched on Android.
- Captured telemetry was approximately 60 FPS.
- Tornado and Supercell movement, camera behavior, switching, target detection, and staged damage remained functional.
- The blue HAIL rectangle and orange Tornado ground disk were removed.
- FX and fragment counts remained within the `18` and `42` caps in captured frames.
- Trees, utilities, roofs, props, and crops reacted directionally.
- Crops no longer formed the vertical black spike field.

### Remaining failures

- A dark triangular trail followed the Supercell.
- Looping ground-mist and hail lines read as tangled blue debug scribbles.
- Tornado PULL still used oversized ring feedback.
- Flattened crops read as scattered boards rather than coherent row damage.
- No five-minute stress, heat, battery, or sustained-cleanup result was recorded.

### Decision

Build #5.1 passes its mechanical impact-reaction gate and fails final ability-feedback presentation. Build #5.2 remains a constrained cleanup and sustained-device-test pass.

## 2026-07-25 - Unity Build Automation attempt 6 for Build #5.2

This is compilation and packaging evidence, not a physical-device result.

### Source

- Commit: `80f2f1438d600b3b2857925e6aef60e48dd04444`
- Application version: `0.1.9`
- Build label: `5.2`
- Unity: `6000.3.0f1`
- Target: Android APK, IL2CPP, ARM64

### Result

- Unity generated the Build #5.2 production slice.
- Android player compilation and APK packaging succeeded.
- The cloud log ended with `Build Finished, Result: Success`.
- The supplied APK is readable and contains Android manifest and Unity player data.
- The automated test step recorded zero duration; no gameplay unit tests ran.

### Decision

Commit `80f2f14` is the latest proven compile/package baseline. The Build #5.2 physical gate remains open because no five-minute Android acceptance record accompanies the artifact.

## 2026-07-31 - HTML/Capacitor v3.2.0 Android proof

### Source and artifact

- Active gameplay source: `MechanicsLab/SevereWeather_Warning.html`
- Edition: `3.2.0 Live Coverage Edition`
- Commit: `d2b8fde67b76e7d5d5faa7991f9984801586836b`
- GitHub Actions run: `30653818627`
- Artifact: `severe-weather-v3.2.0-debug-2`
- APK SHA-256: `35d8996f6d3bdc30dafdbae42b395efb89a99d200f4444e2d7d922024ab6963c`
- Device: Galaxy S26 Ultra, reported by the user as a high-end phone

### Result

- The debug APK installed and launched successfully.
- The user reported that it looked and played like the HTML game.
- A full Tornado Warning run reached the results screen.
- Rank: `S+`
- Final score: `23621`
- Maximum combo: `3.5x`
- Objectives: `3/3`
- Landmarks: `2/2`
- Substations: `3/3`
- Bonus challenges: `3/3`
- Media moments: `17`
- Footage bonus: `+1817`
- Neon Funnel cosmetic unlocked.

### Decision

The local Capacitor wrapper is the accepted Android packaging strategy. The HTML game does not need an engine rewrite to reach the target phone with its gameplay feel intact. This is strong high-end-device evidence, not a lower-end Android performance matrix. Sustained heat, battery, interruption recovery, and close/reopen persistence were not separately quantified in the submitted evidence.

## 2026-07-31 - HTML/Capacitor v4.1.0 Serpentine Funnel Verification

### Source and artifact
- Active gameplay source: `MechanicsLab/SevereWeather_Warning.html`
- Edition: `4.1.0 Serpentine Funnel Edition`
- Commit: `8c4e91d`
- Verified: User physical mobile screenshot + WebGL browser verification @ 61 FPS

### Result
- The tornado mesh visual upgrade successfully rendered:
  1. Real-time snaking/twisting 16-segment cylinder funnel geometry.
  2. Ground touchdown dust bowl puffs (`#1e293b`).
  3. Spinning mesocyclone storm cloud ceiling canopy (`#090d16`).
  4. 1,000 multi-colored helical spiraling particles.
- Top-right HUD version badge updated cleanly to `3D LAB v4.1.0 SERPENTINE FUNNEL`.
- Frame rate remained steady and responsive at 61 FPS with zero JavaScript console exceptions.
- User feedback: "Its an improvement".

## 2026-07-31 - HTML/Capacitor v4.3.1 Mobile Comfort acceptance

### Source and artifact

- Active gameplay source: `MechanicsLab/SevereWeather_Warning.html`
- Release: `4.3.1 Mobile Comfort & Identity`
- Tested commit: `5ef95e1e774cf80d9612c25fe780b1db81ea73bb`
- GitHub Actions run: `30680592594` (`Build Android Debug APK #21`)
- Artifact: `severe-weather-v4.3.1-mobile-comfort-21`
- APK: `Severe-Weather-v4.3.1-Mobile-Comfort-debug.apk`
- APK SHA-256: `00f927ece76fd0eccaea429d77ec37d2f1ae8e553f733867c892090e29f25359`
- Device: Galaxy S26 Ultra

### Result

- GitHub Actions completed successfully.
- The exact debug APK installed and launched.
- The user reported: `Good build`.
- A full Tornado Warning run reached the results and retry screen without a reported crash.
- Rank: `S+`
- Final score: `56185`
- Maximum combo: `3.5x`
- Objectives: `3/3`
- Landmarks: `2/2`
- Substations: `0/3`
- Bonus challenges: `3/3`
- Blocks cleared: `34`
- Chain reactions: `4`
- Media moments: `20`
- Footage bonus: `+1869`
- Neon Funnel cosmetic unlocked.

### Physical acceptance

- The mobile-comfort release is accepted on the target high-end Android device.
- The corrected joystick and reduced NOAA banner did not prevent a complete run and received no new negative device feedback.
- The HTML/Capacitor production path remains accepted.

### Follow-up observation

The run earned `S+` with `0/3` substations. This is not a build failure, but it is scoring-balance evidence: the finale substation path is presently optional enough that the highest grade remains reachable without engaging it. Review grade weighting or substation objective signaling during the next gameplay-balance pass rather than reopening this corrective release.

### Remaining unproven areas

- ordinary or older Android performance
- sustained heat and battery behavior
- interruption recovery and close/reopen persistence
- repeated-run cleanup beyond the accepted completed run

---

## v5.2.0 "Hand It To Someone" — PREPARED, AWAITING THE DEVICE

Prepared 2026-09-04 by the code side. **Nothing below is evidence yet.** Fill in
the results on the device and delete this warning line; an unfilled section is an
untested build, and this file is the one place that distinction is kept.

Why this entry exists: the last logged run was **2026-08-26**, and **139 commits**
have landed since. Everything in "What is new and has never been on a device" has
only ever been proved in a headless browser. Under the first operating law, that
is not acceptance.

### The build to test

- Branch `qa`, tag `v5.2.0` (cut once CI is green on the tagged commit).
- Artifact from the **Build Signed Android QA APK** workflow on that commit:
  `severe-weather-v5.2.0-qa-<run number>`, containing
  `Severe-Weather-v5.2.0-QA-<run number>.apk`.
- Application id `com.lybyerclab.severeweather.qa`, version name `5.2.0-qa.<run>`,
  version code `520<run>`. It installs **over** the previous QA build; do not
  uninstall first — update-in-place is itself part of the test.

### What is new and has never been on a device

Tick each, and write what you actually saw. "Looked fine" is a result; so is
"never got there".

- [ ] **Launcher icon and splash.** The drawer icon and the first two seconds
      were the stock Capacitor logo until now. Look at the icon in the drawer
      before opening anything.
- [ ] **Landscape lock.** The app should never present a portrait layout. Try
      rotating during a run.
- [ ] **The menu.** Rebuilt as a broadcast over the live county — CRT cabinet,
      wire-dispatch card, region map. Does it set the right mood before play?
- [ ] **Funnel integrity / rope-out.** A run can now END early if the storm stops
      destroying things. Try idling for ~10s mid-run and watch the meter.
- [ ] **MOO-LAH economy and the shop.** Payout after a run, and the storefront:
      6 upgrades against 3 loadout slots.
- [ ] **Star-gated skins.** SIREN AMBER at 8 stars, DOPPLER VIOLET at 18,
      WHITEOUT at 30. Locked ones should show a star requirement, not a price.
- [ ] **Ten counties across three regions.** Coastal and Metro now gate and
      unlock like Heartland. Clear one county and check the next opens.
- [ ] **The campaign finale.** Clearing all ten prints a season's-end special
      edition in the Evening Edition. (Long test — skip unless you want it.)
- [ ] **Metro dressing.** Skyline Plaza, Grand Central and Broadcast Heights were
      nearly empty; they now carry street grid, rail yard and a dish farm. Watch
      the frame rate here especially — this is the most geometry added in months.
- [ ] **The results card.** Bovine stats, the district split, and the payout line.

### Still unproven from the 2026-08-26 entry

Carried forward untouched — none of these has been tested since:

- [ ] ordinary or older Android performance
- [ ] sustained heat and battery behavior
- [ ] interruption recovery and close/reopen persistence
- [ ] repeated-run cleanup beyond the accepted completed run

### Result

- Device:
- APK / run number:
- Installed over previous build without uninstall: yes / no
- Completed a full run: yes / no
- Crashes, hangs or visual faults:
- Frame rate impression (especially Metro):
- Verdict: accepted / not accepted / partial —
