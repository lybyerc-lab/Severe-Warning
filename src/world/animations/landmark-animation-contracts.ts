/**
 * [SW:ARCH:LANDMARK_ANIMATION_CONTRACTS]
 * Type contracts for animated county fair rides and industrial landmarks.
 */

export interface LandmarkAnimationState {
  readonly ferrisWheelAngle: number;
  readonly carouselAngle: number;
  readonly horseGallopOffsets: readonly number[];
  readonly foundrySmokeCount: number;
  readonly crucibleGlowIntensity: number;
  readonly isNightFairLit: boolean;
}

export interface LandmarkAnimationSnapshot {
  readonly active: boolean;
  readonly state: LandmarkAnimationState;
  readonly totalElapsedSeconds: number;
}

export interface LandmarkAnimationContract {
  update(deltaSeconds: number, windDirectionX?: number, windDirectionZ?: number): void;
  getSnapshot(): LandmarkAnimationSnapshot;
  reset(): void;
}
