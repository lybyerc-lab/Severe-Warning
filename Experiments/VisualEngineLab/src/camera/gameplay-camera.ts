import { ArcRotateCamera, Scene, Vector3 } from '@babylonjs/core';

export interface CameraContract {
  type: 'ArcRotateCamera';
  pitchDegrees: number;
  fieldOfViewDegrees: number;
  distance: number;
  targetOffset: readonly [number, number, number];
  minimumZoom: number;
  maximumZoom: number;
}

export const GAMEPLAY_CAMERA_CONTRACT: CameraContract = {
  type: 'ArcRotateCamera',
  pitchDegrees: 55,
  fieldOfViewDegrees: 38,
  distance: 112,
  targetOffset: [4, 3, 2],
  minimumZoom: 76,
  maximumZoom: 140
};

export function createGameplayCamera(scene: Scene, canvas: HTMLCanvasElement): ArcRotateCamera {
  const camera = new ArcRotateCamera(
    'city-builder-camera',
    -Math.PI * 0.28,
    Math.PI * 0.305,
    GAMEPLAY_CAMERA_CONTRACT.distance,
    new Vector3(...GAMEPLAY_CAMERA_CONTRACT.targetOffset),
    scene
  );
  camera.fov = GAMEPLAY_CAMERA_CONTRACT.fieldOfViewDegrees * Math.PI / 180;
  camera.minZ = 0.2;
  camera.maxZ = 500;
  camera.lowerRadiusLimit = GAMEPLAY_CAMERA_CONTRACT.minimumZoom;
  camera.upperRadiusLimit = GAMEPLAY_CAMERA_CONTRACT.maximumZoom;
  camera.lowerBetaLimit = 0.78;
  camera.upperBetaLimit = 1.22;
  camera.panningSensibility = 0;
  camera.wheelPrecision = 1.8;
  camera.attachControl(canvas, true);
  return camera;
}
