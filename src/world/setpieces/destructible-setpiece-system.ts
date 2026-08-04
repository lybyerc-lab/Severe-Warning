// ============================================================================
// [SW:ARCH:PHASE5_SETPIECE_SYSTEM]
// Setpiece destruction authority: manages state transitions for setpiece definitions.
// ============================================================================

import { HART_FARM_SETPIECE_DEFINITION } from './hart-farm-definition';
import type {
  DestructionStageId,
  SetpieceDefinition,
  SetpieceStageDefinition,
  SetpieceStateSnapshot
} from './destructible-setpiece-contracts';

export class DestructibleSetpieceSystem {
  private currentDamageRatio = 0.0;
  private currentStageIndex = 0; // 0-indexed into definition.stages
  private scoreAwarded = 0;

  constructor(private readonly definition: SetpieceDefinition = HART_FARM_SETPIECE_DEFINITION) {
    if (!definition || !definition.stages || definition.stages.length === 0) {
      throw new Error('DestructibleSetpieceSystem requires valid setpiece definition.');
    }
  }

  get id(): string {
    return this.definition.id;
  }

  get currentStage(): SetpieceStageDefinition {
    return this.definition.stages[this.currentStageIndex] ?? this.definition.stages[0]!;
  }

  get currentStageId(): DestructionStageId {
    return this.currentStage.stageId;
  }

  applyDamage(damageRatio: number): SetpieceStageDefinition | null {
    const validDamage = Math.min(1.0, Math.max(0.0, Number(damageRatio) || 0.0));
    this.currentDamageRatio = Math.max(this.currentDamageRatio, validDamage);

    let highestEligibleIndex = this.currentStageIndex;
    for (let i = 0; i < this.definition.stages.length; i++) {
      if (this.currentDamageRatio >= this.definition.stages[i]!.damageThresholdRatio) {
        highestEligibleIndex = i;
      }
    }

    if (highestEligibleIndex > this.currentStageIndex) {
      this.currentStageIndex = highestEligibleIndex;
      const newStage = this.currentStage;
      this.scoreAwarded += newStage.scorePoints;
      return newStage;
    }

    return null;
  }

  reset(): void {
    this.currentDamageRatio = 0.0;
    this.currentStageIndex = 0;
    this.scoreAwarded = 0;
  }

  getSnapshot(): SetpieceStateSnapshot {
    return Object.freeze({
      setpieceId: this.definition.id,
      currentStageId: this.currentStageId,
      currentStageIndex: this.currentStage.stageIndex,
      damageRatio: Number(this.currentDamageRatio.toFixed(2)),
      isFullyDestroyed: this.currentStageIndex >= this.definition.stages.length - 1,
      scoreAwardedTotal: this.scoreAwarded
    });
  }
}
