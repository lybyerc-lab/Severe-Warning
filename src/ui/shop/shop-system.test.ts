import test from 'node:test';
import assert from 'node:assert/strict';
import { ShopSystem } from './shop-system.ts';
import { MoolahSystem } from '../../gameplay/economy/moolah-system.ts';

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

  moolah.awardReward(600, 'test-grant');
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
