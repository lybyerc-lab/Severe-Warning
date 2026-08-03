import { Mesh, MeshBuilder, Scene, TransformNode, Vector3 } from '@babylonjs/core';
import type { QualityProfile } from '../contracts/quality-profile';
import { MaterialLibrary } from '../materials/material-library';
import { DESTRUCTION_STAGES, destructionStageIndex, type DestructionStage } from './destruction-state';

// [SW:LAB:DESTRUCTION]
// Authored staged damage and pooled readable debris; no structural-physics authority.

interface DebrisBody {
  mesh: Mesh;
  velocity: Vector3;
  angularVelocity: Vector3;
  age: number;
  lifetime: number;
}

export class BarnDestructionSystem {
  readonly root: TransformNode;
  private readonly intactShell: TransformNode;
  private readonly exposedFrame: TransformNode;
  private readonly wreckage: TransformNode;
  private readonly debrisPool: DebrisBody[] = [];
  private stageValue: DestructionStage = 'intact';
  private quality: QualityProfile;

  constructor(private readonly scene: Scene, private readonly materials: MaterialLibrary, quality: QualityProfile) {
    this.quality = quality;
    this.root = new TransformNode('destructible-barn', scene);
    this.root.position.set(-28, 0, 27);
    this.intactShell = new TransformNode('barn-intact-shell', scene);
    this.exposedFrame = new TransformNode('barn-exposed-frame', scene);
    this.wreckage = new TransformNode('barn-wreckage', scene);
    this.intactShell.parent = this.root;
    this.exposedFrame.parent = this.root;
    this.wreckage.parent = this.root;
    this.buildBarn();
    this.buildDebrisPool(30);
    this.applyVisualState();
  }

  get stage(): DestructionStage {
    return this.stageValue;
  }

  setStage(stage: DestructionStage): void {
    if (destructionStageIndex(stage) < destructionStageIndex(this.stageValue)) return;
    this.stageValue = stage;
    if (stage !== 'intact') this.activateDebris(stage === 'wreckage' ? this.quality.debrisBudget : Math.ceil(this.quality.debrisBudget * 0.45));
    this.applyVisualState();
  }

  applyQuality(quality: QualityProfile): void {
    this.quality = quality;
    for (let index = quality.debrisBudget; index < this.debrisPool.length; index += 1) this.retire(this.debrisPool[index]);
  }

  update(deltaSeconds: number): void {
    for (const body of this.debrisPool) {
      if (!body.mesh.isEnabled()) continue;
      body.age += deltaSeconds;
      body.velocity.y -= 12 * deltaSeconds;
      body.mesh.position.addInPlace(body.velocity.scale(deltaSeconds));
      body.mesh.rotation.x += body.angularVelocity.x * deltaSeconds;
      body.mesh.rotation.y += body.angularVelocity.y * deltaSeconds;
      body.mesh.rotation.z += body.angularVelocity.z * deltaSeconds;
      if (body.mesh.position.y < 0.35) {
        body.mesh.position.y = 0.35;
        body.velocity.y = Math.abs(body.velocity.y) * 0.18;
        body.velocity.x *= 0.74;
        body.velocity.z *= 0.74;
      }
      if (body.age >= body.lifetime) this.retire(body);
    }
  }

  reset(): void {
    this.stageValue = 'intact';
    for (const body of this.debrisPool) this.retire(body);
    this.applyVisualState();
  }

  get activeDebris(): number {
    return this.debrisPool.filter((body) => body.mesh.isEnabled()).length;
  }

  dispose(): void {
    this.root.dispose(false, true);
    for (const body of this.debrisPool) body.mesh.dispose(false, true);
    this.debrisPool.length = 0;
  }

  private buildBarn(): void {
    const body = MeshBuilder.CreateBox('barn-siding', { width: 15, height: 9, depth: 11 }, this.scene);
    body.position.y = 4.5;
    body.material = this.materials.get('barn-red-siding', '#a83b2e');
    body.parent = this.intactShell;
    const roof = MeshBuilder.CreateCylinder('barn-roof', { diameter: 13.8, height: 16, tessellation: 3 }, this.scene);
    roof.position.y = 10.8;
    roof.rotation.z = Math.PI / 2;
    roof.scaling.set(0.58, 1, 0.76);
    roof.material = this.materials.get('barn-roofing', '#283640');
    roof.parent = this.intactShell;
    const door = MeshBuilder.CreateBox('barn-door', { width: 5.2, height: 6.5, depth: 0.28 }, this.scene);
    door.position.set(0, 3.25, -5.62);
    door.material = this.materials.get('barn-door', '#e4dfc8');
    door.parent = this.intactShell;

    for (const x of [-6.2, -2.1, 2.1, 6.2]) {
      const post = MeshBuilder.CreateBox(`barn-frame-post-${x}`, { width: 0.55, height: 10, depth: 0.55 }, this.scene);
      post.position.set(x, 5, 0);
      post.material = this.materials.family('wood');
      post.parent = this.exposedFrame;
    }
    for (const y of [1, 5, 9]) {
      const beam = MeshBuilder.CreateBox(`barn-frame-beam-${y}`, { width: 14, height: 0.55, depth: 0.55 }, this.scene);
      beam.position.set(0, y, 0);
      beam.material = this.materials.family('wood');
      beam.parent = this.exposedFrame;
    }

    for (let index = 0; index < 9; index += 1) {
      const piece = MeshBuilder.CreateBox(`barn-wreckage-${index}`, {
        width: 2.4 + (index % 3) * 1.1,
        height: 0.45 + (index % 2) * 0.25,
        depth: 1.5 + (index % 4) * 0.65
      }, this.scene);
      piece.position.set(-6 + (index % 4) * 3.5, 0.4 + (index % 3) * 0.18, -4 + Math.floor(index / 3) * 4);
      piece.rotation.y = index * 0.63;
      piece.rotation.z = (index % 3 - 1) * 0.18;
      piece.material = index % 3 === 0 ? this.materials.family('roofing') : this.materials.family('wood');
      piece.parent = this.wreckage;
    }
  }

  private buildDebrisPool(count: number): void {
    for (let index = 0; index < count; index += 1) {
      const mesh = MeshBuilder.CreateBox(`barn-debris-${index}`, {
        width: 1.2 + (index % 4) * 0.65,
        height: 0.22 + (index % 2) * 0.18,
        depth: 0.7 + (index % 3) * 0.42
      }, this.scene);
      mesh.material = index % 4 === 0 ? this.materials.family('roofing') : this.materials.family('wood');
      mesh.setEnabled(false);
      this.debrisPool.push({ mesh, velocity: Vector3.Zero(), angularVelocity: Vector3.Zero(), age: 0, lifetime: 8 });
    }
  }

  private activateDebris(requested: number): void {
    const count = Math.min(requested, this.quality.debrisBudget, this.debrisPool.length);
    for (let index = 0; index < count; index += 1) {
      const body = this.debrisPool[index];
      if (!body || body.mesh.isEnabled()) continue;
      const angle = index * 2.399;
      body.mesh.setEnabled(true);
      body.mesh.position.copyFrom(this.root.position).addInPlace(new Vector3(Math.cos(angle) * 4, 5 + index % 5, Math.sin(angle) * 3));
      body.velocity.set(Math.cos(angle) * (4 + index % 3), 7 + index % 6, Math.sin(angle) * (3 + index % 4));
      body.angularVelocity.set(1 + index % 3, 1.4 + index % 4, 0.8 + index % 5);
      body.age = 0;
      body.lifetime = 6 + (index % 4) * 0.7;
    }
  }

  private retire(body: DebrisBody | undefined): void {
    if (!body) return;
    body.mesh.setEnabled(false);
    body.mesh.position.set(0, -100, 0);
    body.velocity.setAll(0);
    body.age = 0;
  }

  private applyVisualState(): void {
    const stage = destructionStageIndex(this.stageValue);
    this.intactShell.setEnabled(stage < 3);
    this.exposedFrame.setEnabled(stage >= 1 && stage < 4);
    this.wreckage.setEnabled(stage >= 4);
    this.intactShell.rotation.z = stage === 1 ? -0.025 : stage === 2 ? -0.07 : 0;
    this.intactShell.scaling.y = stage === 2 ? 0.9 : 1;
  }
}

export { DESTRUCTION_STAGES };
