// ============================================================================
// [SW:ARCH:PHASE5_CHAIN_SETPIECE_DEFINITIONS]
// Data-driven setpiece definitions for destructible roadside scenery and utilities.
// Mapped directly from createChainSetpieceMesh() and createSubstationMesh().
// ============================================================================

import type { SetpieceDefinition } from './destructible-setpiece-contracts';

export const GAS_STATION_SETPIECE_DEFINITION: SetpieceDefinition = Object.freeze({
  id: 'last-chance-gas',
  name: 'Last Chance Gas Station',
  category: 'chain',
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
      stageId: 'destroyed',
      legacyStage: 1,
      label: 'GAS STATION EXPLODED',
      remainingHealthAtOrBelow: 0,
      scorePoints: 700,
      audioEventName: 'setpiece_explosion',
    }),
  ]),
});

export const CARWASH_SETPIECE_DEFINITION: SetpieceDefinition = Object.freeze({
  id: 'twister-shine-carwash',
  name: 'Twister Shine Car Wash',
  category: 'chain',
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
      stageId: 'destroyed',
      legacyStage: 1,
      label: 'CAR WASH FLATTENED',
      remainingHealthAtOrBelow: 0,
      scorePoints: 700,
      audioEventName: 'setpiece_explosion',
    }),
  ]),
});

export const SUBSTATION_SETPIECE_DEFINITION: SetpieceDefinition = Object.freeze({
  id: 'power-substation',
  name: 'Lincoln County Power Substation',
  category: 'substation',
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
      stageId: 'destroyed',
      legacyStage: 1,
      label: 'SUBSTATION SURGE',
      remainingHealthAtOrBelow: 0,
      scorePoints: 350,
      audioEventName: 'substation_arc',
    }),
  ]),
});
