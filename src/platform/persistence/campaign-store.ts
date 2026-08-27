// ============================================================================
// [SW:ARCH:PHASE4_CAMPAIGN_STORE]
// Exact campaign persistence boundary for severe_weather_campaign_v1.
// ============================================================================

import {
  CAMPAIGN_STORAGE_KEY,
  createDefaultSave,
  validateCampaignSave,
  type ValidatedCampaignSave,
} from './campaign-save-schema.ts';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface PersistenceContractProbe {
  readonly passed: boolean;
  readonly checks: Readonly<Record<string, boolean>>;
}

export class CampaignStore {
  private inMemorySave: ValidatedCampaignSave = createDefaultSave();
  private readonly storage: StorageLike | null;

  // Declared as a field and assigned in the body rather than as a constructor
  // parameter property. `pnpm test` runs node --experimental-strip-types, which
  // only removes type syntax; a parameter property emits a real assignment, so
  // the loader rejects the file outright. tsc supports them fully, which is why
  // the typecheck stayed green while the test run died.
  private readonly storageKey: string;

  constructor(
    storageKey: string = CAMPAIGN_STORAGE_KEY,
    isolateQa = false,
    storageOverride?: StorageLike | null,
  ) {
    this.storageKey = storageKey;
    this.storage = isolateQa
      ? null
      : storageOverride === undefined
        ? (typeof localStorage === 'undefined' ? null : localStorage)
        : storageOverride;
    this.load();
  }

  load(): ValidatedCampaignSave {
    if (!this.storage) return this.inMemorySave;
    try {
      const rawString = this.storage.getItem(this.storageKey);
      this.inMemorySave = rawString ? validateCampaignSave(JSON.parse(rawString)) : createDefaultSave();
    } catch {
      this.inMemorySave = createDefaultSave();
    }
    return this.inMemorySave;
  }

  synchronize(raw: unknown): ValidatedCampaignSave {
    this.inMemorySave = validateCampaignSave(raw);
    return this.inMemorySave;
  }

  save(raw: unknown): boolean {
    const validated = this.synchronize(raw);
    if (!this.storage) return true;
    try {
      this.storage.setItem(this.storageKey, JSON.stringify(validated));
      return true;
    } catch {
      return false;
    }
  }

  reset(): ValidatedCampaignSave {
    this.inMemorySave = createDefaultSave();
    if (this.storage) {
      try {
        this.storage.removeItem(this.storageKey);
      } catch {
        // A storage clear failure must not crash the game.
      }
    }
    return this.inMemorySave;
  }

  getSnapshot(): ValidatedCampaignSave {
    return this.inMemorySave;
  }

  runContractProbe(): PersistenceContractProbe {
    const values = new Map<string, string>();
    const memoryStorage: StorageLike = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => { values.set(key, value); },
      removeItem: (key) => { values.delete(key); },
    };
    const key = `${CAMPAIGN_STORAGE_KEY}_contract_probe`;
    const probe = new CampaignStore(key, false, memoryStorage);
    const exactLegacySave = {
      schema: 1,
      unlockedLevel: 2,
      selectedLevel: 1,
      futureTopLevel: 'preserve-me',
      levels: {
        'lincoln-county': {
          stars: 3,
          bestScore: 45678,
          runs: 7,
          bestGrade: 'S+',
          futureLevelField: 17,
        },
      },
    };
    const writeSucceeded = probe.save(exactLegacySave);
    const reloaded = new CampaignStore(key, false, memoryStorage).getSnapshot();
    memoryStorage.setItem(key, '{not-json');
    const recovered = new CampaignStore(key, false, memoryStorage).getSnapshot();
    const isolated = new CampaignStore(key, true, memoryStorage);
    isolated.save({ schema: 1, unlockedLevel: 3, selectedLevel: 3, levels: {} });
    const storedAfterIsolation = memoryStorage.getItem(key);

    const checks = Object.freeze({
      storageKeyPreserved: CAMPAIGN_STORAGE_KEY === 'severe_weather_campaign_v1',
      writeSucceeded,
      exactIndicesPreserved: reloaded.unlockedLevel === 2 && reloaded.selectedLevel === 1,
      exactLevelFieldsPreserved: reloaded.levels['lincoln-county']?.runs === 7
        && reloaded.levels['lincoln-county']?.bestGrade === 'S+',
      unknownTopLevelPreserved: reloaded.futureTopLevel === 'preserve-me',
      unknownLevelFieldPreserved: reloaded.levels['lincoln-county']?.futureLevelField === 17,
      malformedSaveRecovers: recovered.unlockedLevel === 0
        && recovered.selectedLevel === 0
        && Object.keys(recovered.levels).length === 0,
      qaStoreIsIsolated: storedAfterIsolation === '{not-json',
    });
    return Object.freeze({ passed: Object.values(checks).every(Boolean), checks });
  }
}
