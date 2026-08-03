import { VISUAL_SCHEMA_VERSION } from './schema-version';
import { VISUAL_EVENT_TYPES, type VisualEvent, type VisualEventType } from './visual-events';
import type { WorldSnapshot } from './world-snapshot';

const eventTypes = new Set<string>(VISUAL_EVENT_TYPES);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireVersion(value: Record<string, unknown>): void {
  if (value.schemaVersion !== VISUAL_SCHEMA_VERSION) {
    throw new Error(`Unsupported visual schema version: ${String(value.schemaVersion)}`);
  }
}

export function validateVisualEvent(value: unknown): VisualEvent {
  if (!isRecord(value)) throw new Error('Visual event must be an object.');
  requireVersion(value);
  if (typeof value.id !== 'string' || !value.id) throw new Error('Visual event id is required.');
  if (!eventTypes.has(String(value.type))) throw new Error(`Unsupported visual event type: ${String(value.type)}`);
  if (!Number.isFinite(value.timestampMs) || Number(value.timestampMs) < 0) throw new Error('Visual event timestamp must be non-negative.');
  if (!Number.isInteger(value.deterministicSeed)) throw new Error('Visual event deterministicSeed must be an integer.');
  if (!isRecord(value.payload)) throw new Error('Visual event payload must be an object.');
  return value as unknown as VisualEvent;
}

export function validateWorldSnapshot(value: unknown): WorldSnapshot {
  if (!isRecord(value)) throw new Error('World snapshot must be an object.');
  requireVersion(value);
  if (!Number.isFinite(value.timestampMs) || Number(value.timestampMs) < 0) throw new Error('World snapshot timestamp must be non-negative.');
  if (!Number.isInteger(value.deterministicSeed)) throw new Error('World snapshot deterministicSeed must be an integer.');
  if (typeof value.districtId !== 'string' || typeof value.atmosphereId !== 'string') throw new Error('World snapshot identity is incomplete.');
  if (!Array.isArray(value.entities)) throw new Error('World snapshot entities must be an array.');
  return value as unknown as WorldSnapshot;
}

export function isVisualEventType(value: string): value is VisualEventType {
  return eventTypes.has(value);
}
