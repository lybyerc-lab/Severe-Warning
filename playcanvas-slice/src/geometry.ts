// ============================================================================
// [SW:PLAYCANVAS:AUTHORED_GEOMETRY]
// Reusable low-poly geometry helpers for the bounded Prairie Junction proof.
// ============================================================================

import { ROAD_TOP_Y } from './constants';
import type { PcApplication, PcEntity, PcMaterial, PlayCanvasModule } from './engine-types';

export function addPrimitive(
  pc: PlayCanvasModule,
  app: PcApplication,
  entities: PcEntity[],
  options: {
    readonly name: string;
    readonly type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'capsule';
    readonly position: readonly [number, number, number];
    readonly scale: readonly [number, number, number];
    readonly material: PcMaterial;
    readonly rotation?: readonly [number, number, number];
    readonly castShadows?: boolean;
    readonly receiveShadows?: boolean;
  },
): PcEntity {
  const entity = new pc.Entity(options.name);
  entity.addComponent('render', { type: options.type });
  entity.setPosition(...options.position);
  entity.setLocalScale(...options.scale);
  if (options.rotation) entity.setEulerAngles(...options.rotation);
  if (!entity.render) throw new Error(`Render component missing on ${options.name}.`);
  entity.render.material = options.material;
  entity.render.castShadows = options.castShadows ?? true;
  entity.render.receiveShadows = options.receiveShadows ?? true;
  app.root.addChild(entity);
  entities.push(entity);
  return entity;
}

export function addRoadMarkings(
  pc: PlayCanvasModule,
  app: PcApplication,
  entities: PcEntity[],
  paint: PcMaterial,
): void {
  for (let offset = -32; offset <= 32; offset += 4) {
    if (Math.abs(offset) < 6) continue;
    addPrimitive(pc, app, entities, {
      name: `north-south-centerline-${offset}`,
      type: 'box',
      position: [0, ROAD_TOP_Y + 0.018, offset],
      scale: [0.16, 0.025, 1.7],
      material: paint,
      castShadows: false,
    });
    addPrimitive(pc, app, entities, {
      name: `east-west-centerline-${offset}`,
      type: 'box',
      position: [offset, ROAD_TOP_Y + 0.018, 0],
      scale: [1.7, 0.025, 0.16],
      material: paint,
      castShadows: false,
    });
  }
}

export function addBuilding(
  pc: PlayCanvasModule,
  app: PcApplication,
  entities: PcEntity[],
  options: {
    readonly name: string;
    readonly x: number;
    readonly z: number;
    readonly width: number;
    readonly depth: number;
    readonly height: number;
    readonly wall: PcMaterial;
    readonly roof: PcMaterial;
  },
): void {
  addPrimitive(pc, app, entities, {
    name: `${options.name}-walls`,
    type: 'box',
    position: [options.x, options.height / 2, options.z],
    scale: [options.width, options.height, options.depth],
    material: options.wall,
  });
  addPrimitive(pc, app, entities, {
    name: `${options.name}-roof`,
    type: 'box',
    position: [options.x, options.height + 0.45, options.z],
    scale: [options.width + 0.6, 0.5, options.depth + 0.6],
    material: options.roof,
  });
}

export function addCow17(
  pc: PlayCanvasModule,
  app: PcApplication,
  entities: PcEntity[],
  white: PcMaterial,
  black: PcMaterial,
  pink: PcMaterial,
): void {
  const baseX = 12;
  const baseZ = 10;
  addPrimitive(pc, app, entities, {
    name: 'cow-17-body',
    type: 'capsule',
    position: [baseX, 1.3, baseZ],
    scale: [1.25, 1.7, 0.92],
    rotation: [0, 0, 90],
    material: white,
  });
  addPrimitive(pc, app, entities, {
    name: 'cow-17-head',
    type: 'box',
    position: [baseX - 1.55, 1.45, baseZ],
    scale: [0.85, 0.8, 0.8],
    material: white,
  });
  addPrimitive(pc, app, entities, {
    name: 'cow-17-muzzle',
    type: 'box',
    position: [baseX - 2.05, 1.28, baseZ],
    scale: [0.55, 0.36, 0.58],
    material: pink,
  });
  addPrimitive(pc, app, entities, {
    name: 'cow-17-patch',
    type: 'sphere',
    position: [baseX + 0.3, 1.55, baseZ - 0.78],
    scale: [0.58, 0.48, 0.12],
    material: black,
    castShadows: false,
  });
  for (const [index, x, z] of [
    [0, baseX - 0.72, baseZ - 0.48],
    [1, baseX - 0.72, baseZ + 0.48],
    [2, baseX + 0.72, baseZ - 0.48],
    [3, baseX + 0.72, baseZ + 0.48],
  ] as const) {
    addPrimitive(pc, app, entities, {
      name: `cow-17-leg-${index}`,
      type: 'cylinder',
      position: [x, 0.58, z],
      scale: [0.18, 0.7, 0.18],
      material: white,
    });
    addPrimitive(pc, app, entities, {
      name: `cow-17-hoof-${index}`,
      type: 'box',
      position: [x - 0.04, 0.16, z],
      scale: [0.28, 0.18, 0.34],
      material: black,
    });
  }
}
