import type {
  MoolahUpgradeDefinition,
  MoolahSkinDefinition,
  StormFunnelSkinKey,
  MoolahStoreState,
  MoolahRewardCalculationInput,
  MoolahSystemContract
} from './moolah-contracts.ts';

export const MOOLAH_STORAGE_KEY = 'severe_weather_rpg_v1';

export const MOOLAH_UPGRADES: Record<'pull' | 'gust' | 'gridZap', MoolahUpgradeDefinition> = Object.freeze({
  pull: {
    key: 'pull',
    label: 'PULL VORTEX',
    cost: 150,
    base: 2.2,
    upgraded: 3.4,
    unit: 's'
  },
  gust: {
    key: 'gust',
    label: 'GUST BURST',
    cost: 175,
    base: 180,
    upgraded: 260,
    unit: ' DMG'
  },
  gridZap: {
    key: 'gridZap',
    label: 'GRID ZAP',
    cost: 200,
    base: 6,
    upgraded: 10,
    unit: ' NODES'
  }
});

export const MOOLAH_SKINS: Record<StormFunnelSkinKey, MoolahSkinDefinition> = Object.freeze({
  'default-classic': {
    key: 'default-classic',
    label: 'CLASSIC DUST DEVIL',
    cost: 0,
    coreColor: '#334155',
    accentColor: '#64748b',
    suctionGlow: '#94a3b8'
  },
  'midnight-neon': {
    key: 'midnight-neon',
    label: 'MIDNIGHT NEON',
    cost: 250,
    coreColor: '#1e1b4b',
    accentColor: '#38bdf8',
    suctionGlow: '#818cf8'
  },
  'crimson-fury': {
    key: 'crimson-fury',
    label: 'CRIMSON FURY',
    cost: 350,
    coreColor: '#450a0a',
    accentColor: '#ef4444',
    suctionGlow: '#f87171'
  },
  'golden-harvest': {
    key: 'golden-harvest',
    label: 'GOLDEN HARVEST',
    cost: 300,
    coreColor: '#451a03',
    accentColor: '#f59e0b',
    suctionGlow: '#fbbf24'
  },
  'emerald-tempest': {
    key: 'emerald-tempest',
    label: 'EMERALD TEMPEST',
    cost: 400,
    coreColor: '#022c22',
    accentColor: '#10b981',
    suctionGlow: '#34d399'
  }
});

export class MoolahSystem implements MoolahSystemContract {
  private state: MoolahStoreState;

  constructor(initialState?: Partial<MoolahStoreState>) {
    this.state = this.createDefaultState();
    if (initialState) {
      this.state = {
        ...this.state,
        ...initialState,
        unlockedSkins: initialState.unlockedSkins || ['default-classic'],
        activeSkin: initialState.activeSkin || 'default-classic'
      };
    }
  }

  private createDefaultState(): MoolahStoreState {
    return {
      version: 1,
      moolah: 0,
      earned: 0,
      spent: 0,
      upgrades: {},
      activeSkin: 'default-classic',
      unlockedSkins: ['default-classic'],
      stormTriangle: {
        version: 'sw-storm-triangle-v1',
        slots: ['pull', 'gust', 'gridZap']
      },
      lastReward: null
    };
  }

  public getBalance(): number {
    return this.state.moolah;
  }

  public hasUpgrade(key: 'pull' | 'gust' | 'gridZap'): boolean {
    return Boolean(this.state.upgrades[key]);
  }

  public getUpgradeValue(key: 'pull' | 'gust' | 'gridZap'): number {
    const upgrade = MOOLAH_UPGRADES[key];
    if (!upgrade) return 0;
    return this.hasUpgrade(key) ? upgrade.upgraded : upgrade.base;
  }

  public purchaseUpgrade(key: 'pull' | 'gust' | 'gridZap'): { purchased: boolean; balance: number; reason?: string } {
    const upgrade = MOOLAH_UPGRADES[key];
    if (!upgrade) return { purchased: false, balance: this.state.moolah, reason: 'unknown-upgrade' };
    if (this.hasUpgrade(key)) return { purchased: false, balance: this.state.moolah, reason: 'already-owned' };
    if (this.state.moolah < upgrade.cost) return { purchased: false, balance: this.state.moolah, reason: 'insufficient-moolah' };

    this.state.moolah -= upgrade.cost;
    this.state.spent += upgrade.cost;
    this.state.upgrades[key] = 1;

    return {
      purchased: true,
      balance: this.state.moolah
    };
  }

  public getActiveSkin(): StormFunnelSkinKey {
    return this.state.activeSkin;
  }

  public hasSkin(skinKey: StormFunnelSkinKey): boolean {
    return this.state.unlockedSkins.includes(skinKey);
  }

  public purchaseSkin(skinKey: StormFunnelSkinKey): { purchased: boolean; balance: number; reason?: string } {
    const skin = MOOLAH_SKINS[skinKey];
    if (!skin) return { purchased: false, balance: this.state.moolah, reason: 'unknown-skin' };
    if (this.hasSkin(skinKey)) return { purchased: false, balance: this.state.moolah, reason: 'already-owned' };
    if (this.state.moolah < skin.cost) return { purchased: false, balance: this.state.moolah, reason: 'insufficient-moolah' };

    this.state.moolah -= skin.cost;
    this.state.spent += skin.cost;
    this.state.unlockedSkins.push(skinKey);
    this.state.activeSkin = skinKey;

    return {
      purchased: true,
      balance: this.state.moolah
    };
  }

  public equipSkin(skinKey: StormFunnelSkinKey): { equipped: boolean; activeSkin: StormFunnelSkinKey; reason?: string } {
    if (!this.hasSkin(skinKey)) {
      return { equipped: false, activeSkin: this.state.activeSkin, reason: 'skin-locked' };
    }
    this.state.activeSkin = skinKey;
    return {
      equipped: true,
      activeSkin: this.state.activeSkin
    };
  }

  public calculateReward(input: MoolahRewardCalculationInput): number {
    const scoreBase = Math.floor((input.destructionScore + input.baseScore) / 100);
    const comboBonus = Math.floor((input.maxCombo || 1.0) * 15);
    const bovineBonus = Math.floor((input.cowAirtimeSeconds || 0) * 10);
    return Math.max(10, scoreBase + comboBonus + bovineBonus);
  }

  public awardReward(amount: number, reason: string): void {
    if (amount <= 0) return;
    this.state.moolah += amount;
    this.state.earned += amount;
    this.state.lastReward = {
      amount,
      reason,
      timestamp: new Date().toISOString()
    };
  }

  public getState(): MoolahStoreState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public reset(): void {
    this.state = this.createDefaultState();
  }
}
