import type {
  MoolahUpgradeKey,
  MoolahUpgradeDefinition,
  MoolahSkinDefinition,
  StormFunnelSkinKey,
  MoolahStoreState,
  MoolahRewardCalculationInput,
  MoolahSystemContract
} from './moolah-contracts.ts';

export const MOOLAH_STORAGE_KEY = 'severe_weather_rpg_v1';

/**
 * The upgrade catalogue.
 *
 * This table and SW_RPG_UPGRADES in the gameplay source describe the same shop,
 * and they had already drifted: the page shipped four upgrades while this one
 * carried three, and this -- the unit-tested half -- was not the half the game
 * read. scripts/verify-economy-tables.mjs now fails the build if the two
 * disagree on a key, a cost or an effect, so the drift cannot come back quietly.
 *
 * Costs are tuned against the payout rates in the gameplay source; the reasoning
 * is written down beside SW_RPG_UPGRADES there.
 */
export const MOOLAH_UPGRADES: Record<MoolahUpgradeKey, MoolahUpgradeDefinition> = Object.freeze({
  pull: {
    key: 'pull',
    label: 'PULL VORTEX',
    cost: 300,
    base: 2.2,
    upgraded: 3.4,
    unit: 's'
  },
  gust: {
    key: 'gust',
    label: 'GUST BURST',
    cost: 350,
    base: 180,
    upgraded: 260,
    unit: ' DMG'
  },
  gridZap: {
    key: 'gridZap',
    label: 'GRID ZAP',
    cost: 400,
    base: 6,
    upgraded: 10,
    unit: ' NODES'
  },
  chaser: {
    key: 'chaser',
    label: 'CHASER GEARING',
    cost: 450,
    base: 42,
    upgraded: 50,
    unit: ' SPEED'
  },
  inflow: {
    key: 'inflow',
    label: 'DEEP INFLOW',
    cost: 550,
    base: 100,
    upgraded: 65,
    unit: '% DRAIN'
  },
  twinFunnel: {
    key: 'twinFunnel',
    label: 'TWIN TWISTER',
    cost: 1200,
    base: 0,
    upgraded: 1,
    unit: ' SATELLITE'
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
    cost: 400,
    coreColor: '#1e1b4b',
    accentColor: '#38bdf8',
    suctionGlow: '#818cf8'
  },
  'crimson-fury': {
    key: 'crimson-fury',
    label: 'CRIMSON FURY',
    cost: 800,
    coreColor: '#450a0a',
    accentColor: '#ef4444',
    suctionGlow: '#f87171'
  },
  'golden-harvest': {
    key: 'golden-harvest',
    label: 'GOLDEN HARVEST',
    cost: 600,
    coreColor: '#451a03',
    accentColor: '#f59e0b',
    suctionGlow: '#fbbf24'
  },
  'emerald-tempest': {
    key: 'emerald-tempest',
    label: 'EMERALD TEMPEST',
    cost: 1400,
    coreColor: '#022c22',
    accentColor: '#10b981',
    suctionGlow: '#34d399'
  },
  // [SW:CAMPAIGN:STAR_SKINS] Earned against campaign stars, not bought. Thirty
  // stars were reachable and bought nothing at all before these existed; MOO-LAH
  // already has a catalogue, so stars needed a currency of their own rather than
  // a second price on the same shelf.
  'siren-amber': {
    key: 'siren-amber',
    label: 'SIREN AMBER',
    cost: 0,
    starRequirement: 8,
    coreColor: '#431407',
    accentColor: '#f59e0b',
    suctionGlow: '#fdba74'
  },
  'doppler-violet': {
    key: 'doppler-violet',
    label: 'DOPPLER VIOLET',
    cost: 0,
    starRequirement: 18,
    coreColor: '#2e1065',
    accentColor: '#a855f7',
    suctionGlow: '#d8b4fe'
  },
  'whiteout': {
    key: 'whiteout',
    label: 'WHITEOUT',
    cost: 0,
    starRequirement: 30,
    coreColor: '#e2e8f0',
    accentColor: '#f8fafc',
    suctionGlow: '#ffffff'
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

  /**
   * [SW:CAMPAIGN:STAR_SKINS] Campaign stars earned so far. A star-gated skin is
   * owned when this reaches its requirement -- it is never added to
   * unlockedSkins, because it is not a purchase and must not survive a campaign
   * reset that takes the stars back.
   */
  private earnedStars = 0;

  public setEarnedStars(stars: number): void {
    this.earnedStars = Number.isFinite(stars) ? Math.max(0, Math.floor(stars)) : 0;
  }

  public hasSkin(skinKey: StormFunnelSkinKey): boolean {
    const skin = MOOLAH_SKINS[skinKey];
    if (skin && typeof skin.starRequirement === 'number') {
      return this.earnedStars >= skin.starRequirement;
    }
    return this.state.unlockedSkins.includes(skinKey);
  }

  public purchaseSkin(skinKey: StormFunnelSkinKey): { purchased: boolean; balance: number; reason?: string } {
    const skin = MOOLAH_SKINS[skinKey];
    if (!skin) return { purchased: false, balance: this.state.moolah, reason: 'unknown-skin' };
    // A star-gated skin has cost 0, which would otherwise hand it over free.
    if (typeof skin.starRequirement === 'number') {
      return { purchased: false, balance: this.state.moolah, reason: 'not-for-sale' };
    }
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
