import test from 'node:test';
import assert from 'node:assert/strict';
import { MoolahSystem } from './moolah-system.ts';

test('MoolahSystem: calculates rewards and manages upgrade purchases', () => {
  const moolah = new MoolahSystem();
  assert.equal(moolah.getBalance(), 0);
  assert.equal(moolah.hasUpgrade('pull'), false);
  assert.equal(moolah.getUpgradeValue('pull'), 2.2);

  // Calculate and award reward
  const reward = moolah.calculateReward({
    destructionScore: 1200,
    baseScore: 300,
    maxCombo: 2.5,
    cowAirtimeSeconds: 3
  });
  assert.equal(reward > 0, true);

  moolah.awardReward(300, 'county-completion');
  assert.equal(moolah.getBalance(), 300);

  // Purchase Pull Upgrade (cost 150)
  const purchase = moolah.purchaseUpgrade('pull');
  assert.equal(purchase.purchased, true);
  assert.equal(purchase.balance, 150);
  assert.equal(moolah.hasUpgrade('pull'), true);
  assert.equal(moolah.getUpgradeValue('pull'), 3.4);

  // Attempt duplicate purchase
  const duplicate = moolah.purchaseUpgrade('pull');
  assert.equal(duplicate.purchased, false);
  assert.equal(duplicate.reason, 'already-owned');

  // Attempt purchase with insufficient funds (gridZap cost 200 > 150)
  const insufficient = moolah.purchaseUpgrade('gridZap');
  assert.equal(insufficient.purchased, false);
  assert.equal(insufficient.reason, 'insufficient-moolah');
});
