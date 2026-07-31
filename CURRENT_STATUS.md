# Severe Weather Current Status

Last updated: 2026-07-31
Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`
Active game: HTML/WebGL `3.3.0 High Country Edition`
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

## Current v3.3.0 slice

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
- a continuous height-mapped county instead of four flat ground tiles
- raised Pine Ridge terrain, a broad Main Street rise, County Fair knolls, and an eastern creek/drainage cut
- terrain-following roads, shoulders, markings, props, targets, ruins, animals, storm effects, and media vehicles
- instanced road markings and ridge silhouettes to preserve mobile draw-call discipline
- contour cues, hemisphere fill light, and filmic tone mapping for stronger depth separation

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

## Android build and physical evidence

GitHub Actions run `30653818627` successfully compiled the v3.2.0 Capacitor wrapper at commit `d2b8fde67b76e7d5d5faa7991f9984801586836b`. The downloaded APK SHA-256 was `35d8996f6d3bdc30dafdbae42b395efb89a99d200f4444e2d7d922024ab6963c`.

The user installed that APK on a Galaxy S26 Ultra. It looked and played like the HTML build and completed a full Tornado run with an `S+` rank, score `23621`, objectives `3/3`, landmarks `2/2`, substations `3/3`, bonus challenges `3/3`, seventeen media moments, and the Neon Funnel unlock.

This accepts the v3.2.0 wrapper strategy and high-end-phone gameplay parity. It does not prove lower-end performance, broad WebView compatibility, sustained heat/battery behavior, or that the new v3.3.0 terrain pass has passed on-device.

## Current browser evidence

The v3.3.0 offline bundle completed a full automated Tornado run at approximately 60 FPS with zero observed console warnings or errors. The run earned `S+`, score `23016`, all three objectives, both landmarks, all three substations, all three district bonuses, seven media moments, `+1067` footage, and retained the Neon Funnel. Retry returned to Pine Ridge, hid the results overlay, reset the timer, and resumed scoring in a clean run. Terrain-following world objects, roads, storm movement, damage swath, debris, media crews, and all three district transitions remained intact.

## Immediate next action

1. Push the committed v3.3.0 release to `main`; the scoped workflow trigger will build the debug APK automatically.
2. Install the resulting v3.3.0 artifact.
3. Confirm the raised terrain remains readable and smooth on the Galaxy S26 Ultra.
4. Test one ordinary or older Android device before making broad performance claims.

This work PC is intentionally not being modified around company software restrictions.
