# Living Region Density Specification

## Vertical-slice target

- Approximate playable footprint: 1.2 km by 1.2 km
- Districts: farmland, small town, suburb, commercial corridor, industrial district, civic center
- One major landmark per district
- Roads, utility lines, drainage, and property access must visibly connect districts

## No-dead-zone rules

During normal movement, at least one of these should occur every three seconds:

- a destructible object reacts
- an environmental surface reacts
- a chain-reaction opportunity is visible
- a destination landmark is visible
- an infrastructure line gives navigational direction
- terrain changes storm Power or Stability
- the player is making a meaningful route choice

## Navigation visibility

From County High view, the player should normally see:

- the current district
- at least one adjacent target cluster
- one route or infrastructure connector
- one meaningful landmark or objective direction

## Rural density

Rural does not mean empty. Rural chunks use:

- crops
- farmhouses
- barns
- silos
- grain handling
- irrigation
- equipment
- windbreaks
- ponds and drainage
- substations and transmission corridors
- roads and rail crossings

## Urban density

Urban chunks use overlapping interaction layers:

- buildings
- parked and moving vehicles
- signs
- glass
- rooftop equipment
- utilities
- trees and street furniture
- drainage
- power and communication networks

## Validation

The graybox runtime reports nearest-target spacing. Final validation also requires human play, because environmental reactions and visible landmarks can make a transition meaningful even when structures are farther apart.
