// ============================================================================
// [SW:ARCH:PHASE4_SAVE_SCHEMA]
// Storage key, typed schema, defaults, and validators for severe_weather_campaign_v1.
// ============================================================================

import type { StopId } from '../../gameplay/campaign/campaign-contracts';

export const CAMPAIGN_STORAGE_KEY = 'severe_weather_campaign_v1';

export interface RawStopProgressData {
  bestScore?: number;
  stars?: number;
  runsCompleted?: number;
}

export interface RawCampaignSaveData {
  version?: number;
  selectedStop?: string;
  furthestUnlockedStop?: string;
  stops?: Record<string, RawStopProgressData>;
  [key: string]: unknown;
}

export interface ValidatedCampaignSave {
  readonly version: number;
  readonly selectedStop: StopId;
  readonly furthestUnlockedStop: StopId;
  readonly stops: Readonly<Record<StopId, {
    readonly bestScore: number;
    readonly stars: number;
    readonly runsCompleted: number;
  }>>;
}

export const VALID_STOP_IDS: readonly StopId[] = Object.freeze([
  'lincoln-county',
  'prairie-junction',
  'grain-belt',
  'state-fair'
]);

export function isKnownStopId(id: unknown): id is StopId {
  return typeof id === 'string' && (VALID_STOP_IDS as readonly string[]).includes(id);
}

export function createDefaultSave(): ValidatedCampaignSave {
  return Object.freeze({
    version: 1,
    selectedStop: 'lincoln-county',
    furthestUnlockedStop: 'lincoln-county',
    stops: Object.freeze({
      'lincoln-county': Object.freeze({ bestScore: 0, stars: 0, runsCompleted: 0 }),
      'prairie-junction': Object.freeze({ bestScore: 0, stars: 0, runsCompleted: 0 }),
      'grain-belt': Object.freeze({ bestScore: 0, stars: 0, runsCompleted: 0 }),
      'state-fair': Object.freeze({ bestScore: 0, stars: 0, runsCompleted: 0 })
    })
  });
}

export function validateCampaignSave(raw: unknown): ValidatedCampaignSave {
  const defaults = createDefaultSave();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return defaults;

  const data = raw as RawCampaignSaveData;
  const selectedStop = isKnownStopId(data.selectedStop) ? data.selectedStop : defaults.selectedStop;
  const furthestUnlockedStop = isKnownStopId(data.furthestUnlockedStop) ? data.furthestUnlockedStop : defaults.furthestUnlockedStop;

  const rawStops = data.stops && typeof data.stops === 'object' && !Array.isArray(data.stops) ? data.stops : {};

  const validatedStops: Record<StopId, { bestScore: number; stars: number; runsCompleted: number }> = {
    'lincoln-county': { bestScore: 0, stars: 0, runsCompleted: 0 },
    'prairie-junction': { bestScore: 0, stars: 0, runsCompleted: 0 },
    'grain-belt': { bestScore: 0, stars: 0, runsCompleted: 0 },
    'state-fair': { bestScore: 0, stars: 0, runsCompleted: 0 }
  };

  for (const stopId of VALID_STOP_IDS) {
    const rawStop = rawStops[stopId];
    if (rawStop && typeof rawStop === 'object' && !Array.isArray(rawStop)) {
      validatedStops[stopId] = {
        bestScore: Math.max(0, Math.round(Number(rawStop.bestScore) || 0)),
        stars: Math.min(3, Math.max(0, Math.round(Number(rawStop.stars) || 0))),
        runsCompleted: Math.max(0, Math.round(Number(rawStop.runsCompleted) || 0))
      };
    }
  }

  return Object.freeze({
    version: 1,
    selectedStop,
    furthestUnlockedStop,
    stops: Object.freeze(validatedStops)
  });
}
