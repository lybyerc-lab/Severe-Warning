# Tornado Tactical P1 Implementation

Status: SOURCE IMPLEMENTED, UNITY BUILD NOT YET PROVEN
Branch: `agent/tornado-tactical-implementation`
Base: `c0963a89d2afb0f3fa917cfcc5e3d30e421a625a`
Version target: `0.2.0`
Android version code: `10`

## Implemented in this pass

- Runtime-installed Tornado Tactical prototype director.
- Three-minute run timer.
- Player-facing tactical HUD with score, combo, EF rating, power, airborne animal count, camera bonus, objectives, and ability labels.
- Persistent warning/news ticker.
- Breaking-news callouts for EF upgrades and captured-on-camera scoring.
- Existing debug HUD disabled while the tactical prototype is active.
- Tactical camera override with pulled-back framing and velocity look-ahead.
- Dense destruction pocket spawned near the initial storm position.
- Five conductive utility targets for Grid Zap testing.
- Spawned invincible cow assembled from runtime primitives.
- Cow orbit, launch, ballistic arc, spin, safe landing, and out-of-bounds recovery.
- Tornado Gust now detects and launches `InvincibleAnimal` targets.
- Tornado Pull counts airborne animal targets in action feedback.
- Safe storm-chaser SUV prototype.
- Chaser retreat behavior when the tornado approaches.
- Chaser observation distance management.
- `CAUGHT ON CAMERA` score feedback and camera bonus tracking.
- EF progression connected to the player-facing HUD and tornado visual growth.
- Android identity moved to `v0.2.0`, code `10`, `Tornado Tactical P1`.

## Existing systems reused

- Tornado movement and mobile input.
- Pull, Gust, and Grid Zap damage behavior.
- Conductive chain targeting.
- `DamageableStructure` stage damage and debris feedback.
- `EFProgressionManager` damage-derived scoring.
- Existing procedural county and destruction systems.

## Deliberate P1 shortcuts

This is a device-test prototype, not the final architecture.

- The tactical systems are installed through a runtime component rather than a final authored scene hierarchy.
- The player HUD uses IMGUI so the gameplay loop can be tested before final UI Toolkit or Canvas production work.
- The cow and chase vehicle use runtime primitive geometry.
- The chaser uses simple safe-distance steering instead of road-graph AI.
- Camera bonuses are based on safe observation distance rather than a final view-frustum footage cone.
- The dense district is a compact test block, not the final four-district county.
- Supercell source remains in the project and the older switch input still exists. Tornado remains the intended P1 test storm.
- No final intro cut, results menu, broadcast audio, radar, authored assets, or production sound pass is included.

## Build gate

The source must not be described as compiled or playable until Unity Build Automation reports a successful Android build.

After build success, physical-device testing must confirm:

1. The top warning ticker appears.
2. The tactical camera remains pulled back and comfortable.
3. The old debug HUD is hidden.
4. The timer counts down from 03:00.
5. Damage raises score and combo.
6. EF upgrades change the headline and tornado scale.
7. The dense test block appears near the initial tornado.
8. Grid Zap chains through the test utility poles.
9. Pull lifts the cow into orbit.
10. Gust launches the cow and it lands safely.
11. The chaser retreats before the tornado reaches it.
12. Destruction near the chaser generates `CAUGHT ON CAMERA` feedback.
13. Ordinary gameplay remains at or above the 45 FPS floor.
14. A five-minute stress run shows no runaway clutter or severe heat regression.

## Known compile-risk note

This pass has been source-reviewed through the repository connector, but no local Unity compiler is available in the current environment. The next cloud build is the authoritative compile test.
