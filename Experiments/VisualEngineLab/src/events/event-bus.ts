import type { VisualEvent, VisualEventType } from '../contracts/visual-events';
import { validateVisualEvent } from '../contracts/validators';

type VisualEventListener = (event: VisualEvent) => void;

export class VisualEventBus {
  private readonly listeners = new Map<VisualEventType | '*', Set<VisualEventListener>>();
  private emitted = 0;

  on(type: VisualEventType | '*', listener: VisualEventListener): () => void {
    const bucket = this.listeners.get(type) ?? new Set<VisualEventListener>();
    bucket.add(listener);
    this.listeners.set(type, bucket);
    return () => bucket.delete(listener);
  }

  emit(candidate: VisualEvent): void {
    const event = validateVisualEvent(candidate);
    this.emitted += 1;
    for (const listener of this.listeners.get(event.type) ?? []) listener(event);
    for (const listener of this.listeners.get('*') ?? []) listener(event);
  }

  get eventCount(): number {
    return this.emitted;
  }

  resetCount(): void {
    this.emitted = 0;
  }

  dispose(): void {
    this.listeners.clear();
    this.emitted = 0;
  }
}
