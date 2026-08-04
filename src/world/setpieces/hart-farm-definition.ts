// ============================================================================
// [SW:ARCH:PHASE5_HART_FARM_DEFINITION]
// Data-driven definition for the canonical Hart Farm 5-Stage Destruction Setpiece.
// ============================================================================

import type { SetpieceDefinition } from './destructible-setpiece-contracts';

export const HART_FARM_SETPIECE_DEFINITION: SetpieceDefinition = Object.freeze({
  id: 'hart-farm-barn',
  name: 'Hart Farm Signature Barn',
  category: 'farmstead',
  stages: Object.freeze([
    Object.freeze({
      stageId: 'intact',
      stageIndex: 1,
      name: 'Intact Structure',
      damageThresholdRatio: 0.0,
      scorePoints: 0,
      audioEventName: null
    }),
    Object.freeze({
      stageId: 'damaged',
      stageIndex: 2,
      name: 'Wall Cracks & Shingle Damage',
      damageThresholdRatio: 0.15,
      scorePoints: 100,
      audioEventName: 'wood_creak'
    }),
    Object.freeze({
      stageId: 'roof-peel',
      stageIndex: 3,
      name: 'Roof Panel Peel & Separation',
      damageThresholdRatio: 0.40,
      scorePoints: 250,
      audioEventName: 'roof_peel_flight_plan'
    }),
    Object.freeze({
      stageId: 'exposed',
      stageIndex: 4,
      name: 'Exposed Timber & Framing',
      damageThresholdRatio: 0.65,
      scorePoints: 400,
      audioEventName: 'timber_crack'
    }),
    Object.freeze({
      stageId: 'wreckage',
      stageIndex: 5,
      name: 'Complete Rubble Wreckage',
      damageThresholdRatio: 0.90,
      scorePoints: 750,
      audioEventName: 'barn_collapse_finale'
    })
  ])
});
