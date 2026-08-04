// ============================================================================
// [SW:ARCH:PHASE5_HART_FARM_DEFINITION]
// Exact accepted Hart Farm stage contract from setProductionBarnStage() and
// damageProductionBarn(). No thresholds, score values, or audio are invented.
// ============================================================================

import type { SetpieceDefinition } from './destructible-setpiece-contracts';

export const HART_FARM_SETPIECE_DEFINITION: SetpieceDefinition = Object.freeze({
  id: 'hart-farm-barn',
  name: 'Hart Farm Signature Barn',
  category: 'farmstead',
  stages: Object.freeze([
    Object.freeze({
      stageId: 'intact',
      legacyStage: 0,
      label: 'INTACT',
      remainingHealthAtOrBelow: null,
      scorePoints: 0,
      audioEventName: null,
    }),
    Object.freeze({
      stageId: 'damaged',
      legacyStage: 1,
      label: 'DAMAGED',
      remainingHealthAtOrBelow: 0.78,
      scorePoints: 140,
      audioEventName: null,
    }),
    Object.freeze({
      stageId: 'roof-peel',
      legacyStage: 2,
      label: 'ROOF PEEL',
      remainingHealthAtOrBelow: 0.52,
      scorePoints: 210,
      audioEventName: null,
    }),
    Object.freeze({
      stageId: 'exposed',
      legacyStage: 3,
      label: 'EXPOSED',
      remainingHealthAtOrBelow: 0.25,
      scorePoints: 280,
      audioEventName: null,
    }),
    Object.freeze({
      stageId: 'wreckage',
      legacyStage: 4,
      label: 'BARN DOWN',
      remainingHealthAtOrBelow: 0,
      scorePoints: 720,
      audioEventName: 'collapse',
    }),
  ]),
});
