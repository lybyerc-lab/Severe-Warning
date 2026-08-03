# Severe Weather Product Vision and Roadmap

Last updated: 2026-07-31
Status: Approved product direction; v5.0.0 foundation active
Repository: `lybyerc-lab/Severe-Warning`
Primary platform: Android landscape
Active gameplay source: `MechanicsLab/SevereWeather_3D_Lab.html`
Android packaging: local Capacitor wrapper

## Product promise

Severe Weather is a humorous, replayable, mobile arcade destruction game in which the player directly controls the storm.

The visual and tonal target is a modernized mid-2000s arcade destruction game: bold silhouettes, readable buildings, exaggerated but physical destruction, expressive weather, local-news spectacle, and safe environmental slapstick. The game should feel like a lovingly remastered 2006-era arcade destruction title rather than a realistic disaster simulator or a flat cartoon.

The game must remain enjoyable first. Graphics, sound, progression, regions, and presentation exist to strengthen direct storm play rather than replace it with management systems.

## Non-negotiable design laws

1. The player is the storm.
2. Direct action comes before management systems.
3. Mobile Android play is the final authority for controls, readability, heat, battery, sound, and frame pacing.
4. People remain protected, absent from destruction targets, and never become casualties.
5. Animals are invincible, non-targetable, visibly unharmed, and may be launched only for safe slapstick spectacle.
6. Media crews are invincible witnesses, never enemies or destruction targets.
7. The response is a media circus, not a battle.
8. There are no hostile police, fire, guard, or military vehicles.
9. Destruction must be immediate, readable, generous, persistent, and materially distinct.
10. Every storm form or variant must change visuals, positioning, timing, or damage behavior rather than merely recolor the same mechanics.
11. Regional campaigns must change architecture, props, weather interactions, audio, news presentation, and play decisions.
12. The GitHub repository is the durable project memory. Chat is working context only.

## Locked identity

### Visual direction

Use a hybrid arcade-illustrated rendering style:

- three-band or soft toon lighting on buildings, vehicles, trees, and comedy props
- selective outlines on important targets, pickups, media vehicles, substations, and the player storm
- strong roof, window, trim, foundation, and contact shadows
- district-specific color scripts
- atmospheric distance haze and weather depth
- exposed interiors and skeletal damage states
- larger readable debris pieces instead of fragment confetti
- exaggerated impact flashes, dust rings, brief camera impulses, and major-event hit pauses

Do not apply expensive global outlines or heavy post-processing until physical Android tests prove acceptable performance.

### Tone

The world reacts with local-news urgency, environmental comedy, fictional businesses, safe airborne animals, and exaggerated physical reactions. Humor must never rely on real victims, real disasters, injuries, or cruelty.

### Moo Brew

`Moo Brew` is the approved fictional coffee brand used in the farm opening cinematic and throughout the game world. It may appear on cups, signs, vending machines, billboards, newspaper advertisements, unlockables, and recap imagery.

## Opening cinematic: Moo Brew touchdown

Target length: 10 to 15 seconds. Skippable after the first viewing. Built in the same Three.js runtime and visual language as gameplay.

1. A newspaper tumbles along a rural road as wind increases.
2. The headline warns that severe weather is possible.
3. The paper blows into the camera and sticks to the screen.
4. It peels away to reveal a peaceful farmyard.
5. A cow drinks from a Moo Brew cup while chickens and other farm animals gather nearby.
6. The weather radio crackles, straw moves, and the cloud base begins rotating.
7. The cow takes another sip, notices the forming funnel, and performs a slow double take.
8. The Moo Brew cup drops in exaggerated slow motion with the logo facing camera.
9. The cow begins an action-hero escape while chickens scatter.
10. The barn roof starts peeling apart as the tornado touches down.
11. The camera rises and swings into the tactical gameplay angle.
12. The HUD fades in and control transfers directly to the player without a loading break.

Alternate newspaper headlines should appear on repeat plays. The ending sequence should mirror the opening with a generated newspaper recap based on actual run events.

## Media presence

Media are the active witnesses and recurring comic chorus.

Approved behavior:

- white satellite news vans
- yellow storm-chaser SUVs
- safe observation positioning
- retreat behavior when the storm closes in
- camera flashes and captured-on-camera bonuses
- rotating satellite dishes and camera rigs
- road-aware repositioning
- live headlines based on real destruction events
- optional high-altitude news helicopter or camera drone later
- regional reporters and station personalities
- end-of-run footage recap

Rejected behavior:

- hostile vehicles
- weapons directed at the storm
- combat escalation
- destruction scoring for media or emergency crews
- enemy-coded police, fire, guard, or military resistance

## Ability presentation contract

### Grid Zap

Grid Zap must show electricity moving through real infrastructure.

- strike the first conductive target
- arc visibly to nearby conductive targets
- travel along actual power lines using a lightweight electrical network graph
- pulse through pole-to-pole wire segments
- flicker insulators, streetlights, signs, and transformers
- use a bright central filament, blue outer glow, branching micro-arcs, ionized trail, sparks, and delayed thunder
- end major chains with a transformer pop, substation surge, or district blackout event

### Gust

Gust must create a visible wind field and a readable material response.

- translucent distortion cone or pressure wave
- dust, leaves, and grass moving with the blast
- small trees bending progressively by distance
- branches shaking after the gust passes
- signs and loose metal wobbling
- light props sliding or tipping
- damaged roof panels rattling or detaching
- small objects receiving a slight physical push
- large intact structures resisting ordinary gusts

### Pull

Pull must affect the environment before objects detach.

- nearby grass bends inward
- leaves and grit spiral toward the funnel
- signs twist toward the storm
- roof panels and loose pieces rattle first
- light debris enters readable orbital bands
- dust thickens near the touchdown point
- animals brace, slide, lift, orbit, and land safely

## Sound direction

The current placeholder sound layer must be replaced by a realistic, layered, mobile-conscious weather soundstage.

### Continuous storm layers

- distant low wind
- close rushing air
- low-frequency structural rumble
- debris hiss and intermittent impacts
- touchdown dirt and grit
- stronger suction layer during Pull
- deeper and wider sound as EF progression increases

### Ability layers

Grid Zap:

- electrical snap
- traveling line crackle
- transformer buzz
- target-to-target arc impacts
- thunder tail
- power-down hum

Gust:

- pressure-like wind surge
- stereo leaf and grit movement
- tree creaks
- loose-metal rattles
- distant impacts

Pull:

- rising suction whistle
- swirling debris
- roof fasteners pulling loose
- deep vortex pulse
- Doppler-like orbiting movement

### Material destruction families

- wood cracking and splintering
- sheet metal bending and tearing
- glass breaking
- brick and masonry collapse
- concrete impacts
- utility poles snapping
- transformers failing
- vehicles scraping and landing
- carnival equipment clattering
- trees cracking
- roof sheets tearing free

Use capped simultaneous voices, distance attenuation, modest pitch variation, several samples per material, major-event priority, and ambience ducking beneath important news announcements. Audio files must be local and commercially usable through CC0, public-domain, commissioned, purchased, or otherwise verified licensing.

## Safe animal slapstick

Animals are spectacle participants, not targets.

### Cow behavior

1. Notice increasing wind.
2. Brace and slide.
3. Lift into a slow readable arc.
4. Rotate with exaggerated cartoon weight.
5. Bounce safely on dirt, hay, water edge, or another soft landing zone.
6. Stand, shake off, and continue wandering.

Approved bonuses include:

- AIRBORNE BOVINE
- SAFE LANDING
- CAPTURED ON CAMERA
- PASTURE PRESS CONFERENCE
- BARNYARD BEDLAM

### Chicken behavior

- flap furiously while making limited progress
- tumble into bounded feather puffs
- bounce from awnings or hay bales
- glide briefly
- run away in single-file panic afterward

Particle counts must remain bounded for mobile performance.

## Regional campaign structure

Use compact replayable regional campaigns rather than one bloated map.

### Plains / Heartland

The existing county becomes the foundation.

Possible levels:

- Lincoln County
- Prairie Junction
- Grain Belt
- River County
- Metro Fringe
- State Fair finale

Identity:

- farms, barns, silos, grain elevators, rail crossings, trailer parks, water towers, county fairs, wide power corridors, and open tornado movement

### South / Coastland

Possible environments:

- bayou town
- marina
- boardwalk
- port district
- stilt-home neighborhood
- refinery edge
- beach carnival

Identity:

- waterspouts, spray, boats, docks, bridges, palms, wet surfaces, heavy rain, and coastal media coverage

### East Coast

Possible environments:

- old downtown
- rowhouse neighborhood
- rail corridor
- harbor
- dense commercial district
- bridge finale

Identity:

- tight streets, taller structures, dense utility networks, rooftop equipment, scaffolding, awnings, and high chain-reaction density

### West Coast

Possible environments:

- foothill town
- dry valley
- coastal city
- industrial port
- wind farm
- wildfire edge

Identity:

- steep terrain, hillside roads, dry vegetation, turbines, power corridors, dust, smoke, and fewer but more vertical routes

Every region requires its own architecture, palette, props, animals, news station, soundtrack, finale, and storm presentation.

## Tornado forms and special variants

### Visual forms and progression

- rope
- cone
- stovepipe
- wedge
- multi-vortex
- dusty plains tornado
- rain-wrapped tornado
- nighttime lightning-lit tornado

These may provide modest stat or behavior differences but primarily communicate growth, region, and atmosphere.

### Waterspout

Reserved for Coastland after water interaction exists. It should begin over water, pull spray into the funnel, disturb boats and docks, and change presentation after landfall.

### Twin tornadoes

Preferred as a temporary advanced evolution or ultimate ability. A smaller satellite funnel orbits the main tornado, widens Pull coverage, and strikes secondary targets while retaining one control scheme.

### Fire whirl

Reserved for the West Coast fire-system milestone. It requires real heat distortion, ember transport, appropriate ignition, smoke, firebreaks, wet interruption, unique audio, and news behavior. It must not be an orange recolor.

### Multi-vortex

A strong near-term advanced form. Small suction vortices orbit the parent funnel, creating pulsing damage zones, alternating debris paths, and readable impact bursts.

## Build roadmap

### v4.3.1 - Mobile Comfort and Identity

- raise movement joystick
- reduce NOAA banner height to approximately two-thirds of its current mobile footprint
- realign HUD and toast offsets
- remove enemy-vehicle declaration and hostile-response terminology
- synchronize all version labels
- rename APK and checksum artifacts with the actual version and build label
- verify one complete physical Android run
- record touch comfort, frame pacing, heat, audio, menu behavior, and replay cleanup

### v4.4.0 - Illustrated Storm Feedback

- introduce soft toon lighting and district palette scripts
- add selective outlines only where they improve readability
- improve damage interiors and readable debris
- implement visible Grid Zap infrastructure propagation
- implement Gust wind field, tree bending, and light-object push
- implement Pull environmental anticipation and orbit readability
- preserve mobile performance through bounded effects

### v4.5.0 - Severe Weather Soundstage

- replace placeholder procedural sound with layered local audio
- add realistic wind, thunder, electrical, material, vehicle, animal, and destruction families
- add dynamic mixing, priority, attenuation, and voice limits
- verify licensing and physical-device behavior

### v4.6.0 - Farmyard Mayhem

- add authored farm destruction
- add invincible cows and chickens
- implement safe launch, bounce, landing, and recovery
- add Moo Brew opening cinematic
- add generated newspaper recap
- add animal spectacle and captured-footage bonuses

### v5.0.0 - Heartland Campaign Foundation

- convert the current county into a reusable regional campaign template
- establish level selection through a television weather map
- add progression between compact Heartland levels
- establish reusable region data, news, palette, prop, audio, and finale contracts

### Later regional milestones

- South / Coastland with waterspout systems
- East Coast dense-infrastructure campaign
- West Coast terrain and fire-system campaign
- twin-funnel and multi-vortex advanced tornado forms

## Acceptance principle

No roadmap item is accepted because code exists or a cloud build succeeds. Acceptance requires the exact build to be installed and played on a real Android device, with evidence recorded in the repository.
