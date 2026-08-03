import { VISUAL_SCHEMA_VERSION } from '../contracts/schema-version';
import type { VisualEvent, VisualEventPayload, VisualEventType } from '../contracts/visual-events';

export const BENCHMARK_SEED = 17017;

interface TimelineItem {
  atSeconds: number;
  type: VisualEventType;
  entityId?: string;
  payload?: VisualEventPayload;
}

const items: readonly TimelineItem[] = [
  { atSeconds: 0, type: 'round.started', payload: { headline: 'Calm town benchmark started.' } },
  { atSeconds: 12, type: 'district.atmosphere.changed', payload: { intensity: 0.18, presentationHints: { wind: 0.25 } } },
  { atSeconds: 22, type: 'cow.noticed-storm', entityId: 'cow-17' },
  { atSeconds: 27, type: 'cow.double-take', entityId: 'cow-17' },
  { atSeconds: 29, type: 'news.headline.triggered', payload: { headline: 'COW 17 HAS NOTICED SOMETHING THE REST OF US MISSED.' } },
  { atSeconds: 34, type: 'storm.spawned', entityId: 'storm-1', payload: { position: { x: 26, y: 0, z: 23 }, form: 'cone', intensity: 0.28 } },
  { atSeconds: 43, type: 'storm.moved', entityId: 'storm-1', payload: { position: { x: 10, y: 0, z: 14 }, direction: { x: -1, y: 0, z: -0.45 } } },
  { atSeconds: 49, type: 'building.damaged', entityId: 'barn-1', payload: { damageStage: 1, materialFamily: 'roofing' } },
  { atSeconds: 56, type: 'utility.chain.started', entityId: 'grid-1', payload: { intensity: 0.5 } },
  { atSeconds: 61, type: 'grid-zap.fired', entityId: 'grid-1', payload: { position: { x: 21, y: 0, z: -14 }, intensity: 0.65 } },
  { atSeconds: 69, type: 'storm.intensity.changed', entityId: 'storm-1', payload: { intensity: 0.48 } },
  { atSeconds: 75, type: 'building.damage-stage.changed', entityId: 'barn-1', payload: { damageStage: 2, materialFamily: 'wood' } },
  { atSeconds: 84, type: 'gust.fired', entityId: 'storm-1', payload: { direction: { x: -1, y: 0, z: 0.2 }, intensity: 0.72 } },
  { atSeconds: 92, type: 'pull.started', entityId: 'storm-1', payload: { intensity: 0.78 } },
  { atSeconds: 98, type: 'cow.braced', entityId: 'cow-17' },
  { atSeconds: 105, type: 'cow.slid', entityId: 'cow-17', payload: { direction: { x: 1, y: 0, z: -0.3 } } },
  { atSeconds: 111, type: 'building.damage-stage.changed', entityId: 'barn-1', payload: { damageStage: 3, materialFamily: 'wood' } },
  { atSeconds: 114, type: 'cow.front-lift', entityId: 'cow-17' },
  { atSeconds: 118, type: 'cow.launched', entityId: 'cow-17', payload: { intensity: 0.82 } },
  { atSeconds: 126, type: 'cow.entered-orbit', entityId: 'cow-17' },
  { atSeconds: 131, type: 'cow-cam.triggered', entityId: 'cow-17', payload: { durationMs: 3300 } },
  { atSeconds: 138, type: 'building.collapsed', entityId: 'barn-1', payload: { damageStage: 4, materialFamily: 'wood' } },
  { atSeconds: 145, type: 'cow.landed-safely', entityId: 'cow-17', payload: { position: { x: -17, y: 1.4, z: 14 }, materialFamily: 'hay' } },
  { atSeconds: 151, type: 'cow.recovered', entityId: 'cow-17' },
  { atSeconds: 157, type: 'media.moment.captured', entityId: 'moo-brew-news-van', payload: { headline: 'COW-CAM FOOTAGE SECURED. DIGNITY STATUS PENDING.' } },
  { atSeconds: 164, type: 'landmark.damaged', entityId: 'water-tower', payload: { damageStage: 1, materialFamily: 'sheet-metal' } },
  { atSeconds: 168, type: 'cow.offended-stare', entityId: 'cow-17' },
  { atSeconds: 170, type: 'news.headline.triggered', payload: { headline: 'BOVINE SITUATION REPORT: COW INJURIES 0. ALTITUDE UNNECESSARY.' } },
  { atSeconds: 176, type: 'round.ended', payload: { headline: 'MOO BREW ACCEPTS NO RESPONSIBILITY FOR ATMOSPHERIC CATTLE.' } },
  { atSeconds: 180, type: 'world.reset' }
];

export function buildBenchmarkTimeline(): readonly VisualEvent[] {
  return items.map((item, index) => ({
    schemaVersion: VISUAL_SCHEMA_VERSION,
    id: `benchmark-${String(index + 1).padStart(3, '0')}`,
    type: item.type,
    timestampMs: item.atSeconds * 1000,
    deterministicSeed: BENCHMARK_SEED,
    entityId: item.entityId,
    payload: item.payload ?? {}
  }));
}
