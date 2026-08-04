// ============================================================================
// [SW:ARCH:PHASE4_CAMPAIGN_STORE]
// Campaign persistence store: load, save, recover, reset, and isolate storage.
// ============================================================================

import {
  CAMPAIGN_STORAGE_KEY,
  createDefaultSave,
  validateCampaignSave,
  type ValidatedCampaignSave
} from './campaign-save-schema';

export class CampaignStore {
  private inMemorySave: ValidatedCampaignSave;
  private readonly storageKey: string;
  private readonly useLocalStorage: boolean;

  constructor(key: string = CAMPAIGN_STORAGE_KEY, isolateQa: boolean = false) {
    this.storageKey = isolateQa ? `${key}_qa_inmemory` : key;
    this.useLocalStorage = !isolateQa && typeof localStorage !== 'undefined';
    this.inMemorySave = createDefaultSave();
    this.load();
  }

  load(): ValidatedCampaignSave {
    if (!this.useLocalStorage) {
      return this.inMemorySave;
    }
    try {
      const rawString = localStorage.getItem(this.storageKey);
      if (!rawString) {
        this.inMemorySave = createDefaultSave();
        return this.inMemorySave;
      }
      const parsed = JSON.parse(rawString);
      this.inMemorySave = validateCampaignSave(parsed);
      return this.inMemorySave;
    } catch (err) {
      // Malformed save recovery: revert to defaults without throwing
      this.inMemorySave = createDefaultSave();
      return this.inMemorySave;
    }
  }

  save(data: ValidatedCampaignSave): boolean {
    const validated = validateCampaignSave(data);
    this.inMemorySave = validated;

    if (!this.useLocalStorage) return true;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(validated));
      return true;
    } catch (err) {
      return false;
    }
  }

  reset(): ValidatedCampaignSave {
    const defaults = createDefaultSave();
    this.inMemorySave = defaults;
    if (this.useLocalStorage) {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (err) {
        // Ignore storage clear errors
      }
    }
    return defaults;
  }

  getSnapshot(): ValidatedCampaignSave {
    return this.inMemorySave;
  }
}
