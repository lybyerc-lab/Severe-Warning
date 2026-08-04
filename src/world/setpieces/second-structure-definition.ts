// ============================================================================
// [SW:ARCH:PHASE5_SECOND_STRUCTURE_DEFINITION]
// Data-driven definition proving contract reuse on a 2nd existing structure (Grain Silo).
// ============================================================================

import type { SetpieceDefinition } from './destructible-setpiece-contracts';

export const GRAIN_SILO_SETPIECE_DEFINITION: SetpieceDefinition = Object.freeze({
  id: 'lincoln-grain-silo',
  name: 'Lincoln County Grain Silo',
  category: 'industrial',
  stages: Object.freeze([
    Object.freeze({
      stageId: 'intact',
      stageIndex: 1,
      name: 'Intact Concrete Silo',
      damageThresholdRatio: 0.0,
      scorePoints: 0,
      audioEventName: null
    }),
    Object.freeze({
      stageId: 'damaged',
      stageIndex: 2,
      name: 'Scorched & Chipped Surface',
      damageThresholdRatio: 0.20,
      scorePoints: 150,
      audioEventName: 'metal_impact'
    }),
    Object.freeze({
      stageId: 'roof-peel',
      stageIndex: 3,
      name: 'Dome Cap Detachment',
      damageThresholdRatio: 0.45,
      scorePoints: 300,
      audioEventName: 'cap_pop'
    }),
    Object.freeze({
      stageId: 'exposed',
      stageIndex: 4,
      name: 'Structural Wall Fracture',
      damageThresholdRatio: 0.70,
      scorePoints: 500,
      audioEventName: 'concrete_crack'
    }),
    Object.freeze({
      stageId: 'wreckage',
      stageIndex: 5,
      name: 'Silo Collapse Rubble',
      damageThresholdRatio: 0.95,
      scorePoints: 900,
      audioEventName: 'silo_collapse'
    })
  ])
});
