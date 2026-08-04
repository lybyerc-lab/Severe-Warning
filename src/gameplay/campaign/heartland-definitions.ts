// ============================================================================
// [SW:ARCH:PHASE4_HEARTLAND_DEFINITIONS]
// Data definitions copied from the accepted V5 Heartland campaign contract.
// ============================================================================

import type { CampaignDefinition, CampaignStopDefinition } from './campaign-contracts';

export const HEARTLAND_STOP_DEFINITIONS: readonly CampaignStopDefinition[] = Object.freeze([
  Object.freeze({
    id: 'lincoln-county',
    index: 0,
    title: 'LINCOLN COUNTY',
    shortTitle: 'LINCOLN',
    station: 'KSWX 8',
    brief: 'The original county run. Three districts, one very nervous insurance office.',
    scoreTarget: 8000,
    scoreMultiplier: 1,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'PINE RIDGE', subtitle: 'Neighborhood touchdown. Mind the lawn ornaments.' }),
      Object.freeze({ title: 'MAIN STREET', subtitle: 'Signs, shops and questionable insurance coverage.' }),
      Object.freeze({ title: 'COUNTY FAIR', subtitle: 'Blackout finale. The funnel cake stand had a good run.' }),
    ]),
    defaultNextStopId: 'prairie-junction',
  }),
  Object.freeze({
    id: 'prairie-junction',
    index: 1,
    title: 'PRAIRIE JUNCTION',
    shortTitle: 'PRAIRIE',
    station: 'KPRJ 4',
    brief: 'Open-country crosswind. Longer sightlines and a 10% broadcast score bonus.',
    scoreTarget: 12000,
    scoreMultiplier: 1.1,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'WINDMILL ROW', subtitle: 'The prairie has room to breathe. The sheds do not.' }),
      Object.freeze({ title: 'PRAIRIE JUNCTION', subtitle: 'A small rail town with a large debris forecast.' }),
      Object.freeze({ title: 'RODEO GROUNDS', subtitle: 'Live cameras, loose gates and one doomed scoreboard.' }),
    ]),
    defaultNextStopId: 'grain-belt',
  }),
  Object.freeze({
    id: 'grain-belt',
    index: 2,
    title: 'GRAIN BELT',
    shortTitle: 'GRAIN BELT',
    station: 'KGBN 11',
    brief: 'Industrial harvest corridor. Tougher targets pay a 15% chain-reaction bonus.',
    scoreTarget: 18000,
    scoreMultiplier: 1.15,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'SILO COUNTY', subtitle: 'Grain storage meets aggressive atmospheric redistribution.' }),
      Object.freeze({ title: 'FOUNDRY ROW', subtitle: 'Sheet metal, power lines and absolutely no indoor voice.' }),
      Object.freeze({ title: 'HARVEST EXPO', subtitle: 'The combines are parked. The grandstands are reconsidering.' }),
    ]),
    defaultNextStopId: 'state-fair-finale',
  }),
  Object.freeze({
    id: 'state-fair-finale',
    index: 3,
    title: 'STATE FAIR',
    shortTitle: 'STATE FAIR',
    station: 'LIVE NETWORK',
    brief: 'Heartland finale. Maximum cameras, maximum spectacle, 25% score bonus.',
    scoreTarget: 26000,
    scoreMultiplier: 1.25,
    durationSeconds: 180,
    districts: Object.freeze([
      Object.freeze({ title: 'MIDWAY MILE', subtitle: 'Every prize booth is now a wind-tunnel experiment.' }),
      Object.freeze({ title: 'EXHIBITION ROW', subtitle: 'Live television has requested a wider shot.' }),
      Object.freeze({ title: 'STATE FAIR FINALE', subtitle: 'Maximum mayhem beneath the championship lights.' }),
    ]),
    defaultNextStopId: null,
  }),
]);

export const HEARTLAND_CAMPAIGN_DEFINITION: CampaignDefinition = Object.freeze({
  id: 'heartland-v1',
  title: 'Heartland Campaign',
  stops: HEARTLAND_STOP_DEFINITIONS,
});
