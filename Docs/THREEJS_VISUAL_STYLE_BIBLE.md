# Three.js Visual Style Bible

Date: 2026-08-08
Status: active visual-production law
Branch: `agent/threejs-visual-production-foundation`
Gameplay/fun baseline: `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`
Sealed Stage 1 source: `f2060dff08ddb9df9f90ecd245940d8db86c7266`

## Art thesis

**Storm-charged stylized Americana.**

Severe Weather Warning should feel handcrafted, dramatic, readable at tornado speed, and cinematic when the camera gets close. It is not aiming for photorealism, toy-plastic low-poly, pixel art, or a collage of unrelated asset packs.

The visual promise is:

**beautiful at a glance, readable at speed, cinematic up close.**

## Non-negotiable visual laws

1. **One visual universe.** Gameplay, opening cinematic, results, Cow 17, Moo Brew props, buildings, weather, and destruction must look like they belong to the same production.
2. **The storm is the hero.** Composition, lighting, VFX, and environment motion should make the player feel powerful without hiding where they are driving.
3. **Authored places beat procedural clutter.** Prairie Junction, farms, roads, landmarks, storefronts, and utility corridors need recognizable silhouettes and local character.
4. **Material identity must survive motion.** Painted wood, galvanized metal, brick, concrete, asphalt, glass, soil, crops, and vegetation must remain distinguishable while moving quickly.
5. **Destruction exposes anatomy.** Damage should reveal wall layers, framing, roofing, trim, glass, doors, interiors, signs, and secondary debris rather than one generic large chunk.
6. **Humor lives inside the world.** Moo Brew and Cow 17 can be funny without becoming a separate cartoon layer.
7. **Mobile restraint is part of the art direction.** Richness comes from hierarchy, lighting, smart texture reuse, sprites/cards, instancing, and strong silhouettes rather than brute-force geometry.
8. **No gameplay retuning for art convenience.** Steering, damage truth, abilities, score, timer, campaign, camera feel, and safe-animal law remain protected.

## Visual pillars

### 1. Severe-weather light

The sky should change the emotional temperature of the whole scene.

- Pre-warning: warm late-day farm light, long readable shadows, comfortable local color.
- Warning transition: cooler blue-gray/cyan-green storm influence, reduced warmth, harder contrast in cloud breaks.
- Touchdown: deep storm mass, directional light shafts/bright edges where useful, warm practical lights and signage as small anchors.
- Active run: enough contrast to read roads, targets, debris, and storm silhouette at speed.
- Lightning: brief high-value event, not constant white-screen noise.

### 2. Handcrafted Heartland places

A location should be identifiable from silhouette before the player reads a label.

- Farms: barn/house/silo/windbreak/crop-field relationships, fences, utility poles, equipment, Moo Brew details.
- Small-town streets: storefront rhythm, awnings/signs, alleys, roofline variation, parking/curb language, utility clutter with restraint.
- Industrial edges: larger spans, loading areas, metal cladding, tanks, service yards, heavier destruction vocabulary.
- Landmarks: a few memorable forms per district rather than dozens of equally loud props.

### 3. Material honesty

Materials should communicate what will break and how it should feel.

- Painted wood: directional grain/board rhythm, chipped edges sparingly, warm interior breakup.
- Galvanized/painted metal: cooler specular response, thin-sheet edge language, roof/panel identity.
- Brick/masonry: heavier, more grounded pieces, readable mortar/detail at medium distance without noisy tiling.
- Concrete: broad value shapes, dirt/weathering near ground/contact zones, limited roughness variation.
- Glass: readable reflections/tint but never invisible; damage creates fine secondary fragments or stylized shards within budget.
- Asphalt/soil/crops: strong large-scale value and hue separation so roads remain navigable during storm effects.

### 4. Layered motion

The world should look alive before the player presses an ability.

Use a hierarchy of inexpensive motion:

- slow cloud/storm layers;
- vegetation sway and directional gust response;
- rain streak cards/particles;
- dust and ground grit near the funnel;
- lightweight litter/debris motes;
- occasional larger readable airborne props;
- destruction dust puffs and material-specific secondary particles.

VFX must frame gameplay, not obscure steering.

### 5. Readable destruction spectacle

Ordinary tornado contact must look rewarding.

- Primary pieces communicate the building's anatomy.
- Secondary pieces sell force and material breakup.
- Fine VFX sells energy and scale.
- Pull/Gust/Zap amplify the scene; they are not the only way to get satisfying visual damage.
- Roofs are part of the breakup, not the whole breakup.

## Shape and detail hierarchy

At gameplay distance, prioritize in this order:

1. district/road layout;
2. building and landmark silhouette;
3. material/color blocks;
4. major architectural features;
5. damage anatomy;
6. small props/decals;
7. micro-surface detail.

If a detail disappears at gameplay speed and does not help the cinematic, it does not deserve a large mobile budget.

## Asset-pack integration rule

External assets are **raw ingredients**, never the art director.

Before an external sprite/model is used in production it must pass:

- provenance/license gate;
- silhouette/style fit;
- palette/material fit;
- scale/pivot/orientation normalization;
- mobile cost check;
- local/offline packaging;
- modification/restyling where needed;
- exact path/checksum recording in the asset provenance manifest.

Do not import entire packs because one item is useful. Bring in only the pieces that earn their place.

## Sprite/card lane

Sprites are especially valuable for mobile-friendly visual richness:

- dust puffs and dust sheets;
- rain streaks and splash accents;
- debris wisps/grit;
- cloud cards/distant haze layers;
- light cookies/glows where appropriate;
- impact flashes and tiny material breakup accents;
- foliage cards only where they blend with the 3D vegetation language.

Sprites should not replace hero building anatomy or turn the 3D game into a 2D collage.

## Hero visual acceptance slice

Before widening the conversion, build one deliberately beautiful representative slice containing:

- one Hart Farm block with Cow 17/Moo Brew identity;
- one Prairie Junction street/storefront view;
- road/terrain separation;
- production sky and storm-light treatment;
- representative vegetation/utility props;
- one destructible authored structure with staged readable anatomy;
- dust/rain/debris VFX cards;
- a deterministic pristine view and damage view.

This slice becomes the visual yardstick for the rest of the game and the opening cinematic.

### Hero-slice acceptance questions

- Does this look authored rather than prototype-generated?
- Is the same scene attractive both still and at gameplay speed?
- Can the player immediately read road direction and target silhouettes?
- Do materials remain distinct under storm lighting?
- Does ordinary contact destruction look satisfying without an ability?
- Do VFX add scale without hiding steering?
- Could the opening cinematic cut directly into this world without a visual downgrade?
- Is performance still appropriate for the Galaxy target?

## Opening cinematic target

The canonical sequence remains:

newspaper -> farm reveal -> Cow 17 drinks Moo Brew -> weather/radio shift -> Cow 17 double take -> chickens scatter -> barn roof/tornado touchdown -> direct gameplay handoff.

The final cinematic must use the same production world, assets, materials, lighting, weather, Cow 17 rig, and VFX language as gameplay. The current DOM/CSS presentation is a temporary story prototype, not the final look.

Cinematic goals:

- beautiful establishing composition;
- warm-to-threatening color transition;
- tactile Moo Brew/Cow 17 close beat;
- visible wind escalation in the environment;
- impressive tornado reveal and touchdown;
- no loading break;
- warning clock starts only at gameplay handoff;
- immediate post-handoff controls remain identical to the accepted Three.js game.

## Definition of beautiful enough to widen

The visual pipeline widens only when the owner can look at the hero slice and say all of the following are true:

- it no longer reads as a prototype;
- the game still feels as fun as the sealed Three.js reference;
- the environment has a coherent visual identity;
- the tornado and destruction feel powerful;
- the opening could be shot in the same world;
- the mobile target remains credible.

Until then, stay on the representative slice and improve the pipeline rather than spreading unfinished art across the whole map.
