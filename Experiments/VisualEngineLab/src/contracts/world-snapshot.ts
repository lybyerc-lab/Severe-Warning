import type { VisualSchemaVersion } from './schema-version';

export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface VisualEntitySnapshot {
  readonly id: string;
  readonly category: string;
  readonly position: Vec3;
  readonly rotation?: Vec3;
  readonly scale?: Vec3;
  readonly visualState: string;
  readonly presentationHints?: Readonly<Record<string, string | number | boolean>>;
}

export interface WorldSnapshot {
  readonly schemaVersion: VisualSchemaVersion;
  readonly timestampMs: number;
  readonly deterministicSeed: number;
  readonly districtId: string;
  readonly atmosphereId: string;
  readonly entities: readonly VisualEntitySnapshot[];
}
