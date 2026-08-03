import {
  Color3, Mesh, MeshBuilder, Scene, TransformNode, Vector3
} from '@babylonjs/core';
import type { QualityProfile } from '../contracts/quality-profile';
import { MaterialLibrary } from '../materials/material-library';

// [SW:LAB:BENCHMARK_WORLD]
// Compact procedural proving ground; no production level or third-party asset code.

function box(scene: Scene, materials: MaterialLibrary, name: string, size: [number, number, number], position: [number, number, number], color: string, parent: TransformNode): Mesh {
  const mesh = MeshBuilder.CreateBox(name, { width: size[0], height: size[1], depth: size[2] }, scene);
  mesh.position.set(...position);
  mesh.material = materials.get(`${name}-mat`, color);
  mesh.parent = parent;
  mesh.receiveShadows = true;
  return mesh;
}

function cylinder(scene: Scene, materials: MaterialLibrary, name: string, diameter: number, height: number, position: [number, number, number], color: string, parent: TransformNode, tessellation = 12): Mesh {
  const mesh = MeshBuilder.CreateCylinder(name, { diameter, height, tessellation }, scene);
  mesh.position.set(...position);
  mesh.material = materials.get(`${name}-mat`, color);
  mesh.parent = parent;
  mesh.receiveShadows = true;
  return mesh;
}

function building(scene: Scene, materials: MaterialLibrary, parent: TransformNode, name: string, position: Vector3, color: string, commercial = false): TransformNode {
  const root = new TransformNode(name, scene);
  root.parent = parent;
  root.position.copyFrom(position);
  box(scene, materials, `${name}-body`, commercial ? [13, 7, 9] : [9, 6, 8], [0, commercial ? 3.5 : 3, 0], color, root);
  if (commercial) {
    box(scene, materials, `${name}-awning`, [13.8, 0.6, 2], [0, 3.2, -5], '#f4c95d', root);
    for (const x of [-4, 0, 4]) box(scene, materials, `${name}-window-${x}`, [2.3, 2.2, 0.18], [x, 4.5, -4.58], '#79cadc', root);
  } else {
    const roof = MeshBuilder.CreateCylinder(`${name}-roof`, { height: 9.8, diameter: 10.6, tessellation: 3 }, scene);
    roof.rotation.z = Math.PI / 2;
    roof.position.set(0, 7.1, 0);
    roof.scaling.set(0.48, 1, 0.78);
    roof.material = materials.get(`${name}-roof-mat`, '#314258');
    roof.parent = root;
    box(scene, materials, `${name}-door`, [1.8, 3.2, 0.22], [0, 1.65, -4.12], '#67351f', root);
  }
  return root;
}

function tree(scene: Scene, materials: MaterialLibrary, parent: TransformNode, x: number, z: number, scale: number, index: number): void {
  const root = new TransformNode(`tree-${index}`, scene);
  root.parent = parent;
  root.position.set(x, 0, z);
  root.scaling.setAll(scale);
  cylinder(scene, materials, `tree-trunk-${index}`, 0.7, 4.8, [0, 2.4, 0], '#57331f', root, 8);
  const crown = MeshBuilder.CreateIcoSphere(`tree-crown-${index}`, { radius: 3, subdivisions: 1 }, scene);
  crown.position.y = 6;
  crown.scaling.set(0.85, 1.18, 0.85);
  crown.material = materials.family('foliage', String(index % 3));
  crown.parent = root;
}

function utilityPole(scene: Scene, materials: MaterialLibrary, parent: TransformNode, x: number, z: number, index: number): void {
  const root = new TransformNode(`utility-${index}`, scene);
  root.parent = parent;
  root.position.set(x, 0, z);
  cylinder(scene, materials, `pole-${index}`, 0.55, 9, [0, 4.5, 0], '#51301e', root, 8);
  box(scene, materials, `crossarm-${index}`, [4, 0.35, 0.4], [0, 8.2, 0], '#392114', root);
  for (const wireX of [-1.5, 0, 1.5]) {
    const insulator = cylinder(scene, materials, `insulator-${index}-${wireX}`, 0.34, 0.45, [wireX, 8.6, 0], '#dbe6e5', root, 8);
    insulator.rotation.z = Math.PI / 2;
  }
}

export class BenchmarkWorld {
  readonly root: TransformNode;
  readonly hayLanding = new Vector3(-17, 1.4, 14);
  private readonly animatedTrees: TransformNode[] = [];

  constructor(private readonly scene: Scene, private readonly materials: MaterialLibrary, quality: QualityProfile) {
    this.root = new TransformNode('farm-town-benchmark', scene);
    this.build(quality);
  }

  update(timeSeconds: number, wind: number): void {
    for (let index = 0; index < this.animatedTrees.length; index += 1) {
      const treeRoot = this.animatedTrees[index];
      if (!treeRoot) continue;
      treeRoot.rotation.z = Math.sin(timeSeconds * 1.9 + index * 0.7) * 0.025 * wind;
      treeRoot.rotation.x = Math.cos(timeSeconds * 1.4 + index) * 0.018 * wind;
    }
  }

  dispose(): void {
    this.root.dispose(false, true);
    this.animatedTrees.length = 0;
  }

  private build(quality: QualityProfile): void {
    const ground = MeshBuilder.CreateGround('ground', { width: 150, height: 95, subdivisions: 2 }, this.scene);
    ground.material = this.materials.get('ground', '#718f54');
    ground.parent = this.root;
    ground.receiveShadows = true;

    const field = box(this.scene, this.materials, 'farm-field', [48, 0.12, 42], [-40, 0.07, 15], '#a68a45', this.root);
    field.receiveShadows = true;
    for (let row = -4; row <= 4; row += 1) {
      box(this.scene, this.materials, `crop-row-${row}`, [40, 0.1, 0.32], [-42, 0.18, 15 + row * 4], row % 2 ? '#d1b35b' : '#7d7435', this.root);
    }

    box(this.scene, this.materials, 'road-east-west', [150, 0.18, 12], [0, 0.11, -7], '#34434c', this.root);
    box(this.scene, this.materials, 'road-north-south', [12, 0.2, 95], [19, 0.12, 0], '#34434c', this.root);
    for (let x = -68; x < 68; x += 10) box(this.scene, this.materials, `dash-x-${x}`, [5, 0.04, 0.25], [x, 0.23, -7], '#e8cf73', this.root);
    for (let z = -40; z < 40; z += 10) box(this.scene, this.materials, `dash-z-${z}`, [0.25, 0.04, 5], [19, 0.24, z], '#e8cf73', this.root);

    building(this.scene, this.materials, this.root, 'farmhouse', new Vector3(-52, 0, 33), '#e5d4b2');
    building(this.scene, this.materials, this.root, 'residential-edge', new Vector3(37, 0, 18), '#70a3be');
    building(this.scene, this.materials, this.root, 'small-commercial', new Vector3(39, 0, -23), '#b95f4b', true);

    const silo = cylinder(this.scene, this.materials, 'silo', 8, 17, [-36, 8.5, -25], '#9eaaa8', this.root, 20);
    const siloCap = MeshBuilder.CreateSphere('silo-cap', { diameter: 8.1, segments: 12, slice: 0.5 }, this.scene);
    siloCap.position.set(-36, 17, -25);
    siloCap.material = this.materials.family('sheet-metal');
    siloCap.parent = this.root;
    silo.receiveShadows = true;

    const landmark = cylinder(this.scene, this.materials, 'water-tower-tank', 8.5, 6.5, [60, 22, 21], '#c9d4d1', this.root, 16);
    for (const [x, z] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) {
      const leg = cylinder(this.scene, this.materials, `tower-leg-${x}-${z}`, 0.42, 20, [60 + x, 10, 21 + z], '#6c7a7d', this.root, 8);
      leg.rotation.z = (x / 3) * 0.08;
    }
    landmark.receiveShadows = true;

    for (let fenceX = -63; fenceX <= -20; fenceX += 6) {
      box(this.scene, this.materials, `fence-post-${fenceX}`, [0.3, 2.1, 0.3], [fenceX, 1.05, 38], '#c9b58e', this.root);
    }
    box(this.scene, this.materials, 'fence-rail-a', [44, 0.28, 0.25], [-41.5, 1.45, 38], '#c9b58e', this.root);
    box(this.scene, this.materials, 'fence-rail-b', [44, 0.28, 0.25], [-41.5, 0.72, 38], '#c9b58e', this.root);

    for (let index = 0; index < 4; index += 1) {
      const bale = cylinder(this.scene, this.materials, `hay-bale-${index}`, 4.8, 2.7, [this.hayLanding.x + index * 4.3, 1.35, this.hayLanding.z + (index % 2) * 3.7], '#d5a83d', this.root, 14);
      bale.rotation.z = Math.PI / 2;
    }

    const tractor = new TransformNode('tractor', this.scene);
    tractor.parent = this.root;
    tractor.position.set(-43, 0, 3);
    box(this.scene, this.materials, 'tractor-body', [6.5, 2.8, 3.8], [0, 2.3, 0], '#cc3f32', tractor);
    box(this.scene, this.materials, 'tractor-cab', [2.7, 3.4, 3.2], [1.2, 4.8, 0], '#77b8c6', tractor);
    for (const z of [-2.1, 2.1]) cylinder(this.scene, this.materials, `tractor-wheel-${z}`, 3.2, 0.9, [-1.1, 1.65, z], '#1c2227', tractor, 14).rotation.x = Math.PI / 2;

    const van = new TransformNode('moo-brew-news-van', this.scene);
    van.parent = this.root;
    van.position.set(3, 0, -16);
    box(this.scene, this.materials, 'van-body', [8.5, 4, 4.4], [0, 2.4, 0], '#f3f4ef', van);
    box(this.scene, this.materials, 'van-stripe', [8.7, 1.2, 0.18], [0, 2.8, -2.28], '#8b3b25', van);
    for (const x of [-2.6, 2.6]) cylinder(this.scene, this.materials, `van-wheel-${x}`, 1.7, 0.7, [x, 1, -2.05], '#18212a', van, 12).rotation.x = Math.PI / 2;
    const dish = MeshBuilder.CreateDisc('van-dish', { radius: 2, tessellation: 20 }, this.scene);
    dish.rotation.x = Math.PI / 3;
    dish.position.set(0.8, 5.7, 0);
    dish.material = this.materials.get('dish', '#d7e3e4');
    dish.parent = van;

    for (let index = 0; index < 5; index += 1) utilityPole(this.scene, this.materials, this.root, -7 + index * 14, -14, index);
    for (let index = 0; index < 4; index += 1) {
      const points = [];
      for (let pole = 0; pole < 5; pole += 1) points.push(new Vector3(-7 + pole * 14, 8.7, -14 + (index - 1.5) * 0.18));
      const wire = MeshBuilder.CreateLines(`power-wire-${index}`, { points }, this.scene);
      wire.color = new Color3(0.06, 0.07, 0.08);
      wire.parent = this.root;
    }

    const treeCount = Math.round(18 * quality.vegetationDensity);
    for (let index = 0; index < treeCount; index += 1) {
      const x = -66 + ((index * 23) % 132);
      const z = index % 2 ? 38 - ((index * 9) % 18) : -36 + ((index * 7) % 16);
      tree(this.scene, this.materials, this.root, x, z, 0.75 + (index % 4) * 0.08, index);
      const created = this.scene.getTransformNodeByName(`tree-${index}`);
      if (created) this.animatedTrees.push(created);
    }

    box(this.scene, this.materials, 'horizon-ridge', [180, 11, 7], [0, 3.5, 51], '#31465b', this.root);
  }
}
