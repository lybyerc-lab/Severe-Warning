// ============================================================================
// [SW:ARCH:PHASE4_DISTRICT_SYSTEM]
// District authority: enforces forward-only district transitions without score reset.
// ============================================================================

import {
  HEARTLAND_DISTRICT_DEFINITIONS,
  type DistrictDefinition,
  type DistrictId,
  type DistrictSnapshot,
  type DistrictTransitionEvent
} from './district-contracts';

export class DistrictSystem {
  private currentIndex = 0; // 0-indexed into definitions array (District 1 is index 0)
  private readonly transitions: DistrictTransitionEvent[] = [];

  constructor(private readonly definitions: readonly DistrictDefinition[] = HEARTLAND_DISTRICT_DEFINITIONS) {
    if (!definitions || definitions.length === 0) {
      throw new Error('DistrictSystem requires at least one district definition.');
    }
  }

  get currentDistrict(): DistrictDefinition {
    return this.definitions[this.currentIndex] ?? this.definitions[0]!;
  }

  get currentDistrictId(): DistrictId {
    return this.currentDistrict.id;
  }

  get currentDistrictIndex(): number {
    return this.currentDistrict.index;
  }

  get isFinalDistrict(): boolean {
    return this.currentIndex >= this.definitions.length - 1;
  }

  advance(currentScore: number, nowMs: number = performance.now()): DistrictTransitionEvent | null {
    if (this.isFinalDistrict) return null;

    const fromDistrict = this.currentDistrictId;
    this.currentIndex += 1;
    const toDistrict = this.currentDistrictId;

    const transition: DistrictTransitionEvent = Object.freeze({
      fromDistrict,
      toDistrict,
      timestampMs: nowMs,
      scoreAtTransition: Math.max(0, Math.round(Number(currentScore) || 0))
    });

    this.transitions.push(transition);
    return transition;
  }

  reset(): void {
    this.currentIndex = 0;
    this.transitions.length = 0;
  }

  getSnapshot(): DistrictSnapshot {
    return Object.freeze({
      currentDistrict: this.currentDistrictId,
      currentDistrictIndex: this.currentDistrictIndex,
      districtTitle: this.currentDistrict.title,
      isFinalDistrict: this.isFinalDistrict,
      transitionsRecorded: Object.freeze([...this.transitions])
    });
  }
}
