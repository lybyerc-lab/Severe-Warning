/**
 * Type contracts for the Sky-Cam News Chopper (Action Chopper 8) broadcast system.
 */

export interface NewsChopperConfig {
  flightAltitude: number;   // meters (e.g. 52m)
  orbitRadius: number;      // distance from storm center (e.g. 48m)
  orbitSpeed: number;       // rad/s (e.g. 0.35)
  mainRotorRpm: number;     // visual spin rate
  tailRotorRpm: number;
  spotlightAngle: number;   // spotlight beam spread
  spotlightIntensity: number;
  liveFeedDuration: number; // seconds CRT overlay stays open
  scoopScoreReward: number; // points for aerial scoop
}

export interface NewsChopperState {
  active: boolean;
  x: number;
  y: number;
  z: number;
  heading: number;
  pitch: number;
  roll: number;
  mainRotorAngle: number;
  tailRotorAngle: number;
  targetFocusX: number;
  targetFocusY: number;
  targetFocusZ: number;
  isFilming: boolean;
  liveFeedActive: boolean;
  liveFeedTimer: number;
  totalScoopsAwarded: number;
  callsign: string;
}

export interface AerialScoopEvent {
  subjectName: string;
  altitude: number;
  points: number;
  timestamp: number;
}
