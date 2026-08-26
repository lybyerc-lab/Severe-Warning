/**
 * Type contracts for the Nocturnal Blackout & Night Lighting system.
 */

export type TimeOfDayMode = 'DAY' | 'OVERCAST' | 'NIGHT';

export interface DistrictGridState {
  districtIndex: number;
  districtName: string;
  substationIntact: boolean;
  polesIntactCount: number;
  isBlackedOut: boolean;
  lightsEmissiveIntensity: number;
}

export interface NightLightingConfig {
  mode: TimeOfDayMode;
  nightFogColor: string;
  nightSkyColor: string;
  ambientNightIntensity: number;
  moonlightIntensity: number;
  windowEmissiveColor: string;
  streetlampEmissiveColor: string;
}

export interface BlackoutTriggerEvent {
  districtIndex: number;
  districtName: string;
  cause: string;
  timestamp: number;
  sparkCount: number;
}
