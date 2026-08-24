// ============================================================================
// [SW:ARCH:PHASE5_SETPIECE_CONTRACTS]
// Reusable read-only destruction contracts mapped from accepted legacy stages.
// ============================================================================

export type DestructionStageId =
  | 'intact'
  | 'damaged'
  | 'roof-peel'
  | 'exposed'
  | 'wreckage'
  | 'destroyed';

export interface SetpieceStageDefinition {
  readonly stageId: DestructionStageId;
  readonly legacyStage: number;
  readonly label: string;
  readonly remainingHealthAtOrBelow: number | null;
  readonly scorePoints: number;
  readonly audioEventName: string | null;
}

export interface SetpieceDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: 'farmstead' | 'landmark' | 'chain' | 'substation';
  readonly stages: readonly SetpieceStageDefinition[];
}

export interface SetpieceStateSnapshot {
  readonly setpieceId: string;
  readonly displayName: string;
  readonly currentStageId: DestructionStageId;
  readonly legacyStage: number;
  readonly health: number;
  readonly maxHealth: number;
  readonly remainingHealthRatio: number;
  readonly isFullyDestroyed: boolean;
  readonly scoreAwardedTotal: number;
  readonly detachedPieceCount: number;
}
