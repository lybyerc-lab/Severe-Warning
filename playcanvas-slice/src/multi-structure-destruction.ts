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

interface StructurePart {
  readonly entity: PcEntity;
  readonly offset: readonly [number, number, number];
  readonly scale: readonly [number, number, number];
  readonly rotation: readonly [number, number, number];
  readonly role: 'body' | 'roof' | 'accent';
}

interface StructureDebrisPart {
  readonly entity: PcEntity;
  readonly offset: readonly [number, number, number];
  readonly mass: number;
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
  readonly maxDisplacement: number;
  readonly pullAcceptedCount: number;
  readonly gustAcceptedCount: number;
  readonly bodies: readonly Readonly<{
    id: string;
    structureId: AuthorityStructureArchetype;
    activationStage: number;
    active: boolean;
    airborne: boolean;
    displacement: number;
    x: number;
    y: number;
    z: number;
  }>[];
}

interface ArchetypeMaterials {
  readonly wall: PcMaterial;
  readonly roof: PcMaterial;
  readonly accent: PcMaterial;
  readonly debris: PcMaterial;
}

interface DebrisState {
  readonly id: string;
  readonly structureId: AuthorityStructureArchetype;
  readonly entity: PcEntity;
  readonly mass: number;
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
}

const RAD_TO_DEG = 180 / Math.PI;
const PHYSICS_SUBSTEP = 1 / 60;
const MAX_FRAME_DELTA = 0.12;
const PULL_ACTIVE_SECONDS = 2.5;

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
  const weathered = createMaterial(pc, [0.38, 0.32, 0.25], { gloss: 0.12 });
  const metal = createMaterial(pc, [0.42, 0.47, 0.50], { metalness: 0.38, gloss: 0.42 });

  return Object.freeze({
    house: Object.freeze({
      wall: createMaterial(pc, [0.43, 0.54, 0.61], { gloss: 0.18 }),
      roof: darkRoof,
      accent: pale,
      debris: weathered,
    }),
    storefront: Object.freeze({
      wall: createMaterial(pc, [0.56, 0.22, 0.14], { gloss: 0.16 }),
      roof: darkRoof,
      accent: createMaterial(pc, [0.86, 0.68, 0.24], { gloss: 0.25 }),
      debris: weathered,
    }),
    barn: Object.freeze({
      wall: createMaterial(pc, [0.58, 0.12, 0.10], { gloss: 0.14 }),
      roof: createMaterial(pc, [0.34, 0.36, 0.37], { metalness: 0.25, gloss: 0.36 }),
      accent: pale,
      debris: weathered,
    }),
    industrial: Object.freeze({
      wall: createMaterial(pc, [0.31, 0.34, 0.36], { gloss: 0.16 }),
      roof: metal,
      accent: createMaterial(pc, [0.72, 0.58, 0.20], { gloss: 0.22 }),
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
    type: 'box' | 'cylinder',
    offset: readonly [number, number, number],
    scale: readonly [number, number, number],
    material: PcMaterial,
    role: StructurePart['role'],
    rotation: readonly [number, number, number] = [0, 0, 0],
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
    core.push(Object.freeze({ entity, offset, scale, rotation, role }));
  };

  const addDebris = (
    name: string,
    offset: readonly [number, number, number],
    scale: readonly [number, number, number],
    mass: number,
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
    debris.push(Object.freeze({ entity, offset, mass, activationStage, activationRotation }));
  };

  if (id === 'house') {
    addCore('body', 'box', [0, 2.6, 0], [8.4, 5.2, 7.2], materials.wall, 'body');
    addCore('roof', 'box', [0, 5.65, 0], [9.0, 0.65, 7.8], materials.roof, 'roof');
    addCore('porch', 'box', [-2.3, 0.8, -4.1], [3.2, 1.3, 1.5], materials.accent, 'accent');
    addDebris('roof', [1.9, 5.3, 0.6], [4.4, 0.55, 3.4], 1.7, 1, [12, 25, 32]);
    addDebris('wall', [-2.0, 2.4, -1.5], [2.4, 2.5, 0.7], 2.6, 2, [18, 10, -28]);
    addDebris('core', [1.4, 1.6, 1.2], [2.6, 2.1, 2.1], 3.5, 3, [24, 34, 16]);
  } else if (id === 'storefront') {
    addCore('body', 'box', [0, 3.0, 0], [10.5, 6.0, 7.6], materials.wall, 'body');
    addCore('roof', 'box', [0, 6.3, 0], [11.2, 0.55, 8.2], materials.roof, 'roof');
    addCore('sign', 'box', [0, 4.4, -4.05], [6.4, 1.2, 0.35], materials.accent, 'accent');
    addDebris('sign', [-1.5, 4.1, -3.5], [3.2, 1.0, 0.3], 1.2, 1, [8, 18, -42]);
    addDebris('facade', [2.7, 2.8, -2.9], [3.2, 2.8, 0.65], 2.8, 2, [22, 30, 22]);
    addDebris('core', [-2.4, 1.8, 1.3], [3.6, 2.4, 2.4], 4.2, 3, [28, 18, -20]);
  } else if (id === 'barn') {
    addCore('body', 'box', [0, 2.7, 0], [10.8, 5.4, 8.6], materials.wall, 'body');
    addCore('roof', 'box', [0, 5.9, 0], [11.6, 0.75, 9.3], materials.roof, 'roof');
    addCore('door', 'box', [0, 2.0, -4.45], [3.6, 3.9, 0.35], materials.accent, 'accent');
    addDebris('roof-a', [-2.5, 5.5, 0.9], [4.8, 0.7, 4.1], 2.0, 1, [20, 16, 38]);
    addDebris('roof-b', [2.6, 5.6, -0.8], [4.5, 0.65, 3.8], 2.1, 2, [18, -22, -34]);
    addDebris('wall', [0.8, 2.2, 2.6], [3.6, 2.8, 0.8], 3.4, 3, [30, 12, 20]);
  } else {
    addCore('body', 'box', [0, 3.4, 0], [12.2, 6.8, 9.4], materials.wall, 'body');
    addCore('roof', 'box', [0, 7.05, 0], [12.8, 0.6, 10.0], materials.roof, 'roof');
    addCore('service-door', 'box', [-3.4, 2.1, -4.9], [3.6, 4.0, 0.35], materials.accent, 'accent');
    addCore('vent-a', 'cylinder', [2.8, 8.0, 1.4], [0.7, 1.5, 0.7], materials.roof, 'accent');
    addCore('vent-b', 'cylinder', [-1.4, 7.8, -0.6], [0.55, 1.2, 0.55], materials.roof, 'accent');
    addDebris('roof', [2.8, 6.8, 1.0], [5.4, 0.55, 4.0], 3.0, 1, [12, 28, 24]);
    addDebris('wall', [-3.0, 3.0, -2.8], [3.4, 3.0, 0.75], 4.7, 2, [20, 14, -22]);
    addDebris('core', [2.1, 2.0, 1.8], [3.8, 2.8, 2.7], 6.3, 3, [16, 24, 18]);
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

  private applyVisualState(
    visual: StructureVisual,
    centerX: number,
    centerZ: number,
    stage: number,
    destroyed: boolean,
  ): void {
    const sign = deterministicSign(visual.id);
    const compression = stage === 0 ? 1 : (stage === 1 ? 0.94 : 0.82);
    const lean = stage === 0 ? 0 : sign * (stage === 1 ? 4.0 : 10.5);

    for (const part of visual.core) {
      part.entity.enabled = !destroyed;
      if (destroyed) continue;
      const roleLift = part.role === 'roof' ? stage * 0.12 : 0;
      const roleShift = part.role === 'roof' ? sign * stage * 0.38 : (part.role === 'accent' ? sign * stage * 0.18 : 0);
      const roleTilt = part.role === 'roof' ? sign * stage * 7.5 : (part.role === 'accent' ? -sign * stage * 5.0 : 0);
      const verticalCompression = part.role === 'body' ? compression : 1;
      part.entity.setPosition(
        centerX + part.offset[0] + roleShift,
        part.offset[1] * (part.role === 'body' ? compression : 1) + roleLift,
        centerZ + part.offset[2],
      );
      part.entity.setLocalScale(part.scale[0], part.scale[1] * verticalCompression, part.scale[2]);
      part.entity.setEulerAngles(part.rotation[0], part.rotation[1], part.rotation[2] + lean + roleTilt);
    }
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
      if (!body.airborne) continue;
      const outward = direction(input.x, input.z, body.x, body.z);
      const range = input.radius * 3.2;
      if (outward.distance > range) continue;
      const falloff = 1 - clamp(outward.distance / Math.max(range, 0.001), 0, 1);
      const impulse = 4.0 + falloff * 5.0;
      body.velocityX += outward.x * impulse;
      body.velocityZ += outward.z * impulse;
      body.velocityY += 1.4 + falloff * 1.2;
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
      if (!body.airborne) continue;
      this.updateBody(body, input, safeDelta);
      const displacement = Math.hypot(body.x - body.homeX, body.y - body.homeY, body.z - body.homeZ);
      this.maxDisplacement = Math.max(this.maxDisplacement, displacement);
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
      body.active = false;
      body.airborne = false;
      body.entity.enabled = false;
      this.applyPose(body);
    }
  }

  getTelemetry(): StructureDebrisTelemetry {
    const bodies = this.bodies.map((body) => Object.freeze({
      id: body.id,
      structureId: body.structureId,
      activationStage: body.activationStage,
      active: body.active,
      airborne: body.airborne,
      displacement: Math.hypot(body.x - body.homeX, body.y - body.homeY, body.z - body.homeZ),
      x: body.x,
      y: body.y,
      z: body.z,
    }));
    return Object.freeze({
      updateCount: this.updateCount,
      activationCount: this.activationCount,
      activeCount: bodies.filter((body) => body.active).length,
      maxDisplacement: this.maxDisplacement,
      pullAcceptedCount: this.pullAcceptedCount,
      gustAcceptedCount: this.gustAcceptedCount,
      bodies: Object.freeze(bodies),
    });
  }

  private activate(body: DebrisState, input: StormForceInput): void {
    body.active = true;
    body.airborne = true;
    body.entity.enabled = true;
    body.y += 0.35;
    body.rotationX = body.activationRotation[0] / RAD_TO_DEG;
    body.rotationY = body.activationRotation[1] / RAD_TO_DEG;
    body.rotationZ = body.activationRotation[2] / RAD_TO_DEG;
    const outward = direction(input.x, input.z, body.x, body.z);
    const side = deterministicSign(body.id);
    const inverseMass = 1 / Math.max(0.5, body.mass);
    body.velocityX = outward.x * 1.8 + outward.z * side * 2.5;
    body.velocityY = 3.6 + inverseMass * 2.2;
    body.velocityZ = outward.z * 1.8 - outward.x * side * 2.5;
    body.angularX = side * (0.8 + inverseMass * 0.9);
    body.angularY = 1.1 + inverseMass * 1.2;
    body.angularZ = -side * (0.9 + inverseMass * 0.8);
    this.activationCount += 1;
    this.applyPose(body);
  }

  private updateBody(body: DebrisState, input: StormForceInput, deltaSeconds: number): void {
    let remaining = deltaSeconds;
    while (remaining > 0.00001) {
      const step = Math.min(PHYSICS_SUBSTEP, remaining);
      remaining -= step;
      const inward = direction(body.x, body.z, input.x, input.z);
      const range = Math.max(input.radius * 4.2, 22);
      const falloff = 1 - clamp(inward.distance / range, 0, 1);
      const side = deterministicSign(body.id);
      const pullBoost = this.pullSecondsRemaining > 0 ? 1.85 : 1;
      const inverseMass = 1 / Math.max(0.5, body.mass);
      const suction = (3.8 + input.efMultiplier * 1.5) * falloff * pullBoost * inverseMass;
      const swirl = (5.2 + input.efMultiplier * 1.7) * falloff * (0.75 + (pullBoost - 1) * 0.45) * inverseMass;
      const nearCore = 1 - clamp(inward.distance / Math.max(input.radius * 1.15, 1), 0, 1);
      const lift = (2.6 + falloff * 7.0 + nearCore * 4.5 + (this.pullSecondsRemaining > 0 ? 4.5 : 0)) * inverseMass;
      const tangentX = -inward.z * side;
      const tangentZ = inward.x * side;
      const drag = 0.46 + body.mass * 0.025;

      body.velocityX += (inward.x * suction + tangentX * swirl - body.velocityX * drag) * step;
      body.velocityZ += (inward.z * suction + tangentZ * swirl - body.velocityZ * drag) * step;
      body.velocityY += (lift - 6.8 - body.velocityY * 0.18) * step;
      body.x += body.velocityX * step;
      body.y += body.velocityY * step;
      body.z += body.velocityZ * step;
      body.rotationX += body.angularX * step;
      body.rotationY += body.angularY * step;
      body.rotationZ += body.angularZ * step;

      if (body.y < 0.45) {
        body.y = 0.45;
        body.velocityY = Math.abs(body.velocityY) * 0.28;
        body.velocityX *= 0.78;
        body.velocityZ *= 0.78;
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
