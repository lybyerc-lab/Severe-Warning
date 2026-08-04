// ============================================================================
// [SW:ARCH:PHASE4_DISTRICT_SYSTEM]
// Typed mirror for the accepted time-driven, forward-only district stages.
// ============================================================================

import {
  HEARTLAND_DISTRICT_DEFINITIONS,
  type DistrictContractProbe,
  type DistrictDefinition,
  type DistrictId,
  type DistrictSnapshot,
  type DistrictStage,
  type DistrictTransitionEvent,
} from './district-contracts';

function normalizeStage(value: number): DistrictStage {
  if (value >= 3) return 3;
  if (value >= 2) return 2;
  return 1;
}

export class DistrictSystem {
  private currentStageValue: DistrictStage = 1;
  private title = HEARTLAND_DISTRICT_DEFINITIONS[0]!.defaultTitle;
  private subtitle = HEARTLAND_DISTRICT_DEFINITIONS[0]!.defaultSubtitle;
  private readonly transitions: DistrictTransitionEvent[] = [];
  private rejectedRegressionsValue = 0;

  constructor(private readonly definitions: readonly DistrictDefinition[] = HEARTLAND_DISTRICT_DEFINITIONS) {
    if (definitions.length !== 3) throw new Error('DistrictSystem requires the accepted three-stage contract.');
  }

  get currentStage(): DistrictStage {
    return this.currentStageValue;
  }

  get currentDistrictIndex(): DistrictStage {
    return this.currentStageValue;
  }

  get currentDistrictId(): DistrictId {
    return `stage-${this.currentStageValue}` as DistrictId;
  }

  get isFinalDistrict(): boolean {
    return this.currentStageValue === 3;
  }

  observeLegacyState(
    stage: number,
    destructionScore: number,
    title?: string,
    subtitle?: string,
    nowMs = performance.now(),
  ): DistrictTransitionEvent | null {
    const next = normalizeStage(stage);
    if (next < this.currentStageValue) {
      this.rejectedRegressionsValue += 1;
      return null;
    }

    const nextDefinition = this.definitions[next - 1]!;
    const nextTitle = String(title || nextDefinition.defaultTitle);
    const nextSubtitle = String(subtitle || nextDefinition.defaultSubtitle);
    if (next === this.currentStageValue) {
      this.title = nextTitle;
      this.subtitle = nextSubtitle;
      return null;
    }

    const event: DistrictTransitionEvent = Object.freeze({
      fromStage: this.currentStageValue,
      toStage: next,
      timestampMs: Number.isFinite(nowMs) ? Math.max(0, nowMs) : 0,
      destructionScoreAtTransition: Math.max(0, Math.round(Number(destructionScore) || 0)),
      title: nextTitle,
    });
    this.currentStageValue = next;
    this.title = nextTitle;
    this.subtitle = nextSubtitle;
    this.transitions.push(event);
    return event;
  }

  reset(title?: string, subtitle?: string): void {
    this.currentStageValue = 1;
    this.title = String(title || this.definitions[0]!.defaultTitle);
    this.subtitle = String(subtitle || this.definitions[0]!.defaultSubtitle);
    this.transitions.length = 0;
    this.rejectedRegressionsValue = 0;
  }

  getSnapshot(): DistrictSnapshot {
    return Object.freeze({
      currentStage: this.currentStageValue,
      currentDistrictId: this.currentDistrictId,
      districtTitle: this.title,
      districtSubtitle: this.subtitle,
      isFinalDistrict: this.isFinalDistrict,
      transitions: Object.freeze([...this.transitions]),
      rejectedRegressions: this.rejectedRegressionsValue,
    });
  }

  runContractProbe(): DistrictContractProbe {
    const probe = new DistrictSystem(this.definitions);
    probe.reset('PINE RIDGE');
    const stage2 = probe.observeLegacyState(2, 3999, 'MAIN STREET', '', 1000);
    const stage3 = probe.observeLegacyState(3, 7999, 'COUNTY FAIR', '', 2000);
    probe.observeLegacyState(2, 9000, 'MAIN STREET', '', 3000);
    const snapshot = probe.getSnapshot();
    const checks = Object.freeze({
      threeSixtySecondStages: this.definitions.every((definition) => definition.durationSeconds === 60),
      timeDrivenBoundaries: this.definitions[1]?.beginsWhenRemainingAtOrBelowSeconds === 120
        && this.definitions[2]?.beginsWhenRemainingAtOrBelowSeconds === 60,
      stageTwoRecorded: stage2?.fromStage === 1 && stage2.toStage === 2,
      stageThreeRecorded: stage3?.fromStage === 2 && stage3.toStage === 3,
      scoreIsObservedNotReset: stage2?.destructionScoreAtTransition === 3999
        && stage3?.destructionScoreAtTransition === 7999,
      regressionRejected: snapshot.currentStage === 3 && snapshot.rejectedRegressions === 1,
      transitionOrderForwardOnly: snapshot.transitions.every(
        (event, index, list) => index === 0 || event.toStage >= list[index - 1]!.toStage,
      ),
    });
    return Object.freeze({
      passed: Object.values(checks).every(Boolean),
      checks,
      transitionStages: Object.freeze(snapshot.transitions.map((event) => event.toStage)),
    });
  }
}
