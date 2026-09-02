import test from 'node:test';
import assert from 'node:assert/strict';
import { ShopSystem } from './shop-system.ts';
import { MOOLAH_SKINS, MOOLAH_UPGRADES, MoolahSystem } from '../../gameplay/economy/moolah-system.ts';

test('ShopSystem: handles modal open, close, and tab navigation', () => {
  const moolah = new MoolahSystem();
  const shop = new ShopSystem(moolah);

  assert.equal(shop.isOpen(), false);
  assert.equal(shop.getSnapshot().activeTab, 'upgrades');

  shop.open('skins');
  assert.equal(shop.isOpen(), true);
  assert.equal(shop.getSnapshot().activeTab, 'skins');
  assert.equal(shop.getSnapshot().items.length, 5);

  shop.switchTab('upgrades');
  assert.equal(shop.getSnapshot().activeTab, 'upgrades');
  assert.equal(shop.getSnapshot().items.length, 3);

  shop.close();
  assert.equal(shop.isOpen(), false);
});

test('ShopSystem: reflects upgrade purchases and skin equipping in snapshot', () => {
  const moolah = new MoolahSystem();
  const shop = new ShopSystem(moolah);

  // Grant exactly what this test buys, read from the catalogue: a literal here
  // silently stopped covering both purchases the first time the shop was
  // repriced, and the failure looked like a snapshot bug rather than a budget.
  moolah.awardReward(MOOLAH_UPGRADES.pull.cost + MOOLAH_SKINS['midnight-neon'].cost, 'test-grant');
  moolah.purchaseUpgrade('pull');
  moolah.purchaseSkin('midnight-neon');

  shop.open('upgrades');
  const upgradeItem = shop.getSnapshot().items.find(i => i.id === 'upgrade-pull');
  assert.equal(upgradeItem?.isPurchased, true);
  assert.equal(upgradeItem?.badgeText, 'ACTIVE');

  shop.switchTab('skins');
  const skinItem = shop.getSnapshot().items.find(i => i.id === 'skin-midnight-neon');
  assert.equal(skinItem?.isPurchased, true);
  assert.equal(skinItem?.isEquipped, true);
  assert.equal(skinItem?.badgeText, 'EQUIPPED');
});
