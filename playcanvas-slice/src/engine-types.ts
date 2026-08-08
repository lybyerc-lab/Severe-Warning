// ============================================================================
// [SW:PLAYCANVAS:ENGINE_CONTRACTS]
// Narrow surface used by the isolated PlayCanvas production slice.
// ============================================================================

export type PcColor = object;

export interface PcMaterial {
  diffuse: PcColor;
  emissive: PcColor;
  emissiveIntensity: number;
  metalness: number;
  gloss: number;
  opacity: number;
  blendType: number;
  depthWrite: boolean;
  cull: number;
  update(): void;
}

export interface PcRenderComponent {
  material: PcMaterial;
  castShadows: boolean;
  receiveShadows: boolean;
}

export interface PcEntity {
  readonly name: string;
  enabled: boolean;
  render?: PcRenderComponent;
  addComponent(type: 'camera' | 'light' | 'render', data?: Record<string, unknown>): void;
  setPosition(x: number, y: number, z: number): void;
  setEulerAngles(x: number, y: number, z: number): void;
  setLocalScale(x: number, y: number, z: number): void;
  lookAt(x: number, y: number, z: number): void;
  rotate(x: number, y: number, z: number): void;
}

export interface PcRoot {
  addChild(entity: PcEntity): void;
}

export interface PcApplication {
  readonly root: PcRoot;
  readonly scene: { ambientLight: PcColor };
  setCanvasFillMode(mode: string): void;
  setCanvasResolution(mode: string): void;
  resizeCanvas(): void;
  on(event: 'update', callback: (deltaSeconds: number) => void): void;
  start(): void;
  destroy(): void;
}

export interface PlayCanvasModule {
  readonly version: string;
  readonly revision: string;
  readonly Application: new (
    canvas: HTMLCanvasElement,
    options?: { graphicsDeviceOptions?: Record<string, unknown> },
  ) => PcApplication;
  readonly Entity: new (name?: string) => PcEntity;
  readonly Color: new (red?: number, green?: number, blue?: number, alpha?: number) => PcColor;
  readonly StandardMaterial: new () => PcMaterial;
  readonly FILLMODE_FILL_WINDOW: string;
  readonly RESOLUTION_AUTO: string;
  readonly BLEND_NORMAL: number;
  readonly CULLFACE_NONE: number;
}
