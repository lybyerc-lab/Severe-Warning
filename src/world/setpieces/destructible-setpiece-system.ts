// ============================================================================
// [SW:ARCH:PHASE5_SETPIECE_SYSTEM]
// Passive mirror of an accepted legacy destructible setpiece.
// ============================================================================

import type {
  SetpieceDefinition,
  SetpieceStateSnapshot,
} from './destructible-setpiece-contracts';

export class DestructibleSetpieceSystem {
  private snapshot: SetpieceStateSnapshot | null = null;

  constructor(private readonly definition: SetpieceDefinition) {
    if (!definition.stages.length) {
      throw new Error('DestructibleSetpieceSystem requires at least one accepted legacy stage.');
    }
  }

  get id(): string {
    return this.definition.id;
  }

  getDefinition(): SetpieceDefinition {
    return this.definition;
  }

  synchronize(snapshot: SetpieceStateSnapshot): void {
    if (snapshot.setpieceId !== this.definition.id) {
      throw new Error(`Setpiece snapshot ${snapshot.setpieceId} does not match ${this.definition.id}.`);
    }
    if (!this.definition.stages.some((stage) => stage.stageId === snapshot.currentStageId)) {
      throw new Error(`Unsupported ${this.definition.id} stage: ${snapshot.currentStageId}.`);
    }
    this.snapshot = Object.freeze({ ...snapshot });
  }

  reset(): void {
    // The accepted legacy setpiece owns damage, score, audio, reset, and debris.
  }

  getSnapshot(): SetpieceStateSnapshot {
    if (!this.snapshot) throw new Error(`${this.definition.id} has not synchronized with the live setpiece.`);
    return this.snapshot;
  }
}
