// ============================================================================
// [SW:ARCH:PHASE5_SECOND_STRUCTURE_DEFINITION]
// Reuse proof for the existing primary campaign landmark. Legacy landmarks have
// two authored states only: intact and destroyed. No intermediate silo art or
// behavior is invented.
// ============================================================================

import type { SetpieceDefinition } from './destructible-setpiece-contracts.ts';

export const PRIMARY_LANDMARK_SETPIECE_DEFINITION: SetpieceDefinition = Object.freeze({
  id: 'primary-campaign-landmark',
  name: 'Primary Campaign Landmark',
  category: 'landmark',
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
      label: 'DESTROYED',
      remainingHealthAtOrBelow: 0,
      scorePoints: 500,
      audioEventName: null,
    }),
  ]),
});

// Compatibility export retained inside the unaccepted Phase 5 branch while the
// application context is migrated from the original Antigravity naming.
export const GRAIN_SILO_SETPIECE_DEFINITION = PRIMARY_LANDMARK_SETPIECE_DEFINITION;
