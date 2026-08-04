// ============================================================================
// [SW:ARCH:PHASE4_SAVE_SCHEMA]
// Exact severe_weather_campaign_v1 schema with deterministic recovery and
// preservation of unknown future-safe fields.
// ============================================================================

import type {
  CampaignLevelProgress,
  CampaignSaveSnapshot,
  StopId,
} from '../../gameplay/campaign/campaign-contracts';

export const CAMPAIGN_STORAGE_KEY = 'severe_weather_campaign_v1';
export const CAMPAIGN_SCHEMA_VERSION = 1 as const;

export const VALID_STOP_IDS: readonly StopId[] = Object.freeze([
  'lincoln-county',
  'prairie-junction',
  'grain-belt',
  'state-fair-finale',
]);

export interface RawCampaignLevelProgress {
  stars?: number;
  bestScore?: number;
  runs?: number;
  bestGrade?: string;
  [key: string]: unknown;
}

export interface RawCampaignSaveData {
  schema?: number;
  unlockedLevel?: number;
  selectedLevel?: number;
  levels?: Record<string, RawCampaignLevelProgress>;
  [key: string]: unknown;
}

export type ValidatedCampaignSave = CampaignSaveSnapshot;

function clampInteger(value: unknown, minimum: number, maximum: number, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.round(numeric)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isKnownStopId(value: unknown): value is StopId {
  return typeof value === 'string' && (VALID_STOP_IDS as readonly string[]).includes(value);
}

export function createDefaultSave(): ValidatedCampaignSave {
  return Object.freeze({
    schema: CAMPAIGN_SCHEMA_VERSION,
    unlockedLevel: 0,
    selectedLevel: 0,
    levels: Object.freeze({}),
  });
}

export function normalizeCampaignLevelProgress(raw: unknown): CampaignLevelProgress {
  const source = isRecord(raw) ? raw : {};
  return Object.freeze({
    ...source,
    stars: clampInteger(source.stars, 0, 3, 0),
    bestScore: clampInteger(source.bestScore, 0, Number.MAX_SAFE_INTEGER, 0),
    runs: clampInteger(source.runs, 0, Number.MAX_SAFE_INTEGER, 0),
    bestGrade: typeof source.bestGrade === 'string' && source.bestGrade.trim()
      ? source.bestGrade
      : 'F',
  });
}

export function validateCampaignSave(raw: unknown): ValidatedCampaignSave {
  if (!isRecord(raw)) return createDefaultSave();

  const source = raw as RawCampaignSaveData;
  const unlockedLevel = clampInteger(source.unlockedLevel, 0, VALID_STOP_IDS.length - 1, 0);
  const selectedLevel = Math.min(
    unlockedLevel,
    clampInteger(source.selectedLevel, 0, VALID_STOP_IDS.length - 1, 0),
  );
  const rawLevels = isRecord(source.levels) ? source.levels : {};
  const levels: Record<string, CampaignLevelProgress> = {};
  for (const [levelId, value] of Object.entries(rawLevels)) {
    levels[levelId] = normalizeCampaignLevelProgress(value);
  }

  return Object.freeze({
    ...source,
    schema: CAMPAIGN_SCHEMA_VERSION,
    unlockedLevel,
    selectedLevel,
    levels: Object.freeze(levels),
  });
}
