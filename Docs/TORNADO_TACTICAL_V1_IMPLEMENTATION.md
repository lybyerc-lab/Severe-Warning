# Tornado Tactical v1 Implementation

Status: IMPLEMENTED IN SOURCE, AWAITING UNITY CLOUD COMPILE AND ANDROID DEVICE TEST
Branch: `agent/tornado-tactical-v1`
Base: `c0963a89d2afb0f3fa917cfcc5e3d30e421a625a`
Version: `0.2.0`
Android version code: `10`

## Implemented systems

- Runtime Tornado Tactical auto-installer
- Tornado-only input lock that consumes the legacy storm-switch action
- HTML-inspired pulled-back tactical camera with movement look-ahead
- Three-minute Tornado run timer
- Player-facing tactical HUD
- Persistent event-aware warning ticker
- Breaking-news callout panel
- Destruction score bridge
- Combo growth and decay
- Score-driven EF-0 through EF-5 visual growth
- End-of-run weather report and replay button
- Dense 20-target test district
- Conductive test targets
- Water-tower and grain-silo test landmarks
- Invincible cow spawn
- Pull capture and visible animal orbit
- Gust animal launch
- Safe animal landing and out-of-bounds recovery
- Airborne-animal and safe-landing score events
- Safe storm-chaser SUV
- Storm-chaser filming distance zone
- Captured-on-camera score bonus
- Automatic storm-chaser retreat at unsafe range
- Tornado Pull, Gust, and Grid Zap retuning

## Runtime architecture

- `TornadoTacticalAutoInstaller`
- `TornadoTacticalDirector`
- `TacticalScoreBridge`
- `TacticalCameraOverride`
- `TacticalTestDistrictSpawner`
- expanded `InvincibleAnimal`
- expanded `TornadoController`

The existing Build 5.2 bootstrap remains the low-level world and storm foundation. The auto-installer layers the Tornado Tactical prototype onto that foundation after startup, disables the engineering HUD, and prevents the legacy storm switch from displacing the Tornado-first slice.

## Build identity

Expected player version: `0.2.0`
Expected Android version code: `10`
Default build label: `TTV1`

## Required verification

Source review is not a Unity compiler result. Before calling this milestone successful:

1. Run Unity Build Automation with the standard production pre-export method.
2. Confirm C# compilation and Android packaging succeed.
3. Install on the physical Android device.
4. Confirm the tactical camera frames the Tornado and nearby targets comfortably.
5. Confirm the storm-switch button cannot replace the Tornado.
6. Confirm Pull captures the cow.
7. Confirm Gust launches the captured cow.
8. Confirm the cow lands safely and can be captured again.
9. Confirm destruction increases score, combo, and EF rating.
10. Confirm the ticker and breaking-news messages update.
11. Confirm the chaser filming state awards captured-on-camera bonuses.
12. Confirm the chaser retreats before the Tornado reaches it.
13. Complete one three-minute run and restart from the results screen.
14. Record FPS, heat, control comfort, destruction comfort, and any visual obstruction.

## Known limitations

- Test targets and chaser are procedural primitives.
- The chaser currently uses simple distance-based positioning rather than road-path AI.
- The warning ticker changes by events but does not yet animate as a scrolling crawl.
- Score is bridged from the existing damage progression signal rather than a final typed event bus.
- The cow is a procedural placeholder without authored animation or audio assets.
- Objectives, radar, authored four-district map, opening broadcast, and full ending broadcast remain later parity tasks.
- Unity Cloud and physical-device results are not yet available.
