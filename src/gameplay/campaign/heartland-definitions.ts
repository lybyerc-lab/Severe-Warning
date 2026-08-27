import type { CampaignDefinition, CampaignStopDefinition, RegionalModifierDefinition } from './campaign-contracts';

export const HEARTLAND_REGIONAL_MODIFIER: RegionalModifierDefinition = Object.freeze({
  id: 'heartland-homestead-surge',
  name: 'HEARTLAND HOMESTEAD SURGE',
  description: '+10% score bonus on agricultural structures, barns, and silo banks.',
  targetCategory: 'agricultural',
  bonusMultiplier: 1.10,
});

export const COASTAL_REGIONAL_MODIFIER: RegionalModifierDefinition = Object.freeze({
  id: 'waterspout-marine-surge',
  name: 'WATERSPOUT & MARINE SURGE',
  description: '+15% score bonus on maritime craft, shrimp docks, piers, and water targets.',
  targetCategory: 'marine',
  bonusMultiplier: 1.15,
});

export const METRO_REGIONAL_MODIFIER: RegionalModifierDefinition = Object.freeze({
  id: 'power-grid-skyscraper-surge',
  name: 'POWER GRID & SKYSCRAPER SURGE',
  description: '+20% chain bonus on electrical utility infrastructure, substations, and towers.',
  targetCategory: 'utility',
  bonusMultiplier: 1.20,
});

export const HEARTLAND_STOP_DEFINITIONS: readonly CampaignStopDefinition[] = Object.freeze([
  Object.freeze({
    id: 'lincoln-county',
    index: 0,
    regionId: 'heartland',
    title: 'LINCOLN COUNTY',
    shortTitle: 'LINCOLN',
    station: 'KSWX 8',
    brief: 'The original Tornado Alley county run. Three districts, rolling pastures, and nervous insurance adjusters.',
    scoreTarget: 8000,
    scoreMultiplier: 1,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'PINE RIDGE', subtitle: 'Neighborhood touchdown. Mind the lawn ornaments.' }),
      Object.freeze({ title: 'MAIN STREET', subtitle: 'Signs, shops and questionable insurance coverage.' }),
      Object.freeze({ title: 'COUNTY FAIR', subtitle: 'Blackout finale. The funnel cake stand had a good run.' }),
    ]),
    defaultNextStopId: 'prairie-junction',
    regionalModifier: HEARTLAND_REGIONAL_MODIFIER,
  }),
  Object.freeze({
    id: 'prairie-junction',
    index: 1,
    regionId: 'heartland',
    title: 'PRAIRIE JUNCTION',
    shortTitle: 'PRAIRIE',
    station: 'KPRJ 4',
    brief: 'Open-country prairie crosswind. Long sightlines, rail crossings, and a 10% broadcast score bonus.',
    scoreTarget: 14000,
    scoreMultiplier: 1.1,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'WINDMILL ROW', subtitle: 'The prairie has room to breathe. The sheds do not.' }),
      Object.freeze({ title: 'PRAIRIE JUNCTION', subtitle: 'A small rail town with a large debris forecast.' }),
      Object.freeze({ title: 'RODEO GROUNDS', subtitle: 'Live cameras, loose gates and one doomed scoreboard.' }),
    ]),
    defaultNextStopId: 'grain-belt',
    regionalModifier: HEARTLAND_REGIONAL_MODIFIER,
  }),
  Object.freeze({
    id: 'grain-belt',
    index: 2,
    regionId: 'heartland',
    title: 'GRAIN BELT',
    shortTitle: 'GRAIN BELT',
    station: 'KGBN 11',
    brief: 'Industrial harvest corridor. Heavy silo banks and foundry metal pay a 15% chain-reaction bonus.',
    scoreTarget: 22000,
    scoreMultiplier: 1.15,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'SILO COUNTY', subtitle: 'Grain storage meets aggressive atmospheric redistribution.' }),
      Object.freeze({ title: 'FOUNDRY ROW', subtitle: 'Sheet metal, power lines and absolutely no indoor voice.' }),
      Object.freeze({ title: 'HARVEST EXPO', subtitle: 'The combines are parked. The grandstands are reconsidering.' }),
    ]),
    defaultNextStopId: 'state-fair-finale',
    regionalModifier: HEARTLAND_REGIONAL_MODIFIER,
  }),
  Object.freeze({
    id: 'state-fair-finale',
    index: 3,
    regionId: 'heartland',
    title: 'STATE FAIR',
    shortTitle: 'STATE FAIR',
    station: 'LIVE NETWORK',
    brief: 'Heartland championship finale. Maximum cameras, spinning Ferris wheel, and 25% score bonus.',
    scoreTarget: 28000,
    scoreMultiplier: 1.25,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'MIDWAY MILE', subtitle: 'Every prize booth is now a wind-tunnel experiment.' }),
      Object.freeze({ title: 'EXHIBITION ROW', subtitle: 'Live television has requested a wider shot.' }),
      Object.freeze({ title: 'STATE FAIR FINALE', subtitle: 'Maximum mayhem beneath the championship lights.' }),
    ]),
    defaultNextStopId: null,
    regionalModifier: HEARTLAND_REGIONAL_MODIFIER,
  }),
]);

export const COASTAL_STOP_DEFINITIONS: readonly CampaignStopDefinition[] = Object.freeze([
  Object.freeze({
    id: 'bayou-bend',
    index: 0,
    regionId: 'coastal',
    title: 'BAYOU BEND MARINA',
    shortTitle: 'BAYOU BEND',
    station: 'KSWX COASTAL 6',
    brief: 'Gulf marshlands and stilt fish cabins. Water channels, wooden piers, and waterspout potential.',
    scoreTarget: 10000,
    scoreMultiplier: 1.10,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'PELICAN ROW', subtitle: 'Stilt cabins and shrimp docks with waterspout potential.' }),
      Object.freeze({ title: 'SHRIMP SHACK REACH', subtitle: 'Bait shops and marina docks taking high-velocity spray.' }),
      Object.freeze({ title: 'BAYOU HARBOR', subtitle: 'Pier finale. The channel buoys are airborne.' }),
    ]),
    defaultNextStopId: 'pelican-key',
    regionalModifier: COASTAL_REGIONAL_MODIFIER,
  }),
  Object.freeze({
    id: 'pelican-key',
    index: 1,
    regionId: 'coastal',
    title: 'PELICAN KEY BOARDWALK',
    shortTitle: 'PELICAN KEY',
    station: 'BAYOU ACTION 13',
    brief: 'Tropical barrier island beachfront. Boardwalk shops, swaying palm trees, and ocean surge winds.',
    scoreTarget: 18000,
    scoreMultiplier: 1.20,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'BOARDWALK MILE', subtitle: 'Arcade piers, souvenir shacks and flying umbrellas.' }),
      Object.freeze({ title: 'PALM BLVD', subtitle: 'Tropical storefronts and swaying palm trees in 100mph gusts.' }),
      Object.freeze({ title: 'SEAFOOD WHARF', subtitle: 'Wharf finale. The live crab tanks are taking flight.' }),
    ]),
    defaultNextStopId: 'port-delta',
    regionalModifier: COASTAL_REGIONAL_MODIFIER,
  }),
  Object.freeze({
    id: 'port-delta',
    index: 2,
    regionId: 'coastal',
    title: 'PORT DELTA REFINERY',
    shortTitle: 'PORT DELTA',
    station: 'GULF NETWORK LIVE',
    brief: 'Deepwater industrial terminal. Massive spherical fuel storage, shipping gantries, and coastal transformers.',
    scoreTarget: 28000,
    scoreMultiplier: 1.35,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'TANK FARM', subtitle: 'Heavy industrial storage spheres and chemical cooling towers.' }),
      Object.freeze({ title: 'GANTRY DOCKS', subtitle: 'Cargo cranes and container stacks with maximum chain potential.' }),
      Object.freeze({ title: 'DEEPWATER GRID', subtitle: 'High-voltage coastal substation and industrial transformer finale.' }),
    ]),
    defaultNextStopId: null,
    regionalModifier: COASTAL_REGIONAL_MODIFIER,
  }),
]);

export const METRO_STOP_DEFINITIONS: readonly CampaignStopDefinition[] = Object.freeze([
  Object.freeze({
    id: 'downtown-core',
    index: 0,
    regionId: 'metro',
    title: 'SKYLINE PLAZA',
    shortTitle: 'SKYLINE',
    station: 'METRO 4 NEWS',
    brief: 'High-density urban asphalt canyon. Glass-and-steel skyscrapers, transit hubs, and corporate plazas.',
    scoreTarget: 18000,
    scoreMultiplier: 1.25,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'FINANCIAL ROW', subtitle: 'Glazed corporate headquarters taking high-altitude sheer.' }),
      Object.freeze({ title: 'TRANSIT CONCOURSE', subtitle: 'Commuter buses and elevated light rail in 110mph gusts.' }),
      Object.freeze({ title: 'TOWER PLAZA', subtitle: 'Skyscraper climax. Rooftop broadcast antennas are taking flight.' }),
    ]),
    defaultNextStopId: 'rail-terminal',
    regionalModifier: METRO_REGIONAL_MODIFIER,
  }),
  Object.freeze({
    id: 'rail-terminal',
    index: 1,
    regionId: 'metro',
    title: 'GRAND CENTRAL TERMINAL',
    shortTitle: 'GRAND CENTRAL',
    station: 'ACTION 9 METRO',
    brief: 'Grand metropolitan railway junction. Multi-tier freight stacks, overhead wire catenaries, and historic concourses.',
    scoreTarget: 30000,
    scoreMultiplier: 1.40,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'SWITCHING YARDS', subtitle: 'Locomotives and multi-tier freight stacks taking impact.' }),
      Object.freeze({ title: 'GANTRY CROSSING', subtitle: 'Overhead rail electrical masts and high-voltage feeder grids.' }),
      Object.freeze({ title: 'CENTRAL DEPOT', subtitle: 'Historic terminal hall with glass concourse skylights.' }),
    ]),
    defaultNextStopId: 'broadcast-heights',
    regionalModifier: METRO_REGIONAL_MODIFIER,
  }),
  Object.freeze({
    id: 'broadcast-heights',
    index: 2,
    regionId: 'metro',
    title: 'BROADCAST HEIGHTS',
    shortTitle: 'TRANSMITTER ROW',
    station: 'NETWORK HQ',
    brief: 'Metropolitan transmitter summit. 300-foot telecommunications lattice towers, satellite dishes, and network headquarters.',
    scoreTarget: 45000,
    scoreMultiplier: 1.60,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'DISH RIDGE', subtitle: 'Satellite earth stations and microwave relay masts.' }),
      Object.freeze({ title: 'TOWER SUMMIT', subtitle: '300-foot guyed broadcast masts with high-voltage warning lights.' }),
      Object.freeze({ title: 'BROADCAST PEAK', subtitle: 'Live television headquarters during a Category 5 touchdown.' }),
    ]),
    defaultNextStopId: null,
    regionalModifier: METRO_REGIONAL_MODIFIER,
  }),
]);

export const HEARTLAND_CAMPAIGN_DEFINITION: CampaignDefinition = Object.freeze({
  id: 'heartland-v1',
  regionId: 'heartland',
  title: 'Heartland Campaign',
  regionalModifier: HEARTLAND_REGIONAL_MODIFIER,
  stops: HEARTLAND_STOP_DEFINITIONS,
});

export const COASTAL_CAMPAIGN_DEFINITION: CampaignDefinition = Object.freeze({
  id: 'coastal-v1',
  regionId: 'coastal',
  title: 'Coastal Bayou Campaign',
  regionalModifier: COASTAL_REGIONAL_MODIFIER,
  stops: COASTAL_STOP_DEFINITIONS,
});

export const METRO_CAMPAIGN_DEFINITION: CampaignDefinition = Object.freeze({
  id: 'metro-v1',
  regionId: 'metro',
  title: 'Metro Row Campaign',
  regionalModifier: METRO_REGIONAL_MODIFIER,
  stops: METRO_STOP_DEFINITIONS,
});

export const ALL_CAMPAIGN_DEFINITIONS: readonly CampaignDefinition[] = Object.freeze([
  HEARTLAND_CAMPAIGN_DEFINITION,
  COASTAL_CAMPAIGN_DEFINITION,
  METRO_CAMPAIGN_DEFINITION,
]);
