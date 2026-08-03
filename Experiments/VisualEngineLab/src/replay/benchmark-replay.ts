import type { VisualEvent } from '../contracts/visual-events';
import { VisualEventBus } from '../events/event-bus';
import { buildBenchmarkTimeline } from './benchmark-timeline';

// [SW:LAB:DETERMINISTIC_REPLAY]
// The timeline emits neutral events; systems consume rather than consult the clock directly.

export class BenchmarkReplay {
  private readonly timeline: readonly VisualEvent[];
  private cursor = 0;
  private timeMsValue = 0;
  private runningValue = false;
  private completedValue = false;
  private acceleratedValue = true;

  constructor(private readonly events: VisualEventBus, timeline = buildBenchmarkTimeline()) {
    this.timeline = timeline;
  }

  get timeMs(): number { return this.timeMsValue; }
  get running(): boolean { return this.runningValue; }
  get completed(): boolean { return this.completedValue; }
  get accelerated(): boolean { return this.acceleratedValue; }
  get durationMs(): number { return this.timeline.at(-1)?.timestampMs ?? 0; }

  start(): void {
    if (this.completedValue) this.reset();
    this.runningValue = true;
  }

  pause(): void {
    this.runningValue = false;
  }

  togglePause(): boolean {
    this.runningValue = !this.runningValue;
    return this.runningValue;
  }

  setAccelerated(accelerated: boolean): void {
    this.acceleratedValue = accelerated;
  }

  update(realDeltaSeconds: number): void {
    if (!this.runningValue || this.completedValue) return;
    const speed = this.acceleratedValue ? 6 : 1;
    this.timeMsValue = Math.min(this.durationMs, this.timeMsValue + realDeltaSeconds * 1000 * speed);
    while (this.cursor < this.timeline.length) {
      const event = this.timeline[this.cursor];
      if (!event || event.timestampMs > this.timeMsValue) break;
      this.events.emit(event);
      this.cursor += 1;
    }
    if (this.cursor >= this.timeline.length) {
      this.runningValue = false;
      this.completedValue = true;
    }
  }

  reset(): void {
    this.cursor = 0;
    this.timeMsValue = 0;
    this.runningValue = false;
    this.completedValue = false;
  }
}
