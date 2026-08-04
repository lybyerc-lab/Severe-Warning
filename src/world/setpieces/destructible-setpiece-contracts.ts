// ============================================================================
// [SW:ARCH:PHASE5_SETPIECE_CONTRACTS]
// Reusable data-driven setpiece destruction contracts and stage definitions.
// ============================================================================

export type DestructionStageId = 'intact' | 'damaged' | 'roof-peel' | 'exposed' | 'wreckage';

export interface SetpieceStageDefinition {
  readonly stageId: DestructionStageId;
  readonly stageIndex: number; // 1-indexed (1 to 5)
  readonly name: string;
  readonly damageThresholdRatio: number; // 0.0 to 1.0
  readonly scorePoints: number;
  readonly audioEventName: string | null;
}

export interface SetpieceDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: 'farmstead' | 'industrial' | 'commercial' | 'civic';
  readonly stages: readonly SetpieceStageDefinition[];
}

export interface SetpieceStateSnapshot {
  readonly setpieceId: string;
  readonly currentStageId: DestructionStageId;
  readonly currentStageIndex: number;
  readonly damageRatio: number;
  readonly isFullyDestroyed: boolean;
  readonly scoreAwardedTotal: number;
}
