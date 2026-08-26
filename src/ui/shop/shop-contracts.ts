/**
 * [SW:ARCH:PHASE6_SHOP_CONTRACTS]
 * Type definitions for the in-game MOO-LAH upgrade and funnel skin storefront.
 */

import type { StormFunnelSkinKey } from '../../gameplay/economy/moolah-contracts.ts';

export type ShopTab = 'upgrades' | 'skins';

export interface ShopItemCard {
  id: string;
  type: 'upgrade' | 'skin';
  title: string;
  subtitle: string;
  cost: number;
  isPurchased: boolean;
  isEquipped?: boolean;
  accentColor: string;
  badgeText: string;
}

export interface ShopStateSnapshot {
  isOpen: boolean;
  activeTab: ShopTab;
  moolahBalance: number;
  activeSkin: StormFunnelSkinKey;
  unlockedSkins: StormFunnelSkinKey[];
  purchasedUpgrades: Record<string, number>;
  items: ShopItemCard[];
}

export interface ShopSystemContract {
  open(initialTab?: ShopTab): void;
  close(): void;
  isOpen(): boolean;
  switchTab(tab: ShopTab): void;
  getSnapshot(): ShopStateSnapshot;
  reset(): void;
}
