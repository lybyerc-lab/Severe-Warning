/**
 * [SW:ARCH:OPENING_CINEMATIC_CONTRACTS]
 * Type contracts for the Moo Brew Touchdown opening cutscene and camera handoff.
 */

export interface CinematicCameraPosition {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  fov: number;
}

export interface CinematicTimelineBeat {
  id: string;
  start: number;
  end: number;
  description: string;
}

export interface OpeningCinematicSnapshot {
  active: boolean;
  elapsedSeconds: number;
  durationSeconds: number;
  currentBeat: string;
  camera: CinematicCameraPosition;
  canSkip: boolean;
  isCompleted: boolean;
}

export interface OpeningCinematicContract {
  start(): void;
  update(deltaSeconds: number): void;
  skip(): void;
  getSnapshot(): OpeningCinematicSnapshot;
  dispose(): void;
}
