// ============================================================================
// [SW:PLAYCANVAS:GEOMETRY_LAWS]
// Explicit vertical contracts for terrain, roads, and tornado contact.
// ============================================================================

export const PLAYCANVAS_VERSION = '2.21.3';
export const TERRAIN_TOP_Y = 0;
export const ROAD_TOP_Y = 0.1;
export const TORNADO_BASE_Y = 0.28;
export const ROAD_CLEARANCE = ROAD_TOP_Y - TERRAIN_TOP_Y;
export const TORNADO_GROUND_CLEARANCE = TORNADO_BASE_Y - ROAD_TOP_Y;
