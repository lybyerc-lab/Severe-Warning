import { describe, expect, it } from 'vitest';
import { VisualEventBus } from '../events/event-bus';
import { BenchmarkReplay } from '../replay/benchmark-replay';

describe('deterministic benchmark replay', () => {
  it('completes accelerated replay and emits a safe cow lifecycle', () => {
    const bus = new VisualEventBus();
    const replay = new BenchmarkReplay(bus);
    const types: string[] = [];
    bus.on('*', (event) => types.push(event.type));
    replay.setAccelerated(true);
    replay.start();
    for (let frame = 0; frame < 1900 && !replay.completed; frame += 1) replay.update(1 / 60);
    expect(replay.completed).toBe(true);
    expect(replay.timeMs).toBe(180000);
    expect(types).toContain('building.collapsed');
    expect(types).toContain('cow.launched');
    expect(types).toContain('cow.landed-safely');
    expect(types).toContain('cow.recovered');
    expect(types.at(-1)).toBe('world.reset');
  });

  it('reset returns timeline and event count to baseline', () => {
    const bus = new VisualEventBus();
    const replay = new BenchmarkReplay(bus);
    replay.start();
    replay.update(20);
    expect(bus.eventCount).toBeGreaterThan(0);
    replay.reset();
    bus.resetCount();
    expect(replay.timeMs).toBe(0);
    expect(replay.running).toBe(false);
    expect(bus.eventCount).toBe(0);
  });
});
