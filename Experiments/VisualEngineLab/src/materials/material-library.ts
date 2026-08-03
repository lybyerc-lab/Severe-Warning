import { Color3, Scene, StandardMaterial } from '@babylonjs/core';
import type { MaterialFamily } from '../contracts/asset-contract';

const palette: Record<MaterialFamily, string> = {
  wood: '#8b4a2b', roofing: '#243244', 'sheet-metal': '#7f95a5', masonry: '#b85b45',
  concrete: '#9aa7a7', glass: '#70c9dc', utility: '#4a2b1c', vehicle: '#f5c43d',
  foliage: '#2f7d4a', hay: '#d8a93f'
};

export class MaterialLibrary {
  private readonly materials = new Map<string, StandardMaterial>();

  constructor(private readonly scene: Scene) {}

  get(id: string, color: string, options: { emissive?: number; alpha?: number; rough?: boolean } = {}): StandardMaterial {
    const key = `${id}:${color}:${options.emissive ?? 0}:${options.alpha ?? 1}:${options.rough ?? true}`;
    const cached = this.materials.get(key);
    if (cached) return cached;
    const material = new StandardMaterial(key, this.scene);
    material.diffuseColor = Color3.FromHexString(color);
    material.specularColor = options.rough === false ? new Color3(0.28, 0.32, 0.36) : new Color3(0.045, 0.045, 0.045);
    if (options.emissive) material.emissiveColor = material.diffuseColor.scale(options.emissive);
    material.alpha = options.alpha ?? 1;
    material.backFaceCulling = (options.alpha ?? 1) >= 1;
    this.materials.set(key, material);
    return material;
  }

  family(family: MaterialFamily, variant = ''): StandardMaterial {
    return this.get(`${family}${variant}`, palette[family]);
  }

  get count(): number {
    return this.materials.size;
  }

  dispose(): void {
    for (const material of this.materials.values()) material.dispose(true, true);
    this.materials.clear();
  }
}
