import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { NightBlackoutSystem } from './night-blackout-system.ts';

describe('NightBlackoutSystem', () => {
  test('initializes with DAY mode and intact electrical grid', () => {
    const system = new NightBlackoutSystem();
    assert.equal(system.getTimeOfDay(), 'DAY');
    assert.equal(system.isNight(), false);

    const districts = system.getAllDistricts();
    assert.equal(districts.length, 4);
    assert.equal(districts[0].isBlackedOut, false);
    assert.equal(districts[0].substationIntact, true);
  });

  test('switches time of day mode', () => {
    const system = new NightBlackoutSystem();
    system.setTimeOfDay('NIGHT');
    assert.equal(system.getTimeOfDay(), 'NIGHT');
    assert.equal(system.isNight(), true);
  });

  test('substation destruction triggers instant district blackout', () => {
    const system = new NightBlackoutSystem();
    const event = system.triggerSubstationCollapse(0);

    assert.ok(event !== null);
    assert.equal(event.districtIndex, 0);
    assert.equal(event.districtName, 'PINE RIDGE');
    assert.equal(event.cause, 'SUBSTATION_DESTRUCTION');

    const state = system.getDistrictState(0);
    assert.equal(state?.isBlackedOut, true);
    assert.equal(state?.substationIntact, false);
    assert.equal(state?.lightsEmissiveIntensity, 0.0);
  });

  test('severe pole loss causes cascading grid blackout', () => {
    const system = new NightBlackoutSystem();
    // Knock out 20 poles
    const event = system.recordPoleDamage(1, 20);

    assert.ok(event !== null);
    assert.equal(event.cause, 'GRID_CASCADE_FAILURE');
    assert.equal(system.getDistrictState(1)?.isBlackedOut, true);
  });
});
