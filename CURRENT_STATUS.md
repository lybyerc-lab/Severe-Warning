# Severe Weather Current Status

Last updated: 2026-07-31
Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`
Active game: HTML/WebGL `3.2.0 Live Coverage Edition`
Primary target: single-player Android landscape
Active source: `MechanicsLab/SevereWeather_3D_Lab.html`

## Canonical memory order

1. Current repository code and physical-device evidence
2. This status file
3. `MechanicsLab/README.md`
4. `Docs/DECISION_LOG.md`
5. `Docs/NO_DRIFT_POLICY.md`
6. `Docs/DEVICE_TEST_LOG.md`
7. Dated Unity and Godot checkpoint documents
8. `Docs/Archive/SEVERE_WEATHER_ALL_MARKDOWNS.md`

Important decisions and test evidence must be committed to the repository. Chat is working context, not durable project memory.

## Active implementation decision

The enjoyable HTML/WebGL game is the production gameplay source. Capacitor 8.5.0 now packages its local assets in a native Android wrapper instead of recreating the game in another 3D engine.

Unity and Godot source remain preserved as historical experiments and implementation references. They are not the active gameplay path. Reopen an engine port only if measured physical-device evidence proves that the wrapped HTML build cannot meet an explicit requirement.

## Locked product direction

The game is a humorous, replayable, mobile arcade destruction game in which the player is the storm.

- Android landscape is the primary target.
- Multiplayer is out of scope.
- The player directly controls Tornado, Supercell, or Derecho.
- Town and city districts must be visually and mechanically recognizable.
- Destruction should be immediate, readable, generous, and persistent.
- Humor comes from fictional signs, objects, weather reporting, vehicles, safe airborne animals, and environmental slapstick.
- People remain protected and off-limits as targets.
- News vans and storm chasers are invincible witnesses that film, report, reposition, and retreat. They are not enemies.
- The project may learn from classic city-destruction game structure but must use original storms, locations, jokes, art, progression, and identity.

## Current v3.2.0 slice

The current three-minute run contains:

1. Pine Ridge neighborhood
2. Main Street
3. County Fair blackout finale

Implemented systems include:

- district title transitions and compact mobile telemetry
- one randomized bonus challenge per district
- thirteen destructible comedy props with contextual callouts
- Pine Ridge yard props, Main Street signage/storefront props, and County Fair rides/concessions
- sequential substation activation at 0, 18, and 38 seconds into the finale
- persistent Neon Funnel cosmetic unlock through `localStorage`
- district scores, bonus completion, substation count, and cosmetic status on the results screen
- deterministic `?bot=true` playtest routing that understands district targets
- replay cleanup for world objects, hail, fragments, power poles, ruins, and ground swath
- four white satellite news vans and five yellow storm-chaser SUVs with distinct silhouettes
- safe-distance pursuit, orbiting observation positions, and emergency retreat behavior
- captured-on-camera bonuses triggered by real destruction events near a crew
- camera flashes, local-news headlines, radar crew markers, live footage telemetry, and results recap
- a global editorial cooldown that limits coverage to readable highlight moments

## Automated evidence

Browser playtesting of the exact v3.2.0 source completed a full Tornado run with:

- S+ grade
- all 3 storm objectives
- both landmarks
- all 3 district challenges
- all 3 sequential substations
- Neon Funnel unlock
- successful replay reset
- 8 captured media moments and `+1289` awarded footage points
- approximately 60 FPS during the full-size run
- no observed rendering or interaction failure

Responsive validation at `844x390` confirmed that the `95x95` joystick, three `50x50` action buttons, radar, footage telemetry, compact HUD, challenge banner, and game view fit the landscape viewport. The expanded results card measured `313.25` pixels high and ended at `351.625`, inside the 390-pixel viewport.

## Evidence boundary

The Android wrapper has been created and synchronized with an offline web bundle. The packaged HTML passed a separate Chromium check at `844x390`: local Inter and Outfit fonts loaded, the document had no horizontal or vertical overflow, and the HUD/game view rendered correctly.

The v3.2.0 build has not yet been:

- compiled as an Android APK or AAB
- run inside Android System WebView
- tested with physical touchscreen input
- checked for sustained device heat, battery use, audio behavior, pause/resume, or WebGL context recovery
- accepted on a physical Android device

Do not describe Android packaging or physical-device acceptance as complete until those gates pass.

## Immediate next action

1. Move or clone this repository to a permitted machine with Node 22+, Android Studio, Android SDK 36, and a compatible JDK.
2. Run the documented dependency, bundle, sync, and Gradle commands in `Docs/ANDROID_PACKAGING.md`.
3. Install the debug APK on the target Android phone.
4. Record touch comfort, frame pacing, heat, battery, audio, pause/resume, save persistence, orientation, and browser-back results.
5. Optimize only measured device problems before expanding the campaign.

This work PC is intentionally not being modified around company software restrictions.
