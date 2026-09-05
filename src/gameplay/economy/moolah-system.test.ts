import test from 'node:test';
import assert from 'node:assert/strict';
import { MOOLAH_SKINS, MOOLAH_UPGRADES, MoolahSystem } from './moolah-system.ts';

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

  // Read the prices from the table rather than hard-coding them: repricing the
  // shop is a tuning decision and should not have to come with a test edit, but
  // the MECHANICS below must hold at any price.
  const pullCost = MOOLAH_UPGRADES.pull.cost;
  const gridZapCost = MOOLAH_UPGRADES.gridZap.cost;
  assert.ok(gridZapCost > pullCost, 'this test needs a dearer second upgrade');

  moolah.awardReward(pullCost, 'county-completion');
  assert.equal(moolah.getBalance(), pullCost);

  const purchase = moolah.purchaseUpgrade('pull');
  assert.equal(purchase.purchased, true);
  assert.equal(purchase.balance, 0, 'the price is taken out of the balance');
  assert.equal(moolah.hasUpgrade('pull'), true);
  assert.equal(moolah.getUpgradeValue('pull'), 3.4);

  // Attempt duplicate purchase
  const duplicate = moolah.purchaseUpgrade('pull');
  assert.equal(duplicate.purchased, false);
  assert.equal(duplicate.reason, 'already-owned');

  // Insufficient funds: the balance is spent, and gridZap costs more anyway.
  const insufficient = moolah.purchaseUpgrade('gridZap');
  assert.equal(insufficient.purchased, false);
  assert.equal(insufficient.reason, 'insufficient-moolah');
});

test('MoolahSystem: manages cosmetic funnel skins and equipping', () => {
  const moolah = new MoolahSystem();
  assert.equal(moolah.getActiveSkin(), 'default-classic');
  assert.equal(moolah.hasSkin('default-classic'), true);
  assert.equal(moolah.hasSkin('midnight-neon'), false);

  // Cannot equip locked skin
  const lockedEquip = moolah.equipSkin('midnight-neon');
  assert.equal(lockedEquip.equipped, false);
  assert.equal(lockedEquip.reason, 'skin-locked');

  const skinCost = MOOLAH_SKINS['midnight-neon'].cost;
  moolah.awardReward(skinCost + 250, 'test-bonus');
  const purchase = moolah.purchaseSkin('midnight-neon');
  assert.equal(purchase.purchased, true);
  assert.equal(moolah.getBalance(), 250, 'the skin price is taken out of the balance');
  assert.equal(moolah.hasSkin('midnight-neon'), true);
  assert.equal(moolah.getActiveSkin(), 'midnight-neon');

  // Switch back to classic
  const equipClassic = moolah.equipSkin('default-classic');
  assert.equal(equipClassic.equipped, true);
  assert.equal(moolah.getActiveSkin(), 'default-classic');
});

// [SW:CAMPAIGN:STAR_SKINS] Stars were earnable across ten counties and bought
// nothing. These three skins are the destination, and the rule they follow is
// deliberately not the purchase rule: they are never added to unlockedSkins, so
// they follow the star total both up and back down again.
test('MoolahSystem: star-gated skins are earned, never sold', () => {
  const system = new MoolahSystem();
  system.awardReward(100000, 'test-bonus');

  assert.equal(system.hasSkin('siren-amber'), false, 'not owned at zero stars');
  const attempt = system.purchaseSkin('siren-amber');
  assert.equal(attempt.purchased, false, 'a star skin cannot be bought');
  assert.equal(attempt.reason, 'not-for-sale');
  assert.equal(system.getBalance(), 100000, 'a refused purchase costs nothing');

  system.setEarnedStars(7);
  assert.equal(system.hasSkin('siren-amber'), false, 'one star short is still short');
  system.setEarnedStars(8);
  assert.equal(system.hasSkin('siren-amber'), true, 'earned at exactly the requirement');
  assert.equal(system.equipSkin('siren-amber').equipped, true, 'an earned skin equips');

  assert.equal(system.hasSkin('doppler-violet'), false, '18 stars is a separate gate');
  assert.equal(system.hasSkin('whiteout'), false, 'the sweep skin needs all thirty');
  system.setEarnedStars(30);
  assert.equal(system.hasSkin('doppler-violet'), true);
  assert.equal(system.hasSkin('whiteout'), true);

  // A star skin is not a purchase, so losing the stars loses the skin. A bought
  // skin is unaffected either way.
  system.purchaseSkin('midnight-neon');
  system.setEarnedStars(0);
  assert.equal(system.hasSkin('whiteout'), false, 'stars taken back take the skin back');
  assert.equal(system.hasSkin('midnight-neon'), true, 'a bought skin stays bought');
});
