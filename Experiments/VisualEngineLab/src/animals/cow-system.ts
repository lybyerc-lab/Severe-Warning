import { Mesh, MeshBuilder, Scene, TransformNode, Vector3 } from '@babylonjs/core';
import type { QualityProfile } from '../contracts/quality-profile';
import { MaterialLibrary } from '../materials/material-library';

// [SW:LAB:SAFE_COW]
// Cow 17 is recognizable, invincible, non-targetable, and never damage-scored.

export const COW_STATES = [
  'idle', 'graze', 'notice', 'double-take', 'brace', 'slide', 'front-lift',
  'launch', 'orbit', 'safe-landing', 'recovery', 'offended-stare'
] as const;
export type CowState = (typeof COW_STATES)[number];

export class CowSystem {
  readonly id = 17;
  readonly safeAnimal = true;
  readonly targetable = false;
  readonly damageScoring = false;
  readonly root: TransformNode;
  readonly collisionProxy: Mesh;
  private readonly body: TransformNode;
  private readonly head: TransformNode;
  private readonly legs: TransformNode[] = [];
  private stateValue: CowState = 'idle';
  private stateTime = 0;
  private launchOrigin = new Vector3(-16, 0, 27);
  private landingOrigin = new Vector3(-5, 15, 5);
  private landingTarget = new Vector3(-17, 1.4, 14);
  private quality: QualityProfile;
  private treatment: 'baseline' | 'showcase' = 'baseline';

  constructor(private readonly scene: Scene, private readonly materials: MaterialLibrary, quality: QualityProfile) {
    this.quality = quality;
    this.root = new TransformNode('cow-17', scene);
    this.root.position.copyFrom(this.launchOrigin);
    this.root.scaling.setAll(1.08);
    this.body = new TransformNode('cow-17-body-rig', scene);
    this.body.parent = this.root;
    this.head = new TransformNode('cow-17-head-rig', scene);
    this.head.parent = this.body;
    this.buildCow();
    this.collisionProxy = MeshBuilder.CreateBox('cow-17-safe-collision', { width: 5.8, height: 4.8, depth: 2.8 }, scene);
    this.collisionProxy.parent = this.root;
    this.collisionProxy.position.y = 2.7;
    this.collisionProxy.isVisible = false;
    this.collisionProxy.isPickable = false;
    this.setTreatment('baseline');
    this.applyQuality(quality);
  }

  get state(): CowState {
    return this.stateValue;
  }

  setTreatment(treatment: 'baseline' | 'showcase'): void {
    this.treatment = treatment;
    if (treatment === 'showcase') {
      this.root.scaling.setAll(1.22); // slightly larger, readable Cow 17 silhouette
    } else {
      this.root.scaling.setAll(1.08);
    }
    this.applyQuality(this.quality);
  }

  setLandingTarget(target: Vector3): void {
    this.landingTarget.copyFrom(target);
  }

  setState(state: CowState): void {
    if (this.stateValue === state) return;
    this.stateValue = state;
    this.stateTime = 0;
    if (state === 'launch') this.launchOrigin.copyFrom(this.root.position);
    if (state === 'safe-landing') this.landingOrigin.copyFrom(this.root.position);
  }

  applyQuality(quality: QualityProfile): void {
    this.quality = quality;
    const detailMeshes = this.root.getChildMeshes().filter((mesh) => mesh.name.includes('spot') || mesh.name.includes('hoof') || mesh.name.includes('ear-tag-number'));
    for (const mesh of detailMeshes) mesh.setEnabled(this.treatment === 'showcase' || quality.animalLod >= 1);
  }

  update(deltaSeconds: number): void {
    this.stateTime += deltaSeconds;
    const t = this.stateTime;
    this.body.rotation.setAll(0);
    this.head.rotation.setAll(0);
    this.root.rotation.z = 0;
    this.legs.forEach((leg) => leg.rotation.setAll(0));
    switch (this.stateValue) {
      case 'idle':
        this.body.position.y = Math.sin(t * 1.5) * 0.04;
        this.head.rotation.x = Math.sin(t * 0.8) * 0.05;
        break;
      case 'graze':
        this.head.rotation.x = 0.72;
        this.head.position.y = -0.45;
        break;
      case 'notice':
        this.head.rotation.y = -0.42;
        this.head.rotation.x = -0.1;
        break;
      case 'double-take':
        this.head.rotation.y = t < 0.3 ? 0.65 : -0.72;
        this.body.position.y = t < 0.3 ? 0 : 0.12;
        break;
      case 'brace':
        this.root.scaling.y = (this.treatment === 'showcase' ? 1.22 : 1.08) * 0.88;
        this.body.rotation.z = -0.08;
        this.legs.forEach((leg, index) => leg.rotation.z = index < 2 ? 0.18 : -0.18);
        break;
      case 'slide':
        this.root.position.x -= deltaSeconds * 2.6;
        this.body.rotation.z = -0.12;
        break;
      case 'front-lift':
        this.root.rotation.z = -0.28 * Math.min(1, t / 0.7);
        this.root.position.y = Math.min(1.2, t * 1.2);
        break;
      case 'launch': {
        const progress = Math.min(1, t / 2.2);
        this.root.position.x = this.launchOrigin.x + progress * 13;
        this.root.position.y = Math.sin(progress * Math.PI) * 12 + progress * 5;
        this.root.position.z = this.launchOrigin.z - progress * 8;
        this.root.rotation.z = progress * Math.PI * 0.72;
        break;
      }
      case 'orbit': {
        const angle = t * 1.08;
        this.root.position.set(-3 + Math.cos(angle) * 10.5, 15 + Math.sin(angle * 0.52) * 4.5, 4 + Math.sin(angle) * 10.5);
        this.root.rotation.y = angle + Math.PI / 2;
        this.root.rotation.z = Math.sin(angle * 0.8) * 0.32;
        break;
      }
      case 'safe-landing': {
        const progress = Math.min(1, t / 1.4);
        this.root.position.x = this.landingOrigin.x + (this.landingTarget.x - this.landingOrigin.x) * progress;
        this.root.position.z = this.landingOrigin.z + (this.landingTarget.z - this.landingOrigin.z) * progress;
        this.root.position.y = Math.max(this.landingTarget.y, this.landingOrigin.y * (1 - progress) + Math.sin(progress * Math.PI) * 3);
        this.root.rotation.z = (1 - progress) * 0.5;
        break;
      }
      case 'recovery':
        this.root.position.copyFrom(this.landingTarget);
        this.root.scaling.y = (this.treatment === 'showcase' ? 1.22 : 1.08) * (0.82 + Math.min(1, t / 0.8) * 0.26);
        this.body.rotation.z = Math.sin(t * 18) * 0.06 * Math.max(0, 1 - t / 1.2);
        break;
      case 'offended-stare':
        this.root.position.copyFrom(this.landingTarget);
        this.head.rotation.y = -0.55;
        this.head.rotation.x = -0.08;
        break;
    }
    if (this.stateValue !== 'graze') this.head.position.set(2.75, 3.7, 0);
    if (!['brace', 'recovery'].includes(this.stateValue)) this.root.scaling.setAll(this.treatment === 'showcase' ? 1.22 : 1.08);
  }

  reset(): void {
    this.stateValue = 'idle';
    this.stateTime = 0;
    this.root.position.set(-16, 0, 27);
    this.root.rotation.setAll(0);
    this.root.scaling.setAll(this.treatment === 'showcase' ? 1.22 : 1.08);
    this.body.position.setAll(0);
    this.body.rotation.setAll(0);
    this.head.position.set(2.75, 3.7, 0);
    this.head.rotation.setAll(0);
    this.legs.forEach((leg) => leg.rotation.setAll(0));
    this.applyQuality(this.quality);
  }

  dispose(): void {
    this.root.dispose(false, true);
  }

  private buildCow(): void {
    const hide = this.materials.get('cow-hide-white', '#f3eee1');
    const spot = this.materials.get('cow-hide-black', '#262525');
    const muzzle = this.materials.get('cow-muzzle', '#d7a39a');
    const hoof = this.materials.get('cow-hoof', '#332c2a');

    const torso = MeshBuilder.CreateSphere('cow-17-torso', { diameter: 5.2, segments: 12 }, this.scene);
    torso.scaling.set(1.3, 0.82, 0.68);
    torso.position.y = 3.5;
    torso.material = hide;
    torso.parent = this.body;
    const shoulder = MeshBuilder.CreateSphere('cow-17-shoulder', { diameter: 3.8, segments: 10 }, this.scene);
    shoulder.scaling.set(0.84, 1, 0.78);
    shoulder.position.set(1.65, 3.65, 0);
    shoulder.material = spot;
    shoulder.parent = this.body;
    const hip = MeshBuilder.CreateSphere('cow-17-hip', { diameter: 4.1, segments: 10 }, this.scene);
    hip.scaling.set(0.9, 1, 0.8);
    hip.position.set(-1.7, 3.55, 0);
    hip.material = hide;
    hip.parent = this.body;

    const neck = MeshBuilder.CreateCylinder('cow-17-neck', { height: 2.4, diameterTop: 1.7, diameterBottom: 2.2, tessellation: 10 }, this.scene);
    neck.rotation.z = -0.7;
    neck.position.set(2.1, 3.9, 0);
    neck.material = spot;
    neck.parent = this.body;
    const head = MeshBuilder.CreateBox('cow-17-head', { width: 2.35, height: 2.4, depth: 2.25 }, this.scene);
    head.material = hide;
    head.parent = this.head;
    const nose = MeshBuilder.CreateBox('cow-17-muzzle', { width: 1.55, height: 1.1, depth: 2.35 }, this.scene);
    nose.position.set(1.45, -0.35, 0);
    nose.material = muzzle;
    nose.parent = this.head;
    for (const z of [-1.25, 1.25]) {
      const ear = MeshBuilder.CreateDisc(`cow-17-ear-${z}`, { radius: 0.62, tessellation: 8 }, this.scene);
      ear.rotation.y = Math.PI / 2;
      ear.scaling.y = 0.55;
      ear.position.set(-0.1, 0.6, z);
      ear.material = spot;
      ear.parent = this.head;
    }
    const tag = MeshBuilder.CreateBox('cow-17-ear-tag', { width: 0.16, height: 0.8, depth: 0.68 }, this.scene);
    tag.position.set(0.2, 0.25, -1.55);
    tag.material = this.materials.get('cow-ear-tag', '#f5b51b', { emissive: 0.18 });
    tag.parent = this.head;
    for (const [name, x] of [['1', -0.12], ['7', 0.13]] as const) {
      const digit = MeshBuilder.CreateBox(`cow-17-ear-tag-number-${name}`, { width: 0.04, height: 0.38, depth: 0.08 }, this.scene);
      digit.position.set(0.11, 0.25 + x, -1.93);
      digit.rotation.x = Math.PI / 2;
      digit.material = hoof;
      digit.parent = this.head;
    }

    for (let index = 0; index < 4; index += 1) {
      const legRoot = new TransformNode(`cow-17-leg-rig-${index}`, this.scene);
      legRoot.position.set(index < 2 ? 1.55 : -1.55, 2.1, index % 2 ? 1.18 : -1.18);
      legRoot.parent = this.body;
      const leg = MeshBuilder.CreateCylinder(`cow-17-leg-${index}`, { height: 3.2, diameterTop: 0.56, diameterBottom: 0.42, tessellation: 8 }, this.scene);
      leg.position.y = -1.55;
      leg.material = index % 3 === 0 ? spot : hide;
      leg.parent = legRoot;
      const hoofMesh = MeshBuilder.CreateBox(`cow-17-hoof-${index}`, { width: 0.68, height: 0.45, depth: 0.82 }, this.scene);
      hoofMesh.position.set(0.15, -3.25, 0);
      hoofMesh.material = hoof;
      hoofMesh.parent = legRoot;
      this.legs.push(legRoot);
    }

    const tail = MeshBuilder.CreateCylinder('cow-17-tail', { height: 3.1, diameter: 0.24, tessellation: 8 }, this.scene);
    tail.rotation.z = -0.68;
    tail.position.set(-3.35, 3.2, 0);
    tail.material = hide;
    tail.parent = this.body;
    const tuft = MeshBuilder.CreateIcoSphere('cow-17-tail-tuft', { radius: 0.5, subdivisions: 1 }, this.scene);
    tuft.position.set(-4.35, 2.05, 0);
    tuft.material = spot;
    tuft.parent = this.body;

    for (const [name, position, scaling] of [
      ['spot-a', new Vector3(-0.3, 4.35, -1.78), new Vector3(1.1, 0.75, 0.18)],
      ['spot-b', new Vector3(-1.65, 3.45, 1.48), new Vector3(0.75, 0.9, 0.18)]
    ] as const) {
      const patch = MeshBuilder.CreateDisc(`cow-17-${name}`, { radius: 1, tessellation: 12 }, this.scene);
      patch.position.copyFrom(position);
      patch.scaling.copyFrom(scaling);
      patch.material = spot;
      patch.parent = this.body;
    }
  }
}
