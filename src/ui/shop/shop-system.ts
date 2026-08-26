import type {
  ShopTab,
  ShopItemCard,
  ShopStateSnapshot,
  ShopSystemContract
} from './shop-contracts.ts';
import { MoolahSystem, MOOLAH_UPGRADES, MOOLAH_SKINS } from '../../gameplay/economy/moolah-system.ts';
import type { StormFunnelSkinKey } from '../../gameplay/economy/moolah-contracts.ts';

export class ShopSystem implements ShopSystemContract {
  private isOpenModal = false;
  private currentTab: ShopTab = 'upgrades';
  private moolahSystem: MoolahSystem;

  constructor(moolahSystem?: MoolahSystem) {
    this.moolahSystem = moolahSystem || new MoolahSystem();
  }

  public open(initialTab: ShopTab = 'upgrades'): void {
    this.isOpenModal = true;
    this.currentTab = initialTab;
  }

  public close(): void {
    this.isOpenModal = false;
  }

  public isOpen(): boolean {
    return this.isOpenModal;
  }

  public switchTab(tab: ShopTab): void {
    this.currentTab = tab;
  }

  public getMoolahSystem(): MoolahSystem {
    return this.moolahSystem;
  }

  public getSnapshot(): ShopStateSnapshot {
    const balance = this.moolahSystem.getBalance();
    const activeSkin = this.moolahSystem.getActiveSkin();
    const items: ShopItemCard[] = [];

    if (this.currentTab === 'upgrades') {
      const upgradeKeys: Array<'pull' | 'gust' | 'gridZap'> = ['pull', 'gust', 'gridZap'];
      for (const key of upgradeKeys) {
        const def = MOOLAH_UPGRADES[key];
        const owned = this.moolahSystem.hasUpgrade(key);
        items.push({
          id: `upgrade-${key}`,
          type: 'upgrade',
          title: def.label,
          subtitle: `Boost: ${def.base}${def.unit} -> ${def.upgraded}${def.unit}`,
          cost: def.cost,
          isPurchased: owned,
          accentColor: '#38bdf8',
          badgeText: owned ? 'ACTIVE' : `${def.cost} MOO-LAH`
        });
      }
    } else {
      const skinKeys: StormFunnelSkinKey[] = [
        'default-classic',
        'midnight-neon',
        'crimson-fury',
        'golden-harvest',
        'emerald-tempest'
      ];
      for (const key of skinKeys) {
        const def = MOOLAH_SKINS[key];
        const owned = this.moolahSystem.hasSkin(key);
        const isEquipped = activeSkin === key;
        items.push({
          id: `skin-${key}`,
          type: 'skin',
          title: def.label,
          subtitle: `Core: ${def.coreColor} | Ring: ${def.suctionGlow}`,
          cost: def.cost,
          isPurchased: owned,
          isEquipped,
          accentColor: def.accentColor,
          badgeText: isEquipped ? 'EQUIPPED' : (owned ? 'EQUIP' : `${def.cost} MOO-LAH`)
        });
      }
    }

    return Object.freeze({
      isOpen: this.isOpenModal,
      activeTab: this.currentTab,
      moolahBalance: balance,
      activeSkin,
      unlockedSkins: this.moolahSystem.getState().unlockedSkins,
      purchasedUpgrades: this.moolahSystem.getState().upgrades,
      items
    });
  }

  public reset(): void {
    this.isOpenModal = false;
    this.currentTab = 'upgrades';
    this.moolahSystem.reset();
  }
}
