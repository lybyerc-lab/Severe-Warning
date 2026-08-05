// ============================================================================
// [SW:ARCH:PHASE6_DEBRIS_POOL_MANAGER]
// Bounded transient debris pool manager. Pre-allocates items, recycles expired
// fragments without dynamically instantiating materials per explosion, and
// guarantees zero GPU/heap memory growth across resets and retries.
// ============================================================================

import { DebrisPoolSnapshot, PooledDebrisItem } from './debris-pool-contracts';

export class DebrisPoolManager {
  private pool: PooledDebrisItem[] = [];
  private capacity: number;
  private activeCount = 0;
  private highWaterMark = 0;
  private recycledCount = 0;

  constructor(capacity = 48) {
    this.capacity = capacity;
    for (let i = 0; i < capacity; i += 1) {
      this.pool.push({
        id: i,
        active: false,
        colorHex: '#64748b',
        size: 1.0,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        rotX: 0,
        rotY: 0,
        life: 0,
        bounced: false,
      });
    }
  }

  getCapacity(): number {
    return this.capacity;
  }

  getActiveCount(): number {
    return this.activeCount;
  }

  obtain(
    colorHex: string,
    size: number,
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    rotX: number,
    rotY: number,
    life: number
  ): PooledDebrisItem | null {
    let candidate = this.pool.find((item) => !item.active);

    // If pool is full, recycle the item with the lowest remaining life
    if (!candidate) {
      let lowestLife = Infinity;
      this.pool.forEach((item) => {
        if (item.life < lowestLife) {
          lowestLife = item.life;
          candidate = item;
        }
      });
      if (candidate) {
        this.recycledCount += 1;
      }
    }

    if (!candidate) return null;

    if (!candidate.active) {
      this.activeCount += 1;
      if (this.activeCount > this.highWaterMark) {
        this.highWaterMark = this.activeCount;
      }
    }

    candidate.active = true;
    candidate.colorHex = colorHex;
    candidate.size = size;
    candidate.x = x;
    candidate.y = y;
    candidate.z = z;
    candidate.vx = vx;
    candidate.vy = vy;
    candidate.vz = vz;
    candidate.rotX = rotX;
    candidate.rotY = rotY;
    candidate.life = life;
    candidate.bounced = false;

    return candidate;
  }

  release(item: PooledDebrisItem): void {
    if (!item.active) return;
    item.active = false;
    item.life = 0;
    this.activeCount = Math.max(0, this.activeCount - 1);
  }

  reset(): void {
    this.pool.forEach((item) => {
      item.active = false;
      item.life = 0;
      item.bounced = false;
    });
    this.activeCount = 0;
    this.highWaterMark = 0;
    this.recycledCount = 0;
  }

  getSnapshot(): DebrisPoolSnapshot {
    const activeColorDistribution: Record<string, number> = {};
    this.pool.forEach((item) => {
      if (item.active) {
        activeColorDistribution[item.colorHex] = (activeColorDistribution[item.colorHex] || 0) + 1;
      }
    });

    return {
      poolCapacity: this.capacity,
      activeCount: this.activeCount,
      recycledCount: this.recycledCount,
      highWaterMark: this.highWaterMark,
      activeColorDistribution,
    };
  }
}
