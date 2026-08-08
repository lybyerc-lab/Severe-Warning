// ============================================================================
// [SW:PLAYCANVAS:MULTI_STRUCTURE_DESTRUCTION]
// Four representative PlayCanvas structure archetypes mirror accepted Living
// County target state. The renderer never owns HP, score, combo, or destruction.
// ============================================================================

import type {
  AuthorityStructureArchetype,
  AuthorityStructureSnapshot,
} from './authority-client';
import { addPrimitive } from './geometry';
import { createMaterial } from './materials';
import type {
  PcApplication,
  PcEntity,
  PcMaterial,
  PlayCanvasModule,
} from './engine-types';
import type { StormForceInput } from './storm-force-field';

export interface StructureWorldMapper {
  map(x: number, z: number): Readonly<{ x: number; z: number }>;
}

type StructurePartRole = 'body' | 'roof' | 'accent' | 'wound';
type DebrisWeightClass = 'light' | 'roof' | 'wall' | 'frame' | 'industrial';

interface StructurePart {
  readonly entity: PcEntity;
  readonly offset: readonly [number, number, number];
  readonly scale: readonly [number, number, number];
  readonly rotation: readonly [number, number, number];
  readonly role: StructurePartRole;
  readonly showFromStage: number;
  readonly hideAtStage: number;
}

interface StructureDebrisPart {
  readonly entity: PcEntity;
  readonly offset: readonly [number, number, number];
  readonly mass: number;
  readonly weightClass: DebrisWeightClass;
  readonly activationStage: number;
  readonly activationRotation: readonly [number, number, number];
}

export interface StructureVisual {
  readonly id: AuthorityStructureArchetype;
  readonly core: readonly StructurePart[];
  readonly debris: readonly StructureDebrisPart[];
}

export interface MultiStructurePresentationTelemetry {
  readonly boundCount: number;
  readonly damagedCount: number;
  readonly destroyedCount: number;
  readonly maxDamageStage: number;
  readonly bindings: readonly Readonly<{
    id: AuthorityStructureArchetype;
    targetKey: string;
    damageStage: number;
    destroyed: boolean;
    health: number;
    maxHealth: number;
    x: number;
    z: number;
    visibleCoreParts: number;
    visibleWoundParts: number;
  }>[];
}

export interface StructureDebrisTelemetry {
  readonly updateCount: number;
  readonly activationCount: number;
  readonly activeCount: number;
  readonly airborneCount: number;
  readonly maxDisplacement: number;
  readonly maxHeight: number;
  readonly pullAcceptedCount: number;
  readonly gustAcceptedCount: number;
  readonly bodies: readonly Readonly<{
    id: string;
    structureId: AuthorityStructureArchetype;
    activationStage: number;
    mass: number;
    weightClass: DebrisWeightClass;
    active: boolean;
    airborne: boolean;
    displacement: number;
    peakDisplacement: number;
    peakHeight: number;
    x: number;
    y: number;
    z: number;
  }>[];
}

interface ArchetypeMaterials {
  readonly wall: PcMaterial;
  readonly roof: PcMaterial;
  readonly accent: PcMaterial;
  readonly trim: PcMaterial;
  readonly glass: PcMaterial;
  readonly interior: PcMaterial;
  readonly debris: PcMaterial;
}

interface DebrisProfile {
  readonly suctionScale: number;
  readonly swirlScale: number;
  readonly liftScale: number;
  readonly gustScale: number;
  readonly groundRetention: number;
  readonly maxHorizontalSpeed: number;
  readonly maxVerticalSpeed: number;
}

interface DebrisState {
  readonly id: string;
  readonly structureId: AuthorityStructureArchetype;
  readonly entity: PcEntity;
  readonly mass: number;
  readonly weightClass: DebrisWeightClass;
  readonly activationStage: number;
  readonly activationRotation: readonly [number, number, number];
  readonly localOffset: readonly [number, number, number];
  homeX: number;
  homeY: number;
  homeZ: number;
  x: number;
  y: number;
  z: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  angularX: number;
  angularY: number;
  angularZ: number;
  active: boolean;
  airborne: boolean;
  peakDisplacement: number;
  peakHeight: number;
}

const RAD_TO_DEG = 180 / Math.PI;
const PHYSICS_SUBSTEP = 1 / 60;
const MAX_FRAME_DELTA = 0.12;
const PULL_ACTIVE_SECONDS = 2.5;
const GROUND_Y = 0.45;

// [SW:PLAYCANVAS:STRUCTURE_MASS_HIERARCHY]
// The hierarchy is deliberately readable rather than physically literal:
// trim/signage can fly, roof pieces resist then peel, wall/frame pieces stay
// lower, and industrial cores need much more storm authority to travel.
const DEBRIS_PROFILES: Readonly<Record<DebrisWeightClass, DebrisProfile>> = Object.freeze({
  light: Object.freeze({ suctionScale: 1.35, swirlScale: 1.35, liftScale: 1.35, gustScale: 1.30, groundRetention: 0.70, maxHorizontalSpeed: 17, maxVerticalSpeed: 14 }),
  roof: Object.freeze({ suctionScale: 0.92, swirlScale: 0.90, liftScale: 0.82, gustScale: 0.92, groundRetention: 0.62, maxHorizontalSpeed: 11, maxVerticalSpeed: 8.5 }),
  wall: Object.freeze({ suctionScale: 0.72, swirlScale: 0.66, liftScale: 0.56, gustScale: 0.72, groundRetention: 0.54, maxHorizontalSpeed: 8, maxVerticalSpeed: 6 }),
  frame: Object.freeze({ suctionScale: 0.56, swirlScale: 0.48, liftScale: 0.40, gustScale: 0.56, groundRetention: 0.48, maxHorizontalSpeed: 6.2, maxVerticalSpeed: 4.5 }),
  industrial: Object.freeze({ suctionScale: 0.42, swirlScale: 0.36, liftScale: 0.28, gustScale: 0.44, groundRetention: 0.42, maxHorizontalSpeed: 5, maxVerticalSpeed: 3.5 }),
});

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function deterministicSign(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) | 0;
  return (hash & 1) === 0 ? 1 : -1;
}

function direction(fromX: number, fromZ: number, toX: number, toZ: number): Readonly<{ x: number; z: number; distance: number }> {
  let dx = toX - fromX;
  let dz = toZ - fromZ;
  let distance = Math.hypot(dx, dz);
  if (distance < 0.001) {
    dx = 1;
    dz = 0;
    distance = 1;
  }
  return Object.freeze({ x: dx / distance, z: dz / distance, distance });
}

function limit2d(x: number, z: number, maximum: number): Readonly<{ x: number; z: number }> {
  const speed = Math.hypot(x, z);
  if (speed <= maximum || speed < 0.001) return Object.freeze({ x, z });
  const scale = maximum / speed;
  return Object.freeze({ x: x * scale, z: z * scale });
}

function createArchetypeMaterials(pc: PlayCanvasModule): Readonly<Record<AuthorityStructureArchetype, ArchetypeMaterials>> {
  const darkRoof = createMaterial(pc, [0.13, 0.15, 0.17], { metalness: 0.10, gloss: 0.30 });
  const pale = createMaterial(pc, [0.82, 0.80, 0.72], { gloss: 0.16 });
  const weathered = createMaterial(pc, [0.39, 0.31, 0.23], { gloss: 0.10 });
  const metal = createMaterial(pc, [0.39, 0.45, 0.49], { metalness: 0.42, gloss: 0.40 });
  const glass = createMaterial(pc, [0.30, 0.51, 0.62], { metalness: 0.10, gloss: 0.70 });
  const interior = createMaterial(pc, [0.10, 0.085, 0.07], { gloss: 0.04 });

  return Object.freeze({
    house: Object.freeze({
      wall: createMaterial(pc, [0.43, 0.54, 0.61], { gloss: 0.18 }),
      roof: darkRoof,
      accent: pale,
      trim: createMaterial(pc, [0.73, 0.73, 0.69], { gloss: 0.14 }),
      glass,
      interior,
      debris: weathered,
    }),
    storefront: Object.freeze({
      wall: createMaterial(pc, [0.56, 0.22, 0.14], { gloss: 0.16 }),
      roof: darkRoof,
      accent: createMaterial(pc, [0.86, 0.68, 0.24], { gloss: 0.25 }),
      trim: createMaterial(pc, [0.69, 0.30, 0.20], { gloss: 0.15 }),
      glass,
      interior,
      debris: weathered,
    }),
    barn: Object.freeze({
      wall: createMaterial(pc, [0.58, 0.12, 0.10], { gloss: 0.14 }),
      roof: createMaterial(pc, [0.34, 0.36, 0.37], { metalness: 0.25, gloss: 0.36 }),
      accent: pale,
      trim: createMaterial(pc, [0.88, 0.87, 0.77], { gloss: 0.12 }),
      glass,
      interior,
      debris: weathered,
    }),
    industrial: Object.freeze({
      wall: createMaterial(pc, [0.31, 0.34, 0.36], { gloss: 0.16 }),
      roof: metal,
      accent: createMaterial(pc, [0.72, 0.58, 0.20], { gloss: 0.22 }),
      trim: createMaterial(pc, [0.52, 0.55, 0.56], { metalness: 0.30, gloss: 0.30 }),
      glass,
      interior,
      debris: metal,
    }),
  });
}

function createVisual(
  pc: PlayCanvasModule,
  app: PcApplication,
  entities: PcEntity[],
  id: AuthorityStructureArchetype,
  materials: ArchetypeMaterials,
): StructureVisual {
  const core: StructurePart[] = [];
  const debris: StructureDebrisPart[] = [];

  const addCore = (
    name: string,
    type: 'box' | 'cylinder' | 'cone',
    offset: readonly [number, number, number],
    scale: readonly [number, number, number],
    material: PcMaterial,
    role: StructurePartRole,
    rotation: readonly [number, number, number] = [0, 0, 0],
    showFromStage = 0,
    hideAtStage = 99,
  ): void => {
    const entity = addPrimitive(pc, app, entities, {
      name: `authority-${id}-${name}`,
      type,
      position: offset,
      scale,
      material,
      rotation,
    });
    entity.enabled = false;
    core.push(Object.freeze({ entity, offset, scale, rotation, role, showFromStage, hideAtStage }));
  };

  const addDebris = (
    name: string,
    offset: readonly [number, number, number],
    scale: readonly [number, number, number],
    mass: number,
    weightClass: DebrisWeightClass,
    activationStage: number,
    activationRotation: readonly [number, number, number],
  ): void => {
    const entity = addPrimitive(pc, app, entities, {
      name: `authority-${id}-debris-${name}`,
      type: 'box',
      position: offset,
      scale,
      material: materials.debris,
    });
    entity.enabled = false;
    debris.push(Object.freeze({ entity, offset, mass, weightClass, activationStage, activationRotation }));
  };

  // [SW:PLAYCANVAS:STRUCTURE_ANATOMY]
  // Anatomy stays deliberately chunky/readable on mobile: doors/windows/trim,
  // pitched roof silhouettes, and dark wound/framing surfaces after damage.
  if (id === 'house') {
    addCore('body', 'box', [0, 2.6, 0], [8.4, 5.2, 7.2], materials.wall, 'body');
    addCore('roof-left', 'box', [-1.95, 5.7, 0], [5.1, 0.45, 7.9], materials.roof, 'roof', [0, 0, 22], 0, 1);
    addCore('roof-right', 'box', [1.95, 5.7, 0], [5.1, 0.45, 7.9], materials.roof, 'roof', [0, 0, -22], 0, 2);
    addCore('porch', 'box', [-2.2, 0.72, -4.05], [3.3, 0.42, 1.6], materials.trim, 'accent');
    addCore('door', 'box', [-2.25, 1.65, -3.68], [1.2, 2.5, 0.22], materials.accent, 'accent', [0, 0, 0], 0, 2);
    addCore('window-a', 'box', [0.3, 2.55, -3.68], [1.35, 1.55, 0.18], materials.glass, 'accent', [0, 0, 0], 0, 1);
    addCore('window-b', 'box', [2.35, 2.55, -3.68], [1.35, 1.55, 0.18], materials.glass, 'accent', [0, 0, 0], 0, 2);
    addCore('wound-dark', 'box', [1.95, 2.65, -3.53], [3.0, 2.8, 0.12], materials.interior, 'wound', [0, 0, 0], 1, 99);
    addCore('frame-post-a', 'box', [0.6, 2.6, -3.65], [0.28, 4.1, 0.28], materials.trim, 'wound', [0, 0, 0], 2, 99);
    addCore('frame-post-b', 'box', [3.1, 2.6, -3.65], [0.28, 4.1, 0.28], materials.trim, 'wound', [0, 0, 0], 2, 99);
    addDebris('roof-half', [-1.9, 5.55, 0.2], [4.8, 0.5, 7.4], 4.8, 'roof', 1, [12, 25, 30]);
    addDebris('wall-panel', [2.1, 2.5, -3.3], [3.0, 2.7, 0.55], 8.5, 'wall', 2, [18, 10, -24]);
    addDebris('frame', [1.2, 1.7, 1.0], [2.6, 2.0, 2.0], 14.0, 'frame', 3, [22, 32, 14]);
  } else if (id === 'storefront') {
    addCore('body', 'box', [0, 3.0, 0], [10.5, 6.0, 7.6], materials.wall, 'body');
    addCore('roof', 'box', [0, 6.3, 0], [11.2, 0.55, 8.2], materials.roof, 'roof', [0, 0, 0], 0, 2);
    addCore('cornice', 'box', [0, 5.6, -3.92], [10.8, 0.45, 0.38], materials.trim, 'accent', [0, 0, 0], 0, 2);
    addCore('sign', 'box', [0, 4.45, -4.04], [6.4, 1.15, 0.30], materials.accent, 'accent', [0, 0, 0], 0, 1);
    addCore('window-left', 'box', [-2.55, 2.3, -3.86], [3.2, 2.5, 0.18], materials.glass, 'accent', [0, 0, 0], 0, 1);
    addCore('window-right', 'box', [2.55, 2.3, -3.86], [3.2, 2.5, 0.18], materials.glass, 'accent', [0, 0, 0], 0, 2);
    addCore('door', 'box', [0, 1.65, -3.94], [1.35, 2.8, 0.20], materials.trim, 'accent', [0, 0, 0], 0, 2);
    addCore('awning', 'box', [0, 3.65, -4.25], [7.8, 0.28, 1.1], materials.accent, 'accent', [12, 0, 0], 0, 1);
    addCore('wound-dark', 'box', [-2.4, 2.75, -3.73], [4.2, 3.4, 0.12], materials.interior, 'wound', [0, 0, 0], 1, 99);
    addCore('frame-beam', 'box', [-2.1, 2.8, -3.86], [0.34, 4.6, 0.34], materials.trim, 'wound', [0, 0, 0], 2, 99);
    addDebris('sign', [-1.5, 4.2, -3.75], [3.3, 1.0, 0.32], 0.9, 'light', 1, [8, 18, -42]);
    addDebris('facade', [2.7, 2.8, -3.1], [3.4, 2.9, 0.62], 7.5, 'wall', 2, [22, 30, 20]);
    addDebris('core', [-2.4, 1.8, 1.3], [3.6, 2.4, 2.4], 15.5, 'frame', 3, [28, 18, -18]);
  } else if (id === 'barn') {
    addCore('body', 'box', [0, 2.7, 0], [10.8, 5.4, 8.6], materials.wall, 'body');
    addCore('roof-left', 'box', [-2.45, 5.82, 0], [6.1, 0.55, 9.2], materials.roof, 'roof', [0, 0, 26], 0, 1);
    addCore('roof-right', 'box', [2.45, 5.82, 0], [6.1, 0.55, 9.2], materials.roof, 'roof', [0, 0, -26], 0, 2);
    addCore('door', 'box', [0, 2.0, -4.42], [3.7, 3.9, 0.30], materials.accent, 'accent', [0, 0, 0], 0, 2);
    addCore('loft', 'box', [0, 4.6, -4.44], [2.0, 1.45, 0.26], materials.trim, 'accent', [0, 0, 0], 0, 1);
    addCore('trim-left', 'box', [-2.3, 2.7, -4.5], [0.30, 5.1, 0.22], materials.trim, 'accent');
    addCore('trim-right', 'box', [2.3, 2.7, -4.5], [0.30, 5.1, 0.22], materials.trim, 'accent');
    addCore('wound-dark', 'box', [1.9, 2.8, -4.25], [3.6, 3.5, 0.12], materials.interior, 'wound', [0, 0, 0], 1, 99);
    addCore('frame-cross-a', 'box', [1.9, 2.8, -4.40], [0.28, 4.3, 0.25], materials.trim, 'wound', [0, 0, 42], 2, 99);
    addCore('frame-cross-b', 'box', [1.9, 2.8, -4.42], [0.28, 4.3, 0.25], materials.trim, 'wound', [0, 0, -42], 2, 99);
    addDebris('roof-a', [-2.4, 5.65, 0.8], [5.2, 0.6, 8.4], 5.8, 'roof', 1, [18, 16, 34]);
    addDebris('roof-b', [2.5, 5.65, -0.6], [5.0, 0.6, 8.0], 6.4, 'roof', 2, [16, -22, -30]);
    addDebris('wall', [1.0, 2.4, 2.7], [3.8, 2.8, 0.75], 10.5, 'wall', 3, [28, 12, 18]);
  } else {
    addCore('body', 'box', [0, 3.4, 0], [12.2, 6.8, 9.4], materials.wall, 'body');
    addCore('roof', 'box', [0, 7.05, 0], [12.8, 0.6, 10.0], materials.roof, 'roof', [0, 0, 0], 0, 2);
    addCore('loading-door', 'box', [-3.2, 2.2, -4.82], [4.0, 4.1, 0.30], materials.trim, 'accent', [0, 0, 0], 0, 2);
    addCore('office-window', 'box', [2.8, 3.2, -4.82], [2.6, 2.1, 0.20], materials.glass, 'accent', [0, 0, 0], 0, 1);
    addCore('warning-band', 'box', [2.8, 1.1, -4.94], [3.4, 0.55, 0.18], materials.accent, 'accent', [0, 0, 0], 0, 2);
    addCore('vent-a', 'cylinder', [2.8, 8.0, 1.4], [0.7, 1.5, 0.7], materials.roof, 'accent', [0, 0, 0], 0, 1);
    addCore('vent-b', 'cylinder', [-1.4, 7.8, -0.6], [0.55, 1.2, 0.55], materials.roof, 'accent', [0, 0, 0], 0, 2);
    addCore('wound-dark', 'box', [2.7, 3.4, -4.68], [4.2, 4.2, 0.12], materials.interior, 'wound', [0, 0, 0], 1, 99);
    addCore('frame-column', 'box', [2.6, 3.5, -4.82], [0.36, 5.4, 0.36], materials.trim, 'wound', [0, 0, 0], 2, 99);
    addDebris('roof', [2.8, 6.9, 1.0], [5.6, 0.58, 4.3], 9.5, 'industrial', 1, [10, 26, 20]);
    addDebris('wall', [-3.0, 3.0, -2.8], [3.6, 3.2, 0.80], 15.5, 'industrial', 2, [18, 14, -20]);
    addDebris('core', [2.1, 2.0, 1.8], [4.0, 3.0, 2.9], 24.0, 'industrial', 3, [14, 22, 16]);
  }

  return Object.freeze({ id, core: Object.freeze(core), debris: Object.freeze(debris) });
}

export function createMultiStructureVisuals(
  pc: PlayCanvasModule,
  app: PcApplication,
  entities: PcEntity[],
): readonly StructureVisual[] {
  const materials = createArchetypeMaterials(pc);
  return Object.freeze((['storefront', 'house', 'industrial', 'barn'] as const).map((id) => (
    createVisual(pc, app, entities, id, materials[id])
  )));
}

export class MultiStructurePresentation {
  private readonly visuals: ReadonlyMap<AuthorityStructureArchetype, StructureVisual>;
  private telemetry: MultiStructurePresentationTelemetry = Object.freeze({
    boundCount: 0,
    damagedCount: 0,
    destroyedCount: 0,
    maxDamageStage: 0,
    bindings: Object.freeze([]),
  });

  constructor(visuals: readonly StructureVisual[]) {
    this.visuals = new Map(visuals.map((visual) => [visual.id, visual]));
  }

  sync(structures: readonly AuthorityStructureSnapshot[], mapper: StructureWorldMapper): void {
    let damagedCount = 0;
    let destroyedCount = 0;
    let maxDamageStage = 0;
    const bindings: MultiStructurePresentationTelemetry['bindings'][number][] = [];
    const activeIds = new Set<AuthorityStructureArchetype>();

    for (const snapshot of structures) {
      const visual = this.visuals.get(snapshot.id);
      if (!visual) continue;
      activeIds.add(snapshot.id);
      const center = mapper.map(snapshot.x, snapshot.z);
      const stage = clamp(snapshot.damageStage, 0, 2);
      maxDamageStage = Math.max(maxDamageStage, stage);
      if (stage > 0 || snapshot.destroyed) damagedCount += 1;
      if (snapshot.destroyed) destroyedCount += 1;
      const visualState = this.applyVisualState(visual, center.x, center.z, stage, snapshot.destroyed);
      bindings.push(Object.freeze({
        id: snapshot.id,
        targetKey: snapshot.targetKey,
        damageStage: stage,
        destroyed: snapshot.destroyed,
        health: snapshot.health,
        maxHealth: snapshot.maxHealth,
        x: center.x,
        z: center.z,
        visibleCoreParts: visualState.visibleCoreParts,
        visibleWoundParts: visualState.visibleWoundParts,
      }));
    }

    for (const [id, visual] of this.visuals) {
      if (activeIds.has(id)) continue;
      for (const part of visual.core) part.entity.enabled = false;
    }

    this.telemetry = Object.freeze({
      boundCount: bindings.length,
      damagedCount,
      destroyedCount,
      maxDamageStage,
      bindings: Object.freeze(bindings),
    });
  }

  getTelemetry(): MultiStructurePresentationTelemetry {
    return this.telemetry;
  }

  private applyVisualState(
    visual: StructureVisual,
    centerX: number,
    centerZ: number,
    stage: number,
    destroyed: boolean,
  ): Readonly<{ visibleCoreParts: number; visibleWoundParts: number }> {
    const sign = deterministicSign(visual.id);
    const compression = stage === 0 ? 1 : (stage === 1 ? 0.96 : 0.88);
    const lean = stage === 0 ? 0 : sign * (stage === 1 ? 2.8 : 7.5);
    let visibleCoreParts = 0;
    let visibleWoundParts = 0;

    for (const part of visual.core) {
      const stageVisible = stage >= part.showFromStage && stage < part.hideAtStage;
      // Keep this truth shape searchable for the implementation verifier.
      part.entity.enabled = !destroyed && stageVisible;
      if (!part.entity.enabled) continue;
      visibleCoreParts += 1;
      if (part.role === 'wound') visibleWoundParts += 1;

      const roleLift = part.role === 'roof' ? stage * 0.10 : 0;
      const roleShift = part.role === 'roof'
        ? sign * stage * 0.30
        : (part.role === 'accent' ? sign * stage * 0.12 : 0);
      const roleTilt = part.role === 'roof'
        ? sign * stage * 5.0
        : (part.role === 'accent' ? -sign * stage * 3.5 : 0);
      const bodyCompression = part.role === 'body' ? compression : 1;
      const woundSetback = part.role === 'wound' ? 0.05 * stage : 0;
      part.entity.setPosition(
        centerX + part.offset[0] + roleShift,
        part.offset[1] * bodyCompression + roleLift,
        centerZ + part.offset[2] + woundSetback,
      );
      part.entity.setLocalScale(part.scale[0], part.scale[1] * bodyCompression, part.scale[2]);
      part.entity.setEulerAngles(part.rotation[0], part.rotation[1], part.rotation[2] + lean + roleTilt);
    }

    return Object.freeze({ visibleCoreParts, visibleWoundParts });
  }
}

// [SW:PLAYCANVAS:STRUCTURE_DEBRIS_FIELD]
// Structure chunks are separate from the frozen tree/light-prop force class so
// accepted tree response stays byte-for-byte unchanged. They still use a
// deterministic game-owned suction/swirl/lift model and activate only from
// authoritative Living County damage stages.
export class StructureDebrisField {
  private readonly bodies: DebrisState[];
  private pullSecondsRemaining = 0;
  private updateCount = 0;
  private activationCount = 0;
  private pullAcceptedCount = 0;
  private gustAcceptedCount = 0;
  private maxDisplacement = 0;
  private maxHeight = 0;

  constructor(
    visuals: readonly StructureVisual[],
    structures: readonly AuthorityStructureSnapshot[],
    mapper: StructureWorldMapper,
  ) {
    const snapshots = new Map(structures.map((structure) => [structure.id, structure]));
    const bodies: DebrisState[] = [];
    for (const visual of visuals) {
      const snapshot = snapshots.get(visual.id);
      if (!snapshot) continue;
      const center = mapper.map(snapshot.x, snapshot.z);
      visual.debris.forEach((part, index) => {
        const homeX = center.x + part.offset[0];
        const homeY = part.offset[1];
        const homeZ = center.z + part.offset[2];
        bodies.push({
          id: `structure-${visual.id}-debris-${index}`,
          structureId: visual.id,
          entity: part.entity,
          mass: part.mass,
          weightClass: part.weightClass,
          activationStage: part.activationStage,
          activationRotation: part.activationRotation,
          localOffset: part.offset,
          homeX,
          homeY,
          homeZ,
          x: homeX,
          y: homeY,
          z: homeZ,
          velocityX: 0,
          velocityY: 0,
          velocityZ: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          angularX: 0,
          angularY: 0,
          angularZ: 0,
          active: false,
          airborne: false,
          peakDisplacement: 0,
          peakHeight: homeY,
        });
      });
    }
    this.bodies = bodies;
    this.reset(structures, mapper);
  }

  triggerAbility(slot: 'primary' | 'secondary' | 'tertiary', input: StormForceInput): void {
    if (slot === 'primary') {
      this.pullAcceptedCount += 1;
      this.pullSecondsRemaining = PULL_ACTIVE_SECONDS;
      return;
    }
    if (slot !== 'secondary') return;
    this.gustAcceptedCount += 1;
    this.pullSecondsRemaining = 0;
    for (const body of this.bodies) {
      if (!body.active) continue;
      const outward = direction(input.x, input.z, body.x, body.z);
      const range = input.radius * 3.2;
      if (outward.distance > range) continue;
      const profile = DEBRIS_PROFILES[body.weightClass];
      const falloff = 1 - clamp(outward.distance / Math.max(range, 0.001), 0, 1);
      const inertia = 1 / Math.sqrt(Math.max(1, body.mass));
      const impulse = (3.0 + falloff * 5.0) * profile.gustScale * inertia;
      body.velocityX += outward.x * impulse;
      body.velocityZ += outward.z * impulse;
      body.velocityY += (0.55 + falloff * 1.15) * profile.liftScale * inertia;
    }
  }

  sync(structures: readonly AuthorityStructureSnapshot[], input: StormForceInput): void {
    const snapshots = new Map(structures.map((structure) => [structure.id, structure]));
    for (const body of this.bodies) {
      if (body.active) continue;
      const snapshot = snapshots.get(body.structureId);
      if (!snapshot) continue;
      if (snapshot.destroyed || snapshot.damageStage >= body.activationStage) this.activate(body, input);
    }
  }

  update(input: StormForceInput, deltaSeconds: number): void {
    this.updateCount += 1;
    const safeDelta = clamp(deltaSeconds, 0, MAX_FRAME_DELTA);
    this.pullSecondsRemaining = Math.max(0, this.pullSecondsRemaining - safeDelta);
    for (const body of this.bodies) {
      if (!body.active) continue;
      this.updateBody(body, input, safeDelta);
      const displacement = Math.hypot(body.x - body.homeX, body.y - body.homeY, body.z - body.homeZ);
      body.peakDisplacement = Math.max(body.peakDisplacement, displacement);
      body.peakHeight = Math.max(body.peakHeight, body.y);
      this.maxDisplacement = Math.max(this.maxDisplacement, displacement);
      this.maxHeight = Math.max(this.maxHeight, body.y);
      this.applyPose(body);
    }
  }

  reset(structures: readonly AuthorityStructureSnapshot[], mapper: StructureWorldMapper): void {
    const snapshots = new Map(structures.map((structure) => [structure.id, structure]));
    this.pullSecondsRemaining = 0;
    this.maxDisplacement = 0;
    this.maxHeight = 0;
    for (const body of this.bodies) {
      const snapshot = snapshots.get(body.structureId);
      if (snapshot) {
        const center = mapper.map(snapshot.x, snapshot.z);
        body.homeX = center.x + body.localOffset[0];
        body.homeY = body.localOffset[1];
        body.homeZ = center.z + body.localOffset[2];
      }
      body.x = body.homeX;
      body.y = body.homeY;
      body.z = body.homeZ;
      body.velocityX = 0;
      body.velocityY = 0;
      body.velocityZ = 0;
      body.rotationX = 0;
      body.rotationY = 0;
      body.rotationZ = 0;
      body.angularX = 0;
      body.angularY = 0;
      body.angularZ = 0;
      body.active = false;
      body.airborne = false;
      body.peakDisplacement = 0;
      body.peakHeight = body.homeY;
      body.entity.enabled = false;
      this.applyPose(body);
    }
  }

  getTelemetry(): StructureDebrisTelemetry {
    const bodies = this.bodies.map((body) => Object.freeze({
      id: body.id,
      structureId: body.structureId,
      activationStage: body.activationStage,
      mass: body.mass,
      weightClass: body.weightClass,
      active: body.active,
      airborne: body.airborne,
      displacement: Math.hypot(body.x - body.homeX, body.y - body.homeY, body.z - body.homeZ),
      peakDisplacement: body.peakDisplacement,
      peakHeight: body.peakHeight,
      x: body.x,
      y: body.y,
      z: body.z,
    }));
    return Object.freeze({
      updateCount: this.updateCount,
      activationCount: this.activationCount,
      activeCount: bodies.filter((body) => body.active).length,
      airborneCount: bodies.filter((body) => body.airborne).length,
      maxDisplacement: this.maxDisplacement,
      maxHeight: this.maxHeight,
      pullAcceptedCount: this.pullAcceptedCount,
      gustAcceptedCount: this.gustAcceptedCount,
      bodies: Object.freeze(bodies),
    });
  }

  private activate(body: DebrisState, input: StormForceInput): void {
    body.active = true;
    body.entity.enabled = true;
    body.y += 0.12;
    body.rotationX = body.activationRotation[0] / RAD_TO_DEG;
    body.rotationY = body.activationRotation[1] / RAD_TO_DEG;
    body.rotationZ = body.activationRotation[2] / RAD_TO_DEG;
    const outward = direction(input.x, input.z, body.x, body.z);
    const side = deterministicSign(body.id);
    const profile = DEBRIS_PROFILES[body.weightClass];
    const inertia = 1 / Math.sqrt(Math.max(1, body.mass));
    const release = body.weightClass === 'light' ? 2.4 : (body.weightClass === 'roof' ? 1.35 : 0.72);
    body.velocityX = (outward.x * release + outward.z * side * release * 0.85) * inertia;
    body.velocityY = (1.1 + profile.liftScale * 2.3) * inertia;
    body.velocityZ = (outward.z * release - outward.x * side * release * 0.85) * inertia;
    body.angularX = side * (0.45 + inertia * 0.9);
    body.angularY = 0.55 + inertia * 1.2;
    body.angularZ = -side * (0.50 + inertia * 0.85);
    body.airborne = body.y > GROUND_Y + 0.2;
    this.activationCount += 1;
    this.applyPose(body);
  }

  private updateBody(body: DebrisState, input: StormForceInput, deltaSeconds: number): void {
    let remaining = deltaSeconds;
    const profile = DEBRIS_PROFILES[body.weightClass];
    while (remaining > 0.00001) {
      const step = Math.min(PHYSICS_SUBSTEP, remaining);
      remaining -= step;
      const inward = direction(body.x, body.z, input.x, input.z);
      const range = Math.max(input.radius * 4.2, 22);
      const falloff = 1 - clamp(inward.distance / range, 0, 1);
      const side = deterministicSign(body.id);
      const pullBoost = this.pullSecondsRemaining > 0 ? 1.85 : 1;
      const inverseMass = 1 / Math.max(1, body.mass);
      const inertia = Math.sqrt(inverseMass);
      const suction = (3.8 + input.efMultiplier * 1.5) * falloff * pullBoost * profile.suctionScale * inertia;
      const swirl = (5.2 + input.efMultiplier * 1.7) * falloff * (0.75 + (pullBoost - 1) * 0.45) * profile.swirlScale * inertia;
      const nearCore = 1 - clamp(inward.distance / Math.max(input.radius * 1.15, 1), 0, 1);
      const liftPotential = 2.0 + falloff * 6.0 + nearCore * 3.6 + (this.pullSecondsRemaining > 0 ? 3.8 : 0);
      const lift = liftPotential * profile.liftScale * inertia;
      const weight = 6.9 + Math.log2(body.mass + 1) * 0.75;
      const tangentX = -inward.z * side;
      const tangentZ = inward.x * side;
      const drag = 0.52 + Math.sqrt(body.mass) * 0.055;

      body.velocityX += (inward.x * suction + tangentX * swirl - body.velocityX * drag) * step;
      body.velocityZ += (inward.z * suction + tangentZ * swirl - body.velocityZ * drag) * step;
      body.velocityY += (lift - weight - body.velocityY * 0.24) * step;

      const limitedHorizontal = limit2d(body.velocityX, body.velocityZ, profile.maxHorizontalSpeed);
      body.velocityX = limitedHorizontal.x;
      body.velocityZ = limitedHorizontal.z;
      body.velocityY = clamp(body.velocityY, -profile.maxVerticalSpeed, profile.maxVerticalSpeed);

      body.x += body.velocityX * step;
      body.y += body.velocityY * step;
      body.z += body.velocityZ * step;
      body.rotationX += body.angularX * step;
      body.rotationY += body.angularY * step;
      body.rotationZ += body.angularZ * step;

      if (body.y <= GROUND_Y) {
        body.y = GROUND_Y;
        body.velocityY = Math.abs(body.velocityY) * 0.18;
        body.velocityX *= profile.groundRetention;
        body.velocityZ *= profile.groundRetention;
        body.angularX *= 0.86;
        body.angularY *= 0.86;
        body.angularZ *= 0.86;
      }

      body.airborne = body.y > GROUND_Y + 0.22 && Math.abs(body.velocityY) > 0.18;
    }
  }

  private applyPose(body: DebrisState): void {
    body.entity.setPosition(body.x, body.y, body.z);
    body.entity.setEulerAngles(
      body.rotationX * RAD_TO_DEG,
      body.rotationY * RAD_TO_DEG,
      body.rotationZ * RAD_TO_DEG,
    );
  }
}

// [SW:PLAYCANVAS:MULTI_STRUCTURE_DESTRUCTION:END]
