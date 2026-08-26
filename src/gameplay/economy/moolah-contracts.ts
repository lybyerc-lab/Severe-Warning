/**
 * [SW:ARCH:MOOLAH_CONTRACTS]
 * Type definitions for the MOO-LAH storm currency and Storm Triangle upgrade loadout.
 */

export interface MoolahUpgradeDefinition {
  key: 'pull' | 'gust' | 'gridZap';
  label: string;
  cost: number;
  base: number;
  upgraded: number;
  unit: string;
}

export type StormFunnelSkinKey = 'default-classic' | 'midnight-neon' | 'crimson-fury' | 'golden-harvest' | 'emerald-tempest';

export interface MoolahSkinDefinition {
  key: StormFunnelSkinKey;
  label: string;
  cost: number;
  coreColor: string;
  accentColor: string;
  suctionGlow: string;
}

export interface MoolahStoreState {
  version: 1;
  moolah: number;
  earned: number;
  spent: number;
  upgrades: Record<string, number>;
  activeSkin: StormFunnelSkinKey;
  unlockedSkins: StormFunnelSkinKey[];
  stormTriangle: {
    version: 'sw-storm-triangle-v1';
    slots: ['pull', 'gust', 'gridZap'];
  };
  lastReward: {
    amount: number;
    reason: string;
    timestamp: string;
  } | null;
}

export interface MoolahRewardCalculationInput {
  destructionScore: number;
  baseScore: number;
  maxCombo: number;
  cowAirtimeSeconds?: number;
}

export interface MoolahSystemContract {
  getBalance(): number;
  hasUpgrade(key: 'pull' | 'gust' | 'gridZap'): boolean;
  getUpgradeValue(key: 'pull' | 'gust' | 'gridZap'): number;
  purchaseUpgrade(key: 'pull' | 'gust' | 'gridZap'): { purchased: boolean; balance: number; reason?: string };
  getActiveSkin(): StormFunnelSkinKey;
  hasSkin(skinKey: StormFunnelSkinKey): boolean;
  purchaseSkin(skinKey: StormFunnelSkinKey): { purchased: boolean; balance: number; reason?: string };
  equipSkin(skinKey: StormFunnelSkinKey): { equipped: boolean; activeSkin: StormFunnelSkinKey; reason?: string };
  calculateReward(input: MoolahRewardCalculationInput): number;
  awardReward(amount: number, reason: string): void;
  reset(): void;
}
