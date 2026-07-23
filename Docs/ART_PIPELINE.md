# Production Art Pipeline

## Tools

- Blender for modeling and destruction-ready asset construction
- Unity 6.3 URP for lighting, materials, VFX, LOD, streaming, and device profiling
- Image editor or texture-authoring tool for atlases, trim sheets, masks, and decals

## Scale and units

- Blender and Unity use meters
- Asset origins sit at ground-contact pivots
- Forward direction is documented per asset category
- Buildings, vehicles, infrastructure, vegetation, and storms share one physical scale sheet

## Modular kits

### Residential

- wall segments
- corners
- doors
- windows
- roof segments
- porches
- garages
- foundations
- gutters and vents

### Commercial and industrial

- storefront bays
- glass panels
- loading doors
- rooftop equipment
- metal wall panels
- tanks, pipes, fencing, and substations

### Rural

- barns
- sheds
- silos
- grain bins
- irrigation
- greenhouses
- equipment pads
- field-edge props

## Material strategy

- reusable trim sheets
- atlas textures
- vertex-color variation
- decals for dirt, wetness, hail, cracks, burns, and storm scars
- consistent texel density
- district-specific palette variation without breaking material identity

## Destruction-ready asset rules

Each important asset provides:

- intact parent mesh
- detachable components
- stressed visual cues
- damaged replacements
- collapse proxy
- rubble and wreckage set
- collision proxy
- LOD0, LOD1, LOD2, and distant proxy

## Performance rules

- GPU instancing for repeated props
- mesh LOD and district HLOD
- texture atlases and trim sheets
- pooled debris and particles
- simplified collision
- mobile-first shader variants
- no per-frame material instantiation
