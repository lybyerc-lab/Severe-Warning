import { describe, expect, it } from 'vitest';
import { VISUAL_SCHEMA_VERSION } from '../contracts/schema-version';
import { validateVisualEvent, validateWorldSnapshot } from '../contracts/validators';

describe('renderer-neutral visual contract', () => {
  it('accepts a valid deterministic event', () => {
    const event = validateVisualEvent({
      schemaVersion: VISUAL_SCHEMA_VERSION,
      id: 'event-1',
      type: 'cow.launched',
      timestampMs: 1200,
      deterministicSeed: 17017,
      entityId: 'cow-17',
      payload: { position: { x: 1, y: 2, z: 3 }, intensity: 0.7 }
    });
    expect(event.type).toBe('cow.launched');
  });

  it('rejects unsupported schema versions safely', () => {
    expect(() => validateVisualEvent({
      schemaVersion: 'severe-warning.visual.v999',
      id: 'bad', type: 'round.started', timestampMs: 0, deterministicSeed: 1, payload: {}
    })).toThrow(/Unsupported visual schema version/);
  });

  it('rejects renderer events that try to invent an unsupported decision', () => {
    expect(() => validateVisualEvent({
      schemaVersion: VISUAL_SCHEMA_VERSION,
      id: 'bad', type: 'score.awarded', timestampMs: 0, deterministicSeed: 1, payload: {}
    })).toThrow(/Unsupported visual event type/);
  });

  it('validates a world snapshot without scoring or campaign ownership', () => {
    const snapshot = validateWorldSnapshot({
      schemaVersion: VISUAL_SCHEMA_VERSION,
      timestampMs: 0,
      deterministicSeed: 17017,
      districtId: 'farm-town-benchmark',
      atmosphereId: 'storm-front',
      entities: []
    });
    expect(snapshot.entities).toHaveLength(0);
  });
});
