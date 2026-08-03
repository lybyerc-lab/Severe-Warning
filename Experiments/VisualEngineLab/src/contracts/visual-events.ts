import type { MaterialFamily } from './asset-contract';
import type { VisualSchemaVersion } from './schema-version';
import type { Vec3 } from './world-snapshot';

export const VISUAL_EVENT_TYPES = [
  'round.started', 'round.paused', 'round.resumed', 'round.ended', 'retry.requested',
  'storm.spawned', 'storm.moved', 'storm.intensity.changed', 'storm.form.changed',
  'pull.started', 'pull.ended', 'gust.fired', 'grid-zap.fired',
  'building.damaged', 'building.damage-stage.changed', 'building.collapsed',
  'object.detached', 'debris.spawned', 'debris.retired',
  'utility.chain.started', 'utility.node.energized', 'utility.node.failed',
  'landmark.damaged', 'landmark.destroyed', 'media.moment.captured',
  'cow.noticed-storm', 'cow.braced', 'cow.slid', 'cow.launched', 'cow.entered-orbit',
  'cow.landed-safely', 'cow.recovered', 'cow-cam.triggered', 'news.headline.triggered',
  'district.atmosphere.changed', 'world.reset', 'scene.cleanup.requested'
] as const;

export type VisualEventType = (typeof VISUAL_EVENT_TYPES)[number];

export interface VisualEventPayload {
  readonly position?: Vec3;
  readonly direction?: Vec3;
  readonly intensity?: number;
  readonly form?: string;
  readonly damageStage?: number;
  readonly materialFamily?: MaterialFamily;
  readonly objectCategory?: string;
  readonly headline?: string;
  readonly durationMs?: number;
  readonly presentationHints?: Readonly<Record<string, string | number | boolean>>;
}

export interface VisualEvent {
  readonly schemaVersion: VisualSchemaVersion;
  readonly id: string;
  readonly type: VisualEventType;
  readonly timestampMs: number;
  readonly deterministicSeed: number;
  readonly entityId?: string;
  readonly sourceId?: string;
  readonly payload: VisualEventPayload;
}
