import { Mesh, MeshBuilder, Scene, TransformNode, Vector3 } from '@babylonjs/core';
import type { QualityProfile } from '../contracts/quality-profile';
import { MaterialLibrary } from '../materials/material-library';

// [SW:LAB:TORNADO]
// Layered bounded proxy with quality-aware dust and debris budgets.

export interface TornadoParameters {
  height: number;
  baseRadius: number;
  upperRadius: number;
  rotationSpeed: number;
  opacity: number;
  dustDensity: number;
  debrisCount: number;
  orbitSpeed: number;
  lean: number;
  intensity: number;
}

export const DEFAULT_TORNADO_PARAMETERS: TornadoParameters = {
  height: 34,
  baseRadius: 3.4,
  upperRadius: 14,
  rotationSpeed: 1.1,
  opacity: 0.72,
  dustDensity: 0.65,
  debrisCount: 18,
  orbitSpeed: 1.45,
  lean: 0.06,
  intensity: 0.25
};

export class TornadoSystem {
  readonly root: TransformNode;
  private readonly innerCore: Mesh;
  private readonly outerLayer: Mesh;
  private readonly contactShadow: Mesh;
  private readonly dust: Mesh[] = [];
  private readonly debris: Mesh[] = [];
  private params: TornadoParameters = { ...DEFAULT_TORNADO_PARAMETERS };
  private quality: QualityProfile;

  constructor(private readonly scene: Scene, private readonly materials: MaterialLibrary, quality: QualityProfile) {
    this.quality = quality;
    this.root = new TransformNode('layered-tornado', scene);
    this.root.position.set(-3, 0, 4);

    this.innerCore = MeshBuilder.CreateCylinder('tornado-inner-core', {
      height: 34, diameterBottom: 5.2, diameterTop: 24, tessellation: 28, subdivisions: 12, hasRings: true
    }, scene);
    this.innerCore.position.y = 17;
    this.innerCore.material = materials.get('tornado-core', '#192536', { alpha: 0.82, rough: false });
    this.innerCore.parent = this.root;

    this.outerLayer = MeshBuilder.CreateCylinder('tornado-condensation', {
      height: 36, diameterBottom: 9, diameterTop: 31, tessellation: 24, subdivisions: 10, hasRings: true
    }, scene);
    this.outerLayer.position.y = 18;
    this.outerLayer.material = materials.get('tornado-condensation', '#5b7285', { alpha: 0.27, rough: false });
    this.outerLayer.parent = this.root;

    this.contactShadow = MeshBuilder.CreateDisc('tornado-ground-contact', { radius: 9, tessellation: 32 }, scene);
    this.contactShadow.rotation.x = Math.PI / 2;
    this.contactShadow.position.y = 0.14;
    this.contactShadow.material = materials.get('contact-shadow', '#171b20', { alpha: 0.48 });
    this.contactShadow.parent = this.root;

    for (let index = 0; index < 90; index += 1) {
      const puff = MeshBuilder.CreateIcoSphere(`dust-${index}`, { radius: 0.45 + (index % 4) * 0.12, subdivisions: 1 }, scene);
      puff.material = materials.get(`dust-${index % 3}`, ['#765b41', '#8f7552', '#4f4a43'][index % 3] ?? '#765b41', { alpha: 0.5 });
      puff.parent = this.root;
      this.dust.push(puff);
    }

    for (let index = 0; index < 42; index += 1) {
      const piece = MeshBuilder.CreateBox(`orbit-debris-${index}`, {
        width: 0.55 + (index % 3) * 0.3,
        height: 0.3 + (index % 4) * 0.22,
        depth: 0.4 + (index % 2) * 0.36
      }, scene);
      piece.material = materials.get(`debris-${index % 4}`, ['#6e472b', '#aeb8b8', '#b45a3f', '#d9b34d'][index % 4] ?? '#6e472b');
      piece.parent = this.root;
      this.debris.push(piece);
    }
    this.applyQuality(quality);
    this.setIntensity(this.params.intensity);
  }

  applyQuality(quality: QualityProfile): void {
    this.quality = quality;
    const dustBudget = Math.min(this.dust.length, Math.round(quality.particleBudget * 0.62));
    const debrisBudget = Math.min(this.debris.length, Math.min(quality.debrisBudget, this.params.debrisCount));
    this.dust.forEach((mesh, index) => mesh.setEnabled(index < dustBudget));
    this.debris.forEach((mesh, index) => mesh.setEnabled(index < debrisBudget));
    this.outerLayer.setEnabled(quality.atmosphereLayers > 1);
  }

  configure(parameters: Partial<TornadoParameters>): void {
    this.params = { ...this.params, ...parameters };
    this.params.intensity = Math.max(0, Math.min(1, this.params.intensity));
    this.innerCore.scaling.y = this.params.height / DEFAULT_TORNADO_PARAMETERS.height;
    this.outerLayer.scaling.y = this.params.height / DEFAULT_TORNADO_PARAMETERS.height;
    this.setIntensity(this.params.intensity);
    this.applyQuality(this.quality);
  }

  setPosition(position: Vector3): void {
    this.root.position.copyFrom(position);
  }

  setIntensity(intensity: number): void {
    this.params.intensity = Math.max(0, Math.min(1, intensity));
    const scale = 0.74 + this.params.intensity * 0.52;
    this.root.scaling.set(scale, 0.86 + this.params.intensity * 0.23, scale);
    this.innerCore.visibility = 0.62 + this.params.intensity * 0.28;
    this.outerLayer.visibility = 0.35 + this.params.intensity * 0.38;
    this.contactShadow.scaling.setAll(0.72 + this.params.intensity * 0.55);
  }

  setLightningIllumination(enabled: boolean): void {
    this.innerCore.renderOutline = enabled;
    this.innerCore.outlineColor.copyFromFloats(enabled ? 0.6 : 0, enabled ? 0.82 : 0, enabled ? 1 : 0);
    this.innerCore.outlineWidth = 0.08;
  }

  update(timeSeconds: number, deltaSeconds: number): void {
    const spin = this.params.rotationSpeed * (0.7 + this.params.intensity * 0.8);
    this.innerCore.rotation.y += deltaSeconds * spin;
    this.outerLayer.rotation.y -= deltaSeconds * spin * 0.58;
    this.root.rotation.z = Math.sin(timeSeconds * 0.52) * this.params.lean;

    for (let index = 0; index < this.dust.length; index += 1) {
      const puff = this.dust[index];
      if (!puff?.isEnabled()) continue;
      const angle = timeSeconds * (0.85 + (index % 5) * 0.08) + index * 2.399;
      const radius = 3.8 + (index % 11) * 0.42 + Math.sin(timeSeconds * 2 + index) * 0.8;
      puff.position.set(Math.cos(angle) * radius, 0.6 + (index % 7) * 0.36, Math.sin(angle) * radius);
      puff.scaling.setAll(0.68 + this.params.intensity * 0.7);
    }
    for (let index = 0; index < this.debris.length; index += 1) {
      const piece = this.debris[index];
      if (!piece?.isEnabled()) continue;
      const band = index % 3;
      const angle = timeSeconds * this.params.orbitSpeed * (0.8 + band * 0.18) + index * 1.77;
      const radius = 5.5 + band * 2.2 + Math.sin(index * 3.1) * 0.8;
      piece.position.set(Math.cos(angle) * radius, 3 + band * 5.2 + Math.sin(angle * 1.6) * 1.5, Math.sin(angle) * radius);
      piece.rotation.x += deltaSeconds * (1.2 + band);
      piece.rotation.y -= deltaSeconds * (1.7 + band * 0.4);
    }
  }

  reset(): void {
    this.params = { ...DEFAULT_TORNADO_PARAMETERS };
    this.root.position.set(-3, 0, 4);
    this.root.rotation.setAll(0);
    this.setIntensity(this.params.intensity);
    this.applyQuality(this.quality);
  }

  get activeParticleCount(): number {
    return this.dust.filter((mesh) => mesh.isEnabled()).length;
  }

  dispose(): void {
    this.root.dispose(false, true);
    this.dust.length = 0;
    this.debris.length = 0;
  }
}
