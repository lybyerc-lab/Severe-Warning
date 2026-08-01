# Severe Weather Current Status

Last updated: 2026-07-31
Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`
Active release: HTML/WebGL `4.3.1 Mobile Comfort & Identity`
Primary target: single-player Android landscape
Active source: `MechanicsLab/SevereWeather_3D_Lab.html`
Android packaging: Capacitor 8.5.0 with local offline assets

## Canonical memory order

1. Current repository code and physical-device evidence
2. This status file
3. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
4. `Docs/DECISION_LOG.md`
5. `Docs/NO_DRIFT_POLICY.md`
6. `Docs/DEVICE_TEST_LOG.md`
7. Historical Unity and Godot checkpoint documents

Important decisions and test evidence must be committed to the repository. Chat is working context, not durable project memory.

## Production decision

The enjoyable HTML/WebGL game is the production gameplay source. Capacitor packages the exact game locally for Android. Unity and Godot remain preserved historical experiments and are not active production paths.

Reopen an engine port only if measured physical-device evidence proves that the wrapped HTML build cannot meet an explicit requirement.

## Locked product direction

Severe Weather is a humorous, replayable mobile arcade destruction game in which the player directly controls the storm.

- Android landscape is the primary target.
- The visual target is a modernized mid-2000s arcade destruction game with soft toon lighting, bold silhouettes, expressive damage, readable atmosphere, and selective outlines.
- The response is a media circus, not a battle.
- News vans and storm chasers are invincible witnesses, never enemies or destruction targets.
- People remain protected and off-limits.
- Animals are invincible, non-targetable, and may appear in safe slapstick sequences.
- `Moo Brew` is the approved opening-cinematic coffee brand.
- Regional campaigns are approved: Heartland, Coastland, East Coast, and West Coast.
- Approved future storm forms include waterspouts, twin or satellite funnels, multi-vortex tornadoes, and a later fire-whirl variant only after real fire mechanics exist.
- Storm abilities must become visibly physical: lightning propagation through power infrastructure, wind-driven tree and prop reactions, and stronger Pull anticipation.
- The audio system must advance to layered weather ambience and material-specific destruction sounds.

The complete approved direction is recorded in `Docs/PRODUCT_VISION_AND_ROADMAP.md`.

## v4.3.1 release contents

- Raised the mobile movement joystick above the phone edge.
- Reduced the NOAA banner footprint on short landscape screens.
- Hid the persistent banner build badge on compact displays.
- Realigned HUD and toast offsets.
- Removed hostile-vehicle terminology.
- Preserved media crews as invincible observers.
- Synchronized package, Android, in-game, build-info, and artifact identity to `4.3.1`.
- Android `versionCode`: `431`.
- APK name: `Severe-Weather-v4.3.1-Mobile-Comfort-debug.apk`.
- Added fail-fast build checks for stale version identity and hostile-vehicle references.
- Added the durable product vision and roadmap.

## Build and physical evidence

- Tested commit: `5ef95e1e774cf80d9612c25fe780b1db81ea73bb`
- GitHub Actions run: `30680592594` (`Build Android Debug APK #21`)
- Artifact: `severe-weather-v4.3.1-mobile-comfort-21`
- APK SHA-256: `00f927ece76fd0eccaea429d77ec37d2f1ae8e553f733867c892090e29f25359`
- Device: Galaxy S26 Ultra
- User verdict: `Good build`

A full Tornado Warning run reached the results and retry screen without a reported crash:

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
- Neon Funnel unlocked

The mobile-comfort gate is accepted on the target high-end Android device.

## Known evidence gap

The highest grade remains reachable with `0/3` substations. This is not a release blocker, but it is scoring-balance evidence. Review substation signaling and grade weighting during a later gameplay-balance pass.

Still unproven:

- ordinary or older Android performance
- sustained heat and battery behavior
- interruption recovery
- close/reopen persistence
- broader repeated-run cleanup testing

## Immediate next milestone

Begin v4.4.0 as an illustrated storm-feedback pass, starting with one exceptional ability rather than upgrading everything at once.

Recommended first slice:

1. Grid Zap follows actual power connections and visibly arcs through poles, lines, transformers, and substations.
2. Add matching electrical sound layers and lighting feedback.
3. Establish soft toon materials and selective outline rules on a limited target set.
4. Validate browser performance and one Android APK before expanding the treatment to Gust and Pull.

Do not bundle regional campaigns, Moo Brew cinematics, animals, and the complete replacement audio library into the first v4.4.0 slice.
