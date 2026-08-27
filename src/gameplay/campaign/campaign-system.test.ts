import test from 'node:test';
import assert from 'node:assert/strict';
import { CampaignSystem } from './campaign-system.ts';
import {
  HEARTLAND_CAMPAIGN_DEFINITION,
  COASTAL_CAMPAIGN_DEFINITION,
  METRO_CAMPAIGN_DEFINITION,
  ALL_CAMPAIGN_DEFINITIONS,
} from './heartland-definitions.ts';
import { CampaignStore } from '../../platform/persistence/campaign-store.ts';

test('CampaignSystem — Multi-Region Expansion', () => {
  const system = new CampaignSystem(new CampaignStore(), HEARTLAND_CAMPAIGN_DEFINITION);
  assert.equal(system.stops.length, 4);
  assert.equal(system.activeStopId, 'lincoln-county');
  assert.equal(system.getStopDefinition('lincoln-county').station, 'KSWX 8');
  assert.equal(system.getStopDefinition('lincoln-county').regionalModifier?.id, 'heartland-homestead-surge');

  const coastalSystem = new CampaignSystem(new CampaignStore(), COASTAL_CAMPAIGN_DEFINITION);
  assert.equal(coastalSystem.stops.length, 3);
  assert.equal(coastalSystem.activeStopId, 'bayou-bend');
  assert.equal(coastalSystem.getStopDefinition('bayou-bend').station, 'KSWX COASTAL 6');
  assert.equal(coastalSystem.getStopDefinition('pelican-key').title, 'PELICAN KEY BOARDWALK');
  assert.equal(coastalSystem.getStopDefinition('port-delta').scoreMultiplier, 1.35);
  assert.equal(coastalSystem.getStopDefinition('bayou-bend').regionalModifier?.id, 'waterspout-marine-surge');

  const metroSystem = new CampaignSystem(new CampaignStore(), METRO_CAMPAIGN_DEFINITION);
  assert.equal(metroSystem.stops.length, 3);
  assert.equal(metroSystem.activeStopId, 'downtown-core');
  assert.equal(metroSystem.getStopDefinition('downtown-core').station, 'METRO 4 NEWS');
  assert.equal(metroSystem.getStopDefinition('rail-terminal').title, 'GRAND CENTRAL TERMINAL');
  assert.equal(metroSystem.getStopDefinition('broadcast-heights').scoreMultiplier, 1.60);
  assert.equal(metroSystem.getStopDefinition('downtown-core').regionalModifier?.id, 'power-grid-skyscraper-surge');

  assert.equal(coastalSystem.calculateStars(5000, 0, 'bayou-bend'), 0);
  assert.equal(coastalSystem.calculateStars(6000, 0, 'bayou-bend'), 1);
  assert.equal(coastalSystem.calculateStars(10000, 1, 'bayou-bend'), 2);
  assert.equal(coastalSystem.calculateStars(15000, 3, 'bayou-bend'), 3);

  assert.equal(ALL_CAMPAIGN_DEFINITIONS.length, 3);
  const regions = ALL_CAMPAIGN_DEFINITIONS.map((d) => d.regionId);
  assert.deepEqual(regions, ['heartland', 'coastal', 'metro']);
});
