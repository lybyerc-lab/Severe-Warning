// ============================================================================
// [SW:PLAYCANVAS:MATERIAL_FACTORY]
// Shared material setup for the isolated renderer proof.
// ============================================================================

import type { PcMaterial, PlayCanvasModule } from './engine-types';

export interface MaterialOptions {
  readonly opacity?: number;
  readonly metalness?: number;
  readonly gloss?: number;
  readonly emissive?: readonly [number, number, number];
  readonly emissiveIntensity?: number;
  readonly doubleSided?: boolean;
}

export function createMaterial(
  pc: PlayCanvasModule,
  color: readonly [number, number, number],
  options: MaterialOptions = {},
): PcMaterial {
  const material = new pc.StandardMaterial();
  material.diffuse = new pc.Color(...color);
  material.metalness = options.metalness ?? 0;
  material.gloss = options.gloss ?? 0.35;
  material.opacity = options.opacity ?? 1;
  material.emissive = new pc.Color(...(options.emissive ?? [0, 0, 0]));
  material.emissiveIntensity = options.emissiveIntensity ?? 0;
  if ((options.opacity ?? 1) < 1) {
    material.blendType = pc.BLEND_NORMAL;
    material.depthWrite = false;
  }
  if (options.doubleSided) material.cull = pc.CULLFACE_NONE;
  material.update();
  return material;
}
