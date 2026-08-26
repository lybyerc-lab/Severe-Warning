import type {
  MoolahUpgradeDefinition,
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

export class MoolahSystem implements MoolahSystemContract {
  private state: MoolahStoreState;

  constructor(initialState?: Partial<MoolahStoreState>) {
    this.state = this.createDefaultState();
    if (initialState) {
      this.state = { ...this.state, ...initialState };
    }
  }

  private createDefaultState(): MoolahStoreState {
    return {
      version: 1,
      moolah: 0,
      earned: 0,
      spent: 0,
      upgrades: {},
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
