// ============================================================================
// [SW:ARCH:PHASE4_DISTRICT_CONTRACTS]
// Typed contracts for district progression, thresholds, and transition events.
// ============================================================================

export type DistrictId = 'district-1' | 'district-2' | 'district-3';

export interface DistrictDefinition {
  readonly id: DistrictId;
  readonly index: number; // 1-indexed (1, 2, 3)
  readonly title: string;
  readonly subtitle: string;
  readonly durationSeconds: number;
  readonly scoreThreshold: number;
}

export interface DistrictTransitionEvent {
  readonly fromDistrict: DistrictId;
  readonly toDistrict: DistrictId;
  readonly timestampMs: number;
  readonly scoreAtTransition: number;
}

export interface DistrictSnapshot {
  readonly currentDistrict: DistrictId;
  readonly currentDistrictIndex: number;
  readonly districtTitle: string;
  readonly isFinalDistrict: boolean;
  readonly transitionsRecorded: readonly DistrictTransitionEvent[];
}

export const HEARTLAND_DISTRICT_DEFINITIONS: readonly DistrictDefinition[] = Object.freeze([
  Object.freeze({
    id: 'district-1',
    index: 1,
    title: 'Hart Farm & Outskirts',
    subtitle: 'Agricultural Perimeter',
    durationSeconds: 60,
    scoreThreshold: 0
  }),
  Object.freeze({
    id: 'district-2',
    index: 2,
    title: 'Lincoln County Crossroads',
    subtitle: 'Suburban Highway Corridor',
    durationSeconds: 60,
    scoreThreshold: 5000
  }),
  Object.freeze({
    id: 'district-3',
    index: 3,
    title: 'Heartland Central & Finale',
    subtitle: 'Commercial Center & Fairgrounds',
    durationSeconds: 60,
    scoreThreshold: 12000
  })
]);
