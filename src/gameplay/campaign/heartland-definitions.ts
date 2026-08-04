// ============================================================================
// [SW:ARCH:PHASE4_HEARTLAND_DEFINITIONS]
// Data-driven content definition for the Heartland Campaign stops and unlocks.
// ============================================================================

import type { CampaignDefinition, CampaignStopDefinition, StarThresholds } from './campaign-contracts';

export const DEFAULT_STAR_THRESHOLDS: StarThresholds = Object.freeze({
  star1: 5000,
  star2: 12000,
  star3: 20000
});

export const HEARTLAND_STOP_DEFINITIONS: readonly CampaignStopDefinition[] = Object.freeze([
  Object.freeze({
    id: 'lincoln-county',
    index: 1,
    title: 'Lincoln County',
    region: 'Heartland Plains',
    description: 'Farmsteads, open fields, and county crossroads.',
    unlockRequiresStopId: null,
    unlockRequiresStars: 0,
    starThresholds: DEFAULT_STAR_THRESHOLDS,
    defaultNextStopId: 'prairie-junction'
  }),
  Object.freeze({
    id: 'prairie-junction',
    index: 2,
    title: 'Prairie Junction',
    region: 'Heartland Rail District',
    description: 'Elevators, rail yards, and main street commercial strip.',
    unlockRequiresStopId: 'lincoln-county',
    unlockRequiresStars: 1,
    starThresholds: DEFAULT_STAR_THRESHOLDS,
    defaultNextStopId: 'grain-belt'
  }),
  Object.freeze({
    id: 'grain-belt',
    index: 3,
    title: 'Grain Belt',
    region: 'Heartland Industrial Corridor',
    description: 'High-density silos, processing plants, and power substations.',
    unlockRequiresStopId: 'prairie-junction',
    unlockRequiresStars: 1,
    starThresholds: DEFAULT_STAR_THRESHOLDS,
    defaultNextStopId: 'state-fair'
  }),
  Object.freeze({
    id: 'state-fair',
    index: 4,
    title: 'State Fair',
    region: 'Heartland Capital Fairgrounds',
    description: 'Midway rides, grandstands, livestock pavilions, and broadcasting towers.',
    unlockRequiresStopId: 'grain-belt',
    unlockRequiresStars: 1,
    starThresholds: DEFAULT_STAR_THRESHOLDS,
    defaultNextStopId: null
  })
]);

export const HEARTLAND_CAMPAIGN_DEFINITION: CampaignDefinition = Object.freeze({
  id: 'heartland-v1',
  title: 'Heartland Campaign',
  stops: HEARTLAND_STOP_DEFINITIONS
});
