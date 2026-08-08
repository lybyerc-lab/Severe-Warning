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

type StructurePartRole = 'body' | 'roof' | 'accent' | 'glass' | 'interior' | 'frame';
export type StructureDebrisClass = 'trim' | 'roof' | 'wall' | 'frame';

interface StructurePart {
  readonly entity: PcEntity;
  readonly offset: readonly [number, number, number];
  readonly scale: readonly [number, number, number];
  readonly rotation: readonly [number, number, number];
  readonly role: StructurePartRole;
  readonly visibleFromStage: number;
  readonly visibleThroughStage: number;
}

interface StructureDebrisPart {
  readonly entity: PcEntity;
  readonly offset: readonly [number, number, number];
  readonly mass: number;
  readonly debrisClass: StructureDebrisClass;
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
  }>[];
}

export interface StructureDebrisTelemetry {
  readonly updateCount: number;
  readonly activationCount: number;
  readonly activeCount: number;
  readonly airborneCount: number;
  readonly maxDisplacement: number;
  readonly pullAcceptedCount: number;
  readonly gustAcceptedCount: number;
  readonly bodies: readonly Readonly<{
    id: string;
    structureId: AuthorityStructureArchetype;
    debrisClass: StructureDebrisClass;
    mass: number;
    activationStage: number;
    active: boolean;
    airborne: boolean;
    displacement: number;
    horizontalDisplacement: number;
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
  readonly glass: PcMaterial;
  readonly interior: PcMaterial;
  readonly frame: PcMaterial;
  readonly debrisTrim: PcMaterial;
  readonly debrisRoof: PcMaterial;
  readonly debrisWall: PcMaterial;
  readonly debrisFrame: PcMaterial;
}

interface DebrisProfile {
  readonly launchHorizontal: number;
  readonly launchVertical: number;
  readonly suctionScale: number;
  readonly swirlScale: number;
  readonly liftScale: number;
  readonly gustScale: number;
  readonly dragBase: number;
  readonly groundDamping: number;
  readonly angularScale: number;
  readonly maxRise: number;
}

interface DebrisState {
  readonly id: string;
  readonly structureId: AuthorityStructureArchetype;
  readonly entity: PcEntity;
  readonly mass: number;
  readonly debrisClass: StructureDebrisClass;
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
  peakHeight: number;
  active: boolean;
  airborne: boolean;
}

const RAD_TO_DEG = 180 / Math.PI;
const PHYSICS_SUBSTEP = 1 / 60;
const MAX_FRAME_DELTA = 0.12;
const PULL_ACTIVE_SECONDS = 2.5;

// [SW:PLAYCANVAS:STRUCTURE_MASS_HIERARCHY]
// Big structure pieces must tell a different physical story than trim/signage.
// The accepted gameplay runtime still decides when they detach; this table only
// controls presentation motion after an authoritative stage transition.
const DEBRIS_PROFILES: Readonly<Record<StructureDebrisClass, DebrisProfile>> = Object.freeze({
  trim: Object.freeze({
    launchHorizontal: 3.2,
    launchVertical: 3.2,
    suctionScale: 1.18,
    swirlScale: 1.28,
    liftScale: 1.38,
    gustScale: 1.30,
    dragBase: 0.36,
    groundDamping: 0.74,
    angularScale: 1.25,
    maxRise: 22,
  }),
  roof: Object.freeze({
    launchHorizontal: 2.1,
    launchVertical: 3.4,
    suctionScale: 0.86,
    swirlScale: 0.92,
    liftScale: 2.50,
    gustScale: 0.98,
    dragBase: 0.56,
    groundDamping: 0.67,
    angularScale: 0.90,
    maxRise: 14,
  }),
  wall: Object.freeze({
    launchHorizontal: 1.25,
    launchVertical: 1.25,
    suctionScale: 0.58,
    swirlScale: 0.62,
    liftScale: 0.43,
    gustScale: 0.68,
    dragBase: 0.72,
    groundDamping: 0.56,
    angularScale: 0.62,
    maxRise: 4.5,
  }),
  frame: Object.freeze({
    launchHorizontal: 0.72,
    launchVertical: 0.65,
    suctionScale: 0.38,
    swirlScale: 0.42,
    liftScale: 0.24,
    gustScale: 0.44,
    dragBase: 0.90,
    groundDamping: 0.48,
    angularScale: 0.42,
    maxRise: 2.5,
  }),
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

function createArchetypeMaterials(pc: PlayCanvasModule): Readonly<Record<AuthorityStructureArchetype, ArchetypeMaterials>> {
  const darkRoof = createMaterial(pc, [0.14, 0.17, 0.19], { metalness: 0.12, gloss: 0.34 });
  const pale = createMaterial(pc, [0.79, 0.77, 0.69], { gloss: 0.18 });
  const metal = createMaterial(pc, [0.42, 0.47, 0.50], { metalness: 0.38, gloss: 0.42 });
  const glass = createMaterial(pc, [0.28, 0.49, 0.61], { metalness: 0.12, gloss: 0.76 });
  const interior = createMaterial(pc, [0.075, 0.065, 0.055], { gloss: 0.06 });
  const timber = createMaterial(pc, [0.25, 0.14, 0.075], { gloss: 0.08 });

  const assemble = (
    wall: PcMaterial,
    roof: PcMaterial,
    accent: PcMaterial,
    debrisRoof: PcMaterial,
    debrisWall: PcMaterial,
    debrisFrame: PcMaterial,
  ): ArchetypeMaterials => Object.freeze({
    wall,
    roof,
    accent,
    glass,
    interior,
    frame: timber,
    debrisTrim: accent,
    debrisRoof,
    debrisWall,
    debrisFrame,
  });

  return Object.freeze({
    house: assemble(
      createMaterial(pc, [0.43, 0.54, 0.61], { gloss: 0.18 }),
      darkRoof,
      pale,
      darkRoof,
      createMaterial(pc, [0.36, 0.47, 0.53], { gloss: 0.12 }),
      timber,
    ),
    storefront: assemble(
      createMaterial(pc, [0.56, 0.22, 0.14], { gloss: 0.16 }),
      darkRoof,
      createMaterial(pc, [0.86, 0.68, 0.24], { gloss: 0.25 }),
      darkRoof,
      createMaterial(pc, [0.45, 0.15, 0.09], { gloss: 0.10 }),
      timber,
    ),
    barn: assemble(
      createMaterial(pc, [0.58, 0.12, 0.10], { gloss: 0.14 }),
      createMaterial(pc, [0.34, 0.36, 0.37], { metalness: 0.25, gloss: 0.36 }),
      pale,
      createMaterial(pc, [0.34, 0.36, 0.37], { metalness: 0.25, gloss: 0.36 }),
      createMaterial(pc, [0.46, 0.09, 0.07], { gloss: 0.09 }),
      timber,
    ),
    industrial: assemble(
      createMaterial(pc, [0.31, 0.34, 0.36], { gloss: 0.16 }),
      metal,
      createMaterial(pc, [0.72, 0.58, 0.20], { gloss: 0.22 }),
      metal,
      createMaterial(pc, [0.27, 0.30, 0.32], { metalness: 0.14, gloss: 0.12 }),
      createMaterial(pc, [0.28, 0.25, 0.21], { metalness: 0.16, gloss: 0.10 }),
    ),
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
    type: 'box' | 'cylinder',
    offset: readonly [number, number, number],
    scale: readonly [number, number, number],
    material: PcMaterial,
    role: StructurePartRole,
    rotation: readonly [number, number, number] = [0, 0, 0],
    visibleFromStage = 0,
    visibleThroughStage = 2,
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
    core.push(Object.freeze({
      entity,
      offset,
      scale,
      rotation,
      role,
      visibleFromStage,
      visibleThroughStage,
    }));
  };

  const debrisMaterial = (debrisClass: StructureDebrisClass): PcMaterial => {
    if (debrisClass === 'trim') return materials.debrisTrim;
    if (debrisClass === 'roof') return materials.debrisRoof;
    if (debrisClass === 'wall') return materials.debrisWall;
    return materials.debrisFrame;
  };

  const addDebris = (
    name: string,
    offset: readonly [number, number, number],
    scale: readonly [number, number, number],
    mass: number,
    debrisClass: StructureDebrisClass,
    activationStage: number,
    activationRotation: readonly [number, number, number],
  ): void => {
    const entity = addPrimitive(pc, app, entities, {
      name: `authority-${id}-debris-${name}`,
      type: 'box',
      position: offset,
      scale,
      material: debrisMaterial(debrisClass),
    });
    entity.enabled = false;
    debris.push(Object.freeze({
      entity,
      offset,
      mass,
      debrisClass,
      activationStage,
      activationRotation,
    }));
  };

  // [SW:PLAYCANVAS:BUILDING_ANATOMY]
  // A few large readable parts beat a cloud of tiny mobile-expensive fragments.
  if (id === 'house') {
    addCore('body', 'box', [0, 2.45, 0], [8.4, 4.9, 7.2], materials.wall, 'body');
    addCore('roof-left', 'box', [-2.05, 5.55, 0], [4.9, 0.52, 7.8], materials.roof, 'roof', [0, 0, -22], 0, 0);
    addCore('roof-right', 'box', [2.05, 5.55, 0], [4.9, 0.52, 7.8], materials.roof, 'roof', [0, 0, 22], 0, 1);
    addCore('porch', 'box', [-2.15, 0.72, -4.05], [3.5, 1.05, 1.55], materials.accent, 'accent', [0, 0, 0], 0, 0);
    addCore('door', 'box', [1.65, 1.45, -3.66], [1.25, 2.8, 0.18], materials.accent, 'accent', [0, 0, 0], 0, 1);
    addCore('window-left', 'box', [-2.15, 2.55, -3.67], [1.7, 1.45, 0.16], materials.glass, 'glass', [0, 0, 0], 0, 0);
    addCore('window-right', 'box', [0.05, 2.55, -3.67], [1.45, 1.45, 0.16], materials.glass, 'glass', [0, 0, 0], 0, 0);
    addCore('interior-wound', 'box', [-0.9, 2.55, -3.56], [4.5, 3.25, 0.24], materials.interior, 'interior', [0, 0, 0], 1, 2);
    addCore('frame-left', 'box', [-2.8, 2.7, -3.48], [0.28, 4.5, 0.3], materials.frame, 'frame', [0, 0, 0], 2, 2);
    addCore('frame-top', 'box', [-0.7, 4.45, -3.48], [4.5, 0.28, 0.3], materials.frame, 'frame', [0, 0, 0], 2, 2);
    addDebris('roof-panel', [-2.0, 5.45, 0.2], [4.6, 0.52, 7.2], 4.1, 'roof', 1, [12, 25, 32]);
    addDebris('porch-trim', [-2.1, 0.9, -4.0], [3.2, 0.55, 1.2], 1.2, 'trim', 1, [8, -16, 38]);
    addDebris('wall-panel', [-2.0, 2.45, -3.25], [3.2, 3.2, 0.55], 6.8, 'wall', 2, [18, 10, -28]);
    addDebris('frame-beam', [1.6, 2.0, 1.1], [0.55, 4.2, 0.55], 10.5, 'frame', 3, [24, 34, 16]);
  } else if (id === 'storefront') {
    addCore('body', 'box', [0, 3.0, 0], [10.5, 6.0, 7.6], materials.wall, 'body');
    addCore('roof', 'box', [0, 6.3, 0], [11.2, 0.55, 8.2], materials.roof, 'roof', [0, 0, 0], 0, 1);
    addCore('sign', 'box', [0, 4.7, -4.05], [6.4, 1.15, 0.35], materials.accent, 'accent', [0, 0, 0], 0, 0);
    addCore('awning', 'box', [0, 3.6, -4.15], [8.2, 0.35, 1.2], materials.accent, 'accent', [-16, 0, 0], 0, 0);
    addCore('glass-left', 'box', [-2.5, 2.0, -3.84], [3.1, 2.7, 0.18], materials.glass, 'glass', [0, 0, 0], 0, 0);
    addCore('glass-right', 'box', [2.5, 2.0, -3.84], [3.1, 2.7, 0.18], materials.glass, 'glass', [0, 0, 0], 0, 0);
    addCore('entry-door', 'box', [0, 1.65, -3.86], [1.45, 3.2, 0.18], materials.accent, 'accent', [0, 0, 0], 0, 1);
    addCore('interior-wound', 'box', [0.8, 2.55, -3.72], [7.6, 4.0, 0.28], materials.interior, 'interior', [0, 0, 0], 1, 2);
    addCore('frame-post', 'box', [3.7, 2.75, -3.58], [0.38, 4.8, 0.42], materials.frame, 'frame', [0, 0, 0], 2, 2);
    addDebris('sign', [-1.5, 4.55, -3.8], [3.2, 1.0, 0.3], 1.1, 'trim', 1, [8, 18, -42]);
    addDebris('awning', [2.0, 3.6, -4.0], [3.8, 0.35, 1.1], 1.5, 'trim', 1, [18, -12, 30]);
    addDebris('facade', [2.7, 2.8, -3.5], [3.2, 3.0, 0.62], 7.3, 'wall', 2, [22, 30, 22]);
    addDebris('roof-slab', [-2.1, 6.05, 1.2], [4.6, 0.52, 3.6], 4.8, 'roof', 2, [14, -20, -26]);
    addDebris('frame-beam', [-2.4, 1.8, 1.3], [0.65, 4.8, 0.65], 11.5, 'frame', 3, [28, 18, -20]);
  } else if (id === 'barn') {
    addCore('body', 'box', [0, 2.7, 0], [10.8, 5.4, 8.6], materials.wall, 'body');
    addCore('roof-left', 'box', [-2.7, 6.0, 0], [6.2, 0.65, 9.3], materials.roof, 'roof', [0, 0, -24], 0, 0);
    addCore('roof-right', 'box', [2.7, 6.0, 0], [6.2, 0.65, 9.3], materials.roof, 'roof', [0, 0, 24], 0, 1);
    addCore('door-left', 'box', [-1.9, 2.0, -4.45], [3.5, 3.9, 0.35], materials.accent, 'accent', [0, 0, 0], 0, 1);
    addCore('door-right', 'box', [1.9, 2.0, -4.45], [3.5, 3.9, 0.35], materials.accent, 'accent', [0, 0, 0], 0, 0);
    addCore('loft-trim', 'box', [0, 4.75, -4.48], [3.0, 1.35, 0.25], materials.accent, 'accent', [0, 0, 0], 0, 0);
    addCore('interior-wound', 'box', [0.8, 2.7, -4.30], [6.5, 4.4, 0.3], materials.interior, 'interior', [0, 0, 0], 1, 2);
    addCore('frame-post-left', 'box', [-3.0, 2.8, -4.18], [0.42, 5.0, 0.42], materials.frame, 'frame', [0, 0, 0], 2, 2);
    addCore('frame-post-right', 'box', [3.0, 2.8, -4.18], [0.42, 5.0, 0.42], materials.frame, 'frame', [0, 0, 0], 2, 2);
    addDebris('roof-a', [-2.6, 5.85, 0.8], [5.5, 0.62, 8.6], 4.6, 'roof', 1, [20, 16, 38]);
    addDebris('loft-trim', [0, 4.7, -4.2], [2.8, 1.1, 0.3], 1.3, 'trim', 1, [10, -24, 36]);
    addDebris('roof-b', [2.6, 5.85, -0.8], [5.2, 0.62, 8.1], 5.0, 'roof', 2, [18, -22, -34]);
    addDebris('wall', [0.8, 2.2, 3.6], [4.4, 3.4, 0.72], 8.2, 'wall', 2, [30, 12, 20]);
    addDebris('beam', [-2.2, 2.6, 1.0], [0.65, 5.0, 0.65], 12.0, 'frame', 3, [16, 28, -14]);
  } else {
    addCore('body', 'box', [0, 3.4, 0], [12.2, 6.8, 9.4], materials.wall, 'body');
    addCore('roof', 'box', [0, 7.05, 0], [12.8, 0.6, 10.0], materials.roof, 'roof', [0, 0, 0], 0, 1);
    addCore('loading-door', 'box', [-3.3, 2.25, -4.9], [4.6, 4.2, 0.35], materials.accent, 'accent', [0, 0, 0], 0, 1);
    addCore('office-window', 'box', [3.1, 3.0, -4.88], [3.2, 2.0, 0.18], materials.glass, 'glass', [0, 0, 0], 0, 0);
    addCore('warning-stripe', 'box', [3.1, 1.35, -4.93], [3.8, 0.38, 0.18], materials.accent, 'accent', [0, 0, 0], 0, 0);
    addCore('vent-a', 'cylinder', [2.8, 8.0, 1.4], [0.7, 1.5, 0.7], materials.roof, 'accent', [0, 0, 0], 0, 0);
    addCore('vent-b', 'cylinder', [-1.4, 7.8, -0.6], [0.55, 1.2, 0.55], materials.roof, 'accent', [0, 0, 0], 0, 1);
    addCore('interior-wound', 'box', [1.2, 3.0, -4.72], [7.8, 4.8, 0.28], materials.interior, 'interior', [0, 0, 0], 1, 2);
    addCore('frame-column', 'box', [-4.2, 3.3, -4.60], [0.58, 5.9, 0.58], materials.frame, 'frame', [0, 0, 0], 2, 2);
    addDebris('vent', [2.8, 7.8, 1.4], [1.0, 1.5, 1.0], 1.4, 'trim', 1, [16, 34, 20]);
    addDebris('roof', [2.8, 6.8, 1.0], [5.4, 0.55, 4.0], 6.0, 'roof', 1, [12, 28, 24]);
    addDebris('wall', [-3.0, 3.0, -4.3], [4.2, 3.4, 0.75], 9.2, 'wall', 2, [20, 14, -22]);
    addDebris('loading-door', [-2.0, 2.2, -4.4], [3.4, 3.6, 0.35], 4.2, 'roof', 2, [18, -12, 28]);
    addDebris('frame', [2.1, 2.8, 1.8], [0.72, 5.4, 0.72], 14.0, 'frame', 3, [16, 24, 18]);
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
      this.applyVisualState(visual, center.x, center.z, stage, snapshot.destroyed);
      bindings.push(Object.freeze({
        id: snapshot.id,
        targetKey: snapshot.targetKey,
        damageStage: stage,
        destroyed: snapshot.destroyed,
        health: snapshot.health,
        maxHealth: snapshot.maxHealth,
        x: center.x,
        z: center.z,
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

  // [SW:PLAYCANVAS:STAGED_BREAKUP]
  // Authority owns the stage. Presentation uses that stage to reveal wounds,
  // hide detached parts, and leave readable frame anatomy before destruction.
  private applyVisualState(
    visual: StructureVisual,
    centerX: number,
    centerZ: number,
    stage: number,
    destroyed: boolean,
  ): void {
    const sign = deterministicSign(visual.id);
    const compression = stage === 0 ? 1 : (stage === 1 ? 0.97 : 0.91);
    const lean = stage === 0 ? 0 : sign * (stage === 1 ? 2.2 : 5.8);

    for (const part of visual.core) {
      const stageVisible = stage >= part.visibleFromStage && stage <= part.visibleThroughStage;
      part.entity.enabled = !destroyed && stageVisible;
      if (!part.entity.enabled) continue;

      const roleLift = part.role === 'roof' ? stage * 0.10 : 0;
      const roleShift = part.role === 'roof'
        ? sign * stage * 0.24
        : (part.role === 'accent' || part.role === 'glass' ? sign * stage * 0.10 : 0);
      const roleTilt = part.role === 'roof'
        ? sign * stage * 4.2
        : (part.role === 'accent' || part.role === 'glass' ? -sign * stage * 2.4 : 0);
      const verticalCompression = part.role === 'body' ? compression : 1;
      const structuralLean = part.role === 'interior' || part.role === 'frame' ? lean * 0.35 : lean;

      part.entity.setPosition(
        centerX + part.offset[0] + roleShift,
        part.offset[1] * (part.role === 'body' ? compression : 1) + roleLift,
        centerZ + part.offset[2],
      );
      part.entity.setLocalScale(part.scale[0], part.scale[1] * verticalCompression, part.scale[2]);
      part.entity.setEulerAngles(
        part.rotation[0],
        part.rotation[1],
        part.rotation[2] + structuralLean + roleTilt,
      );
    }
  }
}

// [SW:PLAYCANVAS:STRUCTURE_DEBRIS_FIELD]
// Structure chunks are separate from the frozen tree/light-prop force class so
// accepted tree response stays byte-for-byte unchanged. They use a deterministic
// game-owned suction/swirl/lift model only after authoritative detachment.
export class StructureDebrisField {
  private readonly bodies: DebrisState[];
  private pullSecondsRemaining = 0;
  private updateCount = 0;
  private activationCount = 0;
  private pullAcceptedCount = 0;
  private gustAcceptedCount = 0;
  private maxDisplacement = 0;

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
          debrisClass: part.debrisClass,
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
          peakHeight: homeY,
          active: false,
          airborne: false,
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
      const falloff = 1 - clamp(outward.distance / Math.max(range, 0.001), 0, 1);
      const profile = DEBRIS_PROFILES[body.debrisClass];
      const inverseMass = 1 / Math.max(0.7, body.mass);
      const impulse = (3.5 + falloff * 5.0) * profile.gustScale * (0.72 + inverseMass * 0.8);
      body.velocityX += outward.x * impulse;
      body.velocityZ += outward.z * impulse;
      body.velocityY += (0.45 + falloff * 1.45) * profile.liftScale * (0.8 + inverseMass);
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
      this.maxDisplacement = Math.max(this.maxDisplacement, displacement);
      body.peakHeight = Math.max(body.peakHeight, body.y);
      body.airborne = body.y > 0.62 && (body.velocityY > 0.18 || body.y > 0.9);
      this.applyPose(body);
    }
  }

  reset(structures: readonly AuthorityStructureSnapshot[], mapper: StructureWorldMapper): void {
    const snapshots = new Map(structures.map((structure) => [structure.id, structure]));
    this.pullSecondsRemaining = 0;
    this.maxDisplacement = 0;
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
      body.peakHeight = body.homeY;
      body.active = false;
      body.airborne = false;
      body.entity.enabled = false;
      this.applyPose(body);
    }
  }

  getTelemetry(): StructureDebrisTelemetry {
    const bodies = this.bodies.map((body) => {
      const horizontalDisplacement = Math.hypot(body.x - body.homeX, body.z - body.homeZ);
      return Object.freeze({
        id: body.id,
        structureId: body.structureId,
        debrisClass: body.debrisClass,
        mass: body.mass,
        activationStage: body.activationStage,
        active: body.active,
        airborne: body.airborne,
        displacement: Math.hypot(horizontalDisplacement, body.y - body.homeY),
        horizontalDisplacement,
        peakHeight: body.peakHeight,
        x: body.x,
        y: body.y,
        z: body.z,
      });
    });
    return Object.freeze({
      updateCount: this.updateCount,
      activationCount: this.activationCount,
      activeCount: bodies.filter((body) => body.active).length,
      airborneCount: bodies.filter((body) => body.airborne).length,
      maxDisplacement: this.maxDisplacement,
      pullAcceptedCount: this.pullAcceptedCount,
      gustAcceptedCount: this.gustAcceptedCount,
      bodies: Object.freeze(bodies),
    });
  }

  private activate(body: DebrisState, input: StormForceInput): void {
    const profile = DEBRIS_PROFILES[body.debrisClass];
    const outward = direction(input.x, input.z, body.x, body.z);
    const side = deterministicSign(body.id);
    const inverseMass = 1 / Math.max(0.7, body.mass);
    const tangentX = outward.z * side;
    const tangentZ = -outward.x * side;

    body.active = true;
    body.entity.enabled = true;
    body.y += body.debrisClass === 'trim' ? 0.28 : 0.10;
    body.rotationX = body.activationRotation[0] / RAD_TO_DEG;
    body.rotationY = body.activationRotation[1] / RAD_TO_DEG;
    body.rotationZ = body.activationRotation[2] / RAD_TO_DEG;
    body.velocityX = outward.x * profile.launchHorizontal * 0.55 + tangentX * profile.launchHorizontal;
    body.velocityY = profile.launchVertical * (0.82 + inverseMass * 0.8);
    body.velocityZ = outward.z * profile.launchHorizontal * 0.55 + tangentZ * profile.launchHorizontal;
    body.angularX = side * (0.45 + inverseMass * 0.85) * profile.angularScale;
    body.angularY = (0.70 + inverseMass * 1.05) * profile.angularScale;
    body.angularZ = -side * (0.52 + inverseMass * 0.72) * profile.angularScale;
    body.airborne = body.debrisClass === 'trim' || body.debrisClass === 'roof';
    body.peakHeight = body.y;
    this.activationCount += 1;
    this.applyPose(body);
  }

  private updateBody(body: DebrisState, input: StormForceInput, deltaSeconds: number): void {
    const profile = DEBRIS_PROFILES[body.debrisClass];
    let remaining = deltaSeconds;
    while (remaining > 0.00001) {
      const step = Math.min(PHYSICS_SUBSTEP, remaining);
      remaining -= step;
      const inward = direction(body.x, body.z, input.x, input.z);
      const range = Math.max(input.radius * 4.2, 22);
      const falloff = 1 - clamp(inward.distance / range, 0, 1);
      const side = deterministicSign(body.id);
      const pullBoost = this.pullSecondsRemaining > 0 ? 1.85 : 1;
      const inverseMass = 1 / Math.max(0.7, body.mass);
      const suction = (3.8 + input.efMultiplier * 1.5) * falloff * pullBoost * inverseMass * profile.suctionScale;
      const swirl = (5.2 + input.efMultiplier * 1.7) * falloff * (0.75 + (pullBoost - 1) * 0.45) * inverseMass * profile.swirlScale;
      const nearCore = 1 - clamp(inward.distance / Math.max(input.radius * 1.15, 1), 0, 1);
      const rise = Math.max(0, body.y - body.homeY);
      const altitudeLiftScale = 1 - clamp(rise / Math.max(profile.maxRise, 0.001), 0, 1) * 0.92;
      const lift = (2.6 + falloff * 7.0 + nearCore * 4.5 + (this.pullSecondsRemaining > 0 ? 4.5 : 0))
        * inverseMass
        * profile.liftScale
        * altitudeLiftScale;
      const tangentX = -inward.z * side;
      const tangentZ = inward.x * side;
      const drag = profile.dragBase + body.mass * 0.026;

      body.velocityX += (inward.x * suction + tangentX * swirl - body.velocityX * drag) * step;
      body.velocityZ += (inward.z * suction + tangentZ * swirl - body.velocityZ * drag) * step;
      body.velocityY += (lift - 6.8 - body.velocityY * (0.18 + profile.dragBase * 0.08)) * step;
      body.x += body.velocityX * step;
      body.y += body.velocityY * step;
      body.z += body.velocityZ * step;
      body.rotationX += body.angularX * step;
      body.rotationY += body.angularY * step;
      body.rotationZ += body.angularZ * step;

      const altitudeCeiling = body.homeY + profile.maxRise;
      if (body.y > altitudeCeiling) {
        body.y = altitudeCeiling;
        body.velocityY = Math.min(body.velocityY, 0);
      }

      if (body.y < 0.45) {
        body.y = 0.45;
        body.velocityY = Math.abs(body.velocityY) * (body.debrisClass === 'trim' ? 0.24 : 0.10);
        body.velocityX *= profile.groundDamping;
        body.velocityZ *= profile.groundDamping;
        body.angularX *= 0.88;
        body.angularY *= 0.88;
        body.angularZ *= 0.88;
      }
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
