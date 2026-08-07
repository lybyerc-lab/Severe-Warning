// ============================================================================
// [SW:PLAYCANVAS:PRAIRIE_JUNCTION_SCENE]
// Authored road, terrain, Cow 17, buildings, lights, and tornado proof.
// ============================================================================

import { ROAD_TOP_Y, TORNADO_BASE_Y } from './constants';
import type { PcApplication, PcEntity, PlayCanvasModule } from './engine-types';
import {
  addBuilding,
  addCow17,
  addElectricalTarget,
  addPrimitive,
  addRoadMarkings,
  addVehicle,
  type BuildingParts,
  type OffsetEntity,
} from './geometry';
import { createMaterial } from './materials';

export interface SceneResult {
  readonly entities: readonly PcEntity[];
  readonly camera: PcEntity;
  readonly tornadoParts: readonly PcEntity[];
  readonly tornadoPartY: readonly number[];
  readonly mooBrew: BuildingParts;
  readonly cow17Parts: readonly OffsetEntity[];
  readonly vehicleParts: readonly OffsetEntity[];
  readonly electricalParts: readonly OffsetEntity[];
  readonly anchors: Readonly<{
    tornado: Readonly<{ x: number; z: number }>;
    barnProxy: Readonly<{ x: number; z: number }>;
    cow17: Readonly<{ x: number; z: number }>;
    vehicle: Readonly<{ x: number; z: number }>;
    electrical: Readonly<{ x: number; z: number }>;
  }>;
}

export function populatePrairieJunctionScene(
  pc: PlayCanvasModule,
  app: PcApplication,
): SceneResult {
  const entities: PcEntity[] = [];
  const sky = new pc.Color(0.12, 0.19, 0.25);
  app.scene.ambientLight = new pc.Color(0.36, 0.42, 0.45);

  // [SW:PLAYCANVAS:STORM_FOLLOW_CAMERA]
  // The bootstrap owns the final follow position. This authored diagonal pose
  // is only the pre-authority starting frame and preserves the miniature
  // isometric character while the accepted gameplay bridge connects.
  const camera = new pc.Entity('slice-camera');
  camera.addComponent('camera', { clearColor: sky, nearClip: 0.1, farClip: 220, fov: 44 });
  camera.setPosition(30, 28, 36);
  camera.lookAt(0, 3.2, 0);
  app.root.addChild(camera);
  entities.push(camera);

  const keyLight = new pc.Entity('storm-key-light');
  keyLight.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1, 0.88, 0.68),
    intensity: 1.8,
    castShadows: true,
    shadowDistance: 110,
    shadowResolution: 2048,
    normalOffsetBias: 0.06,
    shadowBias: 0.2,
  });
  keyLight.setEulerAngles(48, -34, 0);
  app.root.addChild(keyLight);
  entities.push(keyLight);

  const fillLight = new pc.Entity('storm-fill-light');
  fillLight.addComponent('light', {
    type: 'directional',
    color: new pc.Color(0.29, 0.42, 0.62),
    intensity: 0.55,
    castShadows: false,
  });
  fillLight.setEulerAngles(25, 145, 0);
  app.root.addChild(fillLight);
  entities.push(fillLight);

  const grass = createMaterial(pc, [0.24, 0.37, 0.19], { gloss: 0.08 });
  const asphalt = createMaterial(pc, [0.12, 0.14, 0.16], { gloss: 0.28 });
  const concrete = createMaterial(pc, [0.46, 0.47, 0.45], { gloss: 0.2 });
  const roadPaint = createMaterial(pc, [0.88, 0.68, 0.18], {
    emissive: [0.16, 0.09, 0.01],
    emissiveIntensity: 0.15,
  });
  const brick = createMaterial(pc, [0.53, 0.19, 0.12], { gloss: 0.2 });
  const cream = createMaterial(pc, [0.77, 0.68, 0.5], { gloss: 0.18 });
  const roof = createMaterial(pc, [0.16, 0.2, 0.23], { metalness: 0.18, gloss: 0.4 });
  const white = createMaterial(pc, [0.87, 0.86, 0.8], { gloss: 0.25 });
  const black = createMaterial(pc, [0.035, 0.045, 0.05], { gloss: 0.3 });
  const pink = createMaterial(pc, [0.73, 0.39, 0.38], { gloss: 0.2 });
  const vehicleRed = createMaterial(pc, [0.58, 0.08, 0.05], { metalness: 0.12, gloss: 0.55 });
  const electricalMetal = createMaterial(pc, [0.24, 0.29, 0.32], { metalness: 0.48, gloss: 0.58 });
  const electricalHot = createMaterial(pc, [0.68, 0.76, 0.84], {
    emissive: [0.18, 0.42, 0.74],
    emissiveIntensity: 0.9,
    gloss: 0.5,
  });
  const funnelMaterial = createMaterial(pc, [0.25, 0.29, 0.31], {
    opacity: 0.72,
    gloss: 0.05,
    doubleSided: true,
  });
  const dustMaterial = createMaterial(pc, [0.46, 0.36, 0.23], {
    opacity: 0.52,
    gloss: 0,
    doubleSided: true,
  });

  addPrimitive(pc, app, entities, {
    name: 'terrain-slab',
    type: 'box',
    position: [0, -0.4, 0],
    scale: [82, 0.8, 82],
    material: grass,
  });

  addPrimitive(pc, app, entities, {
    name: 'road-north-south',
    type: 'box',
    position: [0, ROAD_TOP_Y - 0.06, 0],
    scale: [9, 0.12, 76],
    material: asphalt,
  });
  addPrimitive(pc, app, entities, {
    name: 'road-east-west',
    type: 'box',
    position: [0, ROAD_TOP_Y - 0.06, 0],
    scale: [76, 0.12, 9],
    material: asphalt,
  });

  addPrimitive(pc, app, entities, {
    name: 'sidewalk-west',
    type: 'box',
    position: [-5.25, ROAD_TOP_Y + 0.035, 0],
    scale: [1.25, 0.13, 76],
    material: concrete,
  });
  addPrimitive(pc, app, entities, {
    name: 'sidewalk-east',
    type: 'box',
    position: [5.25, ROAD_TOP_Y + 0.035, 0],
    scale: [1.25, 0.13, 76],
    material: concrete,
  });
  addPrimitive(pc, app, entities, {
    name: 'sidewalk-north',
    type: 'box',
    position: [0, ROAD_TOP_Y + 0.04, -5.25],
    scale: [76, 0.14, 1.25],
    material: concrete,
  });
  addPrimitive(pc, app, entities, {
    name: 'sidewalk-south',
    type: 'box',
    position: [0, ROAD_TOP_Y + 0.04, 5.25],
    scale: [76, 0.14, 1.25],
    material: concrete,
  });
  addRoadMarkings(pc, app, entities, roadPaint);

  const mooBrew = addBuilding(pc, app, entities, {
    name: 'moo-brew-corner-shop',
    x: -14,
    z: -13,
    width: 10,
    depth: 8,
    height: 6,
    wall: brick,
    roof,
  });
  addBuilding(pc, app, entities, {
    name: 'prairie-apartments',
    x: 15,
    z: -14,
    width: 11,
    depth: 9,
    height: 10,
    wall: cream,
    roof,
  });
  addBuilding(pc, app, entities, {
    name: 'junction-hardware',
    x: -15,
    z: 14,
    width: 12,
    depth: 9,
    height: 5,
    wall: cream,
    roof,
  });

  const cow17Parts = addCow17(pc, app, entities, white, black, pink);
  const vehicleParts = addVehicle(pc, app, entities, vehicleRed, black);
  const electricalParts = addElectricalTarget(pc, app, entities, electricalMetal, electricalHot);

  // [SW:PLAYCANVAS:FUNNEL_ORIENTATION]
  // Narrow ground contact, broad storm base, downward-facing cone points.
  const tornadoParts: PcEntity[] = [];
  const tornadoPartY: number[] = [];
  const funnelScales = [
    [1.3, 4.5, 1.3],
    [2.15, 4.1, 2.15],
    [3.0, 3.6, 3.0],
    [3.9, 3.2, 3.9],
    [4.8, 2.8, 4.8],
    [5.8, 2.4, 5.8],
  ] as const;
  let funnelY = TORNADO_BASE_Y;
  funnelScales.forEach((scale, index) => {
    const centerY = funnelY + scale[1] / 2;
    const part = addPrimitive(pc, app, entities, {
      name: `tornado-funnel-${index}`,
      type: 'cone',
      position: [-8, centerY, 8],
      scale,
      rotation: [180, 0, 0],
      material: funnelMaterial,
      castShadows: false,
      receiveShadows: false,
    });
    tornadoParts.push(part);
    tornadoPartY.push(centerY);
    funnelY += scale[1] * 0.72;
  });

  const dust = addPrimitive(pc, app, entities, {
    name: 'tornado-dust-foot',
    type: 'cylinder',
    position: [-8, TORNADO_BASE_Y, 8],
    scale: [6.6, 0.18, 6.6],
    material: dustMaterial,
    castShadows: false,
    receiveShadows: false,
  });
  tornadoParts.push(dust);
  tornadoPartY.push(TORNADO_BASE_Y);

  return Object.freeze({
    entities: Object.freeze([...entities]),
    camera,
    tornadoParts: Object.freeze([...tornadoParts]),
    tornadoPartY: Object.freeze([...tornadoPartY]),
    mooBrew,
    cow17Parts,
    vehicleParts,
    electricalParts,
    anchors: Object.freeze({
      tornado: Object.freeze({ x: -8, z: 8 }),
      barnProxy: Object.freeze({ x: mooBrew.center.x, z: mooBrew.center.z }),
      cow17: Object.freeze({ x: 12, z: 10 }),
      vehicle: Object.freeze({ x: 10, z: -2.1 }),
      electrical: Object.freeze({ x: 18, z: 15 }),
    }),
  });
}
