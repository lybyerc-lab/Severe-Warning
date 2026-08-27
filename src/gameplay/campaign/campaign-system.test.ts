import { describe, it, expect } from 'vitest';
import { CampaignSystem } from './campaign-system';
import {
  HEARTLAND_CAMPAIGN_DEFINITION,
  COASTAL_CAMPAIGN_DEFINITION,
  METRO_CAMPAIGN_DEFINITION,
  ALL_CAMPAIGN_DEFINITIONS
} from './heartland-definitions';
import { CampaignStore } from '../../platform/persistence/campaign-store';

describe('CampaignSystem — Multi-Region Expansion', () => {
  it('initializes default Heartland campaign with 4 stops and homestead modifier', () => {
    const system = new CampaignSystem(new CampaignStore(), HEARTLAND_CAMPAIGN_DEFINITION);
    expect(system.stops.length).toBe(4);
    expect(system.activeStopId).toBe('lincoln-county');
    expect(system.getStopDefinition('lincoln-county').station).toBe('KSWX 8');
    expect(system.getStopDefinition('lincoln-county').regionalModifier?.id).toBe('heartland-homestead-surge');
  });

  it('supports Coastal Bayou campaign with 3 stops and marine modifier', () => {
    const system = new CampaignSystem(new CampaignStore(), COASTAL_CAMPAIGN_DEFINITION);
    expect(system.stops.length).toBe(3);
    expect(system.activeStopId).toBe('bayou-bend');
    expect(system.getStopDefinition('bayou-bend').station).toBe('KSWX COASTAL 6');
    expect(system.getStopDefinition('pelican-key').title).toBe('PELICAN KEY BOARDWALK');
    expect(system.getStopDefinition('port-delta').scoreMultiplier).toBe(1.35);
    expect(system.getStopDefinition('bayou-bend').regionalModifier?.id).toBe('waterspout-marine-surge');
  });

  it('supports Metro Row campaign with 3 stops and power grid modifier', () => {
    const system = new CampaignSystem(new CampaignStore(), METRO_CAMPAIGN_DEFINITION);
    expect(system.stops.length).toBe(3);
    expect(system.activeStopId).toBe('downtown-core');
    expect(system.getStopDefinition('downtown-core').station).toBe('METRO 4 NEWS');
    expect(system.getStopDefinition('rail-terminal').title).toBe('GRAND CENTRAL TERMINAL');
    expect(system.getStopDefinition('broadcast-heights').scoreMultiplier).toBe(1.60);
    expect(system.getStopDefinition('downtown-core').regionalModifier?.id).toBe('power-grid-skyscraper-surge');
  });

  it('calculates stars correctly against stop score targets', () => {
    const system = new CampaignSystem(new CampaignStore(), COASTAL_CAMPAIGN_DEFINITION);
    expect(system.calculateStars(5000, 0, 'bayou-bend')).toBe(0);
    expect(system.calculateStars(6000, 0, 'bayou-bend')).toBe(1);
    expect(system.calculateStars(10000, 1, 'bayou-bend')).toBe(2);
    expect(system.calculateStars(15000, 3, 'bayou-bend')).toBe(3);
  });

  it('exports all three distinct regional campaigns in registry', () => {
    expect(ALL_CAMPAIGN_DEFINITIONS.length).toBe(3);
    const regions = ALL_CAMPAIGN_DEFINITIONS.map(d => d.regionId);
    expect(regions).toEqual(['heartland', 'coastal', 'metro']);
  });
});
