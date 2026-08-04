// ============================================================================
// [SW:ARCH:PHASE4_DISTRICT_CONTRACTS]
// Exact contracts for the accepted three time-driven, forward-only stages.
// ============================================================================

export type DistrictStage = 1 | 2 | 3;
export type DistrictId = 'stage-1' | 'stage-2' | 'stage-3';

export interface DistrictDefinition {
  readonly id: DistrictId;
  readonly stage: DistrictStage;
  readonly defaultTitle: string;
  readonly defaultSubtitle: string;
  readonly durationSeconds: number;
  readonly beginsWhenRemainingAtOrBelowSeconds: number;
}

export interface DistrictTransitionEvent {
  readonly fromStage: DistrictStage;
  readonly toStage: DistrictStage;
  readonly timestampMs: number;
  readonly destructionScoreAtTransition: number;
  readonly title: string;
}

export interface DistrictSnapshot {
  readonly currentStage: DistrictStage;
  readonly currentDistrictId: DistrictId;
  readonly districtTitle: string;
  readonly districtSubtitle: string;
  readonly isFinalDistrict: boolean;
  readonly transitions: readonly DistrictTransitionEvent[];
  readonly rejectedRegressions: number;
}

export interface DistrictContractProbe {
  readonly passed: boolean;
  readonly checks: Readonly<Record<string, boolean>>;
  readonly transitionStages: readonly DistrictStage[];
}

export const HEARTLAND_DISTRICT_DEFINITIONS: readonly DistrictDefinition[] = Object.freeze([
  Object.freeze({
    id: 'stage-1',
    stage: 1,
    defaultTitle: 'PINE RIDGE',
    defaultSubtitle: 'Neighborhood touchdown. Mind the lawn ornaments.',
    durationSeconds: 60,
    beginsWhenRemainingAtOrBelowSeconds: 180,
  }),
  Object.freeze({
    id: 'stage-2',
    stage: 2,
    defaultTitle: 'MAIN STREET',
    defaultSubtitle: 'Signs, shops and questionable insurance coverage.',
    durationSeconds: 60,
    beginsWhenRemainingAtOrBelowSeconds: 120,
  }),
  Object.freeze({
    id: 'stage-3',
    stage: 3,
    defaultTitle: 'COUNTY FAIR',
    defaultSubtitle: 'Blackout finale. The funnel cake stand had a good run.',
    durationSeconds: 60,
    beginsWhenRemainingAtOrBelowSeconds: 60,
  }),
]);
