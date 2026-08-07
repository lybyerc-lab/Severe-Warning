// ============================================================================
// [SW:PLAYCANVAS:AUTHORED_GEOMETRY]
// Reusable low-poly geometry helpers for the bounded Prairie Junction proof.
// ============================================================================

import { ROAD_TOP_Y } from './constants';
import type { PcApplication, PcEntity, PcMaterial, PlayCanvasModule } from './engine-types';

export interface BuildingParts {
  readonly walls: PcEntity;
  readonly roof: PcEntity;
  readonly center: Readonly<{ x: number; z: number; height: number }>;
}

export interface OffsetEntity {
  readonly entity: PcEntity;
  readonly offset: readonly [number, number, number];
}

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
  const roadAxes = [-45, 0, 45];
  for (let offset = -85; offset <= 85; offset += 5) {
    let nearJunction = false;
    for (const axis of roadAxes) {
      if (Math.abs(offset - axis) < 6.5) {
        nearJunction = true;
        break;
      }
    }
    if (nearJunction) continue;

    for (const x of roadAxes) {
      addPrimitive(pc, app, entities, {
        name: `ns-centerline-${x}-${offset}`,
        type: 'box',
        position: [x, ROAD_TOP_Y + 0.018, offset],
        scale: [0.16, 0.025, 1.8],
        material: paint,
        castShadows: false,
      });
    }

    for (const z of roadAxes) {
      addPrimitive(pc, app, entities, {
        name: `ew-centerline-${z}-${offset}`,
        type: 'box',
        position: [offset, ROAD_TOP_Y + 0.018, z],
        scale: [1.8, 0.025, 0.16],
        material: paint,
        castShadows: false,
      });
    }
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
): BuildingParts {
  const walls = addPrimitive(pc, app, entities, {
    name: `${options.name}-walls`,
    type: 'box',
    position: [options.x, options.height / 2, options.z],
    scale: [options.width, options.height, options.depth],
    material: options.wall,
  });
  const roofPart = addPrimitive(pc, app, entities, {
    name: `${options.name}-roof`,
    type: 'box',
    position: [options.x, options.height + 0.45, options.z],
    scale: [options.width + 0.6, 0.5, options.depth + 0.6],
    material: options.roof,
  });
  return Object.freeze({
    walls,
    roof: roofPart,
    center: Object.freeze({ x: options.x, z: options.z, height: options.height }),
  });
}

export function addVehicle(
  pc: PlayCanvasModule,
  app: PcApplication,
  entities: PcEntity[],
  bodyMaterial: PcMaterial,
  wheelMaterial: PcMaterial,
): readonly OffsetEntity[] {
  const centerX = 10;
  const centerZ = -2.1;
  const parts: OffsetEntity[] = [];
  const add = (name: string, type: 'box' | 'cylinder', offset: readonly [number, number, number], scale: readonly [number, number, number], material: PcMaterial, rotation?: readonly [number, number, number]) => {
    const entity = addPrimitive(pc, app, entities, {
      name,
      type,
      position: [centerX + offset[0], offset[1], centerZ + offset[2]],
      scale,
      material,
      ...(rotation ? { rotation } : {}),
    });
    parts.push(Object.freeze({ entity, offset }));
  };
  add('playable-vehicle-body', 'box', [0, 0.75, 0], [3.4, 0.8, 1.65], bodyMaterial);
  add('playable-vehicle-cab', 'box', [-0.3, 1.35, 0], [1.6, 0.55, 1.45], bodyMaterial);
  for (const [index, x, z] of [[0, -1.05, -0.82], [1, -1.05, 0.82], [2, 1.05, -0.82], [3, 1.05, 0.82]] as const) {
    add(`playable-vehicle-wheel-${index}`, 'cylinder', [x, 0.43, z], [0.34, 0.22, 0.34], wheelMaterial, [90, 0, 0]);
  }
  return Object.freeze(parts);
}

export function addElectricalTarget(
  pc: PlayCanvasModule,
  app: PcApplication,
  entities: PcEntity[],
  metal: PcMaterial,
  hot: PcMaterial,
): readonly OffsetEntity[] {
  const centerX = 18;
  const centerZ = 15;
  const parts: OffsetEntity[] = [];
  const add = (name: string, type: 'box' | 'cylinder' | 'sphere', offset: readonly [number, number, number], scale: readonly [number, number, number], material: PcMaterial) => {
    const entity = addPrimitive(pc, app, entities, {
      name,
      type,
      position: [centerX + offset[0], offset[1], centerZ + offset[2]],
      scale,
      material,
    });
    parts.push(Object.freeze({ entity, offset }));
  };
  add('electrical-target-pad', 'box', [0, 0.22, 0], [4.2, 0.36, 3.2], metal);
  add('electrical-target-transformer-a', 'box', [-0.9, 1.15, 0], [1.2, 1.6, 1.3], metal);
  add('electrical-target-transformer-b', 'box', [0.9, 1.15, 0], [1.2, 1.6, 1.3], metal);
  add('electrical-target-insulator-a', 'cylinder', [-1.15, 2.35, 0], [0.16, 0.55, 0.16], hot);
  add('electrical-target-insulator-b', 'cylinder', [1.15, 2.35, 0], [0.16, 0.55, 0.16], hot);
  add('electrical-target-beacon', 'sphere', [0, 2.55, 0], [0.28, 0.28, 0.28], hot);
  return Object.freeze(parts);
}

export function addCow17(
  pc: PlayCanvasModule,
  app: PcApplication,
  entities: PcEntity[],
  white: PcMaterial,
  black: PcMaterial,
  pink: PcMaterial,
): readonly OffsetEntity[] {
  const baseX = 12;
  const baseZ = 10;
  const parts: OffsetEntity[] = [];
  const add = (name: string, type: 'box' | 'sphere' | 'cylinder' | 'capsule', offset: readonly [number, number, number], scale: readonly [number, number, number], material: PcMaterial, rotation?: readonly [number, number, number], castShadows = true) => {
    const entity = addPrimitive(pc, app, entities, {
      name,
      type,
      position: [baseX + offset[0], offset[1], baseZ + offset[2]],
      scale,
      material,
      castShadows,
      ...(rotation ? { rotation } : {}),
    });
    parts.push(Object.freeze({ entity, offset }));
  };
  add('cow-17-body', 'capsule', [0, 1.3, 0], [1.25, 1.7, 0.92], white, [0, 0, 90]);
  add('cow-17-head', 'box', [-1.55, 1.45, 0], [0.85, 0.8, 0.8], white);
  add('cow-17-muzzle', 'box', [-2.05, 1.28, 0], [0.55, 0.36, 0.58], pink);
  add('cow-17-patch', 'sphere', [0.3, 1.55, -0.78], [0.58, 0.48, 0.12], black, undefined, false);
  for (const [index, x, z] of [
    [0, -0.72, -0.48],
    [1, -0.72, 0.48],
    [2, 0.72, -0.48],
    [3, 0.72, 0.48],
  ] as const) {
    add(`cow-17-leg-${index}`, 'cylinder', [x, 0.58, z], [0.18, 0.7, 0.18], white);
    add(`cow-17-hoof-${index}`, 'box', [x - 0.04, 0.16, z], [0.28, 0.18, 0.34], black);
  }
  return Object.freeze(parts);
}
