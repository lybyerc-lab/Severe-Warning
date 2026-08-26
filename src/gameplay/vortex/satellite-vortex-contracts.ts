/**
 * Type contracts for the Satellite Vortex (Twin Tornadoes) system.
 */

export interface SatelliteVortexConfig {
  orbitRadius: number; // meters from primary vortex
  orbitSpeed: number;  // rad/s
  suctionRadius: number; // meters of attraction
  damageRadius: number;  // meters of contact destruction
  damageRate: number;    // damage points / sec
  funnelHeight: number;  // visual height in meters
  scale: number;         // ratio to main funnel (e.g. 0.48)
}

export interface SatelliteVortexState {
  unlocked: boolean;
  active: boolean;
  angle: number;
  worldX: number;
  worldZ: number;
  orbitRadius: number;
  orbitSpeed: number;
  suctionRadius: number;
  damageRadius: number;
  comboCount: number;
  lastDamageTimestamp: number;
}

export interface SatelliteVortexHitEvent {
  targetId: string;
  targetName: string;
  damage: number;
  destroyed: boolean;
  points: number;
}
