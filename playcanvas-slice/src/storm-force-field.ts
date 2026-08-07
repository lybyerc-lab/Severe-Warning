// ============================================================================
// [SW:PLAYCANVAS:STORM_FORCE_FIELD]
// Purpose: Own deterministic visible storm/environment response while the
// accepted legacy runtime remains gameplay authority.
// Invariants:
// - Only accepted Pull/Gust requests start ability reactions.
// - Cow 17 and other protected animals never enter this body registry.
// - The game owns the force law; PlayCanvas only receives visible transforms.
// - Reset returns every registered body to its authored pose.
// ============================================================================

import type { PcEntity } from './engine-types';

export type StormReactiveKind = 'tree' | 'light-prop' | 'barn-roof' | 'barn-debris';

export interface StormReactivePartDefinition {
  readonly entity: PcEntity;
  readonly offset: readonly [number, number, number];
  readonly rotation?: readonly [number, number, number];
}

export interface StormReactiveBodyDefinition {
  readonly id: string;
  readonly kind: StormReactiveKind;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly mass: number;
  readonly groundY?: number;
  readonly activationStage?: number;
  readonly activationOffset?: readonly [number, number, number];
  readonly activationRotation?: readonly [number, number, number];
  readonly parts: readonly StormReactivePartDefinition[];
}

export interface StormForceInput {
  readonly x: number;
  readonly z: number;
  readonly radius: number;
  readonly efMultiplier: number;
  readonly barnStage: number;
  readonly barnRoofDetached: boolean;
  readonly barnDestroyed: boolean;
}

export interface StormPhysicsBodyTelemetry {
  readonly id: string;
  readonly kind: StormReactiveKind;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly homeX: number;
  readonly homeY: number;
  readonly homeZ: number;
  readonly rotationX: number;
  readonly rotationZ: number;
  readonly displacement: number;
  readonly airborne: boolean;
  readonly controlled: boolean;
  readonly reaction: 'pull' | 'gust' | null;
}

export interface StormPhysicsTelemetry {
  readonly updateCount: number;
  readonly acceptedPullCount: number;
  readonly acceptedGustCount: number;
  readonly treePullReactionCount: number;
  readonly treeGustReactionCount: number;
  readonly lightPullReactionCount: number;
  readonly lightGustReactionCount: number;
  readonly debrisActivationCount: number;
  readonly activeBodyCount: number;
  readonly airborneBodyCount: number;
  readonly roofAirborne: boolean;
  readonly maxRegisteredBodyCount: number;
  readonly peakTreeTiltRadians: number;
  readonly maxPullInwardDelta: number;
  readonly maxPullTangentialDelta: number;
  readonly maxGustOutwardDelta: number;
  readonly maxDebrisDisplacement: number;
  readonly resetCount: number;
  readonly disposeCount: number;
  readonly disposed: boolean;
  readonly bodies: readonly StormPhysicsBodyTelemetry[];
}

type AbilityReactionKind = 'pull' | 'gust';

interface TreeReaction {
  readonly type: 'tree';
  readonly ability: AbilityReactionKind;
  readonly bendX: number;
  readonly bendZ: number;
  readonly anticipateX: number;
  readonly anticipateZ: number;
  elapsed: number;
}

interface LightReaction {
  readonly type: 'light';
  readonly ability: AbilityReactionKind;
  readonly startX: number;
  readonly startZ: number;
  readonly targetX: number;
  readonly targetZ: number;
  readonly originX: number;
  readonly originZ: number;
  readonly directionX: number;
  readonly directionZ: number;
  readonly orbitSide: number;
  readonly orbitAmplitude: number;
  readonly falloff: number;
  readonly duration: number;
  readonly initialDistance: number;
  elapsed: number;
}

type BodyReaction = TreeReaction | LightReaction | null;

interface BodyState {
  readonly definition: StormReactiveBodyDefinition;
  x: number;
  y: number;
  z: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  angularX: number;
  angularY: number;
  angularZ: number;
  controlled: boolean;
  airborne: boolean;
  reaction: BodyReaction;
}

const RAD_TO_DEG = 180 / Math.PI;
const MAX_FRAME_DELTA = 0.12;
const PHYSICS_SUBSTEP = 1 / 60;
const PULL_ACTIVE_SECONDS = 2.5;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
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

function deterministicSide(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) | 0;
  return (hash & 1) === 0 ? 1 : -1;
}

function displacement(body: BodyState): number {
  const definition = body.definition;
  return Math.hypot(body.x - definition.x, body.y - definition.y, body.z - definition.z);
}

export class StormForceField {
  private readonly bodies: BodyState[];
  private updateCount = 0;
  private acceptedPullCount = 0;
  private acceptedGustCount = 0;
  private treePullReactionCount = 0;
  private treeGustReactionCount = 0;
  private lightPullReactionCount = 0;
  private lightGustReactionCount = 0;
  private debrisActivationCount = 0;
  private peakTreeTiltRadians = 0;
  private maxPullInwardDelta = 0;
  private maxPullTangentialDelta = 0;
  private maxGustOutwardDelta = 0;
  private maxDebrisDisplacement = 0;
  private pullSecondsRemaining = 0;
  private resetCount = 0;
  private disposeCount = 0;
  private disposed = false;

  constructor(definitions: readonly StormReactiveBodyDefinition[]) {
    this.bodies = definitions.map((definition) => ({
      definition,
      x: definition.x,
      y: definition.y,
      z: definition.z,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      velocityX: 0,
      velocityY: 0,
      velocityZ: 0,
      angularX: 0,
      angularY: 0,
      angularZ: 0,
      controlled: definition.kind === 'tree' || definition.kind === 'light-prop',
      airborne: false,
      reaction: null,
    }));
    for (const body of this.bodies) this.applyPose(body);
  }

  triggerAbility(slot: 'primary' | 'secondary' | 'tertiary', input: StormForceInput): void {
    if (this.disposed) return;
    if (slot === 'primary') {
      this.acceptedPullCount += 1;
      this.pullSecondsRemaining = PULL_ACTIVE_SECONDS;
      this.cancelAbilityReactions();
      for (const body of this.bodies) {
        if (body.definition.kind === 'tree') this.startTreeReaction(body, 'pull', input);
        if (body.definition.kind === 'light-prop') this.startLightReaction(body, 'pull', input);
      }
      return;
    }
    if (slot === 'secondary') {
      this.acceptedGustCount += 1;
      this.pullSecondsRemaining = 0;
      this.cancelAbilityReactions();
      for (const body of this.bodies) {
        if (body.definition.kind === 'tree') this.startTreeReaction(body, 'gust', input);
        if (body.definition.kind === 'light-prop') this.startLightReaction(body, 'gust', input);
        if (body.airborne) this.applyGustImpulse(body, input);
      }
    }
  }

  syncBarnState(input: StormForceInput): void {
    if (this.disposed) return;
    for (const body of this.bodies) {
      const kind = body.definition.kind;
      if (kind !== 'barn-roof' && kind !== 'barn-debris') continue;
      if (body.controlled) continue;
      const activationStage = body.definition.activationStage ?? (kind === 'barn-roof' ? 3 : 1);
      const shouldActivate = kind === 'barn-roof'
        ? input.barnRoofDetached || input.barnDestroyed || input.barnStage >= activationStage
        : input.barnStage >= activationStage || input.barnDestroyed;
      if (shouldActivate) this.activateDebris(body, input);
    }
  }

  update(input: StormForceInput, deltaSeconds: number): void {
    if (this.disposed) return;
    this.updateCount += 1;
    const safeDelta = clamp(deltaSeconds, 0, MAX_FRAME_DELTA);
    this.pullSecondsRemaining = Math.max(0, this.pullSecondsRemaining - safeDelta);

    for (const body of this.bodies) {
      if (body.reaction?.type === 'tree') this.updateTreeReaction(body, safeDelta);
      if (body.reaction?.type === 'light') this.updateLightReaction(body, safeDelta);
      if (body.airborne) this.updateAirborneBody(body, input, safeDelta);
      this.maxDebrisDisplacement = body.definition.kind === 'barn-roof' || body.definition.kind === 'barn-debris'
        ? Math.max(this.maxDebrisDisplacement, displacement(body))
        : this.maxDebrisDisplacement;
      this.applyPose(body);
    }
  }

  reset(): void {
    if (this.disposed) return;
    this.resetCount += 1;
    this.pullSecondsRemaining = 0;
    this.peakTreeTiltRadians = 0;
    this.maxPullInwardDelta = 0;
    this.maxPullTangentialDelta = 0;
    this.maxGustOutwardDelta = 0;
    this.maxDebrisDisplacement = 0;
    for (const body of this.bodies) {
      body.x = body.definition.x;
      body.y = body.definition.y;
      body.z = body.definition.z;
      body.rotationX = 0;
      body.rotationY = 0;
      body.rotationZ = 0;
      body.velocityX = 0;
      body.velocityY = 0;
      body.velocityZ = 0;
      body.angularX = 0;
      body.angularY = 0;
      body.angularZ = 0;
      body.controlled = body.definition.kind === 'tree' || body.definition.kind === 'light-prop';
      body.airborne = false;
      body.reaction = null;
      this.applyPose(body);
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.reset();
    this.disposed = true;
    this.disposeCount += 1;
  }

  isRoofControlled(): boolean {
    return this.bodies.some((body) => body.definition.kind === 'barn-roof' && body.controlled);
  }

  getTelemetry(): StormPhysicsTelemetry {
    let activeBodyCount = 0;
    let airborneBodyCount = 0;
    let roofAirborne = false;
    const bodies = this.bodies.map((body): StormPhysicsBodyTelemetry => {
      if (body.reaction || body.airborne) activeBodyCount += 1;
      if (body.airborne) airborneBodyCount += 1;
      if (body.definition.kind === 'barn-roof' && body.airborne) roofAirborne = true;
      return Object.freeze({
        id: body.definition.id,
        kind: body.definition.kind,
        x: body.x,
        y: body.y,
        z: body.z,
        homeX: body.definition.x,
        homeY: body.definition.y,
        homeZ: body.definition.z,
        rotationX: body.rotationX,
        rotationZ: body.rotationZ,
        displacement: displacement(body),
        airborne: body.airborne,
        controlled: body.controlled,
        reaction: body.reaction?.ability ?? null,
      });
    });

    return Object.freeze({
      updateCount: this.updateCount,
      acceptedPullCount: this.acceptedPullCount,
      acceptedGustCount: this.acceptedGustCount,
      treePullReactionCount: this.treePullReactionCount,
      treeGustReactionCount: this.treeGustReactionCount,
      lightPullReactionCount: this.lightPullReactionCount,
      lightGustReactionCount: this.lightGustReactionCount,
      debrisActivationCount: this.debrisActivationCount,
      activeBodyCount,
      airborneBodyCount,
      roofAirborne,
      maxRegisteredBodyCount: this.bodies.length,
      peakTreeTiltRadians: this.peakTreeTiltRadians,
      maxPullInwardDelta: this.maxPullInwardDelta,
      maxPullTangentialDelta: this.maxPullTangentialDelta,
      maxGustOutwardDelta: this.maxGustOutwardDelta,
      maxDebrisDisplacement: this.maxDebrisDisplacement,
      resetCount: this.resetCount,
      disposeCount: this.disposeCount,
      disposed: this.disposed,
      bodies: Object.freeze(bodies),
    });
  }

  private cancelAbilityReactions(): void {
    for (const body of this.bodies) {
      if (body.definition.kind !== 'tree' && body.definition.kind !== 'light-prop') continue;
      body.reaction = null;
      body.rotationX = 0;
      body.rotationY = 0;
      body.rotationZ = 0;
      this.applyPose(body);
    }
  }

  private startTreeReaction(body: BodyState, ability: AbilityReactionKind, input: StormForceInput): void {
    const pull = ability === 'pull';
    const range = input.radius * (pull ? 3.2 : 3.0);
    const vector = pull
      ? direction(body.x, body.z, input.x, input.z)
      : direction(input.x, input.z, body.x, body.z);
    if (vector.distance > range) return;
    const falloff = 1 - clamp(vector.distance / Math.max(range, 0.001), 0, 1);
    const strength = pull ? 0.42 + falloff * 0.58 : 0.45 + falloff * 0.55;
    const tilt = pull ? 0.20 + strength * 0.26 : 0.18 + strength * 0.22;
    const bendX = vector.z * tilt;
    const bendZ = -vector.x * tilt;
    body.reaction = {
      type: 'tree',
      ability,
      bendX,
      bendZ,
      anticipateX: pull ? -vector.z * tilt * 0.14 : 0,
      anticipateZ: pull ? vector.x * tilt * 0.14 : 0,
      elapsed: 0,
    };
    if (pull) this.treePullReactionCount += 1;
    else this.treeGustReactionCount += 1;
  }

  private updateTreeReaction(body: BodyState, deltaSeconds: number): void {
    const reaction = body.reaction;
    if (!reaction || reaction.type !== 'tree') return;
    reaction.elapsed += deltaSeconds;

    if (reaction.ability === 'pull') {
      const anticipateDuration = 0.110;
      const bendDuration = 0.260;
      const holdDuration = 0.240;
      const recoverDuration = 0.860;
      if (reaction.elapsed <= anticipateDuration) {
        const t = reaction.elapsed / anticipateDuration;
        body.rotationX = lerp(0, reaction.anticipateX, t);
        body.rotationZ = lerp(0, reaction.anticipateZ, t);
      } else if (reaction.elapsed <= anticipateDuration + bendDuration) {
        const t = easeOutCubic((reaction.elapsed - anticipateDuration) / bendDuration);
        body.rotationX = lerp(reaction.anticipateX, reaction.bendX, t);
        body.rotationZ = lerp(reaction.anticipateZ, reaction.bendZ, t);
      } else if (reaction.elapsed <= anticipateDuration + bendDuration + holdDuration) {
        body.rotationX = reaction.bendX;
        body.rotationZ = reaction.bendZ;
      } else {
        const t = clamp((reaction.elapsed - anticipateDuration - bendDuration - holdDuration) / recoverDuration, 0, 1);
        const spring = Math.exp(-3.4 * t) * Math.cos(t * Math.PI * 3.8);
        body.rotationX = reaction.bendX * spring;
        body.rotationZ = reaction.bendZ * spring;
        if (t >= 1) body.reaction = null;
      }
    } else {
      const bendDuration = 0.180;
      const holdDuration = 0.100;
      const recoverDuration = 0.680;
      if (reaction.elapsed <= bendDuration) {
        const t = easeOutCubic(reaction.elapsed / bendDuration);
        body.rotationX = lerp(0, reaction.bendX, t);
        body.rotationZ = lerp(0, reaction.bendZ, t);
      } else if (reaction.elapsed <= bendDuration + holdDuration) {
        body.rotationX = reaction.bendX;
        body.rotationZ = reaction.bendZ;
      } else {
        const t = clamp((reaction.elapsed - bendDuration - holdDuration) / recoverDuration, 0, 1);
        const spring = Math.exp(-3.6 * t) * Math.cos(t * Math.PI * 4.0);
        body.rotationX = reaction.bendX * spring;
        body.rotationZ = reaction.bendZ * spring;
        if (t >= 1) body.reaction = null;
      }
    }

    this.peakTreeTiltRadians = Math.max(
      this.peakTreeTiltRadians,
      Math.hypot(body.rotationX, body.rotationZ),
    );
  }

  private startLightReaction(body: BodyState, ability: AbilityReactionKind, input: StormForceInput): void {
    const pull = ability === 'pull';
    const vector = pull
      ? direction(body.x, body.z, input.x, input.z)
      : direction(input.x, input.z, body.x, body.z);
    const range = input.radius * (pull ? 3.2 : 2.9);
    if (vector.distance > range) return;
    const falloff = 1 - clamp(vector.distance / Math.max(range, 0.001), 0, 1);
    let travelDistance: number;
    if (pull) {
      const availableDistance = Math.max(0, vector.distance - input.radius * 0.82);
      travelDistance = Math.min(availableDistance, 2.2 + falloff * 5.8);
      if (travelDistance <= 0.1) return;
    } else {
      travelDistance = 1.5 + falloff * 4.5;
    }
    body.reaction = {
      type: 'light',
      ability,
      startX: body.x,
      startZ: body.z,
      targetX: body.x + vector.x * travelDistance,
      targetZ: body.z + vector.z * travelDistance,
      originX: input.x,
      originZ: input.z,
      directionX: vector.x,
      directionZ: vector.z,
      orbitSide: deterministicSide(body.definition.id),
      orbitAmplitude: pull ? 0.6 + falloff * 1.1 : 0,
      falloff,
      duration: pull ? 0.680 : 0.340,
      initialDistance: vector.distance,
      elapsed: 0,
    };
    if (pull) this.lightPullReactionCount += 1;
    else this.lightGustReactionCount += 1;
  }

  private updateLightReaction(body: BodyState, deltaSeconds: number): void {
    const reaction = body.reaction;
    if (!reaction || reaction.type !== 'light') return;
    reaction.elapsed += deltaSeconds;
    const t = clamp(reaction.elapsed / reaction.duration, 0, 1);
    const eased = easeOutCubic(t);
    const orbit = reaction.ability === 'pull'
      ? Math.sin(t * Math.PI) * reaction.orbitSide * reaction.orbitAmplitude
      : 0;
    body.x = lerp(reaction.startX, reaction.targetX, eased) + reaction.directionZ * orbit;
    body.z = lerp(reaction.startZ, reaction.targetZ, eased) - reaction.directionX * orbit;
    const wobble = Math.sin(t * Math.PI * (reaction.ability === 'pull' ? 2.0 : 1.0))
      * (reaction.ability === 'pull' ? 0.16 : 0.18)
      * (0.45 + reaction.falloff);
    body.rotationX = reaction.directionZ * wobble;
    body.rotationZ = -reaction.directionX * wobble;

    const currentDistance = Math.hypot(body.x - reaction.originX, body.z - reaction.originZ);
    if (reaction.ability === 'pull') {
      this.maxPullInwardDelta = Math.max(this.maxPullInwardDelta, reaction.initialDistance - currentDistance);
      this.maxPullTangentialDelta = Math.max(this.maxPullTangentialDelta, Math.abs(orbit));
    } else {
      this.maxGustOutwardDelta = Math.max(this.maxGustOutwardDelta, currentDistance - reaction.initialDistance);
    }

    if (t >= 1) {
      body.x = reaction.targetX;
      body.z = reaction.targetZ;
      body.rotationX = 0;
      body.rotationZ = 0;
      body.reaction = null;
    }
  }

  private activateDebris(body: BodyState, input: StormForceInput): void {
    body.controlled = true;
    body.airborne = true;
    body.reaction = null;
    const activationOffset = body.definition.activationOffset ?? [0, 0.35, 0];
    const activationRotation = body.definition.activationRotation ?? [8, 18, 12];
    body.x = body.definition.x + activationOffset[0];
    body.y = body.definition.y + activationOffset[1];
    body.z = body.definition.z + activationOffset[2];
    body.rotationX = activationRotation[0] / RAD_TO_DEG;
    body.rotationY = activationRotation[1] / RAD_TO_DEG;
    body.rotationZ = activationRotation[2] / RAD_TO_DEG;
    const outward = direction(input.x, input.z, body.x, body.z);
    const side = deterministicSide(body.definition.id);
    body.velocityX = outward.x * 2.1 + outward.z * side * 2.8;
    body.velocityY = body.definition.kind === 'barn-roof' ? 5.4 : 4.0;
    body.velocityZ = outward.z * 2.1 - outward.x * side * 2.8;
    const inverseMass = 1 / Math.max(0.35, body.definition.mass);
    body.angularX = side * (1.1 + inverseMass * 0.8);
    body.angularY = (1.6 + inverseMass) * (body.definition.kind === 'barn-roof' ? 0.75 : 1);
    body.angularZ = -side * (1.2 + inverseMass * 0.7);
    this.debrisActivationCount += 1;
  }

  private applyGustImpulse(body: BodyState, input: StormForceInput): void {
    const outward = direction(input.x, input.z, body.x, body.z);
    const range = input.radius * 3.2;
    if (outward.distance > range) return;
    const falloff = 1 - clamp(outward.distance / Math.max(range, 0.001), 0, 1);
    const impulse = 4.0 + falloff * 5.0;
    body.velocityX += outward.x * impulse;
    body.velocityZ += outward.z * impulse;
    body.velocityY += 1.4 + falloff * 1.2;
  }

  private updateAirborneBody(body: BodyState, input: StormForceInput, deltaSeconds: number): void {
    let remaining = deltaSeconds;
    while (remaining > 0.00001) {
      const step = Math.min(PHYSICS_SUBSTEP, remaining);
      remaining -= step;
      const inward = direction(body.x, body.z, input.x, input.z);
      const range = Math.max(input.radius * 4.2, 22);
      const falloff = 1 - clamp(inward.distance / range, 0, 1);
      const side = deterministicSide(body.definition.id);
      const pullBoost = this.pullSecondsRemaining > 0 ? 1.85 : 1;
      const inverseMass = 1 / Math.max(0.5, body.definition.mass);
      const suction = (3.8 + input.efMultiplier * 1.5) * falloff * pullBoost * inverseMass;
      const swirl = (5.2 + input.efMultiplier * 1.7) * falloff * (0.75 + (pullBoost - 1) * 0.45) * inverseMass;
      const nearCore = 1 - clamp(inward.distance / Math.max(input.radius * 1.15, 1), 0, 1);
      const lift = (2.6 + falloff * 7.0 + nearCore * 4.5 + (this.pullSecondsRemaining > 0 ? 4.5 : 0)) * inverseMass;
      const tangentX = -inward.z * side;
      const tangentZ = inward.x * side;
      const drag = 0.46 + body.definition.mass * 0.025;

      body.velocityX += (inward.x * suction + tangentX * swirl - body.velocityX * drag) * step;
      body.velocityZ += (inward.z * suction + tangentZ * swirl - body.velocityZ * drag) * step;
      body.velocityY += (lift - 6.8 - body.velocityY * 0.18) * step;
      body.x += body.velocityX * step;
      body.y += body.velocityY * step;
      body.z += body.velocityZ * step;
      body.rotationX += body.angularX * step;
      body.rotationY += body.angularY * step;
      body.rotationZ += body.angularZ * step;

      const groundY = body.definition.groundY ?? 0.45;
      if (body.y < groundY) {
        body.y = groundY;
        body.velocityY = Math.abs(body.velocityY) * 0.28;
        body.velocityX *= 0.78;
        body.velocityZ *= 0.78;
      }
    }
  }

  private applyPose(body: BodyState): void {
    const tree = body.definition.kind === 'tree';
    for (const part of body.definition.parts) {
      const vertical = part.offset[1];
      const leanX = tree ? -Math.sin(body.rotationZ) * vertical * 0.68 : 0;
      const leanZ = tree ? Math.sin(body.rotationX) * vertical * 0.68 : 0;
      part.entity.setPosition(
        body.x + part.offset[0] + leanX,
        body.y + part.offset[1],
        body.z + part.offset[2] + leanZ,
      );
      const baseRotation = part.rotation ?? [0, 0, 0];
      part.entity.setEulerAngles(
        baseRotation[0] + body.rotationX * RAD_TO_DEG,
        baseRotation[1] + body.rotationY * RAD_TO_DEG,
        baseRotation[2] + body.rotationZ * RAD_TO_DEG,
      );
    }
  }
}

// [SW:PLAYCANVAS:STORM_FORCE_FIELD:END]
